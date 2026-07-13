import Link from "next/link";
import { Package, Truck, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { ProductStatusList } from "@/components/ProductStatus";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { statusLabel } from "@/lib/order-status";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AccountOverview() {
  const su = await getSessionUser();
  const orders = await prisma.order.findMany({
    where: { userId: su!.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const inProgress = orders.filter((o) => o.status !== "delivered").length;
  const spent = orders.reduce((a, o) => a + o.total, 0);
  const active = orders.find((o) => o.status !== "delivered") ?? orders[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Tile icon={Package} label="Total orders" value={String(orders.length)} />
        <Tile icon={Truck} label="In progress" value={String(inProgress)} />
        <Tile icon={Package} label="Lifetime spend" value={formatCents(spent)} />
      </div>

      {active ? (
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-ink">Track your latest order</h2>
            <span className="text-sm text-muted">Order {active.orderNumber}</span>
          </div>
          <p className="mt-1 text-sm text-muted">Each product is tracked separately.</p>
          <div className="mt-5">
            <ProductStatusList
              items={active.items.map((it) => ({ id: it.id, label: it.label, quantity: it.quantity, status: it.status }))}
            />
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-muted">You don&apos;t have any orders yet.</p>
          <ButtonLink href="/product" className="mt-4">
            Configure your Apt.Bed <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      )}

      {orders.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Recent orders</h2>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-red-600 hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-brand-blue/[0.08]">
            {orders.slice(0, 4).map((o) => (
              <li key={o.id} className="py-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink">{o.orderNumber}</p>
                  <span className="font-medium text-ink">{formatCents(o.total)}</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-muted">
                        {it.quantity > 1 ? `${it.quantity}× ` : ""}
                        {it.label}
                      </span>
                      <span className="text-xs font-medium text-ink/80">{statusLabel(it.status)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-5">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red/15 text-brand-red-700">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm text-muted">{label}</p>
      <p className="font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
