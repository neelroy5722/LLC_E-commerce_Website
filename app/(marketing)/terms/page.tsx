import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern purchases from Victory Martin.",
};

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        description="Placeholder terms for Milestone 1. Final terms will be confirmed before the store goes live."
      />
      <div className="container max-w-3xl py-14">
        <div className="space-y-6 text-ink/80">
          <Block title="Orders & payment">
            All configurations are charged in full at checkout. Each {SITE.product} is
            built after your order is placed.
          </Block>
          <Block title="Shipping">
            Orders ship by freight carrier within the United States. A coordinator will
            contact you to schedule delivery.
          </Block>
          <Block title="Returns">
            Because each unit is built for your order, return eligibility is limited. Full return
            terms will be published before launch.
          </Block>
          <Block title="Intellectual property">
            The {SITE.product} is protected under {SITE.patent}. All brand assets are
            property of {SITE.legalName}.
          </Block>
        </div>
      </div>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 leading-relaxed">{children}</p>
    </section>
  );
}
