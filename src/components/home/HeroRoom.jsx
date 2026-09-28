import { Link } from "react-router-dom";
import MetaLabel from "@/components/o29/MetaLabel";
import PlateWell from "@/components/o29/PlateWell";
import { STAMP } from "@/config/editorial";

/**
 * The hero: a constructed room, painted in CSS.
 *
 * WHY IT IS NOT A PHOTOGRAPH
 *
 * There is no shippable hero image in this repository. `assets/` was
 * Scandinavian interior stock from the previous brand — the wrong universe,
 * and carrying third-party trademarks and a person's likeness. The four
 * reference images are Instagram screenshots with UI chrome and a recognisable
 * person in them. None can ship, and inventing one is not an option.
 *
 * So the room is drawn: a cobalt wall meeting a bone floor at a hard
 * 0%-length gradient stop, with a vermilion doorway band bleeding off the
 * right edge. The headline, horizon, metadata and CTA all paint before any
 * network response, which also makes the LCP a painted rectangle rather than a
 * photograph behind a GraphQL round trip.
 *
 * ONE artwork hangs on that wall, resolved live from Shopify via
 * src/config/editorial.js. While it loads — or if every query fails — the
 * canvas stays a flat bone-2 rectangle at its final aspect ratio carrying the
 * stamp. That reads as a work de-installed from the wall, a deliberate state
 * in the brand's own language: it never shifts layout, and never implies the
 * shop is closed.
 *
 * LAYOUT: the type owns the full width of the wall and the plate is placed on
 * top of it, crossing the horizon the way the spheres cross seams in the
 * reference work. An earlier version put them in two grid columns, which left
 * the headline an 828px column — far too narrow for a 176px line, so it broke
 * into three lines and overran the horizon.
 *
 * MOBILE is a different composition, not a squeeze: the plate drops below the
 * type, and the 16% vertical doorway becomes a horizontal floor strip, because
 * a 16% band at 390px is a stripe, not a wall.
 */
export default function HeroRoom({ product, isLoading }) {
  const image = product?.images?.[0] ?? (product?.image ? { url: product.image } : null);

  const plate = (
    <>
      <PlateWell
        src={image?.url}
        alt={image?.altText || product?.title || ""}
        width={image?.width}
        height={image?.height}
        sizes="(max-width: 767px) 70vw, 26vw"
        priority
      >
        <MetaLabel
          items={isLoading ? ["ØBJECT 29", "Installing"] : ["ØBJECT 29", "De-installed"]}
          className="text-o29-slate"
        />
      </PlateWell>
      {product && <p className="o29-meta mt-3 text-o29-ink">{product.title}</p>}
    </>
  );

  return (
    <section
      className="o29-field o29-field--cobalt relative isolate overflow-clip"
      style={{
        // The horizon. One hard stop, never a blend.
        background:
          "linear-gradient(to bottom, hsl(var(--o29-cobalt)) 0 62%, hsl(var(--o29-bone)) 62% 100%)",
      }}
    >
      {/* The doorway band, leaving the frame on the right. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 hidden w-[14%] bg-o29-vermilion md:block"
      />
      {/* Its mobile reorientation: a floor strip across the bottom. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[8%] bg-o29-vermilion md:hidden"
      />

      <div className="relative mx-auto w-full max-w-page px-gutter pb-quiet pt-tight md:min-h-[100svh]">
        <MetaLabel items={STAMP.hero} />
        {/* Full width of the wall — the type is the composition. */}
        <h1 className="mt-6 max-w-[13ch] font-display text-display font-medium text-field-fg">
          Art for another reality.
        </h1>
        {/* Fixed 40px, not `mt-tight`: the fluid step pushed the CTA across the
            62% horizon at desktop widths, so its underline was sliced by the
            seam. Everything in this block stays on the wall. */}
        <Link
          to="/shop"
          className="o29-meta mt-10 inline-flex min-h-hit items-center border-b border-current pb-1 text-field-fg transition-colors duration-instant hover:text-o29-ochre"
        >
          Shop the collection
        </Link>

        {/* Desktop: the work hangs on the wall, crossing the horizon. */}
        <div className="pointer-events-none absolute bottom-[8%] right-[18%] hidden w-[24vw] max-w-[340px] md:block">
          <div className="pointer-events-auto">{plate}</div>
        </div>

        {/* Mobile: the work sits below the type, still crossing the seam. */}
        <div className="mt-tight w-[70%] max-w-[280px] md:hidden">{plate}</div>
      </div>
    </section>
  );
}
