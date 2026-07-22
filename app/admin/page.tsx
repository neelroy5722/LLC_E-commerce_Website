import Link from "next/link";
import { DollarSign, CalendarRange, CalendarClock, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { WeeklyRevenueChart, WeeklyRevenueLegend } from "@/components/admin/WeeklyRevenueChart";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dow = (now.getDay() + 6) % 7; // 0 = Monday
  const thisWeekStart = new Date(startOfToday);
  thisWeekStart.setDate(startOfToday.getDate() - dow);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setDate(thisWeekStart.getDate() + 7);

  const [paid, recent, activeCount, doneCount] = await Promise.all([
    prisma.order.findMany({
      where: { paymentStatus: "paid", createdAt: { gte: lastWeekStart, lt: nextWeekStart } },
      select: { total: true, createdAt: true },
    }),
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.order.count({ where: { status: { not: "delivered" } } }),
    prisma.order.count({ where: { status: "delivered" } }),
  ]);

  const DAY = 86_400_000;
  const thisWeek = Array<number>(7).fill(0);
  const lastWeek = Array<number>(7).fill(0);
  let todaySales = 0;
  for (const o of paid) {
    const t = o.createdAt.getTime();
    if (o.createdAt >= startOfToday) todaySales += o.total;
    if (t >= thisWeekStart.getTime()) {
      const d = Math.floor((t - thisWeekStart.getTime()) / DAY);
      if (d >= 0 && d < 7) thisWeek[d] += o.total;
    } else if (t >= lastWeekStart.getTime()) {
      const d = Math.floor((t - lastWeekStart.getTime()) / DAY);
      if (d >= 0 && d < 7) lastWeek[d] += o.total;
    }
  }
  const thisTotal = thisWeek.reduce((a, b) => a + b, 0);
  const lastTotal = lastWeek.reduce((a, b) => a + b, 0);

  const recentRows = recent.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.customerName,
    product: o.items.map((it) => `${it.quantity > 1 ? `${it.quantity}× ` : ""}${it.label}`).join(", ") || "—",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">Revenue this week vs last, and your latest orders.</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={DollarSign} label="Today's sales" value={formatCents(todaySales)} tone="red" />
        <Stat icon={CalendarRange} label="This week" value={formatCents(thisTotal)} tone="red" />
        <Stat icon={CalendarClock} label="Last week" value={formatCents(lastTotal)} tone="blue" />
        <Stat icon={Clock} label="Active orders" value={String(activeCount)} tone="blue" />
        <Stat icon={CheckCircle2} label="Completed orders" value={String(doneCount)} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Weekly revenue graph */}
        <div className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-sans text-lg font-bold text-ink">Revenue — this week vs last week</h2>
          </div>
          <div className="mt-3">
            <WeeklyRevenueLegend thisTotal={thisTotal} lastTotal={lastTotal} />
          </div>
          <div className="mt-4">
            <WeeklyRevenueChart thisWeek={thisWeek} lastWeek={lastWeek} />
          </div>
        </div>

        {/* Recent orders (customer + product) */}
        <div className="card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-brand-blue/[0.08] px-5 py-4">
            <h2 className="font-sans text-base font-bold text-ink">Recent orders</h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-brand-red-600 hover:underline">
              All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-blue/[0.08] text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Product</th>
                </tr>
              </thead>
              <tbody>
                {recentRows.length === 0 && (
                  <tr><td colSpan={2} className="px-5 py-8 text-center text-muted">No orders yet.</td></tr>
                )}
                {recentRows.map((r) => (
                  <tr key={r.id} className="border-b border-brand-blue/[0.06] last:border-0">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">{r.customer}</td>
                    <td className="max-w-[14rem] truncate px-5 py-3 text-ink/80" title={r.product}>{r.product}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      <p className="font-sans text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
