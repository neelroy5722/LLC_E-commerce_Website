"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/** Centered, dismissible modal dialog (overlay + Escape/backdrop close). */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
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
      <div className="absolute inset-0 bg-brand-blue-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-fade-up relative z-10 w-full max-w-lg rounded-2xl border border-brand-blue/10 bg-white p-6 shadow-lift">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-sans text-lg font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-muted transition-colors hover:bg-brand-blue/5 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
