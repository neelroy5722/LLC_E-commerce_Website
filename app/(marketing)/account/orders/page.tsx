import { Prisma } from "@prisma/client";
import { ButtonLink } from "@/components/ui/Button";
import { SortSelect } from "@/components/admin/SortSelect";
import { ProductStatusList } from "@/components/ProductStatus";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { formatCents } from "@/lib/money";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const ORDER_SORTS: Record<string, Prisma.OrderOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  total_high: { total: "desc" },
  total_low: { total: "asc" },
  status: { status: "asc" },
};

export default async function AccountOrders({ searchParams }: { searchParams: { sort?: string } }) {
  const su = await getSessionUser();
  const sort = searchParams.sort && ORDER_SORTS[searchParams.sort] ? searchParams.sort : "newest";
  const orders = await prisma.order.findMany({
    where: { userId: su!.id },
    include: { items: true, history: { orderBy: { createdAt: "asc" } } },
    orderBy: ORDER_SORTS[sort],
  });

  if (orders.length === 0) {
    return (
      <div className="card p-10 text-center">
        <h2 className="font-display text-xl font-bold text-ink">No orders yet</h2>
        <p className="mt-2 text-sm text-muted">When you place an order it will appear here.</p>
        <ButtonLink href="/product" className="mt-5">
          Configure your Apt.Bed <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Your orders</h2>
          <p className="text-sm text-muted">Showing all {orders.length} order{orders.length === 1 ? "" : "s"}.</p>
        </div>
        <SortSelect
          defaultValue="newest"
          options={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "total_high", label: "Total: high → low" },
            { value: "total_low", label: "Total: low → high" },
            { value: "status", label: "Status" },
          ]}
        />
      </div>
      {orders.map((o) => (
        <div key={o.id} className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-bold text-ink">{o.orderNumber}</p>
              <p className="text-sm text-muted">
                {new Date(o.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                · {o.items.length} product{o.items.length === 1 ? "" : "s"}
              </p>
            </div>
            <span className="font-medium text-ink">{formatCents(o.total)}</span>
          </div>

          <p className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Status by product
          </p>
          <ProductStatusList
            items={o.items.map((it) => ({ id: it.id, label: it.label, quantity: it.quantity, status: it.status }))}
          />

          <dl className="mt-6 grid gap-2 border-t border-brand-blue/[0.08] pt-4 text-sm sm:grid-cols-4">
            <Cell label="Subtotal" value={formatCents(o.subtotal)} />
            <Cell label="Tax" value={formatCents(o.tax)} />
            <Cell label="Freight" value={formatCents(o.freight)} />
            <Cell label="Total" value={formatCents(o.total)} />
          </dl>
        </div>
      ))}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
