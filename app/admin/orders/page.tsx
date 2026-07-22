import { prisma } from "@/lib/db";
import { AdminOrdersView, type AdminOrderRow } from "@/components/admin/AdminOrdersView";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const rows: AdminOrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    email: o.email,
    config:
      o.items.length === 0
        ? "—"
        : o.items.map((it) => `${it.quantity}× ${it.label}`).join(" · "),
    date: new Date(o.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    ts: new Date(o.createdAt).getTime(),
    total: o.total,
    items: o.items.map((it) => ({ id: it.id, label: it.label, quantity: it.quantity, status: it.status })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Orders</h1>
        <p className="text-sm text-muted">
          Split into active and completed. Open <span className="font-medium text-ink">Manage</span> on a row to advance
          each product&apos;s status — changes are visible to the customer.
        </p>
      </div>
      <AdminOrdersView orders={rows} />
    </div>
  );
}
