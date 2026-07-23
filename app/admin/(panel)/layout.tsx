import Link from "next/link";
import { Bell } from "lucide-react";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const unread = await prisma.notification.count({ where: { readAt: null } });

  return (
    <div className="admin-scope min-h-screen bg-night2">
      {/* Fixed full-height sidebar (desktop) */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-60 lg:flex-col border-r border-brand-blue/10 bg-white">
        <Link href="/admin" className="flex h-16 items-center gap-2 border-b border-brand-blue/[0.08] px-5">
          <Logo />
        </Link>
        <div className="flex-1 overflow-y-auto p-3">
          <DashboardNav variant="admin" />
        </div>
        <div className="border-t border-brand-blue/[0.08] p-3">
          <Link href="/" className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-brand-blue/5 hover:text-ink">
            View store ↗
          </Link>
        </div>
      </aside>

      {/* Content column */}
      <div className="lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-brand-blue/10 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin" className="lg:hidden" aria-label="Admin home">
              <LogoMark className="h-7 w-7" />
            </Link>
            <span className="hidden text-sm text-muted sm:block">Welcome back, Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              aria-label={`Orders${unread > 0 ? ` (${unread} new)` : ""}`}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-blue/12 text-ink/70 transition-colors hover:border-brand-blue/25 hover:text-ink"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <SignOutButton />
          </div>
        </header>

        {/* Mobile nav (horizontal scroll) */}
        <div className="overflow-x-auto border-b border-brand-blue/10 bg-white px-3 py-2 lg:hidden">
          <DashboardNav variant="admin" />
        </div>

        <main className="p-4 sm:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
