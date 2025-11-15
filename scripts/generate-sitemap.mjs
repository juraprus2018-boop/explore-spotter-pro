import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const languagesPath = path.resolve(__dirname, "../config/supported-languages.json");
const supportedLanguages = JSON.parse(await readFile(languagesPath, "utf8"));
const defaultLanguage = supportedLanguages[0] || "nl";

const baseUrl = (process.env.SITEMAP_BASE_URL || "https://eatnavigator.com").replace(/\/+$/, "");
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.PUBLIC_SUPABASE_URL ||
  null;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  null;

const fetchRestaurants = async () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Supabase credentials are missing; generating sitemap with language landing pages only. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) to include restaurant URLs."
    );
    return [];
  }

  const endpoint = new URL("/rest/v1/restaurants", supabaseUrl);
  const select =
    "place_id,updated_at,city:cities!inner(slug,province:provinces!inner(slug))";
  endpoint.searchParams.set("select", select);
  endpoint.searchParams.set("status", "eq.approved");
  endpoint.searchParams.set("order", "updated_at.desc");

  const pageSize = Number.parseInt(process.env.SITEMAP_PAGE_SIZE || "1000", 10);
  const restaurants = [];
  let from = 0;
  let total = Infinity;

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    Prefer: "count=exact",
  };

  while (from < total) {
    const to = from + pageSize - 1;

    const response = await fetch(endpoint.toString(), {
      headers: {
        ...headers,
        Range: `${from}-${to}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Failed to fetch restaurants (status ${response.status}): ${text}`
      );
    }

    const batch = await response.json();

    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }

    restaurants.push(...batch);

    const contentRange = response.headers.get("content-range");
    if (contentRange) {
      const [, rangeTotal] = contentRange.split("/");
      const parsedTotal = Number.parseInt(rangeTotal, 10);
      if (!Number.isNaN(parsedTotal)) {
        total = parsedTotal;
      }
    }

    from += batch.length;

    if (batch.length < pageSize) {
      break;
    }
  }

  return restaurants;
};

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildAlternateLinks = (pathSuffix = "") => {
  const alternates = supportedLanguages.map((lang) => ({
    hreflang: lang,
    href: `${baseUrl}/${lang}${pathSuffix}`,
  }));

  return [
    ...alternates,
    {
      hreflang: "x-default",
      href: `${baseUrl}/${defaultLanguage}${pathSuffix}`,
    },
  ];
};

const restaurants = await (async () => {
  try {
    return await fetchRestaurants();
  } catch (error) {
    console.error("Unable to fetch restaurants from Supabase:", error);
    return [];
  }
})();

const entries = [];

supportedLanguages.forEach((lang) => {
  entries.push({
    loc: `${baseUrl}/${lang}`,
    changefreq: "daily",
    priority: "1.0",
    alternates: buildAlternateLinks(""),
  });
});

restaurants.forEach((restaurant) => {
  const citySlug = restaurant?.city?.slug;
  const provinceSlug = restaurant?.city?.province?.slug;

  if (!citySlug || !provinceSlug) {
    return;
  }

  const lastmodSource = restaurant.updated_at || new Date().toISOString();
  const lastmod = new Date(lastmodSource).toISOString().split("T")[0];
  const pathSuffix = `/${provinceSlug}/${citySlug}/${restaurant.place_id}`;

  supportedLanguages.forEach((lang) => {
    entries.push({
      loc: `${baseUrl}/${lang}${pathSuffix}`,
      lastmod,
      changefreq: "weekly",
      priority: "0.8",
      alternates: buildAlternateLinks(pathSuffix),
    });
  });
});

let sitemap = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
sitemap +=
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

entries.forEach((entry) => {
  sitemap += "  <url>\n";
  sitemap += `    <loc>${escapeXml(entry.loc)}</loc>\n`;

  if (entry.lastmod) {
    sitemap += `    <lastmod>${entry.lastmod}</lastmod>\n`;
  }

  if (entry.changefreq) {
    sitemap += `    <changefreq>${entry.changefreq}</changefreq>\n`;
  }

  if (entry.priority) {
    sitemap += `    <priority>${entry.priority}</priority>\n`;
  }

  (entry.alternates || []).forEach((alternate) => {
    sitemap += `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeXml(alternate.href)}" />\n`;
  });

  sitemap += "  </url>\n";
});

sitemap += "</urlset>\n";

const outputPath = path.resolve(__dirname, "../public/sitemap.xml");
await writeFile(outputPath, sitemap, "utf8");

console.log(`Sitemap generated successfully at ${outputPath}`);
