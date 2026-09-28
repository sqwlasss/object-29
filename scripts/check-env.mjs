#!/usr/bin/env node
/**
 * Reports which environment variables are present, and what each missing one
 * costs you.
 *
 * NEVER PRINTS A VALUE. Only whether a key is set and how many characters long
 * it is, so this is safe to run while screen-sharing or to paste into a chat.
 *
 *   npm run check:env
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const FILE = process.argv[2] || ".env.local";
const PATH = join(ROOT, FILE);

const GROUPS = [
  {
    title: "Shopify — required",
    note: "Without these the catalogue cannot load.",
    required: true,
    keys: [
      ["VITE_SHOPIFY_STORE_DOMAIN", "your-store.myshopify.com, no https://"],
      ["VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN", "Storefront API access token"],
      ["VITE_SHOPIFY_API_VERSION", "e.g. 2026-07"],
    ],
  },
  {
    title: "Firebase — required for accounts",
    note: "Browsing and checkout work without these; the account area does not.",
    required: false,
    keys: [
      ["VITE_FIREBASE_API_KEY", ""],
      ["VITE_FIREBASE_AUTH_DOMAIN", ""],
      ["VITE_FIREBASE_PROJECT_ID", ""],
      ["VITE_FIREBASE_STORAGE_BUCKET", ""],
      ["VITE_FIREBASE_MESSAGING_SENDER_ID", ""],
      ["VITE_FIREBASE_APP_ID", ""],
      ["VITE_FIREBASE_MEASUREMENT_ID", ""],
    ],
  },
  {
    title: "Optional",
    note: "Each feature switches off cleanly when unset.",
    required: false,
    keys: [
      ["VITE_SHOPIFY_CUSTOMER_SYNC_ENDPOINT", "wishlist sync across devices"],
      ["VITE_GOOGLE_MAPS_API_KEY", "address autocomplete"],
      ["VITE_GA_MEASUREMENT_ID", "GA4 analytics"],
    ],
  },
];

if (!existsSync(PATH)) {
  console.log(`\n  ${FILE} not found.\n`);
  console.log(`  Create it:      cp .env.local.example ${FILE}`);
  console.log(`  Or browse now:  npm run dev:preview   (placeholder data, no keys needed)\n`);
  process.exit(1);
}

// Minimal .env parse: KEY=VALUE, ignoring comments and blank lines.
const env = {};
for (const line of readFileSync(PATH, "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}

console.log(`\n  ${FILE}\n`);
let missingRequired = 0;

for (const group of GROUPS) {
  console.log(`  ${group.title}`);
  for (const [key, hint] of group.keys) {
    const val = env[key];
    const set = Boolean(val);
    if (!set && group.required) missingRequired++;
    const mark = set ? "set " : group.required ? "MISSING" : "unset";
    // Length only — never the value.
    const detail = set ? `${val.length} chars` : hint;
    console.log(`    ${mark.padEnd(8)}${key.padEnd(38)}${detail}`);
  }
  console.log(`    ${group.note}\n`);
}

const unknown = Object.keys(env).filter(
  (k) => k.startsWith("VITE_") && !GROUPS.some((g) => g.keys.some(([key]) => key === k))
);
if (unknown.length) {
  console.log(`  Not read by this app (safe to delete): ${unknown.join(", ")}\n`);
}

if (missingRequired > 0) {
  console.log(`  ${missingRequired} required variable(s) missing — the catalogue will not load.\n`);
  process.exit(1);
}

console.log(`  All required variables present. Run \`npm run dev\`.\n`);
