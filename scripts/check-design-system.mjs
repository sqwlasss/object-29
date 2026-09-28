#!/usr/bin/env node
/**
 * ØBJECT 29 design-system guard.
 *
 * Two kinds of check:
 *
 *   RATCHET  — a count that must never INCREASE. The rebrand converts 40+ files
 *              from hardcoded hex to tokens across several stages, so an
 *              all-or-nothing gate would be red for the whole project and get
 *              switched off. A ratchet is red the moment someone adds a new
 *              violation, and it tightens for free as files are converted.
 *              Lower the baselines in BASELINE as stages land.
 *
 *   ASSERT   — a hard invariant, red immediately if broken.
 *
 * Run via `npm run lint`. Update baselines with `node scripts/check-design-system.mjs --update`.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const BASELINE_PATH = join(ROOT, "scripts", "design-system-baseline.json");

/* ── file walking ──────────────────────────────────────────────────────── */

const EXTS = [".jsx", ".js", ".css"];
const EXEMPT = [
  // Google's brand hexes are fixed by their brand guidelines, not ours to tokenise.
  "src/components/GoogleIcon.jsx",
  // Dev-only Storefront fixture. Its hexes are inside placeholder SVG artwork,
  // which is content rather than styling, and the whole module is dropped from
  // production builds by the import.meta.env.DEV guard in src/main.jsx.
  "src/lib/dev/shopifyMock.js",
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTS.some((e) => entry.endsWith(e))) out.push(full);
  }
  return out;
}

/**
 * Blank out comments before scanning, preserving line numbers and length so
 * reported positions stay accurate.
 *
 * Without this, documentation that QUOTES the old code it replaced — "this
 * used to be bg-[#F9F9F7]" — counts as a live violation, which punishes
 * writing down why a change was made.
 *
 * Only block comments and whole-line `//` comments are stripped. A trailing
 * `//` is left alone so `https://…` inside a string is never mangled.
 */
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .split("\n")
    .map((line) => (/^\s*(\/\/|\*)/.test(line) ? " ".repeat(line.length) : line))
    .join("\n");
}

const files = walk(join(ROOT, "src"))
  .map((f) => ({
    path: relative(ROOT, f).split(sep).join("/"),
    text: stripComments(readFileSync(f, "utf8")),
  }))
  .filter((f) => !EXEMPT.includes(f.path));

function countMatches(re) {
  const hits = [];
  for (const f of files) {
    const lines = f.text.split("\n");
    lines.forEach((line, i) => {
      for (const m of line.matchAll(re)) hits.push({ file: f.path, line: i + 1, text: m[0] });
    });
  }
  return hits;
}

/* ── the ratchets ──────────────────────────────────────────────────────── */

const RATCHETS = {
  hex: {
    label: "hardcoded hex colours",
    re: /#[0-9A-Fa-f]{3,8}\b/g,
    fix: "use a token: text-o29-ink, bg-o29-bone, border-o29-rule, or the field aliases (text-field-fg, border-hairline)",
  },
  fontLight: {
    label: "font-weight below 400",
    // `font-weight: 300 600` inside @font-face is a variable-font RANGE
    // descriptor — it declares what the file supports, not what we set. Only a
    // single 300 value is a usage, so require a terminator after it.
    re: /font-light\b|font-weight:\s*300\s*(?=[;}!])/g,
    fix: "weight 300 is banned system-wide — use font-medium (500) at a larger size instead",
  },
  backdropBlur: {
    label: "backdrop-blur",
    re: /backdrop-blur/g,
    fix: "the system has no glassmorphism — use an opaque token surface",
  },
  radius: {
    label: "non-zero border radius",
    re: /rounded-(?:sm|md|lg|xl|2xl|3xl|full)\b/g,
    fix: "every surface is square; use rounded-none. Something round by SHAPE (a disc, an arch) takes rounded-[50%], which is deliberately not matched here",
  },
  shadow: {
    label: "box shadows",
    // Hairlines drawn as shadows are permitted, because they mark an edge
    // without occupying layout the way a border does — the mat well's inset
    // rule (`inset_0_0_0_1px_…`) and the header's underline (`0_1px_0_0_…`).
    // Both have zero blur and zero spread. Anything with real blur is
    // elevation, which this system does not use: objects are separated by
    // hairlines, not by float.
    re: /shadow-\[(?!inset_0_0_0_1px|0_1px_0_0)|shadow-(?:sm|md|lg|xl|2xl)\b/g,
    fix: "the system separates objects with hairlines, not shadows — only zero-blur hairline forms are allowed",
  },
};

/* ── the hard assertions ───────────────────────────────────────────────── */

async function assertInContextPinning() {
  // The single highest-severity regression risk in this codebase: @inContext
  // is injected into the Shopify queries by a REGEX over raw template
  // literals (src/lib/shopify/queries.js). A reformat, a prettier run, or a
  // comment added above `query AllProducts` can move or lose the insertion,
  // silently restoring Shopify currency conversion and reverting commit
  // 4d8da9d. This asserts the generated queries still carry the directive.
  const mod = await import(
    new URL("../src/lib/shopify/queries.js", import.meta.url).href
  );
  const failures = [];
  for (const name of ["ALL_PRODUCTS", "PRODUCT_BY_HANDLE", "COLLECTION_BY_HANDLE"]) {
    const fn = mod[name];
    if (typeof fn !== "function") {
      failures.push(`${name} is not an exported function`);
      continue;
    }
    const q = fn("GB");
    if (!q.includes("@inContext(country: GB)")) {
      failures.push(`${name}("GB") does not contain @inContext(country: GB)`);
      continue;
    }
    // It must sit immediately after the operation signature, before the first `{`.
    const head = q.slice(0, q.indexOf("{", q.indexOf("query")));
    if (!head.includes("@inContext(country: GB)")) {
      failures.push(`${name}: @inContext is present but not on the operation signature`);
    }
  }
  return failures;
}

/* ── run ───────────────────────────────────────────────────────────────── */

const update = process.argv.includes("--update");
const verbose = process.argv.includes("--verbose");

let baseline = {};
try {
  baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
} catch {
  if (!update) {
    console.error(`missing ${relative(ROOT, BASELINE_PATH)} — run with --update to create it`);
    process.exit(1);
  }
}

const results = {};
let failed = false;
const rows = [];

for (const [key, { label, re, fix }] of Object.entries(RATCHETS)) {
  const hits = countMatches(re);
  results[key] = hits.length;
  const allowed = baseline[key];

  if (update) {
    rows.push(["·", label, String(hits.length), ""]);
    continue;
  }
  if (hits.length > allowed) {
    failed = true;
    rows.push(["FAIL", label, `${hits.length} (max ${allowed})`, fix]);
    const fresh = hits.slice(0, 8);
    for (const h of fresh) rows.push(["", `  ${h.file}:${h.line}`, h.text, ""]);
    if (hits.length > 8) rows.push(["", `  … and ${hits.length - 8} more`, "", ""]);
  } else if (hits.length < allowed) {
    rows.push(["OK", label, `${hits.length} (was ${allowed}) — ratchet down`, ""]);
  } else {
    rows.push(["OK", label, String(hits.length), ""]);
  }
}

const inContextFailures = await assertInContextPinning();
if (inContextFailures.length) {
  failed = true;
  rows.push(["FAIL", "Shopify @inContext GB pinning", inContextFailures.join("; "), "see src/lib/shopify/queries.js — do not reformat that file"]);
} else {
  rows.push(["OK", "Shopify @inContext GB pinning", "all 3 queries pinned", ""]);
}

const w = [6, 34, 34];
console.log("\nØBJECT 29 design-system guard\n");
for (const [status, label, value, fix] of rows) {
  console.log(
    `  ${status.padEnd(w[0])}${label.padEnd(w[1])}${value.padEnd(w[2])}${verbose || status === "FAIL" ? fix : ""}`.trimEnd()
  );
}
console.log("");

if (update) {
  writeFileSync(BASELINE_PATH, JSON.stringify(results, null, 2) + "\n");
  console.log(`  baseline written to ${relative(ROOT, BASELINE_PATH)}\n`);
  process.exit(0);
}

if (failed) {
  console.error("  design-system guard failed. A ratchet only fails when a count goes UP.\n");
  process.exit(1);
}

const remaining = Object.entries(results).reduce((a, [, n]) => a + n, 0);
if (remaining > 0) console.log(`  ${remaining} violations remain from the pre-rebrand codebase; they ratchet down per stage.\n`);
process.exit(0);
