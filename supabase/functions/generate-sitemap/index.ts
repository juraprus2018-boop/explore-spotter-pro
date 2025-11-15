import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all restaurants with their city and province data
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select(`
        place_id,
        updated_at,
        cities!inner (
          slug,
          provinces!inner (
            slug
          )
        )
      `)
      .eq('status', 'approved');

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Fetched restaurants:', restaurants?.length || 0);

    const baseUrl = req.headers.get('origin') || 'https://eatnavigator.com';
    const languages = ['nl', 'en', 'de', 'fr'];
    
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
    
    // Add homepage for each language with hreflang
    languages.forEach(lang => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/${lang}</loc>\n`;
      // Add hreflang alternates
      languages.forEach(alternateLang => {
        sitemap += `    <xhtml:link rel="alternate" hreflang="${alternateLang}" href="${baseUrl}/${alternateLang}" />\n`;
      });
      sitemap += '    <changefreq>daily</changefreq>\n';
      sitemap += '    <priority>1.0</priority>\n';
      sitemap += '  </url>\n';
    });
    
    // Add restaurant pages for each language with hreflang
    restaurants?.forEach((restaurant: any) => {
      const city = restaurant.cities;
      const province = city?.provinces;
      const citySlug = city?.slug;
      const provinceSlug = province?.slug;

      if (citySlug && provinceSlug) {
        languages.forEach(lang => {
          sitemap += '  <url>\n';
          sitemap += `    <loc>${baseUrl}/${lang}/${provinceSlug}/${citySlug}/${restaurant.place_id}</loc>\n`;
          // Add hreflang alternates for this restaurant
          languages.forEach(alternateLang => {
            sitemap += `    <xhtml:link rel="alternate" hreflang="${alternateLang}" href="${baseUrl}/${alternateLang}/${provinceSlug}/${citySlug}/${restaurant.place_id}" />\n`;
          });
          sitemap += `    <lastmod>${new Date(restaurant.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
          sitemap += '    <changefreq>weekly</changefreq>\n';
          sitemap += '    <priority>0.8</priority>\n';
          sitemap += '  </url>\n';
        });
      }
    });
    
    sitemap += '</urlset>';

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>${errorMessage}</error>`,
      {
        headers: corsHeaders,
        status: 500,
      }
    );
  }
});
