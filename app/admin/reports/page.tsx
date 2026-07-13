import { DollarSign, TrendingUp, Package, Crown } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/money";
import { ReportsChart, type MonthBucket, type SizeMeta } from "@/components/admin/ReportsChart";

export const dynamic = "force-dynamic";

const SIZE_COLORS = ["#5480B2", "#D25A48", "#8FB98F", "#E4C89A", "#B07BAC"];

export default async function AdminReports() {
  const MONTHS = 12;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const windowStart = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1), 1);

  const [sizes, paidOrders, openCount] = await Promise.all([
    prisma.size.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.order.findMany({
      where: { paymentStatus: "paid", createdAt: { gte: windowStart } },
      select: { total: true, createdAt: true, items: true },
    }),
    prisma.order.count({ where: { status: { not: "delivered" } } }),
  ]);

  const sizeMeta: SizeMeta[] = sizes.map((s, i) => ({
    key: s.key,
    label: s.label,
    color: SIZE_COLORS[i % SIZE_COLORS.length],
  }));
  const sizeKeys = sizes.map((s) => s.key);
  const zeroBySize = () => Object.fromEntries(sizeKeys.map((k) => [k, { revenue: 0, units: 0 }]));

  // Build the month buckets (with per-week sub-buckets).
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Reports</h1>
        <p className="text-sm text-muted">Units sold and product revenue by size — last 12 months (paid orders).</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={DollarSign} label="Today's sales" value={formatCents(todaySales)} />
        <Kpi icon={TrendingUp} label="Monthly revenue" value={formatCents(monthRevenue)} />
        <Kpi icon={Package} label="Open orders" value={String(openCount)} />
        <Kpi icon={Crown} label="Best-selling size" value={bestSize} />
      </div>

      <ReportsChart months={months} sizes={sizeMeta} maxMonth={maxMonth} />

      {/* Per-size totals table */}
      <div className="card overflow-hidden">
        <div className="border-b border-brand-blue/[0.08] px-6 py-4">
          <h2 className="font-display text-lg font-bold text-ink">Units &amp; revenue by size (12 months)</h2>
        </div>
        <table className="w-full text-sm">
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
                <td className="px-6 py-3.5 text-right text-muted">
                  {totalUnits ? Math.round((sizeTotals[s.key].units / totalUnits) * 100) : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({
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
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-sky/15 text-brand-sky">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm text-muted">{label}</p>
      <p className="font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
