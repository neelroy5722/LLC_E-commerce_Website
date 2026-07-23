import { Check } from "lucide-react";
import { ORDER_STATUSES } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Colour ramp across the five-step lifecycle: early → delivered. */
const STEP_TONES = [
  "bg-amber-500/10 text-amber-700 ring-amber-600/20",
  "bg-brand-red/10 text-brand-red-600 ring-brand-red/20",
  "bg-brand-blue/[0.08] text-brand-blue-600 ring-brand-blue/20",
  "bg-blue-500/10 text-blue-700 ring-blue-600/20",
  "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20",
];

function safeIndex(statusIndex: number): number {
  return Math.max(0, Math.min(statusIndex, ORDER_STATUSES.length - 1));
}

/** Compact pill showing where a single order sits in the lifecycle. */
export function StatusBadge({ statusIndex }: { statusIndex: number }) {
  const i = safeIndex(statusIndex);
  const status = ORDER_STATUSES[i];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        STEP_TONES[i],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.label}
    </span>
  );
}

/** Full stepper visualising every lifecycle stage with the current one marked. */
export function StatusTimeline({ statusIndex }: { statusIndex: number }) {
  const current = safeIndex(statusIndex);

  return (
    <ol className="relative space-y-6 sm:flex sm:space-y-0">
      {ORDER_STATUSES.map((status, i) => {
        const done = i < current;
        const active = i === current;
        const isLast = i === ORDER_STATUSES.length - 1;
        return (
          <li key={status.id} className="relative flex gap-4 sm:flex-1 sm:flex-col sm:gap-0">
            {/* Connector */}
            {!isLast ? (
              <span
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%+0.5rem)] w-0.5 sm:left-auto sm:top-[15px] sm:h-0.5 sm:w-full sm:translate-x-4",
                  done ? "bg-brand-red" : "bg-brand-blue/15",
                )}
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-panel",
                done && "bg-brand-red text-brand-blue-900",
                active && "bg-brand-red text-brand-blue-900 shadow-glow",
                !done && !active && "bg-panel2 text-muted ring-panel",
              )}
            >
              {done ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-current" />
              )}
            </span>

            <div className="sm:mt-3 sm:pr-4">
              <p
                className={cn(
                  "text-sm font-semibold",
                  active || done ? "text-ink" : "text-muted",
                )}
              >
                {status.label}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{status.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
