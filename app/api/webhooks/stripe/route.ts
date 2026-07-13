import { NextResponse } from "next/server";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/orders";

/**
 * Stripe webhook — marks the order paid on checkout.session.completed and sends
 * the confirmation email. Only active when Stripe keys are configured.
 */
export async function POST(req: Request) {
  if (!stripeEnabled || !stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = await req.text();

  let event;
  try {
    event = secret && sig ? stripe.webhooks.constructEvent(raw, sig, secret) : JSON.parse(raw);
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; payment_intent?: string; metadata?: { orderId?: string } };
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await markOrderPaid(orderId, session.payment_intent || session.id);
    }
  }

  return NextResponse.json({ received: true });
}
