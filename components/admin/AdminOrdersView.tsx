"use client";

import { Fragment, useMemo, useState } from "react";
import { Search, ArrowUpDown, ChevronDown, Clock, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/OrderStatus";
import { Button } from "@/components/ui/Button";
import { formatCents } from "@/lib/money";
import { ORDER_FLOW, statusIndex } from "@/lib/order-status";
import { advanceItemStatusAction } from "@/app/admin/actions";

export interface AdminOrderItem {
  id: string;
  label: string;
  quantity: number;
  status: string;
}

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  config: string; // joined item labels, for search
  date: string;
  ts: number;
  total: number;
  items: AdminOrderItem[];
}

type Sort = "newest" | "oldest" | "total_high" | "total_low" | "order";

const DELIVERED_INDEX = ORDER_FLOW.length - 1;

/** Least-advanced item drives the order's overall status. */
function overallIndex(o: AdminOrderRow): number {
  if (o.items.length === 0) return 0;
  return Math.min(...o.items.map((i) => statusIndex(i.status)));
}

export function AdminOrdersView({ orders }: { orders: AdminOrderRow[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const { active, completed } = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = query
      ? orders.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(query) ||
            o.customerName.toLowerCase().includes(query) ||
            o.email.toLowerCase().includes(query) ||
            o.config.toLowerCase().includes(query)
        )
      : [...orders];
    filtered.sort((a, b) => {
      if (sort === "oldest") return a.ts - b.ts;
      if (sort === "total_high") return b.total - a.total;
      if (sort === "total_low") return a.total - b.total;
      if (sort === "order") return a.orderNumber.localeCompare(b.orderNumber);
      return b.ts - a.ts;
    });
    const active: AdminOrderRow[] = [];
    const completed: AdminOrderRow[] = [];
    for (const o of filtered) {
      (overallIndex(o) === DELIVERED_INDEX && o.items.length > 0 ? completed : active).push(o);
    }
    return { active, completed };
  }, [orders, q, sort]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order #, customer, email, product…"
            className="w-full rounded-xl border border-brand-blue/12 bg-panel py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-brand-sky"
          />
        </div>
        <label className="inline-flex items-center gap-2 rounded-xl border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted" />
          <span className="text-muted">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="bg-transparent text-ink outline-none">
            <option value="newest" className="bg-panel">Newest</option>
            <option value="oldest" className="bg-panel">Oldest</option>
            <option value="total_high" className="bg-panel">Total: high → low</option>
            <option value="total_low" className="bg-panel">Total: low → high</option>
            <option value="order" className="bg-panel">Order #</option>
          </select>
        </label>
      </div>

      <OrderTable
        title="Active orders"
        icon={Clock}
        tone="text-brand-sky"
        rows={active}
        expanded={expanded}
        toggle={toggle}
        emptyLabel="No active orders."
      />
      <OrderTable
        title="Completed orders"
        icon={CheckCircle2}
        tone="text-emerald-600"
        rows={completed}
        expanded={expanded}
        toggle={toggle}
        emptyLabel="No completed orders yet."
      />
    </div>
  );
}

function OrderTable({
  title,
  icon: Icon,
  tone,
  rows,
  expanded,
  toggle,
  emptyLabel,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  rows: AdminOrderRow[];
  expanded: Set<string>;
  toggle: (id: string) => void;
  emptyLabel: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-brand-blue/[0.08] px-6 py-4">
        <Icon className={`h-4 w-4 ${tone}`} />
        <h2 className="font-sans text-lg font-bold text-ink">{title}</h2>
        <span className="rounded-full bg-brand-blue/[0.06] px-2 py-0.5 text-xs font-medium text-muted">{rows.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] table-fixed text-sm">
          <colgroup>
            <col className="w-24" />
            <col className="w-44" />
            <col />
            <col className="w-28" />
            <col className="w-28" />
            <col className="w-36" />
            <col className="w-24" />
          </colgroup>
          <thead>
            <tr className="border-b border-brand-blue/[0.08] bg-brand-blue/[0.02] text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-3 font-medium">Order</th>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Products</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 text-right font-medium">Total</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Manage</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-muted">{emptyLabel}</td></tr>
            )}
            {rows.map((o) => {
              const isOpen = expanded.has(o.id);
              const products = o.items.map((it) => `${it.quantity > 1 ? `${it.quantity}× ` : ""}${it.label}`).join(" · ") || "—";
              return (
                <Fragment key={o.id}>
                  <tr className="border-b border-brand-blue/[0.06] last:border-0">
                    <td className="truncate px-6 py-3.5 font-medium text-ink">{o.orderNumber}</td>
                    <td className="truncate px-6 py-3.5 text-ink/90">{o.customerName}</td>
                    <td className="truncate px-6 py-3.5 text-ink/80" title={products}>{products}</td>
                    <td className="truncate px-6 py-3.5 text-muted">{o.date}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-ink">{formatCents(o.total)}</td>
                    <td className="px-6 py-3.5"><StatusBadge statusIndex={overallIndex(o)} /></td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => toggle(o.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-blue/12 px-2.5 py-1.5 text-xs font-medium text-ink/80 hover:border-brand-blue/25"
                      >
                        {isOpen ? "Hide" : "Manage"}
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-brand-blue/[0.06] bg-brand-blue/[0.02]">
                      <td colSpan={7} className="px-6 py-4">
                        <ul className="space-y-2.5">
                          {o.items.map((it) => (
                            <li key={it.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-blue/[0.08] bg-panel px-3 py-2.5">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-ink/90">{it.quantity > 1 ? `${it.quantity}× ` : ""}{it.label}</span>
                                <StatusBadge statusIndex={statusIndex(it.status)} />
                              </div>
                              <form action={advanceItemStatusAction} className="flex items-center gap-2">
                                <input type="hidden" name="itemId" value={it.id} />
                                <select
                                  name="status"
                                  defaultValue={it.status}
                                  className="rounded-lg border border-brand-blue/12 bg-night px-2 py-1.5 text-xs text-ink outline-none focus:border-brand-sky"
                                >
                                  {ORDER_FLOW.map((s) => (
                                    <option key={s.key} value={s.key}>{s.label}</option>
                                  ))}
                                </select>
                                <Button type="submit" size="sm" variant="outline" className="h-8 px-3 text-xs">Update</Button>
                              </form>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
