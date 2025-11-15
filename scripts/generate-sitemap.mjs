import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const languagesPath = path.resolve(
  __dirname,
  "../config/supported-languages.json"
);
const supportedLanguages = JSON.parse(await readFile(languagesPath, "utf8"));
const defaultLanguage = supportedLanguages[0] || "nl";

const baseUrl = (
  process.env.SITE_URL ||
  process.env.SITEMAP_BASE_URL ||
  "https://eatnavigator.com"
).replace(/\/+$/, "");

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

let createClient = null;
if (supabaseUrl && supabaseKey) {
  try {
    ({ createClient } = await import("@supabase/supabase-js"));
  } catch (error) {
    console.warn(
      "@supabase/supabase-js is not installed; falling back to REST API for sitemap generation."
    );
  }
}

const pageSize = Number.parseInt(process.env.SITEMAP_PAGE_SIZE || "1000", 10);

const fetchRestaurants = async () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Supabase credentials are missing; generating sitemap with language landing pages only. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) to include restaurant URLs."
    );
    return [];
  }

  if (createClient) {
    const client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: { headers: { "X-Client-Info": "sitemap-generator" } },
    });

    const deduped = new Map();
    let page = 0;
    let expectedTotal = Infinity;

    while (page * pageSize < expectedTotal) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await client
        .from("restaurants")
        .select(
          "place_id,updated_at,city:cities!inner(slug,province:provinces!inner(slug))",
          {
            count: "exact",
            head: false,
          }
        )
        .eq("status", "approved")
        .order("updated_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        break;
      }

      data.forEach((restaurant) => {
        if (!restaurant?.place_id) {
          return;
        }

        if (!deduped.has(restaurant.place_id)) {
          deduped.set(restaurant.place_id, restaurant);
        }
      });

      if (typeof count === "number" && Number.isFinite(count)) {
        expectedTotal = count;
      }

      if (data.length < pageSize) {
        break;
      }

      page += 1;
    }

    return [...deduped.values()];
  }

  const deduped = new Map();
  let from = 0;
  let total = Infinity;

  const endpoint = new URL("/rest/v1/restaurants", supabaseUrl);
  endpoint.searchParams.set(
    "select",
    "place_id,updated_at,city:cities!inner(slug,province:provinces!inner(slug))"
  );
  endpoint.searchParams.set("status", "eq.approved");
  endpoint.searchParams.set("order", "updated_at.desc");

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

    batch.forEach((restaurant) => {
      if (!restaurant?.place_id) {
        return;
      }

      if (!deduped.has(restaurant.place_id)) {
        deduped.set(restaurant.place_id, restaurant);
      }
    });

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

  return [...deduped.values()];
};

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildAlternateLinks = (pathSuffix = "") => {
  const alternates = supportedLanguages.map((hreflang) => ({
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

const restaurants = await (async () => {
  try {
    const fetched = await fetchRestaurants();
    if (fetched.length > 0) {
      console.log(`Including ${fetched.length} restaurant entries in the sitemap.`);
    }
    return fetched;
  } catch (error) {
    console.error("Unable to fetch restaurants from Supabase:", error);
    return [];
  }
})();

const entries = [];

const homepageAlternates = buildAlternateLinks("");
const rootAlternates = homepageAlternates.map((alternate) =>
  alternate.hreflang === "x-default"
    ? { ...alternate, href: baseUrl }
    : alternate
);

entries.push({
  loc: baseUrl,
  changefreq: "daily",
  priority: "1.0",
  alternates: rootAlternates,
});

supportedLanguages.forEach((lang) => {
  entries.push({
    loc: `${baseUrl}/${lang}`,
    changefreq: "daily",
    priority: "1.0",
    alternates: homepageAlternates,
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

  entries.push({
    loc: `${baseUrl}/${defaultLanguage}${pathSuffix}`,
    lastmod,
    changefreq: "weekly",
    priority: "0.8",
    alternates: buildAlternateLinks(pathSuffix),
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
