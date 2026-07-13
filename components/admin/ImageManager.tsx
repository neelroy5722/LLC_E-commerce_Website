"use client";

import { useMemo, useState } from "react";
import { Upload, RotateCcw, Loader2 } from "lucide-react";

export interface ImageCell {
  sizeKey: string;
  heightKey: string;
  woodKey: string;
  sizeLabel: string;
  heightLabel: string;
  woodLabel: string;
  url: string;
  isOverride: boolean;
}

export function ImageManager({ cells }: { cells: ImageCell[] }) {
  const [state, setState] = useState(cells);
  const [busy, setBusy] = useState<string | null>(null);

  const groups = useMemo(() => {
    const bySize: Record<string, ImageCell[]> = {};
    for (const c of state) (bySize[c.sizeLabel] ??= []).push(c);
    return bySize;
  }, [state]);

  const keyOf = (c: ImageCell) => `${c.sizeKey}-${c.heightKey}-${c.woodKey}`;

  async function upload(c: ImageCell, file: File) {
    const k = keyOf(c);
    setBusy(k);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("sizeKey", c.sizeKey);
    fd.append("heightKey", c.heightKey);
    fd.append("woodKey", c.woodKey);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (res.ok && data.url) {
      setState((s) => s.map((x) => (keyOf(x) === k ? { ...x, url: `${data.url}?t=${Date.now()}`, isOverride: true } : x)));
    }
  }

  async function reset(c: ImageCell) {
    const k = keyOf(c);
    setBusy(k);
    const fd = new FormData();
    fd.append("reset", "1");
    fd.append("sizeKey", c.sizeKey);
    fd.append("heightKey", c.heightKey);
    fd.append("woodKey", c.woodKey);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (res.ok && data.url) {
      setState((s) => s.map((x) => (keyOf(x) === k ? { ...x, url: data.url, isOverride: false } : x)));
    }
  }

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([sizeLabel, group]) => (
        <div key={sizeLabel}>
          <h3 className="mb-3 text-sm font-semibold text-ink">{sizeLabel}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {group.map((c) => {
              const k = keyOf(c);
              return (
                <div key={k} className="overflow-hidden rounded-xl border border-brand-blue/[0.08] bg-panel">
                  <div className="relative aspect-[560/460] bg-night">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.url} alt={`${c.heightLabel} ${c.woodLabel}`} className="h-full w-full object-contain" />
                    {busy === k && (
                      <div className="absolute inset-0 flex items-center justify-center bg-night/60">
                        <Loader2 className="h-5 w-5 animate-spin text-ink" />
                      </div>
                    )}
                    {c.isOverride && (
                      <span className="absolute left-2 top-2 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-xs font-medium text-ink">{c.heightLabel} · {c.woodLabel}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-brand-blue/12 px-2 py-1 text-[11px] text-ink/80 hover:border-brand-sky/50">
                        <Upload className="h-3 w-3" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) upload(c, f);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      {c.isOverride && (
                        <button
                          type="button"
                          onClick={() => reset(c)}
                          className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-brand-red-600"
                        >
                          <RotateCcw className="h-3 w-3" /> Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
