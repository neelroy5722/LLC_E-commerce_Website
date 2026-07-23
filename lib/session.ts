import "server-only";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** The current session user (id, email, name, role) or null. */
export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

/** Full DB user record for the signed-in customer, or null. */
export async function getCurrentUser() {
  const su = await getSessionUser();
  if (!su?.id) return null;
  return prisma.user.findUnique({ where: { id: su.id } });
}

/** Require a signed-in user; redirect to /login otherwise. */
export async function requireUser(returnTo = "/account") {
  const su = await getSessionUser();
  if (!su?.id) redirect(`/login?callbackUrl=${encodeURIComponent(returnTo)}`);
  return su;
}

/** Require the admin capability; redirect non-admins to their account. */
export async function requireAdmin() {
  const su = await getSessionUser();
  if (!su?.id) redirect(`/login?callbackUrl=${encodeURIComponent("/admin")}`);
  const isAdmin = su.roles ? su.roles.includes("admin") : su.role === "admin";
  if (!isAdmin) redirect("/account");
  return su;
}
