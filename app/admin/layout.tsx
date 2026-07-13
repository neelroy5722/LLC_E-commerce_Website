import Link from "next/link";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { LogoMark } from "@/components/brand/Logo";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-night2">
      {/* Admin top bar (fixed while scrolling) */}
      <div className="sticky top-0 z-40 border-b border-brand-blue/[0.08] bg-brand-blue shadow-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 text-white">
            <LogoMark className="h-7 w-7" inverse />
            <span className="font-display text-sm font-semibold">Victory Martin Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-white/70 hover:text-white">
              View store ↗
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <DashboardNav variant="admin" />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
