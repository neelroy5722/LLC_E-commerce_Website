import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The Victory Martin mark: an eagle with raised wings that together form a
 * "V for Victory", its head turned to the right as it lands left-to-right.
 * Drawn on a 48×48 grid so it stays crisp from favicon to hero size.
 * `inverse` renders the mono-white treatment for dark backgrounds.
 */
export function LogoMark({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  const leftWing = inverse ? "#FFFFFF" : "#D9506E";
  const rightWing = inverse ? "#FFFFFF" : "#EB6A85";
  const head = inverse ? "#FFFFFF" : "#2F5987";
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Victory Martin eagle mark"
      className={cn("block", className)}
    >
      {/* Trailing (left) wing — raised, lifting up and back */}
      <path d="M24 30 C 18 25 11 20 4 8 C 7 17 12 24 22 31 Z" fill={leftWing} />
      {/* Leading (right) wing — raised, sweeping up and forward */}
      <path d="M24 30 C 30 25 37 20 44 8 C 41 17 36 24 26 31 Z" fill={rightWing} />
      {/* Head, turned to the right, with a short beak */}
      <circle cx="24" cy="24" r="2.6" fill={head} />
      <path d="M26 22.5 L 30 23.4 L 26 25.4 Z" fill={head} />
    </svg>
  );
}

/** Horizontal lockup for headers and footers: mark + wordmark. */
export function Logo({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-9" inverse={inverse} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-xl font-extrabold tracking-[0.02em]",
            inverse ? "text-white" : "text-brand-blue-700",
          )}
        >
          APT<span className="text-brand-red">.</span>BED
        </span>
        <span
          className={cn(
            "mt-1.5 font-display text-[0.74rem] font-bold italic tracking-[0.06em]",
            inverse ? "text-[#E0A876]" : "text-[#96602F]",
          )}
        >
          by Victory Martin
        </span>
      </span>
    </span>
  );
}

/** Clickable lockup used in the site header. */
export function LogoLink({ inverse }: { inverse?: boolean }) {
  return (
    <Link href="/" aria-label="Apt.Bed by Victory Martin — home">
      <Logo inverse={inverse} />
    </Link>
  );
}

/** Framed "APT.BED" stamp for hero moments. */
export function LogoStamp({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <div
      className={cn(
        "flex w-64 flex-col items-center rounded-2xl border px-8 py-8 text-center shadow-soft",
        light ? "border-brand-blue/15 bg-white" : "border-white/15 bg-brand-blue",
      )}
    >
      <LogoMark className="h-16 w-16" inverse={!light} />
      <p
        className={cn(
          "mt-5 font-display text-[1.7rem] font-bold tracking-[0.08em]",
          light ? "text-brand-blue-700" : "text-white",
        )}
      >
        APT<span className="text-brand-red">.</span>BED
      </p>
      <span className={cn("mt-2.5 h-px w-14", light ? "bg-brand-blue/15" : "bg-white/20")} />
      <p
        className={cn(
          "mt-2.5 font-display text-[0.82rem] font-bold italic tracking-[0.06em]",
          light ? "text-[#96602F]" : "text-[#E0A876]",
        )}
      >
        by Victory Martin
      </p>
    </div>
  );
}
