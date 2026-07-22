import Link from "next/link";
import { DollarSign, TrendingUp, Clock, CheckCircle2, Crown, ArrowRight, Bell, CheckCheck } from "lucide-react";
import { StatusBadge } from "@/components/OrderStatus";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ReportsChart, type MonthBucket, type SizeMeta } from "@/components/admin/ReportsChart";
import { prisma } from "@/lib/db";
import { statusIndex } from "@/lib/pricing";
import { formatCents } from "@/lib/money";
import { markNotificationsReadAction } from "./actions";

export const dynamic = "force-dynamic";

const SIZE_COLORS = ["#E85A4F", "#2F5987", "#6E9CC4", "#7E8A99", "#A8362B"];

export default async function AdminDashboard() {
  const MONTHS = 12;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const windowStart = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1), 1);

  const [sizes, paidOrders, recent, openCount, doneCount, notifications, unreadCount] = await Promise.all([
    prisma.size.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.order.findMany({
      where: { paymentStatus: "paid", createdAt: { gte: windowStart } },
      select: { total: true, createdAt: true, items: true },
    }),
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.order.count({ where: { status: { not: "delivered" } } }),
    prisma.order.count({ where: { status: "delivered" } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.notification.count({ where: { readAt: null } }),
  ]);

  // KPIs + report aggregation (formerly the Reports page).
  const sizeMeta: SizeMeta[] = sizes.map((s, i) => ({ key: s.key, label: s.label, color: SIZE_COLORS[i % SIZE_COLORS.length] }));
  const sizeKeys = sizes.map((s) => s.key);
  const zeroBySize = () => Object.fromEntries(sizeKeys.map((k) => [k, { revenue: 0, units: 0 }]));

  const months: MonthBucket[] = Array.from({ length: MONTHS }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1) + i, 1);
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const weekCount = Math.ceil(daysInMonth / 7);
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      bySize: zeroBySize() as MonthBucket["bySize"],
      total: 0,
      units: 0,
      weeks: Array.from({ length: weekCount }, (_, w) => ({ label: `Wk ${w + 1}`, revenue: 0, units: 0 })),
    };
  });
  const monthIndex = new Map(months.map((m, i) => [m.key, i]));
  const sizeTotals: Record<string, { revenue: number; units: number }> = zeroBySize();
  let todaySales = 0;
  let monthRevenue = 0;

  for (const o of paidOrders) {
    if (o.createdAt >= startOfDay) todaySales += o.total;
    if (o.createdAt >= startOfMonth) monthRevenue += o.total;
    const mi = monthIndex.get(`${o.createdAt.getFullYear()}-${o.createdAt.getMonth()}`);
    const wk = Math.min(4, Math.floor((o.createdAt.getDate() - 1) / 7));
    for (const it of o.items) {
      if (!(it.sizeKey in sizeTotals)) continue;
      const rev = it.unitPrice * it.quantity;
      sizeTotals[it.sizeKey].revenue += rev;
      sizeTotals[it.sizeKey].units += it.quantity;
      if (mi !== undefined) {
        const m = months[mi];
        m.bySize[it.sizeKey].revenue += rev;
        m.bySize[it.sizeKey].units += it.quantity;
        m.total += rev;
        m.units += it.quantity;
        if (m.weeks[wk]) {
          m.weeks[wk].revenue += rev;
          m.weeks[wk].units += it.quantity;
        }
      }
    }
  }

  const maxMonth = Math.max(1, ...months.map((m) => m.total));
  const totalUnits = Object.values(sizeTotals).reduce((a, s) => a + s.units, 0);
  const bestSize = [...sizes].sort((a, b) => sizeTotals[b.key].units - sizeTotals[a.key].units)[0]?.label ?? "—";

  const recentItems = recent
    .flatMap((o) => o.items.map((it) => ({ id: it.id, orderNumber: o.orderNumber, customer: o.customerName, label: it.label, quantity: it.quantity, status: it.status })))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">Your store at a glance — sales, orders, and activity.</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={DollarSign} label="Today's sales" value={formatCents(todaySales)} tone="red" />
        <Stat icon={TrendingUp} label="Monthly revenue" value={formatCents(monthRevenue)} tone="blue" />
        <Stat icon={Clock} label="Active orders" value={String(openCount)} tone="blue" />
        <Stat icon={CheckCircle2} label="Completed orders" value={String(doneCount)} tone="green" />
        <Stat icon={Crown} label="Best-selling size" value={bestSize} tone="red" />
      </div>

      {/* Revenue chart + notifications */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <ReportsChart months={months} sizes={sizeMeta} maxMonth={maxMonth} />

        <div id="notifications" className="card flex flex-col overflow-hidden scroll-mt-20">
          <div className="flex items-center justify-between border-b border-brand-blue/[0.08] px-5 py-4">
            <h2 className="inline-flex items-center gap-2 font-display text-base font-bold text-ink">
              <Bell className="h-4 w-4 text-brand-red" /> Notifications
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-red px-1.5 text-[11px] font-bold text-white">{unreadCount}</span>
              )}
            </h2>
            {unreadCount > 0 && (
              <form action={markNotificationsReadAction}>
                <SubmitButton size="sm" variant="ghost" savedLabel="Cleared">
                  <CheckCheck className="h-4 w-4" /> Mark read
                </SubmitButton>
              </form>
            )}
          </div>
          <ul className="divide-y divide-brand-blue/[0.06]">
            {notifications.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted">No notifications yet.</li>}
            {notifications.map((n) => (
              <li key={n.id} className={`px-5 py-3.5 ${n.readAt ? "" : "bg-brand-red/[0.03]"}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  {!n.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-red" />}
                </div>
                <p className="mt-0.5 text-xs text-muted">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted/70">
                  {new Date(n.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-blue/[0.08] px-6 py-4">
          <h2 className="font-display text-lg font-bold text-ink">Recent orders</h2>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-brand-red-600 hover:underline">
            All orders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-brand-blue/[0.08] bg-brand-blue/[0.02] text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentItems.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted">No orders yet.</td></tr>
              )}
              {recentItems.map((it) => (
                <tr key={it.id} className="border-b border-brand-blue/[0.06] last:border-0">
                  <td className="px-6 py-3.5 font-medium text-ink">{it.orderNumber}</td>
                  <td className="px-6 py-3.5 text-ink/80">{it.customer}</td>
                  <td className="px-6 py-3.5 text-ink/80">{it.quantity > 1 ? `${it.quantity}× ` : ""}{it.label}</td>
                  <td className="px-6 py-3.5 text-right"><StatusBadge statusIndex={statusIndex(it.status)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-size units & revenue table (12 months) */}
      <div className="card overflow-hidden">
        <div className="border-b border-brand-blue/[0.08] px-6 py-4">
          <h2 className="font-display text-lg font-bold text-ink">Units &amp; revenue by size</h2>
          <p className="text-sm text-muted">Paid orders, last 12 months.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b border-brand-blue/[0.08] text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-3 font-medium">Size</th>
                <th className="px-6 py-3 text-right font-medium">Units sold</th>
                <th className="px-6 py-3 text-right font-medium">Product revenue</th>
                <th className="px-6 py-3 text-right font-medium">Share of units</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((s, i) => (
                <tr key={s.key} className="border-b border-brand-blue/[0.05] last:border-0">
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-2 font-medium text-ink">
                      <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: SIZE_COLORS[i % SIZE_COLORS.length] }} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right text-ink">{sizeTotals[s.key].units}</td>
                  <td className="px-6 py-3.5 text-right font-medium text-ink">{formatCents(sizeTotals[s.key].revenue)}</td>
                  <td className="px-6 py-3.5 text-right text-muted">{totalUnits ? Math.round((sizeTotals[s.key].units / totalUnits) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
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
