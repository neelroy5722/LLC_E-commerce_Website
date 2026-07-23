import { Prisma } from "@prisma/client";
import { Star, Check, X, Trash2, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { SortSelect } from "@/components/admin/SortSelect";
import { ReviewEmailForm } from "@/components/admin/ReviewEmailForm";
import { BulkReviewEmailForm } from "@/components/admin/BulkReviewEmailForm";
import {
  setReviewStatusAction,
  toggleReviewFeaturedAction,
  deleteReviewAction,
  emailReviewerAction,
  emailAllReviewersAction,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

type ReviewOrderBy = Prisma.ReviewOrderByWithRelationInput | Prisma.ReviewOrderByWithRelationInput[];
const REVIEW_SORTS: Record<string, ReviewOrderBy> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  rating_high: { rating: "desc" },
  rating_low: { rating: "asc" },
  author: { authorName: "asc" },
  status: [{ status: "asc" }, { createdAt: "desc" }],
};

export default async function AdminReviews({ searchParams }: { searchParams: { sort?: string } }) {
  const sort = searchParams.sort && REVIEW_SORTS[searchParams.sort] ? searchParams.sort : "status";
  const reviews = await prisma.review.findMany({
    orderBy: REVIEW_SORTS[sort],
    include: { user: { select: { email: true } } },
  });
  const pending = reviews.filter((r) => r.status === "pending");
  const featuredCount = reviews.filter((r) => r.featured && r.status === "approved").length;
  const reviewerCount = new Set(reviews.filter((r) => r.user?.email).map((r) => r.user!.email)).size;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-bold text-ink">Reviews</h1>
          <p className="text-sm text-muted">
            Moderate customer reviews and choose which appear on the About page.
            {" "}
            <span className="text-ink/80">{pending.length} awaiting review · {featuredCount} featured</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {reviewerCount > 0 && <BulkReviewEmailForm action={emailAllReviewersAction} count={reviewerCount} />}
          <SortSelect
            defaultValue="status"
            options={[
              { value: "status", label: "Status (pending first)" },
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
              { value: "rating_high", label: "Rating: high → low" },
              { value: "rating_low", label: "Rating: low → high" },
              { value: "author", label: "Author name" },
            ]}
          />
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="card p-10 text-center text-muted">No reviews yet.</div>
      ) : (
        <ul className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reviews.map((r) => (
            <li key={r.id} className="card flex flex-col p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-ink/20"}`}
                        />
                      ))}
                    </span>
                    <span className="text-sm font-medium text-ink">{r.authorName}</span>
                    <StatusPill status={r.status} />
                    {r.featured && r.status === "approved" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-sky/15 px-2 py-0.5 text-[11px] font-medium text-brand-sky">
                        <Sparkles className="h-3 w-3" /> On About page
                      </span>
                    )}
                  </div>
                  {r.title && <p className="mt-2 font-medium text-ink">{r.title}</p>}
                  <p className="mt-1 text-sm text-ink/80">{r.body}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-brand-blue/[0.06] pt-4">
                {r.status !== "approved" && (
                  <Action action={setReviewStatusAction} id={r.id} extra={{ status: "approved" }}
                    className="bg-emerald-400/15 text-emerald-700 hover:bg-emerald-400/25">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Action>
                )}
                {r.status !== "rejected" && (
                  <Action action={setReviewStatusAction} id={r.id} extra={{ status: "rejected" }}
                    className="bg-brand-blue/[0.06] text-ink/80 hover:bg-brand-blue/[0.1]">
                    <X className="h-3.5 w-3.5" /> Reject
                  </Action>
                )}
                <Action action={toggleReviewFeaturedAction} id={r.id}
                  className="bg-brand-sky/15 text-brand-sky hover:bg-brand-sky/25">
                  <Sparkles className="h-3.5 w-3.5" /> {r.featured ? "Unfeature" : "Feature on About"}
                </Action>
                {r.user?.email && (
                  <ReviewEmailForm
                    action={emailReviewerAction}
                    reviewId={r.id}
                    to={r.user.email}
                    defaultSubject="About your Apt.Bed review"
                  />
                )}
                <Action action={deleteReviewAction} id={r.id}
                  className="ml-auto bg-brand-red/10 text-brand-red-700 hover:bg-brand-red/20">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Action>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Action({
  action,
  id,
  extra,
  className,
  children,
}: {
  action: (formData: FormData) => void;
  id: string;
  extra?: Record<string, string>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {extra &&
        Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button
        type="submit"
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${className}`}
      >
        {children}
      </button>
    </form>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-emerald-400/15 text-emerald-700",
    pending: "bg-amber-400/15 text-amber-700",
    rejected: "bg-brand-red/15 text-brand-red-700",
  };
  const label: Record<string, string> = { approved: "Published", pending: "Pending", rejected: "Rejected" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${map[status] ?? map.pending}`}>
      {label[status] ?? status}
    </span>
  );
}
