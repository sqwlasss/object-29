import { useEffect } from "react";

import { SITE_URL } from "@/config/site";
const DEFAULT_TITLE = "ØBJECT 29 — Art for another reality";
const DEFAULT_DESCRIPTION =
  "Contemporary surreal art and wall art. Impossible rooms, oversized objects and altered realities, printed as collectible editions.";

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  if (content) el.setAttribute("content", content);
  else el.remove();
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement("link"); el.setAttribute("rel", rel); document.head.appendChild(el); }
  if (href) el.setAttribute("href", href);
  else el.remove();
}

export default function Seo({ title, description, canonicalPath, image, noindex = false, jsonLd = null }) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title || DEFAULT_TITLE;
    setMeta("name", "description", description || DEFAULT_DESCRIPTION);
    setLink("canonical", canonicalPath ? `${SITE_URL}${canonicalPath}` : "");
    setMeta("property", "og:title", title || DEFAULT_TITLE);
    setMeta("property", "og:description", description || DEFAULT_DESCRIPTION);
    setMeta("property", "og:url", canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:image", image || "");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title || DEFAULT_TITLE);
    setMeta("name", "twitter:description", description || DEFAULT_DESCRIPTION);
    setMeta("name", "robots", noindex ? "noindex" : "");
    let ldScript = document.getElementById("page-jsonld");
    if (jsonLd) {
      if (!ldScript) {
        ldScript = document.createElement("script");
        ldScript.id = "page-jsonld";
        ldScript.type = "application/ld+json";
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(jsonLd);
    } else if (ldScript) ldScript.remove();
    return () => { document.title = prevTitle; };
  }, [title, description, canonicalPath, image, noindex, jsonLd]);
  return null;
}
