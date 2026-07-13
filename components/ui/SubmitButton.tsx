"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

/**
 * A submit button for server-action forms that surfaces progress:
 *  • while the action runs → "Saving…" with a spinner (and disabled)
 *  • right after it completes → "Saved ✓" for ~2s
 * Detects completion by watching useFormStatus.pending fall from true → false.
 */
export function SubmitButton({
  children,
  savingLabel = "Saving…",
  savedLabel = "Saved",
  variant,
  size = "sm",
  className,
}: {
  children: React.ReactNode;
  savingLabel?: string;
  savedLabel?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 2200);
      wasPending.current = pending;
      return () => clearTimeout(t);
    }
    wasPending.current = pending;
  }, [pending]);

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      aria-live="polite"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> {savingLabel}
        </>
      ) : saved ? (
        <>
          <Check className="h-4 w-4" /> {savedLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
