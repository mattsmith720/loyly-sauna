import { BOOKING_REQUEST_TIMEOUT_MS } from "@/lib/booking-limits";

export { BOOKING_LIMITS, BOOKING_REQUEST_TIMEOUT_MS } from "@/lib/booking-limits";

export type SubmitBookingPayload = Record<string, unknown>;

export type SubmitBookingResult =
  | { ok: true; mode?: string }
  | { ok: false; error: string; status?: number };

type SubmitBookingOptions = {
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export async function submitBooking(
  payload: SubmitBookingPayload,
  options: SubmitBookingOptions = {},
): Promise<SubmitBookingResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? BOOKING_REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let data: { error?: string; mode?: string } = {};
    try {
      data = (await res.json()) as { error?: string; mode?: string };
    } catch {
      if (!res.ok) {
        return {
          ok: false,
          error: "Something went wrong. Please try again.",
          status: res.status,
        };
      }
    }

    if (!res.ok) {
      return {
        ok: false,
        error: data.error ?? "Something went wrong. Please try again.",
        status: res.status,
      };
    }

    return { ok: true, mode: data.mode };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return {
        ok: false,
        error: "Request timed out. Please check your connection and try again.",
      };
    }

    return { ok: false, error: "Something went wrong. Please try again." };
  } finally {
    clearTimeout(timeoutId);
  }
}
