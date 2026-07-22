import { Star, Clock, CheckCircle2, XCircle, BadgeCheck } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { submitReviewAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AccountReviews() {
  const su = await getSessionUser();
  if (!su?.id) return null;

  const [deliveredCount, reviews] = await Promise.all([
    prisma.order.count({ where: { userId: su.id, status: "delivered" } }),
    prisma.review.findMany({ where: { userId: su.id }, orderBy: { createdAt: "desc" } }),
  ]);
  const verified = deliveredCount > 0;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-ink">Write a review</h2>
          {verified && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified purchase
            </span>
          )}
        </div>
        {verified ? (
          <>
            <p className="text-sm text-muted">
              Share your experience — reviews are published after a quick check by our team.
            </p>
            <form action={submitReviewAction} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Rating</label>
                  <select
                    name="rating"
                    defaultValue="5"
                    className="w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} star{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Title</label>
                  <input
                    name="title"
                    placeholder="Sum it up in a few words"
                    className="w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Your review</label>
                <textarea
                  name="body"
                  required
                  rows={4}
                  placeholder="What did you think of your Apt.Bed?"
                  className="w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky"
                />
              </div>
              <SubmitButton size="md" savedLabel="Submitted">Submit review</SubmitButton>
            </form>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Reviews are open to verified owners. You&apos;ll be able to write one here once one of
            your Apt.Bed orders is marked <span className="font-medium text-ink">Delivered</span>.
          </p>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg font-bold text-ink">Your reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-muted">You haven&apos;t written any reviews yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-xl border border-brand-blue/[0.08] bg-panel p-4">
                <div className="flex items-center justify-between gap-3">
                  <Stars rating={r.rating} />
                  <StatusChip status={r.status} />
                </div>
                {r.title && <p className="mt-2 font-medium text-ink">{r.title}</p>}
                <p className="mt-1 text-sm text-ink/80">{r.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-ink/20"}`}
        />
      ))}
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
    approved: { label: "Published", cls: "bg-emerald-400/15 text-emerald-700", icon: CheckCircle2 },
    pending: { label: "In review", cls: "bg-amber-400/15 text-amber-700", icon: Clock },
    rejected: { label: "Not published", cls: "bg-brand-red/15 text-brand-red-700", icon: XCircle },
  };
  const s = map[status] ?? map.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>
      <Icon className="h-3.5 w-3.5" /> {s.label}
    </span>
  );
}
