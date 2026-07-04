import { describe, expect, it, beforeEach } from "vitest";
import {
  getBookingToEmails,
  getRateLimitRetryAfterSeconds,
  isBodyTooLarge,
  isJsonRequest,
  isRateLimited,
  RATE_LIMIT,
  resetRateLimitForTests,
} from "./booking-api";
import { siteConfig } from "./site-config";

describe("isRateLimited", () => {
  beforeEach(() => {
    resetRateLimitForTests();
  });

  it("allows requests under the limit", () => {
    const ip = "203.0.113.1";
    for (let i = 0; i < RATE_LIMIT; i += 1) {
      expect(isRateLimited(ip, 1_000)).toBe(false);
    }
  });

  it("blocks requests over the limit within the window", () => {
    const ip = "203.0.113.2";
    for (let i = 0; i < RATE_LIMIT; i += 1) {
      isRateLimited(ip, 1_000);
    }
    expect(isRateLimited(ip, 1_000)).toBe(true);
  });

  it("resets after the window expires", () => {
    const ip = "203.0.113.3";
    for (let i = 0; i < RATE_LIMIT; i += 1) {
      isRateLimited(ip, 1_000);
    }
    expect(isRateLimited(ip, 61_000)).toBe(false);
  });
});

describe("getRateLimitRetryAfterSeconds", () => {
  beforeEach(() => {
    resetRateLimitForTests();
  });

  it("returns remaining seconds while rate limited", () => {
    const ip = "203.0.113.4";
    for (let i = 0; i < RATE_LIMIT; i += 1) {
      isRateLimited(ip, 1_000);
    }
    expect(getRateLimitRetryAfterSeconds(ip, 1_000)).toBe(60);
    expect(getRateLimitRetryAfterSeconds(ip, 31_000)).toBe(30);
  });

  it("returns zero when not rate limited", () => {
    expect(getRateLimitRetryAfterSeconds("203.0.113.5", 1_000)).toBe(0);
  });
});

describe("isBodyTooLarge", () => {
  it("returns false when content-length is absent", () => {
    const request = new Request("http://localhost/api/book", { method: "POST" });
    expect(isBodyTooLarge(request)).toBe(false);
  });

  it("returns true when content-length exceeds the cap", () => {
    const request = new Request("http://localhost/api/book", {
      method: "POST",
      headers: { "content-length": "9000" },
    });
    expect(isBodyTooLarge(request)).toBe(true);
  });
});

describe("isJsonRequest", () => {
  it("accepts application/json content type", () => {
    const request = new Request("http://localhost/api/book", {
      method: "POST",
      headers: { "content-type": "application/json" },
    });
    expect(isJsonRequest(request)).toBe(true);
  });

  it("rejects missing or invalid content type", () => {
    const missing = new Request("http://localhost/api/book", { method: "POST" });
    const invalid = new Request("http://localhost/api/book", {
      method: "POST",
      headers: { "content-type": "text/plain" },
    });
    expect(isJsonRequest(missing)).toBe(false);
    expect(isJsonRequest(invalid)).toBe(false);
  });
});

describe("getBookingToEmails", () => {
  it("falls back to default contacts", () => {
    const original = process.env.BOOKING_TO_EMAIL;
    delete process.env.BOOKING_TO_EMAIL;
    expect(getBookingToEmails()).toEqual([...siteConfig.emails]);
    if (original) process.env.BOOKING_TO_EMAIL = original;
  });

  it("falls back when env override is empty", () => {
    const original = process.env.BOOKING_TO_EMAIL;
    process.env.BOOKING_TO_EMAIL = "  , ";
    expect(getBookingToEmails()).toEqual([...siteConfig.emails]);
    if (original) process.env.BOOKING_TO_EMAIL = original;
    else delete process.env.BOOKING_TO_EMAIL;
  });

  it("parses comma-separated env override", () => {
    const original = process.env.BOOKING_TO_EMAIL;
    process.env.BOOKING_TO_EMAIL = "one@example.com, two@example.com ";
    expect(getBookingToEmails()).toEqual(["one@example.com", "two@example.com"]);
    if (original) process.env.BOOKING_TO_EMAIL = original;
    else delete process.env.BOOKING_TO_EMAIL;
  });
});
