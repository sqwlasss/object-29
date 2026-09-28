import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useFavorites } from "@/lib/FavoritesContext";
import { useCurrency } from "@/lib/CurrencyContext";
import Navbar from "@/components/ddouble/Navbar";
import Footer from "@/components/ddouble/Footer";
import StickyAddToCart from "@/components/ddouble/StickyAddToCart";
import Breadcrumb from "@/components/ddouble/Breadcrumb";
import PdpGallery from "@/components/pdp/PdpGallery";
import PdpBuyBox from "@/components/pdp/PdpBuyBox";
import PdpDetails from "@/components/pdp/PdpDetails";
import PdpRelated from "@/components/pdp/PdpRelated";
import { useProduct, useAllProducts } from "@/hooks/useProducts";
import { useShopifyCart } from "@/hooks/useShopifyCart";
import Seo from "@/components/Seo";
import { useToast } from "@/components/ui/use-toast";
import { trackEvent } from "@/lib/analytics";
import { STORE_CURRENCY } from "@/config/shipping";
import { SITE_URL } from "@/config/site";
import DOMPurify from "dompurify";

const BRAND = "ØBJECT 29";

/**
 * The exhibition page.
 *
 * Bone above the fold — the artwork owns the purchase decision, so there is no
 * colour field, no mark and no editorial metadata up here. The one chromatic
 * moment is the cobalt specification band, below the buy box.
 *
 * All behaviour lives here: option seeding, the variant matcher,
 * handleAddToCart, the GA4 view_item and add_to_cart calls, the DOMPurify
 * config, the JSON-LD builders and the sticky bar's sentinel. Children receive
 * them as props.
 *
 * Keeping state in one place is deliberate: `useShopifyCart` is not a context,
 * so each call site owns an independent cart. Calling it from a child as well
 * as from here would create a second instance and a second network fan-out.
 */
export default function ProductDetail() {
  const { handle } = useParams();
  const { country, formatPrice, currencyCode } = useCurrency();
  const { data: product, isLoading } = useProduct(handle, country);
  const { data: allProducts } = useAllProducts(country);
  const { addItem, loading: cartLoading } = useShopifyCart(country);
  const { toast } = useToast();

  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [heartAnimating, setHeartAnimating] = useState(false);
  const isFav = isFavorite(product?.id);
  const sentinelRef = useRef(null);

  const handleFavorite = (e) => {
    e.preventDefault();
    toggleFavorite(product);
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 350);
  };

  // Seeds EVERY option, including single-value ones the buy box does not
  // render. The matcher below matches on every key of selectedOptions, so a
  // hidden single-value option still has to participate.
  useEffect(() => {
    if (!product) return;
    setSelectedOptions((prev) => {
      const next = { ...prev };
      let changed = false;
      product.options.forEach((opt) => {
        if (!(opt.name in next) && opt.values.length > 0) {
          next[opt.name] = opt.values[0];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    const optionNames = Object.keys(selectedOptions);
    if (optionNames.length === 0) return product.variants[0] || null;
    return product.variants.find((v) =>
      optionNames.every((name) =>
        v.selectedOptions.some((o) => o.name === name && o.value === selectedOptions[name])
      )
    );
  }, [product, selectedOptions]);

  const productSchema = useMemo(() => {
    if (!product) return null;
    const variant = selectedVariant || product.variants[0];
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.description || product.title,
      image: product.image,
      url: `${SITE_URL}/product/${product.handle}`,
      brand: { "@type": "Brand", name: BRAND },
      offers: {
        "@type": "Offer",
        price: variant?.price ?? product.price,
        priceCurrency: STORE_CURRENCY,
        availability: variant?.availableForSale
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: `${SITE_URL}/product/${product.handle}`,
      },
    };
  }, [product, selectedVariant]);

  const breadcrumbJsonLd = useMemo(() => {
    if (!product) return null;
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
        { "@type": "ListItem", position: 3, name: product.title, item: `${SITE_URL}/product/${product.handle}` },
      ],
    };
  }, [product]);

  const related = useMemo(() => {
    if (!allProducts || !product) return [];
    const others = allProducts.filter((p) => p.handle !== product.handle);
    // Products have a tags array but no collectionHandle in the current data,
    // so tag overlap is the cheap same-collection signal (per Task 5.8 brief).
    const sameCollection = others.filter((p) =>
      p.tags?.some((t) => product.tags?.includes(t))
    );
    const rest = others.filter((p) => !sameCollection.includes(p));
    return [
      ...sameCollection.slice(0, 4),
      ...rest.slice(0, 4 - Math.min(sameCollection.length, 4)),
    ];
  }, [allProducts, product]);

  const sanitizedHtml = useMemo(() => {
    if (!product?.descriptionHtml) return "";
    return DOMPurify.sanitize(product.descriptionHtml, {
      ALLOWED_TAGS: ["p", "ul", "ol", "li", "strong", "em", "br", "a"],
      ALLOWED_ATTR: ["href", "target", "rel"],
    }).replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
  }, [product?.descriptionHtml]);

  // GA4: product detail view — fires once per product (PDP mount). Deps keyed
  // on the product identity only, so option/quantity changes don't refire.
  useEffect(() => {
    if (!product) return;
    const price = selectedVariant ? selectedVariant.price : product.price;
    trackEvent("view_item", {
      currency: currencyCode,
      value: price,
      items: [{ item_id: product.handle, item_name: product.title, price }],
    });
  }, [product, currencyCode]);

  if (isLoading) {
    return (
      <div className="o29-field o29-field--bone min-h-screen">
        <Navbar />
        <main id="main" className="mx-auto w-full max-w-page px-gutter pt-header">
          {/* A 1px rule sweeping the container, not a spinner. */}
          <div className="mt-quiet h-px w-full bg-o29-rule">
            <div className="h-px w-full origin-left animate-rule-sweep bg-o29-ink" />
          </div>
          <span className="sr-only">Loading</span>
        </main>
        <Footer tone="ink" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="o29-field o29-field--bone min-h-screen">
        <Navbar />
        <main id="main" className="mx-auto w-full max-w-page px-gutter pt-header text-center">
          <h1 className="mt-quiet font-display text-h2 font-medium text-o29-ink">
            That object isn&rsquo;t here
          </h1>
          <Link
            to="/shop"
            className="o29-meta mt-6 inline-block text-o29-ink underline underline-offset-4"
          >
            Back to the collection
          </Link>
        </main>
        <Footer tone="ink" />
      </div>
    );
  }

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast({
        title: "Select options",
        description: "Please select all product options",
        variant: "destructive",
      });
      return;
    }
    try {
      const optionSummary = Object.values(selectedOptions).join(", ");
      await addItem(selectedVariant.id, quantity);
      trackEvent("add_to_cart", {
        currency: currencyCode,
        value: displayPrice * quantity,
        items: [{
          item_id: product.handle,
          item_name: product.title,
          price: displayPrice,
          quantity,
        }],
      });
      toast({
        title: "Added to cart",
        description: optionSummary ? `${product.title} — ${optionSummary}` : product.title,
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not add to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="o29-field o29-field--bone min-h-screen">
      <Seo
        title={`${product.title} — ${BRAND}`}
        description={(product.description || product.title).slice(0, 155)}
        canonicalPath={`/product/${product.handle}`}
        image={product.image}
        jsonLd={[productSchema, breadcrumbJsonLd]}
      />
      <Navbar />

      <main id="main" className="pt-header">
        <div className="mx-auto w-full max-w-page px-gutter">
          <Breadcrumb items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: product.title },
          ]} />

          {/* Asymmetric: the work takes 62%, the decision 38%. */}
          <div className="flex flex-col gap-tight pt-tight lg:flex-row lg:items-start lg:gap-16">
            <PdpGallery product={product} selectedVariant={selectedVariant} />

            <PdpBuyBox
              product={product}
              selectedVariant={selectedVariant}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              quantity={quantity}
              setQuantity={setQuantity}
              displayPrice={displayPrice}
              formatPrice={formatPrice}
              handleAddToCart={handleAddToCart}
              cartLoading={cartLoading}
              isFav={isFav}
              handleFavorite={handleFavorite}
              heartAnimating={heartAnimating}
              sentinelRef={sentinelRef}
            />
          </div>
        </div>

        <PdpDetails product={product} sanitizedHtml={sanitizedHtml} />

        <PdpRelated related={related} />
      </main>

      <StickyAddToCart
        product={product}
        selectedVariant={selectedVariant}
        selectedOptions={selectedOptions}
        options={product.options}
        displayPrice={displayPrice}
        handleAddToCart={handleAddToCart}
        cartLoading={cartLoading}
        sentinelRef={sentinelRef}
      />

      <Footer tone="ink" />
    </div>
  );
}
