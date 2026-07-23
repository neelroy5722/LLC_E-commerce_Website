import { DashboardAnalytics, type DashboardData } from "@/components/admin/DashboardAnalytics";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;

export default async function AdminDashboard() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const startOfToday = new Date(y, m, now.getDate());
  const thisMonthStart = new Date(y, m, 1);
  const twoYearsAgo = new Date(y - 2, m, now.getDate());

  const [sizes, ordersRaw, activeCount, totalUsers, deliveredHist] = await Promise.all([
    prisma.size.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.order.findMany({
      where: { paymentStatus: "paid", createdAt: { gte: twoYearsAgo } },
      select: { total: true, createdAt: true, userId: true, items: { select: { sizeKey: true, quantity: true } } },
    }),
    prisma.order.count({ where: { status: { not: "delivered" } } }),
    prisma.user.count(),
    prisma.orderStatusHistory.findMany({
      where: { status: "delivered" },
      select: { createdAt: true, order: { select: { createdAt: true } } },
    }),
  ]);

  const orders = ordersRaw.map((o) => ({
    t: o.createdAt.getTime(),
    total: o.total,
    userId: o.userId,
    items: o.items.map((it) => ({ sizeKey: it.sizeKey, quantity: it.quantity })),
  }));

  const deliveries = deliveredHist
    .filter((h) => h.order)
    .map((h) => ({ placedT: h.order!.createdAt.getTime(), deliveredT: h.createdAt.getTime() }))
    .filter((d) => d.deliveredT >= d.placedT && d.deliveredT - d.placedT <= 120 * DAY);

  const todayMs = startOfToday.getTime();
  const monthMs = thisMonthStart.getTime();
  const todayRevenue = orders.filter((o) => o.t >= todayMs).reduce((a, o) => a + o.total, 0);
  const todayOrders = orders.filter((o) => o.t >= todayMs).length;
  const monthRevenue = orders.filter((o) => o.t >= monthMs).reduce((a, o) => a + o.total, 0);

  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const defaultStart = new Date(startOfToday.getTime() - 29 * DAY);

  const data: DashboardData = {
    nowMs: now.getTime(),
    todayISO: iso(startOfToday),
    defaultStartISO: iso(defaultStart),
    orders,
    deliveries,
    sizes: sizes.map((s) => ({ key: s.key, label: s.label })),
    fixed: {
      todayRevenue,
      monthRevenue,
      todayOrders,
      activeOrders: activeCount,
      totalUsers,
    },
  };

  return <DashboardAnalytics data={data} />;
}
