import { cn, shopifyImage } from "@/lib/utils";

/**
 * The mount every artwork sits inside.
 *
 * A fixed 4:5 box on bone-2, a hairline inset, mat padding, and object-contain.
 * Because the box is fixed and the image is contained, a tall work, a wide work
 * and a square work occupy exactly the same footprint — and nothing is ever
 * cropped. On a store selling images, cropping the image is the one thing a
 * product card must not do.
 *
 * NO TYPE EVER ENTERS THE WELL: no title overlay, no price badge, no hover
 * caption, no gradient scrim. That rule is what makes contrast safe against a
 * catalogue of unknown artworks.
 */
export default function PlateWell({
  src = null,
  alt = "",
  width = undefined,
  height = undefined,
  sizes = undefined,
  priority = false,
  hover = false,
  className = "",
  children = null,
}) {
  return (
    <div
      className={cn(
        "relative aspect-plate overflow-clip bg-o29-bone-2 p-[clamp(0.75rem,3%,2rem)]",
        "shadow-[inset_0_0_0_1px_hsl(var(--o29-rule))]",
        className
      )}
    >
      {src ? (
        <img
          src={shopifyImage(src, 900)}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchpriority={priority ? "high" : undefined}
          decoding="async"
          className={cn(
            "h-full w-full object-contain transition-transform duration-scale ease-room",
            hover && "group-hover:scale-[1.03]"
          )}
        />
      ) : (
        // A work de-installed from the wall: a deliberate state in the brand's
        // own language, never a broken-image icon.
        children ?? null
      )}
    </div>
  );
}
