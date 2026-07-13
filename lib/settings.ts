import "server-only";
import { prisma } from "@/lib/db";

/** Simple key/value settings access. */
export async function getSetting(key: string, fallback = ""): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/** Flat freight charge in cents (placeholder until live carrier rates in M3). */
export async function getFreightCents(): Promise<number> {
  const v = await getSetting("freight_flat_cents", "45000");
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 45000;
}
