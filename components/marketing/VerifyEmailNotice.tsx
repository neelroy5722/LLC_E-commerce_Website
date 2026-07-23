"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MailCheck, X } from "lucide-react";

/**
 * Shown after a successful sign-up (register redirects to `/?check_email=1`).
 * The account exists but stays unverified until the emailed link is opened, so
 * we surface that reminder on the homepage rather than stranding the user on a
 * dead-end page.
 */
export function VerifyEmailNotice() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || params.get("check_email") !== "1") return null;

  const close = () => {
    setDismissed(true);
    router.replace(pathname); // drop the query param
  };

  return (
    <div className="border-b border-brand-sky/20 bg-brand-sky/10">
      <div className="container flex items-start gap-3 py-3 text-sm text-ink">
        <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-sky" />
        <p className="flex-1">
          <span className="font-semibold">Almost there — check your email.</span>{" "}
          We&apos;ve sent a verification link to activate your account. Open it, then sign in. The
          link expires in 24 hours.
        </p>
        <button
          type="button"
          onClick={close}
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-brand-blue/5 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
