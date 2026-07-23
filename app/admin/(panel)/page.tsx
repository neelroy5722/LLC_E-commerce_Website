import { DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { DashboardAnalytics, type PeriodData, type Periods } from "@/components/admin/DashboardAnalytics";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;

export default async function AdminDashboard() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const startOfToday = new Date(y, m, now.getDate());
  const dow = (now.getDay() + 6) % 7; // 0 = Monday

  const thisWeekStart = new Date(startOfToday);
  thisWeekStart.setDate(startOfToday.getDate() - dow);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const thisMonthStart = new Date(y, m, 1);
  const lastMonthStart = new Date(y, m - 1, 1);
  const thisYearStart = new Date(y, 0, 1);
  const lastYearStart = new Date(y - 1, 0, 1);

  const [sizes, orders, activeCount, doneCount] = await Promise.all([
    prisma.size.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.order.findMany({
      where: { paymentStatus: "paid", createdAt: { gte: lastYearStart } },
      select: { total: true, createdAt: true, items: { select: { sizeKey: true, quantity: true } } },
    }),
    prisma.order.count({ where: { status: { not: "delivered" } } }),
    prisma.order.count({ where: { status: "delivered" } }),
  ]);

  const sizeLabel = new Map(sizes.map((s) => [s.key, s.label]));

  // Revenue series: sum order.total into `n` buckets between [start, end).
  const revBuckets = (start: Date, end: Date, n: number, bucketOf: (d: Date) => number) => {
    const arr = new Array<number>(n).fill(0);
    for (const o of orders) {
      if (o.createdAt >= start && o.createdAt < end) {
        const i = bucketOf(o.createdAt);
        if (i >= 0 && i < n) arr[i] += o.total;
      }
    }
    return arr;
  };

  // Product breakdown by size for orders within [start, end).
  const productBreakdown = (start: Date, end: Date) => {
    const units = new Map<string, number>();
    for (const o of orders) {
      if (o.createdAt < start || o.createdAt >= end) continue;
      for (const it of o.items) units.set(it.sizeKey, (units.get(it.sizeKey) ?? 0) + it.quantity);
    }
    const total = Array.from(units.values()).reduce((a, b) => a + b, 0);
    return sizes.map((s) => {
      const u = units.get(s.key) ?? 0;
      return { label: sizeLabel.get(s.key) ?? s.key, units: u, pct: total ? Math.round((u / total) * 100) : 0 };
    });
  };

  const build = (
    curStart: Date,
    curEnd: Date,
    prevStart: Date,
    prevEnd: Date,
    labels: string[],
    bucketOf: (d: Date) => number
  ): PeriodData => {
    const current = revBuckets(curStart, curEnd, labels.length, bucketOf);
    const previous = revBuckets(prevStart, prevEnd, labels.length, bucketOf);
    return {
      labels,
      current,
      previous,
      currentTotal: current.reduce((a, b) => a + b, 0),
      previousTotal: previous.reduce((a, b) => a + b, 0),
      products: productBreakdown(curStart, curEnd),
    };
  };

  const weekEnd = new Date(thisWeekStart.getTime() + 7 * DAY);
  const dayIndexFrom = (start: Date) => (d: Date) => Math.floor((d.getTime() - start.getTime()) / DAY);
  const weekOfMonth = (d: Date) => Math.min(4, Math.floor((d.getDate() - 1) / 7));
  const monthIdx = (d: Date) => d.getMonth();

  const periods: Periods = {
    week: build(
      thisWeekStart,
      weekEnd,
      lastWeekStart,
      thisWeekStart,
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      // Bucket by day offset from each series' own start.
      (d) => (d >= thisWeekStart ? dayIndexFrom(thisWeekStart)(d) : dayIndexFrom(lastWeekStart)(d))
    ),
    month: build(
      thisMonthStart,
      new Date(y, m + 1, 1),
      lastMonthStart,
      thisMonthStart,
      ["W1", "W2", "W3", "W4", "W5"],
      weekOfMonth
    ),
    year: build(
      thisYearStart,
      new Date(y + 1, 0, 1),
      lastYearStart,
      thisYearStart,
      ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      monthIdx
    ),
  };

  const todaySales = orders.filter((o) => o.createdAt >= startOfToday).reduce((a, o) => a + o.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">Revenue trends and product sales — switch the period on the right of the chart.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={DollarSign} label="Today's sales" value={formatCents(todaySales)} tone="red" />
        <Stat icon={Clock} label="Active orders" value={String(activeCount)} tone="blue" />
        <Stat icon={CheckCircle2} label="Completed orders" value={String(doneCount)} tone="green" />
      </div>

      <DashboardAnalytics periods={periods} />
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
