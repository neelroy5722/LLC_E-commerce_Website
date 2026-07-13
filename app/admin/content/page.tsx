import { Plus, Megaphone, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/db";
import { upsertFaqAction, deleteFaqAction, saveAnnouncementAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminContent() {
  const [faqs, announcement] = await Promise.all([
    prisma.faq.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.announcement.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Content management</h1>
        <p className="text-sm text-muted">Edit FAQs and the site announcement.</p>
      </div>

      {/* Announcement */}
      <form action={saveAnnouncementAction} className="card p-6">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-brand-red-700" />
          <h2 className="font-display text-lg font-bold text-ink">Site announcement</h2>
        </div>
        <textarea
          name="message"
          rows={2}
          defaultValue={announcement?.message ?? ""}
          placeholder="e.g. Free freight on King configurations this month…"
          className="mt-4 w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky"
        />
        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="active" defaultChecked={announcement?.active} className="h-4 w-4 accent-brand-sky" />
            Show on site
          </label>
          <Button type="submit" size="sm"><Save className="h-4 w-4" /> Save</Button>
        </div>
      </form>

      {/* FAQ list */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-bold text-ink">FAQs</h2>
        <ul className="mt-4 space-y-4">
          {faqs.map((f) => (
            <li key={f.id} className="rounded-2xl border border-brand-blue/[0.08] p-4">
              <form action={upsertFaqAction} className="space-y-2">
                <input type="hidden" name="id" value={f.id} />
                <input
                  name="question"
                  defaultValue={f.question}
                  className="w-full rounded-lg border border-brand-blue/12 bg-panel px-3 py-2 text-sm font-medium text-ink outline-none focus:border-brand-sky"
                />
                <textarea
                  name="answer"
                  rows={2}
                  defaultValue={f.answer}
                  className="w-full rounded-lg border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink/80 outline-none focus:border-brand-sky"
                />
                <div className="flex items-center gap-2">
                  <Button type="submit" size="sm" variant="outline" className="h-8 px-3 text-xs">Save</Button>
                </div>
              </form>
              <form action={deleteFaqAction} className="mt-2">
                <input type="hidden" name="id" value={f.id} />
                <button type="submit" className="inline-flex items-center gap-1 text-xs text-muted hover:text-brand-red-600">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </form>
            </li>
          ))}
        </ul>

        {/* Add new */}
        <form action={upsertFaqAction} className="mt-6 space-y-2 rounded-2xl border border-dashed border-brand-blue/12 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink"><Plus className="h-4 w-4" /> Add a FAQ</p>
          <input
            name="question"
            placeholder="Question"
            className="w-full rounded-lg border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-brand-sky"
          />
          <textarea
            name="answer"
            rows={2}
            placeholder="Answer"
            className="w-full rounded-lg border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink/80 outline-none focus:border-brand-sky"
          />
          <Button type="submit" size="sm" className="h-8 px-3 text-xs">Add FAQ</Button>
        </form>
      </div>
    </div>
  );
}
