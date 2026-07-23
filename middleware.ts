import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Visitors can browse freely: the marketing pages, the product page, the
 * configurator, and the cart are all open. Signing in is only required to
 * check out or to reach an account/admin area. The admin area has its own
 * dedicated sign-in page (/admin/login), which is itself public. There is no
 * admin self-registration — admins are provisioned directly in the database.
 */
const PROTECTED = ["/checkout", "/account", "/admin"];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // The admin sign-in page must stay public (it lives under /admin).
  if (pathname === "/admin/login") return NextResponse.next();

  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsAuth) return NextResponse.next();

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = isAdminRoute ? "/admin/login" : "/login";
    url.search = "";
    url.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // The admin area additionally requires the "admin" capability. A signed-in
  // customer (e.g. someone who registered through the general sign-up page) has
  // only the "customer" role and can never reach the dashboard — send them to
  // their own account page instead. (Fallback to the legacy single role for
  // sessions issued before roles[] existed.)
  const roles = (token.roles as string[] | undefined) ?? (token.role === "admin" ? ["admin", "customer"] : ["customer"]);
  if (isAdminRoute && !roles.includes("admin")) {
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
