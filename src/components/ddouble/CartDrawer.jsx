import { X, Minus, Plus } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useShopifyCart } from "@/hooks/useShopifyCart";
import { useCurrency } from "@/lib/CurrencyContext";
import Price from "@/components/ddouble/Price";
import { FREE_SHIPPING_THRESHOLD, shippingProgress } from "@/config/shipping";
import { Link } from "react-router-dom";
import { shopifyImage } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

/**
 * The cart is deliberately the least art-directed surface in the system.
 *
 * Bone and ink, no colour field, no mark, no metadata, no motion beyond the
 * drawer sliding in. Nothing between "I want this" and "I paid" moves or gets
 * decorated — the brief is explicit that checkout must not be surreal, and a
 * shopper counting line items does not want personality.
 */
export default function CartDrawer({ open, onClose }) {
  const { country, currencyCode } = useCurrency();
  const { items, updateQuantity, removeItem, totalItems, totalPrice, checkout, loading } = useShopifyCart(country);
  const { remaining, percent } = shippingProgress(totalPrice, FREE_SHIPPING_THRESHOLD);

  // These two handlers were inline closures in the JSX below. They carry the
  // only remove_from_cart and begin_checkout calls in the app, and trackEvent
  // no-ops without consent — so a dropped call is indistinguishable from a
  // visitor who declined cookies and will never surface in local testing.
  // Named here so a markup rewrite cannot delete them by accident.
  const handleRemove = async (item) => {
    await removeItem(item.id);
    trackEvent("remove_from_cart", {
      currency: currencyCode,
      value: parseFloat(item.price) * item.quantity,
      items: [{
        item_id: item.handle,
        item_name: item.title,
        price: parseFloat(item.price),
        quantity: item.quantity,
      }],
    });
  };

  const handleCheckout = () => {
    // purchase requires server-side confirmation (not implemented — client-only begin_checkout)
    trackEvent("begin_checkout", {
      currency: currencyCode,
      value: totalPrice,
      items: items.map((i) => ({
        item_id: i.handle,
        item_name: i.title,
        price: parseFloat(i.price),
        quantity: i.quantity,
      })),
    });
    checkout();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-o29-ink/30" onClick={onClose} />
        <Dialog.Content
          className="o29-field o29-field--bone fixed bottom-0 right-0 top-0 z-[60] flex w-full max-w-md flex-col border-l border-hairline focus:outline-none"
          aria-labelledby="cart-heading"
          aria-modal="true"
        >
          <div className="flex items-center justify-between border-b border-hairline px-gutter py-4">
            <Dialog.Title id="cart-heading" className="o29-meta tabular-nums text-o29-ink">
              Cart ({totalItems})
            </Dialog.Title>
            <button
              onClick={onClose}
              className="o29-hit -mr-3 flex items-center justify-center text-o29-slate transition-colors duration-instant hover:text-o29-ink"
              aria-label="Close cart"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-gutter py-6">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <p className="text-sm text-o29-slate">Your cart is empty</p>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="o29-meta text-o29-ink underline underline-offset-4"
                >
                  Browse the collection
                </Link>
              </div>
            ) : (
              <ul className="space-y-6">
                {items.map((item) => {
                  const linePrice = item.price * item.quantity;
                  return (
                    <li key={item.id} className="flex gap-4">
                      <Link to={`/product/${item.handle}`} onClick={onClose} className="shrink-0">
                        <img
                          src={shopifyImage(item.image, 240)}
                          alt=""
                          className="h-24 w-20 bg-o29-bone-2 object-contain p-1"
                          loading="lazy"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/product/${item.handle}`}
                            onClick={onClose}
                            className="truncate pr-2 text-sm font-medium text-o29-ink transition-opacity duration-instant hover:opacity-60"
                          >
                            {item.title}
                          </Link>
                          <button
                            onClick={() => handleRemove(item)}
                            className="o29-hit -m-2 flex shrink-0 items-center justify-center text-o29-slate transition-colors duration-instant hover:text-o29-vermilion"
                            aria-label={`Remove ${item.title} from cart`}
                          >
                            <X size={14} aria-hidden="true" />
                          </button>
                        </div>
                        {item.selectedOptions && (
                          <p className="o29-meta mt-1 text-o29-slate">
                            {item.selectedOptions.map((o) => o.value).join(" / ")}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center border border-o29-edge">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="o29-hit flex items-center justify-center px-3 text-o29-slate transition-colors duration-instant hover:text-o29-ink"
                              aria-label={`Decrease quantity of ${item.title}`}
                            >
                              <Minus size={14} aria-hidden="true" />
                            </button>
                            <span className="w-6 text-center text-xs tabular-nums text-o29-ink">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="o29-hit flex items-center justify-center px-3 text-o29-slate transition-colors duration-instant hover:text-o29-ink"
                              aria-label={`Increase quantity of ${item.title}`}
                            >
                              <Plus size={14} aria-hidden="true" />
                            </button>
                          </div>
                          <span className="text-sm font-medium tabular-nums text-o29-ink">
                            <Price amount={linePrice} />
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div
              className="border-t border-hairline px-gutter py-5"
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              {remaining > 0 ? (
                <div className="mb-5">
                  <p className="o29-meta text-o29-slate">
                    <Price amount={remaining} /> from free shipping
                  </p>
                  <div className="mt-2 h-px bg-o29-rule">
                    <div
                      className="h-px bg-o29-ochre transition-[width] duration-curtain"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="o29-meta mb-5 text-o29-ink">Free shipping unlocked</p>
              )}

              <div className="flex items-baseline justify-between">
                <span className="o29-meta text-o29-slate">Subtotal</span>
                <span className="text-h3 font-medium tabular-nums text-o29-ink">
                  <Price amount={totalPrice} />
                </span>
              </div>
              <p className="o29-meta mt-2 text-o29-slate">
                Shipping and taxes calculated at checkout
              </p>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="o29-meta o29-hit mt-5 w-full bg-o29-ink text-o29-bone transition-colors duration-instant hover:bg-o29-cobalt disabled:bg-o29-bone-2 disabled:text-o29-slate"
              >
                {loading ? "Loading…" : "Checkout"}
              </button>
              <p className="o29-meta mt-3 text-center text-o29-slate">
                Secure checkout by Shopify
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
