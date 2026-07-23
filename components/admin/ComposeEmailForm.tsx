"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { SubmitButton } from "@/components/ui/SubmitButton";

const field =
  "w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/15";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";

/** Top-right "Send email" — opens a polished modal to email any recipient. */
export function ComposeEmailForm({ action }: { action: (formData: FormData) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <Mail className="h-4 w-4" /> Send email
      </button>

      <Modal open={open} onClose={() => setOpen(false)} icon={Mail} title="Send an email" subtitle="Compose a message to a customer">
        <form action={action} className="space-y-4">
          <div>
            <label className={label}>Recipient email</label>
            <input name="to" type="email" required placeholder="customer@email.com" className={field} />
          </div>
          <div>
            <label className={label}>Subject</label>
            <input name="subject" required placeholder="Subject" className={field} />
          </div>
          <div>
            <label className={label}>Message</label>
            <textarea name="message" required rows={6} placeholder="Write your message…" className={field} />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-ink">
              Cancel
            </button>
            <SubmitButton size="md" savingLabel="Sending…" savedLabel="Sent">
              <Send className="h-4 w-4" /> Send email
            </SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
