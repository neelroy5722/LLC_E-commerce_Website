import "server-only";
import { prisma } from "@/lib/db";

/**
 * Server-side catalogue access. The product page reads from here so admin can
 * change prices, wood options, images, and availability without code changes.
 * All returns are plain serializable objects, safe to pass to client components.
 */

export interface CatalogSize {
  key: string;
  label: string;
  dimensions: string;
}
export interface CatalogHeight {
  key: string;
  label: string;
  deckHeightFt: number;
  blurb: string;
}
export interface CatalogWood {
  key: string;
  label: string;
  swatch: string;
  priceDelta: number; // whole dollars
}
export interface Catalog {
  sizes: CatalogSize[];
  heights: CatalogHeight[];
  woods: CatalogWood[];
  /** prices[sizeKey][heightKey] = base price in whole dollars */
  prices: Record<string, Record<string, number>>;
  /** stock[sizeKey][heightKey] = units on hand (0 → made to order) */
  stock: Record<string, Record<string, number>>;
  /** per-combination image overrides: images["size-height-wood"] = url */
  images: Record<string, string>;
  availability: "made_to_order" | "in_stock";
}

/** Default composed-image path convention (per the base model). */
export function variantImagePath(size: string, height: string, wood: string): string {
  return `/products/apt-bed-${size}-${height}-${wood}.svg`;
}

export async function getCatalog(): Promise<Catalog> {
  const [sizes, heights, woods, variants, product, overrides] = await Promise.all([
    prisma.size.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.height.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.wood.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.variant.findMany({ include: { size: true, height: true } }),
    prisma.product.findFirst(),
    prisma.productImage.findMany(),
  ]);

  const prices: Record<string, Record<string, number>> = {};
  const stock: Record<string, Record<string, number>> = {};
  for (const v of variants) {
    (prices[v.size.key] ??= {})[v.height.key] = v.basePrice;
    (stock[v.size.key] ??= {})[v.height.key] = v.stock;
  }

  const images: Record<string, string> = {};
  for (const o of overrides) images[`${o.sizeKey}-${o.heightKey}-${o.woodKey}`] = o.url;

  return {
    sizes: sizes.map((s) => ({ key: s.key, label: s.label, dimensions: s.dimensions })),
    heights: heights.map((h) => ({
      key: h.key,
      label: h.label,
      deckHeightFt: h.deckHeightFt,
      blurb: h.blurb,
    })),
    woods: woods.map((w) => ({
      key: w.key,
      label: w.label,
      swatch: w.swatch,
      priceDelta: w.priceDelta,
    })),
    prices,
    stock,
    images,
    availability: (product?.availability as Catalog["availability"]) ?? "made_to_order",
  };
}

/** Resolve the image for a combination — DB override, else file convention. */
export function resolveImage(catalog: Catalog, size: string, height: string, wood: string): string {
  return catalog.images[`${size}-${height}-${wood}`] ?? variantImagePath(size, height, wood);
}
