import { StatusBadge, StatusTimeline } from "@/components/OrderStatus";
import { statusIndex } from "@/lib/order-status";

export interface ProductStatusItem {
  id?: string;
  label: string;
  quantity?: number;
  status: string;
}

/** Lists each product in an order with its own status badge + step tracker. */
export function ProductStatusList({ items }: { items: ProductStatusItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((it, i) => {
        const idx = statusIndex(it.status);
        return (
          <li key={it.id ?? i} className="rounded-xl border border-brand-blue/[0.06] bg-panel px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">
                {it.quantity && it.quantity > 1 ? `${it.quantity}× ` : ""}
                {it.label}
              </span>
              <StatusBadge statusIndex={idx} />
            </div>
            <div className="mt-4">
              <StatusTimeline statusIndex={idx} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
