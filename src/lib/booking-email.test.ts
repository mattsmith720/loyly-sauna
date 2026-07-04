import { describe, expect, it } from "vitest";
import { formatBookingEnquiryEmail } from "./booking-email";
import { booking } from "./copy";

describe("formatBookingEnquiryEmail", () => {
  it("formats subject and body for a booking enquiry", () => {
    const result = formatBookingEnquiryEmail({
      name: "Matt Smith",
      venue: "Recovery Studio Brisbane",
      email: "matt@example.com",
      phone: "0407733940",
      service: booking.serviceOptions[0],
      message: "Cedar sauna in New Farm",
    });

    expect(result.subject).toBe("New booking enquiry: Standard · Weekly · 1-2 saunas (Recovery Studio Brisbane)");
    expect(result.text).toContain("Name: Matt Smith");
    expect(result.text).toContain("Message: Cedar sauna in New Farm");
    expect(result.text).toContain("Submitted from https://loylyco.com.au");
  });

  it("omits empty message lines", () => {
    const result = formatBookingEnquiryEmail({
      name: "Matt Smith",
      venue: "Recovery Studio Brisbane",
      email: "matt@example.com",
      phone: "0407733940",
      service: booking.serviceOptions[0],
    });

    expect(result.text).not.toContain("Message:");
  });
});
