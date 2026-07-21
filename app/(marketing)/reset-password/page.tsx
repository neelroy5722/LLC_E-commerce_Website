"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card space-y-3 p-6 text-center sm:p-7">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
        <h2 className="font-display text-xl font-semibold text-ink">Password updated</h2>
        <p className="text-sm text-muted">Your password has been changed. You can now sign in with it.</p>
        <Link href="/login" className="mt-1 inline-block">
          <Button size="lg">Go to sign in</Button>
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="card space-y-3 p-6 text-center sm:p-7">
        <AlertCircle className="mx-auto h-8 w-8 text-brand-red-300" />
        <h2 className="font-display text-xl font-semibold text-ink">Invalid reset link</h2>
        <p className="text-sm text-muted">
          This link is missing its token. Please request a new password-reset email.
        </p>
        <Link href="/forgot-password" className="mt-1 inline-block">
          <Button size="lg">Request a new link</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6 sm:p-7">
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-brand-red/15 p-3 text-sm text-brand-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">New password</label>
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          required
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Confirm new password</label>
        <PasswordInput
          value={confirm}
          onChange={setConfirm}
          placeholder="Re-enter your new password"
          required
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="container flex min-h-[70vh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="h-11 w-11" />
          <h1 className="mt-4 font-display text-3xl font-bold text-ink">Choose a new password</h1>
          <p className="mt-1 text-sm text-muted">Set a new password for your Apt.Bed account.</p>
        </div>
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </div>
    </section>
  );
}
