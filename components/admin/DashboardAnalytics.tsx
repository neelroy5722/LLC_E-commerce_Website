"use client";

import { useMemo, useRef, useState } from "react";
import {
  DollarSign, CalendarRange, ShoppingBag, Clock, Crown,
  TrendingUp, Timer, CheckCircle2, Users, Repeat,
  type LucideIcon,
} from "lucide-react";
import { formatCents } from "@/lib/money";

const DAY = 86_400_000;

export interface DashboardData {
  nowMs: number;
  todayISO: string;
  defaultStartISO: string;
  orders: { t: number; total: number; userId: string | null; items: { sizeKey: string; quantity: number }[] }[];
  deliveries: { placedT: number; deliveredT: number }[];
  sizes: { key: string; label: string }[];
  fixed: {
    todayRevenue: number;
    monthRevenue: number;
    todayOrders: number;
    activeOrders: number;
    totalUsers: number;
  };
}

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseLocal(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}
function toISO(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function shortDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
function monthLabel(ms: number): string {
  const d = new Date(ms);
  return `${MON[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

interface Bucket {
  start: number;
  end: number;
  label: string;
}

function makeBuckets(startMs: number, endExcl: number): Bucket[] {
  const days = Math.max(1, Math.round((endExcl - startMs) / DAY));
  const out: Bucket[] = [];
  if (days <= 31) {
    for (let t = startMs; t < endExcl; t += DAY) out.push({ start: t, end: t + DAY, label: shortDate(t) });
  } else if (days <= 182) {
    for (let t = startMs; t < endExcl; t += 7 * DAY)
      out.push({ start: t, end: Math.min(t + 7 * DAY, endExcl), label: shortDate(t) });
  } else {
    const s = new Date(startMs);
    let cur = new Date(s.getFullYear(), s.getMonth(), 1).getTime();
    while (cur < endExcl) {
      const d = new Date(cur);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
      out.push({ start: cur, end: next, label: monthLabel(cur) });
      cur = next;
    }
  }
  return out;
}

// Chart geometry
const W = 760;
const H = 280;
const padL = 52;
const padR = 16;
const padT = 16;
const padB = 30;
const chartW = W - padL - padR;
const chartH = H - padT - padB;
const CHART_BOTTOM = padT + chartH;

/** Smooth spline with control points clamped to the plot area so the line
 *  never overshoots below the zero baseline or above the top. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x},${pts[0].y}` : "";
  const clampY = (v: number) => Math.max(padT, Math.min(CHART_BOTTOM, v));
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = clampY(p1.y + (p2.y - p0.y) / 6);
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = clampY(p2.y - (p3.y - p1.y) / 6);
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

const TONES: Record<string, string> = {
  red: "bg-brand-red/15 text-brand-red-700",
  blue: "bg-brand-sky/15 text-brand-sky",
  green: "bg-emerald-400/15 text-emerald-700",
};

interface Kpi { icon: LucideIcon; label: string; value: string; tone: string }

function KpiGrid({ items }: { items: Kpi[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
      {items.map((k) => {
        const Icon = k.icon;
        return (
          <div key={k.label} className="card p-5">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${TONES[k.tone]}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">{k.label}</p>
            <p className="mt-0.5 font-sans text-xl font-semibold tracking-tight text-ink">{k.value}</p>
          </div>
        );
      })}
    </div>
  );
}

const PRESETS: { label: string; days: number }[] = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
];

export function DashboardAnalytics({ data }: { data: DashboardData }) {
  const [startISO, setStartISO] = useState(data.defaultStartISO);
  const [endISO, setEndISO] = useState(data.todayISO);
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const startMs = parseLocal(startISO);
  const endExcl = parseLocal(endISO) + DAY; // inclusive of the end day

  const setPreset = (days: number) => {
    const end = parseLocal(data.todayISO);
    setStartISO(toISO(end - (days - 1) * DAY));
    setEndISO(data.todayISO);
    setHover(null);
  };

  const view = useMemo(() => {
    const lo = Math.min(startMs, endExcl - DAY);
    const hi = Math.max(endExcl, lo + DAY);
    const inRange = data.orders.filter((o) => o.t >= lo && o.t < hi);

    // Revenue series over adaptive buckets.
    const buckets = makeBuckets(lo, hi);
    const series = buckets.map((b) => {
      let v = 0;
      for (const o of inRange) if (o.t >= b.start && o.t < b.end) v += o.total;
      return v;
    });

    const rangeRevenue = inRange.reduce((a, o) => a + o.total, 0);
    const rangeOrders = inRange.length;
    const avgOrderValue = rangeOrders ? Math.round(rangeRevenue / rangeOrders) : 0;

    // Best-selling size within range.
    const units = new Map<string, number>();
    for (const o of inRange) for (const it of o.items) units.set(it.sizeKey, (units.get(it.sizeKey) ?? 0) + it.quantity);
    const totalUnits = Array.from(units.values()).reduce((a, b) => a + b, 0);
    const products = data.sizes
      .map((s) => {
        const u = units.get(s.key) ?? 0;
        return { label: s.label, units: u, pct: totalUnits ? Math.round((u / totalUnits) * 100) : 0 };
      });
    let bestSeller = "—";
    let bestUnits = 0;
    for (const p of products) if (p.units > bestUnits) { bestUnits = p.units; bestSeller = p.label; }

    // Returning-customer rate within range.
    const byCustomer = new Map<string, number>();
    for (const o of inRange) if (o.userId) byCustomer.set(o.userId, (byCustomer.get(o.userId) ?? 0) + 1);
    const customers = byCustomer.size;
    const returning = Array.from(byCustomer.values()).filter((c) => c >= 2).length;
    const returningRate = customers ? Math.round((returning / customers) * 100) : 0;

    // Processing time + completed orders for orders placed in range.
    const placed = data.deliveries.filter((dv) => dv.placedT >= lo && dv.placedT < hi);
    const procDays = placed.length
      ? `${(placed.reduce((a, dv) => a + (dv.deliveredT - dv.placedT) / DAY, 0) / placed.length).toFixed(1)} days`
      : "—";

    return {
      buckets, series, rangeRevenue, rangeOrders, avgOrderValue,
      bestSeller, products, returningRate,
      processingDays: procDays, completedOrders: placed.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startMs, endExcl, data]);

  const n = view.series.length;
  const max = Math.max(1, ...view.series);
  const x = (i: number) => padL + (n <= 1 ? chartW / 2 : (chartW * i) / (n - 1));
  const y = (v: number) => padT + chartH * (1 - v / max);
  const pts = view.series.map((v, i) => ({ x: x(i), y: y(v) }));
  const linePath = smoothPath(pts);
  const areaPath = pts.length ? `${linePath} L ${x(n - 1)},${CHART_BOTTOM} L ${x(0)},${CHART_BOTTOM} Z` : "";
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ f, v: max * f, yy: padT + chartH * (1 - f) }));
  const labelStep = Math.max(1, Math.ceil(n / 10));

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || n < 1) return;
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round((svgX - padL) / (chartW / Math.max(1, n - 1)));
    setHover(i >= 0 && i < n ? i : null);
  };

  const topKpis: Kpi[] = [
    { icon: DollarSign, label: "Today's revenue", value: formatCents(data.fixed.todayRevenue), tone: "red" },
    { icon: CalendarRange, label: "This month's revenue", value: formatCents(data.fixed.monthRevenue), tone: "red" },
    { icon: ShoppingBag, label: "Today's orders", value: String(data.fixed.todayOrders), tone: "blue" },
    { icon: Clock, label: "Active orders", value: String(data.fixed.activeOrders), tone: "blue" },
    { icon: Crown, label: "Best-selling product", value: view.bestSeller, tone: "red" },
  ];
  const bottomKpis: Kpi[] = [
    { icon: TrendingUp, label: "Avg order value", value: formatCents(view.avgOrderValue), tone: "blue" },
    { icon: Timer, label: "Processing time", value: view.processingDays, tone: "blue" },
    { icon: CheckCircle2, label: "Completed orders", value: String(view.completedOrders), tone: "green" },
    { icon: Users, label: "Total users", value: String(data.fixed.totalUsers), tone: "blue" },
    { icon: Repeat, label: "Returning rate", value: `${view.returningRate}%`, tone: "green" },
  ];

  return (
    <div className="space-y-6">
      {/* Header + date-range selector */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted">Store analytics for the selected date range.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-brand-blue/12 bg-white shadow-sm">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPreset(p.days)}
                className="px-3 py-2 text-xs font-semibold text-muted transition hover:bg-brand-sky/10 hover:text-ink"
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={startISO}
            max={endISO}
            onChange={(e) => { setStartISO(e.target.value); setHover(null); }}
            className="rounded-lg border border-brand-blue/12 bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm outline-none focus:border-brand-sky"
          />
          <span className="text-sm text-muted">to</span>
          <input
            type="date"
            value={endISO}
            min={startISO}
            max={data.todayISO}
            onChange={(e) => { setEndISO(e.target.value); setHover(null); }}
            className="rounded-lg border border-brand-blue/12 bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm outline-none focus:border-brand-sky"
          />
        </div>
      </div>

      {/* Five cards above the graph */}
      <KpiGrid items={topKpis} />

      {/* Chart + product breakdown */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Revenue · selected range</p>
              <p className="font-sans text-2xl font-semibold tracking-tight text-ink">{formatCents(view.rangeRevenue)}</p>
            </div>
            <p className="text-sm text-muted">
              {view.rangeOrders} order{view.rangeOrders === 1 ? "" : "s"}
            </p>
          </div>

          <div className="relative mt-4">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              role="img"
              aria-label="Revenue over the selected date range"
              onMouseMove={onMove}
              onMouseLeave={() => setHover(null)}
            >
              <defs>
                <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E85A4F" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#E85A4F" stopOpacity="0" />
                </linearGradient>
              </defs>

              {ticks.map((t) => (
                <g key={`h-${t.f}`}>
                  <line x1={padL} y1={t.yy} x2={W - padR} y2={t.yy} stroke="#1B3454" strokeOpacity="0.12" />
                  <text x={padL - 8} y={t.yy + 3} textAnchor="end" className="fill-current text-[10px] text-muted">
                    ${Math.round(t.v / 100)}
                  </text>
                </g>
              ))}

              {pts.length > 0 && (
                <>
                  <path d={areaPath} fill="url(#rev-fill)" />
                  <path d={linePath} fill="none" stroke="#E85A4F" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}

              {hover !== null && (
                <g>
                  <line x1={x(hover)} y1={padT} x2={x(hover)} y2={CHART_BOTTOM} stroke="#1B3454" strokeOpacity="0.25" />
                  <circle cx={x(hover)} cy={y(view.series[hover])} r="3.5" fill="#E85A4F" stroke="#fff" strokeWidth="1.5" />
                </g>
              )}

              {view.buckets.map((b, i) =>
                i % labelStep === 0 ? (
                  <text key={`${b.label}-${i}`} x={x(i)} y={H - 8} textAnchor="middle" className="fill-current text-[10px] text-muted">
                    {b.label}
                  </text>
                ) : null
              )}
            </svg>

            {hover !== null && (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-lg bg-brand-blue-900 px-2.5 py-1.5 text-xs text-white shadow-lift"
                style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(view.series[hover]) / H) * 100}%` }}
              >
                <div className="mb-0.5 font-semibold">{view.buckets[hover].label}</div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-red" />{formatCents(view.series[hover])}</div>
              </div>
            )}
          </div>
        </div>

        <div className="card flex flex-col overflow-hidden">
          <div className="border-b border-brand-blue/[0.08] px-5 py-4">
            <h2 className="font-sans text-base font-semibold tracking-tight text-ink">Products sold</h2>
            <p className="text-xs text-muted">By size · selected range</p>
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
                {view.products.every((p) => p.units === 0) ? (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-muted">No sales in this range.</td></tr>
                ) : (
                  view.products.map((p) => (
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

      {/* Five cards below the graph */}
      <KpiGrid items={bottomKpis} />
    </div>
  );
}
