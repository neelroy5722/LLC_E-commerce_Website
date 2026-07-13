import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "red" | "blue" | "green" | "neutral";

const tones: Record<BadgeTone, string> = {
  red: "bg-brand-red/10 text-brand-red-600 ring-1 ring-inset ring-brand-red/20",
  blue: "bg-brand-blue/[0.08] text-brand-blue-600 ring-1 ring-inset ring-brand-blue/15",
  green: "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  neutral: "bg-brand-blue/[0.06] text-muted ring-1 ring-inset ring-brand-blue/10",
};

/** Small pill label used for eyebrows, statuses, and tags across the site. */
export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
