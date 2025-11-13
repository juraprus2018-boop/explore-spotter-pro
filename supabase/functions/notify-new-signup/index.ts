import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignupNotification {
  email: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userId }: SignupNotification = await req.json();

    // Send notification email via SMTP
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
      subject: 'Nieuwe gebruiker aanmelding - EatNavigator',
      content: `
        Er heeft zich een nieuwe gebruiker aangemeld op EatNavigator.
        
        Email: ${email}
        User ID: ${userId}
        Tijdstip: ${new Date().toLocaleString('nl-NL')}
      `,
      html: `
        <h2>Nieuwe Gebruiker Aanmelding</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>Tijdstip:</strong> ${new Date().toLocaleString('nl-NL')}</p>
      `,
    });

    await client.close();

    console.log('Signup notification sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notification sent' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in notify-new-signup:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
