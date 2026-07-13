import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { saveMedia } from "@/lib/storage";

/**
 * Admin photo upload. Accepts one or several image files and stores them under
 * /public/uploads as Photo records. All uploads append (admin removes
 * individual photos from the media page). role=hero powers the flowing
 * first-screen carousel on the homepage.
 * (Dev implementation; Milestone 3 swaps in Cloudinary.)
 */
export async function POST(req: Request) {
  const su = await getSessionUser();
  if (su?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const form = await req.formData();
  const role = String(form.get("role") || "gallery") === "hero" ? "hero" : "gallery";
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });

  for (const f of files) {
    if (!f.type.startsWith("image/")) {
      return NextResponse.json({ error: "Please upload image files only." }, { status: 400 });
    }
    if (f.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: "Each image must be 12MB or less." }, { status: 400 });
    }
  }

  const urls: string[] = [];
  let i = 0;
  for (const f of files) {
    const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const stamp = String(Date.now()).slice(-8);
    const rand = Math.floor(f.size % 100000) + i;
    const filename = `photo-${role}-${stamp}-${rand}.${ext}`;
    const { url } = await saveMedia({
      data: Buffer.from(await f.arrayBuffer()),
      filename,
      contentType: f.type,
      folder: "photos",
    });
    urls.push(url);
    i++;
  }

  // Append (never replace) — the admin removes individual photos as needed.
  const count = await prisma.photo.count({ where: { role } });
  await prisma.photo.createMany({
    data: urls.map((url, idx) => ({ url, role, sortOrder: count + idx })),
  });

  return NextResponse.json({ ok: true, urls });
}
