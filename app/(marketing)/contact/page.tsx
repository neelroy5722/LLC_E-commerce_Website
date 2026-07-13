import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { SITE } from "@/lib/site";
import { Mail, Phone, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Say Hello",
  description:
    "Talk to Victory Martin about sizing, ceiling height, freight delivery, order support, or bulk university orders for the Apt.Bed.",
};

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-night via-night2 to-night">
      <div className="blob right-[-8rem] top-[-6rem] h-96 w-96 bg-brand-red/12" />
      <div className="blob left-[-6rem] bottom-[-4rem] h-80 w-80 bg-brand-sky/12" />

      <div className="container relative py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Say hello</span>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Let us help you build the right bed for your room.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">
            Real people, real answers. We can help.
          </p>
          <p className="mt-2 text-base leading-relaxed text-ink/70">
            Contact us by email, phone, or use the form below.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
          {/* Left: contact methods */}
          <div>
            <div className="rounded-3xl border border-brand-blue/[0.08] bg-brand-blue/[0.05] p-6 shadow-soft backdrop-blur">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Method icon={Mail} label="Email" value={SITE.email} href={`mailto:${SITE.email}`} />
                </div>
                <Method icon={Phone} label="Phone" value={SITE.phone} href={`tel:${SITE.phone.replace(/[^0-9+]/g, "")}`} />
                <Method icon={Clock} label="Hours" value="Mon–Fri · 9–6 ET" />
              </div>
              <p className="mt-5 border-t border-brand-blue/[0.08] pt-4 text-xs text-muted">
                We reply within one business day. Prefer to browse first?{" "}
                <Link href="/faq" className="text-brand-red underline underline-offset-2">
                  Read the FAQ
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Right: form */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

function Method({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <div className="flex items-start gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-ink">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} className="transition-opacity hover:opacity-80">{body}</a> : body;
}
