import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { ButtonLink } from "@/components/ui/Button";
import { formatCents } from "@/lib/money";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; session_id?: string };
}) {
  if (!searchParams.order) redirect("/");
  let order = await prisma.order.findUnique({
    where: { orderNumber: searchParams.order },
    include: { items: true },
  });
  if (!order) redirect("/");

  // Fallback confirmation if the webhook hasn't landed yet (Stripe path).
  if (order.paymentStatus !== "paid" && stripeEnabled && stripe && searchParams.session_id) {
    try {
      const s = await stripe.checkout.sessions.retrieve(searchParams.session_id);
      if (s.payment_status === "paid") {
        await markOrderPaid(order.id, (s.payment_intent as string) || s.id);
        order = await prisma.order.findUnique({
          where: { id: order.id },
          include: { items: true },
        });
      }
    } catch {
      /* ignore — webhook will reconcile */
    }
  }
  if (!order) redirect("/");

  return (
    <section className="container flex min-h-[70vh] items-center py-16">
      <div className="mx-auto w-full max-w-xl text-center">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold text-ink sm:text-4xl">
          Thank you — your order is in!
        </h1>
        <p className="mt-3 text-muted">
          A confirmation is on its way to <span className="text-ink">{order.email}</span>. Your
          Apt.Bed is now made to order.
        </p>

        <div className="card mt-8 p-6 text-left">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 font-medium text-ink">
              <Package className="h-4 w-4 text-brand-sky" /> Order {order.orderNumber}
            </span>
            <span className="rounded-full bg-brand-sky/15 px-3 py-1 text-xs font-medium text-brand-sky">
              Order Received
            </span>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-ink/80">
            {order.items.map((it) => (
              <li key={it.id}>
                {it.quantity}× {it.label}
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-brand-blue/[0.08] pt-4 text-sm">
            <Row label="Subtotal" value={formatCents(order.subtotal)} />
            <Row label="Sales tax" value={formatCents(order.tax)} />
            <Row label="Freight" value={formatCents(order.freight)} />
            <div className="flex items-center justify-between border-t border-brand-blue/[0.08] pt-2">
              <dt className="font-medium text-ink">Total paid</dt>
              <dd className="font-display text-lg font-bold text-ink">{formatCents(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/account/orders">
            Track your order <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <Link href="/product" className="text-sm text-muted hover:text-ink">
            Configure another
          </Link>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
