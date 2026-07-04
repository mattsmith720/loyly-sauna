import { describe, expect, it } from "vitest";
import { BOOKING_LIMITS } from "./booking-limits";
import { bookingSchema, mapBookingFieldErrors } from "./validation";
import { booking } from "./copy";

const validPayload = {
  name: "Matt Smith",
  venue: "Recovery Studio Brisbane",
  email: "matt@example.com",
  phone: "0407733940",
  service: booking.serviceOptions[0],
};

describe("bookingSchema", () => {
  it("accepts valid booking data", () => {
    const result = bookingSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts optional message", () => {
    const result = bookingSchema.safeParse({ ...validPayload, message: "Cedar sauna in New Farm" });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = bookingSchema.safeParse({ ...validPayload, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = bookingSchema.safeParse({ ...validPayload, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects short phone", () => {
    const result = bookingSchema.safeParse({ ...validPayload, phone: "123" });
    expect(result.success).toBe(false);
  });

  it("accepts formatted Australian mobile numbers", () => {
    const result = bookingSchema.safeParse({ ...validPayload, phone: "0407 733 940" });
    expect(result.success).toBe(true);
  });

  it("rejects non-Australian phone numbers", () => {
    const result = bookingSchema.safeParse({ ...validPayload, phone: "0100000000" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown service option", () => {
    const result = bookingSchema.safeParse({ ...validPayload, service: "Window cleaning" });
    expect(result.success).toBe(false);
  });

  it("accepts every configured service option", () => {
    for (const service of booking.serviceOptions) {
      const result = bookingSchema.safeParse({ ...validPayload, service });
      expect(result.success).toBe(true);
    }
  });

  it("trims whitespace from fields", () => {
    const result = bookingSchema.safeParse({
      ...validPayload,
      name: "  Matt Smith  ",
      email: " matt@example.com ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Matt Smith");
      expect(result.data.email).toBe("matt@example.com");
    }
  });

  it("rejects messages over 2000 characters", () => {
    const result = bookingSchema.safeParse({
      ...validPayload,
      message: "a".repeat(BOOKING_LIMITS.message + 1),
    });
    expect(result.success).toBe(false);
  });

  it("treats blank optional message as undefined", () => {
    const result = bookingSchema.safeParse({ ...validPayload, message: "   " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBeUndefined();
    }
  });
});

describe("mapBookingFieldErrors", () => {
  it("maps the first error per field", () => {
    const result = bookingSchema.safeParse({ ...validPayload, email: "bad", phone: "123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = mapBookingFieldErrors(result.error);
      expect(errors.email).toBeTruthy();
      expect(errors.phone).toBeTruthy();
    }
  });
});
