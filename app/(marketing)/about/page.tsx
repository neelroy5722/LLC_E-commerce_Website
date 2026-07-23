import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Victory Martin builds one thing — the Apt.Bed — and builds it exceptionally well. Built in South Carolina from USA-sourced hardwoods.",
};

// Featured customer reviews are admin-curated, so render on demand.
export const dynamic = "force-dynamic";

const SPECS = [
  { label: "Patent", value: SITE.patent },
  { label: "Material", value: SITE.material },
  { label: "Origin", value: SITE.originShort },
  { label: "Range", value: "3 sizes × 3 heights" },
];

export default async function AboutPage() {
  const reviews = await prisma.review.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  return (
    <>
      {/* Red headline band */}
      <section className="relative overflow-hidden bg-[radial-gradient(135%_130%_at_12%_-20%,#F08BA0_0%,#EB6A85_48%,#C0475F_100%)] text-white">
        <div className="container relative py-16 sm:py-20">
          <span className="eyebrow-on-color">Our Story</span>
          <h1 className="display-hero mt-4 max-w-3xl text-4xl text-white sm:text-5xl">
            One good idea, built well enough to last a generation
          </h1>
        </div>
      </section>

      {/* White story + spec card */}
      <section className="bg-white">
        <div className="container grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          {/* Narrative */}
          <div className="max-w-2xl">
            <p className="text-lg leading-relaxed text-ink/80">
              Victory Martin builds one thing — the {SITE.product} — and builds it exceptionally
              well. It&apos;s all the furniture you&apos;d find in a bedroom (bed, closet, desk,
              chest of drawers, and bed table) combined into a single structure that takes up barely
              more floor space than the mattress.
            </p>

            <div className="mt-6 space-y-4 text-[15px] leading-normal text-ink/75">
              <p>
                It all started with a very small house. And the five people who live there. With
                floor space at a premium, the only way to solve the crowding problem was to build UP.
              </p>
              <p>
                Each child was given a bed that could keep all their possessions safe. That was the
                {" "}{SITE.product} in its infancy.
              </p>
              <p>
                The name Victory Martin comes from the grandparents of those children. Their
                grandmother was named Victory, and their grandfather was named Martin. And the eagle?
                When it&apos;s landing, it looks like a &lsquo;V&rsquo;.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="font-display text-xl font-semibold text-ink">Who it&apos;s for</h2>
              <p className="mt-2 text-[15px] leading-normal text-ink/75">
                Homes that want their floor space back. Guest rooms and home offices doing double
                duty. And furnishing dorm rooms where every square foot counts. One structure,
                endless room.
              </p>
            </div>
          </div>

          {/* Spec card */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card overflow-hidden p-7">
              <div className="flex flex-col items-center border-b border-brand-blue/[0.08] pb-6 text-center">
                <LogoMark className="h-12 w-12" />
                <p className="mt-3 font-display text-lg font-semibold text-ink">
                  {SITE.legalName}
                </p>
                <p className="text-sm text-muted">{SITE.origin}</p>
              </div>
              <dl className="mt-2 divide-y divide-brand-blue/[0.08]">
                {SPECS.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      {s.label}
                    </dt>
                    <dd className="text-right text-sm font-medium text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <ButtonLink href="/product" className="mt-5 w-full">
                Find your Apt.Bed
              </ButtonLink>
            </div>
            <p className="mt-4 text-center text-xs text-muted">
              Questions first?{" "}
              <Link href="/contact" className="text-brand-red underline underline-offset-2">
                Talk to us
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Customer reviews (admin-curated). With no approved reviews yet we show a
          genuine invitation rather than implying we have testimonials. */}
      <section className="bg-panel">
        <div className="container py-14 sm:py-16">
          <div className="text-center">
            <span className="eyebrow">{reviews.length > 0 ? "Loved by owners" : "Reviews"}</span>
            <h2 className="display-hero mt-3 text-3xl text-ink sm:text-4xl">
              {reviews.length > 0 ? "What customers say" : "Be the first to review"}
            </h2>
          </div>
          {reviews.length > 0 ? (
            <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <figure key={r.id} className="card flex flex-col p-6">
                  <div className="flex items-center gap-0.5 text-brand-red">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < r.rating ? "h-4 w-4 fill-current" : "h-4 w-4 text-muted"
                        }
                      />
                    ))}
                  </div>
                  {r.title && (
                    <figcaption className="mt-3 font-display font-semibold text-ink">
                      {r.title}
                    </figcaption>
                  )}
                  <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-ink/75">
                    &ldquo;{r.body}&rdquo;
                  </blockquote>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted">
                    {r.authorName}
                  </p>
                </figure>
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-8 max-w-xl text-center">
              <p className="text-sm leading-relaxed text-muted">
                We&apos;re a new company, so we haven&apos;t collected customer reviews yet. If
                you own an Apt.Bed, we&apos;d genuinely love to hear how it&apos;s working in
                your space — your review will be the first.
              </p>
              <ButtonLink href="/account/reviews" className="mt-6">
                Write a review
              </ButtonLink>
              <p className="mt-3 text-xs text-muted">
                Reviews are open to owners once their Apt.Bed order has been delivered.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
