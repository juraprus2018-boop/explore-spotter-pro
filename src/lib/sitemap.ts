import { getAllRestaurants } from "./database";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "./languages";

export const generateSitemap = async (): Promise<string> => {
  const restaurants = await getAllRestaurants();
  const baseUrl = window.location.origin;
  const languages = SUPPORTED_LANGUAGES;
  const defaultLanguage = DEFAULT_LANGUAGE;

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap +=
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  const buildAlternateLinks = (pathSuffix: string) => {
    const alternates = languages.map(hreflang => ({
      hreflang,
      href: `${baseUrl}/${hreflang}${pathSuffix}`,
    }));

    return [
      ...alternates,
      {
        hreflang: "x-default",
        href: `${baseUrl}/${defaultLanguage}${pathSuffix}`,
      },
    ];
  };

  const homepageAlternates = buildAlternateLinks('');
  const rootAlternates = homepageAlternates.map(alternate =>
    alternate.hreflang === 'x-default'
      ? { ...alternate, href: baseUrl }
      : alternate
  );

  // Add root domain entry with alternates
  sitemap += '  <url>\n';
  sitemap += `    <loc>${baseUrl}</loc>\n`;
  sitemap += '    <changefreq>daily</changefreq>\n';
  sitemap += '    <priority>1.0</priority>\n';
  rootAlternates.forEach(alternate => {
    sitemap += `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />\n`;
  });
  sitemap += '  </url>\n';

  // Add homepage for each language variant so the raw <loc> entries surface in search results
  languages.forEach(lang => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/${lang}</loc>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    homepageAlternates.forEach(alternate => {
      sitemap += `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />\n`;
    });
    sitemap += '  </url>\n';
  });

  // Add restaurant pages once, keyed to the default language location
  restaurants.forEach(restaurant => {
    const citySlug = restaurant.city?.slug;
    const provinceSlug = restaurant.city?.province?.slug;

    if (citySlug && provinceSlug) {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/${defaultLanguage}/${provinceSlug}/${citySlug}/${restaurant.place_id}</loc>\n`;
      sitemap += `    <lastmod>${new Date(restaurant.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      buildAlternateLinks(`/${provinceSlug}/${citySlug}/${restaurant.place_id}`).forEach(
        alternate => {
          sitemap += `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />\n`;
        }
      );
      sitemap += '  </url>\n';
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
