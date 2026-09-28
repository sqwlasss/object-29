# ØBJECT 29 — Rebrand Implementation Plan

> Supersedes the visual layer of `2025-07-10-ddouble-refactor.md`. That plan’s **DO NOT TOUCH** list still governs: Shopify catalog content, pricing, variant prices, the free-shipping threshold NUMBER, and company identity disclosure. Its "reviews/ratings/testimonials" entry is explicitly overridden — see Owner decisions.

**Design system** (tokens, contrast table, motifs, component guidelines): <https://claude.ai/artifact/NYpoYHSjt1gpWYc8UrY1Ca>

---

## Status — stages 2–8 complete

| Stage | State | Evidence |
|---|---|---|
| 2 · Foundation | done | Token layer live; Archivo built (46KB; total font payload 92KB); guard wired into `npm run lint` |
| 3 · Pure refactor | done | PDP split verified presentation-identical — 79 classNames before, 79 after, same set |
| 4 · Primitives | done | hex 629 → 419; header re-gridded; PlateWell adopted |
| 5 · Commerce pages | done | 3-up grid at a 4:1 gap ratio; contextual sold-out states; apparel copy deleted |
| 6 · Editorial pages | done | CSS hero room; collection index; one cropped Ø29; `assets/` deleted |
| 7 · Chrome & edges | done | hex → 0; sky auth shell; SW cache bumped to `o29-shell-v2` |
| 8 · Verification | done | See below |

### Verified

- **Design-system guard: all five counters at 0.** No hardcoded hex, no weight-300, no `backdrop-blur`, no non-zero radius, no elevation shadows. The ratchet is now a hard gate — any regression fails `npm run lint`.
- **`@inContext(country: GB)` asserted on all three product queries** by the same command, so commit `4d8da9d` is regression-tested rather than trusted.
- **14 routes at 390×844: zero horizontal overflow, zero stranded text.**
- **Reduced motion:** duration tokens collapse to `1ms`; the Reveal primitive applies no wrapper styles at all — measured `withInlineOpacity: 0`, `computedInvisible: 0`.
- **Contrast, measured against the painted gradient rather than the token:** hero headline 8.98, metadata 6.99, CTA 8.98, focus ring 8.98, footer link on vermilion 5.15. Zero focusable elements without a visible ring.
- **The two-colour law holds on every route:** `/` cobalt + vermilion · `/shop` cobalt · `/product` cobalt · `/about` olive + vermilion · `/contact` vermilion · `/login` sky · `/404` sky + vermilion · cart, favourites and legal pages none.
- **GA4: all five events intact** across every refactor.
- **Bundle: total JS 806KB → 795KB** — smaller than before the rebrand, from deleted dead code. CSS 38.4 → 43.0KB. Fonts 48 → 94.7KB.
- **Typecheck: 124 pre-existing errors → 119.**

### Not verified — needs credentials

- **The real purchase flow.** Cart, variant add, checkout redirect and GA4 DebugView need real Shopify keys in `.env.local`. `npm run dev:preview` mocks the Storefront API; cart and checkout are inert there by design.
- **Production LCP and CLS.** Same blocker. Structurally improved regardless: the hero LCP is now a painted CSS rectangle rather than a photograph behind a GraphQL round trip, and the broken `/assets/home-800.jpg` preload (which 404'd on every production page view) is gone.
- **`npm run sitemap`** needs the same credentials. Pre-existing.

### Owner decisions still open

1. **`src/config/business.js`** — email, street address, opening hours, and the `[Company legal name]` / `[Registered address]` placeholders are all inherited from the previous brand and unverified. The placeholders render literally on the live legal pages today, behind a TODO that predates this rebrand.
2. **`FORMS_ARE_WIRED`** — the contact and newsletter forms have no endpoint behind them. Both now say so and offer email instead of falsely confirming. Flip the flag once a real endpoint exists, with server-side rate limiting.
3. **Canonical domain** is still `ddouble-store.vercel.app`, in `Seo.jsx`, `robots.txt`, `sitemap.xml` and `generate-sitemap.mjs`. Change them together and regenerate.
4. **Hero artwork** — curate a Shopify collection with handle `hero`, or pin one with `HERO.productHandle` in `src/config/editorial.js`.

---

## Architecture as found

Vite 6 + React 18 (JSX, no TS) SPA. `src/main.jsx` mounts `src/App.jsx`: ErrorBoundary > BrowserRouter > AuthProvider > QueryClientProvider > CurrencyProvider > AccountProvider > FavoritesProvider > (ScrollToTop, Routes, Toaster, CookieConsent). All 15 public routes plus nested `/account` are `React.lazy`; the whole app is gated behind `isLoadingAuth`. There is no shared layout — 13 page files each repeat `<div className="bg-[#F9F9F7] min-h-screen"><Seo/><Navbar/><main id="main">…<Footer/>`. Verified: `Navbar` renders a `position:fixed <header>` *inside* that page div, so CSS custom properties set on the page root cascade into the header (DOM inheritance, not layout) — this is what makes a page-level colour-field class invert the chrome with zero JS.

Styling: Tailwind 3.4.17 + shadcn "new-york"/neutral/cssVariables in `src/components/ui/`. `tailwind.config.js` maps colours to `hsl(var(--x))`, fonts to `var(--font-heading|body|display|mono)` (all Inter today), radius to `var(--radius)` = 0.25rem. The token layer is real but almost unused: only `accordion.jsx` and `toast.jsx` consume it. 40 `.jsx` files hardcode hex — verified counts `#1A1A1A`×250, `#6B6B67`×157, `#E5E5E1`×79, `#5A5A56`×62, `#F1F0EC`×33, `#F9F9F7`×30, `#2A2A2A`×8, `#D9D2C5`×7. `src/index.css` self-hosts one Inter woff2 (48 KB), forces `body{@apply bg-[#F9F9F7] text-[#1A1A1A]}` bypassing its own tokens, and has **no** `prefers-reduced-motion` block (deleted in 0c817d7). Motion is one primitive, `FadeIn` (IntersectionObserver, inline `opacity:0`, no observer fallback), used ~140 times.

Commerce: `@shopify/storefront-api-client` via `src/lib/shopify/{client,queries,cart,customer,wishlist}.js`. `queries.js` injects `@inContext(country: GB)` by regex over the raw template literals — textual, not structural. Confirmed `ALL_COLLECTIONS` and `COLLECTION_BY_HANDLE` both select `image{url}`, so `normalizeCollection` already carries a collection image. `useShopifyCart` is not a context: a module-level `listeners` Set plus per-instance `useState`. Auth is Firebase (`firebaseAuth.js` + AuthContext), not Shopify customer accounts; `VITE_SHOPIFY_CUSTOMER_SYNC_ENDPOINT` optionally mints a Shopify token. Analytics is consent-gated GA4 keyed on `ddouble_consent` (duplicated as a literal in `analytics.js`). SEO is imperative (`Seo.jsx` writes `document.head`), plus `scripts/generate-sitemap.mjs`, `public/robots.txt`, `public/sw.js` (`CACHE = "ddouble-shell-v1"`). Deploy: Vercel, `rewrites: /((?!assets/).*)` → index.html, `/assets/(.*)` immutable. `index.html` preloads `/assets/home-800.jpg`, a path that only resolves in dev.

## Do not touch

DO NOT TOUCH, drawn from all four audits and verified in the repo.

QUERY PINNING. `withCountry()` in src/lib/shopify/queries.js injects `@inContext(country: GB)` by regex over the raw template literals — the pin is TEXTUAL, not structural. queries.js is off-limits to prettier, reindenting, comments above `query`, and operation renames; any of those can move or lose the insertion and silently reintroduce Shopify currency conversion, undoing commit 4d8da9d. ALL_COLLECTIONS and COLLECTIONS_WITH_PRODUCTS are deliberately unpinned. If the file must change, log the generated query once and assert the directive lands immediately after the operation signature in all three pinned queries.

CURRENCY. src/lib/CurrencyContext.jsx FORMATS with Intl and never converts. `country` derived from the selected currency is what feeds `useShopifyCart(country)`; `addItem` awaits `updateCartBuyerIdentity(cartId, country)` before `addLines`, and that asymmetry against the GB-pinned catalogue is existing behaviour checkout depends on. Do not harmonise it. CurrencyProvider sits inside AuthProvider → QueryClientProvider; hoisting any `<Price>`-rendering component above it crashes the tree.

CART. useShopifyCart is NOT a context. The module-level `listeners` Set + `notify()` (lines 57-60) and the mount-time effect are the ONLY thing keeping the Navbar count, the drawer and the PDP button consistent. Do not multiply hook instances. `checkout()`'s fallback reads `cart?.checkoutUrl` from THAT instance's state, so the Checkout button must stay inside a component that has been mounted long enough to sync. `syncCart`'s catch calls `clearStoredCartId()` on ANY error — do not add code that reads the resulting null cart as 'new visitor'.

DATA SHAPES. normalizeProduct's output contract and normalizeCollection's `{id,title,handle,description,image}`. `toggleFavorite(product)` needs the WHOLE normalized object because FavoritesContext.makeEntry reads `product.variants` to build variantIds. Field-selection asymmetry is real: `options`, `images(first:5)` and per-variant `image` exist ONLY on PRODUCT_BY_HANDLE — grid products get `options: []` and a one-element `images[]`, so no card, swatch or second-image hover may read them without a query change first.

VARIANTS. selectedOptions stays a plain object keyed by the exact Shopify option NAME string; the seeding effect seeds EVERY option including single-value ones while the UI renders only `values.length > 1`, and that asymmetry is load-bearing. No array, index-map, `<select>` or ToggleGroup storing ids.

ANALYTICS. trackEvent no-ops silently without `ddouble_consent === 'accepted'` AND `window.gtag`, so a dropped call is invisible locally. The five event names and their call sites must survive verbatim: view_item (PDP), view_item_list (Shop ProductGrid, deduped by lastListKeyRef), add_to_cart (handleAddToCart, shared by desktop and sticky), remove_from_cart and begin_checkout (CartDrawer inline closures).

STORAGE KEYS — every one of these is a silent-failure key; a rename reads as 'new visitor': `shopify_cart_id`, the scoped `shopify_cart_${token.slice(0,12)}` (written in addItem, read in customerCartKey — the slice length is duplicated and must stay identical), `shopify_customer_token`, `shopify_favorites`, `shopify_wishlist`, `shopify_currency`, `ddouble_consent` (duplicated as a literal in analytics.js), `ddouble_default_country`.

CONFIG. FREE_SHIPPING_THRESHOLD=100, STORE_CURRENCY, STORE_COUNTRY and shippingProgress() — the same literal is both compared against raw GBP totals and rendered through `<Price>` without conversion, and they only stay coherent because nothing converts.

SHOP MECHANICS. The cursor accumulator, the dedupe-by-id append, the STORE_COUNTRY-keyed reset, the push-vs-replace useSearchParams semantics, and 'Load more' — filters, sorting and the piece count operate on loaded pages only.

SECURITY / SEO. The DOMPurify allow-list and forced target/rel in ProductDetail is the XSS boundary for Shopify-authored HTML. Seo.jsx's head-writing mechanism, #page-jsonld lifecycle and unmount cleanup. FAQ's useMemo deriving FAQPage JSON-LD from FAQ_SECTIONS.

ACCESSIBILITY that already exists: the skip-to-content link targeting `#main`; `id="main"` on every shell including AuthLayout and AccountLayout; the min-h-11/min-w-11 tap targets (33 uses across 8 files — pad, never shrink); aria-label on icon-only buttons; role="alert" + aria-describedby on auth errors; aria-live="polite" on the cart count; CartDrawer's manual aria-modal and its `aria-labelledby="cart-heading"` → `<h2 id="cart-heading">` pair; usePanelFocus/useEscapeClose on Navbar's mobile menu and search, Shop's sort menu and CurrencySelector; the Footer being a literal `<footer>` element and the `<div ref={sentinelRef} className="h-px md:hidden" />` at ProductDetail.jsx:413, both of which StickyAddToCart's IntersectionObservers depend on.

AUTH / ACCOUNT. firebaseAuth.js's lazy cached-promise getAuth pattern (deliberate bundle splitting — top-level imports would pull firebase into the initial chunk), shopifySync.js's `if (!SYNC_ENDPOINT) return null` graceful-degradation switch, AccountContext's optimistic patches, FavoritesContext's makeEntry/itemsRef/reconcile machinery and the one-way favorites→wishlist mirror, wishlist.js's own listeners/notify, useAddressAutocomplete's locality||sublocality||postal_town fallback chain, and useGoogleMaps' `available:false` degradation.

## Component plan

### Preserve — logic carriers; not restyled (5)

| File | Detail |
|---|---|
| `src/components/ddouble/Price.jsx` | Keep the component and its className passthrough exactly. It is the single entry point to useCurrency().formatPrice. Style at call sites; never inline a template-literal price anywhere. |
| `src/components/ScrollToTop.jsx` | Untouched. The POP guard preserves back-button scroll position and the 50ms hash defer handles deep links. If page transitions are ever added, coordinate here rather than adding a second scroll manager. |
| `src/components/GoogleIcon.jsx` | Untouched. Its four hexes are trademark-locked Google brand colours and are explicitly excluded from the hex-to-token sweep and from the CI grep. |
| `src/components/ui/use-toast.jsx` | Headless reducer. Untouched. |
| `src/components/ddouble/ (directory name)` | Do NOT rename during the redesign. 30+ import specifiers across ~20 files; eslint will not catch a missing module and there is no upside while other work is in flight. If it is renamed at all, do it as a single isolated commit gated on npm run build. |

### Refactor — split or rewired, presentation unchanged in that step (23)

| File | Detail |
|---|---|
| `src/index.css` | Replace lines 5-112 with the tokensCss block. Keeps the shadcn variable NAMES, retunes values, adds the --o29-* triplets, the type/space/motion scales, the .o29-field--* classes, .o29-meta, .o29-hit, the reduced-motion block (reverses 0c817d7) and the rule-sweep keyframe. Keep the .animate-heart-pop class name — ProductCard and ProductDetail reference it. body gets overflow-x: clip; html NEVER gets overflow-x: hidden. |
| `tailwind.config.js` | Add the extend block from tailwindExtend: o29 colour ramp as hsl(var(--x) / <alpha-value>), field-relative aliases, fontSize/spacing/maxWidth/aspectRatio/duration/easing tokens, rule-sweep keyframe. Pin borderRadius.sm and .md to literal 0px — calc(var(--radius) - 4px) evaluates to an invalid -4px once --radius is 0rem. Do not touch content globs or the animate plugin. |
| `index.html` | New title/description/og:site_name, theme-color to #F2EEE3, add a default og:image and an apple-touch-icon (both currently missing everywhere). DELETE the /assets/home-800.jpg preload — that path only resolves in dev and 404s in production. Add the Archivo preload beside the existing Inter one. Add the hero preload back only once scripts/generate-sitemap.mjs resolves the hero image URL at build time. |
| `src/components/ddouble/Navbar.jsx` | Rewrite presentation: ØBJECT 29 live-text wordmark flush left (delete the left-[33%]/42%/45% hack), word utilities instead of icons, no badges, no backdrop-blur, no shadow, cobalt push-down mega band. Preserve every behaviour listed in pageStructures.chrome including both a16721f fixes. Read chrome colours from var(--fg)/var(--focus) so colour pages invert it for free. |
| `src/components/ddouble/Footer.jsx` | One composition, two grounds via a `tone` prop (vermilion \| ink). Must stay a literal <footer> element. Keep useCollections + FALLBACK_COLLECTIONS. Remove the dead Size Guide link and the bare facebook.com placeholder. Rewrite newsletter copy so it does not promise delivery — handleSubscribe has no endpoint. Add the small uncropped Ø29 bottom-right. |
| `src/components/ddouble/ProductCard.jsx` | Swap aspect-[3/4] object-cover for the PlateWell (4/5, contain, bone-2, hairline). Delete the white/80 backdrop-blur circular heart; the favourite becomes a bare 44x44 glyph outside the image. Keep toggleFavorite(product) with the WHOLE normalized object (FavoritesContext.makeEntry reads product.variants), keep shopifyImage(product.image, 600), keep loading={index < 4 ? 'eager' : 'lazy'}, keep the 350ms animate-heart-pop timer. |
| `src/components/ddouble/CartDrawer.jsx` | Bone/ink, zero brand colour, zero motifs, no blur, no shadow, no radius. Lift the two inline GA4 closures into named handlers in the same file. Keep the aria-labelledby/id pair and manual aria-modal. Keep shippingProgress on raw numbers. Remove the payment-badge strip. Keep the Checkout button in this component. |
| `src/components/ddouble/FadeIn.jsx` | Becomes a thin alias re-exporting the new Reveal so all ~140 call sites keep compiling during migration, then is deleted in stage 8. |
| `src/components/AuthLayout.jsx` | Sky field, no card, no panel surface, Ø29 mark instead of the icon square. One edit restyles all four auth pages. Keeps id="main" and the icon/title/subtitle/footer/children prop shape. |
| `src/components/AccountLayout.jsx` | Bone only, square active NavLink, metadata section labels. KEEP the VITE_SHOPIFY_CUSTOMER_SYNC_ENDPOINT notice and give it an intentional home as a metadata line. Keep NavLink end:true on /account, keep logout(). Add overscroll-behavior-x: contain to the mobile nav row. Do not double-wrap with PageShell. |
| `src/components/ui/button.jsx` | Highest-leverage primitive. Repoint all six variants at tokens; never rename or remove a variant — it is shared with cart/checkout/PDP. rounded-none baseline. Raise sizes so default clears 44px (h-8/h-9 are below the floor the storefront enforces with min-h-11). Replace disabled:opacity-50 with the bone-2/slate/edge disabled treatment. Unify the hand-rolled inline storefront CTAs behind these variants. |
| `src/components/ui/toast.jsx` | Already token-driven. Fix two real defects while restyling: import X from lucide-react (line 75 renders it with no import) and remove the duplicate fixed container — ToastProvider and ToastViewport are two identically-positioned z-[100] stacks. Verify the destructive toast still contrasts (bone on vermilion, 5.15:1). |
| `src/pages/Home.jsx` | Full rewrite to the constructed-room composition. Delete TESTIMONIALS, the Instagram strip, the scrim banner, the lifestyle grid and all six assets/ imports. Keep useCollections / useCollectionProducts, the CollectionCard image fallback and the loading states. The hero <img> keeps fetchpriority=high, explicit width/height and its srcSet, and stays OUTSIDE any reveal wrapper. |
| `src/pages/Shop.jsx` | Restructure layout only. Keep ProductGrid, CollectionProducts and FilterGroup as units and restyle inside them. Preserve the useSearchParams push-vs-replace semantics, PRICE_RANGES, SORT_OPTIONS, the filtered useMemo, the cursor accumulator keyed to STORE_COUNTRY, allLoading, the error suppression once pages exist, view_item_list with its lastListKeyRef dedupe, the inline useIsMobile, and 'Load more'. The empty-cell void is a positioned grid item, never an element inside filtered.map(). |
| `src/pages/ProductDetail.jsx` | 643 lines, ~45% commerce logic. Stage 3 splits it into PdpGallery / PdpBuyBox / PdpDetails / PdpRelated moving logic VERBATIM with zero className changes; stage 5 restyles. Keeps view_item, the JSON-LD builders (with brand.name and the two inline domain literals updated to the shared SITE_URL), the DOMPurify config, the sentinel and both <Price amount={FREE_SHIPPING_THRESHOLD}> bindings. Deletes MaterialsContent and CareContent. |
| `src/pages/About.jsx` | Full rewrite: olive field, type and one flat disc, no photograph. Delete the assets/about-us.jpg import and its usage in the same edit — a dangling static import is a hard Vite build failure. All Copenhagen/DDouble narrative copy is replaced wholesale. |
| `src/pages/Contact.jsx` | Bone page, vermilion footer, square underline-only form. The form posts nowhere (handleSubmit only sets submitted) — the new copy must not deepen that promise. Replace the Copenhagen address, the CET hours and the hello@ddouble.com links, and fix the 'DDouble \| Copenhagen' Seo title. |
| `src/pages/FAQ.jsx` | Rewrite every answer against real fulfilment: the 200gsm museum paper, five fixed sizes, oak frames, Copenhagen partner studio and 'free shipping over €50' are all false or contradict FREE_SHIPPING_THRESHOLD=100 GBP. Keep the useMemo that derives FAQPage JSON-LD from FAQ_SECTIONS — copy edits ARE structured-data edits; re-validate after. Interpolate the threshold through <Price> so the number cannot drift again. |
| `src/pages/account/Orders.jsx` | Bone cards, square. Recolour STATUS_COLORS to the brand tokens but keep paid/pending/cancelled visually distinguishable and NEVER hue-only — each keeps its uppercase status word. Keep handleBuyAgain's sequential addItem loop and its per-item destructive toast, and statusUrl as target=_blank rel=noopener. Fix the hardcoded 'en-US' date formatting. |
| `src/pages/account/Wishlist.jsx` | Collapse the duplicated card markup into ProductCard with an action-slot prop. The remove control becomes permanently visible (opacity-0-until-hover is unreachable on touch and invisible to keyboard focus), loses the backdrop-blur, keeps its 44px hit area and aria-label. Keep the union filter and handleRemove's deliberate both-stores removal. |
| `src/lib/PageNotFound.jsx` | Sky field, the doorway-that-opens-onto-nothing joke, ERROR 404 / LOCATION: UNDEFINED. Keep the escaped pathname echo and the Seo noindex. Delete the Base44 admin note. Replace window.location.href = '/' with a router <Link> so it stops forcing a full reload. |
| `public/sw.js` | Bump CACHE from 'ddouble-shell-v1' in the SAME commit as the index.html change — the activate handler already deletes every cache whose name !== CACHE, and leaving it serves the old shell to returning visitors. Do not delete the file; a worker is already registered on every past visitor. |
| `scripts/generate-sitemap.mjs` | Update the SITE constant, consume the same shared constant as Seo.jsx, and add a step that resolves the hero product image URL and injects the index.html preload at build time. Regenerate public/sitemap.xml with npm run sitemap rather than hand-editing. |

### Restyle — presentation only (25)

| File | Detail |
|---|---|
| `src/App.jsx` | Restyle the two fallback UIs only: LoadingSpinner becomes a 1px ink rule sweeping the container (animate-rule-sweep), ErrorBoundary becomes bone/ink square. DO NOT reorder providers. Delete the unreachable authError branch at line 84 that renders <UserNotRegisteredError /> with no import (a latent ReferenceError). |
| `src/components/ddouble/StickyAddToCart.jsx` | Solid bone, 1px ink top rule, square, no blur/shadow, safe-area padding. Keep both IntersectionObservers (sentinelRef and document.querySelector('footer')) and the needsSelection derivation. handleAddToCart keeps arriving by prop so add_to_cart fires from one place. |
| `src/components/ddouble/StockIndicator.jsx` | Replace the raw Tailwind red-500/orange-400/green-500 dots (the only raw palette colours in the commerce path) with an ink/slate dot PLUS the status word — never hue-only. Do NOT build any scarcity element on quantityAvailable; it is selected by zero queries and is always undefined. |
| `src/components/ddouble/Breadcrumb.jsx` | Becomes a MetaLabel consumer. Move its own px-6 md:px-10 lg:px-16 gutter padding out to the shared Container so the gutter is declared once. |
| `src/components/ddouble/CurrencySelector.jsx` | Square, no shadow, no blur. Keep usePanelFocus + useEscapeClose + outside-click. It selects DISPLAY FORMATTING ONLY — do not redesign it into a market/region switcher. |
| `src/components/Seo.jsx` | Change SITE_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION and add DEFAULT_IMAGE only. The head-writing mechanism, the #page-jsonld lifecycle and the unmount cleanup must not change. Export SITE_URL so ProductDetail's two inline 'https://ddouble-store.vercel.app/product/...' literals can consume it. |
| `src/components/CookieConsent.jsx` | Square ink bar, both choices equally prominent, above StickyAddToCart. KEEP the literal 'ddouble_consent' key and the 'consent-change' CustomEvent contract that main.jsx listens for. First, export CONSENT_KEY from here and import it into analytics.js, which currently hardcodes the same string. |
| `src/components/ui/input.jsx` | Token colours, border-input (= --o29-edge, 3.66:1). Keep the className passthrough (callers override h-11/h-12 via twMerge) and keep text-base → md:text-sm so mobile stays 16px and iOS does not zoom. Add NO per-component outline-none — it relies entirely on the global :focus-visible rule. |
| `src/components/ui/label.jsx` | Point its cva at the same scale as MetaLabel so form labels and editorial labels stop drifting. Keep LabelPrimitive.Root — it provides the click-to-focus association every htmlFor/id pair in the account forms depends on. |
| `src/components/ui/accordion.jsx` | Already token-driven, so it changes the instant index.css changes — use it as the canary that the token swap is live. Becomes the ONLY accordion implementation: PdpDetails uses it on mobile instead of the hand-rolled max-height version. |
| `src/components/ui/toaster.jsx` | Token colours only. It is the single error/success surface for add-to-cart, Profile, Addresses, Buy again and Wishlist removal, so legibility is functionally load-bearing. |
| `src/components/ui/country-select.jsx` | Square, token colours, no shadow. Keep the full keyboard model, the outside-click close, getStoredCountry/storeCountry and the 'ddouble_default_country' key. Flag emoji are functional wayfinding in a 200-entry list and are the stated exception to the no-emoji rule. Add aria-controls and aria-activedescendant while here. |
| `src/components/ui/address-autocomplete.jsx` | Square popover, no soft shadow. Keep the 300ms debounce, the min-3-char gate, the `available` guard that degrades to a plain Input, and getPlaceDetails → onPlaceSelect. Add role=combobox / aria-expanded / aria-autocomplete and role=listbox — screen readers get no announcement today. |
| `src/pages/Favorites.jsx` | Bone, ink footer. Keep useFavorites + the liveProducts memo that re-resolves stored entries against the live catalogue, and keep delegating to ProductCard with showHeart rather than inlining card markup. Add the missing <Seo> block (this is the only page without one). |
| `src/pages/Login.jsx` | Sky shell. The 'or' divider's hardcoded #F9F9F7 label background is deleted along with the card. Keep loginViaEmailPassword, the emailVerified===false banner branch, loginWithGoogle, and the aria-describedby/id=login-error pair. Unify the Google-success destination with Register. |
| `src/pages/Register.jsx` | Sky shell, same divider fix. Keep registerUser, the password-match check, sendEmailVerification on resend, and the showVerifyScreen state machine. Google success currently navigates to '/' here but '/account' in Login — unify to '/account'. |
| `src/pages/ForgotPassword.jsx` | Sky shell. Do NOT add a real error surface: the catch swallows errors and setSent(true) runs in finally, which is deliberate account-enumeration protection. |
| `src/pages/ResetPassword.jsx` | Sky shell. FLAG, do not silently fix: it reads searchParams.get('token') but firebaseAuth.resetPassword calls confirmPasswordReset(), which requires Firebase's oobCode param — so unless a custom action URL rewrites it, this page always renders 'Invalid reset link'. |
| `src/pages/Privacy.jsx` | Shared legal layout, typography and measure only, strip the 19 per-paragraph reveal wrappers. Keep the compliance statements about Firebase auth, Google Maps, Shopify checkout and GA4 accurate after the rebrand. The [Company legal name] / [Registered address] placeholders are an owner decision. |
| `src/pages/Terms.jsx` | Same shared legal layout. Legal text is restyled and re-identified, never creatively rewritten. |
| `src/pages/Shipping.jsx` | Same layout, but the '€50 free shipping' claim must be replaced by the interpolated FREE_SHIPPING_THRESHOLD — a stated threshold that disagrees with checkout is consumer-law exposure, not a copy nit. 'Reinforced tubes' does not apply to rugs or pillows. |
| `src/pages/Returns.jsx` | Same layout. Keep the 30-day policy substance; single-source the window so the PDP trust strip and FAQ cannot drift from it. |
| `src/pages/account/Profile.jsx` | Bone, square. Keep updateProfile and the effect that hydrates local state from `customer` or the form blanks on sync. Replace the '+373' (Moldova) placeholder. Disable Save when no customer token exists instead of letting the submit throw into a destructive toast. |
| `src/pages/account/Addresses.jsx` | Square form and cards. Keep the full CRUD wired to AccountContext and the handlePlaceSelect merge exactly. FLAG the existing round-trip defect: CountrySelect stores an ISO code while Shopify's parseAddress returns a country NAME, so Edit shows no country. Test the EDIT path, not just Create. Add a delete confirmation — Remove currently fires immediately. |
| `src/pages/account/Settings.jsx` | Bone, square. The rounded-full initial avatar becomes the Ø29 mark — it is the only circle in an otherwise square system. The red-600/red-200 log-out button gets the vermilion token treatment. |

### Create (16)

| File | Detail |
|---|---|
| `public/favicon.svg` | Replace the 64x64 #1A1A1A square with white 'DD'. New: ink square, bone Ø29 in Archivo 600. Referenced from index.html only. |
| `src/components/motion/Reveal.jsx` | NEW. Variants (rise \| none), asChild/Slot so it stops injecting a wrapper div into grids, a Stagger parent replacing hand-computed i*0.05, and the reduced-motion path: when reduced OR when IntersectionObserver is undefined, render children with NO wrapper styles at all. Stagger capped at Math.min(i,5)*0.07s. |
| `src/components/motion/useReducedMotion.js` | NEW. matchMedia('(prefers-reduced-motion: reduce)') with a change subscription. Consumed by Reveal and by the heart-pop trigger. |
| `src/components/brand/PlateWell.jsx` | NEW. The mat well: aspect-ratio 4/5, bone-2 ground, inset 1px hairline, clamp(12px,3%,32px) mat padding, object-fit contain. Used by ProductCard, PdpGallery, CartDrawer thumbs, account/Wishlist, Home hero canvas. This is what makes a mixed-aspect Shopify catalogue hang evenly. |
| `src/components/brand/MetaLabel.jsx` | NEW. Single source for the 11px uppercase .18em style currently copy-pasted 25+ times and encoded a third time in ui/label.jsx's cva. Takes a `real` prop; on Shop/Product it renders nothing when a value is falsy rather than emitting an invented one. |
| `src/components/brand/Mark.jsx` | NEW. The Ø29 mark as live text. size="signature" (footer, uncropped, required) \| "mega" (one instance in the whole site, Home's final room, aria-hidden, pointer-events none, inside a locally clipped container). |
| `src/components/brand/ColourField.jsx` | NEW. Full-bleed section applying .o29-field--{tone}, the hard 0%-stop horizon, min-h 82svh desktop / 100svh mobile, and its own overflow:clip so any bleeding child is clipped locally, never on body or html. |
| `src/components/layout/Container.jsx` | NEW. Replaces the string-copied max-w-[1440px] mx-auto (11 files) and px-6 md:px-10 lg:px-16 (15 files). width = page \| reading \| lead. Sets the side gutter with padding-inline, never a padding shorthand. |
| `src/components/layout/Section.jsx` | NEW. rhythm = tight \| quiet \| hold, optional top hairline, optional tone. Replaces py-24 md:py-32 (10 uses) and border-t border-[#E5E5E1] (14 files, 29 uses). |
| `src/components/layout/PageShell.jsx` | NEW. An OPT-IN wrapper pages import — bg + min-h-screen + optional .o29-field--tone on the root div + Navbar + <main id="main"> + Footer with its tone. Deliberately NOT a layout route yet: pages are React.lazy, and a <Route element> layout would move the chrome outside each page's Suspense chunk. Convert to a layout route only after stage 8, and never double-wrap AccountLayout or the auth pages. |
| `src/components/ddouble/PdpGallery.jsx` | NEW, extracted verbatim from ProductDetail in stage 3 before any restyle: displayImage/matchedThumb resolution, the click-zoom, the Product/View-in-Room toggle. Then restyled to the vertical plate sequence. Use img.width/img.height from normalizeProduct instead of the current hardcoded width={1200} height={1600}. |
| `src/components/ddouble/PdpBuyBox.jsx` | NEW, extracted verbatim: the selectedOptions seeding effect keyed by option NAME, the selectedVariant matcher, handleAddToCart with its guard + toast + add_to_cart event, the quantity stepper, the sentinelRef. State MUST stay { [option.name]: value } with the exact server strings. |
| `src/components/ddouble/PdpDetails.jsx` | NEW. The cobalt specification band. Carries the DOMPurify allow-list and forced target/rel verbatim — it is the XSS boundary for Shopify-authored descriptionHtml. Desktop: two columns, no accordions. Mobile: ui/accordion, first panel open. |
| `src/components/ddouble/PdpRelated.jsx` | NEW, extracted verbatim: the tag-overlap heuristic, rendered as a 3-up of ProductCard. |
| `src/components/ddouble/CollectionIndex.jsx` | NEW. Home's typographic collection list. Uses collection.image (already returned by normalizeCollection) — NOT per-collection product queries. Hover AND :focus-within reveal the image, so a keyboard user is never browsing unillustrated text. |
| `src/config/editorial.js` | NEW. export const ISSUE = { heroProductHandle: '', heroFallbackCollection: 'abstract' }. Home resolves useProduct(handle) → useCollectionProducts(fallback) → first collection's first product. useProduct's enabled: !!handle means an unset handle no-ops rather than firing a bad query. |

### Delete (5)

| File | Detail |
|---|---|
| `src/components/ProtectedRoute.jsx` | Dead code with a latent crash: it destructures authError and checkUserAuth, neither of which AuthContext provides. Nothing imports it. Delete it. Guarding /account/* is a separate, explicit decision outside this visual work — record it as a follow-up, do not restyle this file into apparent health. |
| `src/components/UserNotRegisteredError.jsx` | Off-system Base44 scaffolding (slate-*, gradient, orange warning circle) and unreachable — App.jsx renders it without importing it. Delete the file and the branch together. |
| `src/components/ui/input-otp.jsx` | Dead code — imported nowhere, and it references an animate-caret-blink keyframe tailwind.config.js has never defined. Firebase verification is link-based, not OTP. Delete rather than restyle. |
| `assets/*.jpg (7 files)` | All seven are Scandinavian-beige interior stock showing Dior, Chanel, Saint Laurent, Porsche and Picasso — the forbidden aesthetic plus trademarks the store does not own. Remove each static ES-module import in the SAME edit as the file, or the Vite build fails. Verify with npm run build, not npm run dev. |
| `product_photo/ (15 files)` | ~3.4 MB referenced by nothing in src/, index.html or scripts/ — product imagery is served from the Shopify CDN. Confirm against the Shopify admin before deleting rather than assuming. |

## Page structures

### Home

DESKTOP. Header transparent over bone at scrollY 0, solid bone with a 1px hairline bottom border past 40px — no blur, no shadow.

(1) HERO — THE CONSTRUCTED ROOM, 100svh (with a vh line preceding svh as fallback so the iOS URL bar never causes a jump). Painted entirely in CSS on one section: a cobalt back wall occupying the top 64%, a bone floor below, meeting at a hard 0%-stop horizon; a vermilion doorway band runs floor to ceiling at the right, 0–18% of the shell width, bleeding off the right edge. This is reference images 1 and 4 translated into layout: zero image bytes, no people, and the LCP element is a painted rectangle. ONE artwork hangs on that wall — full-bleed-width-minus-gutter, `object-fit: contain` inside a bone-2 canvas with a 1px rule inset 10px (the only framed object in the site), straddling the horizon. NO SCRIM, NO OVERLAY, NO TEXT ON IT. The h1 sits at --t-display in the bone floor BELOW the artwork, never behind it or across it — the type-behind-live-product-image collision is cut, because a 60-character Shopify title at 88px behind a variable-aspect artwork is unpredictable. Metadata line `ØBJECT 29 / EXHIBITION 01` above the h1; a second metadata line right-aligned on the h1's last baseline (176px against 11px). One square ink CTA, `VIEW THE CATALOGUE →`. --space-hold.

(2) THE INDEX — collections as a typographic list, not a card grid. Each collection is one 12-col row: two-digit index in cols 1–2 (--t-h3, slate, tabular-nums), title in cols 3–8 at --t-h2, live piece count right-aligned, cols 9–12 empty. Rows divided by 1px hairlines, 88px tall. No images at rest. On hover AND on `:focus-within`, the row's title shifts +3px and `collection.image` cross-fades into the empty right-hand columns at 320×400 — images appearing out of emptiness is the surreal interaction. Uses `collection.image`, which `normalizeCollection` already returns; it does NOT need per-collection product queries. --space-quiet.

(3) WORKS I — metadata + h2 in cols 1–6, then THE GRID BREAK: tile 1 spans cols 1–4 at double height and bleeds left past the gutter to the viewport edge; tiles 2–4 sit in cols 6–8, 9–10, 11–12 at staggered top offsets 0 / 120px / 40px. Then --space-tight and a strict 4-up row that resolves the grid. --space-hold.

(4) WORKS II — the second collection as a perfectly strict, perfectly quiet 3-up grid. Deliberately unremarkable after the hero; the restraint is the point. --space-quiet.

(5) STATEMENT — one paragraph at --t-lead in cols 1–7, metadata above, no image. --space-quiet.

(6) THE MARK — a bone room holding the site's single oversized cropped Ø29 at --t-mega in `var(--mark)`, anchored so ~40% falls outside a locally clipped container, with a short link row (SHOP / ABOUT / CONTACT) at --t-h3 overlapping its lower right. aria-hidden.

(7) VERMILION FOOTER.

DELETED: the TESTIMONIALS array and its section (fabricated reviews), the Instagram strip (product images pretending to be social proof), the 'Curated for modern living' black/40 scrim banner, the 'Live with art' lifestyle grid, 'Your dream home starts here', 'Discover decor inspired by the world's most beautiful interiors', every `font-light`, every gradient overlay.

MOBILE (390px) — a different composition, not a squeeze. Header 56px: wordmark left, `MENU` and `CART (2)` as words right. HERO reorients: cobalt wall is the top 58% of 100svh, bone floor below, and the vermilion band moves from a right-hand vertical wall to a HORIZONTAL floor strip across the bottom 12% — an 18% vertical band at 390px is a stripe, not a wall. Artwork full-bleed edge to edge above the horizon; h1 at --t-display (56px) below it, deliberately overrunning the right gutter via `margin-inline-end: calc(-1 * var(--gutter))` inside a clipped wrapper — the mobile-native version of entering from outside the frame. Full-width 56px CTA with `padding-bottom: max(0.75rem, env(safe-area-inset-bottom))` where it is the last element. INDEX: hover does not exist on touch, so it inverts — each row shows `collection.image` as a 100vw × 120px horizontal sliver cropped from the artwork's middle band, beneath the title. A fragment, not the whole image. This treatment ships at every coarse-pointer width, not only under 768px. WORKS I: the grid break becomes one tile owning the full 100vw, then the remaining three as a 2-col grid with the third spanning both columns. WORKS II: strict 2-up. STATEMENT full width. THE MARK: the Ø29 crops off ONE edge only at 96px. Vermilion footer.

### Shop

DESKTOP. One cobalt band, one ochre micro-mark, and nothing else chromatic.

MASTHEAD — a full-bleed `.o29-field--cobalt` band, 30svh, starting under the fixed header (which inherits cobalt tone automatically from the band only if the band is the page root; here the band is a section, so the header stays bone — deliberate, so the catalogue chrome never inverts mid-scroll). Metadata `CATALOGUE / 42 WORKS` in rule, h1 at --t-h1 in bone, cols 1–6. The count comes from the live query; it is never hardcoded. Hard horizon at the band's foot, then bone for the rest of the page.

FILTER BAR — a single horizontal row of plain text filters sitting on a 1px hairline, sticky beneath the header. No dropdowns, no pills, no cards, no chevrons. The active filter is carried by ink text PLUS a 1px ink underline (the accessible signal) with an 8px ochre square before the label as decorative reinforcement — ochre is 1.82:1 on bone and can never be the sole indicator. `CLEAR ALL` in vermilion text at the row's end. Sort reuses the existing `usePanelFocus` / `useEscapeClose` menu, restyled square.

GRID — 3-up at ≥1280px, 2-up at 768–1279px, 2-up below. Three columns, not four: bigger plates, more air, and it stops reading as a storefront. Column gap = `--gutter` (20→64px), ROW GAP = 5rem. That 4:1 vertical-to-horizontal ratio is the single most effective anti-default-Shopify-grid move available. Every card is an identical MAT WELL: `aspect-ratio: 4/5`, `--o29-bone-2` ground, `box-shadow: inset 0 0 0 1px var(--hairline)`, mat padding `clamp(12px, 3%, 32px)`, and `object-fit: contain` — a loud olive artwork and a quiet bone one occupy exactly the same footprint and NOTHING IS EVER CROPPED. This replaces the current `aspect-[3/4] object-cover`. Caption below the well, never on it: title at --t-sm weight 500 ink, `From <Price>` at --t-sm slate, a 1px rule under the caption that thickens to 2px on hover. Favourite heart is a bare 44×44 glyph outside the image area — the white/80 `backdrop-blur-sm` circle is deleted.

THE ONE SURREAL ALLOWANCE — every 12th grid position is an empty bone void carrying one metadata line (an em-dash and the collection name). It reads as a gallery hang with a deliberate gap. CRITICAL IMPLEMENTATION: the void is rendered as an empty grid item positioned by `grid-column`/`grid-row`, PINNED TO THE LAST CELL OF ITS ROW, and NEVER as an element inside `filtered.map()` — that array feeds `view_item_list`, the reveal stagger index and the pagination dedupe Map. It always carries its metadata line so it can never be misread as a failed image load, and it is suppressed if it would leave fewer than three products visible.

PAGINATION — the existing 'Load more' stays, as a centred square ink button `LOAD NEXT 24`. It is not decoration: all filtering, sorting and the piece count run client-side over loaded pages only, so removing it or converting it to infinite scroll changes what the filters mean.

No grid break, no cropped mark, no disc, no doorway band. Ink footer.

MOBILE. Masthead band drops to 18svh with h1 at --t-h2 and the count beneath. The h1 scrolls away; only the filter rule stays sticky. The filter bar becomes a single horizontally scrolling line of text filters with `scroll-snap-type: x proximity`, `overflow-x: auto` scoped to that one element and `overscroll-behavior-x: contain`, so the page body can never scroll sideways. The existing Radix bottom-sheet for filters is kept — it is a real affordance — restyled square, bone, 1px ink top rule, no radius, no shadow, with `padding-bottom: max(0.75rem, env(safe-area-inset-bottom))`. Grid 2-up, 8px inner gutter, 16px outer. The void drops to every 8th cell because rows are half as wide.

### Product

DESKTOP. Bone above the fold, zero field, zero cropped mark, zero metadata decoration — this page belongs to the artwork and the transaction.

Layout: asymmetric two columns, images cols 1–7, details cols 9–12, sticky at `top: calc(var(--header-h) + var(--space-tight))` (replacing the magic `lg:top-28`).

IMAGE COLUMN — the primary artwork in a `--o29-bone-2` mat well, `object-fit: contain`, 4% mat, 1px hairline inset. No scrim, no badge, no watermark, no hover overlay, no colour filter, no tilt — the hero product image never moves. The existing click-to-zoom is KEPT but becomes a static 1.6× inspect toggled by click that preserves scroll position; hover-follow zoom is motion during evaluation. ADDITIONAL IMAGES STACK VERTICALLY below at full column width, each in its own well with its own micro caption — a plate sequence, not a thumbnail strip. This degrades perfectly to a one-image product: no 1-vs-5 branch, no active-thumb state, nothing to manage. The existing Product / View-in-Room toggle becomes two square text toggles with an ink underline on the active one.

DETAIL COLUMN, in order: a metadata block built ONLY from real data (`{productType} / {options.length} OPTIONS / {variants.length} VARIANTS`) — no invented edition, no `quantityAvailable` (selected by zero queries, always undefined, so its low-stock branch is unreachable dead code). Title at --t-h2, NOT display — the title must never outshout the artwork. Price at --t-lead with tabular-nums, always through `<Price>`. StockIndicator restyled: the raw Tailwind red-500/orange-400/green-500 dots are replaced by an ink/slate dot PLUS the status word, never hue-only. Options as square outlined buttons, `--o29-edge` at rest, ink fill when selected, 1px diagonal strike plus `aria-disabled` plus the word 'Sold out' when unavailable. Square quantity stepper, min 44×44 per cell. Full-width square ink Add to Cart that hovers to cobalt — background-colour only, zero transform, `--dur-instant`. Disabled state is bone-2 fill + slate label + edge border + cursor-not-allowed, NOT opacity-50. Trust information becomes three metadata lines on 1px rules; the lucide Truck / RotateCcw icons are deleted because they are the universal signature of a generic Shopify theme. `<Price amount={FREE_SHIPPING_THRESHOLD}>` binding is kept in both places.

BELOW THE FOLD — the SPECIFICATION BAND, full-bleed `.o29-field--cobalt`, the page's single chromatic moment, placed after the purchase decision: the sanitised `descriptionHtml` as editorial copy, bone on cobalt at 54ch, alongside shipping and returns as two hairline columns. NO ACCORDIONS ON DESKTOP — accordions hide content on a page with room. Then bone again: `ADJACENT WORKS`, a strict 3-up of related products.

DELETED CONTENT: MaterialsContent ('Premium cotton blend', 'Soft-touch fabric') and CareContent ('Machine wash cold', 'Wash inside out', 'Iron on low heat') are apparel laundry copy on a wall-art and homeware store. They are factually wrong, not merely badly styled. Both accordions are removed; if per-product material copy is wanted later it comes from Shopify metafields, which `normalizeProduct` does not currently expose.

MOBILE. Image first, FULL-BLEED 100vw with no gutter, `contain` inside a 4/5 bone-2 well so nothing is cropped, presented as a `scroll-snap-type: x mandatory` gallery. Beneath it: a 64px thumbnail scroll-snap strip (direct access, tappable) PLUS a tabular `01 / 04` counter — not dots, and not an unannounceable 1px progress rule. The gutter returns for everything else. The metadata block COMPRESSES from stacked lines to one ' · ' separated row so the fold still reaches the price. Then title at --t-h3, price, options, quantity, in-flow Add to Cart. The existing `StickyAddToCart` is kept and redesigned — solid bone bar, 1px ink top rule, truncated title, tabular price, square ink button, no blur, no shadow, no radius, with `padding-bottom: max(0.75rem, env(safe-area-inset-bottom))`. The `<div ref={sentinelRef} className="h-px md:hidden" />` stays exactly where it is; both IntersectionObservers (sentinel + `document.querySelector('footer')`) survive, and the footer stays a real `<footer>` element. The specification band stays cobalt and DOES use accordions here, first panel open by default, where the vertical cost genuinely justifies them.

### About

DESKTOP — the one inversion in the system. The whole page root carries `.o29-field--olive`, so the fixed header inverts to bone type and a bone focus ring with no markup duplication and no observer.

MASTHEAD: bone metadata, h1 at --t-display in bone across cols 1–9. --space-hold.

BODY: two columns of --t-lead bone text in cols 1–5 and 7–11 (8.36:1). NO PHOTOGRAPH ANYWHERE ON ABOUT. `assets/about-us.jpg` is deleted — it is a beige Scandinavian gallery wall featuring a DIOR poster and a Chanel-logo print, i.e. the forbidden aesthetic plus third-party trademarks the store does not own. A surreal art brand whose About page opens with a stock studio interior is the exact template trap the brief names. The page is type, colour and one object.

THE OBJECT: the site's single flat matte disc — one flat bone fill, no radial gradient, no shading, no highlight, no shadow — placed so it crosses the horizon between the olive room and the bone band below. It is the only circle in a system where `--radius: 0rem`, and licensing exactly one curve is what makes the hard-edge rule read as a decision rather than a limitation. `aria-hidden`.

THE BONE INTERRUPTION: one full-bleed bone band, --space-hold tall, carrying three values in ink across three columns — an inversion inside an inversion. Back to olive for the closing line and a bone square CTA with an olive label (8.36:1 both directions).

VERMILION FOOTER: olive meeting vermilion across a hard edge is precisely the relationship in reference image 1, and it is the only place in the system those two touch.

DELETED: the entire fabricated Copenhagen narrative ('DDouble was born from a simple observation…', museum-grade paper, archival inks, European artist collaborations, 'fully sustainable' packaging), the Values trio copy, and the CTA headline 'Discover the collection'. Every claim is unverifiable and several contradict the real catalogue (rugs, pillows, acrylic shelves). This is a full rewrite, not a reskin.

MOBILE. Olive ground. h1 at --t-h1. Single-column text at --t-lead. The disc is REMOVED below 768px — it competes for a canvas that small and the mobile motif ceiling is two per room. The three values become three separate full-width bone bands stacked at ~42svh each, so the olive→bone→olive inversion happens three times as you scroll — a rhythm that exists only on mobile and could not be produced by shrinking the desktop 3-col. Vermilion footer with the small Ø29 bottom-right at --t-h2.

### Chrome

HEADER, DESKTOP (80px). Wordmark `ØBJECT 29` top-left as live text in Archivo 600 at --t-xs, tracking .22em — never centred, and the fragile `left-[33%] / md:left-[42%] / lg:left-[45%] -translate-x-1/2` absolute-positioning hack is deleted. Nav in metadata style: `SHOP / COLLECTIONS / ABOUT / CONTACT`. Hover and active draw a 1px rule beneath the item via `scaleX(0→1)`, origin left. UTILITIES ARE WORDS, NOT ICONS: `SEARCH`, `CART (2)`, `SAVED (3)`, `ACCOUNT`, with tabular-nums counts. Replacing the lucide Search / ShoppingBag / User / Menu glyphs with words is the loudest available anti-template signal and costs nothing. The circular count badges are deleted; the count is simply part of the word, keeping `aria-live="polite"` on the cart count. `backdrop-blur-xl` and `shadow-[0_1px_0_0_#E5E5E1]` are both deleted — scrolled state is solid bone plus a 1px hairline. The Collections mega menu stops being a floating blurred white card and becomes a full-width `.o29-field--cobalt` BAND that pushes down from the header's bottom edge with a 1px bottom rule: collection list in metadata style in cols 1–4, one `collection.image` in cols 8–12. No shadow, no blur, no radius, no card. The skip-to-content link targeting `#main` is preserved, and `#main` stays on every page shell including AuthLayout and AccountLayout.

EVERYTHING THAT MUST SURVIVE IN NAVBAR: the `useShopifyCart(country)` instance for `totalItems`, the `<CartDrawer>` mount point, `useFavorites` count, the `isAuthenticated` account/login switch, `useAllProducts` client-side search with Enter → `/shop?q=`, `useCollections` with the NAV_LINKS fallback, the scroll listener, the body overflow lock, `usePanelFocus` + `useEscapeClose` on both panels, the mega-menu `relatedTarget` blur guard, the outside-mousedown close excluding `searchToggleRef`, and the route-change close effect. The last two are deliberate fixes from commit a16721f.

HEADER, MOBILE (56px). Wordmark left; `MENU` and `CART (2)` as words right. Menu opens a full-screen `.o29-field--ink` curtain — bone nav items at --t-h2 on 1px rules, currency selector and account at the foot in metadata, `clip-path` inset from the top at --dur-curtain. Focus moves into the curtain and returns to the trigger on close, reusing the existing hooks unchanged.

CART DRAWER — the most conservative surface in the system, permanently. 100vw mobile, 480px desktop. Bone ground, `border-inline-start: 1px solid var(--o29-ink)`, flat `rgba(28,27,23,.5)` overlay: the current `backdrop-blur-sm` and `shadow-2xl` are removed. ZERO brand colour, ZERO motion beyond the slide-in, ZERO radius, ZERO motifs. Header row `CART (3)` in metadata plus a bare X — and the `aria-labelledby="cart-heading"` → `<h2 id="cart-heading">` pair and the manual `aria-modal="true"` stay matched (Radix 1.x does not emit it here). Line items: 64×80 image in a bone-2 well, title --t-sm, tabular price, square stepper at 44px per cell, and `REMOVE` as a text link rather than a trash icon — icons are ambiguous at the moment of deletion. Per-line currency is never rendered: `parseCart` sets `currency: node.merchandise.currencyCode`, a field ProductVariant does not have, so it is always undefined; every price goes through `<Price>`. The free-shipping meter becomes a 2px hairline track with an ochre fill — ochre's only cart appearance — driven by `shippingProgress(totalPrice, FREE_SHIPPING_THRESHOLD)` on raw numbers with the label through `<Price>`. Checkout: full-width square ink, 56px, `padding-bottom: max(0.75rem, env(safe-area-inset-bottom))`. The two inline GA4 closures (`remove_from_cart` after `await removeItem`, `begin_checkout` before `checkout()`) are lifted into named handlers in the same file so a future JSX rewrite cannot silently delete them. The four text-only VISA/Mastercard/PayPal/Apple Pay 'badges' are removed — they are an unverified claim about accepted methods and the rebrand must not turn them into marks it cannot license. THE CHECKOUT BUTTON STAYS INSIDE CARTDRAWER: `checkout()`'s fallback reads `cart?.checkoutUrl` from that hook instance's own state, so a freshly-mounted component calling it does nothing at all for a logged-out shopper.

FOOTER — one composition, two grounds. `.o29-field--vermilion` on Home / About / Contact; `.o29-field--ink` on Shop / Product / Favorites / account / all legal. Newsletter in cols 1–5: a transparent input on a 1px bone bottom rule, placeholder in FULL bone at weight 400 against the label's 500 — opacity is never used to differentiate text on vermilion. Copy must not promise delivery the system cannot make: `handleSubscribe` only calls `setSubscribed(true)` and there is no endpoint. Link columns in cols 7–12 in metadata style, fed by `useCollections` with the existing FALLBACK_COLLECTIONS. The dead 'Size Guide → /faq' link and the bare `https://facebook.com` placeholder are removed. Then --space-tight, then the bottom row: copyright metadata left, and the small uncropped `Ø29` at --t-h1 in bone at the BOTTOM-RIGHT CORNER of the field — exactly where the mark sits in all four reference artworks. This is the brand's real signature. The element stays a literal `<footer>`; StickyAddToCart's second IntersectionObserver queries `document.querySelector('footer')` by element name. Mobile: newsletter full width, links as a 2-col metadata grid, Ø29 stays bottom-right at --t-h2.

AUTH SHELL (`AuthLayout`, shared by Login / Register / ForgotPassword / ResetPassword) — `.o29-field--sky` on the root, full bleed, no Navbar and no Footer (unchanged). There is NO CARD: the form sits directly on the sky field separated by a 1px ink/30 rule, which also kills the known trap where the 'or' divider's label background is hardcoded `#F9F9F7` and breaks the moment the page ground changes. The 56px solid icon square becomes the `Ø29` mark in ink. Inputs: transparent, 1px ink border (8.21:1), h-12, 16px font on mobile to stop iOS zoom. `role="alert"` + the `id`/`aria-describedby` pairs stay matched.

ACCOUNT (`AccountLayout` + five pages) — bone only, zero saturated fields. These screens are quiet utility; colour-blocking them would fight their purpose. One metadata label per section header is the entire surreal budget. The conditional `!import.meta.env.VITE_SHOPIFY_CUSTOMER_SYNC_ENDPOINT` notice SURVIVES and gets an intentional home as a metadata line — it is the user-facing explanation for why Orders and Addresses are empty, not leftover clutter. The mobile `overflow-x-auto` nav row gets `overscroll-behavior-x: contain`. Ink footer.

404 (`src/lib/PageNotFound.jsx`) — `.o29-field--sky`, the one licensed joke: a vermilion doorway band that opens onto nothing, `ERROR 404 / LOCATION: UNDEFINED` in metadata, the attempted pathname echoed back as escaped text, and a real router `<Link>` home replacing `window.location.href = '/'`. The Base44 admin note ('the AI hasn't implemented this page yet') is deleted.

## Design tokens — paste-ready

### `src/index.css`

```css
/* ══════════════════════════════════════════════════════════════════════
   ØBJECT 29 — src/index.css
   Replaces the current lines 5–112. The three @tailwind directives at
   lines 1–3 stay exactly as they are.
   The shadcn variable NAMES are unchanged so every src/components/ui/*
   primitive keeps compiling; only their VALUES change, and they now point
   at the same HSL channel triplets as the --o29-* layer, so there is one
   colour idiom and Tailwind opacity modifiers keep working.
   ══════════════════════════════════════════════════════════════════════ */

/* ── 1. FACES ─────────────────────────────────────────────────────────── */
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 300 600;
  font-display: swap;
  src: url("/fonts/inter-latin.woff2") format("woff2");
}

/* Archivo Variable (Omnibus-Type, SIL OFL 1.1) — display only.
   Build EXACTLY in this order; subsetting alone keeps both full axis
   ranges and roughly doubles the file:
     fonttools varLib.instancer "Archivo[wdth,wght].ttf" \
       wght=400:600 wdth=85:112 -o archivo-trim.ttf
     pyftsubset archivo-trim.ttf --flavor=woff2 \
       --output-file=public/fonts/archivo-latin.woff2 \
       --layout-features='kern,liga,calt,tnum' \
       --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+2212,U+2192'
   U+00D8 (Ø) and U+00F8 (ø) are inside U+0000-00FF, so the ØBJECT 29
   wordmark stays live selectable text and never becomes an SVG.
   Do not "optimise" that unicode range later. Target ~46 KB. */
@font-face {
  font-family: "Archivo";
  font-style: normal;
  font-weight: 400 600;
  font-stretch: 85% 112%;
  font-display: swap;
  src: url("/fonts/archivo-latin.woff2") format("woff2");
}

/* Metric-matched fallbacks. Without these, font-display:swap reflows the
   176px display line at the LCP moment. Re-measure with a real overlay
   before shipping; these are calibrated against Arial. */
@font-face {
  font-family: "Archivo Fallback";
  src: local("Arial");
  size-adjust: 96%; ascent-override: 92%; descent-override: 24%; line-gap-override: 0%;
}
@font-face {
  font-family: "Inter Fallback";
  src: local("Arial");
  size-adjust: 107%; ascent-override: 90%; descent-override: 22%; line-gap-override: 0%;
}

@layer base {
  :root {
    /* ── 2. SHADCN LAYER — names unchanged, values retuned ──────────── */
    --background: 43 35% 92%;      /* o29 bone      */
    --foreground: 48 10% 10%;      /* o29 ink       */
    --card: 43 35% 92%;
    --card-foreground: 48 10% 10%;
    --popover: 43 35% 92%;
    --popover-foreground: 48 10% 10%;
    --primary: 48 10% 10%;         /* ink fill      */
    --primary-foreground: 43 35% 92%;
    --secondary: 42 30% 87%;       /* o29 bone-2    */
    --secondary-foreground: 48 10% 10%;
    --muted: 42 30% 87%;
    --muted-foreground: 46 9% 35%; /* o29 slate     */
    --accent: 42 30% 87%;          /* hover SURFACE — never ochre */
    --accent-foreground: 48 10% 10%;
    --destructive: 11 70% 41%;     /* o29 vermilion */
    --destructive-foreground: 43 35% 92%;
    --border: 42 24% 81%;          /* o29 rule  — decorative hairline */
    --input: 41 12% 46%;           /* o29 edge  — functional 3.66:1  */
    --ring: 48 10% 10%;
    --radius: 0rem;                /* square everything, one line     */
    --chart-1: 224 68% 33%; --chart-2: 11 70% 41%; --chart-3: 39 75% 56%;
    --chart-4: 70 26% 22%;  --chart-5: 46 9% 35%;
    /* sidebar-* block from the old file may be deleted; nothing reads it */

    /* ── 3. FONT STACKS ─────────────────────────────────────────────── */
    --font-body:    'Inter','Inter Fallback',ui-sans-serif,system-ui,sans-serif;
    --font-heading: 'Inter','Inter Fallback',ui-sans-serif,system-ui,sans-serif;
    --font-display: 'Archivo','Archivo Fallback','Inter',ui-sans-serif,sans-serif;
    --font-mono: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;

    /* ── 4. ØBJECT 29 PALETTE — HSL channel triplets ────────────────── */
    --o29-bone:      43 35% 92%;   /* #F2EEE3  the room. every page starts here */
    --o29-bone-2:    42 30% 87%;   /* #E8E2D4  the mat well behind every artwork */
    --o29-rule:      42 24% 81%;   /* #DAD3C3  decorative hairline ONLY          */
    --o29-edge:      41 12% 46%;   /* #837A67  functional control border 3.66:1  */
    --o29-slate:     46 9% 35%;    /* #615E51  the ONE muted text value          */
    --o29-ink:       48 10% 10%;   /* #1C1B17  all primary type + primary fill   */
    --o29-cobalt:   224 68% 33%;   /* #1B398D  structural ink                    */
    --o29-vermilion: 11 70% 41%;   /* #B23A1F  emotional ink                     */
    --o29-ochre:     39 75% 56%;   /* #E3A83B  micro-mark only, never a field    */
    --o29-olive:     70 26% 22%;   /* #42472A  /about ground ONLY                */
    --o29-sky:      223 23% 73%;   /* #AAB3CA  auth shell + 404 ONLY             */

    /* ── 5. TYPE SCALE (360 → 1440px) ───────────────────────────────── */
    --t-meta:    0.6875rem;                                        /* 11px fixed */
    --t-xs:      0.75rem;                                          /* 12px fixed */
    --t-sm:      0.875rem;                                         /* 14px fixed */
    --t-base:    clamp(0.9375rem, 0.8958rem + 0.185vw, 1.0625rem); /* 15 → 17    */
    --t-lead:    clamp(1.125rem,  1.0417rem + 0.370vw, 1.375rem);  /* 18 → 22    */
    --t-h3:      clamp(1.25rem,   1.1250rem + 0.556vw, 1.625rem);  /* 20 → 26    */
    --t-h2:      clamp(1.75rem,   1.3333rem + 1.852vw, 3rem);      /* 28 → 48    */
    --t-h1:      clamp(2.5rem,    1.5000rem + 4.444vw, 5.5rem);    /* 40 → 88    */
    --t-display: clamp(3.5rem,    1.0000rem + 11.111vw, 11rem);    /* 56 → 176   */
    --t-mega:    clamp(6rem,      1.3333rem + 20.741vw, 22rem);    /* 96 → 352   */

    --lh-mega: .78;  --lh-display: .86; --lh-h1: .92; --lh-h2: 1;
    --lh-h3: 1.2;    --lh-lead: 1.45;   --lh-body: 1.6; --lh-meta: 1;
    --tr-mega: -.05em; --tr-display: -.035em; --tr-h1: -.028em;
    --tr-h2: -.02em;   --tr-h3: -.01em;       --tr-body: 0; --tr-meta: .18em;

    /* ── 6. SPACE / GRID ────────────────────────────────────────────── */
    --page-max: 1600px;
    --gutter:      clamp(1.25rem, 0.3333rem + 4.074vw, 4rem);   /*  20 →  64 */
    --space-tight: clamp(3rem,   2rem      + 4.444vw, 6rem);    /*  48 →  96 */
    --space-quiet: clamp(6rem,   4rem      + 8.889vw, 12rem);   /*  96 → 192 */
    --space-hold:  clamp(9rem,   6rem      + 13.333vw, 18rem);  /* 144 → 288 */
    --header-h: 3.5rem;
    --hit: 2.75rem;                 /* 44px — the tap-target floor */

    /* ── 7. MOTION ──────────────────────────────────────────────────── */
    --ease-room:    cubic-bezier(.22,.61,.36,1);
    --ease-shift:   cubic-bezier(.65,0,.35,1);
    --ease-curtain: cubic-bezier(.83,0,.17,1);
    --dur-instant: 90ms;  --dur-shift: 220ms; --dur-curtain: 420ms;
    --dur-reveal: 620ms;  --dur-scale: 900ms; --stagger: 70ms;
    --shift-y: 3px;       --shift-rot: .3deg;
  }

  @media (min-width: 768px) { :root { --header-h: 5rem; } }

  /* ── 8. COLOUR-FIELD MECHANISM ─────────────────────────────────────
     Put .o29-field--x on a <section>, or on a PAGE ROOT div to invert the
     whole page including the fixed <header> (Navbar is a DOM descendant of
     that div in every page, so these custom properties inherit into it).
     KEEP IT THAT WAY: if Navbar is ever hoisted above <Routes> into a
     shared layout, every colour page silently loses its inverted chrome. */
  :root, .o29-field--bone {
    --bg: hsl(var(--o29-bone));      --fg: hsl(var(--o29-ink));
    --fg-muted: hsl(var(--o29-slate));
    --hairline: hsl(var(--o29-rule)); --control: hsl(var(--o29-edge));
    --focus: hsl(var(--o29-ink));     --mark: hsl(var(--o29-rule));
  }
  .o29-field--ink {
    --bg: hsl(var(--o29-ink));       --fg: hsl(var(--o29-bone));
    --fg-muted: hsl(var(--o29-rule));
    --hairline: hsl(var(--o29-rule) / .38); --control: hsl(var(--o29-bone));
    --focus: hsl(var(--o29-bone));   --mark: hsl(var(--o29-ochre));
  }
  .o29-field--cobalt {
    --bg: hsl(var(--o29-cobalt));    --fg: hsl(var(--o29-bone));
    --fg-muted: hsl(var(--o29-rule));
    --hairline: hsl(var(--o29-rule) / .45); --control: hsl(var(--o29-bone));
    --focus: hsl(var(--o29-bone));   --mark: hsl(var(--o29-bone) / .14);
  }
  /* vermilion: bone is the ONLY legible foreground. Secondary text is
     differentiated by weight and size, NEVER by opacity — bone at 75%
     over vermilion drops under 4.5:1. */
  .o29-field--vermilion {
    --bg: hsl(var(--o29-vermilion)); --fg: hsl(var(--o29-bone));
    --fg-muted: hsl(var(--o29-bone));
    --hairline: hsl(var(--o29-rule) / .55); --control: hsl(var(--o29-bone));
    --focus: hsl(var(--o29-bone));   --mark: hsl(var(--o29-bone) / .12);
  }
  .o29-field--olive {
    --bg: hsl(var(--o29-olive));     --fg: hsl(var(--o29-bone));
    --fg-muted: hsl(var(--o29-rule));
    --hairline: hsl(var(--o29-rule) / .4); --control: hsl(var(--o29-bone));
    --focus: hsl(var(--o29-bone));   --mark: hsl(var(--o29-bone) / .12);
  }
  .o29-field--sky {
    --bg: hsl(var(--o29-sky));       --fg: hsl(var(--o29-ink));
    --fg-muted: hsl(var(--o29-ink)); /* slate is 3.10:1 on sky — forbidden */
    --hairline: hsl(var(--o29-ink) / .3);  --control: hsl(var(--o29-ink));
    --focus: hsl(var(--o29-ink));    --mark: hsl(var(--o29-ink) / .1);
  }
  .o29-field { background-color: var(--bg); color: var(--fg); }

  /* ── 9. BASE ───────────────────────────────────────────────────────── */
  * { @apply border-border; }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* NEVER overflow-x:hidden here — it creates a scroll container and
       silently breaks position:sticky (PDP buy column, Shop filter rule). */
  }
  body {
    background-color: var(--bg);
    color: var(--fg);
    overflow-x: clip;               /* clip does NOT break sticky */
    font-family: var(--font-body);
    font-size: var(--t-base);
    line-height: var(--lh-body);
    font-optical-sizing: auto;
    text-rendering: optimizeLegibility;
  }

  h1, h2, .o29-display {
    font-family: var(--font-display);
    font-weight: 500;               /* 300 is banned system-wide */
    text-wrap: balance;
    hyphens: none;
  }
  p { text-wrap: pretty; }

  /* The signature small type. The negative inline-end margin cancels the
     trailing letter-space so the optical right edge lands on the grid. */
  .o29-meta {
    font-family: var(--font-body);
    font-size: var(--t-meta);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: var(--tr-meta);
    line-height: var(--lh-meta);
    color: var(--fg-muted);
    font-variant-numeric: tabular-nums;
    margin-inline-end: -0.18em;
  }

  .o29-hit { min-height: var(--hit); min-width: var(--hit); }

  ::selection { background-color: hsl(var(--o29-ochre)); color: hsl(var(--o29-ink)); }

  :focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: hsl(var(--o29-bone)); }
  ::-webkit-scrollbar-thumb { background: hsl(var(--o29-edge)); border-radius: 0; }
  ::-webkit-scrollbar-thumb:hover { background: hsl(var(--o29-ink)); }
}

/* ── 10. KEYFRAMES ──────────────────────────────────────────────────── */
@keyframes heart-pop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }
.animate-heart-pop { animation: heart-pop var(--dur-shift) var(--ease-shift); }

/* the loading indicator: a 1px ink rule sweeping the container. Not a spinner. */
@keyframes rule-sweep { 0% { transform: scaleX(0); transform-origin: left; }
  50% { transform: scaleX(1); transform-origin: left; }
  51% { transform: scaleX(1); transform-origin: right; }
  100% { transform: scaleX(0); transform-origin: right; } }

.animate-in { animation-duration: var(--dur-curtain); animation-fill-mode: both; }

/* ── 11. REDUCED MOTION — reverses commit 0c817d7, deliberately ─────── */
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-instant: 1ms; --dur-shift: 1ms; --dur-curtain: 1ms;
    --dur-reveal: 1ms;  --dur-scale: 1ms; --stagger: 0ms;
    --shift-y: 0px;     --shift-rot: 0deg;
  }
  *, *::before, *::after {
    animation-duration: 1ms !important;    /* 1ms, not 0 — transitionend and */
    animation-iteration-count: 1 !important; /* measured max-height still fire */
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
  html { scroll-behavior: auto; }
}

```

### `tailwind.config.js` — `theme.extend`

```js
// tailwind.config.js — the `extend` object. Everything already present
// (colors.background … colors.sidebar, fontFamily, keyframes.accordion-*,
// animation.accordion-*) STAYS UNCHANGED so src/components/ui/* keeps
// compiling. Add / override exactly the keys below.

module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        /* …all existing shadcn mappings unchanged… */

        // Raw brand ramp. Channel triplets, so Tailwind opacity modifiers
        // (text-o29-ink/70, border-o29-rule/40) keep working.
        o29: {
          bone:      'hsl(var(--o29-bone) / <alpha-value>)',
          'bone-2':  'hsl(var(--o29-bone-2) / <alpha-value>)',
          rule:      'hsl(var(--o29-rule) / <alpha-value>)',
          edge:      'hsl(var(--o29-edge) / <alpha-value>)',
          slate:     'hsl(var(--o29-slate) / <alpha-value>)',
          ink:       'hsl(var(--o29-ink) / <alpha-value>)',
          cobalt:    'hsl(var(--o29-cobalt) / <alpha-value>)',
          vermilion: 'hsl(var(--o29-vermilion) / <alpha-value>)',
          ochre:     'hsl(var(--o29-ochre) / <alpha-value>)',
          olive:     'hsl(var(--o29-olive) / <alpha-value>)',
          sky:       'hsl(var(--o29-sky) / <alpha-value>)',
        },

        // Field-relative aliases. These resolve to whatever .o29-field--*
        // is active on the nearest ancestor, so ONE set of classes styles
        // chrome on bone, cobalt, vermilion, olive, ink and sky.
        // No <alpha-value> support by design — use the o29 ramp for that.
        field:     'var(--bg)',
        'field-fg':    'var(--fg)',
        'field-muted': 'var(--fg-muted)',
        hairline:      'var(--hairline)',
        control:       'var(--control)',
        focusring:     'var(--focus)',
        mark:          'var(--mark)',
      },

      // --radius is 0rem, so calc(var(--radius) - 4px) would evaluate to an
      // invalid -4px. Pin sm/md to literal 0.
      borderRadius: { lg: 'var(--radius)', md: '0px', sm: '0px', pill: '9999px' },

      fontSize: {
        meta:    ['var(--t-meta)',    { lineHeight: 'var(--lh-meta)',    letterSpacing: 'var(--tr-meta)' }],
        xs:      ['var(--t-xs)',      { lineHeight: '1.2',               letterSpacing: '0.14em' }],
        sm:      ['var(--t-sm)',      { lineHeight: '1.45' }],
        base:    ['var(--t-base)',    { lineHeight: 'var(--lh-body)',    letterSpacing: 'var(--tr-body)' }],
        lead:    ['var(--t-lead)',    { lineHeight: 'var(--lh-lead)' }],
        h3:      ['var(--t-h3)',      { lineHeight: 'var(--lh-h3)',      letterSpacing: 'var(--tr-h3)' }],
        h2:      ['var(--t-h2)',      { lineHeight: 'var(--lh-h2)',      letterSpacing: 'var(--tr-h2)' }],
        h1:      ['var(--t-h1)',      { lineHeight: 'var(--lh-h1)',      letterSpacing: 'var(--tr-h1)' }],
        display: ['var(--t-display)', { lineHeight: 'var(--lh-display)', letterSpacing: 'var(--tr-display)' }],
        mega:    ['var(--t-mega)',    { lineHeight: 'var(--lh-mega)',    letterSpacing: 'var(--tr-mega)' }],
      },

      spacing: {
        gutter: 'var(--gutter)',
        tight:  'var(--space-tight)',
        quiet:  'var(--space-quiet)',
        hold:   'var(--space-hold)',
        header: 'var(--header-h)',
        hit:    'var(--hit)',
      },

      maxWidth: { page: 'var(--page-max)', reading: '65ch', lead: '48ch' },
      minHeight: { field: '82svh', 'field-mobile': '100svh' },
      aspectRatio: { plate: '4 / 5' },   // the mat well, everywhere

      transitionDuration: {
        instant: 'var(--dur-instant)',
        shift:   'var(--dur-shift)',
        curtain: 'var(--dur-curtain)',
        reveal:  'var(--dur-reveal)',
        scale:   'var(--dur-scale)',
      },
      transitionTimingFunction: {
        room:    'var(--ease-room)',
        shift:   'var(--ease-shift)',
        curtain: 'var(--ease-curtain)',
      },

      keyframes: {
        /* accordion-down / accordion-up stay exactly as they are */
        'rule-sweep': {
          '0%':   { transform: 'scaleX(0)', transformOrigin: 'left' },
          '50%':  { transform: 'scaleX(1)', transformOrigin: 'left' },
          '51%':  { transform: 'scaleX(1)', transformOrigin: 'right' },
          '100%': { transform: 'scaleX(0)', transformOrigin: 'right' },
        },
      },
      animation: {
        /* accordion-down / accordion-up stay exactly as they are */
        'rule-sweep': 'rule-sweep 1.4s var(--ease-room) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

// NOTE: input-otp.jsx references an `animate-caret-blink` keyframe that has
// never existed in this config. That file is dead code and is deleted in
// stage 3 rather than having the keyframe added.
```

### Contrast reference

```
All values computed from the HSL triplets AS TAILWIND WILL RENDER THEM (round-tripped through hsl() → rgb), not from the source hex, so these are the numbers that ship. WCAG 2.1: 4.5:1 normal text, 3:1 large text (≥24px or ≥18.66px bold) and non-text UI components (1.4.11).

─── GROUND: BONE #F2EEE3 (every page default; Shop body; Product above fold; cart; account; legal) ───
ink #1C1B17 on bone ......... 14.87  ALL type, h1–h3, prices, nav, primary button fill
slate #615E51 on bone .......  5.61  the ONE muted value: metadata, helper text, placeholders, breadcrumb inactive
cobalt #1B398D on bone ......  8.98  inline link text
vermilion #B23A1F on bone ...  5.15  error text, sold-out flags
olive #42472A on bone .......  8.36  About page links when inverted back to bone
edge #837A67 on bone ........  3.66  PASSES 1.4.11 — input borders, unselected option buttons, quantity stepper, checkbox edges. NEVER text.
rule #DAD3C3 on bone ........  1.29  DECORATIVE ONLY — section dividers, mat hairline. Never text, never a focus ring, never an input border, never a sole state carrier.
ochre #E3A83B on bone .......  1.82  DECORATIVE ONLY — the 8px square beside an ink-underlined active filter, the hover underline. Never text, never the sole indicator of state.
FOCUS RING on bone: ink, 2px, offset 2px .... 14.87

─── GROUND: BONE-2 #E8E2D4 (the mat well behind every artwork; skeletons; mega band) ───
ink on bone-2 ............... 13.34  plate captions, index numerals
slate on bone-2 .............  5.04  micro captions inside the well
cobalt on bone-2 ............  8.06
vermilion on bone-2 .........  4.62
edge on bone-2 ..............  3.29  PASSES 1.4.11 — this is why --o29-edge was darkened from #8C8370 (which was 2.91:1 here and would have failed for any control placed on a mat well)
rule on bone-2 ..............  1.16  decorative hairline only

─── GROUND: INK #1C1B17 (footers on transactional pages; mobile curtain; cart checkout button; cookie banner) ───
bone on ink ................. 14.87  all type, footer links, checkout label
rule on ink ................. 11.56  muted footer text, legal line, column headers
ochre on ink ................  8.15  the Ø29 fragment, the free-shipping fill, micro-marks
bone-2 on ink ............... 13.34
edge on ink .................  4.06  hairline rules inside the ink field (also clears 1.4.11)
FOCUS RING on ink: bone, 2px, offset 2px .... 14.87
CONTROL BORDERS on ink: bone ................ 14.87

─── GROUND: COBALT #1B398D (Home hero wall; Shop masthead band; Product spec band; mega panel) ───
bone on cobalt ..............  8.98  headline, body, metadata, CTA label
rule on cobalt ..............  6.99  secondary/muted text on the field
bone-2 on cobalt ............  8.06
ochre on cobalt .............  4.92  permitted micro-mark on this ground only
ink on cobalt ...............  1.70  FORBIDDEN — never ink on a colour field
FOCUS RING on cobalt: bone, 2px, offset 2px .  8.98
CONTROL BORDERS on cobalt: bone .............  8.98
CTA on cobalt: bone fill + cobalt label .....  8.98 both directions

─── GROUND: VERMILION #B23A1F (Home hero doorway band; footer on Home/About/Contact; 404 doorway) ───
bone on vermilion ...........  5.15  AA at all sizes — a vermilion footer with bone body copy is legal
bone-2 on vermilion .........  4.62  secondary type
rule on vermilion ...........  4.00  1.4.11 ONLY — the newsletter input underline, column rules. Never body text.
ink on vermilion ............  2.92  FORBIDDEN
ochre on vermilion ..........  2.84  FORBIDDEN — this is why the focus ring is never ochre
SECONDARY TEXT on vermilion: bone at weight 400 against the label's 500. Opacity is NEVER used to differentiate text here — bone at 75% over vermilion falls under 4.5:1.
FOCUS RING on vermilion: bone, 2px, offset 2px  5.15
CONTROL BORDERS on vermilion: bone ...........  5.15

─── GROUND: OLIVE #42472A (/about only) ───
bone on olive ...............  8.36  headline, body, metadata
rule on olive ...............  6.50  muted text
ochre on olive ..............  4.58  permitted micro-mark
bone-2 on olive .............  7.39
FOCUS RING on olive: bone ...  8.36
CONTROL BORDERS on olive: bone  8.36
CTA on olive: bone fill + olive label  8.36 both directions

─── GROUND: SKY #AAB3CA (auth shell + 404 only) ───
ink on sky ..................  8.21  all type, form labels, input text
cobalt on sky ...............  4.96  links, the 'Create an account' footer link
olive on sky ................  4.62  unused, listed for completeness
slate on sky ................  3.10  FORBIDDEN as text — on sky the muted role collapses into ink (see .o29-field--sky)
bone on sky .................  1.83  FORBIDDEN
FOCUS RING on sky: ink, 2px, offset 2px ......  8.21
CONTROL BORDERS on sky: ink ..................  8.21 (auth inputs sit on sky with ink borders)
AUTH CARD: there is no card. The form sits directly on the sky field, separated by a 1px ink/30 rule — no panel, no surface, no shadow.

─── INTERACTIVE STATES ───
PRIMARY BUTTON rest: ink fill / bone label ............ 14.87
PRIMARY BUTTON hover: cobalt fill / bone label ........  8.98  (the site's one recurring colour surprise; background-color only, zero transform)
PRIMARY BUTTON disabled: bone-2 fill / slate label ....  5.04  plus a 1px edge border (3.29 on bone-2) and cursor-not-allowed.
  CRITICAL: `disabled:opacity-50` is DELETED from every CTA. 50% of a saturated fill on a warm off-white ground still reads as an active button, and this disabled state is the only affordance telling a shopper that Add to Cart is unavailable because an option combination is unmatched.
OUTLINE BUTTON rest: transparent / ink label 14.87 / edge border 3.66
OUTLINE BUTTON hover: bone-2 fill / ink label 13.34
UNSELECTED OPTION: edge border 3.66 / ink label 14.87
SELECTED OPTION: ink fill / bone label 14.87
UNAVAILABLE OPTION: edge border 3.66, slate label 5.61, a 1px ink diagonal strike, PLUS `aria-disabled="true"` and the visible word 'Sold out'. The strike is never the sole indicator.
ERROR TEXT: vermilion on bone 5.15, with role="alert" and the id/aria-describedby pair preserved.
ORDER STATUS BADGES (/account/Orders): recoloured but kept semantically distinct and NEVER hue-only — each keeps its uppercase status word. Paid/fulfilled = ink on bone-2 (13.34); pending = ink on ochre (8.15); cancelled/refunded = bone on vermilion (5.15). Brand vermilion and status vermilion are the same token by design, disambiguated by the word.

─── EXCLUDED FROM THE HEX SWEEP ───
GoogleIcon.jsx's four Google brand hexes (#4285F4 #34A853 #FBBC05 #EA4335) are trademark-locked and stay hardcoded.
```

## Stage plan

STAGE 2 — FOUNDATION (tokens, fonts, guards). No page is redesigned; this stage only changes what the tokens resolve to.
Ships: the tokensCss block into src/index.css (shadcn names retained, values retuned, --o29-* triplets, .o29-field--* classes, type/space/motion scales, .o29-meta, .o29-hit, the reduced-motion block); the tailwindExtend block with borderRadius.sm/md pinned to literal 0px; the Archivo build (varLib.instancer THEN pyftsubset) into public/fonts/archivo-latin.woff2 plus both metric-matched fallback faces; index.html title/description/theme-color/og:site_name/og:image/apple-touch-icon, the Archivo preload added and the broken /assets/home-800.jpg preload DELETED; the new favicon.svg; CONSENT_KEY exported from CookieConsent.jsx and imported into analytics.js; queries.js added to .prettierignore and excluded from every sweep glob; the CI greps wired into npm run lint (no hex in src/*.jsx outside GoogleIcon.jsx, no font-light or font-weight:300, no backdrop-blur, no box-shadow outside the inset-hairline form, no rounded-* except rounded-none, no linear-gradient except the 0%-stop field form).
Verify: npm run build passes. ui/accordion.jsx and ui/toast.jsx are the canaries — FAQ's accordion and every toast must visibly adopt the new palette with zero component edits, proving the token swap is live. Everything else still looks like the old site because it is all hardcoded hex. Font payload measured: 48 KB → ~94 KB, CLS unchanged on a production build.

STAGE 3 — PURE REFACTOR. Zero className changes; this diff should read as a no-op.
Ships: ProductDetail split into PdpGallery / PdpBuyBox / PdpDetails / PdpRelated with logic moved verbatim (variant seeding, selectedVariant matcher, handleAddToCart, view_item, DOMPurify config, JSON-LD, sentinelRef). CartDrawer's two inline GA4 closures lifted into named handlers in the same file. Reveal + useReducedMotion created; FadeIn becomes a thin alias so all ~140 call sites keep compiling. Container / Section / PageShell / PlateWell / MetaLabel / Mark / ColourField created but not yet adopted. src/config/editorial.js created. Deletions: ProtectedRoute.jsx, UserNotRegisteredError.jsx, input-otp.jsx, App.jsx's unreachable authError branch; ui/toast.jsx's missing X import fixed and its duplicate fixed container removed.
Verify: grep the five GA4 event names — count unchanged. Full purchase run: browse → PDP → change variant → add → drawer → remove → checkoutUrl, signed out, after a hard reload. Screenshot diff of /, /shop and a PDP should be pixel-identical.

STAGE 4 — PRIMITIVES. The leaf components covered by the most call sites.
Ships: ui/button (all six variants repointed at tokens, never renamed; sizes raised past 44px; disabled:opacity-50 replaced by the bone-2/slate/edge treatment), ui/input, ui/label, ui/country-select, ui/address-autocomplete, ui/toaster. Then ProductCard (PlateWell, no blur heart), Price (unchanged, styled at call sites), StockIndicator (no raw Tailwind palette, never hue-only), Breadcrumb (MetaLabel), Navbar, Footer (tone prop), CartDrawer, StickyAddToCart, CurrencySelector.
Verify: the 44px floor on the quantity stepper, option chips and mobile filter bar at 390px. Tab through Navbar, the cart drawer, CountrySelect and AddressAutocomplete with the global focus ring as the only indicator. Cart badge, drawer contents and PDP button state still agree (the module-level listener fan-out). Hex count in src/components/ drops to zero outside GoogleIcon.jsx.

STAGE 5 — THE COMMERCE PAGES. Shop and Product, restyled in place on top of stage 3's split.
Ships: Shop's cobalt masthead band, text filter bar with the ink underline plus ochre square, the 3-up mat-well grid at a 4:1 row-to-column gap ratio, the empty void as a positioned grid item pinned to a row end (never inside filtered.map), the restyled mobile bottom sheet. Product's asymmetric layout, vertical plate sequence, real-data metadata block, square option buttons with the unavailable strike, the cobalt specification band below the fold, and the deletion of MaterialsContent/CareContent and the trust-strip icons.
Verify: view_item_list fires once per filter change and never on Load more; view_item once per PDP; add_to_cart once per click from BOTH the desktop button and the sticky bar. Deep-link /shop?category=x&price=30-50&sort=price-asc. Load more twice and confirm no double-append and no void cell mid-row. Test a multi-option product (button enables, StockIndicator not stuck on In Stock) and a single-image product. Confirm nothing in the buy column animates.

STAGE 6 — THE EDITORIAL PAGES. Home and About, where the identity actually lands.
Ships: the CSS-painted hero room (cobalt wall, bone floor, hard horizon, vermilion doorway band), the hero artwork resolved through editorial.js with its bone-2 canvas at final aspect, the collection index with focus-within parity and the mobile sliver treatment, the grid break, the single oversized cropped Ø29, the vermilion footer. About's olive field, the flat disc, the bone values interruption. All content deletions: TESTIMONIALS, the Instagram strip, the scrim banner, the lifestyle grid, the Copenhagen narrative, and all seven assets/ imports removed alongside their files. The build-time hero preload injected by scripts/generate-sitemap.mjs.
Verify: npm run build (not dev) — a dangling static import is a hard build failure. LCP measured on a production build before and after; the hero <img> keeps fetchpriority=high, explicit width/height and its srcSet, and stays outside any Reveal wrapper. No text over any artwork anywhere. Two brand colours on Home, counted.

STAGE 7 — CHROME AND EDGES. Everything a shopper reaches less often but still sees.
Ships: the sky auth shell (AuthLayout + four pages, divider trap removed), AccountLayout and all five account pages on bone with the sync notice preserved and Orders' status badges recoloured but never hue-only, Favorites (plus its missing Seo block), the shared legal layout for Privacy/Terms/Shipping/Returns with the FadeIn noise stripped and the threshold interpolated through <Price>, FAQ rewritten against real fulfilment, Contact, the 404 with the doorway joke and the router Link, the cookie banner. Seo.jsx brand strings and DEFAULT_IMAGE, ProductDetail's two inline domain literals repointed at the shared SITE_URL, robots.txt, npm run sitemap, and the public/sw.js cache bump in the same commit as the index.html change.
Verify: Google Rich Results Test on a PDP and on FAQ. Confirm the sw update actually evicts the old shell on a returning profile. Check the Addresses EDIT path, not just Create (the ISO-code vs country-name round trip). Confirm the account area still degrades honestly with VITE_SHOPIFY_CUSTOMER_SYNC_ENDPOINT unset.

STAGE 8 — VERIFICATION AND CLEANUP. Nothing new ships; this stage is the gate.
Ships: FadeIn.jsx deleted and its last call sites migrated to Reveal; PageShell adopted by the 13 pages that currently hand-repeat the shell (still opt-in, not a layout route); any remaining hex retired.
Verify, all of which must pass before merge: (1) THE ACCEPTANCE TEST — JavaScript disabled AND prefers-reduced-motion: reduce, every route renders complete, correctly composed and fully readable; a blank section means the section is wrong, not the test. (2) Scripted overflow check at 320/360/390/430px on every route: document.documentElement.scrollWidth === clientWidth. (3) Full keyboard pass with the focus ring as the only indicator, on bone, cobalt, vermilion, olive, ink and sky grounds. (4) Contrast audit of every pairing in the contrast table against the built CSS. (5) GA4 DebugView through browse → PDP → add → drawer → remove → checkout, with the five event counts recorded. (6) Production-build LCP and CLS versus the pre-rebrand baseline. (7) All CI greps green. (8) A last full purchase, signed out and signed in, reaching the real Shopify checkoutUrl.

## Risk register

| Sev | Risk | Mitigation |
|---|---|---|
| HIGH | index.html preloads /assets/home-800.jpg, a path that only resolves in dev. In production Vite emits /assets/home-800-<hash>.jpg and vercel.json's rewrite `/((?!assets/).*)` excludes /assets/, so the preload 404s today and the LCP image gets no preload benefit. Deleting it without replacement puts the new LCP behind JS boot plus a GraphQL round trip — a regression against a build that at least intends to preload. | Delete the stale preload in stage 2. In the same stage, make the LCP a painted CSS rectangle (the hero room) rather than a photograph, so composition, headline, horizon and CTA all render before any network response. In stage 6, extend scripts/generate-sitemap.mjs to resolve the hero product's image URL at build time and inject a <link rel=preload as=image imagesrcset> into index.html. Verify with a production build and the network panel; npm run dev hides this entirely. |
| HIGH | There is no usable hero image in the repository. assets/ is Scandinavian interior stock showing Dior, Chanel, Saint Laurent, Porsche and Picasso — the forbidden aesthetic plus trademarks and famous-person likenesses. product_photo/ is dropship packshots. product_photo_new/ is four Instagram SCREENSHOTS carrying carousel arrows, pagination dots, an avatar and a recognisable person. None can ship. | The hero is a CSS-painted room; the single photographic element is one artwork resolved live from Shopify via src/config/editorial.js (heroProductHandle → heroFallbackCollection → first collection). While the query is in flight the canvas renders as a flat bone-2 rectangle at the FINAL aspect ratio, so the box never shifts. If every query fails, the canvas stays bone-2 and carries the metadata stamp — it reads as a work de-installed from the wall, a deliberate state in the brand's own language, never as a broken shop. Do not ship copy implying the store is not open. |
| HIGH | Converting 630 hardcoded hex occurrences across 40 .jsx files with a blind find-and-replace changes MEANING, not just colour. #1A1A1A serves as text, button fill, active border, badge background and inverted-panel background; #F1F0EC serves as image placeholder, hover surface, disabled field and section background; #E5E5E1 serves as border, divider, progress track and skeleton. | Map by ROLE per call site, not by value, and convert file-by-file starting with the leaf primitives (button, input, label, ProductCard, Breadcrumb, StockIndicator) which are covered by the most call sites per edit. The scripted first pass is: #F9F9F7→bone, #F1F0EC→bone-2, #E5E5E1 and #D9D2C5→rule, #6B6B67 and #5A5A56→slate (two greys collapse into one at 5.61:1), #1A1A1A→ink, #2A2A2A→cobalt (the hover becomes the cobalt moment). Every result is then reviewed per file; borders that are functional get --o29-edge, not --o29-rule. Exclude GoogleIcon.jsx's four Google hexes. CI gate: grep -rnE '#[0-9A-Fa-f]{3,8}' src --include=*.jsx returns zero outside GoogleIcon.jsx. |
| HIGH | Renaming brand-named persisted keys during the rebrand silently resets every returning visitor: ddouble_consent (consent re-prompt plus GA4 dark until re-accept), shopify_cart_id and the scoped cart key (orphaned carts), shopify_favorites / shopify_wishlist (saved items gone), shopify_currency, ddouble_default_country. ddouble_consent is especially dangerous because it is a hand-copied literal in analytics.js, not an import from CookieConsent.jsx. | KEEP EVERY KEY EXACTLY AS-IS through the rebrand; the visible brand name has no dependency on them. Before touching either file, export CONSENT_KEY from CookieConsent.jsx and import it into analytics.js so the two can never diverge. The ONE key that must change is public/sw.js's CACHE name — bump it in the same commit as the index.html change, or returning visitors keep getting the old shell served network-first-with-fallback. |
| HIGH | Rewriting the presentation of the three files carrying the most logic — ProductDetail (643 lines), Shop (473), CartDrawer (187) — breaks checkout, variant selection or the GA4 funnel. There are no tests in the repo. | Split before restyling. Stage 3 is a PURE REFACTOR that moves logic verbatim into PdpGallery/PdpBuyBox/PdpDetails/PdpRelated and keeps Shop's ProductGrid/CollectionProducts/FilterGroup intact, changing zero classNames — reviewable as a no-op diff. Only stage 5 restyles. After each stage, manually run: add to cart from PDP and from a grid, change variant, quantity +/-, open drawer, remove item, reach the Shopify checkoutUrl SIGNED OUT after a hard reload, load more on /shop, and deep-link /shop?category=x&price=30-50&sort=price-asc. |
| HIGH | GA4 events disappear silently. trackEvent no-ops without consent and gtag, so a dropped call is indistinguishable from a shopper who declined cookies and will not surface in local testing at all. The calls live inside JSX handlers in exactly the files being rewritten, and Shop's view_item_list dedupe is a ref keyed on the filter set. | Grep the five event names before each stage and record call sites and payload shapes; grep again after and confirm the count is unchanged. Lift CartDrawer's two inline closures into named handlers so a JSX rewrite cannot delete them. Never inline a new onClick on either add-to-cart surface — reuse handleAddToCart. Then accept cookies locally and watch the dataLayer through a full browse → PDP → add → drawer → checkout run, confirming view_item_list fires once per filter change and never on Load more. |
| HIGH | Fluid display type causes layout shift at the LCP moment. --t-display reaches 176px and Archivo loads with font-display: swap; the current build has no metric-matched fallback, so the fallback-to-Archivo swap reflows the largest text on the page. | Ship the metric-matched @font-face fallbacks in tokensCss ('Archivo Fallback' and 'Inter Fallback', local('Arial') with size-adjust/ascent-override/descent-override) and re-measure them against the real faces with an overlay before shipping. Preload Archivo. Give the hero canvas an explicit aspect-ratio so the image box never resizes. Measure CLS on a production build before and after the type change; budget zero regression against today's single-woff2 load. |
| HIGH | Real Shopify data breaks the composition: variable-length titles, 1 to 5 images, no second image, 1 to 25 variants, long option lists, unavailable variants, and artworks of wildly different aspect ratios and ground colours. | Every product image sits in the identical PlateWell (fixed 4/5, object-fit contain, identical mat padding, bone-2 ground, hairline), so a loud olive work and a quiet bone one occupy the same footprint and nothing is ever cropped. The PDP uses a vertical plate sequence instead of a thumbnail strip, so a one-image product needs no branch. No type is ever placed on or behind an artwork. Titles use text-wrap: balance and the PDP title is --t-h2, not display. Unavailable variants get a 1px diagonal strike plus aria-disabled plus the word 'Sold out'. Collection imagery uses collection.image, which normalizeCollection already returns — never an N+1 fan-out of per-collection product queries. |
| HIGH | The deliberate @inContext GB pinning is undone by a formatting pass. The directive is injected by the regex /(query\s+\w+(?:\s*\([^)]*\))?)/ over raw template literals, so reindenting, running prettier, adding a comment above `query AllProducts`, or renaming an operation can move the insertion or lose it — silently restoring Shopify currency conversion and reverting commit 4d8da9d. | Treat src/lib/shopify/queries.js as off-limits to every formatting, lint --fix and token-migration pass; add it to .prettierignore and exclude it from the hex sweep glob. It contains no presentational content and is out of rebrand scope entirely. If it must ever change (e.g. to add `options` to ALL_PRODUCTS), log the generated query once and assert @inContext(country: GB) appears immediately after the operation signature in all three pinned queries. |
| MEDIUM | Restoring prefers-reduced-motion reverses commit 0c817d7 ('Force animations always on, ignore reduced-motion'), which deliberately deleted both FadeIn's reduced-motion branch and the global media block four commits ago. | Surface it as an owner decision, not a bug fix — it is listed in decisionsNeedingOwnerInput. If approved, the implementation collapses duration tokens to 1ms rather than 0 (so transitionend listeners and the PDP's measured max-height accordions still fire) and keeps heart-pop and the drawer slide functional rather than applying a blanket kill. Separately, FadeIn's inline opacity:0 with no IntersectionObserver fallback is a genuine bug that hides content when JS is slow or blocked, and is fixed regardless. |
| MEDIUM | Horizontal overflow on mobile from the new bleeding elements — the oversized cropped Ø29, the doorway band, the mobile h1 that overruns the gutter, the full-bleed hero and the grid break. | body { overflow-x: clip } — never overflow-x: hidden on html, which creates a scroll container and silently breaks position:sticky (the PDP buy column uses lg:sticky lg:top-28 today and the Shop filter rule will too). Every bleeding element lives inside its own position:relative; overflow:clip wrapper so the crop is local. Scripted gate before shipping: at 320, 360, 390 and 430px assert document.documentElement.scrollWidth === clientWidth on every route. |
| MEDIUM | Introducing a shared layout changes Suspense boundaries and route-scoped effects. All pages are React.lazy and Navbar currently remounts per route, relying on a location.pathname effect to close its menus. Hoisting Navbar above <Routes> would also break the .o29-field custom-property cascade that inverts the header on colour pages. | Ship PageShell as an opt-in wrapper component pages import, NOT as a <Route element> layout, and only convert after stage 8. Add a code comment on the field classes stating that Navbar must remain a DOM descendant of the page root div. Verify the mobile menu, mega menu and search still close on navigation, that /account is not double-wrapped, and that the four auth pages and the 404 stay outside the shell. |
| MEDIUM | Losing the focus layer during retokenisation. There is no per-component focus ring on Input, Button or the custom comboboxes — everything depends on one global :focus-visible rule, and commit a16721f already stripped an outline from the search input. | The global rule becomes outline: 2px solid var(--focus), and every .o29-field--* sets --focus to a value verified at 5.15:1 or better on that ground (bone on cobalt 8.98, bone on vermilion 5.15, bone on olive 8.36, bone on ink 14.87, ink on sky 8.21, ink on bone 14.87). No per-component outline-none may be added. Tab through Login, Register, Addresses (including CountrySelect and AddressAutocomplete), the Navbar skip link and the cart drawer with the outline as the only indicator. |
| MEDIUM | Motion delays a shopper reaching a product. Shop applies FadeIn delay={i * 0.04} over the ACCUMULATED list, so after one Load more the last items already wait ~4s, and the brief's slower motion would make it worse. | Cap the stagger at Math.min(i, 5) * 0.07s in the Reveal primitive rather than at the call site, so no caller can reintroduce an uncapped index. Nothing in the purchase path animates at all. |
| MEDIUM | Tap targets shrink below 44px during the token migration. The min-h-11 / min-w-11 classes appear 33 times across 8 files on quantity buttons, option chips, close buttons and icon links, and ui/button's h-8/h-9 sizes are already below that floor. | Encode 44px into the new button and control primitives (the .o29-hit utility) and raise ui/button's sizes rather than relying on per-page overrides. Pad, never shrink. Add safe-area padding to every bottom-fixed bar: padding-bottom: max(0.75rem, env(safe-area-inset-bottom)). Verify the quantity stepper, option chips and the mobile filter bar on a 390px viewport. |
| MEDIUM | Restyling fabricated or contradictory content instead of removing it: three invented testimonials with names and cities, apparel laundry copy on a wall-art store, '€50 free shipping' against FREE_SHIPPING_THRESHOLD=100 GBP, [Company legal name] placeholders behind a TODO, and a Base44 admin note in the 404. | Delete the TESTIMONIALS array rather than restyling it. Delete MaterialsContent and CareContent. Interpolate the threshold through <Price> into FAQ and Shipping so the number cannot drift again — a stated shipping threshold that disagrees with checkout is consumer-law exposure. Escalate the legal placeholders to the owner as a content decision. |
| LOW | Shipping known-broken code forward: App.jsx renders <UserNotRegisteredError /> with no import, ui/toast.jsx renders <X /> with no lucide import, ProtectedRoute.jsx and input-otp.jsx are dead code, and input-otp references an animate-caret-blink keyframe that has never been defined. | Fix the toast import, delete ProtectedRoute.jsx, UserNotRegisteredError.jsx, input-otp.jsx and the unreachable authError branch in the same pass. Note separately that /account/* is consequently unguarded — guarding it is a deliberate follow-up decision, not part of the visual work. |
| LOW | A new top-level static directory for rebrand assets would get neither vercel.json's immutable Cache-Control (scoped to /assets/(.*)) nor the SPA rewrite exemption. | Route new hashed build assets through Vite imports so they land under /assets/, and put only stable-named files in public/. If a new static directory is unavoidable, add matching header and rewrite-exclusion rules in vercel.json in the same commit. |

## Owner decisions

### Source the hero artwork. There is no shippable hero image in the repo: assets/ is forbidden Scandinavian stock containing Dior, Chanel, Porsche and Picasso; product_photo_new/ is four Instagram screenshots with UI chrome and a recognisable person. The hero cannot ship from disk.

- **Options:** (a) Curate a Shopify collection with handle `hero` (or set ISSUE.heroProductHandle) holding one people-free artwork — zero code change afterwards, editorial control from admin. (b) Commission a dedicated people-free cover artwork at ≥2400px and drop it in as a static import. (c) Ship the CSS-painted room with the bone-2 canvas and metadata stamp as the permanent hero.
- **Recommendation:** (a) now, (b) later. The room, the headline, the horizon and the CTA are all painted in CSS and do not depend on the image resolving, so (c) is a working fallback, not a failure state — but the site is stronger with one artwork hung on that wall.

### Reverse commit 0c817d7 ('Force animations always on, ignore reduced-motion'). The brief requires respecting prefers-reduced-motion; four commits ago you deliberately removed it.

- **Options:** (a) Restore it as specified: duration tokens collapse to 1ms, heart-pop and the drawer slide still function, nothing is blanket-killed. (b) Keep animations forced on and drop the brief's requirement. (c) Restore it but add a per-component escape hatch for specific motion you want unconditional.
- **Recommendation:** (a). Separately and regardless of your answer, FadeIn's inline opacity:0 with no IntersectionObserver fallback is a real bug that can leave content permanently invisible when JS is slow or blocked; that gets fixed either way.

### Delete fabricated and contradictory content rather than restyling it: the three invented testimonials with names and cities (Home.jsx:25-29), the whole Copenhagen origin story and quality claims in About, the PDP's apparel laundry copy, and the FAQ/Shipping '€50 free shipping' claim that contradicts FREE_SHIPPING_THRESHOLD=100 GBP.

- **Options:** (a) Delete all of it and rewrite against real fulfilment. (b) Keep the narrative but soften the unverifiable claims. (c) Keep as-is under the new brand.
- **Recommendation:** (a). The brief forbids fake reviews; the laundry copy is factually wrong on rugs and posters; and a published shipping threshold that disagrees with what checkout charges is consumer-law exposure, not a copy preference. The FAQ copy is also compiled into FAQPage JSON-LD, so every false claim is published as structured data.

### Add a second typeface. Archivo Variable for display raises the font payload from 48 KB to roughly 94 KB.

- **Options:** (a) Ship Archivo (wght 400:600, wdth 85:112, latin subset incl. U+00D8 so the Ø wordmark stays live text). (b) Stay on Inter alone at weight 500 with tighter display tracking and no width axis.
- **Recommendation:** (a). Inter has no width axis, so 'type as graphic element' has only one lever, and at 176px its UI-optimised forms read as an operating system rather than a gallery. If the fonttools step cannot be run, (b) still works — the system degrades, it does not break.

### localStorage, consent and service-worker keys. A brand-wide find-and-replace of 'ddouble' would hit ddouble_consent (analytics.js hardcodes the same literal separately), ddouble_default_country, and the sw cache ddouble-shell-v1.

- **Options:** (a) Keep every localStorage key and bump ONLY the service-worker cache name. (b) Rename everything and accept a consent re-prompt, lost carts, lost favourites and reset country for every returning visitor. (c) Rename with a one-time migration that copies each old value to the new key.
- **Recommendation:** (a). The visible brand name has no dependency on these strings. The sw cache name MUST be bumped in the same commit as the index.html change or returning visitors keep getting the old shell.

### Canonical domain. It is hardcoded in five places that can drift: Seo.jsx SITE_URL, ProductDetail's SITE_URL plus two further inline 'https://ddouble-store.vercel.app/product/...' literals in the JSON-LD, scripts/generate-sitemap.mjs, public/robots.txt, and all 33 <loc> entries in public/sitemap.xml.

- **Options:** (a) Move to an objekt29 domain now, hoist one shared constant, and regenerate the sitemap. (b) Stay on the current vercel.app domain and change brand strings only.
- **Recommendation:** Decide before stage 7 either way. Whichever you choose, the two inline ProductDetail literals get replaced with the shared constant first — mismatched Product/Offer URLs against the canonical is a rich-result error, not a cosmetic one.

### Delete the off-brand image assets from the repo: assets/ (7 JPGs, all static ES-module imports, two named in the index.html preload) and product_photo/ (15 files, ~3.4 MB, referenced by nothing in src/).

- **Options:** (a) Delete both, removing each import in the same edit. (b) Delete assets/ only and keep product_photo/ as Shopify upload source material. (c) Keep both on disk, unimported.
- **Recommendation:** (a) for assets/ — it contains third-party trademarks and a person's likeness the store has no rights to, and it is the exact forbidden aesthetic. Confirm product_photo/ against the Shopify admin before deleting; if those are the masters for live listings, keep them outside the repo instead.

## Verified pre-existing defects

Found while inspecting; each confirmed against the source. Fix opportunistically in the stage that touches the file.

| Where | Defect | Reachable today? |
|---|---|---|
| `src/App.jsx:84` | `<UserNotRegisteredError />` rendered with no import | No — `authError` is never set by AuthContext, so the branch is dead. Would throw if reached. |
| `src/components/ui/toast.jsx:75` | `<X />` rendered with no lucide import | No — `ToastClose` is never rendered by `toaster.jsx`. Toasts work fine. |
| `index.html` | Preloads `/assets/home-800.jpg`; the build emits `/assets/home-800-<hash>.jpg` | **Yes** — the preload 404s in production. Confirmed against `dist/`. |
| `src/pages/FAQ.jsx:18`, `src/pages/Shipping.jsx:45` | Claim "free shipping over €50"; `FREE_SHIPPING_THRESHOLD` is `100` and `STORE_CURRENCY` is GBP | **Yes** — and FAQ compiles into FAQPage JSON-LD, so the claim is published as structured data. |
| `Privacy`, `Terms`, `Shipping`, `Returns` | `[Company legal name]` / `[Registered address]` placeholders behind a `TODO` | **Yes** — live on the site. |
| `src/lib/shopify/cart.js` `parseCart` | Reads `node.merchandise.currencyCode`, which no query selects; `line.currency` is always `undefined` | No — no UI consumes it; `<Price>` formats through CurrencyContext. |
| `src/lib/PageNotFound.jsx` | Base44 scaffolding — an admin note reading "the AI hasn’t implemented this page yet"; `window.location.href` full reload instead of a router `Link` | Admin note is dead (`user.role` is never set). The full page reload is live. |
| `src/pages/ProductDetail.jsx` | Main image hardcoded `width={1200} height={1600}` regardless of real dimensions, which `normalizeProduct` already carries as `img.width`/`img.height` | **Yes** — wrong intrinsic ratio for any artwork that is not 3:4. |
| `src/hooks/useShopifyCart.js` | `addItem` passes `useCurrency().country` (display country, e.g. DE) as the cart buyer identity, while catalogue queries are pinned to GB | **Yes** — pre-existing and deliberate-looking; out of rebrand scope, flagged only so no one "harmonises" it during a restyle. |
