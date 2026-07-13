import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { saveMedia } from "@/lib/storage";

/**
 * Admin image upload. Stores the file via the configured storage provider
 * (local /media in dev, Cloudinary in production) and records a per-combination
 * ProductImage override so the storefront shows the real photo.
 * Pass `reset=1` (no file) to remove an override and fall back to the default.
 */
export async function POST(req: Request) {
  const su = await getSessionUser();
  if (su?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const form = await req.formData();
  const sizeKey = String(form.get("sizeKey") || "");
  const heightKey = String(form.get("heightKey") || "");
  const woodKey = String(form.get("woodKey") || "");
  if (!sizeKey || !heightKey || !woodKey) {
    return NextResponse.json({ error: "Missing combination" }, { status: 400 });
  }

  if (form.get("reset")) {
    await prisma.productImage.deleteMany({ where: { sizeKey, heightKey, woodKey } });
    return NextResponse.json({ url: `/products/apt-bed-${sizeKey}-${heightKey}-${woodKey}.svg`, reset: true });
  }

  const file = form.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Please upload an image file." }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const stamp = String(Date.now()).slice(-8);
  const filename = `${sizeKey}-${heightKey}-${woodKey}-${stamp}.${ext}`;

  const { url } = await saveMedia({
    data: Buffer.from(await file.arrayBuffer()),
    filename,
    contentType: file.type,
    folder: "products",
  });

  await prisma.productImage.upsert({
    where: { sizeKey_heightKey_woodKey: { sizeKey, heightKey, woodKey } },
    update: { url },
    create: { sizeKey, heightKey, woodKey, url },
  });

  return NextResponse.json({ url });
}
