import { describe, expect, it, vi } from "vitest";
import { BOOKING_REQUEST_TIMEOUT_MS, submitBooking } from "./submit-booking";

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  return vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: response.json ?? (async () => ({})),
  }) as typeof fetch;
}

describe("submitBooking", () => {
  it("returns ok on successful response", async () => {
    const fetchImpl = mockFetch({ ok: true, json: async () => ({ ok: true, mode: "dev" }) });
    const result = await submitBooking({ name: "Matt" }, { fetchImpl });
    expect(result).toEqual({ ok: true, mode: "dev" });
  });

  it("returns server error message", async () => {
    const fetchImpl = mockFetch({
      ok: false,
      status: 429,
      json: async () => ({ error: "Too many requests. Please try again shortly." }),
    });
    const result = await submitBooking({ name: "Matt" }, { fetchImpl });
    expect(result).toEqual({
      ok: false,
      error: "Too many requests. Please try again shortly.",
      status: 429,
    });
  });

  it("handles non-json error responses", async () => {
    const fetchImpl = mockFetch({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    });
    const result = await submitBooking({ name: "Matt" }, { fetchImpl });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(502);
    }
  });

  it("returns timeout message on abort", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(Object.assign(new Error("Aborted"), { name: "AbortError" }));
    const result = await submitBooking({ name: "Matt" }, { fetchImpl, timeoutMs: 1 });
    expect(result).toEqual({
      ok: false,
      error: "Request timed out. Please check your connection and try again.",
    });
  });

  it("uses default timeout constant", () => {
    expect(BOOKING_REQUEST_TIMEOUT_MS).toBeGreaterThan(0);
  });
});
