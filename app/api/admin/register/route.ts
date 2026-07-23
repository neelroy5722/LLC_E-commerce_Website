import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  code: z.string().min(1, "Admin code is required"),
});

/**
 * Creates an administrator account. Gated behind ADMIN_SIGNUP_CODE so only
 * someone with the store owner's code can register an admin — a public
 * admin-signup form would otherwise let anyone grant themselves admin access.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const expected = process.env.ADMIN_SIGNUP_CODE;
  if (!expected) {
    return NextResponse.json(
      { error: "Admin registration is disabled. Set ADMIN_SIGNUP_CODE on the server to enable it." },
      { status: 403 }
    );
  }
  if (parsed.data.code !== expected) {
    return NextResponse.json({ error: "Invalid admin code." }, { status: 403 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: { email, passwordHash, name: parsed.data.name.trim(), role: "admin", emailVerifiedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
