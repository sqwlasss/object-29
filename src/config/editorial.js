// src/config/editorial.js
//
// Editorial wiring for the homepage. Everything here is a POINTER INTO
// SHOPIFY, never content — no product titles, prices, descriptions or image
// URLs are hardcoded. Change what the homepage features from the Shopify
// admin by curating the collection below; no code change, no redeploy.

/**
 * The hero artwork resolves through this chain, in order:
 *
 *   1. HERO.productHandle      — an exact product, if you want to pin one
 *   2. HERO.fallbackCollection — the first product of this collection
 *   3. the store's first collection
 *   4. nothing — and that is a designed state, not a failure
 *
 * Step 4 matters. The hero room is painted in CSS: the cobalt wall, the hard
 * horizon, the doorway band, the headline and the CTA all render before any
 * network response and do not depend on the artwork resolving. When no image
 * is available the canvas stays a flat bone-2 rectangle at its final aspect
 * ratio, carrying the metadata stamp — it reads as a work de-installed from
 * the wall, which is a deliberate state in the brand's own language.
 *
 * It must NEVER render copy implying the shop is closed or unfinished.
 *
 * `productHandle` is deliberately empty by default: `useProduct` is gated on
 * `enabled: !!handle`, so an unset handle no-ops instead of firing a query
 * that is guaranteed to miss.
 */
export const HERO = {
  productHandle: "",
  fallbackCollection: "hero",
};

/**
 * The homepage collection index. `limit` caps how many rows render; the rows
 * themselves come from `useCollections()`.
 *
 * Collection imagery uses `collection.image`, which `normalizeCollection`
 * already returns from both ALL_COLLECTIONS and COLLECTION_BY_HANDLE. Do NOT
 * reach for each collection's first product here — that is an N+1 fan-out of
 * up to 20 extra GraphQL queries on the homepage.
 */
export const INDEX = {
  limit: 6,
};

/**
 * Editorial-register metadata. Permitted ONLY on the surfaces listed in
 * MetaLabel's contract — the hero, the collection index, About, the 404 and
 * the footer colophon.
 *
 * Never on Shop or Product, where every metadata line must resolve to a real
 * Shopify field or not render at all.
 */
export const STAMP = {
  hero: ["ØBJECT 29", "Exhibition 01"],
  notFound: ["Error 404", "Location: Undefined"],
};
