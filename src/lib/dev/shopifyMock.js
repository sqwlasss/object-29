/**
 * DEV-ONLY Storefront API stand-in.
 *
 * Lets the storefront run with no Shopify credentials, so the design can be
 * reviewed on a machine that has no `.env.local` — and so layout can be
 * exercised against awkward data (four different artwork aspect ratios, a
 * product whose variant matrix has real holes in it, a single-image product).
 *
 * Activated only by `npm run dev:preview`, which sets VITE_MOCK_SHOPIFY=1.
 * The import in src/main.jsx is guarded by `import.meta.env.DEV`, so Vite
 * drops this module and its data from every production build.
 *
 * The placeholder artwork is deliberately abstract — flat colour fields in the
 * brand palette — so nobody mistakes it for real catalogue imagery.
 */
const ART = {
  1: `data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 850\"><rect width=\"600\" height=\"850\" fill=\"#42472A\"/><circle cx=\"300\" cy=\"300\" r=\"150\" fill=\"#E3A83B\"/><rect y=\"640\" width=\"600\" height=\"210\" fill=\"#B23A1F\"/></svg>")}`,
  2: `data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 900 560\"><rect width=\"900\" height=\"560\" fill=\"#E8E2D4\"/><path d=\"M300 560V270a150 150 0 0 1 300 0v290Z\" fill=\"#1B398D\"/><rect y=\"500\" width=\"900\" height=\"60\" fill=\"#B23A1F\"/></svg>")}`,
  3: `data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 700 700\"><rect width=\"700\" height=\"700\" fill=\"#1B398D\"/><circle cx=\"430\" cy=\"260\" r=\"130\" fill=\"#F2EEE3\"/><rect y=\"520\" width=\"700\" height=\"180\" fill=\"#42472A\"/></svg>")}`,
  4: `data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 500 900\"><rect width=\"500\" height=\"900\" fill=\"#AAB3CA\"/><rect x=\"120\" y=\"180\" width=\"260\" height=\"420\" fill=\"#B23A1F\"/><circle cx=\"250\" cy=\"720\" r=\"90\" fill=\"#1C1B17\"/></svg>")}`,
};

const money = (a) => ({ amount: String(a), currencyCode: "GBP" });
const img = (n, w, h) => ({
  node: { id: `img${n}`, url: ART[n], altText: `Placeholder artwork ${n}`, width: w, height: h },
});

function variantEdges(opts) {
  return {
    edges: opts.map((o, i) => ({
      node: {
        id: `gid://shopify/ProductVariant/${i + 1}`,
        title: `${o.size} / ${o.frame}`,
        price: money(o.price),
        compareAtPrice: null,
        availableForSale: o.available,
        selectedOptions: [
          { name: "Size", value: o.size },
          { name: "Frame", value: o.frame },
        ],
        image: null,
      },
    })),
  };
}

const PRODUCTS = [
  {
    id: "gid://shopify/Product/1", title: "Room With No Door", handle: "room-with-no-door",
    tags: ["surreal"], productType: "Archival print",
    images: { edges: [img(1, 600, 850), img(3, 700, 700)] },
    opts: [
      { size: "30×40", frame: "None", available: true, price: 48 },
      { size: "30×40", frame: "Oak", available: true, price: 88 },
      { size: "50×70", frame: "None", available: true, price: 64 },
      { size: "50×70", frame: "Oak", available: false, price: 104 },
      { size: "70×100", frame: "None", available: false, price: 92 },
      { size: "70×100", frame: "Oak", available: false, price: 132 },
    ],
  },
  { id: "gid://shopify/Product/2", title: "Arch, Unoccupied", handle: "arch-unoccupied", tags: ["surreal"], productType: "Archival print", images: { edges: [img(2, 900, 560)] }, opts: [{ size: "50×70", frame: "None", available: true, price: 64 }] },
  { id: "gid://shopify/Product/3", title: "Object 003", handle: "object-003", tags: ["surreal"], productType: "Archival print", images: { edges: [img(3, 700, 700)] }, opts: [{ size: "50×70", frame: "None", available: true, price: 72 }] },
  { id: "gid://shopify/Product/4", title: "Ceiling Study (Sky)", handle: "ceiling-study-sky", tags: ["interior"], productType: "Archival print", images: { edges: [img(4, 500, 900)] }, opts: [{ size: "30×40", frame: "None", available: true, price: 42 }] },
  { id: "gid://shopify/Product/5", title: "Plinth", handle: "plinth", tags: ["interior"], productType: "Rug", images: { edges: [img(1, 600, 850)] }, opts: [{ size: "160×230", frame: "None", available: true, price: 240 }] },
  { id: "gid://shopify/Product/6", title: "Horizon, Interrupted", handle: "horizon-interrupted", tags: ["surreal"], productType: "Archival print", images: { edges: [img(2, 900, 560)] }, opts: [{ size: "70×100", frame: "None", available: true, price: 96 }] },
  { id: "gid://shopify/Product/7", title: "Two Spheres", handle: "two-spheres", tags: ["surreal"], productType: "Archival print", images: { edges: [img(3, 700, 700)] }, opts: [{ size: "50×70", frame: "None", available: true, price: 68 }] },
  { id: "gid://shopify/Product/8", title: "Doorway", handle: "doorway", tags: ["interior"], productType: "Archival print", images: { edges: [img(4, 500, 900)] }, opts: [{ size: "50×70", frame: "None", available: true, price: 58 }] },
  { id: "gid://shopify/Product/9", title: "Floor, Red", handle: "floor-red", tags: ["interior"], productType: "Rug", images: { edges: [img(1, 600, 850)] }, opts: [{ size: "200×300", frame: "None", available: true, price: 310 }] },
];

function toNode(p) {
  const prices = p.opts.map((o) => o.price);
  const sizes = [...new Set(p.opts.map((o) => o.size))];
  const frames = [...new Set(p.opts.map((o) => o.frame))];
  return {
    id: p.id, title: p.title, handle: p.handle, tags: p.tags, productType: p.productType,
    description: `${p.title} — a constructed scene, printed as an open edition.`,
    descriptionHtml: `<p>${p.title} — a constructed scene from the ØBJECT 29 universe, printed as an open edition on archival stock.</p><ul><li>Pigment print</li><li>Unframed or oak frame</li></ul>`,
    priceRange: { minVariantPrice: money(Math.min(...prices)) },
    options: [{ name: "Size", values: sizes }, { name: "Frame", values: frames }],
    images: p.images,
    variants: variantEdges(p.opts),
  };
}

const COLLECTIONS = [
  { id: "c1", title: "Surreal", handle: "surreal", tag: "surreal", image: ART[3] },
  { id: "c2", title: "Interiors", handle: "interiors", tag: "interior", image: ART[4] },
];

function installShopifyMock() {
  const realFetch = window.fetch.bind(window);

  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : input && input.url;
    if (!url || !/graphql\.json/.test(url)) return realFetch(input, init);

    let body = {};
    try { body = JSON.parse(init.body); } catch { /* not ours */ }
    const q = body.query || "";
    let data = {};

    if (/query AllProducts/.test(q)) {
      data = { products: { edges: PRODUCTS.map((p) => ({ node: toNode(p) })), pageInfo: { hasNextPage: false, endCursor: null } } };
    } else if (/query ProductByHandle/.test(q)) {
      const p = PRODUCTS.find((x) => x.handle === body.variables?.handle);
      data = { productByHandle: p ? toNode(p) : null };
    } else if (/query AllCollections/.test(q)) {
      data = { collections: { edges: COLLECTIONS.map((c) => ({ node: { id: c.id, title: c.title, handle: c.handle, description: "", image: { id: c.id + "i", url: c.image, altText: c.title } } })) } };
    } else if (/query CollectionByHandle/.test(q)) {
      const c = COLLECTIONS.find((x) => x.handle === body.variables?.handle) || COLLECTIONS[0];
      data = {
        collection: {
          id: c.id, title: c.title, handle: c.handle, description: "",
          image: { id: c.id + "i", url: c.image, altText: c.title },
          products: { edges: PRODUCTS.filter((p) => p.tags.includes(c.tag)).map((p) => ({ node: toNode(p) })), pageInfo: { hasNextPage: false, endCursor: null } },
        },
      };
    } else if (/cartCreate|cartLinesAdd|cartLinesUpdate|cartLinesRemove|CartQuery|cartBuyerIdentityUpdate/.test(q)) {
      // Cart mutations are not simulated — checkout needs the real Storefront
      // API. Returning null keeps the UI in its empty-cart state rather than
      // pretending an order exists.
      data = { cart: null };
    }

    return Promise.resolve(new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
  };

  // eslint-disable-next-line no-console
  console.info(
    `%c[preview mode] Shopify API is mocked — ${PRODUCTS.length} placeholder objects. Cart and checkout are inert.`,
    "color:#1B398D;font-weight:600"
  );
}

// Self-installing on import, NOT exported and awaited.
//
// @shopify/storefront-api-client captures `fetch` when the client is
// CONSTRUCTED, and src/lib/shopify/client.js constructs it at module scope.
// ES module imports are hoisted and evaluated in order, so this file has to be
// imported BEFORE App.jsx — a dynamic import after it would patch a fetch the
// client has already captured, and every request would go to the real domain.
//
// Both operands are compile-time constants, so a production build evaluates
// this to false, and Rollup then tree-shakes the fixture data and every
// function above it away.
if (import.meta.env.DEV && import.meta.env.VITE_MOCK_SHOPIFY === '1') {
  installShopifyMock();
}
