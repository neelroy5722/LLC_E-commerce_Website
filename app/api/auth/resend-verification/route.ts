import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmailVerification } from "@/lib/mail";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));

  // Throttle by IP; always fall through to the identical response so the
  // endpoint can't reveal which emails exist or are already verified.
  const allowed = rateLimit(`resend-verify:${clientIp(req)}`, 5, 15 * 60 * 1000);

  if (parsed.success && allowed) {
    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && !user.emailVerifiedAt) {
      // Supersede any earlier unused tokens so only the newest link works.
      await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id, usedAt: null } });

      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      await prisma.emailVerificationToken.create({
        data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + VERIFY_TTL_MS) },
      });

      const base = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
      const verifyUrl = `${base}/verify-email?token=${token}`;
      await sendEmailVerification({ email: user.email, name: user.name, verifyUrl });
    }
  }

  return NextResponse.json({ ok: true });
}
