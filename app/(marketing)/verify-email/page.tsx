"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function VerifyInner() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("This verification link is missing its token.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok) {
          setState("ok");
        } else {
          setState("error");
          setMessage(data?.error ?? "Could not verify your email.");
        }
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("Something went wrong. Please try again.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === "loading") {
    return (
      <div className="card p-6 text-center sm:p-7">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-sky" />
        <p className="mt-3 text-sm text-muted">Verifying your email…</p>
      </div>
    );
  }

  if (state === "ok") {
    return (
      <div className="card space-y-3 p-6 text-center sm:p-7">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
        <h2 className="font-display text-xl font-semibold text-ink">Email verified</h2>
        <p className="text-sm text-muted">Your email is confirmed. You can now sign in to your account.</p>
        <Link href="/login" className="mt-1 inline-block">
          <Button size="lg">Go to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="card space-y-3 p-6 text-center sm:p-7">
      <AlertCircle className="mx-auto h-8 w-8 text-brand-red-700" />
      <h2 className="font-display text-xl font-semibold text-ink">Verification failed</h2>
      <p className="text-sm text-muted">{message}</p>
      <p className="text-xs text-muted">
        Need a new link?{" "}
        <Link href="/login" className="font-medium text-brand-red-700 hover:underline">
          Sign in
        </Link>{" "}
        and we&apos;ll offer to resend it.
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <section className="container flex min-h-[70vh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="h-11 w-11" />
          <h1 className="mt-4 font-display text-3xl font-bold text-ink">Verify your email</h1>
        </div>
        <Suspense fallback={null}>
          <VerifyInner />
        </Suspense>
      </div>
    </section>
  );
}
