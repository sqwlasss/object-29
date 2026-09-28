import { useState, useEffect } from "react";
import Price from "@/components/ddouble/Price";

/**
 * Mobile buy bar. Appears once the main Add to Cart scrolls out of view and
 * hides again over the footer.
 *
 * Reuses `handleAddToCart` from the page — never its own handler — because
 * that function carries the GA4 add_to_cart call.
 *
 * The safe-area padding is not cosmetic: without it this bar sits under the
 * home indicator on a notched phone and the primary buy button is partially
 * untappable.
 */
export default function StickyAddToCart({
  product,
  selectedVariant,
  selectedOptions,
  options,
  displayPrice,
  handleAddToCart,
  cartLoading,
  sentinelRef,
}) {
  const [visible, setVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const el = sentinelRef?.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sentinelRef]);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const hasOptions = options?.some((opt) => opt.values.length > 1) ?? false;
  const needsSelection = !selectedVariant && hasOptions;

  const variantLabel = Object.values(selectedOptions || {}).filter(Boolean).join(" · ");

  return (
    <div
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      className={`o29-field o29-field--bone fixed inset-x-0 bottom-0 z-50 border-t border-hairline transition-transform duration-curtain ease-curtain md:hidden ${
        visible && !footerVisible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!(visible && !footerVisible)}
    >
      <div className="mx-auto flex max-w-page items-center gap-3 px-gutter pt-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-o29-ink">{product?.title}</p>
          {variantLabel && (
            <p className="o29-meta mt-0.5 truncate text-o29-slate">{variantLabel}</p>
          )}
          <p className="mt-0.5 text-sm tabular-nums text-o29-ink">
            <Price amount={displayPrice} />
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={cartLoading}
          tabIndex={visible && !footerVisible ? 0 : -1}
          className="o29-meta o29-hit shrink-0 bg-o29-ink px-6 text-o29-bone transition-colors duration-instant hover:bg-o29-cobalt disabled:bg-o29-bone-2 disabled:text-o29-slate"
        >
          {cartLoading ? "Adding…" : needsSelection ? "Select options" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
