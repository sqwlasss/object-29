import { cn } from "@/lib/utils";

/**
 * The 11px uppercase metadata line. Slash-separated, two or three lines,
 * never four. One block per section, at most four sections per page.
 *
 * THE HONESTY RULE — this is the component where art direction most easily
 * turns into lying to a customer:
 *
 *   Editorial surfaces (hero, collection index, About, 404, footer colophon)
 *   may carry the surreal register: STATUS: UNREAL, LOCATION: UNDEFINED.
 *
 *   Shop and Product may NOT. Every line there must resolve to a real Shopify
 *   field — collection title, live piece count, real option values,
 *   productType — or it does not render. Never an invented edition number,
 *   never a fabricated status on a purchasable product, and never a stock
 *   figure: `quantityAvailable` is selected by no query in this codebase and
 *   is always undefined.
 *
 * Pass `items` and falsy entries are dropped, so a missing Shopify field
 * removes its line instead of rendering an empty slash.
 */
export default function MetaLabel({ items = null, children = null, as: Tag = "p", className = "", ...rest }) {
  const lines = Array.isArray(items) ? items.filter(Boolean) : null;
  if (lines && lines.length === 0) return null;

  return (
    <Tag className={cn("o29-meta", className)} {...rest}>
      {lines
        ? lines.map((line, i) => (
            <span key={i}>
              {i > 0 && <span aria-hidden="true"> / </span>}
              {line}
            </span>
          ))
        : children}
    </Tag>
  );
}
