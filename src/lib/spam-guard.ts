/** Hidden form field name. Must stay empty; bots that fill it are silently discarded. */
export const HONEYPOT_FIELD = "website";

export function isHoneypotTripped(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const value = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim().length > 0;
}
