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

  const [sizes, orders, activeCount, doneCount, totalUsers, orderGroups, deliveredHist] = await Promise.all([
    prisma.size.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.order.findMany({
      where: { paymentStatus: "paid", createdAt: { gte: lastYearStart } },
      select: { total: true, createdAt: true, items: { select: { sizeKey: true, quantity: true } } },
    }),
    prisma.order.count({ where: { status: { not: "delivered" } } }),
    prisma.order.count({ where: { status: "delivered" } }),
    prisma.user.count(),
    prisma.order.groupBy({ by: ["userId"], where: { userId: { not: null } }, _count: { _all: true } }),
    prisma.orderStatusHistory.findMany({
      where: { status: "delivered" },
      select: { createdAt: true, order: { select: { createdAt: true } } },
    }),
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
  const todayOrders = orders.filter((o) => o.createdAt >= startOfToday).length;
  const monthRevenue = orders.filter((o) => o.createdAt >= thisMonthStart).reduce((a, o) => a + o.total, 0);
  const paidRevenue = orders.reduce((a, o) => a + o.total, 0);
  const avgOrderValue = orders.length ? Math.round(paidRevenue / orders.length) : 0;

  const unitsBySize = new Map<string, number>();
  for (const o of orders) for (const it of o.items) unitsBySize.set(it.sizeKey, (unitsBySize.get(it.sizeKey) ?? 0) + it.quantity);
  let bestSeller = "—";
  let bestUnits = -1;
  for (const s of sizes) {
    const u = unitsBySize.get(s.key) ?? 0;
    if (u > bestUnits) {
      bestUnits = u;
      bestSeller = s.label;
    }
  }

  // Average order processing time (order placed → delivered), in days.
  const procDiffs = deliveredHist
    .map((h) => (h.createdAt.getTime() - h.order.createdAt.getTime()) / DAY)
    .filter((v) => v >= 0 && v <= 120);
  const processingDays = procDiffs.length
    ? `${(procDiffs.reduce((a, b) => a + b, 0) / procDiffs.length).toFixed(1)} days`
    : "—";

  // Returning-customer rate: customers with 2+ orders / customers with any order.
  const customersWithOrders = orderGroups.length;
  const returningCustomers = orderGroups.filter((g) => g._count._all >= 2).length;
  const returningRate = customersWithOrders ? Math.round((returningCustomers / customersWithOrders) * 100) : 0;

  const metrics = {
    dailyRevenue: formatCents(todaySales),
    monthlyRevenue: formatCents(monthRevenue),
    todayOrders,
    avgOrderValue: formatCents(avgOrderValue),
    processingDays,
    activeOrders: activeCount,
    completedOrders: doneCount,
    totalUsers,
    returningRate,
    bestSeller,
  };

  return <DashboardAnalytics metrics={metrics} periods={periods} />;
}
