"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
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

export function AdminOrdersView({ orders }: { orders: AdminOrderRow[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("newest");

  const groups = useMemo(() => {
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
    const map = new Map<string, { name: string; email: string; rows: AdminOrderRow[] }>();
    for (const o of filtered) {
      const g = map.get(o.email) ?? { name: o.customerName, email: o.email, rows: [] };
      g.rows.push(o);
      map.set(o.email, g);
    }
    return Array.from(map.values());
  }, [orders, q, sort]);

  return (
    <div className="space-y-6">
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

      {groups.length === 0 && (
        <div className="card p-10 text-center text-muted">No orders match your search.</div>
      )}

      {groups.map((g) => (
        <div key={g.email} className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-blue/[0.08] px-6 py-4">
            <div>
              <p className="font-display text-base font-bold text-ink">{g.name}</p>
              <p className="text-xs text-muted">{g.email}</p>
            </div>
            <span className="text-xs text-muted">{g.rows.length} order{g.rows.length > 1 ? "s" : ""}</span>
          </div>

          <div className="divide-y divide-brand-blue/[0.06]">
            {g.rows.map((o) => (
              <div key={o.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{o.orderNumber}</span>
                  <span className="text-xs text-muted">{o.date} · {formatCents(o.total)}</span>
                </div>

                {/* Each product tracked + advanced separately */}
                <ul className="mt-3 space-y-2.5">
                  {o.items.map((it) => (
                    <li
                      key={it.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-blue/[0.06] bg-panel px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-ink/90">
                          {it.quantity > 1 ? `${it.quantity}× ` : ""}
                          {it.label}
                        </span>
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
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
