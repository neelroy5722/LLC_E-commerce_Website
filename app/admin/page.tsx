import Link from "next/link";
import { DollarSign, TrendingUp, Clock, CheckCircle2, Crown, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/OrderStatus";
import { prisma } from "@/lib/db";
import { statusIndex } from "@/lib/pricing";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [paidOrders, recent, itemGroups, openCount, doneCount, sizes] = await Promise.all([
    prisma.order.findMany({ where: { paymentStatus: "paid" }, select: { total: true, createdAt: true } }),
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.orderItem.groupBy({ by: ["sizeKey"], _count: { sizeKey: true } }),
    prisma.order.count({ where: { status: { not: "delivered" } } }),
    prisma.order.count({ where: { status: "delivered" } }),
    prisma.size.findMany(),
  ]);

  // Flatten to individual products so each product's status is shown, not grouped.
  const recentItems = recent
    .flatMap((o) => o.items.map((it) => ({ id: it.id, orderNumber: o.orderNumber, customer: o.customerName, label: it.label, quantity: it.quantity, status: it.status })))
    .slice(0, 9);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const todaySales = paidOrders.filter((o) => o.createdAt >= startOfDay).reduce((a, o) => a + o.total, 0);
  const monthRevenue = paidOrders.filter((o) => o.createdAt >= startOfMonth).reduce((a, o) => a + o.total, 0);

  const topSizeKey = itemGroups.sort((a, b) => b._count.sizeKey - a._count.sizeKey)[0]?.sizeKey;
  const bestSize = sizes.find((s) => s.key === topSizeKey)?.label ?? "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">A snapshot of your store today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={DollarSign} label="Today's sales" value={formatCents(todaySales)} tone="red" />
        <Stat icon={TrendingUp} label="Monthly revenue" value={formatCents(monthRevenue)} tone="blue" />
        <Stat icon={Clock} label="Open orders" value={String(openCount)} tone="blue" />
        <Stat icon={CheckCircle2} label="Completed orders" value={String(doneCount)} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-brand-blue/[0.08] px-6 py-4">
            <h2 className="font-display text-lg font-bold text-ink">Recent products</h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-brand-red-600 hover:underline">
              All orders <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-brand-blue/[0.08] text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-6 py-3 font-medium">Order</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted">No orders yet.</td>
                  </tr>
                )}
                {recentItems.map((it) => (
                  <tr key={it.id} className="border-b border-brand-blue/[0.06] last:border-0">
                    <td className="px-6 py-3.5 font-medium text-ink">{it.orderNumber}</td>
                    <td className="px-6 py-3.5 text-ink/80">{it.customer}</td>
                    <td className="px-6 py-3.5 text-ink/80">
                      {it.quantity > 1 ? `${it.quantity}× ` : ""}
                      {it.label}
                    </td>
                    <td className="px-6 py-3.5 text-right"><StatusBadge statusIndex={statusIndex(it.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red/15 text-brand-red-700">
              <Crown className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm text-muted">Best-selling size</p>
            <p className="font-display text-2xl font-bold text-ink">{bestSize}</p>
          </div>
          <div className="card p-6">
            <h3 className="font-medium text-ink">Quick actions</h3>
            <div className="mt-4 space-y-2 text-sm">
              <QuickLink href="/admin/products" label="Update prices & images" />
              <QuickLink href="/admin/orders" label="Advance order status" />
              <QuickLink href="/admin/videos" label="Upload assembly video" />
              <QuickLink href="/admin/settings" label="Edit tax & shipping" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "red" | "blue" | "green";
}) {
  const tones = {
    red: "bg-brand-red/15 text-brand-red-700",
    blue: "bg-brand-sky/15 text-brand-sky",
    green: "bg-emerald-400/15 text-emerald-700",
  };
  return (
    <div className="card p-5">
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm text-muted">{label}</p>
      <p className="font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg px-3 py-2 text-ink/70 transition-colors hover:bg-brand-blue/[0.04] hover:text-ink"
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
