"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AlertCircle } from "lucide-react";

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setLoading(false);
      setError("Incorrect email or password.");
      return;
    }
    // Route admins to the admin dashboard when they didn't target a specific
    // customer page. Determine the role from the freshly-established session.
    let dest = callbackUrl;
    try {
      const s = await fetch("/api/auth/session").then((r) => r.json());
      if (s?.user?.role === "admin" && (dest === "/account" || dest.startsWith("/account"))) {
        dest = "/admin";
      }
    } catch {
      /* fall back to callbackUrl */
    }
    // Hard navigation so the freshly-set session cookie is sent on the next
    // request — a client-side router.push can race the middleware and require
    // a second click.
    window.location.assign(dest);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <LogoMark className="h-11 w-11" />
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in to track orders and manage your account.</p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-6 sm:p-7">
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-brand-red/15 p-3 text-sm text-brand-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
          <PasswordInput value={password} onChange={setPassword} placeholder="••••••••" required autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="font-medium text-brand-red-300 hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-6 rounded-xl border border-brand-blue/[0.08] bg-brand-blue/[0.03] p-4 text-xs text-muted">
        <p className="font-semibold text-ink/80">Demo logins</p>
        <p className="mt-1">Customer — john.r@email.com / password</p>
        <p>Admin — admin@victorymartin.com / admin1234</p>
      </div>
    </div>
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

export default function LoginPage() {
  return (
    <section className="container flex min-h-[70vh] items-center py-16">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </section>
  );
}
