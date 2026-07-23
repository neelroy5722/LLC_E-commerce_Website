import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck, Package, MapPin } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { HeroCarousel } from "@/components/HeroCarousel";
import { prisma } from "@/lib/db";
import { SITE, INCLUDED_PIECES, AUDIENCES } from "@/lib/site";

// Homepage photography is admin-managed, so render on demand.
export const dynamic = "force-dynamic";

const TRUST = [
  { icon: Package, label: "Choose from available sizes" },
  { icon: MapPin, label: SITE.origin },
  { icon: Truck, label: "Freight delivery across the USA" },
];

export default async function HomePage() {
  const photos = await prisma.photo.findMany({ orderBy: { sortOrder: "asc" } });
  const heroPhotos = photos.filter((p) => p.role === "hero");
  const galleryPhotos = photos.filter((p) => p.role === "gallery");
  return (
    <>
      {/* ── RED band: hero ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-[radial-gradient(135%_125%_at_12%_-15%,#5C3D18_0%,#3B1E08_47%,#241205_100%)] text-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/[0.06] blur-3xl" />
        <div className="container relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:py-32">
          <div>
            <span className="eyebrow-on-color">One unit · Five pieces</span>
            <h1 className="display-hero mt-6 text-5xl leading-[1.14] text-white sm:text-6xl lg:text-[4.2rem]">
              Save space. <br />
              Reclaim your room. <br />
              <span className="mt-2 block font-display text-3xl italic font-medium leading-tight text-cream sm:text-4xl lg:text-5xl">
                Everything in one bed.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/85">
              The {SITE.product} combines a bed, closet, desk, chest of drawers, and
              bed table into a single frame — a whole bedroom in the footprint of just
              the bed.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/product"
                className="inline-flex h-14 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-6 text-base font-semibold text-brand-red-600 shadow-[0_12px_34px_-12px_rgba(0,0,0,0.4)] ring-1 ring-black/5 transition-colors hover:bg-cream"
              >
                Configure &amp; see price
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              {TRUST.map((t, i) => (
                <div key={t.label} className="flex items-center gap-2 text-sm font-medium text-white/85">
                  {i > 0 ? <span className="mr-1 hidden h-3.5 w-px bg-white/25 sm:block" /> : null}
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </div>
              ))}
            </dl>
          </div>

          <div>
            <div className="relative mx-auto max-w-xl overflow-hidden rounded-2xl border border-white/25 bg-white shadow-lift ring-1 ring-white/10">
              <div className="relative aspect-[560/460] w-full">
                {heroPhotos.length > 0 ? (
                  <HeroCarousel images={heroPhotos} />
                ) : (
                  <Image
                    src="/products/apt-bed-queen-high-oak.svg"
                    alt="Apt.Bed loft unit with closet, desk, and drawers underneath"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHITE: all-in-one strip ──────────────────────── */}
      <section className="border-b border-brand-blue/[0.06] bg-white py-12">
        <div className="container flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
          <span className="overline">All-in-one</span>
          {INCLUDED_PIECES.map((p, i) => (
            <span key={p.name} className="flex items-center gap-x-8">
              {i > 0 ? <span className="h-1 w-1 rounded-full bg-brass/50" /> : null}
              <span className="font-display text-lg font-semibold text-brand-blue-700">
                {p.name}
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* ── WHITE: built in South Carolina ───────────────── */}
      <Section className="bg-white">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow justify-center">Made in the USA</span>
          <p className="mt-6 font-display text-2xl font-bold leading-snug text-brand-blue-700 sm:text-[1.9rem]">
            Built in South Carolina from USA sourced hardwoods — substantial,
            durable, lasting.
          </p>
        </div>
      </Section>

      {/* ── BLUE band: audiences ─────────────────────────── */}
      <section className="bg-gradient-to-b from-brand-blue-500 to-brand-blue-600 py-20 text-white sm:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow-on-color justify-center">Made for tight spaces</span>
            <h2 className="display-hero mt-5 text-3xl text-white sm:text-[2.6rem]">
              Built for the people who need every square foot
            </h2>
          </div>
          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
            {AUDIENCES.map((a, i) => (
              <span key={a} className="flex items-center gap-x-8">
                {i > 0 ? <span className="h-1 w-1 rounded-full bg-white/40" /> : null}
                <span className="text-base font-medium text-white/90">{a}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHITE: gallery (admin-managed photography) ───── */}
      {galleryPhotos.length > 0 && (
        <Section className="bg-white">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">In real rooms</span>
            <h2 className="mt-5 font-display text-3xl font-bold text-brand-blue-700 sm:text-[2.2rem]">
              See the Apt.Bed in the wild
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {galleryPhotos.map((p) => (
              <div
                key={p.id}
                className="relative aspect-square overflow-hidden rounded-2xl border border-brand-blue/10 bg-brand-blue/[0.03]"
              >
                <Image
                  src={p.url}
                  alt={p.alt || "Apt.Bed in a customer's room"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── BLUE band: CTA ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-blue-700 to-brand-blue-800 py-20 text-center text-white sm:py-28">
        <div className="container">
          <span className="hairline-brass mx-auto mb-7 block w-20" />
          <h2 className="display-hero text-3xl text-white sm:text-[2.6rem]">
            Your whole bedroom.{" "}
            <span className="font-display italic font-medium text-brass-soft">
              One brilliant bed.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">
            Configure your {SITE.product} in minutes and see exactly what it costs —
            no surprises.
          </p>
          <div className="mt-8">
            <ButtonLink href="/product" size="lg">
              Start configuring
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-white/60">
            Questions first?{" "}
            <Link href="/faq" className="underline underline-offset-4 hover:text-white">
              Read the FAQ
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="underline underline-offset-4 hover:text-white">
              contact us
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
