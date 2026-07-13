import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { saveMedia } from "@/lib/storage";

/**
 * Admin video upload. Stores the file via the configured storage provider
 * (local /media in dev, Cloudinary in production) and creates a Video record
 * (provider "file") shown on the assembly page.
 */
export async function POST(req: Request) {
  const su = await getSessionUser();
  if (su?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const form = await req.formData();
  const title = String(form.get("title") || "").trim();
  const file = form.get("file") as File | null;
  if (!title) return NextResponse.json({ error: "Please add a title." }, { status: 400 });
  if (!file || file.size === 0) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("video/")) {
    return NextResponse.json({ error: "Please upload a video file (mp4, webm, mov)." }, { status: 400 });
  }
  // Guard against very large uploads in the dev filesystem implementation (~200MB).
  if (file.size > 200 * 1024 * 1024) {
    return NextResponse.json({ error: "Video is too large (200MB max)." }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
  const stamp = String(Date.now()).slice(-8);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "video";
  const filename = `video-${slug}-${stamp}.${ext}`;

  const { url } = await saveMedia({
    data: Buffer.from(await file.arrayBuffer()),
    filename,
    contentType: file.type,
    folder: "videos",
  });

  const count = await prisma.video.count();
  await prisma.video.create({
    data: { title, url, provider: "file", sortOrder: count },
  });

  return NextResponse.json({ ok: true, url });
}
