"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AlertCircle, ShieldCheck } from "lucide-react";

const field =
  "w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20";

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
    try {
      const s = await fetch("/api/auth/session").then((r) => r.json());
      if (s?.user?.role === "admin") {
        window.location.assign("/admin");
        return;
      }
    } catch {
      /* fall through */
    }
    await signOut({ redirect: false });
    setLoading(false);
    setError("This account doesn't have admin access.");
  }

  return (
    <AdminAuthShell heading="WELCOME BACK" sub="Admin dashboard">
      <div className="mb-6 text-center">
        <h2 className="font-sans text-2xl font-bold text-ink">Admin sign in</h2>
        <p className="mt-1 text-sm text-muted">Sign in to manage the Apt.Bed store.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-brand-red/15 p-3 text-sm text-brand-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="username" className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
          <PasswordInput value={password} onChange={setPassword} placeholder="••••••••" required autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          <ShieldCheck className="h-4 w-4" /> {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Need an admin account?{" "}
        <Link href="/admin/register" className="font-medium text-brand-red-300 hover:underline">
          Register
        </Link>
      </p>
    </AdminAuthShell>
  );
}
