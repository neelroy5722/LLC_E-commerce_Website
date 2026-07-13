"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ArrowRight, User, ShoppingCart, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Sticky public-site header with responsive nav and a mobile drawer. */
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated";
  const isAdmin = session?.user?.role === "admin";
  const accountHref = isAdmin ? "/admin" : "/account";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-blue/10 bg-white/85 backdrop-blur-xl">
      <div className="container flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" aria-label="Apt.Bed by Victory Martin — home" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 rounded-full border border-brand-blue/10 bg-brand-blue/[0.03] p-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-brand-blue-700/80 hover:text-brand-blue-700",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {signedIn ? (
            <>
              <Link
                href={accountHref}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-brand-blue-700/80 transition-colors hover:text-brand-blue-700"
              >
                <User className="h-4 w-4" /> {isAdmin ? "Admin" : "Account"}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label="Sign out"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-brand-blue-700/80 transition-colors hover:text-brand-blue-700"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-brand-blue-700/80 transition-colors hover:text-brand-blue-700"
            >
              <User className="h-4 w-4" /> Sign in
            </Link>
          )}
          <Link
            href="/account/orders"
            aria-label="Cart"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-blue/15 text-brand-blue-700/80 transition-colors hover:border-brand-blue/30 hover:text-brand-blue-700"
          >
            <ShoppingCart className="h-[1.15rem] w-[1.15rem]" />
          </Link>
          <ButtonLink href="/product" size="sm" className="ml-1">
            Configure &amp; Buy <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-brand-blue-700 hover:bg-brand-blue/5 lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="border-t border-brand-blue/10 bg-white lg:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-brand-blue/[0.06] text-brand-blue-700"
                    : "text-brand-blue-700/75 hover:bg-brand-blue/5 hover:text-brand-blue-700",
                )}
              >
                {link.label}
              </Link>
            ))}
            {signedIn ? (
              <>
                <Link
                  href={accountHref}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-brand-blue-700/75 hover:bg-brand-blue/5 hover:text-brand-blue-700"
                >
                  <User className="h-4 w-4" /> {isAdmin ? "Admin" : "My account"}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-base font-medium text-brand-blue-700/75 hover:bg-brand-blue/5 hover:text-brand-blue-700"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-brand-blue-700/75 hover:bg-brand-blue/5 hover:text-brand-blue-700"
              >
                <User className="h-4 w-4" /> Sign in
              </Link>
            )}
            <ButtonLink
              href="/product"
              className="mt-2 w-full"
              onClick={() => setOpen(false)}
            >
              Configure &amp; Buy <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
