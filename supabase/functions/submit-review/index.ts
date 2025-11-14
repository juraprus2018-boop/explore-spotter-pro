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

@@ -43,51 +44,51 @@ serve(async (req) => {
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
    

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
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
@@ -113,40 +114,80 @@ serve(async (req) => {
      if (updateError) {
        console.error('Update review error:', updateError);
        throw updateError;
      }

      console.log('Review updated successfully');
    } else {
      // Insert new review
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          restaurant_id: restaurantId,
          user_id: userId,
          rating,
          comment,
          photos,
          ip_address: clientIP
        });

      if (insertError) {
        console.error('Insert review error:', insertError);
        throw insertError;
      }

      console.log('Review created successfully');

      // Notify admin about the new review via email
      const client = new SMTPClient({
        connection: {
          hostname: Deno.env.get('SMTP_HOST')!,
          port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
          tls: true,
          auth: {
            username: Deno.env.get('SMTP_USER')!,
            password: Deno.env.get('SMTP_PASSWORD')!,
          },
        },
      });

      await client.send({
        from: Deno.env.get('SMTP_FROM_EMAIL')!,
        to: 'info@eatnavigator.com',
        subject: 'Nieuwe review geplaatst - EatNavigator',
        content: `
          Er is een nieuwe review geplaatst op EatNavigator.

          Restaurant ID: ${restaurantId}
          Beoordeling: ${rating} / 5
          Opmerking: ${comment || 'Geen opmerkingen opgegeven.'}
          Gebruiker ID: ${userId || 'Onbekend'}
          Tijdstip: ${new Date().toLocaleString('nl-NL')}
        `,
        html: `
          <h2>Nieuwe Review Geplaatst</h2>
          <p><strong>Restaurant ID:</strong> ${restaurantId}</p>
          <p><strong>Beoordeling:</strong> ${rating} / 5</p>
          <p><strong>Opmerking:</strong> ${comment ? comment.replace(/\n/g, '<br>') : 'Geen opmerkingen opgegeven.'}</p>
          <p><strong>Gebruiker ID:</strong> ${userId || 'Onbekend'}</p>
          <p><strong>Tijdstip:</strong> ${new Date().toLocaleString('nl-NL')}</p>
        `,
      });

      await client.close();

      console.log('Admin notification email for new review sent');
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