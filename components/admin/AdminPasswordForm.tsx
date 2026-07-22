"use client";

import { useState } from "react";
import { KeyRound, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";

/**
 * Lets a signed-in admin change their own password. Posts to the shared
 * /api/account/password endpoint (verifies the current password server-side).
 */
export function AdminPasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not update password.");
        return;
      }
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-6">
      <div>
        <h2 className="font-sans text-lg font-bold text-ink">Change password</h2>
        <p className="text-sm text-muted">Update the password for your admin account.</p>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-red/15 p-3 text-sm text-brand-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {done && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-400/15 p-3 text-sm text-emerald-700">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          Password updated.
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Current password</label>
          <PasswordInput value={current} onChange={setCurrent} placeholder="••••••••" required autoComplete="current-password" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">New password</label>
          <PasswordInput value={next} onChange={setNext} placeholder="At least 8 characters" required autoComplete="new-password" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Confirm new</label>
          <PasswordInput value={confirm} onChange={setConfirm} placeholder="Re-enter new password" required autoComplete="new-password" />
        </div>
      </div>

      <div className="mt-5">
        <Button type="submit" size="md" disabled={loading}>
          <KeyRound className="h-4 w-4" /> {loading ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}
