import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Minimal fixed-window in-memory rate limiter. Returns true if the action is
 * allowed, false once the caller has exceeded `max` events within `windowMs`.
 *
 * Sized for a single-instance deployment (our PM2 setup): state is per-process,
 * so behind multiple instances each tracks its own window. Move to a shared
 * store (e.g. Redis) if the app is ever scaled horizontally.
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    // Opportunistically prune expired buckets so the map can't grow unbounded
    // from a flood of distinct keys (e.g. spoofed IPs).
    if (buckets.size > 5000) {
      buckets.forEach((b, k) => {
        if (now >= b.resetAt) buckets.delete(k);
      });
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

/** Extracts the client IP from proxy headers (Caddy sets X-Forwarded-For). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
