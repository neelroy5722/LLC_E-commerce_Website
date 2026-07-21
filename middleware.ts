import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Visitors can browse freely: the marketing pages, the product page, the
 * configurator, and the cart are all open — no account needed to look around
 * or price a build (the cart lives in localStorage). Signing in is only
 * required to actually check out, or to reach an account/admin area.
 */
const PROTECTED = ["/checkout", "/account", "/admin"];

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
  matcher: ["/checkout/:path*", "/account/:path*", "/admin/:path*"],
};
