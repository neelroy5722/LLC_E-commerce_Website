"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function updateProfile(formData: FormData) {
  const su = await getSessionUser();
  if (!su?.id) return;

  const str = (k: string) => (formData.get(k) as string | null)?.trim() || null;

  await prisma.user.update({
    where: { id: su.id },
    data: {
      name: str("name") ?? su.name ?? "",
      phone: str("phone"),
      addressLine1: str("line1"),
      city: str("city"),
      state: str("state")?.toUpperCase() || null,
      zip: str("zip"),
    },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account");
}
