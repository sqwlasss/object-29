import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/FavoritesContext";
import Price from "@/components/ddouble/Price";
import PlateWell from "@/components/o29/PlateWell";

/**
 * A work in the hang.
 *
 * Every card is an identical PlateWell — fixed 4:5, object-contain, bone-2
 * ground, one hairline — so a tall work, a wide work and a square work occupy
 * exactly the same footprint and NOTHING IS EVER CROPPED. The previous card
 * used `aspect-[3/4] object-cover`, which cropped the artwork to fit the grid.
 * On a store selling images, that is the one thing a card must not do.
 *
 * No type ever enters the well: no title overlay, no price badge, no scrim, no
 * hover caption. The caption sits below it, and the favourite control sits in
 * the caption row rather than floating over the art on a blurred disc.
 *
 * Motion is the image scale inside the well and nothing else. The card does
 * not shift — a grid of jittering tiles reads as noise, and scannability
 * outranks surprise on the page where people are actually shopping. The shift
 * motif is spent on the editorial collection index instead.
 */
export default function ProductCard({ product, index = 0, showHeart = false }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [animating, setAnimating] = useState(false);
  const isFav = isFavorite(product.id);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 350);
  };

  return (
    <div className="group relative">
      <Link to={`/product/${product.handle}`} className="block">
        <PlateWell
          src={product.image}
          alt={product.imageAlt || product.title}
          width={product.images?.[0]?.width}
          height={product.images?.[0]?.height}
          sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 30vw"
          priority={index < 4}
          hover
        />
        <div className="mt-4 flex items-baseline justify-between gap-3 pr-hit">
          <h3 className="text-sm font-medium text-o29-ink">{product.title}</h3>
          <p className="shrink-0 text-sm text-o29-ink tabular-nums">
            <Price amount={product.price} />
          </p>
        </div>
        {/* Only renders when Shopify actually supplies a product type — this
            line must never carry an invented object number or edition. */}
        {product.productType && (
          <p className="o29-meta mt-1 text-o29-slate">{product.productType}</p>
        )}
      </Link>

      <button
        onClick={handleFavorite}
        className={`absolute bottom-0 right-0 flex h-hit w-hit items-center justify-center text-o29-ink transition-opacity duration-instant ${
          showHeart ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
        }`}
        aria-label={isFav ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`}
        aria-pressed={isFav}
      >
        <Heart
          size={16}
          className={`${animating ? "animate-heart-pop" : ""} ${
            isFav ? "fill-o29-ink text-o29-ink" : "text-o29-slate"
          }`}
        />
      </button>
    </div>
  );
}
