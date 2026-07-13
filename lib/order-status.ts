/** Order lifecycle — client-safe (no server-only imports). */

export const ORDER_FLOW = [
  { key: "received", label: "Order Received", desc: "We've got your order and payment." },
  { key: "in_production", label: "In Production", desc: "Your Apt.Bed is being built to order." },
  { key: "ready_for_freight", label: "Ready for Freight", desc: "Built, inspected, and staged for pickup." },
  { key: "shipped", label: "Shipped", desc: "On a freight truck headed your way." },
  { key: "delivered", label: "Delivered", desc: "Delivered and ready to assemble." },
] as const;

export type OrderStatusKey = (typeof ORDER_FLOW)[number]["key"];

export function statusIndex(key: string): number {
  const i = ORDER_FLOW.findIndex((s) => s.key === key);
  return i === -1 ? 0 : i;
}

export function statusLabel(key: string): string {
  return ORDER_FLOW[statusIndex(key)].label;
}
