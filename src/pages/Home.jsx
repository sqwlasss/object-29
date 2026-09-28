import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Navbar from "@/components/ddouble/Navbar";
import Footer from "@/components/ddouble/Footer";
import Reveal from "@/components/motion/Reveal";
import ProductCard from "@/components/ddouble/ProductCard";
import MetaLabel from "@/components/o29/MetaLabel";
import Mark from "@/components/o29/Mark";
import HeroRoom from "@/components/home/HeroRoom";
import CollectionIndex from "@/components/home/CollectionIndex";
import { useCurrency } from "@/lib/CurrencyContext";
import { useCollections, useCollectionProducts, useProduct } from "@/hooks/useProducts";
import { HERO, INDEX } from "@/config/editorial";

/**
 * TWO BRAND COLOURS ON THIS PAGE, COUNTED: cobalt (the hero wall) and
 * vermilion (the doorway band and the footer). Ink and bone are structural and
 * do not count. There is no third saturated ground — the homepage gets no
 * exemption from the rule that governs every other page.
 *
 * Everything that is not the hero or the footer is a bone room, and the
 * quiet is the point: it is what makes the two colour events land.
 *
 * Deleted here, deliberately:
 *  - three invented customer testimonials with names and cities
 *  - a scrim banner with white type over a photograph
 *  - the "Live with art" lifestyle grid and the Instagram strip, both built
 *    from the previous brand's stock photography
 *  - all seven assets/ imports, along with the files
 */
export default function Home() {
  const { country } = useCurrency();
  const { data: collections } = useCollections();

  // The hero artwork resolves through editorial.js: a pinned handle, else the
  // first product of a nominated collection, else the first collection.
  // `useProduct` is gated on `enabled: !!handle`, so an unset handle no-ops
  // rather than firing a query guaranteed to miss.
  const { data: pinned, isLoading: pinnedLoading } = useProduct(HERO.productHandle, country);
  const fallbackHandle = HERO.fallbackCollection || collections?.[0]?.handle;
  const { data: heroCollection, isLoading: collectionLoading } = useCollectionProducts(
    HERO.productHandle ? null : fallbackHandle,
    country
  );
  const heroProduct = pinned || heroCollection?.products?.[0] || null;
  const heroLoading = HERO.productHandle ? pinnedLoading : collectionLoading;

  // The featured row reuses the first collection's products — no extra query
  // beyond the one the hero already made.
  const featured = heroCollection?.products?.slice(0, 3) ?? [];

  return (
    <div className="o29-field o29-field--bone min-h-screen">
      <Seo
        title="ØBJECT 29 — Art for another reality"
        description="Contemporary surreal art and wall art. Impossible rooms, oversized objects and altered realities, printed as collectible editions."
        canonicalPath="/"
      />
      <Navbar />

      <main id="main" className="pt-header">
        <HeroRoom product={heroProduct} isLoading={heroLoading} />

        {/* ── the hold: bone, and a lot of it ─────────────────────────── */}
        <section className="mx-auto w-full max-w-page px-gutter py-hold">
          <Reveal>
            <MetaLabel items={["Index", "Collections"]} className="text-o29-slate" />
            <h2 className="mb-tight mt-6 max-w-lead font-display text-h2 font-medium text-o29-ink">
              Every object begins somewhere that could not exist.
            </h2>
          </Reveal>
          <Reveal delay={0.07}>
            <CollectionIndex collections={collections ?? []} limit={INDEX.limit} />
          </Reveal>
        </section>

        {/* ── featured objects ────────────────────────────────────────── */}
        {featured.length > 0 && (
          <section className="mx-auto w-full max-w-page px-gutter pb-hold">
            <Reveal>
              <div className="mb-tight flex flex-wrap items-end justify-between gap-4">
                <div>
                  <MetaLabel items={["Selected", heroCollection?.title]} className="text-o29-slate" />
                  <h2 className="mt-4 font-display text-h2 font-medium text-o29-ink">
                    Recent objects
                  </h2>
                </div>
                <Link
                  to="/shop"
                  className="o29-meta flex min-h-hit items-center text-o29-ink underline underline-offset-4 decoration-o29-edge transition-colors duration-instant hover:decoration-o29-ochre"
                >
                  All objects
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-5 gap-y-20 lg:grid-cols-3">
              {featured.map((p, i) => (
                <Reveal key={p.handle} delay={i * 0.07}>
                  <ProductCard product={p} index={i} />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ── the one oversized cropped mark in the entire site ───────── */}
        <section className="relative overflow-clip">
          <div className="mx-auto w-full max-w-page px-gutter pb-hold">
            <Reveal>
              <div className="relative">
                <Mark
                  variant="cropped"
                  className="block -translate-x-[18%] text-o29-bone-2"
                />
                <p className="mt-tight max-w-lead text-lead text-o29-ink">
                  ØBJECT 29 makes images of rooms that cannot be entered, objects
                  that refuse their own scale, and light that arrives from the
                  wrong direction. Each one is printed as an open edition.
                </p>
                <Link
                  to="/about"
                  className="o29-meta mt-8 inline-flex min-h-hit items-center border-b border-o29-edge pb-1 text-o29-ink transition-colors duration-instant hover:border-o29-ochre"
                >
                  The manifesto
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Vermilion: this page's job is seduction, not transaction. */}
      <Footer tone="vermilion" />
    </div>
  );
}
