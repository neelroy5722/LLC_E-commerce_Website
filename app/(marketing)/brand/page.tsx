import type { Metadata } from "next";
import { Logo, LogoMark, LogoStamp } from "@/components/brand/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SITE } from "@/lib/site";
import { ArrowRight, MoveRight, Feather, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Brand & Style Guide",
  description:
    "The Apt.Bed by Victory Martin visual identity — the framed wordmark, the landing eagle, a refined Red / White / Blue palette, typography, and UI.",
};

const REDS = [
  { name: "50", hex: "#FDF1F4" },
  { name: "100", hex: "#FBDDE4" },
  { name: "300", hex: "#F196AB" },
  { name: "500 · Rose Red", hex: "#EB6A85" },
  { name: "600", hex: "#D9506E" },
  { name: "800", hex: "#86293D" },
];
const BLUES = [
  { name: "Sky · 400", hex: "#4E79AE" },
  { name: "Navy · 600", hex: "#1B3454" },
  { name: "Ink · 800", hex: "#101F33" },
  { name: "Alabaster", hex: "#FBF9F4" },
  { name: "Greige", hex: "#F4EEE3" },
  { name: "Panel", hex: "#FFFFFF" },
];
const NEUTRALS = [
  { name: "Ink (text)", hex: "#182838" },
  { name: "Muted", hex: "#61707F" },
  { name: "Cream", hex: "#F3ECDF" },
  { name: "Brass", hex: "#A97F45" },
];

const PRINCIPLES = [
  { icon: MoveRight, title: "Forward motion", text: "The eagle lands left to right. Everything leans gently toward progress and less clutter." },
  { icon: Feather, title: "American, not loud", text: "Refined red, white, and blue — confident and warm, never harsh or overtly patriotic." },
  { icon: Sparkles, title: "Crafted, not corporate", text: "An editorial serif and a warm, calm canvas makes the brand feel made by hand — because it is." },
];

export default function BrandPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-night">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="container relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.25fr_1fr]">
          <div className="animate-fade-up">
            <span className="eyebrow">Brand &amp; Style Guide</span>
            <h1 className="display-hero mt-4 text-4xl sm:text-5xl">
              A warm, confident identity — <span className="text-gradient">American, not loud</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">
              One landing eagle, a framed wordmark, and a Clay Red, ink-navy, and brass palette on a warm,
              calm canvas. Built to feel crafted and trustworthy — like the {SITE.product} itself.
            </p>
          </div>
          <div className="flex justify-center">
            <div>
              <LogoStamp tone="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* The wordmark (from the sketch) */}
      <section className="border-y border-brand-blue/[0.08] bg-night2 py-16 sm:py-20">
        <div className="container">
          <span className="eyebrow">The wordmark</span>
          <h2 className="display-hero mt-3 text-3xl sm:text-4xl">Apt.Bed, by Victory Martin</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">
            The product leads. &ldquo;APT.BED&rdquo; sits in a clean frame with &ldquo;by Victory
            Martin&rdquo; beneath — the maker&apos;s signature. Use the framed stamp for hero moments;
            the horizontal lockup for headers and footers.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ShowTile label="Framed stamp · dark" bg="bg-night">
              <LogoStamp tone="dark" />
            </ShowTile>
            <ShowTile label="Framed stamp · light" bg="bg-cream">
              <LogoStamp tone="light" />
            </ShowTile>
            <ShowTile label="Horizontal lockup" bg="bg-panel">
              <Logo />
            </ShowTile>
          </div>
        </div>
      </section>

      {/* The mark */}
      <section className="py-16 sm:py-20">
        <div className="container">
          <span className="eyebrow">The mark</span>
          <h2 className="display-hero mt-3 text-3xl sm:text-4xl">An eagle landing left to right</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">
            The trailing wing lifts up and back while the leading wing sweeps down and forward, and
            the beak points ahead — a subtle landing motion that reinforces progress and the
            space-saving idea. Together the two wings still read as a{" "}
            <span className="font-semibold text-ink">V for Victory</span>.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <ShowTile label="On navy" bg="bg-brand-blue">
              <LogoMark inverse className="h-24 w-24" />
            </ShowTile>
            <ShowTile label="On white" bg="bg-white">
              <LogoMark className="h-24 w-24" />
            </ShowTile>
            <ShowTile label="On cream" bg="bg-cream">
              <LogoMark className="h-24 w-24" />
            </ShowTile>
          </div>
        </div>
      </section>

      {/* Panels */}
      <div className="bg-night2">
        <div className="container space-y-8 py-16 sm:py-20">
          {/* Color */}
          <Panel title="Color system" desc="Clay Red, ink navy, and brass on a warm alabaster canvas.">
            <div className="space-y-7">
              <Swatches label="Clay Red" items={REDS} />
              <Swatches label="Blue & canvas" items={BLUES} />
              <Swatches label="Neutrals & brass" items={NEUTRALS} />
            </div>
          </Panel>

          {/* Typography */}
          <Panel title="Typography" desc="Fraunces (display serif) for headlines · Inter for text.">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-brand-blue/[0.08] bg-panel p-7">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Display · Fraunces</p>
                <p className="mt-3 font-display text-6xl font-bold leading-none tracking-tight text-ink">Aa</p>
                <p className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
                  Everything in one bed.
                </p>
              </div>
              <div className="rounded-2xl border border-brand-blue/[0.08] bg-panel p-7">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Body · Inter</p>
                <p className="mt-3 text-base leading-relaxed text-ink/80">
                  The Apt.Bed combines a bed, closet, desk, chest of drawers, and bed table into a
                  single frame — a whole bedroom in the footprint of just the bed.
                </p>
                <p className="eyebrow mt-5">Eyebrow · uppercase tracked</p>
              </div>
            </div>
          </Panel>

          {/* UI elements */}
          <Panel title="UI elements" desc="Buttons, badges, and surfaces on the warm, light canvas.">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Badge tone="red">Clay Red</Badge>
              <Badge tone="blue">Sky</Badge>
              <Badge tone="green">Success</Badge>
              <Badge tone="neutral">Neutral</Badge>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="card p-5">
                <p className="font-display text-base font-semibold text-ink">Card</p>
                <p className="mt-1 text-sm text-muted">Panel surface, hairline border, soft shadow.</p>
              </div>
              <div className="card-glass p-5">
                <p className="font-display text-base font-semibold text-ink">Glass</p>
                <p className="mt-1 text-sm text-muted">Frosted surface for overlays.</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-brand-red to-brand-red-400 p-5 text-ink shadow-glow">
                <p className="font-display text-base font-semibold">Gradient</p>
                <p className="mt-1 text-sm text-ink/85">Accent wash for highlights.</p>
              </div>
            </div>
          </Panel>

          {/* Principles */}
          <Panel title="Voice & principles" desc="How the brand should feel in every touchpoint.">
            <div className="grid gap-5 md:grid-cols-3">
              {PRINCIPLES.map((p) => (
                <div key={p.title} className="rounded-2xl border border-brand-blue/[0.08] bg-panel p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red/15 text-brand-red-700">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-ink">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
                </div>
              ))}
            </div>
          </Panel>

          <div className="text-center">
            <ButtonLink href="/product" size="lg">
              See it in action — configure the Apt.Bed
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}

function ShowTile({
  label,
  bg,
  children,
}: {
  label: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-blue/[0.08]">
      <div className={`flex h-48 items-center justify-center ${bg}`}>{children}</div>
      <div className="bg-panel px-5 py-3 text-sm font-medium text-muted">{label}</div>
    </div>
  );
}

function Panel({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-brand-blue/[0.08] bg-night/40 p-6 shadow-soft sm:p-8">
      <h2 className="display-hero text-2xl sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm text-muted">{desc}</p>
      <div className="mt-7">{children}</div>
    </section>
  );
}

function Swatches({ label, items }: { label: string; items: { name: string; hex: string }[] }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((c) => (
          <div key={c.hex} className="overflow-hidden rounded-xl border border-brand-blue/[0.08] bg-panel">
            <div className="h-20 w-full" style={{ backgroundColor: c.hex }} />
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold text-ink">{c.name}</p>
              <p className="text-xs uppercase text-muted">{c.hex}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
