import ColourField from "@/components/o29/ColourField";
import MetaLabel from "@/components/o29/MetaLabel";
import Price from "@/components/ddouble/Price";
import { FREE_SHIPPING_THRESHOLD } from "@/config/shipping";

/**
 * The specification band — the single chromatic moment on a product page, and
 * deliberately placed BELOW the buy box. The artwork and the purchase decision
 * own everything above the fold; this is what you read once you have decided.
 *
 * WHAT WAS DELETED HERE, AND WHY
 *
 * This replaces four accordions, two of which were fabricated. "Materials"
 * claimed "Premium cotton blend / Soft-touch fabric"; "Care Instructions"
 * said "Machine wash cold / Hang dry / Iron on low heat". Both rendered
 * identically on every product, on a store selling posters, rugs, room decor
 * and bedding — so a buyer looking at a print was told to tumble-dry it.
 *
 * The fix is not better fixed copy. Writing "museum-grade archival paper"
 * instead would be the same fabrication in a nicer costume. Everything below
 * resolves to a real Shopify field or to src/config/shipping.js, and renders
 * nothing when there is nothing to say. When the catalogue carries real
 * material data — a metafield, a richer description — it belongs here.
 *
 * The accordions also went: their open height was measured with
 * `scrollHeight` into an inline max-height, which is exactly the kind of
 * JS-measured layout that strands content when a transition does not fire.
 * A two-column spread needs no measurement.
 */
export default function PdpDetails({ product, sanitizedHtml }) {
  const specs = [
    product.productType ? { label: "Type", value: product.productType } : null,
    ...(product.options || [])
      .filter((o) => o.values.length > 0)
      .map((o) => ({ label: o.name, value: o.values.join(" · ") })),
  ].filter(Boolean);

  return (
    <ColourField tone="cobalt" className="mt-quiet py-quiet">
      <div className="mx-auto w-full max-w-page px-gutter">
        <MetaLabel items={["ØBJECT 29", "Specification"]} />

        <div className="mt-tight grid gap-tight lg:grid-cols-2 lg:gap-16">
          {/* The description, straight from Shopify. Sanitised upstream. */}
          {sanitizedHtml ? (
            <div
              className="max-w-reading text-base leading-relaxed text-field-fg [&_a]:underline [&_a]:underline-offset-4 [&_li]:mb-1 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <div />
          )}

          <dl className="space-y-0">
            {specs.map((s) => (
              <div
                key={s.label}
                className="flex justify-between gap-6 border-b border-hairline py-4"
              >
                <dt className="o29-meta text-field-muted">{s.label}</dt>
                <dd className="text-right text-sm text-field-fg">{s.value}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-6 border-b border-hairline py-4">
              <dt className="o29-meta text-field-muted">Shipping</dt>
              <dd className="text-right text-sm text-field-fg">
                Free over <Price amount={FREE_SHIPPING_THRESHOLD} />, tracked
              </dd>
            </div>
            <div className="flex justify-between gap-6 border-b border-hairline py-4">
              <dt className="o29-meta text-field-muted">Dispatch</dt>
              <dd className="text-right text-sm text-field-fg">1–2 business days</dd>
            </div>
            <div className="flex justify-between gap-6 border-b border-hairline py-4">
              <dt className="o29-meta text-field-muted">Returns</dt>
              <dd className="text-right text-sm text-field-fg">30 days from delivery</dd>
            </div>
          </dl>
        </div>
      </div>
    </ColourField>
  );
}
