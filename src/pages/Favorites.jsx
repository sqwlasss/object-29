import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/lib/FavoritesContext";
import { useCurrency } from "@/lib/CurrencyContext";
import { useAllProducts } from "@/hooks/useProducts";
import Seo from "@/components/Seo";
import Navbar from "@/components/ddouble/Navbar";
import Footer from "@/components/ddouble/Footer";
import ProductCard from "@/components/ddouble/ProductCard";
import MetaLabel from "@/components/o29/MetaLabel";

/**
 * Saved works. A transactional surface: bone, ink footer, no colour field and
 * no mark. Previously had no <Seo> block at all, so it inherited whatever the
 * last visited page had written into document.head.
 */
export default function Favorites() {
  const { favorites, favoritesCount } = useFavorites();
  const { country } = useCurrency();
  const { data: allProducts } = useAllProducts(country);

  // Re-resolve saved items against live data so prices and availability are
  // current, falling back to the stored snapshot when a product is gone.
  const liveProducts = useMemo(() => {
    if (!allProducts) return favorites;
    const productMap = new Map(allProducts.map((p) => [p.id, p]));
    return favorites.map((fav) => productMap.get(fav.id) || fav);
  }, [allProducts, favorites]);

  return (
    <div className="o29-field o29-field--bone min-h-screen">
      <Seo
        noindex
        title="Saved — ØBJECT 29"
        description="Objects you have saved."
        canonicalPath="/favorites"
      />
      <Navbar />

      <main id="main" className="pt-header">
        <div className="mx-auto w-full max-w-page px-gutter pb-quiet pt-tight">
          <MetaLabel
            items={["ØBJECT 29", favoritesCount > 0 ? `${favoritesCount} saved` : null]}
            className="text-o29-slate"
          />
          <h1 className="mt-4 font-display text-h1 font-medium text-o29-ink">Saved</h1>

          {favorites.length === 0 ? (
            <div className="py-quiet">
              <p className="max-w-reading text-lead text-o29-ink">
                Nothing saved yet. The heart on any object keeps it here.
              </p>
              <Link
                to="/shop"
                className="o29-meta mt-8 inline-flex min-h-hit items-center border-b border-o29-edge pb-1 text-o29-ink transition-colors duration-instant hover:border-o29-ochre"
              >
                Browse the collection
              </Link>
            </div>
          ) : (
            <div className="mt-tight grid grid-cols-2 gap-x-5 gap-y-20 lg:grid-cols-3">
              {liveProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} showHeart />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer tone="ink" />
    </div>
  );
}
