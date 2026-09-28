import { createStorefrontApiClient } from "@shopify/storefront-api-client";

/**
 * The Storefront API client.
 *
 * WHY THIS IS BUILT LAZILY
 *
 * `createStorefrontApiClient` validates its options and THROWS if any are
 * missing or malformed — including an `apiVersion` of `undefined`. This module
 * used to call it at module scope, so with no `.env.local` present the throw
 * happened during import, before React had rendered anything and before the
 * ErrorBoundary in App.jsx existed to catch it. The result was a completely
 * blank white page whose only clue was one console line.
 *
 * Building on first request instead means a missing configuration surfaces as
 * an ordinary failed query: the header, footer and page chrome all render, and
 * only the product data reports an error. Nothing else about the request
 * behaviour changes.
 *
 * It also makes the dev fixture more robust, since the client now captures
 * `fetch` at first use rather than at import.
 */
// Option name → the env var it actually comes from. Written out rather than
// derived, because the token's option name (`publicAccessToken`) does not
// match its variable name (`VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN`) — deriving
// it would print a variable that does not exist, which is worse than silence.
const ENV_VARS = {
  storeDomain: "VITE_SHOPIFY_STORE_DOMAIN",
  apiVersion: "VITE_SHOPIFY_API_VERSION",
  publicAccessToken: "VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN",
};

const CONFIG = {
  storeDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN,
  apiVersion: import.meta.env.VITE_SHOPIFY_API_VERSION,
  publicAccessToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
};

const MISSING = Object.entries(CONFIG)
  .filter(([, v]) => !v)
  .map(([k]) => ENV_VARS[k]);

function configError() {
  return new Error(
    `Shopify is not configured. Missing: ${MISSING.join(", ")}.\n` +
      `Add your Storefront API keys to .env.local and restart, ` +
      `or run \`npm run dev:preview\` to browse with placeholder data.`
  );
}

if (import.meta.env.DEV && MISSING.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(
    `[shopify] Not configured — missing ${MISSING.join(", ")}.\n` +
      `Product data will fail to load; the rest of the site still renders.\n` +
      `  Real catalogue:   add the keys to .env.local, then \`npm run dev\`\n` +
      `  Placeholder data: \`npm run dev:preview\``
  );
}

let client = null;

function getClient() {
  if (MISSING.length > 0) throw configError();
  if (!client) {
    client = createStorefrontApiClient({
      storeDomain: `https://${CONFIG.storeDomain}`,
      apiVersion: CONFIG.apiVersion,
      publicAccessToken: CONFIG.publicAccessToken,
    });
  }
  return client;
}

export async function shopifyFetch(query, variables = {}) {
  const response = await getClient().request(query, { variables });
  if (response.errors) {
    const errors = Array.isArray(response.errors) ? response.errors : [response.errors];
    throw new Error(errors.map((e) => e.message).join("\n"));
  }
  return response.data;
}

/** True when the Storefront API keys are present. */
export const isShopifyConfigured = MISSING.length === 0;

export default getClient;
