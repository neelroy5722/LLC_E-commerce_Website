"use client";

import { useState } from "react";
import { formatCents } from "@/lib/money";

export interface SizeMeta {
  key: string;
  label: string;
  color: string;
}
export interface WeekBucket {
  label: string;
  revenue: number;
  units: number;
}
export interface MonthBucket {
  key: string;
  label: string;
  bySize: Record<string, { revenue: number; units: number }>;
  total: number;
  units: number;
  weeks: WeekBucket[];
}

const CHART_H = 220; // px plot height

/** Lighten a hex color by pct% toward white (for the bar gradient top). */
function shade(hex: string, pct: number): string {
  const h = hex.replace("#", "").padStart(6, "0");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const to = (c: number) => Math.round(c + (255 - c) * (pct / 100)).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function ReportsChart({
  months,
  sizes,
  maxMonth,
}: {
  months: MonthBucket[];
  sizes: SizeMeta[];
  maxMonth: number;
}) {
  // Default to the most recent month that has any sales, else the last month.
  const lastWithData = [...months].reverse().find((m) => m.total > 0);
  const [selected, setSelected] = useState<string>(
    lastWithData?.key ?? months[months.length - 1]?.key ?? ""
  );
  const sel = months.find((m) => m.key === selected) ?? null;

  // Gridlines at 0/25/50/75/100% of the max.
  const grid = [1, 0.75, 0.5, 0.25, 0].map((f) => ({ f, value: Math.round(maxMonth * f) }));
  const maxWeek = Math.max(1, ...(sel?.weeks.map((w) => w.revenue) ?? [1]));

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Revenue by size — last 12 months</h2>
          <p className="text-xs text-muted">Click a month to see its weekly breakdown.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {sizes.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-muted">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Monthly stacked chart with gridlines */}
      <div className="mt-8 flex gap-3">
        {/* Y axis */}
        <div className="relative w-14 shrink-0" style={{ height: CHART_H }}>
          {grid.map((g) => (
            <span
              key={g.f}
              className="absolute right-0 -translate-y-1/2 text-[10px] tabular-nums text-muted"
              style={{ top: `${(1 - g.f) * 100}%` }}
            >
              ${Math.round(g.value / 100).toLocaleString()}
            </span>
          ))}
        </div>
        {/* Plot */}
        <div className="relative flex-1">
          {/* gridlines */}
          <div className="pointer-events-none absolute inset-0" style={{ height: CHART_H }}>
            {grid.map((g) => (
              <div
                key={g.f}
                className="absolute inset-x-0 border-t border-dashed border-brand-blue/[0.07]"
                style={{ top: `${(1 - g.f) * 100}%` }}
              />
            ))}
          </div>
          <div className="relative flex items-end gap-1 sm:gap-1.5" style={{ height: CHART_H }}>
            {months.map((m) => {
              const active = m.key === selected;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelected(m.key)}
                  aria-pressed={active}
                  className="group relative flex h-full flex-1 items-end justify-center"
                  title={`${m.label}: ${formatCents(m.total)} · ${m.units} units — click for weeks`}
                >
                  {active && <span className="absolute inset-x-0 bottom-0 top-0 rounded-md bg-brand-blue/[0.05]" aria-hidden />}
                  {m.total > 0 ? (
                    <div
                      className={`relative flex w-full max-w-[30px] flex-col overflow-hidden rounded-t-[5px] shadow-sm ring-1 transition-all duration-200 ${
                        active
                          ? "-translate-y-0.5 ring-brand-blue/50 brightness-110"
                          : "ring-brand-blue/[0.06] group-hover:-translate-y-0.5 group-hover:brightness-110"
                      }`}
                    >
                      {sizes.map((s) => {
                        const rev = m.bySize[s.key]?.revenue ?? 0;
                        if (rev <= 0) return null;
                        const h = Math.max(3, Math.round((rev / maxMonth) * CHART_H));
                        return (
                          <div
                            key={s.key}
                            style={{
                              height: `${h}px`,
                              backgroundImage: `linear-gradient(180deg, ${shade(s.color, 22)}, ${s.color})`,
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-1 w-full max-w-[30px] rounded-full bg-brand-blue/[0.06]" />
                  )}
                </button>
              );
            })}
          </div>
          {/* month labels */}
          <div className="mt-2 flex gap-1 sm:gap-1.5">
            {months.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelected(m.key)}
                className={`flex-1 text-center text-[10px] font-medium leading-tight transition-colors ${
                  m.key === selected ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly drill-down */}
      {sel && (
        <div className="mt-8 rounded-2xl border border-brand-blue/[0.08] bg-night/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-sm font-bold text-ink">
              Weekly breakdown — {sel.label}
            </h3>
            <span className="text-xs text-muted">
              {formatCents(sel.total)} · {sel.units} units this month
            </span>
          </div>
          {sel.total > 0 ? (
            <div className="mt-6 flex items-end gap-3 sm:gap-5" style={{ height: 140 }}>
              {sel.weeks.map((w) => {
                const h = w.revenue > 0 ? Math.max(4, Math.round((w.revenue / maxWeek) * 140)) : 0;
                return (
                  <div key={w.label} className="flex flex-1 flex-col items-center justify-end gap-2" style={{ height: "100%" }}>
                    <span className="text-[11px] font-medium text-ink/70">{w.units || ""}</span>
                    <div
                      className="w-full max-w-[54px] rounded-t-md bg-gradient-to-t from-brand-sky/70 to-brand-sky transition-all"
                      style={{ height: `${h}px` }}
                      title={`${w.label}: ${formatCents(w.revenue)} · ${w.units} units`}
                    />
                    <span className="text-xs text-muted">{w.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">No sales in {sel.label}.</p>
          )}
          <p className="mt-4 text-[11px] text-muted">Bar height = weekly revenue · number above = units sold that week.</p>
        </div>
      )}
    </div>
  );
}
