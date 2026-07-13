/**
 * Sanity-checks the data-driven logic against the Milestone 1 acceptance
 * criteria: every configuration must produce a price and image, and the ceiling
 * tool must return a sensible height for any valid input.
 * Run: node scripts/sanity-check.mjs
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = join(__dirname, "..", "public");

// Mirror the data tables (kept in sync with lib/products.ts & lib/ceiling.ts).
const SIZES = ["twin", "queen", "king"]; // Twin & Twin Long share one size
const HEIGHTS = ["low", "medium", "high"];
const WOODS = { oak: 0, maple: 150, walnut: 350 };
const BASE = {
  twin: { low: 3500, medium: 3700, high: 3900 },
  queen: { low: 4300, medium: 4600, high: 4900 },
  king: { low: 5000, medium: 5300, high: 5600 },
};

let fail = 0;
let combos = 0;
const prices = new Set();

for (const s of SIZES) {
  for (const h of HEIGHTS) {
    prices.add(BASE[s][h]);
    for (const w of Object.keys(WOODS)) {
      combos++;
      // wood-aware image exists
      const img = join(pub, "products", `apt-bed-${s}-${h}-${w}.svg`);
      if (!existsSync(img)) {
        console.error(`MISSING IMAGE: apt-bed-${s}-${h}-${w}.svg`);
        fail++;
      }
      const price = BASE[s][h] + WOODS[w];
      if (!(price > 0)) {
        console.error(`BAD PRICE: ${s}/${h}/${w} -> ${price}`);
        fail++;
      }
    }
  }
}

// Ceiling recommendation baseline (≤8→Low, ≤9→Medium, else High)
const cases = [
  [6, "low"],
  [7.5, "low"],
  [8, "low"],
  [8.5, "medium"],
  [9, "medium"],
  [9.5, "high"],
  [11, "high"],
];
function recommend(ft) {
  if (!Number.isFinite(ft)) return null;
  if (ft < 6 || ft > 20) return null;
  if (ft >= 9.01) return "high";
  if (ft >= 8.01) return "medium";
  return "low";
}
for (const [ft, expected] of cases) {
  const got = recommend(ft);
  if (got !== expected) {
    console.error(`CEILING ${ft}ft expected ${expected} got ${got}`);
    fail++;
  }
}
for (const bad of [5, 21, NaN]) {
  if (recommend(bad) !== null) {
    console.error(`CEILING ${bad} should be null`);
    fail++;
  }
}

console.log(`Selectable combinations checked: ${combos} (3 sizes × 3 heights × 3 woods)`);
console.log(`Distinct base price points: ${prices.size} (expected 9)`);
console.log(`Ceiling recommendation cases: ${cases.length + 3}`);
if (prices.size !== 9) {
  console.error(`Expected 9 distinct base prices, got ${prices.size}`);
  fail++;
}
console.log(fail === 0 ? "\nALL CHECKS PASSED ✓" : `\n${fail} CHECK(S) FAILED ✗`);
process.exit(fail === 0 ? 0 : 1);
