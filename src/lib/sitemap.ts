import { getAllRestaurants, getAllProvinces, getCitiesByProvince } from "./database";
import { SUPPORTED_LANGUAGES } from "./languages";

export const generateSitemap = async (): Promise<string> => {
  const [restaurants, provinces] = await Promise.all([
    getAllRestaurants(),
    getAllProvinces()
  ]);
  
  const baseUrl = window.location.origin;
  const languages = SUPPORTED_LANGUAGES;
  
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
    sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en" />\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    sitemap += '  </url>\n';
  });
  
  // Add province pages for each language with hreflang
  for (const province of provinces) {
    languages.forEach(lang => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/${lang}/${province.slug}</loc>\n`;
      // Add hreflang alternates
      languages.forEach(alternateLang => {
        sitemap += `    <xhtml:link rel="alternate" hreflang="${alternateLang}" href="${baseUrl}/${alternateLang}/${province.slug}" />\n`;
      });
      sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en/${province.slug}" />\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.9</priority>\n';
      sitemap += '  </url>\n';
    });
    
    // Get cities for this province
    const cities = await getCitiesByProvince(province.slug);
    
    // Add city pages for each language with hreflang
    cities.forEach(city => {
      languages.forEach(lang => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/${lang}/${province.slug}/${city.slug}</loc>\n`;
        // Add hreflang alternates
        languages.forEach(alternateLang => {
          sitemap += `    <xhtml:link rel="alternate" hreflang="${alternateLang}" href="${baseUrl}/${alternateLang}/${province.slug}/${city.slug}" />\n`;
        });
        sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en/${province.slug}/${city.slug}" />\n`;
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.85</priority>\n';
        sitemap += '  </url>\n';
      });
    });
  }
  
  // Add restaurant pages for each language with hreflang
  restaurants.forEach(restaurant => {
    const citySlug = restaurant.city?.slug;
    const provinceSlug = restaurant.city?.province?.slug;

    if (citySlug && provinceSlug) {
      languages.forEach(lang => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/${lang}/${provinceSlug}/${citySlug}/${restaurant.place_id}</loc>\n`;
        // Add hreflang alternates
        languages.forEach(alternateLang => {
          sitemap += `    <xhtml:link rel="alternate" hreflang="${alternateLang}" href="${baseUrl}/${alternateLang}/${provinceSlug}/${citySlug}/${restaurant.place_id}" />\n`;
        });
        sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en/${provinceSlug}/${citySlug}/${restaurant.place_id}" />\n`;
        sitemap += `    <lastmod>${new Date(restaurant.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.8</priority>\n';
        sitemap += '  </url>\n';
      });
    }
  });
  
  sitemap += '</urlset>';
  
  return sitemap;
};

export const downloadSitemap = async () => {
  const sitemap = await generateSitemap();
  const blob = new Blob([sitemap], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
