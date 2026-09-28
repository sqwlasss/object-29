import { useMemo, useState } from "react";
import PlateWell from "@/components/o29/PlateWell";
import MetaLabel from "@/components/o29/MetaLabel";

/**
 * A vertical plate sequence, not a thumbnail gallery.
 *
 * Every image is shown in order at full column width, each in an identical
 * mat well. This removes three sources of fragility at once:
 *
 *  - No "does this product have a second image?" branch. A one-image product
 *    renders one plate; a five-image product renders five. Nothing to special-case.
 *  - No active-thumbnail state to keep in sync with variant selection.
 *  - No "View in Room" toggle. That control assumed `images[1]` was an
 *    interior shot, which is a guess about the catalogue. In a sequence every
 *    image — including the room shot — is simply visible in turn.
 *
 * When the selected variant has its own image, that plate leads.
 *
 * Zoom is per-plate and is local UI state only; it touches no commerce logic.
 */
export default function PdpGallery({ product, selectedVariant }) {
  const [zoomed, setZoomed] = useState(null);

  const plates = useMemo(() => {
    const imgs =
      product.images?.length > 0
        ? product.images
        : product.image
          ? [{ url: product.image, altText: product.imageAlt || product.title }]
          : [];

    const variantUrl = selectedVariant?.image?.url;
    if (!variantUrl) return imgs;

    const idx = imgs.findIndex((i) => i.url === variantUrl);
    if (idx === 0) return imgs;
    if (idx > 0) return [imgs[idx], ...imgs.filter((_, i) => i !== idx)];
    return [{ url: variantUrl, altText: selectedVariant.image.altText || product.title }, ...imgs];
  }, [product, selectedVariant]);

  if (plates.length === 0) {
    return (
      <div className="lg:w-[62%]">
        <PlateWell>
          <MetaLabel items={["ØBJECT 29", "Image unavailable"]} className="text-o29-slate" />
        </PlateWell>
      </div>
    );
  }

  return (
    <div className="lg:w-[62%]">
      <div className="space-y-5">
        {plates.map((img, i) => {
          const isZoomed = zoomed === i;
          return (
            <button
              key={img.url ?? i}
              type="button"
              onClick={() => setZoomed(isZoomed ? null : i)}
              aria-label={isZoomed ? `Zoom out of image ${i + 1}` : `Zoom into image ${i + 1} of ${plates.length}`}
              aria-pressed={isZoomed}
              className={`block w-full ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
            >
              <PlateWell
                src={img.url}
                alt={img.altText || product.title}
                width={img.width}
                height={img.height}
                sizes="(max-width: 1023px) 100vw, 60vw"
                priority={i === 0}
                className={isZoomed ? "[&_img]:scale-[1.8]" : ""}
              />
            </button>
          );
        })}
      </div>

      {plates.length > 1 && (
        <MetaLabel
          items={[`${plates.length} views`]}
          className="mt-4 text-o29-slate"
        />
      )}
    </div>
  );
}
