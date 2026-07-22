"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function submitReviewAction(formData: FormData) {
  const su = await getSessionUser();
  if (!su?.id) return;

  const body = String(formData.get("body") || "").trim();
  if (!body) return;
  const rating = Math.min(5, Math.max(1, parseInt(String(formData.get("rating") || "5"), 10) || 5));
  const title = String(formData.get("title") || "").trim() || null;

  // Only customers with a delivered order may leave a review (verified purchase).
  const delivered = await prisma.order.findFirst({
    where: { userId: su.id, status: "delivered" },
    select: { id: true },
  });
  if (!delivered) return;
  const user = await prisma.user.findUnique({ where: { id: su.id } });

  await prisma.review.create({
    data: {
      userId: su.id,
      orderId: delivered.id,
      authorName: user?.name ?? "Customer",
      rating,
      title,
      body,
      status: "pending",
    },
  });

  revalidatePath("/account/reviews");
  revalidatePath("/admin/reviews");
}
