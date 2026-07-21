import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Health / readiness probe for the host (VPS) and uptime monitoring.
 * Verifies DB connectivity and reports which production integrations are wired
 * (booleans only — never leaks secret values).
 */
export async function GET() {
  let db = "down";
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "up";
  } catch {
    db = "down";
  }

  const mediaConfigured =
    Boolean(process.env.CLOUDINARY_URL) ||
    Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

  const body = {
    status: db === "up" ? "ok" : "degraded",
    db,
    integrations: {
      stripe: Boolean(process.env.STRIPE_SECRET_KEY),
      stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      email: Boolean(process.env.RESEND_API_KEY),
      media: mediaConfigured ? "cloudinary" : "local",
      freight: (process.env.FREIGHT_PROVIDER || "flat").toLowerCase(),
    },
    time: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: db === "up" ? 200 : 503 });
}
