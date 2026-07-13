import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Gate the whole shopping + account + admin experience behind login. Public
 * marketing pages (home, about, faq, contact, brand, assembly, legal) stay
 * open so visitors can learn about the Apt.Bed, but configuring, carting,
 * checking out, and any account/admin action require a signed-in user.
 */
const PROTECTED = ["/product", "/cart", "/checkout", "/account", "/admin"];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsAuth) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // The admin area additionally requires the admin role.
  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && token.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/product/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/account/:path*",
    "/admin/:path*",
  ],
};
