import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmailVerification } from "@/lib/mail";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  // Every account created here is a plain customer — the request body has no
  // "role" field and this endpoint always writes role: "customer". There is no
  // way to obtain admin access through the general sign-up page, even with an
  // email that is meant for an administrator; admins are provisioned only in
  // the database.
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name: parsed.data.name.trim(), role: "customer" },
  });

  // Issue an email-verification token and send the link. The account stays
  // unverified (sign-in is blocked) until the user opens it.
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await prisma.emailVerificationToken.create({
    data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + VERIFY_TTL_MS) },
  });

  const base = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
  const verifyUrl = `${base}/verify-email?token=${token}`;
  await sendEmailVerification({ email: user.email, name: user.name, verifyUrl });

  return NextResponse.json({ ok: true });
}
