import { prisma } from "@/lib/db";
import { AdminCustomersView, type AdminCustomerRow } from "@/components/admin/AdminCustomersView";

export const dynamic = "force-dynamic";

export default async function AdminCustomers() {
  const users = await prisma.user.findMany({
    where: { role: "customer" },
    include: { orders: { select: { total: true, paymentStatus: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows: AdminCustomerRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    orders: u.orders.length,
    spent: u.orders.filter((o) => o.paymentStatus === "paid").reduce((a, o) => a + o.total, 0),
    // Deletable only when there are no undelivered orders.
    canDelete: u.orders.every((o) => o.status === "delivered"),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold text-ink">Customers</h1>
        <p className="text-sm text-muted">Search, view contact details, and manage accounts.</p>
      </div>
      <AdminCustomersView customers={rows} />
    </div>
  );
}
