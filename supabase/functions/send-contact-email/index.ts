import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  recaptchaToken: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, recaptchaToken }: ContactRequest = await req.json();

    // Verify reCAPTCHA
    const recaptchaSecret = Deno.env.get('RECAPTCHA_SECRET_KEY');
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`,
      { method: 'POST' }
    );
    
    const recaptchaData = await recaptchaResponse.json();
    
    if (!recaptchaData.success) {
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA verification failed' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log the contact form submission (in production, you would send an actual email using Resend)
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    // TODO: Set up Resend to actually send emails
    // For now, we just log and return success
    // You'll need to add RESEND_API_KEY to secrets and implement email sending

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Contact form received successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in send-contact-email:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
