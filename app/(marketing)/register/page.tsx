"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AlertCircle, MailCheck } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

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
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create your account.");
      setLoading(false);
      return;
    }
    // Account created but unverified — the user must confirm their email before
    // they can sign in, so show the "check your email" screen instead.
    setLoading(false);
    setRegistered(true);
  }

  if (registered) {
    return (
      <section className="container flex min-h-[70vh] items-center py-16">
        <div className="mx-auto w-full max-w-md">
          <div className="card space-y-3 p-6 text-center sm:p-7">
            <MailCheck className="mx-auto h-8 w-8 text-brand-sky" />
            <h1 className="font-display text-2xl font-bold text-ink">Confirm your email</h1>
            <p className="text-sm text-muted">
              We&apos;ve sent a verification link to <span className="font-medium text-ink">{email}</span>. Open it to
              activate your account, then sign in. The link expires in 24 hours.
            </p>
            <p className="text-xs text-muted">
              Didn&apos;t get it? Check your spam folder, or{" "}
              <Link href="/login" className="font-medium text-brand-red-300 hover:underline">
                sign in
              </Link>{" "}
              to resend it.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container flex min-h-[70vh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="h-11 w-11" />
          <h1 className="mt-4 font-display text-3xl font-bold text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Save your configuration, check out faster, and track your order.</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6 sm:p-7">
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-brand-red/15 p-3 text-sm text-brand-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <Field label="Full name" type="text" value={name} onChange={setName} placeholder="Jane Doe" />
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
            <PasswordInput value={password} onChange={setPassword} placeholder="At least 8 characters" required autoComplete="new-password" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Confirm password</label>
            <PasswordInput value={confirm} onChange={setConfirm} placeholder="Re-enter your password" required autoComplete="new-password" />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-red-300 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
      />
    </div>
  );
}
