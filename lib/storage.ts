import "server-only";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

/**
 * Media storage abstraction (Milestone 3).
 *
 * Dev uses the local filesystem (served via the /media route). In production,
 * uploads go to durable object storage — Cloudinary here. Set CLOUDINARY_URL
 * (or the CLOUDINARY_* vars) to switch automatically; nothing else in the app
 * changes because callers only see the returned URL.
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

/**
 * Deletes a previously-saved media asset, routing by the stored URL rather than
 * the currently-configured provider — so assets uploaded under a different
 * provider (e.g. local files created before Cloudinary was enabled) still get
 * cleaned up. External embeds (YouTube/Vimeo, etc.) and unknown hosts are
 * no-ops. Never throws: storage cleanup failing should not block deleting the
 * database row that referenced it.
 */
export async function deleteMedia(url: string): Promise<void> {
  if (!url) return;
  try {
    // Local file, served by the /media route from public/uploads.
    if (url.startsWith("/media/")) {
      const safe = path.basename(url.slice("/media/".length)); // guard traversal
      if (!safe) return;
      await unlink(path.join(process.cwd(), "public", "uploads", safe)).catch((e) => {
        if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; // ignore "already gone"
      });
      return;
    }
    // Cloudinary-hosted asset.
    if (/^https?:\/\/res\.cloudinary\.com\//i.test(url)) {
      const cfg = cloudinaryConfig();
      if (cfg) await destroyCloudinary(cfg, url);
      return;
    }
    // Anything else (external embed / unknown host) — nothing to delete.
  } catch (err) {
    console.error(`[storage] failed to delete media ${url}:`, err);
  }
}

/**
 * Parses a Cloudinary delivery URL into the `resource_type` and `public_id`
 * needed by the destroy API. Uploads from `save()` carry no transformations, so
 * the form is: .../<cloud>/<resource_type>/upload/v<version>/<public_id>.<ext>
 */
function parseCloudinaryUrl(url: string): { resourceType: string; publicId: string } | null {
  const m = url.match(/res\.cloudinary\.com\/[^/]+\/([^/]+)\/upload\/(.+)$/i);
  if (!m) return null;
  const resourceType = m[1]; // "image" | "video" | "raw"
  const rest = m[2].replace(/^v\d+\//, ""); // strip the version segment
  // public_id excludes the file extension for image/video (raw keeps it).
  const publicId = resourceType === "raw" ? rest : rest.replace(/\.[^/.]+$/, "");
  return { resourceType, publicId };
}

async function destroyCloudinary(cfg: CloudinaryConfig, url: string): Promise<void> {
  const parsed = parseCloudinaryUrl(url);
  if (!parsed) return;
  const { resourceType, publicId } = parsed;

  const timestamp = Math.round(Date.now() / 1000);
  // Cloudinary signs the alphabetically-sorted param string + the api secret.
  const toSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(toSign + cfg.apiSecret).digest("hex");

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("api_key", cfg.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/${resourceType}/destroy`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`[cloudinary] destroy failed (${res.status}) for ${publicId}: ${detail}`);
  }
  // A successful call returns { result: "ok" } — or { result: "not found" } if
  // the asset was already gone, which is fine for our purposes.
}
