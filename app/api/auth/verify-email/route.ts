import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({ token: z.string().min(1) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const tokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This verification link is invalid or has expired. Please request a new one." },
      { status: 400 }
    );
  }

  // Already consumed (e.g. the link was opened twice) — idempotent success.
  if (record.usedAt) {
    return NextResponse.json({ ok: true });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return NextResponse.json({ ok: true });
}
