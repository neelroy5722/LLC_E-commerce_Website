import "server-only";
import { prisma } from "@/lib/db";
import { priceCart, type CartLineInput } from "@/lib/pricing";
import { sendOrderConfirmation, sendNewOrderAdminAlert } from "@/lib/mail";
import { formatCents } from "@/lib/money";
import { ORDER_FLOW, statusIndex } from "@/lib/order-status";

interface OrderForAlert {
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  items: { label: string; quantity: number }[];
}

/**
 * On a new paid order: record a dashboard notification for the admin and email
 * them an alert. Best-effort — a failure here must never fail the order itself.
 */
async function notifyAdminNewOrder(order: OrderForAlert): Promise<void> {
  const summary = order.items.map((i) => `${i.quantity}× ${i.label}`).join(", ");
  try {
    await prisma.notification.create({
      data: {
        type: "order",
        title: `New order ${order.orderNumber}`,
        body: `${order.customerName} · ${formatCents(order.total)} · ${summary}`,
        link: "/admin/orders",
      },
    });
  } catch (err) {
    console.error("[orders] failed to create admin notification:", err);
  }

  const admin = await prisma.user.findFirst({ where: { role: "admin" }, select: { email: true } });
  const adminEmail = process.env.ADMIN_EMAIL || admin?.email;
  if (adminEmail) {
    await sendNewOrderAdminAlert({
      adminEmail,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.email,
      items: order.items,
      total: order.total,
    });
  }
}

export interface ShippingInfo {
  name: string;
  email: string;
  phone?: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
}

async function nextOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  let n = 1057 + count;
  // Guard against collisions if orders were deleted.
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.order.findUnique({ where: { orderNumber: `VM-${n}` } })) n++;
  return `VM-${n}`;
}

/**
 * Creates an order (one or many configurations) with its items, status history,
 * and (when paid) a payment record. Pricing is always recomputed server-side
 * from the DB so a tampered client can't change the total.
 */
export async function createOrder(params: {
  items: CartLineInput[];
  shipping: ShippingInfo;
  userId?: string | null;
  paid: boolean;
  stripeSessionId?: string;
}) {
  const { items, shipping, userId, paid, stripeSessionId } = params;
  const price = await priceCart(items, shipping.state);
  const orderNumber = await nextOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: userId ?? null,
      email: shipping.email,
      customerName: shipping.name,
      phone: shipping.phone,
      shipLine1: shipping.line1,
      shipCity: shipping.city,
      shipState: shipping.state.toUpperCase(),
      shipZip: shipping.zip,
      subtotal: price.subtotalCents,
      tax: price.taxCents,
      freight: price.freightCents,
      total: price.totalCents,
      status: "received",
      paymentStatus: paid ? "paid" : "pending",
      stripeSessionId,
      items: {
        create: price.lines.map((l) => ({
          sizeKey: l.sizeKey,
          heightKey: l.heightKey,
          woodKey: l.woodKey,
          label: l.label,
          unitPrice: l.unitPriceCents,
          quantity: l.quantity,
        })),
      },
      history: { create: [{ status: "received", note: paid ? "Order placed and paid." : "Order created — awaiting payment." }] },
      payments: paid
        ? { create: [{ provider: "mock", amount: price.totalCents, status: "succeeded", reference: "dev-mock" }] }
        : undefined,
    },
    include: { items: true },
  });

  if (paid) {
    const items = price.lines.map((l) => ({ label: l.label, quantity: l.quantity }));
    await sendOrderConfirmation({
      orderNumber,
      email: shipping.email,
      customerName: shipping.name,
      items,
      subtotal: price.subtotalCents,
      tax: price.taxCents,
      freight: price.freightCents,
      total: price.totalCents,
    });
    await notifyAdminNewOrder({ orderNumber, customerName: shipping.name, email: shipping.email, total: price.totalCents, items });
  }

  return order;
}

/** Marks a pending order paid (used by the Stripe webhook / success return). */
export async function markOrderPaid(orderId: string, reference: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.paymentStatus === "paid") return order;

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "paid" } }),
    prisma.payment.create({
      data: { orderId, provider: "stripe", amount: order.total, status: "succeeded", reference },
    }),
  ]);

  const items = order.items.map((it) => ({ label: it.label, quantity: it.quantity }));
  await sendOrderConfirmation({
    orderNumber: order.orderNumber,
    email: order.email,
    customerName: order.customerName,
    items,
    subtotal: order.subtotal,
    tax: order.tax,
    freight: order.freight,
    total: order.total,
  });
  await notifyAdminNewOrder({ orderNumber: order.orderNumber, customerName: order.customerName, email: order.email, total: order.total, items });

  return order;
}

/**
 * Advances a single order item's status and recomputes the order's overall
 * status as the least-advanced item, recording a history entry when it changes.
 */
export async function advanceOrderItemStatus(itemId: string, status: string) {
  const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
  if (!item) return;
  await prisma.orderItem.update({ where: { id: itemId }, data: { status } });

  const items = await prisma.orderItem.findMany({ where: { orderId: item.orderId } });
  const minIdx = Math.min(...items.map((i) => statusIndex(i.status)));
  const overall = ORDER_FLOW[minIdx].key;

  const order = await prisma.order.findUnique({ where: { id: item.orderId } });
  if (order && order.status !== overall) {
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: overall } }),
      prisma.orderStatusHistory.create({
        data: { orderId: order.id, status: overall, note: "Overall status updated from item progress." },
      }),
    ]);
  }
}
