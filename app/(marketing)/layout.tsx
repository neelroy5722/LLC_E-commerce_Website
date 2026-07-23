import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VerifyEmailNotice } from "@/components/marketing/VerifyEmailNotice";

/** Public-facing shell: site header + footer around all marketing/account pages. */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Suspense fallback={null}>
        <VerifyEmailNotice />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
