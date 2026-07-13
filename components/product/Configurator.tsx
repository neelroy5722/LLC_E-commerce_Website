"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, ShoppingCart, Check } from "lucide-react";
import {
  SIZES,
  HEIGHTS,
  WOODS,
  getSize,
  getHeight,
  getWood,
  getVariantImage,
  getVariantPrice,
  type SizeId,
  type HeightId,
  type WoodId,
} from "@/lib/products";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * The product configurator: Size → Height → Wood via dropdown menus. The preview
 * image and the price both resolve live from lib/products for every combination.
 */
export function Configurator() {
  const router = useRouter();
  const { add } = useCart();
  const [size, setSize] = useState<SizeId>("queen");
  const [height, setHeight] = useState<HeightId>("medium");
  const [wood, setWood] = useState<WoodId>("oak");
  const [added, setAdded] = useState(false);

  const price = getVariantPrice({ size, height, wood });
  const image = getVariantImage(size, height, wood);
  const woodOption = getWood(wood);

  function addToCart() {
    add({ size, height, wood });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  function buyNow() {
    add({ size, height, wood });
    router.push("/checkout");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
      {/* Live preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative overflow-hidden rounded-3xl border border-brand-blue/10 bg-gradient-to-br from-panel to-night2 shadow-lift">
          <div className="relative aspect-[560/460] w-full">
            <Image
              key={image}
              src={image}
              alt={`Apt.Bed — ${getSize(size).label}, ${getHeight(height).label} height, ${woodOption.label} finish`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-contain"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-brand-blue/[0.08] px-5 py-3 text-xs text-muted">
            <span className="font-medium text-ink">{getSize(size).label}</span>
            <span aria-hidden>·</span>
            <span>{getHeight(height).label} deck</span>
            <span aria-hidden>·</span>
            <span>{woodOption.label}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div>
        <span className="eyebrow">Find your bed</span>
        <h1 className="display-hero mt-3 text-3xl sm:text-4xl">
          Build it to fit your room
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Choose a size, deck height, and finish. The preview and price update
          instantly for every combination.
        </p>

        {/* Size */}
        <Field step={1} title="Size">
          <Select value={size} onChange={(v) => setSize(v as SizeId)}>
            {SIZES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} — {s.dimensions}
              </option>
            ))}
          </Select>
        </Field>

        {/* Height */}
        <Field
          step={2}
          title="Deck height"
          hint="Not sure which height? Measure your ceiling and subtract your sitting height — the distance from a seat to the top of your head. The difference is about how tall your bed can be."
        >
          <Select value={height} onChange={(v) => setHeight(v as HeightId)}>
            {HEIGHTS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.label} — about {h.deckHeightFt} ft
              </option>
            ))}
          </Select>
        </Field>

        {/* Wood */}
        <Field step={3} title="Wood finish">
          <Select value={wood} onChange={(v) => setWood(v as WoodId)}>
            {WOODS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
                {w.priceDelta > 0 ? ` — +${formatPrice(w.priceDelta)}` : ""}
              </option>
            ))}
          </Select>
        </Field>

        {/* Price summary */}
        <div className="mt-8 rounded-3xl border border-brand-blue/[0.08] bg-panel p-6 shadow-soft">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Your configuration
              </p>
              <p className="mt-1 text-sm text-ink">
                {getSize(size).label} · {getHeight(height).label} · {woodOption.label}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Total</p>
              <p className="font-display text-3xl font-bold text-ink">
                {formatPrice(price)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={addToCart}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold transition-colors",
                added
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                  : "border-brand-blue/20 text-brand-blue-700 hover:bg-brand-blue/5",
              )}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> Added to cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" /> Add to cart
                </>
              )}
            </button>
            <button
              type="button"
              onClick={buyNow}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-red-600"
            >
              Buy now <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {added ? (
            <Link
              href="/cart"
              className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-brand-red-600 hover:underline"
            >
              View cart <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Info className="h-3.5 w-3.5" />
              Built in South Carolina · Freight delivered · Sales tax added at checkout
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-red/10 text-xs font-bold text-brand-red">
            {step}
          </span>
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        </div>
        {hint ? <p className="max-w-sm text-xs leading-relaxed text-muted">{hint}</p> : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full appearance-none rounded-xl border border-brand-blue/15 bg-white px-4 py-3 pr-10 text-sm font-medium text-ink shadow-sm transition-colors",
          "focus:border-brand-red/50 focus:outline-none focus:ring-2 focus:ring-brand-red/20",
        )}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
        ▾
      </span>
    </div>
  );
}
