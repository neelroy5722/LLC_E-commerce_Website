import "server-only";
import { prisma } from "@/lib/db";
import { dollarsToCents } from "@/lib/money";
import { quoteFreight } from "@/lib/freight";

/** All configured state tax rates as { STATE: percent }, including "*" default. */
export async function getTaxRateMap(): Promise<Record<string, number>> {
  const rows = await prisma.taxRate.findMany();
  const map: Record<string, number> = {};
  for (const r of rows) map[r.state] = r.ratePercent;
  return map;
}

/** Sales-tax rate (%) for a shipping state, falling back to the "*" default. */
export async function getTaxRatePercent(state: string): Promise<number> {
  const code = (state || "").trim().toUpperCase();
  const row =
    (code && (await prisma.taxRate.findUnique({ where: { state: code } }))) ||
    (await prisma.taxRate.findUnique({ where: { state: "*" } }));
  return row?.ratePercent ?? 0;
}

export interface CartLineInput {
  sizeKey: string;
  heightKey: string;
  woodKey: string;
  quantity: number;
}

export interface PricedLine {
  sizeKey: string;
  heightKey: string;
  woodKey: string;
  label: string;
  unitPriceCents: number;
  quantity: number;
  lineCents: number;
}

export interface CartPriceBreakdown {
  lines: PricedLine[];
  subtotalCents: number;
  taxCents: number;
  freightCents: number;
  totalCents: number;
  taxRatePercent: number;
}

/**
 * Prices a whole cart (many configurations) server-side. Each line's unit price
 * is recomputed from the DB, tax is applied to the combined subtotal by shipping
 * state, and a single flat freight is added for the order. Throws if any line
 * resolves to an invalid configuration.
 */
export async function priceCart(
  items: CartLineInput[],
  shippingState: string
): Promise<CartPriceBreakdown> {
  if (!items.length) throw new Error("Cart is empty");

  const [sizes, heights, woods] = await Promise.all([
    prisma.size.findMany(),
    prisma.height.findMany(),
    prisma.wood.findMany(),
  ]);
  const sizeBy = new Map(sizes.map((s) => [s.key, s]));
  const heightBy = new Map(heights.map((h) => [h.key, h]));
  const woodBy = new Map(woods.map((w) => [w.key, w]));

  const lines: PricedLine[] = [];
  for (const it of items) {
    const size = sizeBy.get(it.sizeKey);
    const height = heightBy.get(it.heightKey);
    const wood = woodBy.get(it.woodKey);
    if (!size || !height || !wood) throw new Error("Invalid configuration");
    const variant = await prisma.variant.findUnique({
      where: { sizeId_heightId: { sizeId: size.id, heightId: height.id } },
    });
    if (!variant) throw new Error("Variant not found");
    const qty = Math.max(1, Math.floor(it.quantity || 1));
    const unitPriceCents = dollarsToCents(variant.basePrice + wood.priceDelta);
    lines.push({
      sizeKey: it.sizeKey,
      heightKey: it.heightKey,
      woodKey: it.woodKey,
      label: `Apt.Bed — ${size.label} · ${height.label} · ${wood.label}`,
      unitPriceCents,
      quantity: qty,
      lineCents: unitPriceCents * qty,
    });
  }

  const subtotalCents = lines.reduce((a, l) => a + l.lineCents, 0);
  const taxRatePercent = await getTaxRatePercent(shippingState);
  const taxCents = Math.round((subtotalCents * taxRatePercent) / 100);
  const freight = await quoteFreight({
    state: shippingState,
    subtotalCents,
    lines: lines.map((l) => ({ sizeKey: l.sizeKey, heightKey: l.heightKey, woodKey: l.woodKey, quantity: l.quantity })),
  });
  const freightCents = freight.cents;
  const totalCents = subtotalCents + taxCents + freightCents;
  return { lines, subtotalCents, taxCents, freightCents, totalCents, taxRatePercent };
}

// Order lifecycle re-exported from the client-safe module so existing
// `@/lib/pricing` imports keep working.
export { ORDER_FLOW, statusIndex, statusLabel } from "./order-status";
export type { OrderStatusKey } from "./order-status";
