import Reveal from "@/components/motion/Reveal";
import ProductCard from "@/components/ddouble/ProductCard";
import MetaLabel from "@/components/o29/MetaLabel";

/**
 * Related objects, computed from tag overlap by the parent — the normalized
 * product carries `tags` but no collection handle.
 *
 * Renders nothing when there is no overlap rather than padding the row with
 * filler, and uses the same three-up mat-well grid as the catalogue so a
 * related work and a browsed work look identical.
 */
export default function PdpRelated({ related }) {
  if (!related || related.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-page px-gutter py-quiet">
      <MetaLabel items={["ØBJECT 29", "Related"]} className="text-o29-slate" />
      <h2 className="mt-4 font-display text-h2 font-medium text-o29-ink">Other objects</h2>

      <div className="mt-tight grid grid-cols-2 gap-x-5 gap-y-20 lg:grid-cols-3">
        {related.slice(0, 3).map((p, i) => (
          <Reveal key={p.handle} delay={i * 0.07}>
            <ProductCard product={p} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
