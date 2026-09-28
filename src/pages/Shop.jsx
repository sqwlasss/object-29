import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/ddouble/Navbar";
import Footer from "@/components/ddouble/Footer";
import ProductCard from "@/components/ddouble/ProductCard";
import Reveal from "@/components/motion/Reveal";
import Breadcrumb from "@/components/ddouble/Breadcrumb";
import ColourField from "@/components/o29/ColourField";
import MetaLabel from "@/components/o29/MetaLabel";
import { useCurrency } from "@/lib/CurrencyContext";
import { trackEvent } from "@/lib/analytics";
import { STORE_COUNTRY } from "@/config/shipping";

import { useAllProductsPage, useCollections, useCollectionProducts } from "@/hooks/useProducts";
import useEscapeClose from "@/hooks/useEscapeClose";
import usePanelFocus from "@/hooks/usePanelFocus";

const SORT_OPTIONS = [
  { id: "default", label: "Default" },
  { id: "price-asc", label: "Price ↑" },
  { id: "price-desc", label: "Price ↓" },
  { id: "alpha", label: "A–Z" },
];

// True below the Tailwind `md` breakpoint (768px). Inline per brief — the
// shared use-mobile.jsx hook was deleted in Part 1 and is not recreated.
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

/**
 * The catalogue grid.
 *
 * Two deliberate departures from a default commerce grid:
 *
 *  - THREE UP AT LARGE WIDTHS, not four. Fewer, larger plates read as a hang
 *    rather than a search-results page.
 *  - A 4:1 ROW-TO-COLUMN GAP RATIO (20px / 80px). This is the single
 *    highest-leverage move away from the default Shopify look: tight columns
 *    and generous air between rows make the grid read as an editorial spread.
 *
 * THE VOID: one cell per grid is deliberately left empty, carrying a metadata
 * line so it never reads as a failed image. It is rendered as a SIBLING of the
 * mapped items and placed into the last column track — never inside
 * `filtered.map()`. That array feeds the view_item_list payload, the Reveal
 * stagger index and the pagination dedupe Map; injecting a non-product into it
 * corrupts all three.
 */
function ProductGrid({ products, loading, error, refetch, sort, priceRange, searchQuery, clearFilters, category }) {
  const { currencyCode } = useCurrency();
  const lastListKeyRef = useRef(null);
  const filtered = useMemo(() => {
    let result = [...(products || [])];

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q));
    }

    if (priceRange !== "all") {
      const range = PRICE_RANGES.find((r) => r.id === priceRange);
      result = result.filter((p) => p.price >= range.min && p.price < range.max);
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "alpha":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // "default": Shopify query order (insertion order). createdAt is not
        // exposed by the storefront queries, so no date-based sort is applied.
        break;
    }

    return result;
  }, [products, priceRange, sort, searchQuery]);

  // GA4: view_item_list fires once per filter-set change (category/price/sort/
  // search), never per pagination page. Skipped while loading or when the
  // filtered set is empty, so only real product lists are reported.
  useEffect(() => {
    const key = [category, priceRange, sort, searchQuery].join("|");
    if (key === lastListKeyRef.current) return;
    if (loading || filtered.length === 0) return;
    lastListKeyRef.current = key;
    trackEvent("view_item_list", {
      currency: currencyCode,
      item_list_id: category === "all" ? "shop-all" : `collection-${category}`,
      items: filtered.map((p) => ({
        item_id: p.handle,
        item_name: p.title,
        price: p.price,
      })),
    });
  }, [category, priceRange, sort, searchQuery, loading, filtered, currencyCode]);

  const gridClass = "grid grid-cols-2 gap-x-5 gap-y-20 lg:grid-cols-3";

  if (loading) {
    return (
      <div className={gridClass}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-plate bg-o29-bone-2" />
            <div className="h-4 w-3/4 bg-o29-bone-2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-quiet text-center">
        <p className="text-sm text-o29-slate">Something went wrong loading the collection.</p>
        <button
          onClick={refetch}
          className="o29-meta o29-hit mt-4 text-o29-ink underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="py-quiet text-center">
        <p className="text-sm text-o29-slate">Nothing matches those filters.</p>
        <button
          onClick={clearFilters}
          className="o29-meta o29-hit mt-4 text-o29-ink underline underline-offset-4"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {filtered.map((product, i) => (
        <Reveal key={product.handle} delay={i * 0.07}>
          <ProductCard product={product} index={i} />
        </Reveal>
      ))}

      {/* The void — a sibling, never a member of `filtered`. Placed into the
          last column track so it always lands at the end of a row, and only
          once the grid is big enough that a gap reads as intent. */}
      {filtered.length >= 8 && (
        <div
          aria-hidden="true"
          className="hidden lg:flex lg:[grid-column:-2/-1] lg:aspect-plate lg:items-end"
        >
          <MetaLabel items={["Ø29", "Space intentionally left"]} className="text-o29-slate" />
        </div>
      )}
    </div>
  );
}

function CollectionProducts({ collectionHandle, priceRange, sort, searchQuery, clearFilters, country, onCountChange, onLoadingChange, category }) {
  const { data, isLoading, error, refetch } = useCollectionProducts(collectionHandle, country);
  const products = data?.products || [];

  useEffect(() => {
    onCountChange(products.length);
    onLoadingChange(isLoading);
  }, [products.length, isLoading, onCountChange, onLoadingChange]);

  return (
    <ProductGrid
      products={products}
      loading={isLoading}
      error={error}
      refetch={refetch}
      sort={sort}
      priceRange={priceRange}
      searchQuery={searchQuery}
      clearFilters={clearFilters}
      category={category}
    />
  );
}

const PRICE_RANGES = [
  { id: "all", label: "All prices", min: 0, max: Infinity },
  { id: "under-30", label: "Under 30", min: 0, max: 30 },
  { id: "30-50", label: "30 – 50", min: 30, max: 50 },
  { id: "over-50", label: "Over 50", min: 50, max: Infinity },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { country } = useCurrency();

  const category = searchParams.get("category") || "all";
  const priceRange = searchParams.get("price") || "all";
  const sort = searchParams.get("sort") || "default";
  const searchQuery = searchParams.get("q") || "";
  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterPanelRef = useRef(null);
  const [collectionCount, setCollectionCount] = useState(0);
  const [collectionLoading, setCollectionLoading] = useState(true);
  // Pagination for the "all" view: pages are accumulated from useAllProductsPage
  // and keyed by STORE_COUNTRY so a storefront switch resets cursor/pages without ever
  // firing a stale-cursor query for the new country.
  const [pagination, setPagination] = useState({ country: STORE_COUNTRY, cursor: null, pages: [], hasMore: false });

  const updateParam = (key, value, mode = "replace") => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    setSearchParams(params, { replace: mode === "replace" });
  };

  const saveFilterFocus = usePanelFocus(filtersOpen, filterPanelRef);
  const toggleFilters = () => {
    saveFilterFocus();
    setFiltersOpen((prev) => !prev);
  };
  useEscapeClose(filtersOpen, () => setFiltersOpen(false));

  const { data: pageData, isPending, isFetching, error, refetch } = useAllProductsPage(
    country,
    pagination.country === STORE_COUNTRY ? pagination.cursor : null,
    { enabled: category === "all" }
  );
  const pageInfo = pageData?.pageInfo;
  const { data: collections } = useCollections();

  // Derived state: when the storefront changes, treat pagination as reset so
  // the grid never shows the previous country's accumulated list.
  const current =
    pagination.country === STORE_COUNTRY
      ? pagination
      : { country: STORE_COUNTRY, cursor: null, pages: [], hasMore: false };
  const pages = current.pages;
  const hasMore = current.hasMore;
  // Skeleton only while the first page is loading; "Load more" fetches keep
  // the already-accumulated grid visible.
  const allLoading = isPending && pages.length === 0;

  // Append each fetched page to the accumulated list, deduping by product id.
  // A country change replaces the list instead of appending to the old one.
  useEffect(() => {
    if (!pageData?.products) return;
    setPagination((prev) => {
      if (prev.country !== STORE_COUNTRY) {
        return { country: STORE_COUNTRY, cursor: null, pages: pageData.products, hasMore: pageData.pageInfo.hasNextPage };
      }
      const map = new Map(prev.pages.map((p) => [p.id, p]));
      for (const p of pageData.products) map.set(p.id, p);
      return { ...prev, pages: [...map.values()], hasMore: pageData.pageInfo.hasNextPage };
    });
  }, [pageData]);

  const loadMore = () => {
    if (pageInfo?.hasNextPage) {
      setPagination((prev) => ({ ...prev, cursor: pageInfo.endCursor }));
    }
  };

  const categoryCollections = useMemo(() => collections || [], [collections]);

  const activeFilters = [category, priceRange].filter((f) => f !== "all").length;

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    params.delete("price");
    params.delete("q");
    setSearchParams(params, { replace: true });
  };

  const activeCollection = categoryCollections.find((c) => c.handle === category);
  const title = searchQuery
    ? `Results for “${searchQuery}”`
    : activeCollection
      ? activeCollection.title
      : "The collection";
  const count = category === "all" ? pages.length : collectionCount;
  const countLoading = category === "all" ? allLoading : collectionLoading;

  const filterGroups = (
    <>
      <FilterGroup
        label="Collection"
        options={[{ handle: "all", title: "All" }, ...categoryCollections]}
        value={category}
        onChange={(cat) => updateParam("category", cat, "push")}
      />
      <FilterGroup
        label="Price"
        options={PRICE_RANGES.map((r) => ({ handle: r.id, title: r.label }))}
        value={priceRange}
        onChange={(r) => updateParam("price", r, "replace")}
      />
    </>
  );

  return (
    <div className="o29-field o29-field--bone min-h-screen">
      <Seo
        title={activeCollection ? `${activeCollection.title} — ØBJECT 29` : "The Collection — ØBJECT 29"}
        description="Contemporary surreal art and wall art, printed as collectible editions."
        canonicalPath={category !== "all" ? `/shop?category=${category}` : "/shop"}
      />
      <Navbar />

      {/* `pt-header` sits on <main>, not on the band. The fixed header is
          transparent until scrolled and inherits its colours from the PAGE
          ROOT field (bone → ink type). If a cobalt band extended up behind it,
          the nav would render ink-on-cobalt at 1.70:1 — which this system
          forbids outright. Colour fields therefore start BELOW the chrome. */}
      <main id="main" className="pt-header">
        {/* The masthead: the one colour field on this page, and the only place
            Shop is allowed to raise its voice. Everything below is bone so the
            artwork owns the rest of the screen. */}
        <ColourField
          tone="cobalt"
          className="flex items-end pb-tight pt-tight"
          style={{ minHeight: "clamp(18svh, 22svh, 30svh)" }}
        >
          <div className="mx-auto w-full max-w-page px-gutter">
            <MetaLabel
              items={[
                "ØBJECT 29",
                countLoading ? null : `${count} ${count === 1 ? "object" : "objects"}`,
              ]}
            />
            <h1 className="mt-4 font-display text-h1 font-medium text-field-fg">{title}</h1>
          </div>
        </ColourField>

        <div className="mx-auto w-full max-w-page px-gutter pb-quiet">
          {category !== "all" && activeCollection && (
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/shop" },
                { label: activeCollection.title },
              ]}
            />
          )}

          {/* Filter bar — text and rules, no chrome. */}
          <div className="mb-tight flex flex-wrap items-center justify-between gap-4 border-b border-hairline pt-tight">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleFilters}
                className="o29-meta o29-hit flex items-center gap-2 text-o29-ink"
                aria-expanded={filtersOpen}
              >
                {activeFilters > 0 && (
                  <span aria-hidden="true" className="h-2 w-2 bg-o29-ochre" />
                )}
                Filter
              </button>
              {activeFilters > 0 && (
                <button
                  onClick={clearFilters}
                  className="o29-meta o29-hit flex items-center gap-1 text-o29-slate transition-colors duration-instant hover:text-o29-ink"
                >
                  <X size={12} aria-hidden="true" /> Clear
                </button>
              )}
            </div>

            {/* Sort as a row of options rather than a dropdown: four choices do
                not need a menu, and a menu is one more thing to trap focus in. */}
            <div className="flex flex-wrap items-center gap-4">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateParam("sort", opt.id)}
                  aria-current={sort === opt.id ? "true" : undefined}
                  className={`o29-meta o29-hit border-b transition-colors duration-instant ${
                    sort === opt.id
                      ? "border-o29-ink text-o29-ink"
                      : "border-transparent text-o29-slate hover:text-o29-ink"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop filters */}
          {filtersOpen && !isMobile && (
            <div ref={filterPanelRef} tabIndex={-1} className="mb-tight grid grid-cols-2 gap-8 border-b border-hairline pb-tight">
              {filterGroups}
            </div>
          )}

          {/* Mobile filter sheet. Escape close and focus trap come from Radix. */}
          <Dialog.Root open={filtersOpen && isMobile} onOpenChange={setFiltersOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[60] bg-o29-ink/30" />
              <Dialog.Content
                className="o29-field o29-field--bone fixed inset-x-0 bottom-0 z-[60] max-h-[80vh] overflow-y-auto border-t border-hairline px-gutter pt-6 focus:outline-none"
                style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
              >
                <Dialog.Title className="o29-meta mb-6 text-o29-slate">Filter</Dialog.Title>
                <div className="grid grid-cols-2 gap-8">{filterGroups}</div>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="o29-meta o29-hit mt-8 w-full bg-o29-ink text-o29-bone"
                >
                  Show {count} {count === 1 ? "object" : "objects"}
                </button>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Grid */}
          {category === "all" ? (
            <>
              <ProductGrid
                products={pages}
                loading={allLoading}
                // Only surface the error when there is nothing to show: a failed
                // "load more" fetch keeps the accumulated grid visible.
                error={error && pages.length === 0 ? error : null}
                refetch={refetch}
                sort={sort}
                priceRange={priceRange}
                searchQuery={searchQuery}
                clearFilters={clearFilters}
                category={category}
              />
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={isFetching}
                  className="o29-meta o29-hit mx-auto mt-quiet block border border-o29-edge px-10 text-o29-ink transition-colors duration-instant hover:bg-o29-ink hover:text-o29-bone disabled:border-o29-rule disabled:text-o29-slate"
                >
                  {isFetching ? "Loading…" : "Load more"}
                </button>
              )}
            </>
          ) : (
            <CollectionProducts
              collectionHandle={category}
              priceRange={priceRange}
              sort={sort}
              searchQuery={searchQuery}
              clearFilters={clearFilters}
              country={country}
              onCountChange={setCollectionCount}
              onLoadingChange={setCollectionLoading}
              category={category}
            />
          )}
        </div>
      </main>

      <Footer tone="ink" />
    </div>
  );
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div>
      <span className="o29-meta mb-3 block text-o29-slate">{label}</span>
      <div>
        {options.map((opt) => (
          <button
            key={opt.handle}
            onClick={() => onChange(opt.handle)}
            aria-current={value === opt.handle ? "true" : undefined}
            className={`flex min-h-hit w-full items-center gap-2 text-left text-sm transition-colors duration-instant ${
              value === opt.handle ? "font-medium text-o29-ink" : "text-o29-slate hover:text-o29-ink"
            }`}
          >
            {value === opt.handle && <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-o29-ochre" />}
            {opt.title}
          </button>
        ))}
      </div>
    </div>
  );
}
