import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

/**
 * Serves admin-uploaded media from /public/uploads at request time. This is
 * used instead of relying on static /public serving because Next.js only serves
 * files that existed when the server started — a route handler always reads the
 * current file from disk, so freshly uploaded photos display immediately in both
 * dev and production.
 */
export async function GET(_req: Request, { params }: { params: { name: string } }) {
  // Reject anything that isn't a plain filename (no path traversal).
  const name = params.name;
  if (!name || name.includes("/") || name.includes("\\") || name.includes("..")) {
    return new Response("Not found", { status: 404 });
  }
  const ext = (name.split(".").pop() || "").toLowerCase();
  const type = TYPES[ext];
  if (!type) return new Response("Unsupported", { status: 415 });

  try {
    const file = await readFile(path.join(process.cwd(), "public", "uploads", name));
    return new Response(file, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
