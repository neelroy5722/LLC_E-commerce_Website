import { DashboardNav } from "@/components/layout/DashboardNav";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/account");

  return (
    <div className="bg-night2">
      <div className="container py-10 lg:py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">My Account</h1>
            <p className="text-sm text-muted">Welcome back, {user.name?.split(" ")[0] ?? "there"}.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <DashboardNav variant="account" />
          </aside>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
