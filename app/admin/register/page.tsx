"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AlertCircle, ShieldCheck } from "lucide-react";

const field =
  "w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20";

export default function AdminRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, code }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create the admin account.");
      setLoading(false);
      return;
    }
    // New admins are created verified, so sign straight in.
    const signInRes = await signIn("credentials", { email, password, redirect: false });
    if (signInRes?.error) {
      setLoading(false);
      window.location.assign("/admin/login");
      return;
    }
    window.location.assign("/admin");
  }

  return (
    <AdminAuthShell heading="WELCOME ABOARD" sub="Create your admin">
      <div className="mb-6">
        <h2 className="font-sans text-2xl font-bold text-ink">Register admin</h2>
        <p className="mt-1 text-sm text-muted">Create an administrator account for the store.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-brand-red/15 p-3 text-sm text-brand-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Full name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="username" className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
          <PasswordInput value={password} onChange={setPassword} placeholder="At least 8 characters" required autoComplete="new-password" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Admin code</label>
          <input type="password" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Provided by the store owner" className={field} />
          <p className="mt-1 text-xs text-muted">Required — only holders of the admin code can register.</p>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          <ShieldCheck className="h-4 w-4" /> {loading ? "Creating…" : "Create admin account"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Already have an admin account?{" "}
        <Link href="/admin/login" className="font-medium text-brand-red-300 hover:underline">
          Sign in
        </Link>
      </p>
    </AdminAuthShell>
  );
}
