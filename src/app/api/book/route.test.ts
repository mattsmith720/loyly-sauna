import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "./route";
import { booking } from "@/lib/copy";
import { resetRateLimitForTests, RATE_LIMIT } from "@/lib/booking-api";

const validPayload = {
  name: "Matt Smith",
  venue: "Recovery Studio Brisbane",
  email: "matt@example.com",
  phone: "0407733940",
  service: booking.serviceOptions[0],
};

function makeRequest(body: unknown, options: { ip?: string; contentLength?: string } = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-forwarded-for": options.ip ?? "127.0.0.1",
  };

  if (options.contentLength) {
    headers["content-length"] = options.contentLength;
  }

  return new Request("http://localhost/api/book", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/book", () => {
  beforeEach(() => {
    resetRateLimitForTests();
  });

  it("returns 415 for non-json content type", async () => {
    const res = await POST(
      new Request("http://localhost/api/book", {
        method: "POST",
        headers: { "content-type": "text/plain", "x-forwarded-for": "127.0.0.1" },
        body: "hello",
      }),
    );
    expect(res.status).toBe(415);
    const data = await res.json();
    expect(data.error).toBe("Content-Type must be application/json.");
  });

  it("returns 413 for oversized payloads", async () => {
    const res = await POST(makeRequest(validPayload, { contentLength: "9000" }));
    expect(res.status).toBe(413);
    const data = await res.json();
    expect(data.error).toBe("Request body too large.");
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await POST(makeRequest("{not json"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid request body.");
  });

  it("returns 400 for invalid form data", async () => {
    const res = await POST(makeRequest({ ...validPayload, email: "bad" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid form data.");
  });

  it("silently accepts honeypot submissions", async () => {
    const res = await POST(makeRequest({ ...validPayload, website: "https://spam.example" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.mode).toBeUndefined();
  });

  it("returns 429 when rate limit is exceeded", async () => {
    for (let i = 0; i < RATE_LIMIT; i += 1) {
      await POST(makeRequest(validPayload, { ip: "203.0.113.99" }));
    }

    const res = await POST(makeRequest(validPayload, { ip: "203.0.113.99" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
    const data = await res.json();
    expect(data.error).toBe("Too many requests. Please try again shortly.");
  });

  it("returns ok in dev mode when RESEND_API_KEY is unset", async () => {
    const original = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.mode).toBe("dev");

    if (original) process.env.RESEND_API_KEY = original;
  });
});
