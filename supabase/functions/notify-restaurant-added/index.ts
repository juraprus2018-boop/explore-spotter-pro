import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RestaurantNotification {
  email: string;
  restaurantName: string;
  address: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, restaurantName, address }: RestaurantNotification = await req.json();

    console.log('Sending restaurant notification email to:', email);

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
      to: email,
      subject: 'Restaurant toegevoegd aan EatNavigator',
      content: `
        Bedankt voor het toevoegen van je restaurant aan EatNavigator!
        
        Restaurant: ${restaurantName}
        Adres: ${address}
        
        Je restaurant is nu in afwachting van goedkeuring. 
        
        Om je restaurant te kunnen beheren en het zichtbaar te maken op ons platform, moet je:
        1. Een account aanmaken op EatNavigator
        2. Inloggen met hetzelfde e-mailadres (${email})
        3. Wachten op goedkeuring van een moderator
        
        Na goedkeuring wordt je restaurant zichtbaar voor bezoekers en kun je het beheren via je dashboard.
        
        Met vriendelijke groet,
        Het EatNavigator Team
      `,
      html: `
        <h2>Restaurant toegevoegd aan EatNavigator</h2>
        <p>Bedankt voor het toevoegen van je restaurant aan EatNavigator!</p>
        
        <p><strong>Restaurant:</strong> ${restaurantName}<br>
        <strong>Adres:</strong> ${address}</p>
        
        <p>Je restaurant is nu in afwachting van goedkeuring.</p>
        
        <p>Om je restaurant te kunnen beheren en het zichtbaar te maken op ons platform, moet je:</p>
        <ol>
          <li>Een account aanmaken op EatNavigator</li>
          <li>Inloggen met hetzelfde e-mailadres (${email})</li>
          <li>Wachten op goedkeuring van een moderator</li>
        </ol>
        
        <p>Na goedkeuring wordt je restaurant zichtbaar voor bezoekers en kun je het beheren via je dashboard.</p>
        
        <p>Met vriendelijke groet,<br>
        Het EatNavigator Team</p>
      `,
    });

    await client.close();

    console.log('Restaurant notification sent successfully');

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
    console.error('Error in notify-restaurant-added:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
