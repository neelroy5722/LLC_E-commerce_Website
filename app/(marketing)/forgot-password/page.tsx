"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { AlertCircle, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container flex min-h-[70vh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="h-11 w-11" />
          <h1 className="mt-4 font-display text-3xl font-bold text-ink">Reset your password</h1>
          <p className="mt-1 text-sm text-muted">
            Enter your email and we&apos;ll send you a link to set a new password.
          </p>
        </div>

        {sent ? (
          <div className="card space-y-3 p-6 text-center sm:p-7">
            <MailCheck className="mx-auto h-8 w-8 text-brand-sky" />
            <h2 className="font-display text-xl font-semibold text-ink">Check your email</h2>
            <p className="text-sm text-muted">
              If an account exists for <span className="font-medium text-ink">{email}</span>, we&apos;ve sent a
              link to reset your password. It expires in 1 hour.
            </p>
            <p className="text-xs text-muted">
              Didn&apos;t get it? Check your spam folder, or{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="font-medium text-brand-red-300 hover:underline"
              >
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card space-y-4 p-6 sm:p-7">
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-brand-red/15 p-3 text-sm text-brand-red-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                className="w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-brand-red-300 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
