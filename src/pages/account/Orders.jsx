import { Package, ExternalLink, Loader2 } from "lucide-react";
import { useAccount } from "@/lib/AccountContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Price from "@/components/ddouble/Price";
import { shopifyImage } from "@/lib/utils";
import { useCurrency } from "@/lib/CurrencyContext";
import { useShopifyCart } from "@/hooks/useShopifyCart";
import { toast } from "@/components/ui/use-toast";

const STATUS_COLORS = {
  PAID: "text-green-700 bg-green-50",
  PENDING: "text-yellow-700 bg-yellow-50",
  UNFULFILLED: "text-o29-slate bg-o29-bone-2",
  FULFILLED: "text-green-700 bg-green-50",
  CANCELED: "text-red-700 bg-red-50",
  REFUNDED: "text-red-700 bg-red-50",
  PARTIALLY_FULFILLED: "text-blue-700 bg-blue-50",
};

function statusBadge(status) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.UNFULFILLED;
  return (
    <span className={`inline-block px-2 py-0.5 text-[11px] uppercase tracking-[0.05em] ${color}`}>
      {status ? status.replace(/_/g, " ") : "N/A"}
    </span>
  );
}

export default function Orders() {
  const { orders, loading } = useAccount();
  const navigate = useNavigate();
  const { country } = useCurrency();
  const { addItem, loading: cartLoading } = useShopifyCart(country);

  const handleBuyAgain = async (order) => {
    for (const item of order.lineItems) {
      try {
        await addItem(item.variantId, item.quantity);
      } catch {
        // Variants may be inactive; report per-item failures.
        toast({
          title: `Could not re-add ${item.title}`,
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-o29-slate" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package size={40} className="mx-auto text-o29-rule mb-4" />
        <h2 className="font-display text-h3 font-medium text-o29-ink mb-2">No orders yet</h2>
        <p className="text-sm text-o29-slate mb-6">Start shopping to see your order history.</p>
        <Button onClick={() => navigate("/shop")} variant="outline">
          Browse Shop
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-o29-ink mb-6">Order history</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-o29-rule p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-o29-ink">
                  Order {order.name}
                </p>
                <p className="text-xs text-o29-slate mt-1">
                  {new Date(order.processedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium"><Price amount={order.totalPrice} /></p>
                <div className="mt-1">{statusBadge(order.financialStatus)}</div>
              </div>
            </div>

            {order.lineItems.length > 0 && (
              <div className="border-t border-o29-rule pt-4 space-y-3">
                {order.lineItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={shopifyImage(item.image, 160)}
                        alt={item.title}
                        className="w-12 h-14 object-cover bg-o29-bone-2"
                      />
                    ) : (
                      <div className="w-12 h-14 bg-o29-bone-2" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-o29-ink truncate">{item.title}</p>
                      {item.variantTitle && (
                        <p className="text-xs text-o29-slate">{item.variantTitle}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-o29-ink">x{item.quantity}</p>
                      <p className="text-xs text-o29-slate"><Price amount={item.price} /></p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-o29-rule flex items-center justify-between">
              <a
                href={order.statusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-o29-slate hover:text-o29-ink transition-colors"
              >
                View order status
                <ExternalLink size={12} />
              </a>
              {order.lineItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={cartLoading}
                  onClick={() => handleBuyAgain(order)}
                >
                  Buy again
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
