import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { useShopifyCart } from "@/hooks/useShopifyCart";
import { useAuth } from "@/lib/AuthContext";
import { useFavorites } from "@/lib/FavoritesContext";
import { useAllProducts, useCollections } from "@/hooks/useProducts";
import { useCurrency } from "@/lib/CurrencyContext";
import CurrencySelector, { MobileCurrencySelector } from "@/components/ddouble/CurrencySelector";
import Price from "@/components/ddouble/Price";
import CartDrawer from "@/components/ddouble/CartDrawer";
import { shopifyImage } from "@/lib/utils";
import useEscapeClose from "@/hooks/useEscapeClose";
import usePanelFocus from "@/hooks/usePanelFocus";

/**
 * The header.
 *
 * Three structural changes from the previous version, all of them fixes:
 *
 *  1. THE WORDMARK IS IN THE GRID. It used to be
 *     `absolute left-[45%] -translate-x-1/2`, which collided with the nav
 *     links at some viewport widths (and had already been patched once for
 *     mobile). A three-column grid cannot overlap at any width.
 *
 *  2. NO BACKDROP BLUR. The scrolled state was `bg-…/85 backdrop-blur-xl`.
 *     Glassmorphism is out of the system; the header now goes to a solid
 *     field ground with a hairline under it.
 *
 *  3. COLOURS COME FROM THE FIELD. Every colour here is `--fg` / `--bg` /
 *     `--hairline`, so putting `.o29-field--cobalt` on a page root inverts the
 *     whole header for free. This works because this fixed <header> renders
 *     INSIDE each page's root div — do not hoist it above <Routes>.
 *
 * Contact and FAQ moved out of the top bar to keep it uncluttered; both are
 * still linked in the footer and reachable by URL.
 */
const NAV_LINKS = [
  { label: "Shop", path: "/shop" },
  {
    label: "Collections",
    path: "/shop",
    children: [
      { label: "Posters", path: "/shop?category=posters" },
      { label: "Rugs", path: "/shop?category=rugs" },
      { label: "Room Decor", path: "/shop?category=room-decor" },
      { label: "Bedding & Pillows", path: "/shop?category=bedding-pillows" },
    ],
  },
  { label: "About", path: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mobileMenuRef = useRef(null);
  const searchPanelRef = useRef(null);
  const searchToggleRef = useRef(null);
  const { country } = useCurrency();
  const { totalItems } = useShopifyCart(country);
  const { favoritesCount } = useFavorites();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: allProducts } = useAllProducts(country);
  const { data: collections } = useCollections();

  // Build the Collections dropdown from live data; fall back to hardcoded links while loading.
  const navLinks = useMemo(() => {
    if (!collections || collections.length === 0) return NAV_LINKS;
    return NAV_LINKS.map((link) =>
      link.children
        ? {
            ...link,
            children: collections.map((c) => ({
              label: c.title,
              path: `/shop?category=${c.handle}`,
            })),
          }
        : link
    );
  }, [collections]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !allProducts) return [];
    const q = searchQuery.toLowerCase();
    return allProducts
      .filter((p) => p.title.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery, allProducts]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setCollectionsOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Panel keyboard behavior: Escape closes; focus moves into the panel on
  // open and back to the trigger on close (CartDrawer/filter sheet get this
  // from Radix Dialog already).
  const saveMobileMenuFocus = usePanelFocus(mobileOpen, mobileMenuRef);
  const saveSearchFocus = usePanelFocus(searchOpen, searchPanelRef);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const toggleMobileMenu = () => {
    saveMobileMenuFocus();
    setMobileOpen((prev) => !prev);
  };

  const toggleSearch = () => {
    saveSearchFocus();
    setSearchOpen((prev) => !prev);
  };

  // Hover/click mega menu: keep open while focus is inside (React's onBlur
  // bubbles, so only close when focus leaves the whole menu subtree).
  const handleMegaBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setMegaOpen(false);
  };

  const closeMegaMenu = () => {
    setMegaOpen(false);
  };

  useEscapeClose(mobileOpen, () => setMobileOpen(false));
  useEscapeClose(searchOpen, closeSearch);
  useEscapeClose(megaOpen, closeMegaMenu);

  useEffect(() => {
    if (!searchOpen) return;
    const handleMouseDown = (e) => {
      if (
        searchPanelRef.current &&
        !searchPanelRef.current.contains(e.target) &&
        searchToggleRef.current &&
        !searchToggleRef.current.contains(e.target)
      ) {
        closeSearch();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [searchOpen]);

  const navLinkClass =
    "o29-meta text-field-fg transition-opacity duration-instant hover:opacity-60";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-curtain ${
          scrolled || searchOpen || mobileOpen
            ? "bg-field shadow-[0_1px_0_0_var(--hairline)]"
            : "bg-transparent"
        }`}
      >
        <a
          href="#main"
          className="o29-meta sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:bg-o29-ink focus:px-4 focus:py-2 focus:text-o29-bone"
        >
          Skip to content
        </a>
        <nav className="mx-auto w-full max-w-page px-gutter">
          {/* Three columns: the wordmark can never collide with the links. */}
          <div className="grid h-header grid-cols-[auto_1fr_auto] items-center gap-4">
            {/* Left: wordmark */}
            <Link
              to="/"
              className="flex min-h-hit items-center font-display text-sm font-medium tracking-[0.12em] text-field-fg md:text-base"
              aria-label="ØBJECT 29 — home"
            >
              ØBJECT&nbsp;29
            </Link>

            {/* Centre: desktop nav */}
            <div className="hidden items-center gap-8 justify-self-center lg:flex">
              {navLinks.map((link) =>
                link.children ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setMegaOpen(true)}
                    onMouseLeave={() => setMegaOpen(false)}
                    onFocus={() => setMegaOpen(true)}
                    onBlur={handleMegaBlur}
                  >
                    <button
                      onClick={() => setMegaOpen(!megaOpen)}
                      className={navLinkClass}
                      aria-haspopup="true"
                      aria-expanded={megaOpen}
                    >
                      {link.label}
                    </button>
                    {megaOpen && (
                      <div className="absolute left-1/2 top-full -translate-x-1/2 pt-4">
                        <div className="o29-field o29-field--bone min-w-[220px] border border-hairline p-6">
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              to={child.path}
                              className="block py-2 text-sm text-o29-slate transition-colors duration-instant hover:text-o29-ink"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link key={link.label} to={link.path} className={navLinkClass}>
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* Right: actions */}
            <div className="flex items-center justify-end gap-1 md:gap-4">
              <div className="hidden md:block">
                <CurrencySelector />
              </div>
              <button
                ref={searchToggleRef}
                onClick={toggleSearch}
                className="o29-hit flex items-center justify-center text-field-fg transition-opacity duration-instant hover:opacity-60"
                aria-label="Search"
                aria-expanded={searchOpen}
              >
                <Search size={18} aria-hidden="true" />
              </button>
              <Link
                to="/favorites"
                className="o29-hit relative hidden items-center justify-center text-field-fg transition-opacity duration-instant hover:opacity-60 md:flex"
                aria-label={favoritesCount > 0 ? `Favorites, ${favoritesCount} saved` : "Favorites"}
              >
                <Heart size={18} aria-hidden="true" />
                {favoritesCount > 0 && (
                  <span className="o29-meta absolute right-1 top-1 tabular-nums text-field-fg">
                    {favoritesCount}
                  </span>
                )}
              </Link>
              <Link
                to={isAuthenticated ? "/account" : "/login"}
                className="o29-hit hidden items-center justify-center text-field-fg transition-opacity duration-instant hover:opacity-60 md:flex"
                aria-label={isAuthenticated ? "Account" : "Log in"}
              >
                <User size={18} aria-hidden="true" />
              </Link>
              {/* The cart is words, not a bag: it is the one control that must
                  never be ambiguous, and the count reads at a glance. */}
              <button
                onClick={() => setCartOpen(true)}
                className="o29-meta o29-hit flex items-center justify-center whitespace-nowrap px-1 text-field-fg tabular-nums transition-opacity duration-instant hover:opacity-60"
                aria-label={`Cart, ${totalItems} ${totalItems === 1 ? "item" : "items"}`}
              >
                <span aria-hidden="true">
                  Cart (<span aria-live="polite">{totalItems}</span>)
                </span>
              </button>
              <button
                onClick={toggleMobileMenu}
                className="o29-hit flex items-center justify-center text-field-fg lg:hidden"
                aria-label="Menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div ref={searchPanelRef} className="relative border-t border-hairline py-4">
              <div className="flex items-center gap-3">
                <Search size={16} aria-hidden="true" className="shrink-0 text-field-muted" />
                <input
                  type="text"
                  placeholder="Search the collection…"
                  className="w-full bg-transparent text-sm text-field-fg outline-none placeholder:text-field-muted"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
                      closeSearch();
                    }
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="o29-hit -m-2 flex items-center justify-center text-field-muted hover:text-field-fg"
                    aria-label="Clear search"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
              {!searchQuery.trim() && (
                <div className="mt-3 border-t border-hairline pt-3">
                  <p className="o29-meta mb-2 text-field-muted">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {["Poster", "Rug", "Bedding"].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="o29-hit flex items-center justify-center border border-control px-3 text-xs text-field-fg transition-colors duration-instant hover:bg-o29-bone-2"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-hairline pt-3">
                  {searchResults.map((product) => (
                    <Link
                      key={product.handle}
                      to={`/product/${product.handle}`}
                      onClick={closeSearch}
                      className="-mx-2 flex items-center gap-3 px-2 py-2 transition-colors duration-instant hover:bg-o29-bone-2"
                    >
                      <img
                        src={shopifyImage(product.image, 160)}
                        alt=""
                        className="h-12 w-12 bg-o29-bone-2 object-contain"
                        loading="lazy"
                      />
                      <span className="flex-1 text-sm text-field-fg">{product.title}</span>
                      <span className="o29-meta tabular-nums text-field-muted">
                        <Price amount={product.price} />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {searchQuery.trim() && searchResults.length === 0 && (
                <p className="mt-3 text-xs text-field-muted">
                  No results for &lsquo;{searchQuery}&rsquo; — try{" "}
                  <button
                    onClick={() => setSearchQuery("Poster")}
                    className="text-field-fg underline underline-offset-2"
                  >
                    Poster
                  </button>
                </p>
              )}
            </div>
          )}
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            ref={mobileMenuRef}
            tabIndex={-1}
            className="o29-field o29-field--ink fixed inset-x-0 bottom-0 top-header z-40 overflow-y-auto overscroll-contain border-t border-hairline lg:hidden"
          >
            <div className="min-h-full px-gutter py-8">
              <div className="space-y-1">
                {navLinks.map((link) =>
                  link.children ? (
                    <div key={link.label}>
                      <button
                        onClick={() => setCollectionsOpen(!collectionsOpen)}
                        className="flex min-h-hit w-full items-center justify-between text-h3 text-field-fg"
                        aria-expanded={collectionsOpen}
                      >
                        {link.label}
                        <ChevronDown
                          size={16}
                          aria-hidden="true"
                          className={`transition-transform duration-shift ${collectionsOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-curtain ${
                          collectionsOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="space-y-1 pb-2 pl-4">
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              to={child.path}
                              className="flex min-h-hit items-center text-sm text-field-muted"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.path}
                      className="flex min-h-hit items-center text-h3 text-field-fg"
                    >
                      {link.label}
                    </Link>
                  )
                )}
                <Link to="/favorites" className="flex min-h-hit items-center text-h3 text-field-fg">
                  Favorites{favoritesCount > 0 ? ` (${favoritesCount})` : ""}
                </Link>
                <Link
                  to={isAuthenticated ? "/account" : "/login"}
                  className="flex min-h-hit items-center text-h3 text-field-fg"
                >
                  {isAuthenticated ? "Account" : "Log in"}
                </Link>
              </div>

              <div className="mt-8 border-t border-hairline pt-6">
                <MobileCurrencySelector />
              </div>

              <p className="o29-meta mt-12 text-field-muted">
                ØBJECT 29 / Art for another reality
              </p>
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
