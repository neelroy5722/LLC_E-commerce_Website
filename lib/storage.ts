import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

/**
 * Media storage abstraction (Milestone 3).
 *
 * Dev uses the local filesystem (served via the /media route). Production on
 * Railway has an ephemeral filesystem, so uploads must go to durable object
 * storage — Cloudinary here. Set CLOUDINARY_URL (or the CLOUDINARY_* vars) to
 * switch automatically; nothing else in the app changes because callers only
 * see the returned URL.
 */

export interface SaveInput {
  data: Buffer;
  filename: string;
  contentType: string;
  folder?: string; // logical folder, e.g. "products" | "photos" | "videos"
}

export interface SavedMedia {
  url: string;
  provider: string;
}

export interface StorageProvider {
  readonly name: string;
  save(input: SaveInput): Promise<SavedMedia>;
}

/** Local filesystem provider — writes to /public/uploads, served by the /media route. */
class LocalStorageProvider implements StorageProvider {
  readonly name = "local";
  async save({ data, filename }: SaveInput): Promise<SavedMedia> {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), data);
    return { url: `/media/${filename}`, provider: this.name };
  }
}

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

function cloudinaryConfig(): CloudinaryConfig | null {
  const url = process.env.CLOUDINARY_URL;
  if (url) {
    // cloudinary://<api_key>:<api_secret>@<cloud_name>
    const m = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (m) return { apiKey: m[1], apiSecret: m[2], cloudName: m[3] };
  }
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret };
  return null;
}

/** Cloudinary provider — signed uploads via the REST API (no SDK dependency). */
class CloudinaryStorageProvider implements StorageProvider {
  readonly name = "cloudinary";
  constructor(private readonly cfg: CloudinaryConfig) {}

  async save({ data, filename, contentType, folder }: SaveInput): Promise<SavedMedia> {
    const timestamp = Math.round(Date.now() / 1000);
    const publicFolder = `victory-martin/${folder ?? "uploads"}`;
    // Cloudinary signs an alphabetically-sorted param string + the api secret.
    const toSign = `folder=${publicFolder}&timestamp=${timestamp}`;
    const signature = createHash("sha1").update(toSign + this.cfg.apiSecret).digest("hex");

    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(data)], { type: contentType }), filename);
    form.append("api_key", this.cfg.apiKey);
    form.append("timestamp", String(timestamp));
    form.append("folder", publicFolder);
    form.append("signature", signature);

    // "auto" handles images and video.
    const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cfg.cloudName}/auto/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Cloudinary upload failed (${res.status}): ${detail}`);
    }
    const json = (await res.json()) as { secure_url?: string };
    if (!json.secure_url) throw new Error("Cloudinary upload returned no URL");
    return { url: json.secure_url, provider: this.name };
  }
}

let cached: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (cached) return cached;
  const cfg = cloudinaryConfig();
  cached = cfg ? new CloudinaryStorageProvider(cfg) : new LocalStorageProvider();
  return cached;
}

/** Save a media buffer with the configured provider and return its URL. */
export async function saveMedia(input: SaveInput): Promise<SavedMedia> {
  return getStorage().save(input);
}
