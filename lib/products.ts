/**
 * Data-driven product catalogue for the Apt.Bed configurator.
 *
 * Everything the configurator and pricing display need lives here so that in
 * Milestone 2 this module can be swapped for an admin-editable database table
 * without touching the UI. The UI never hard-codes a price, label, or image —
 * it always resolves from these structures.
 *
 * Sizes: Twin and Twin Long share a footprint (same width; Twin Long is only
 * longer), so they are presented as a single selectable size. Three sizes ×
 * two heights = the six variations.
 */

export type SizeId = "twin" | "queen" | "king";
export type HeightId = "medium" | "high";
export type WoodId = "oak" | "maple" | "walnut";

export interface SizeOption {
  id: SizeId;
  label: string;
  /** Mattress dimensions, shown as helper text. */
  dimensions: string;
}

export interface HeightOption {
  id: HeightId;
  label: string;
  /** Approx. deck height off the floor — drives the ceiling recommendation. */
  deckHeightFt: number;
  blurb: string;
}

export interface WoodOption {
  id: WoodId;
  label: string;
  /** Swatch color for the UI. */
  swatch: string;
  /** Upcharge added to the base variant price. */
  priceDelta: number;
}

export const SIZES: SizeOption[] = [
  { id: "twin", label: "Twin / Twin Long", dimensions: '38" × 80"' },
  { id: "queen", label: "Queen", dimensions: '60" × 80"' },
  { id: "king", label: "King", dimensions: '76" × 80"' },
];

export const HEIGHTS: HeightOption[] = [
  { id: "medium", label: "Medium", deckHeightFt: 4.5, blurb: "Balanced storage and headroom for most rooms." },
  { id: "high", label: "High", deckHeightFt: 5.5, blurb: "Maximum storage underneath — needs a taller ceiling." },
];

export const WOODS: WoodOption[] = [
  { id: "oak", label: "Oak", swatch: "#C9A26B", priceDelta: 0 },
  { id: "maple", label: "Maple", swatch: "#E4C89A", priceDelta: 150 },
  { id: "walnut", label: "Walnut", swatch: "#5C4033", priceDelta: 350 },
];

/**
 * Base variant price matrix: size × height. Three sizes × two heights yields
 * the six distinct base prices.
 */
export const BASE_PRICES: Record<SizeId, Record<HeightId, number>> = {
  twin: { medium: 3700, high: 3900 },
  queen: { medium: 4600, high: 4900 },
  king: { medium: 5300, high: 5600 },
};

export interface VariantSelection {
  size: SizeId;
  height: HeightId;
  wood: WoodId;
}

export function getSize(id: SizeId): SizeOption {
  return SIZES.find((s) => s.id === id)!;
}

export function getHeight(id: HeightId): HeightOption {
  return HEIGHTS.find((h) => h.id === id)!;
}

export function getWood(id: WoodId): WoodOption {
  return WOODS.find((w) => w.id === id)!;
}

/** Resolve the final price for a full selection (base + wood upcharge). */
export function getVariantPrice(selection: VariantSelection): number {
  const base = BASE_PRICES[selection.size][selection.height];
  return base + getWood(selection.wood).priceDelta;
}

/**
 * Resolve the product image for a selection. Images are composed from a single
 * base model (per the brief) with the wood finish baked into the frame — only
 * the bed recolors between finishes, the room stays constant. Files live in
 * /public/products and follow the `apt-bed-{size}-{height}-{wood}.svg`
 * convention so admin can later swap in real photography by replacing the file.
 */
export function getVariantImage(size: SizeId, height: HeightId, wood: WoodId): string {
  return `/products/apt-bed-${size}-${height}-${wood}.svg`;
}

/** Every combination the configurator can produce (used for validation/tests). */
export function allVariants(): VariantSelection[] {
  const out: VariantSelection[] = [];
  for (const s of SIZES) {
    for (const h of HEIGHTS) {
      for (const w of WOODS) {
        out.push({ size: s.id, height: h.id, wood: w.id });
      }
    }
  }
  return out;
}
