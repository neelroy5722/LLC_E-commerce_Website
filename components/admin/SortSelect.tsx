"use client";

import { ArrowUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** URL-driven sort dropdown for server-rendered admin lists (?sort=…). */
export function SortSelect({
  options,
  paramKey = "sort",
  defaultValue,
}: {
  options: { value: string; label: string }[];
  paramKey?: string;
  defaultValue: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get(paramKey) ?? defaultValue;

  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink">
      <ArrowUpDown className="h-3.5 w-3.5 text-muted" />
      <span className="text-muted">Sort</span>
      <select
        value={current}
        onChange={(e) => {
          const p = new URLSearchParams(Array.from(sp.entries()));
          p.set(paramKey, e.target.value);
          router.push(`${pathname}?${p.toString()}`);
        }}
        className="bg-transparent text-ink outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-panel">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
