"use client";

import { useEffect } from "react";
import { X, type LucideIcon } from "lucide-react";

/** Centered, dismissible modal dialog (overlay + Escape/backdrop close). */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-brand-blue-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-fade-up relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-brand-blue/10 bg-white shadow-lift">
        {/* Accent header */}
        <div className="flex items-start justify-between gap-3 border-b border-brand-blue/[0.08] bg-gradient-to-br from-brand-blue-600 to-brand-blue px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Icon className="h-5 w-5" />
              </span>
            )}
            <div>
              <h2 className="font-sans text-lg font-bold leading-tight">{title}</h2>
              {subtitle && <p className="mt-0.5 text-sm text-white/70">{subtitle}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
