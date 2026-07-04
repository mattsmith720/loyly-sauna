import { siteConfig } from "@/lib/site-config";
import { MAX_BOOKING_BODY_BYTES } from "@/lib/booking-limits";

const rateLimit = new Map<string, { count: number; reset: number }>();

export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 60_000;
export const MAX_BODY_BYTES = MAX_BOOKING_BODY_BYTES;

export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export function isBodyTooLarge(request: Request): boolean {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return false;
  const size = Number.parseInt(contentLength, 10);
  return Number.isFinite(size) && size > MAX_BODY_BYTES;
}

export function isJsonRequest(request: Request): boolean {
  const contentType = request.headers.get("content-type");
  if (!contentType) return false;
  return contentType.toLowerCase().includes("application/json");
}

function pruneExpiredEntries(now: number) {
  for (const [key, entry] of rateLimit) {
    if (now >= entry.reset) rateLimit.delete(key);
  }
}

export function isRateLimited(ip: string, now = Date.now()): boolean {
  pruneExpiredEntries(now);
  const entry = rateLimit.get(ip);

  if (!entry || now >= entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;
  entry.count += 1;
  return false;
}

export function getRateLimitRetryAfterSeconds(ip: string, now = Date.now()): number {
  const entry = rateLimit.get(ip);
  if (!entry || now >= entry.reset) return 0;
  return Math.max(1, Math.ceil((entry.reset - now) / 1000));
}

export function getBookingToEmails(): string[] {
  const fromEnv = process.env.BOOKING_TO_EMAIL?.split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return [...siteConfig.emails];
}

export function resetRateLimitForTests() {
  rateLimit.clear();
}
