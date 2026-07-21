import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendPasswordReset } from "@/lib/mail";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));

  // Throttle by IP so the endpoint can't be used to email-bomb a victim or burn
  // the email quota. When over the limit we still fall through to the identical
  // response below (just skipping the send), preserving anti-enumeration.
  const allowed = rateLimit(`forgot:${clientIp(req)}`, 5, 15 * 60 * 1000);

  // Always respond the same way whether or not the email matches an account —
  // this prevents attackers from using the endpoint to discover which emails
  // are registered.
  if (parsed.success && allowed) {
    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Raw token goes in the email link; only its hash is stored.
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      // Supersede any earlier unused tokens so only the newest link works.
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
      await prisma.passwordResetToken.create({
        data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
      });

      const base = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
      const resetUrl = `${base}/reset-password?token=${token}`;
      await sendPasswordReset({ email: user.email, name: user.name, resetUrl });
    }
  }

  return NextResponse.json({ ok: true });
}
