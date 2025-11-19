import { getAllRestaurants, getAllProvinces, getCitiesByProvince } from "./database";
import { SUPPORTED_LANGUAGES } from "./languages";

const MAX_URLS_PER_SITEMAP = 45000;

type AlternateLink = {
  lang: string;
  href: string;
};

type UrlEntryConfig = {
  loc: string;
  alternates: AlternateLink[];
  changefreq: string;
  priority: string;
  lastmod?: string;
};

export type SitemapFile = {
  filename: string;
  content: string;
};

const createUrlEntry = ({ loc, alternates, changefreq, priority, lastmod }: UrlEntryConfig): string => {
  let entry = "  <url>\n";
  entry += `    <loc>${loc}</loc>\n`;
  alternates.forEach(({ lang, href }) => {
    entry += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />\n`;
  });
  if (lastmod) {
    entry += `    <lastmod>${lastmod}</lastmod>\n`;
  }
  entry += `    <changefreq>${changefreq}</changefreq>\n`;
  entry += `    <priority>${priority}</priority>\n`;
  entry += "  </url>\n";
  return entry;
};

const chunkEntries = (entries: string[], chunkSize: number): string[][] => {
  if (entries.length === 0) {
    return [[]];
  }

  const chunks: string[][] = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    chunks.push(entries.slice(i, i + chunkSize));
  }
  return chunks;
};

const createSitemapDocument = (entries: string[]): string => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  xml += entries.join("");
  xml += '</urlset>';
  return xml;
};

const createSitemapIndexDocument = (files: SitemapFile[], baseUrl: string, lastmod: string): string => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  files.forEach(file => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/${file.filename}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '  </sitemap>\n';
  });
  xml += '</sitemapindex>';
  return xml;
};

const buildAlternateLinks = (languages: string[], getHref: (lang: string) => string, defaultHref: string): AlternateLink[] => {
  const alternates: AlternateLink[] = languages.map(lang => ({
    lang,
    href: getHref(lang),
  }));

  alternates.push({
    lang: "x-default",
    href: defaultHref,
  });

  return alternates;
};

const collectSitemapEntries = async (baseUrl: string): Promise<string[]> => {
  const [restaurants, provinces] = await Promise.all([
    getAllRestaurants(),
    getAllProvinces(),
  ]);

  const languages = [...SUPPORTED_LANGUAGES];
  const entries: string[] = [];

  // Homepage entries
  languages.forEach(lang => {
    const alternates = buildAlternateLinks(
      languages,
      (alternateLang) => `${baseUrl}/${alternateLang}`,
      `${baseUrl}/en`
    );

    entries.push(
      createUrlEntry({
        loc: `${baseUrl}/${lang}`,
        alternates,
        changefreq: "daily",
        priority: "1.0",
      })
    );
  });

  // Provinces and cities
  for (const province of provinces) {
    const cities = await getCitiesByProvince(province.slug);

    languages.forEach(lang => {
      const alternates = buildAlternateLinks(
        languages,
        (alternateLang) => `${baseUrl}/${alternateLang}/${province.slug}`,
        `${baseUrl}/en/${province.slug}`
      );

      entries.push(
        createUrlEntry({
          loc: `${baseUrl}/${lang}/${province.slug}`,
          alternates,
          changefreq: "weekly",
          priority: "0.9",
        })
      );
    });

    cities.forEach(city => {
      languages.forEach(lang => {
        const alternates = buildAlternateLinks(
          languages,
          (alternateLang) => `${baseUrl}/${alternateLang}/${province.slug}/${city.slug}`,
          `${baseUrl}/en/${province.slug}/${city.slug}`
        );

        entries.push(
          createUrlEntry({
            loc: `${baseUrl}/${lang}/${province.slug}/${city.slug}`,
            alternates,
            changefreq: "weekly",
            priority: "0.85",
          })
        );
      });
    });
  }

  // Restaurant pages
  restaurants.forEach(restaurant => {
    const citySlug = restaurant.city?.slug;
    const provinceSlug = restaurant.city?.province?.slug;

    if (!citySlug || !provinceSlug) {
      return;
    }

    languages.forEach(lang => {
      const alternates = buildAlternateLinks(
        languages,
        (alternateLang) => `${baseUrl}/${alternateLang}/${provinceSlug}/${citySlug}/${restaurant.place_id}`,
        `${baseUrl}/en/${provinceSlug}/${citySlug}/${restaurant.place_id}`
      );

      entries.push(
        createUrlEntry({
          loc: `${baseUrl}/${lang}/${provinceSlug}/${citySlug}/${restaurant.place_id}`,
          alternates,
          changefreq: "weekly",
          priority: "0.8",
          lastmod: new Date(restaurant.updated_at).toISOString().split("T")[0],
        })
      );
    });
  });

  return entries;
};

export const generateSitemapFiles = async (): Promise<{ indexFile: SitemapFile; partFiles: SitemapFile[] }> => {
  const baseUrl = window.location.origin;
  const entries = await collectSitemapEntries(baseUrl);
  const lastmod = new Date().toISOString().split("T")[0];
  const entryChunks = chunkEntries(entries, MAX_URLS_PER_SITEMAP);

  const partFiles = entryChunks
    .filter(chunk => chunk.length > 0)
    .map((chunk, index) => ({
      filename: `sitemap-${index + 1}.xml`,
      content: createSitemapDocument(chunk),
    }));

  const indexFile: SitemapFile = {
    filename: "sitemap.xml",
    content: createSitemapIndexDocument(partFiles, baseUrl, lastmod),
  };

  return { indexFile, partFiles };
};

const triggerDownload = (file: SitemapFile) => {
  const blob = new Blob([file.content], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const downloadSitemap = async () => {
  const { indexFile, partFiles } = await generateSitemapFiles();
  const filesToDownload = [indexFile, ...partFiles];

  for (const file of filesToDownload) {
    triggerDownload(file);
    await delay(200);
  }
};
