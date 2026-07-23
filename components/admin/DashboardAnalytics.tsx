"use client";

import { useState } from "react";
import { formatCents } from "@/lib/money";

export interface PeriodData {
  labels: string[];
  current: number[]; // cents per bucket
  previous: number[];
  currentTotal: number;
  previousTotal: number;
  products: { label: string; units: number; pct: number }[];
}

export interface Periods {
  week: PeriodData;
  month: PeriodData;
  year: PeriodData;
}

type Key = "week" | "month" | "year";
const OPTIONS: { key: Key; label: string; cur: string; prev: string }[] = [
  { key: "week", label: "Week", cur: "This week", prev: "Last week" },
  { key: "month", label: "Month", cur: "This month", prev: "Last month" },
  { key: "year", label: "Year", cur: "This year", prev: "Last year" },
];

/** Catmull-Rom → cubic-bezier smooth path through the given points. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x},${pts[0].y}` : "";
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export function DashboardAnalytics({ periods }: { periods: Periods }) {
  const [key, setKey] = useState<Key>("week");
  const opt = OPTIONS.find((o) => o.key === key)!;
  const d = periods[key];

  const W = 720;
  const H = 280;
  const padL = 52;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = d.labels.length;
  const max = Math.max(1, ...d.current, ...d.previous);
  const x = (i: number) => padL + (n <= 1 ? chartW / 2 : (chartW * i) / (n - 1));
  const y = (v: number) => padT + chartH * (1 - v / max);
  const pts = (arr: number[]) => arr.map((v, i) => ({ x: x(i), y: y(v) }));
  const areaFrom = (path: string) => `${path} L ${x(n - 1)},${padT + chartH} L ${x(0)},${padT + chartH} Z`;

  const curPath = smoothPath(pts(d.current));
  const prevPath = smoothPath(pts(d.previous));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ f, v: max * f, yy: padT + chartH * (1 - f) }));
  const delta = d.previousTotal > 0 ? Math.round(((d.currentTotal - d.previousTotal) / d.previousTotal) * 100) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {/* Chart */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-full bg-brand-red" />
              <span className="text-muted">{opt.cur}</span>
              <span className="font-semibold text-ink">{formatCents(d.currentTotal)}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-4 rounded-full bg-brand-sky" />
              <span className="text-muted">{opt.prev}</span>
              <span className="font-semibold text-ink">{formatCents(d.previousTotal)}</span>
            </span>
            {delta !== null && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${delta >= 0 ? "bg-emerald-400/15 text-emerald-700" : "bg-brand-red/15 text-brand-red-700"}`}>
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
              </span>
            )}
          </div>

          {/* Week / Month / Year dropdown */}
          <select
            value={key}
            onChange={(e) => setKey(e.target.value as Key)}
            className="rounded-lg border border-brand-blue/12 bg-panel px-3 py-1.5 text-sm font-medium text-ink outline-none focus:border-brand-sky"
          >
            {OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Revenue ${opt.cur} vs ${opt.prev}`}>
            <defs>
              <linearGradient id="cur-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E85A4F" stopOpacity="0.20" />
                <stop offset="100%" stopColor="#E85A4F" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="prev-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6E9CC4" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#6E9CC4" stopOpacity="0" />
              </linearGradient>
            </defs>

            {ticks.map((t) => (
              <g key={t.f}>
                <line x1={padL} y1={t.yy} x2={W - padR} y2={t.yy} stroke="#1B3454" strokeOpacity="0.08" />
                <text x={padL - 8} y={t.yy + 3} textAnchor="end" className="fill-current text-[10px] text-muted">
                  ${Math.round(t.v / 100)}
                </text>
              </g>
            ))}

            <path d={areaFrom(prevPath)} fill="url(#prev-fill)" />
            <path d={prevPath} fill="none" stroke="#6E9CC4" strokeWidth="2.5" strokeLinecap="round" />
            <path d={areaFrom(curPath)} fill="url(#cur-fill)" />
            <path d={curPath} fill="none" stroke="#E85A4F" strokeWidth="2.5" strokeLinecap="round" />

            {d.labels.map((lab, i) => (
              <text key={`${lab}-${i}`} x={x(i)} y={H - 8} textAnchor="middle" className="fill-current text-[10px] text-muted">
                {lab}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Product breakdown for the selected period */}
      <div className="card flex flex-col overflow-hidden">
        <div className="border-b border-brand-blue/[0.08] px-5 py-4">
          <h2 className="font-sans text-base font-bold text-ink">Products sold</h2>
          <p className="text-xs text-muted">By size · {opt.label.toLowerCase()} to date</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-blue/[0.08] text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-2.5 font-medium">Product</th>
                <th className="px-5 py-2.5 text-right font-medium">Amount</th>
                <th className="px-5 py-2.5 text-right font-medium">Percent</th>
              </tr>
            </thead>
            <tbody>
              {d.products.every((p) => p.units === 0) ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-muted">No sales in this period.</td></tr>
              ) : (
                d.products.map((p) => (
                  <tr key={p.label} className="border-b border-brand-blue/[0.06] last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{p.label}</td>
                    <td className="px-5 py-3 text-right text-ink">{p.units}</td>
                    <td className="px-5 py-3 text-right text-muted">{p.pct}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
