"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Admin photo upload. `role="hero"` uploads a single first-screen image;
 * `role="gallery"` accepts one or several images at once.
 */
export function PhotoUploader({
  role,
  label,
  hint,
}: {
  role: "hero" | "gallery";
  label: string;
  hint?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const multiple = true;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const files = fileRef.current?.files;
    if (!files || files.length === 0) return setError("Please choose an image.");

    const body = new FormData();
    body.set("role", role);
    Array.from(files).forEach((f) => body.append("files", f));

    setLoading(true);
    const res = await fetch("/api/admin/photo-upload", { method: "POST", body });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Upload failed.");
      return;
    }
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
        <ImagePlus className="h-4 w-4" /> {label}
      </p>
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-brand-red/15 p-3 text-sm text-brand-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="min-w-0 flex-1 rounded-lg border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink outline-none file:mr-3 file:rounded-md file:border-0 file:bg-brand-blue file:px-3 file:py-1 file:text-white focus:border-brand-sky"
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Uploading…" : "Upload"}
        </Button>
      </div>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </form>
  );
}
