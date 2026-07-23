"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Truck } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useCart, cartKey } from "@/lib/cart";
import { formatCents } from "@/lib/money";
import type { Catalog } from "@/lib/catalog";

function imageFor(catalog: Catalog, size: string, height: string, wood: string) {
  return catalog.images[`${size}-${height}-${wood}`] ?? `/products/apt-bed-${size}-${height}-${wood}.svg`;
}

export function CartView({ catalog, freightCents }: { catalog: Catalog; freightCents: number }) {
  const router = useRouter();
  const { items, setQty, remove, ready } = useCart();

  const sizeBy = useMemo(() => new Map(catalog.sizes.map((s) => [s.key, s])), [catalog]);
  const heightBy = useMemo(() => new Map(catalog.heights.map((h) => [h.key, h])), [catalog]);
  const woodBy = useMemo(() => new Map(catalog.woods.map((w) => [w.key, w])), [catalog]);

  const rows = items.map((it) => {
    const size = sizeBy.get(it.size);
    const height = heightBy.get(it.height);
    const wood = woodBy.get(it.wood);
    const base = catalog.prices[it.size]?.[it.height] ?? 0;
    const unitDollars = base + (wood?.priceDelta ?? 0);
    return {
      it,
      key: cartKey(it),
      valid: Boolean(size && height && wood),
      title: `${size?.label ?? it.size} · ${height?.label ?? it.height} · ${wood?.label ?? it.wood}`,
      dims: size?.dimensions ?? "",
      unitCents: unitDollars * 100,
      image: imageFor(catalog, it.size, it.height, it.wood),
    };
  });

  const subtotalCents = rows.reduce((a, r) => a + r.unitCents * r.it.qty, 0);

  if (!ready) {
    return <div className="py-20 text-center text-muted">Loading your cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red-700">
          <ShoppingCart className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-ink">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted">
          Configure an Apt.Bed and add it here. You can order several configurations at once.
        </p>
        <ButtonLink href="/product" className="mt-6">
          Configure your Apt.Bed <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
      {/* Line items */}
      <ul className="space-y-4">
        {rows.map((r) => (
          <li key={r.key} className="card flex gap-4 p-4">
            <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-brand-blue/[0.08] bg-panel">
              <Image src={r.image} alt={r.title} fill sizes="112px" className="object-contain" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <p className="font-medium text-ink">{r.title}</p>
                <p className="text-xs text-muted">{r.dims}</p>
                {!r.valid && (
                  <p className="mt-1 text-xs text-brand-red-600">
                    This configuration is no longer available.
                  </p>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-full border border-brand-blue/12">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQty(r.key, r.it.qty - 1)}
                    className="inline-flex h-8 w-8 items-center justify-center text-ink/70 hover:text-ink"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-ink">{r.it.qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty(r.key, r.it.qty + 1)}
                    className="inline-flex h-8 w-8 items-center justify-center text-ink/70 hover:text-ink"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-ink">{formatCents(r.unitCents * r.it.qty)}</span>
                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => remove(r.key)}
                    className="text-muted hover:text-brand-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Summary */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-ink">Summary</h2>
          <dl className="mt-5 space-y-2.5 border-t border-brand-blue/[0.08] pt-5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-medium text-ink">{formatCents(subtotalCents)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="inline-flex items-center gap-1.5 text-muted">
                <Truck className="h-3.5 w-3.5" /> Freight (flat)
              </dt>
              <dd className="font-medium text-ink">{formatCents(freightCents)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Sales tax</dt>
              <dd className="text-muted">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-brand-blue/[0.08] pt-4">
            <span className="font-medium text-ink">Estimated total</span>
            <span className="font-display text-2xl font-bold text-ink">
              {formatCents(subtotalCents + freightCents)}
            </span>
          </div>
          <Button
            size="lg"
            className="mt-5 w-full"
            onClick={() => router.push("/checkout")}
            disabled={rows.some((r) => !r.valid)}
          >
            Proceed to checkout <ArrowRight className="h-4 w-4" />
          </Button>
          <Link
            href="/product"
            className="mt-3 block text-center text-sm text-brand-red-600 hover:underline"
          >
            Add another configuration
          </Link>
        </div>
      </div>
    </div>
  );
}
