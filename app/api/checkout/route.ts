import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { priceCart, type CartLineInput } from "@/lib/pricing";
import { createOrder } from "@/lib/orders";
import { stripe, stripeEnabled } from "@/lib/stripe";

const schema = z.object({
  items: z
    .array(
      z.object({
        size: z.string().min(1),
        height: z.string().min(1),
        wood: z.string().min(1),
        qty: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Your cart is empty."),
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  line1: z.string().min(1).max(200),
  city: z.string().min(1).max(120),
  state: z.string().length(2),
  zip: z.string().min(3).max(12),
});

export async function POST(req: Request) {
  // Require a signed-in user — the whole shop is gated behind auth.
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to check out." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check your details." },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const items: CartLineInput[] = d.items.map((i) => ({
    sizeKey: i.size,
    heightKey: i.height,
    woodKey: i.wood,
    quantity: i.qty,
  }));
  const shipping = {
    name: d.name,
    email: d.email.toLowerCase(),
    phone: d.phone || undefined,
    line1: d.line1,
    city: d.city,
    state: d.state,
    zip: d.zip,
  };

  // Validate the cart resolves to real variants + price.
  let price;
  try {
    price = await priceCart(items, d.state);
  } catch {
    return NextResponse.json({ error: "One of your configurations is unavailable." }, { status: 400 });
  }

  const userId = session.user.id;
  // Behind a reverse proxy (Caddy) the request host is the app's internal
  // localhost address, so prefer the configured public URL for Stripe's
  // success/cancel redirect targets. Falls back to the request origin in dev.
  const origin = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;

  // --- Real Stripe Checkout (test mode) ---
  if (stripeEnabled && stripe) {
    const order = await createOrder({ items, shipping, userId, paid: false });
    const lineItems = [
      ...price.lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "usd" as const,
          unit_amount: l.unitPriceCents,
          product_data: { name: l.label },
        },
      })),
    ];
    // Only add freight/tax lines when non-zero — Stripe shouldn't show a $0 line
    // (e.g. a 0% sales-tax state such as Oregon).
    if (price.freightCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd" as const,
          unit_amount: price.freightCents,
          product_data: { name: "Freight delivery" },
        },
      });
    }
    if (price.taxCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd" as const,
          unit_amount: price.taxCents,
          product_data: { name: `Sales tax (${d.state} ${price.taxRatePercent}%)` },
        },
      });
    }
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: shipping.email,
      line_items: lineItems,
      success_url: `${origin}/checkout/success?order=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=1`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkout.id },
    });
    return NextResponse.json({ url: checkout.url });
  }

  // --- Mock checkout (no Stripe keys): create a paid order immediately ---
  const order = await createOrder({ items, shipping, userId, paid: true });
  return NextResponse.json({ url: `/checkout/success?order=${order.orderNumber}` });
}
