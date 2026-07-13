import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { getFreightCents } from "@/lib/settings";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Your Cart" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [catalog, freightCents] = await Promise.all([getCatalog(), getFreightCents()]);

  return (
    <section className="container py-12 sm:py-16">
      <div className="mb-8">
        <span className="eyebrow">Your cart</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
          Review your configurations
        </h1>
      </div>
      <CartView catalog={catalog} freightCents={freightCents} />
    </section>
  );
}
