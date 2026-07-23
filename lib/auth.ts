import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

/**
 * Capabilities for a stored role. An admin is also a customer, so an admin
 * account carries both roles and can use the storefront as well as the
 * dashboard. Every account created through the general sign-up page is a plain
 * customer and gets only the "customer" role.
 */
export function rolesFor(role: string): string[] {
  return role === "admin" ? ["admin", "customer"] : ["customer"];
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // "admin" when the request comes from the admin sign-in page, otherwise
        // the general (customer) portal. Used to keep admins off the user page.
        portal: { label: "Portal", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // Require a verified email before allowing sign-in. The thrown message
        // is surfaced to the login page so it can offer to resend the link.
        if (!user.emailVerifiedAt) throw new Error("EMAIL_NOT_VERIFIED");

        // Admins must authenticate through the admin sign-in page. Reject an
        // admin account that tries to sign in from the general (user) portal.
        if (credentials?.portal !== "admin" && user.role === "admin") {
          throw new Error("ADMIN_PORTAL_REQUIRED");
        }

        return { id: user.id, email: user.email, name: user.name, role: user.role, roles: rolesFor(user.role) };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as { id: string }).id;
        token.role = (user as { role: string }).role;
        token.roles = (user as { roles?: string[] }).roles ?? rolesFor((user as { role: string }).role);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.role = token.role as string;
        session.user.roles = (token.roles as string[] | undefined) ?? rolesFor(token.role as string);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
