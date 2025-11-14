import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewRequest {
  restaurantId: string;
  rating: number;
  comment: string;
  photos: string[];
  recaptchaToken: string;
  editingReviewId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { restaurantId, rating, comment, photos, recaptchaToken, editingReviewId }: ReviewRequest = await req.json();

    console.log('Submit review request received', { restaurantId, rating, editingReviewId });

    // Verify reCAPTCHA token
    const recaptchaSecret = Deno.env.get('RECAPTCHA_SECRET_KEY');
    if (!recaptchaSecret) {
      throw new Error('reCAPTCHA secret key not configured');
    }

    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
      }
    );

    const recaptchaResult = await recaptchaResponse.json();
    console.log('reCAPTCHA verification result:', recaptchaResult);

    if (!recaptchaResult.success) {
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA verificatie mislukt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('Client IP:', clientIP);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID if authenticated
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
      userEmail = user?.email || null;
    }

    // Check rate limit: max 2 reviews per day from same IP (only for new reviews)
    if (!editingReviewId) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: recentReviews, error: rateLimitError } = await supabase
        .from('reviews')
        .select('id')
        .eq('ip_address', clientIP)
        .gte('created_at', twentyFourHoursAgo);

      if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError);
        throw rateLimitError;
      }

      console.log('Recent reviews from IP:', recentReviews?.length || 0);

      if (recentReviews && recentReviews.length >= 2) {
        return new Response(
          JSON.stringify({ error: 'Je hebt het maximale aantal reviews (2) per dag bereikt. Probeer het morgen opnieuw.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Submit or update review
    if (editingReviewId) {
      // Update existing review
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          rating,
          comment,
          photos,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingReviewId);

      if (updateError) {
        console.error('Update review error:', updateError);
        throw updateError;
      }

      console.log('Review updated successfully');
    } else {
      // Insert new review
      const { data: insertedReview, error: insertError } = await supabase
        .from('reviews')
        .insert({
          restaurant_id: restaurantId,
          user_id: userId,
          rating,
          comment,
          photos,
          ip_address: clientIP
        })
        .select('id, created_at, status')
        .single();

      if (insertError) {
        console.error('Insert review error:', insertError);
        throw insertError;
      }

      console.log('Review created successfully');

      // Notify admin about the new review via email
      try {
        const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'info@eatnavigator.com';
        const smtpHost = Deno.env.get('SMTP_HOST');
        const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
        const smtpUser = Deno.env.get('SMTP_USER');
        const smtpPassword = Deno.env.get('SMTP_PASSWORD');
        const smtpFrom = Deno.env.get('SMTP_FROM_EMAIL');

        if (adminEmail && smtpHost && smtpUser && smtpPassword && smtpFrom) {
          const { data: restaurantData, error: restaurantError } = await supabase
            .from('restaurants')
            .select('name, place_id')
            .eq('id', restaurantId)
            .single();

          if (restaurantError) {
            console.error('Failed to fetch restaurant for review notification:', restaurantError);
          }

          const restaurantName = restaurantData?.name || 'Onbekend restaurant';
          const restaurantPlaceId = restaurantData?.place_id || restaurantId;

          const client = new SMTPClient({
            connection: {
              hostname: smtpHost,
              port: smtpPort,
              tls: true,
              auth: {
                username: smtpUser,
                password: smtpPassword,
              },
            },
          });

          const submittedAt = insertedReview?.created_at
            ? new Date(insertedReview.created_at)
            : new Date();

          const reviewer = userEmail || 'Anonieme gebruiker';
          const photosList = (photos && photos.length > 0)
            ? photos.map((url) => `<li><a href="${url}">${url}</a></li>`).join('')
            : '<li>Geen foto\'s toegevoegd</li>';

          const htmlContent = `
            <h2>Nieuwe review geplaatst</h2>
            <p><strong>Restaurant:</strong> ${restaurantName}</p>
            <p><strong>Rating:</strong> ${rating} / 5</p>
            <p><strong>Gebruiker:</strong> ${reviewer}</p>
            <p><strong>Ingediend op:</strong> ${submittedAt.toLocaleString('nl-NL')}</p>
            <p><strong>Status:</strong> ${insertedReview?.status || 'pending'}</p>
            <p><strong>IP-adres:</strong> ${clientIP}</p>
            <p><strong>Opmerking:</strong></p>
            <p>${comment ? comment.replace(/\n/g, '<br>') : 'Geen opmerkingen geplaatst.'}</p>
            <p><strong>Foto\'s:</strong></p>
            <ul>${photosList}</ul>
            <p><strong>Restaurant ID:</strong> ${restaurantId}</p>
            <p><strong>Restaurant Place ID:</strong> ${restaurantPlaceId}</p>
          `;

          const textContent = `Nieuwe review geplaatst\n\n` +
            `Restaurant: ${restaurantName}\n` +
            `Rating: ${rating} / 5\n` +
            `Gebruiker: ${reviewer}\n` +
            `Ingediend op: ${submittedAt.toLocaleString('nl-NL')}\n` +
            `Status: ${insertedReview?.status || 'pending'}\n` +
            `IP-adres: ${clientIP}\n` +
            `Opmerking: ${comment || 'Geen opmerkingen geplaatst.'}\n` +
            (photos && photos.length > 0 ? `Foto's: ${photos.join(', ')}` : "Foto's: Geen");

          try {
            await client.send({
              from: smtpFrom,
              to: adminEmail,
              subject: `Nieuwe review geplaatst - ${restaurantName}`,
              content: textContent,
              html: htmlContent,
            });
            console.log('Admin notification email for new review sent');
          } finally {
            await client.close();
          }
        } else {
          console.warn('SMTP configuration missing - skipping admin notification email');
        }
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in submit-review function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Er is een fout opgetreden' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
