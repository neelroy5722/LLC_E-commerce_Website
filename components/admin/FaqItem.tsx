"use client";

import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Collapsible FAQ row for the admin content page: shows only the question title
 * on one line; clicking it reveals the editable question + answer and delete.
 */
export function FaqItem({
  faq,
  upsertAction,
  deleteAction,
}: {
  faq: { id: string; question: string; answer: string };
  upsertAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-2xl border border-brand-blue/[0.08]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="truncate text-sm font-medium text-ink">{faq.question}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-brand-blue/[0.06] p-4">
          <form action={upsertAction} className="space-y-2">
            <input type="hidden" name="id" value={faq.id} />
            <input
              name="question"
              defaultValue={faq.question}
              className="w-full rounded-lg border border-brand-blue/12 bg-panel px-3 py-2 text-sm font-medium text-ink outline-none focus:border-brand-sky"
            />
            <textarea
              name="answer"
              rows={3}
              defaultValue={faq.answer}
              className="w-full rounded-lg border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink/80 outline-none focus:border-brand-sky"
            />
            <Button type="submit" size="sm" variant="outline" className="h-8 px-3 text-xs">Save</Button>
          </form>
          <form action={deleteAction} className="mt-2">
            <input type="hidden" name="id" value={faq.id} />
            <button type="submit" className="inline-flex items-center gap-1 text-xs text-muted hover:text-brand-red-600">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </form>
        </div>
      )}
    </li>
  );
}
