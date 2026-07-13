"use client";

import { useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

/**
 * The living mascot — shows the real bald-eagle photo from /public/eagle.jpg.
 * Until that file is present it gracefully falls back to the vector eagle mark,
 * so the layout is never broken.
 */
export function MascotEagle({ className }: { className?: string }) {
  const [ok, setOk] = useState(true);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-blue to-night shadow-lift",
        className
      )}
    >
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/eagle.jpg"
          alt="Victory Martin mascot — a bald eagle in flight"
          onError={() => setOk(false)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-10 text-center">
          <LogoMark inverse className="h-24 w-24" />
          <p className="text-sm text-white/60">The landing eagle — our mascot.</p>
        </div>
      )}
    </div>
  );
}
