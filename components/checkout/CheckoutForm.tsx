"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Lock, AlertCircle, Truck, ArrowRight } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { AddressFields } from "@/components/AddressFields";
import { useCart } from "@/lib/cart";
import { formatCents } from "@/lib/money";
import type { Catalog } from "@/lib/catalog";

interface Props {
  catalog: Catalog;
  freightCents: number;
  taxRates: Record<string, number>;
  stripeEnabled: boolean;
  initial: {
    name: string;
    email: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
}

export function CheckoutForm({ catalog, freightCents, taxRates, stripeEnabled, initial }: Props) {
  const { items, clear, ready } = useCart();
  const [f, setF] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const woodBy = useMemo(() => new Map(catalog.woods.map((w) => [w.key, w])), [catalog]);
  const sizeBy = useMemo(() => new Map(catalog.sizes.map((s) => [s.key, s])), [catalog]);
  const heightBy = useMemo(() => new Map(catalog.heights.map((h) => [h.key, h])), [catalog]);

  const lines = items.map((it) => {
    const base = catalog.prices[it.size]?.[it.height] ?? 0;
    const unitCents = (base + (woodBy.get(it.wood)?.priceDelta ?? 0)) * 100;
    return {
      it,
      title: `${sizeBy.get(it.size)?.label ?? it.size} · ${heightBy.get(it.height)?.label ?? it.height} · ${
        woodBy.get(it.wood)?.label ?? it.wood
      }`,
      unitCents,
      lineCents: unitCents * it.qty,
    };
  });

  const subtotalCents = lines.reduce((a, l) => a + l.lineCents, 0);
  const ratePercent = useMemo(() => {
    const code = f.state.toUpperCase();
    return taxRates[code] ?? taxRates["*"] ?? 0;
  }, [f.state, taxRates]);
  const taxCents = f.state ? Math.round((subtotalCents * ratePercent) / 100) : 0;
  const totalCents = subtotalCents + taxCents + freightCents;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ size: i.size, height: i.height, wood: i.wood, qty: i.qty })),
        ...f,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      setError(data.error || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }
    clear();
    window.location.href = data.url;
  }

  if (ready && items.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <h2 className="font-display text-xl font-bold text-ink">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted">Add a configuration before checking out.</p>
        <ButtonLink href="/product" className="mt-6">
          Configure your Apt.Bed <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
      {/* Shipping */}
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Shipping details</h2>
        <p className="mt-1 text-sm text-muted">
          Signed in? We&apos;ve pre-filled your saved details — edit any field below.
        </p>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-red/15 p-3 text-sm text-brand-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" value={f.name} onChange={set("name")} required />
            <Field label="Email" type="email" value={f.email} onChange={set("email")} required />
          </div>
          <Field label="Phone" type="tel" value={f.phone} onChange={set("phone")} placeholder="(555) 000-0000" />
          <AddressFields
            required
            defaults={{ line1: f.line1, city: f.city, state: f.state, zip: f.zip }}
            onChange={(a) => setF((s) => ({ ...s, ...a }))}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-ink">Order summary</h2>
          <ul className="mt-4 space-y-2 border-b border-brand-blue/[0.08] pb-4 text-sm">
            {lines.map((l) => (
              <li key={`${l.it.size}-${l.it.height}-${l.it.wood}`} className="flex justify-between gap-3">
                <span className="text-ink/80">
                  {l.it.qty}× {l.title}
                </span>
                <span className="shrink-0 font-medium text-ink">{formatCents(l.lineCents)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 text-sm">
            <Row label="Subtotal" value={formatCents(subtotalCents)} />
            <Row
              label={f.state ? `Sales tax (${f.state} · ${ratePercent}%)` : "Sales tax"}
              value={f.state ? formatCents(taxCents) : "—"}
            />
            <Row
              label={
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" /> Freight (flat)
                </span>
              }
              value={formatCents(freightCents)}
            />
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-brand-blue/[0.08] pt-4">
            <span className="font-medium text-ink">Total</span>
            <span className="font-display text-2xl font-bold text-ink">{formatCents(totalCents)}</span>
          </div>

          <Button type="submit" size="lg" className="mt-5 w-full" disabled={loading}>
            <Lock className="h-4 w-4" />
            {loading ? "Processing…" : stripeEnabled ? "Pay with card" : "Place order (demo)"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            {stripeEnabled
              ? "Secured by Stripe. You pay 100% now."
              : "Demo checkout — no card charged. You pay 100% at checkout."}
          </p>
          <Link href="/cart" className="mt-3 block text-center text-sm text-brand-red-600 hover:underline">
            Edit cart
          </Link>
        </div>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-brand-red-700"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
      />
    </div>
  );
}
