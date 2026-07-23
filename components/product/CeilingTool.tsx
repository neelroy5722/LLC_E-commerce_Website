"use client";

import { useState } from "react";
import { Ruler, ArrowRight, AlertCircle } from "lucide-react";
import {
  recommendHeight,
  toDecimalFeet,
  MIN_VALID_CEILING_FT,
  MAX_VALID_CEILING_FT,
} from "@/lib/ceiling";
import { getHeight } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * Ceiling-Height Recommendation Tool. The customer enters their room's ceiling
 * height (feet + inches) and gets the tallest deck height that still leaves safe
 * sitting headroom. All thresholds live in lib/ceiling.ts.
 */
export function CeilingTool({ className }: { className?: string }) {
  const [feet, setFeet] = useState("8");
  const [inches, setInches] = useState("0");
  const [submitted, setSubmitted] = useState(false);

  const ceilingFt = toDecimalFeet(parseFloat(feet), parseFloat(inches));
  const rec = recommendHeight(ceilingFt);
  const outOfRange = submitted && rec === null;

  return (
    <div className={cn("card p-6 sm:p-8", className)}>
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red-700">
          <Ruler className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">
            Ceiling-Height Tool
          </h3>
          <p className="text-xs text-muted">Find your ideal deck height</p>
        </div>
      </div>

      <form
        className="mt-6 flex items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <NumberField label="Feet" value={feet} onChange={setFeet} min={0} max={20} />
        <NumberField label="Inches" value={inches} onChange={setInches} min={0} max={11} />
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-brand-red px-5 text-sm font-semibold text-brand-blue-900 shadow-glow transition-colors hover:bg-brand-red-600"
        >
          Recommend <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {/* Result */}
      <div className="mt-6">
        {outOfRange ? (
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Enter a ceiling between {MIN_VALID_CEILING_FT} and {MAX_VALID_CEILING_FT} feet
              so we can recommend a safe height.
            </span>
          </div>
        ) : submitted && rec ? (
          <div className="rounded-2xl border border-brand-red/20 bg-brand-red/[0.06] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-red-700">
              Recommended deck height
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="font-display text-3xl font-bold text-ink">{rec.label}</p>
              <span className="text-sm text-muted">
                (~{getHeight(rec.height).deckHeightFt} ft deck)
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">{rec.rationale}</p>
          </div>
        ) : (
          <p className="rounded-xl bg-brand-blue/[0.03] px-4 py-3 text-sm text-muted">
            Enter your ceiling height and we&apos;ll recommend the tallest bed that keeps
            comfortable headroom when you sit up.
          </p>
        )}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="flex-1">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-brand-blue/10 bg-brand-blue/[0.04] px-4 py-2.5 text-sm text-ink transition-colors focus:border-brand-red/50 focus:outline-none focus:ring-2 focus:ring-brand-red/20"
      />
    </label>
  );
}
