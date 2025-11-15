import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const languagesPath = path.resolve(__dirname, "../config/supported-languages.json");
const supportedLanguages = JSON.parse(await readFile(languagesPath, "utf8"));

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.PUBLIC_SUPABASE_URL ||
  null;

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  null;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing Supabase credentials. Please set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY/VITE_SUPABASE_PUBLISHABLE_KEY)."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const baseUrl = (process.env.SITEMAP_BASE_URL || "https://eatnavigator.com").replace(/\/+$/, "");

const { data: restaurants, error } = await supabase
  .from("restaurants")
  .select(
    `place_id, updated_at, city:cities ( slug, province:provinces ( slug ) )`
  )
  .order("updated_at", { ascending: false });

if (error) {
  console.error("Failed to fetch restaurants from Supabase:", error);
  process.exit(1);
}

const entries = [];

const buildAlternateLinks = (pathSuffix) =>
  supportedLanguages.map((lang) => ({
    lang,
    href: `${baseUrl}/${lang}${pathSuffix}`,
  }));

supportedLanguages.forEach((lang) => {
  entries.push({
    loc: `${baseUrl}/${lang}`,
    changefreq: "daily",
    priority: "1.0",
    alternates: buildAlternateLinks(""),
  });
});

(restaurants || []).forEach((restaurant) => {
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

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

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
    sitemap += `    <xhtml:link rel="alternate" hreflang="${alternate.lang}" href="${escapeXml(alternate.href)}" />\n`;
  });

  sitemap += "  </url>\n";
});

sitemap += "</urlset>\n";

const outputPath = path.resolve(__dirname, "../public/sitemap.xml");
await writeFile(outputPath, sitemap, "utf8");

console.log(`Sitemap generated successfully at ${outputPath}`);
