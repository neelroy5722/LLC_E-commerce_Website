import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { prisma } from "@/lib/db";
import { FAQS } from "@/lib/site";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about the Apt.Bed — sizes, heights, freight shipping, assembly, and payment.",
};

// Content is admin-managed, so render on demand from the database.
export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const rows = await prisma.faq.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  // Fall back to the built-in copy if an admin hasn't added any FAQs yet.
  const items = rows.length ? rows.map((f) => ({ q: f.question, a: f.answer })) : FAQS;
  return (
    <Section className="bg-panel">
      <SectionHeading
        eyebrow="Frequently asked"
        title="Everything you need to know"
        description="Still have a question after reading these? Reach out — we're happy to help."
      />
      <div className="mx-auto mt-12 max-w-3xl">
        <Accordion items={items} />
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-night2 p-8 text-center">
          <h3 className="font-display text-xl font-semibold text-ink">
            Didn&apos;t find your answer?
          </h3>
          <p className="max-w-md text-sm text-muted">
            Our team can help you. Click the contact us button.
          </p>
          <ButtonLink href="/contact" className="mt-2">
            Contact us <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
