import type { BookingFormData } from "@/lib/validation";
import { siteConfig } from "@/lib/site-config";

export function formatBookingEnquiryEmail(data: BookingFormData): { subject: string; text: string } {
  const { name, venue, email, phone, service, message } = data;
  const subject = `New booking enquiry: ${service} (${venue})`;
  const text = [
    `Name: ${name}`,
    `Venue: ${venue}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Service: ${service}`,
    message ? `Message: ${message}` : "",
    "",
    `Submitted from ${siteConfig.url}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, text };
}
