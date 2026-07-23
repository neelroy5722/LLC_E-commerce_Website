import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Victory Martin collects and uses your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="This placeholder outlines how we intend to handle your data. Final policy language will be confirmed before launch."
      />
      <div className="container max-w-3xl py-14">
        <div className="prose-content space-y-6 text-ink/80">
          <Block title="Information we collect">
            When you contact us or place an order, we collect the details you provide —
            such as your name, email, phone number, and shipping address — so we can
            respond to you and coordinate freight delivery.
          </Block>
          <Block title="How we use it">
            We use your information to process orders, arrange delivery, provide support,
            and send order-status updates. We do not sell your personal information.
          </Block>
          <Block title="Payments">
            Card payments are processed by our payment provider. {SITE.legalName} does not
            store full card numbers on its servers.
          </Block>
          <Block title="Contact">
            Questions about privacy? Email{" "}
            <a className="text-brand-red-700 underline underline-offset-2" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
            .
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
