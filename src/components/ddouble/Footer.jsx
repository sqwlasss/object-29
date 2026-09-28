import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useCollections } from "@/hooks/useProducts";
import { BUSINESS, FORMS_ARE_WIRED } from "@/config/business";
import ColourField from "@/components/o29/ColourField";
import Mark from "@/components/o29/Mark";

const FALLBACK_COLLECTIONS = [
  { label: "Posters", handle: "posters" },
  { label: "Rugs", handle: "rugs" },
  { label: "Room Decor", handle: "room-decor" },
  { label: "Bedding & Pillows", handle: "bedding-pillows" },
];

/**
 * FOOTER BY INTENT, NOT BY CONSTANT.
 *
 * `tone="vermilion"` on pages whose job is seduction (Home, About, Contact);
 * `tone="ink"` on pages whose job is transaction (Shop, Product, Favorites,
 * account, every policy page). That split is what stops red becoming
 * wallpaper — a shopper deep in the catalogue can go a whole session without
 * seeing it, which is exactly why it lands when they do.
 *
 * The small, uncropped Ø29 at the bottom right is the brand's REAL signature —
 * it sits exactly where it sits in the reference artworks. The oversized
 * cropped mark is a different object entirely and appears once in the whole
 * site, on the homepage.
 */
export default function Footer({ tone = "ink" }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { data: collections } = useCollections();

  // Use live collections when available; fall back to hardcoded links while loading.
  const shopLinks = collections?.length
    ? collections.map((c) => ({ label: c.title, handle: c.handle }))
    : FALLBACK_COLLECTIONS;

  // There is no subscribe endpoint. Until FORMS_ARE_WIRED is true this form is
  // not rendered at all, because showing "thank you for subscribing" to
  // someone who was not subscribed is the same class of problem as the
  // invented testimonials. See src/config/business.js.
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!FORMS_ARE_WIRED) return;
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <ColourField as="footer" tone={tone} className="relative overflow-clip">
      <div className="mx-auto w-full max-w-page px-gutter">
        {/* Newsletter and links share one band — stacking them made the footer
            taller than the viewport on short pages. */}
        <div className="grid gap-tight py-tight lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
          <div className="max-w-lead">
            <h2 className="font-display text-h2 font-medium text-field-fg">
              Join the list
            </h2>
            <p className="mt-3 text-sm text-field-muted">
              {FORMS_ARE_WIRED
                ? "New objects, released in small editions. No noise."
                : "New objects, released in small editions. Email us to be added."}
            </p>
            {!FORMS_ARE_WIRED ? (
              <a
                href={`mailto:${BUSINESS.email}`}
                className="o29-meta mt-6 inline-flex min-h-hit items-center border-b border-current pb-1 text-field-fg"
              >
                {BUSINESS.email}
              </a>
            ) : subscribed ? (
              <p className="mt-6 text-sm text-field-fg">Thank you — you&rsquo;re on the list.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-6 flex items-center border-b border-control">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="min-h-hit flex-1 bg-transparent text-sm text-field-fg outline-none placeholder:text-field-muted"
                  required
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="o29-hit flex items-center justify-center text-field-fg transition-opacity duration-instant hover:opacity-60"
                >
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </form>
            )}
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="o29-meta mb-4 text-field-muted">Shop</h3>
            <div className="space-y-1">
              <Link to="/shop" className="flex min-h-hit items-center text-sm text-field-fg transition-opacity duration-instant hover:opacity-60">All objects</Link>
              {shopLinks.map((collection) => (
                <Link
                  key={collection.handle}
                  to={`/shop?category=${collection.handle}`}
                  className="flex min-h-hit items-center text-sm text-field-fg transition-opacity duration-instant hover:opacity-60"
                >
                  {collection.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="o29-meta mb-4 text-field-muted">Info</h3>
            <div className="space-y-1">
              <Link to="/about" className="flex min-h-hit items-center text-sm text-field-fg transition-opacity duration-instant hover:opacity-60">About</Link>
              <Link to="/contact" className="flex min-h-hit items-center text-sm text-field-fg transition-opacity duration-instant hover:opacity-60">Contact</Link>
              <Link to="/faq" className="flex min-h-hit items-center text-sm text-field-fg transition-opacity duration-instant hover:opacity-60">FAQ</Link>
              <a
                href={BUSINESS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-hit items-center text-sm text-field-fg transition-opacity duration-instant hover:opacity-60"
              >
                Instagram
              </a>
            </div>
          </div>
          <div>
            <h3 className="o29-meta mb-4 text-field-muted">Help</h3>
            <div className="space-y-1">
              <Link to="/shipping" className="flex min-h-hit items-center text-sm text-field-fg transition-opacity duration-instant hover:opacity-60">Shipping</Link>
              <Link to="/returns" className="flex min-h-hit items-center text-sm text-field-fg transition-opacity duration-instant hover:opacity-60">Returns</Link>
              <Link to="/faq" className="flex min-h-hit items-center text-sm text-field-fg transition-opacity duration-instant hover:opacity-60">Size guide</Link>
            </div>
          </div>
          <div>
            <h3 className="o29-meta mb-4 text-field-muted">Legal</h3>
            <div className="space-y-1">
              <Link to="/privacy" className="flex min-h-hit items-center text-sm text-field-fg transition-opacity duration-instant hover:opacity-60">Privacy</Link>
              <Link to="/terms" className="flex min-h-hit items-center text-sm text-field-fg transition-opacity duration-instant hover:opacity-60">Terms</Link>
            </div>
          </div>
          </div>
        </div>

        {/* The wordmark, the line, and the signature */}
        <div className="flex flex-wrap items-end justify-between gap-8 border-t border-hairline py-tight">
          <div>
            <p className="font-display text-h1 font-medium leading-none tracking-[-0.028em] text-field-fg">
              ØBJECT&nbsp;29
            </p>
            <p className="o29-meta mt-4 text-field-muted">Art for another reality</p>
          </div>
          <Mark variant="signature" className="ml-auto" />
        </div>

        <div className="flex flex-col items-start justify-between gap-2 border-t border-hairline py-6 md:flex-row md:items-center">
          <p className="o29-meta text-field-muted">© 2026 ØBJECT 29</p>
          <p className="o29-meta text-field-muted">Secure checkout by Shopify</p>
        </div>
      </div>
    </ColourField>
  );
}
