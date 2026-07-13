"use client";

import { useMemo, useState } from "react";
import { Search, Trash2, ArrowUpDown } from "lucide-react";
import { formatCents } from "@/lib/money";
import { deleteCustomerAction } from "@/app/admin/actions";

export interface AdminCustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  canDelete: boolean;
}

type Sort = "name" | "orders" | "spend";

export function AdminCustomersView({ customers }: { customers: AdminCustomerRow[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("name");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = query
      ? customers.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.phone.toLowerCase().includes(query)
        )
      : [...customers];
    filtered.sort((a, b) => {
      if (sort === "orders") return b.orders - a.orders;
      if (sort === "spend") return b.spent - a.spent;
      return a.name.localeCompare(b.name);
    });
    return filtered;
  }, [customers, q, sort]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, or phone…"
            className="w-full rounded-xl border border-brand-blue/12 bg-panel py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-brand-sky"
          />
        </div>
        <label className="inline-flex items-center gap-2 rounded-xl border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted" />
          <span className="text-muted">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="bg-transparent text-ink outline-none">
            <option value="name" className="bg-panel">Name A–Z</option>
            <option value="orders" className="bg-panel">Most orders</option>
            <option value="spend" className="bg-panel">Highest spend</option>
          </select>
        </label>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <thead>
              <tr className="border-b border-brand-blue/[0.08] bg-brand-blue/[0.02] text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 text-right font-medium">Orders</th>
                <th className="px-6 py-3 text-right font-medium">Spend</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-muted">No customers match.</td></tr>
              )}
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-brand-blue/[0.06] last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-sky/15 text-sm font-semibold text-brand-sky">
                        {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                      <span className="font-medium text-ink">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted">{c.email}</td>
                  <td className="px-6 py-4 text-muted">{c.phone || "—"}</td>
                  <td className="px-6 py-4 text-right text-ink">{c.orders}</td>
                  <td className="px-6 py-4 text-right font-medium text-ink">{formatCents(c.spent)}</td>
                  <td className="px-6 py-4 text-right">
                    {c.canDelete ? (
                      <form action={deleteCustomerAction} className="inline">
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 text-xs text-muted hover:text-brand-red-600"
                          title="All orders delivered — safe to delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-muted/60" title="Has open orders">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted">
        Customers can only be deleted once all their orders are delivered.
      </p>
    </div>
  );
}
