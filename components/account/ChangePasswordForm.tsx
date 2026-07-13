"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (next !== confirm) {
      setError("New passwords don't match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not update password.");
      return;
    }
    setDone(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <form onSubmit={onSubmit} className="card p-6">
      <h2 className="font-display text-lg font-bold text-ink">Password</h2>
      <p className="text-sm text-muted">Update the password you use to sign in.</p>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-red/15 p-3 text-sm text-brand-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {done && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-400/15 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          Password updated.
        </div>
      )}

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <Field label="Current password" value={current} onChange={setCurrent} />
        <Field label="New password" value={next} onChange={setNext} />
        <Field label="Confirm new" value={confirm} onChange={setConfirm} />
      </div>
      <div className="mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">{label}</label>
      <PasswordInput value={value} onChange={onChange} required autoComplete="off" />
    </div>
  );
}
