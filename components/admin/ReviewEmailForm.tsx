"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";

/**
 * A collapsible "Email customer" control for the admin reviews list. Expands to
 * a subject + message form that submits via the passed server action.
 */
export function ReviewEmailForm({
  action,
  reviewId,
  to,
  defaultSubject,
}: {
  action: (formData: FormData) => void;
  reviewId: string;
  to: string;
  defaultSubject: string;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/[0.06] px-3 py-1.5 text-xs font-medium text-ink/80 transition-colors hover:bg-brand-blue/[0.12]"
      >
        <Mail className="h-3.5 w-3.5" /> Email customer
      </button>
    );
  }

  return (
    <form action={action} className="mt-2 w-full space-y-2 rounded-xl border border-brand-blue/[0.1] bg-panel p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">
          To: <span className="text-ink/80">{to}</span>
        </p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cancel" className="text-muted hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>
      <input type="hidden" name="reviewId" value={reviewId} />
      <input
        name="subject"
        defaultValue={defaultSubject}
        required
        placeholder="Subject"
        className="w-full rounded-lg border border-brand-blue/12 bg-night px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand-sky"
      />
      <textarea
        name="message"
        required
        rows={3}
        placeholder="Write your message to the customer…"
        className="w-full rounded-lg border border-brand-blue/12 bg-night px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand-sky"
      />
      <SubmitButton size="sm" savedLabel="Sent">
        <Mail className="h-4 w-4" /> Send email
      </SubmitButton>
    </form>
  );
}
