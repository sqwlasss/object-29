// src/config/site.js
//
// The canonical origin, in ONE place.
//
// It was previously hardcoded in four files plus every <loc> in
// public/sitemap.xml. Deploying to a new domain while those still named the old
// one would tell Google the canonical version of every page lives somewhere
// else — the new site would effectively deindex itself in favour of the old
// one, and every Product/Offer URL in the JSON-LD would disagree with the page
// it sits on, which is a rich-result error rather than a cosmetic one.
//
// Set VITE_SITE_URL in your Vercel project (and .env.local) to the real
// domain. The fallback only exists so a local dev build has something valid.
//
// After changing it, also update:
//   • public/robots.txt   — the Sitemap: line
//   • public/sitemap.xml  — regenerate with `npm run sitemap`
const RAW = import.meta.env.VITE_SITE_URL || "https://ddouble-store.vercel.app";

/** Origin with no trailing slash, e.g. https://object-29.vercel.app */
export const SITE_URL = RAW.replace(/\/+$/, "");

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
