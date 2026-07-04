import { z } from "zod";
import { booking } from "@/lib/copy";

export const bookingSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  venue: z.string().min(2, "Please enter your venue or business"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  service: z
    .string()
    .refine((val) => (booking.serviceOptions as readonly string[]).includes(val), "Please select a service"),
  message: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
