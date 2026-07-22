"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

/** Signs the admin out and returns them to the storefront home. */
export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue/12 px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:border-brand-blue/25 hover:text-ink"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
