import { LogoMark } from "@/components/brand/Logo";

/**
 * Split-screen shell for the admin auth pages: a branded panel on the left and
 * the form on the right. Swap the left panel's background for a specific image
 * by setting a backgroundImage on the aside if desired.
 */
export function AdminAuthShell({
  heading,
  sub,
  children,
}: {
  heading: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-night2">
      {/* Left — branded panel */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-blue-600 via-brand-blue to-brand-blue-900 p-12 text-white lg:flex">
        {/* Decorative grid + glows */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-sky/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2">
          <LogoMark className="h-8 w-8" inverse />
          <span className="font-sans font-semibold tracking-wide">VICTORY MARTIN</span>
        </div>
        <div className="relative z-10 mx-auto flex max-w-md flex-col items-center text-center">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-white/70">{sub}</p>
          <h1 className="mt-3 font-sans text-5xl font-black leading-[1.05]">{heading}</h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
            Manage the Apt.Bed store — orders, catalogue, reviews, and analytics — all in one place.
          </p>
        </div>
        <div className="relative z-10 text-xs text-white/50">apartmentloftbed.com · Admin</div>
      </aside>

      {/* Right — form */}
      <main className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
