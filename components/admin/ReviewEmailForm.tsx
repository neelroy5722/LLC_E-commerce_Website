"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { SubmitButton } from "@/components/ui/SubmitButton";

const field =
  "w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky";

/** Opens a centered modal to email the customer who wrote a single review. */
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/[0.06] px-3 py-1.5 text-xs font-medium text-ink/80 transition-colors hover:bg-brand-blue/[0.12]"
      >
        <Mail className="h-3.5 w-3.5" /> Email customer
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Email customer">
        <p className="mb-4 text-sm text-muted">
          To <span className="font-medium text-ink">{to}</span>
        </p>
        <form action={action} className="space-y-3">
          <input type="hidden" name="reviewId" value={reviewId} />
          <input name="subject" defaultValue={defaultSubject} required placeholder="Subject" className={field} />
          <textarea name="message" required rows={6} placeholder="Write your message to the customer…" className={field} />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-ink">
              Cancel
            </button>
            <SubmitButton size="md" savingLabel="Sending…" savedLabel="Sent">
              <Mail className="h-4 w-4" /> Send email
            </SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
