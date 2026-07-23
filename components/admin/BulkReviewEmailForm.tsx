"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { SubmitButton } from "@/components/ui/SubmitButton";

const field =
  "w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky";

/** Opens a centered modal to email every customer who has left a review. */
export function BulkReviewEmailForm({
  action,
  count,
}: {
  action: (formData: FormData) => void;
  count: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <Mail className="h-4 w-4" /> Email all reviewers ({count})
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Email all reviewers (${count})`}>
        <p className="mb-4 text-sm text-muted">This message is sent to every customer who has left a review.</p>
        <form action={action} className="space-y-3">
          <input name="subject" required placeholder="Subject" className={field} />
          <textarea name="message" required rows={6} placeholder="Write a message to send to everyone who has reviewed…" className={field} />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-ink">
              Cancel
            </button>
            <SubmitButton size="md" savingLabel="Sending…" savedLabel="Sent to all">
              <Mail className="h-4 w-4" /> Send to all
            </SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
