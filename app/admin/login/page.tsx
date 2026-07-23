"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AlertCircle, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
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
      setError(res.error.includes("EMAIL_NOT_VERIFIED") ? "Please verify your email first." : "Incorrect email or password.");
      return;
    }

    // Only admins may proceed; a customer account is signed back out.
    try {
      const s = await fetch("/api/auth/session").then((r) => r.json());
      if (s?.user?.role === "admin") {
        window.location.assign("/admin");
        return;
      }
    } catch {
      /* fall through to the error path */
    }
    await signOut({ redirect: false });
    setLoading(false);
    setError("This account doesn't have admin access.");
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-night2 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue text-white">
            <LogoMark className="h-7 w-7" inverse />
          </span>
          <h1 className="mt-4 font-sans text-2xl font-bold text-ink">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">Victory Martin · Apt.Bed admin dashboard</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6 sm:p-7">
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-brand-red/15 p-3 text-sm text-brand-red-700">
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
              autoComplete="username"
              className="w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
            <PasswordInput value={password} onChange={setPassword} placeholder="••••••••" required autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            <ShieldCheck className="h-4 w-4" /> {loading ? "Signing in…" : "Sign in to admin"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">Authorized personnel only.</p>
      </div>
    </section>
  );
}
