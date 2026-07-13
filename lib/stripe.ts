import "server-only";
import Stripe from "stripe";

/**
 * Stripe is optional in dev. When STRIPE_SECRET_KEY is unset the checkout falls
 * back to a built-in mock so the order flow is demonstrable end-to-end without
 * keys. Set test keys in .env to exercise real Stripe Checkout in test mode.
 */
const key = process.env.STRIPE_SECRET_KEY;

export const stripeEnabled = Boolean(key);

// apiVersion omitted → uses the account's default pinned version.
export const stripe = key ? new Stripe(key) : null;
