import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ORDER_STATUSES } from "@/lib/site";
import { Truck, Phone, PackageCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description:
    "How the Apt.Bed ships — freight delivery within the USA, scheduling, and the order lifecycle.",
};

const POINTS = [
  {
    icon: Truck,
    title: "Freight, not parcel",
    text: "The Apt.Bed is a large, freight-sized unit, so it ships by freight carrier rather than standard courier.",
  },
  {
    icon: Phone,
    title: "Scheduled delivery",
    text: "A freight coordinator contacts you to arrange a delivery appointment — which is why we ask for a phone number at checkout.",
  },
  {
    icon: PackageCheck,
    title: "Freight cost",
    text: "Freight is quoted based on your delivery location. We'll confirm the cost with you as your order is arranged.",
  },
];

export default function ShippingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Delivery"
        title="Shipping & delivery"
        description="Everything about how your Apt.Bed reaches your door."
      />
      <div className="container max-w-4xl py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {POINTS.map((p) => (
            <div key={p.title} className="card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Your order, step by step
          </h2>
          <ol className="mt-6 space-y-4">
            {ORDER_STATUSES.map((s, i) => (
              <li key={s.id} className="flex items-start gap-4 rounded-2xl border border-brand-blue/[0.08] bg-panel p-5 shadow-card">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-ink">{s.label}</p>
                  <p className="text-sm text-muted">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
