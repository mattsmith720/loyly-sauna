export const BOOKING_LIMITS = {
  name: 120,
  venue: 160,
  email: 254,
  phone: 20,
  message: 2000,
} as const;

export const BOOKING_REQUEST_TIMEOUT_MS = 15_000;

/** Upper bound for JSON booking payloads sent to /api/book. */
export const MAX_BOOKING_BODY_BYTES = 8_192;
