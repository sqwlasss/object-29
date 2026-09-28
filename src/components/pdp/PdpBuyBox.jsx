import { useMemo } from "react";
import { Minus, Plus, Heart } from "lucide-react";
import Price from "@/components/ddouble/Price";
import StockIndicator from "@/components/ddouble/StockIndicator";
import MetaLabel from "@/components/o29/MetaLabel";
import { FREE_SHIPPING_THRESHOLD } from "@/config/shipping";

/**
 * The buy column.
 *
 * NOTHING HERE ANIMATES. It sits between "I want this" and "I paid": the
 * price, the stepper, the option buttons and Add to Cart change colour on
 * hover at most, never transform, and the column carries no Reveal wrapper —
 * purchase information must be on screen the instant the page is.
 *
 * Two behaviours are load-bearing and must survive any future restyle:
 *
 *  - Options with a single value are NOT rendered, but they ARE still seeded
 *    into `selectedOptions` by the parent, because the variant matcher matches
 *    on every option name. Do not "tidy" the seeding to match this condition.
 *
 *  - `handleAddToCart` carries the GA4 add_to_cart call. Never attach a new
 *    onClick to a buy surface; always reuse this handler.
 */
export default function PdpBuyBox({
  product,
  selectedVariant,
  selectedOptions,
  setSelectedOptions,
  quantity,
  setQuantity,
  displayPrice,
  formatPrice,
  handleAddToCart,
  cartLoading,
  isFav,
  handleFavorite,
  heartAnimating,
  sentinelRef,
}) {
  /**
   * Which option values lead to a variant that cannot be bought.
   *
   * A value is unavailable when no variant carrying it — with the shopper's
   * other current selections held fixed — is availableForSale. Previously the
   * UI offered every value identically and only failed at Add to Cart.
   */
  const unavailableValues = useMemo(() => {
    const out = {};
    for (const option of product.options) {
      out[option.name] = new Set();
      for (const value of option.values) {
        const candidate = { ...selectedOptions, [option.name]: value };
        const match = product.variants.some(
          (v) =>
            Object.entries(candidate).every(([name, val]) =>
              v.selectedOptions.some((o) => o.name === name && o.value === val)
            ) && v.availableForSale
        );
        if (!match) out[option.name].add(value);
      }
    }
    return out;
  }, [product, selectedOptions]);

  // Metadata lines must resolve to REAL Shopify fields or not render at all.
  // No invented object numbers, no edition counts, no stock figures.
  const metaItems = [
    product.productType || null,
    product.options?.find((o) => /size/i.test(o.name))?.values.length > 1
      ? `${product.options.find((o) => /size/i.test(o.name)).values.length} sizes`
      : null,
    product.vendor || null,
  ].filter(Boolean);

  return (
    <div className="lg:w-[38%] lg:sticky lg:top-header lg:self-start">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {metaItems.length > 0 && <MetaLabel items={metaItems} className="mb-4 text-o29-slate" />}
          <h1 className="font-display text-h2 font-medium text-o29-ink">{product.title}</h1>
        </div>
        <button
          onClick={handleFavorite}
          className="o29-hit flex shrink-0 items-center justify-center border border-o29-edge text-o29-ink transition-colors duration-instant hover:bg-o29-bone-2"
          aria-label={isFav ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`}
          aria-pressed={isFav}
        >
          <Heart
            size={18}
            className={`${heartAnimating ? "animate-heart-pop" : ""} ${
              isFav ? "fill-o29-ink text-o29-ink" : "text-o29-ink"
            }`}
          />
        </button>
      </div>

      <p className="mt-6 text-h3 tabular-nums text-o29-ink">
        <Price amount={displayPrice} />
      </p>

      <StockIndicator variant={selectedVariant} />

      {/* Options */}
      {product.options.map((option) => (
        option.values.length > 1 && (
          <fieldset key={option.name} className="mt-8">
            <legend className="o29-meta mb-3 text-o29-slate">{option.name}</legend>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const selected = selectedOptions[option.name] === value;
                const soldOut = unavailableValues[option.name]?.has(value);
                return (
                  <button
                    key={value}
                    onClick={() => setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))}
                    aria-pressed={selected}
                    aria-disabled={soldOut ? "true" : undefined}
                    className={`o29-hit flex items-center justify-center border px-4 text-xs transition-colors duration-instant ${
                      selected
                        ? "border-o29-ink bg-o29-ink text-o29-bone"
                        : "border-o29-edge text-o29-ink hover:bg-o29-bone-2"
                    } ${soldOut && !selected ? "text-o29-slate" : ""}`}
                    style={
                      soldOut && !selected
                        ? {
                            // A 1px diagonal strike, never a faded grey — and
                            // never the only signal: aria-disabled and the
                            // "Sold out" line below carry it too.
                            backgroundImage:
                              "linear-gradient(to top right, transparent calc(50% - 0.5px), hsl(var(--o29-edge)) calc(50% - 0.5px), hsl(var(--o29-edge)) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
                          }
                        : undefined
                    }
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            {[...(unavailableValues[option.name] ?? [])].length > 0 && (
              <p className="o29-meta mt-2 text-o29-vermilion">
                Sold out: {[...unavailableValues[option.name]].join(", ")}
              </p>
            )}
          </fieldset>
        )
      ))}

      {/* Quantity */}
      <div className="mt-8">
        <span className="o29-meta mb-3 block text-o29-slate">Quantity</span>
        <div className="inline-flex items-center border border-o29-edge">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="o29-hit flex items-center justify-center px-4 text-o29-slate transition-colors duration-instant hover:text-o29-ink"
            aria-label="Decrease quantity"
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <span className="w-10 text-center text-sm tabular-nums text-o29-ink" aria-live="polite">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="o29-hit flex items-center justify-center px-4 text-o29-slate transition-colors duration-instant hover:text-o29-ink"
            aria-label="Increase quantity"
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        disabled={cartLoading || !selectedVariant}
        className="o29-meta o29-hit mt-8 w-full bg-o29-ink text-o29-bone transition-colors duration-instant hover:bg-o29-cobalt disabled:bg-o29-bone-2 disabled:text-o29-slate"
      >
        {cartLoading
          ? "Adding…"
          : selectedVariant
            ? `Add to cart — ${formatPrice(displayPrice)}`
            : "Select options"}
      </button>
      {product.options.some((o) => o.values.length > 1) && !selectedVariant && (
        <p className="mt-2 text-xs text-o29-slate">That combination isn&rsquo;t available — try another.</p>
      )}
      <div ref={sentinelRef} className="h-px md:hidden" />

      {/* Fulfilment facts. Text, no icon grid — four identical truck glyphs
          said nothing the words did not. */}
      <dl className="mt-8 space-y-2 border-t border-hairline pt-8">
        <div className="flex justify-between gap-4">
          <dt className="o29-meta text-o29-slate">Shipping</dt>
          <dd className="text-right text-sm text-o29-ink">
            Free over <Price amount={FREE_SHIPPING_THRESHOLD} />
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="o29-meta text-o29-slate">Dispatch</dt>
          <dd className="text-right text-sm text-o29-ink">1–2 business days</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="o29-meta text-o29-slate">Returns</dt>
          <dd className="text-right text-sm text-o29-ink">30 days</dd>
        </div>
      </dl>
    </div>
  );
}
