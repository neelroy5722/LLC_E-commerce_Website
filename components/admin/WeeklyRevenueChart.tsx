import { formatCents } from "@/lib/money";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Revenue comparison chart: this week vs the previous week, by day (Mon–Sun).
 * Pure presentational SVG — values are integer cents per day.
 */
export function WeeklyRevenueChart({ thisWeek, lastWeek }: { thisWeek: number[]; lastWeek: number[] }) {
  const W = 720;
  const H = 260;
  const padL = 56;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const max = Math.max(1, ...thisWeek, ...lastWeek);
  const x = (i: number) => padL + (chartW * i) / (DAYS.length - 1);
  const y = (v: number) => padT + chartH * (1 - v / max);

  const line = (data: number[]) => data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = (data: number[]) => `${padL},${padT + chartH} ${line(data)} ${padL + chartW},${padT + chartH}`;

  // Four horizontal gridlines with dollar labels.
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ f, v: max * f, yy: padT + chartH * (1 - f) }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Revenue: this week vs last week">
      <defs>
        <linearGradient id="wk-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E85A4F" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#E85A4F" stopOpacity="0" />
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

      {/* Last week — dashed slate line */}
      <polyline points={line(lastWeek)} fill="none" stroke="#7E8A99" strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" />

      {/* This week — filled red line */}
      <polygon points={area(thisWeek)} fill="url(#wk-fill)" />
      <polyline points={line(thisWeek)} fill="none" stroke="#E85A4F" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {thisWeek.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="#E85A4F" />
      ))}

      {DAYS.map((d, i) => (
        <text key={d} x={x(i)} y={H - 8} textAnchor="middle" className="fill-current text-[10px] text-muted">
          {d}
        </text>
      ))}
    </svg>
  );
}

/** Small legend + totals row shown above the chart. */
export function WeeklyRevenueLegend({ thisTotal, lastTotal }: { thisTotal: number; lastTotal: number }) {
  const delta = lastTotal > 0 ? Math.round(((thisTotal - lastTotal) / lastTotal) * 100) : null;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <span className="inline-flex items-center gap-2">
        <span className="h-2.5 w-4 rounded-full bg-brand-red" />
        <span className="text-muted">This week</span>
        <span className="font-semibold text-ink">{formatCents(thisTotal)}</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-0.5 w-4 rounded-full border-t-2 border-dashed border-[#7E8A99]" />
        <span className="text-muted">Last week</span>
        <span className="font-semibold text-ink">{formatCents(lastTotal)}</span>
      </span>
      {delta !== null && (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${delta >= 0 ? "bg-emerald-400/15 text-emerald-700" : "bg-brand-red/15 text-brand-red-700"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last week
        </span>
      )}
    </div>
  );
}
