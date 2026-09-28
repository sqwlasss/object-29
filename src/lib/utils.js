import { clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge has to be told about this design system's custom scales.
 *
 * Out of the box it cannot tell that `text-mega` is a FONT SIZE and
 * `text-o29-bone-2` is a TEXT COLOUR — both look like `text-<something>`, so it
 * assumes they conflict and silently keeps only the last one. That is not a
 * theoretical risk: it already dropped `text-mega` from the oversized Ø29 mark
 * when a colour class was passed alongside it, and the mark rendered at body
 * size with no error anywhere.
 *
 * Declaring the groups makes size-vs-colour merges behave, so a component can
 * set its own size and a caller can recolour it without erasing it.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["meta", "xs", "sm", "base", "lead", "h3", "h2", "h1", "display", "mega"] },
      ],
      "text-color": [
        {
          text: [
            "field-fg", "field-muted", "hairline", "control", "focusring", "mark",
            {
              o29: [
                "bone", "bone-2", "rule", "edge", "slate", "ink",
                "cobalt", "vermilion", "ochre", "olive", "sky",
              ],
            },
          ],
        },
      ],
    },
  },
})

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}


export const isIframe = window.self !== window.top;

/**
 * Ask Shopify's CDN for a specific rendition width.
 *
 * Only http(s) URLs get the parameter. A `data:`, `blob:` or relative URL is
 * returned untouched — appending `?width=` to a data URI corrupts its payload,
 * and nothing but the Shopify CDN understands the parameter anyway.
 */
export function shopifyImage(url, width) {
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) return url;
  return url.includes("?") ? `${url}&width=${width}` : `${url}?width=${width}`;
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

