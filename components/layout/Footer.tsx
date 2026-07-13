import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SITE, NAV_LINKS } from "@/lib/site";

const SUPPORT_LINKS = [
  { href: "/faq", label: "FAQ" },
  { href: "/shipping", label: "Shipping & Freight" },
  { href: "/assembly", label: "Assembly Videos" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/about", label: "Our Story" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

/** Public-site footer — the blue band that closes the red→white→blue flow. */
export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-brand-blue-600 to-brand-blue-800 text-white">
      <div className="hairline-brass" />
      <div className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="Apt.Bed by Victory Martin — home">
              <Logo inverse />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              {SITE.tagline}
            </p>
            <p className="mt-4 text-xs text-white/60">{SITE.origin}</p>
          </div>

          <FooterColumn title="Explore" links={NAV_LINKS} />
          <FooterColumn title="Support" links={SUPPORT_LINKS} />

          <div>
            <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-brass-soft">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 text-brand-red-300" /> {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE.phone.replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 text-brand-red-300" /> {SITE.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-red-300" /> {SITE.originShort}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/60 sm:flex-row">
          <p>© {SITE.legalName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-brass-soft">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm text-white/70">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
