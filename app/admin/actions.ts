"use server";

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { advanceOrderItemStatus } from "@/lib/orders";
import { setSetting } from "@/lib/settings";
import { dollarsToCents } from "@/lib/money";
import { productPlaceholderSvg } from "@/lib/placeholder";
import { variantImagePath } from "@/lib/catalog";
import { deleteMedia } from "@/lib/storage";

async function assertAdmin() {
  const su = await getSessionUser();
  if (su?.role !== "admin") throw new Error("Unauthorized");
}

/**
 * Auto-generates composed preview SVGs for the given (size × height × wood)
 * combinations, writing them to /public/products following the file convention
 * so the Product images grid and storefront resolve them with no upload.
 */
async function generatePreviews(
  combos: { sizeKey: string; sizeLabel: string; heightKey: string; heightLabel: string; deckLevel: number; woodKey: string; woodLabel: string; swatch: string }[]
) {
  const dir = path.join(process.cwd(), "public", "products");
  await mkdir(dir, { recursive: true });
  await Promise.all(
    combos.map((c) => {
      const svg = productPlaceholderSvg({
        sizeLabel: c.sizeLabel,
        heightLabel: c.heightLabel,
        woodLabel: c.woodLabel,
        swatch: c.swatch,
        deckLevel: c.deckLevel,
      });
      const file = variantImagePath(c.sizeKey, c.heightKey, c.woodKey).replace("/products/", "");
      return writeFile(path.join(dir, file), svg, "utf8");
    })
  );
}

/** Revalidate storefront pages whose data comes from the catalogue/content. */
function revalidateStore() {
  revalidatePath("/");
  revalidatePath("/product");
  revalidatePath("/faq");
}

export async function advanceItemStatusAction(formData: FormData) {
  await assertAdmin();
  const itemId = String(formData.get("itemId"));
  const status = String(formData.get("status"));
  await advanceOrderItemStatus(itemId, status);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath("/account/orders");
}

export async function updatePricesAction(formData: FormData) {
  await assertAdmin();
  const updates: Promise<unknown>[] = [];
  for (const [key, value] of Array.from(formData.entries())) {
    const n = parseInt(String(value), 10);
    if (!Number.isFinite(n) || n < 0) continue;
    if (key.startsWith("price_")) {
      updates.push(prisma.variant.update({ where: { id: key.slice(6) }, data: { basePrice: n } }));
    } else if (key.startsWith("stock_")) {
      updates.push(prisma.variant.update({ where: { id: key.slice(6) }, data: { stock: n } }));
    }
  }
  await Promise.all(updates);
  revalidateStore();
  revalidatePath("/admin/products");
}

export async function addWoodAction(formData: FormData) {
  await assertAdmin();
  const label = String(formData.get("label")).trim();
  const swatch = String(formData.get("swatch") || "#C9A26B").trim();
  const delta = parseInt(String(formData.get("priceDelta") ?? "0"), 10);
  if (!label) return;
  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const existing = await prisma.wood.findUnique({ where: { key } });
  if (existing) return; // ignore duplicates
  const [count, sizes, heights] = await Promise.all([
    prisma.wood.count(),
    prisma.size.findMany(),
    prisma.height.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  await prisma.wood.create({
    data: { key, label, swatch, priceDelta: Number.isFinite(delta) ? delta : 0, sortOrder: count },
  });
  // Auto-generate previews for every size × height with the new finish.
  await generatePreviews(
    sizes.flatMap((s) =>
      heights.map((h, hi) => ({
        sizeKey: s.key,
        sizeLabel: s.label,
        heightKey: h.key,
        heightLabel: h.label,
        deckLevel: h.sortOrder ?? hi,
        woodKey: key,
        woodLabel: label,
        swatch,
      }))
    )
  );
  revalidateStore();
  revalidatePath("/admin/products");
}

export async function updateWoodsAction(formData: FormData) {
  await assertAdmin();
  const woods = await prisma.wood.findMany();
  await Promise.all(
    woods.map((w) => {
      const label = String(formData.get(`wood_label_${w.id}`) ?? w.label).trim();
      const delta = parseInt(String(formData.get(`wood_delta_${w.id}`) ?? w.priceDelta), 10);
      const active = formData.get(`wood_active_${w.id}`) === "on";
      return prisma.wood.update({
        where: { id: w.id },
        data: {
          label: label || w.label,
          priceDelta: Number.isFinite(delta) ? delta : w.priceDelta,
          active,
        },
      });
    })
  );
  revalidateStore();
  revalidatePath("/admin/products");
}

export async function deleteWoodAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const count = await prisma.wood.count();
  if (count <= 1) return; // keep at least one finish available
  await prisma.wood.deleteMany({ where: { id } });
  revalidateStore();
  revalidatePath("/admin/products");
}

export async function updateCatalogLabelsAction(formData: FormData) {
  await assertAdmin();
  const [sizes, heights] = await Promise.all([prisma.size.findMany(), prisma.height.findMany()]);
  await Promise.all([
    ...sizes.map((s) => {
      const label = String(formData.get(`size_label_${s.id}`) ?? s.label).trim();
      const dimensions = String(formData.get(`size_dim_${s.id}`) ?? s.dimensions).trim();
      return prisma.size.update({
        where: { id: s.id },
        data: { label: label || s.label, dimensions: dimensions || s.dimensions },
      });
    }),
    ...heights.map((h) => {
      const label = String(formData.get(`height_label_${h.id}`) ?? h.label).trim();
      return prisma.height.update({ where: { id: h.id }, data: { label: label || h.label } });
    }),
  ]);
  revalidateStore();
  revalidatePath("/admin/products");
}

export async function deleteSizeAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const count = await prisma.size.count();
  if (count <= 1) return; // keep at least one size
  await prisma.size.deleteMany({ where: { id } }); // cascades its variants
  revalidateStore();
  revalidatePath("/admin/products");
}

export async function addSizeAction(formData: FormData) {
  await assertAdmin();
  const label = String(formData.get("label") || "").trim();
  const dimensions = String(formData.get("dimensions") || "").trim() || "—";
  if (!label) return;
  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!key) return;
  const existing = await prisma.size.findUnique({ where: { key } });
  if (existing) return; // ignore duplicate size keys

  const [count, heights, woods, refSize] = await Promise.all([
    prisma.size.count(),
    prisma.height.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.wood.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.size.findFirst({ orderBy: { sortOrder: "asc" } }),
  ]);
  const size = await prisma.size.create({ data: { key, label, dimensions, sortOrder: count } });

  // Create a variant for every height so the new size is immediately orderable.
  // Seed its base prices from an existing size where possible, else a default.
  await Promise.all(
    heights.map(async (h) => {
      let basePrice = 4000;
      if (refSize) {
        const ref = await prisma.variant.findUnique({
          where: { sizeId_heightId: { sizeId: refSize.id, heightId: h.id } },
        });
        if (ref) basePrice = ref.basePrice;
      }
      return prisma.variant.create({
        data: { sizeId: size.id, heightId: h.id, basePrice, stock: 0 },
      });
    })
  );

  // Auto-generate the "Product images" previews for every height × wood combo.
  await generatePreviews(
    heights.flatMap((h, hi) =>
      woods.map((w) => ({
        sizeKey: key,
        sizeLabel: label,
        heightKey: h.key,
        heightLabel: h.label,
        deckLevel: h.sortOrder ?? hi,
        woodKey: w.key,
        woodLabel: w.label,
        swatch: w.swatch,
      }))
    )
  );

  revalidateStore();
  revalidatePath("/admin/products");
}

export async function upsertFaqAction(formData: FormData) {
  await assertAdmin();
  const id = (formData.get("id") as string | null) || null;
  const question = String(formData.get("question")).trim();
  const answer = String(formData.get("answer")).trim();
  if (!question || !answer) return;
  if (id) {
    await prisma.faq.update({ where: { id }, data: { question, answer } });
  } else {
    const count = await prisma.faq.count();
    await prisma.faq.create({ data: { question, answer, sortOrder: count } });
  }
  revalidatePath("/admin/content");
  revalidatePath("/faq");
}

export async function deleteFaqAction(formData: FormData) {
  await assertAdmin();
  await prisma.faq.deleteMany({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/content");
  revalidatePath("/faq");
}

export async function saveAnnouncementAction(formData: FormData) {
  await assertAdmin();
  const message = String(formData.get("message")).trim();
  const active = formData.get("active") === "on";
  const existing = await prisma.announcement.findFirst({ orderBy: { createdAt: "desc" } });
  if (existing) {
    await prisma.announcement.update({ where: { id: existing.id }, data: { message, active } });
  } else if (message) {
    await prisma.announcement.create({ data: { message, active } });
  }
  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function addVideoAction(formData: FormData) {
  await assertAdmin();
  const title = String(formData.get("title")).trim();
  const url = String(formData.get("url")).trim();
  if (!title || !url) return;
  const count = await prisma.video.count();
  await prisma.video.create({ data: { title, url, sortOrder: count } });
  revalidatePath("/admin/videos");
  revalidatePath("/assembly");
}

export async function deleteVideoAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  // Capture the URL before removing the row so we can clean up its stored file.
  const video = await prisma.video.findUnique({ where: { id } });
  // deleteMany is idempotent: a double-click or an already-removed row deletes
  // 0 records instead of throwing P2025 ("Record to delete does not exist").
  await prisma.video.deleteMany({ where: { id } });
  // Uploaded files get removed from storage; external embeds are a no-op.
  if (video) await deleteMedia(video.url);
  revalidatePath("/admin/videos");
  revalidatePath("/assembly");
}

export async function deletePhotoAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const photo = await prisma.photo.findUnique({ where: { id } });
  await prisma.photo.deleteMany({ where: { id } });
  if (photo) await deleteMedia(photo.url);
  revalidatePath("/admin/videos");
  revalidatePath("/");
}

export async function updateSettingsAction(formData: FormData) {
  await assertAdmin();
  const freightDollars = parseInt(String(formData.get("freight_dollars")), 10);
  if (Number.isFinite(freightDollars) && freightDollars >= 0) {
    await setSetting("freight_flat_cents", String(dollarsToCents(freightDollars)));
  }
  const taxMode = String(formData.get("tax_mode"));
  if (taxMode === "table" || taxMode === "stripe") await setSetting("tax_mode", taxMode);
  revalidatePath("/admin/settings");
  revalidatePath("/product");
}

export async function updateCeilingRulesAction(formData: FormData) {
  await assertAdmin();
  const rules = await prisma.ceilingRule.findMany();
  await Promise.all(
    rules.map((r) => {
      const label = String(formData.get(`ceil_label_${r.id}`) ?? r.label).trim();
      const min = parseFloat(String(formData.get(`ceil_min_${r.id}`) ?? r.minCeilingFt));
      const rationale = String(formData.get(`ceil_rationale_${r.id}`) ?? r.rationale).trim();
      return prisma.ceilingRule.update({
        where: { id: r.id },
        data: {
          label: label || r.label,
          minCeilingFt: Number.isFinite(min) ? min : r.minCeilingFt,
          rationale: rationale || r.rationale,
        },
      });
    })
  );
  revalidatePath("/admin/settings");
  revalidatePath("/product");
}

export async function updateTaxRatesAction(formData: FormData) {
  await assertAdmin();
  const rates = await prisma.taxRate.findMany();
  await Promise.all(
    rates.map((t) => {
      const pct = parseFloat(String(formData.get(`tax_${t.id}`) ?? t.ratePercent));
      return prisma.taxRate.update({
        where: { id: t.id },
        data: { ratePercent: Number.isFinite(pct) ? pct : t.ratePercent },
      });
    })
  );
  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
}

export async function addTaxRateAction(formData: FormData) {
  await assertAdmin();
  const state = String(formData.get("state")).trim().toUpperCase();
  const pct = parseFloat(String(formData.get("ratePercent")));
  if (!state || !Number.isFinite(pct)) return;
  await prisma.taxRate.upsert({
    where: { state },
    update: { ratePercent: pct },
    create: { state, ratePercent: pct },
  });
  revalidatePath("/admin/settings");
}

export async function deleteTaxRateAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const row = await prisma.taxRate.findUnique({ where: { id } });
  if (row && row.state !== "*") await prisma.taxRate.delete({ where: { id } });
  revalidatePath("/admin/settings");
}

function revalidateReviews() {
  revalidatePath("/admin/reviews");
  revalidatePath("/about");
  revalidatePath("/account/reviews");
}

export async function setReviewStatusAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["approved", "rejected", "pending"].includes(status)) return;
  // A rejected review can't stay featured.
  const featured = status === "approved" ? undefined : false;
  await prisma.review.update({ where: { id }, data: { status, ...(featured === false ? { featured: false } : {}) } });
  revalidateReviews();
}

export async function toggleReviewFeaturedAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return;
  // Only approved reviews can be featured on the About page.
  const nextFeatured = !review.featured;
  await prisma.review.update({
    where: { id },
    data: { featured: nextFeatured, status: nextFeatured ? "approved" : review.status },
  });
  revalidateReviews();
}

export async function deleteReviewAction(formData: FormData) {
  await assertAdmin();
  await prisma.review.deleteMany({ where: { id: String(formData.get("id")) } });
  revalidateReviews();
}

export async function deleteCustomerAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const user = await prisma.user.findUnique({ where: { id }, include: { orders: true } });
  if (!user || user.role === "admin") return;
  // Only allowed when the customer has no undelivered orders.
  const hasOpen = user.orders.some((o) => o.status !== "delivered");
  if (hasOpen) return;
  await prisma.user.deleteMany({ where: { id } });
  revalidatePath("/admin/customers");
}
