"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";

/**
 * "Email all reviewers" — expands to a subject + message form that the admin
 * can send to every customer who has left a review (submitted via the action).
 */
export function BulkReviewEmailForm({
  action,
  count,
}: {
  action: (formData: FormData) => void;
  count: number;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <Mail className="h-4 w-4" /> Email all reviewers ({count})
      </button>
    );
  }

  return (
    <form action={action} className="card w-full space-y-3 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-base font-bold text-ink">Email all reviewers ({count})</h2>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cancel" className="text-muted hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>
      <input
        name="subject"
        required
        placeholder="Subject"
        className="w-full rounded-lg border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-brand-sky"
      />
      <textarea
        name="message"
        required
        rows={4}
        placeholder="Write a message to send to everyone who has reviewed…"
        className="w-full rounded-lg border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-brand-sky"
      />
      <SubmitButton savingLabel="Sending…" savedLabel="Sent to all">
        <Mail className="h-4 w-4" /> Send to all reviewers
      </SubmitButton>
    </form>
  );
}
