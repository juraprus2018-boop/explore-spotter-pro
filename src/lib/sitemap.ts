import { getAllRestaurants } from "./database";

export const generateSitemap = async (): Promise<string> => {
  const restaurants = await getAllRestaurants();
  const baseUrl = window.location.origin;
  const languages = ['nl', 'en', 'de', 'fr'];
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add homepage for each language
  languages.forEach(lang => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/${lang}</loc>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    sitemap += '  </url>\n';
  });
  
  // Add restaurant pages for each language
  restaurants.forEach(restaurant => {
    languages.forEach(lang => {
      const citySlug = restaurant.city?.slug;
      const provinceSlug = restaurant.city?.province?.slug;

      if (citySlug && provinceSlug) {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/${lang}/${provinceSlug}/${citySlug}/${restaurant.place_id}</loc>\n`;
        sitemap += `    <lastmod>${new Date(restaurant.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.8</priority>\n';
        sitemap += '  </url>\n';
      }
    });
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
