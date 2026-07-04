import { z } from "zod";
import { booking } from "@/lib/copy";
import { isValidAuPhone } from "@/lib/phone";
import { BOOKING_LIMITS } from "@/lib/booking-limits";

export const bookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(BOOKING_LIMITS.name, "Name is too long"),
  venue: z
    .string()
    .trim()
    .min(2, "Please enter your venue or business")
    .max(BOOKING_LIMITS.venue, "Venue name is too long"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email")
    .max(BOOKING_LIMITS.email, "Email is too long"),
  phone: z
    .string()
    .trim()
    .min(8, "Please enter a valid phone number")
    .max(BOOKING_LIMITS.phone, "Phone number is too long")
    .refine(isValidAuPhone, "Please enter a valid Australian phone number"),
  service: z
    .string()
    .refine((val) => (booking.serviceOptions as readonly string[]).includes(val), "Please select a service"),
  message: z
    .string()
    .trim()
    .max(BOOKING_LIMITS.message, "Message is too long")
    .optional()
    .transform((value) => value || undefined),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export function mapBookingFieldErrors(error: z.ZodError): Partial<Record<keyof BookingFormData, string>> {
  const fieldErrors: Partial<Record<keyof BookingFormData, string>> = {};
  error.errors.forEach((issue) => {
    const key = issue.path[0] as keyof BookingFormData;
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  });
  return fieldErrors;
}
