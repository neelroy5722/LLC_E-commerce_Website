"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Admin video upload — title + file → POST /api/admin/video-upload. */
export function VideoUploader() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!title.trim()) return setError("Please add a title.");
    if (!file) return setError("Please choose a video file.");

    const body = new FormData();
    body.set("title", title.trim());
    body.set("file", file);

    setLoading(true);
    const res = await fetch("/api/admin/video-upload", { method: "POST", body });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Upload failed.");
      return;
    }
    setTitle("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-6">
      <p className="flex items-center gap-1.5 font-medium text-ink">
        <UploadCloud className="h-4 w-4" /> Upload a video
      </p>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-red/15 p-3 text-sm text-brand-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. Building the base frame)"
          className="rounded-lg border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-brand-sky"
        />
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="rounded-lg border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink outline-none file:mr-3 file:rounded-md file:border-0 file:bg-brand-blue file:px-3 file:py-1 file:text-white focus:border-brand-sky"
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Uploading…" : "Upload"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">
        Upload an MP4/WebM/MOV file (200MB max). It plays directly on the assembly page.
      </p>
    </form>
  );
}
