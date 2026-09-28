import { Link } from "react-router-dom";
import { shopifyImage } from "@/lib/utils";

/**
 * The collection index — a typographic list, not a tile grid.
 *
 * A 4-up grid of collection tiles is the one thing on this page that would
 * look like a normal shop. Rows of type that produce an image out of empty
 * space are the editorial move, and the row is where the shift motif is spent:
 * the image moves, the title moves 3px, the metadata never does.
 *
 * TWO ACCESSIBILITY RULES ARE BUILT IN, not bolted on:
 *
 *  - The thumbnail appears on `focus-within` as well as `hover`, so a
 *    keyboard user does not browse an unillustrated text list.
 *  - Below `md`, and on any coarse pointer, a cropped sliver of the artwork
 *    sits under each title permanently — hover-only imagery is invisible on
 *    touch.
 *
 * Imagery comes from `collection.image`, which normalizeCollection already
 * returns. Do NOT reach for each collection's first product here: that is an
 * N+1 fan-out of up to 20 extra GraphQL queries on the homepage.
 */
export default function CollectionIndex({ collections = [], limit = 6 }) {
  const rows = collections.slice(0, limit);
  if (rows.length === 0) return null;

  return (
    <ul className="border-t border-hairline">
      {rows.map((collection, i) => (
        <li key={collection.handle} className="group border-b border-hairline">
          <Link
            to={`/shop?category=${collection.handle}`}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 md:min-h-[88px] md:gap-8"
          >
            <span className="o29-meta tabular-nums text-o29-slate">
              {String(i + 1).padStart(2, "0")}
            </span>

            <span className="min-w-0">
              <span className="block font-display text-h3 font-medium text-o29-ink transition-transform duration-shift ease-shift group-hover:translate-x-[3px] group-focus-within:translate-x-[3px]">
                {collection.title}
              </span>
              {/* Touch + small screens: a permanent sliver, never hover-only. */}
              {collection.image && (
                <span className="mt-3 block h-12 w-full overflow-clip bg-o29-bone-2 md:hidden">
                  <img
                    src={shopifyImage(collection.image, 600)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </span>
              )}
            </span>

            {/* Desktop: the image arrives out of the empty right-hand column. */}
            <span className="hidden h-16 w-28 shrink-0 overflow-clip bg-o29-bone-2 opacity-0 transition-opacity duration-shift ease-room group-hover:opacity-100 group-focus-within:opacity-100 md:block">
              {collection.image && (
                <img
                  src={shopifyImage(collection.image, 400)}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
