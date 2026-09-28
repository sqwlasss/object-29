// scripts/generate-sitemap.mjs
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Load local env if present (keeps the script runnable from a clean shell).
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local is optional — env may already be set in the shell.
}

const SHOPIFY_STORE_DOMAIN = process.env.VITE_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
// Match src/lib/shopify/client.js, which uses VITE_SHOPIFY_API_VERSION for the endpoint.
const SHOPIFY_API_VERSION = process.env.VITE_SHOPIFY_API_VERSION || "2024-10";
// Mirrors src/config/site.js. Set VITE_SITE_URL for the real domain.
const SITE = (process.env.VITE_SITE_URL || "https://ddouble-store.vercel.app").replace(/\/+$/, "");

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.error("Missing env vars VITE_SHOPIFY_STORE_DOMAIN / VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  process.exit(1);
}

async function gql(query, variables) {
  const res = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const PRODUCTS_QUERY = `query($cursor: String) {
  products(first: 50, after: $cursor) { pageInfo { hasNextPage endCursor } edges { node { handle updatedAt } } }
}`;
const COLLECTIONS_QUERY = `query($cursor: String) {
  collections(first: 50, after: $cursor) { pageInfo { hasNextPage endCursor } edges { node { handle updatedAt } } }
}`;

async function fetchAll(query) {
  const items = [];
  let cursor = null, hasNext = true;
  while (hasNext) {
    const data = await gql(query, { cursor });
    const { edges, pageInfo } = data.products ? data.products : data.collections;
    items.push(...edges.map((e) => e.node));
    hasNext = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }
  return items;
}

const [products, collections] = await Promise.all([
  fetchAll(PRODUCTS_QUERY),
  fetchAll(COLLECTIONS_QUERY),
]);

const today = new Date().toISOString().split("T")[0];
const urls = [
  { loc: "/", lastmod: today, priority: "1.0" },
  { loc: "/shop", lastmod: today, priority: "0.9" },
  ...collections.map((c) => ({ loc: `/shop?category=${c.handle}`, lastmod: (c.updatedAt || "").slice(0, 10) || today, priority: "0.8" })),
  ...products.map((p) => ({ loc: `/product/${p.handle}`, lastmod: (p.updatedAt || "").slice(0, 10) || today, priority: "0.8" })),
  { loc: "/about", lastmod: today, priority: "0.5" },
  { loc: "/contact", lastmod: today, priority: "0.5" },
  { loc: "/faq", lastmod: today, priority: "0.5" },
  { loc: "/privacy", lastmod: today, priority: "0.3" },
  { loc: "/terms", lastmod: today, priority: "0.3" },
  { loc: "/shipping", lastmod: today, priority: "0.3" },
  { loc: "/returns", lastmod: today, priority: "0.3" },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${SITE}${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`).join("\n")}
</urlset>\n`;

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`Wrote sitemap with ${urls.length} URLs`);
