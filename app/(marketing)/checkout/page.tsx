import { getCatalog } from "@/lib/catalog";
import { getFreightCents } from "@/lib/settings";
import { getTaxRateMap } from "@/lib/pricing";
import { stripeEnabled } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/session";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [catalog, freightCents, taxRates, user] = await Promise.all([
    getCatalog(),
    getFreightCents(),
    getTaxRateMap(),
    getCurrentUser(),
  ]);

  const initial = {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    line1: user?.addressLine1 ?? "",
    city: user?.city ?? "",
    state: user?.state ?? "",
    zip: user?.zip ?? "",
  };

  return (
    <section className="container py-12 sm:py-16">
      <div className="mb-8">
        <span className="eyebrow">Checkout</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Almost there</h1>
      </div>
      <CheckoutForm
        catalog={catalog}
        freightCents={freightCents}
        taxRates={taxRates}
        stripeEnabled={stripeEnabled}
        initial={initial}
      />
    </section>
  );
}
