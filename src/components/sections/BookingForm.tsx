"use client";

import { useEffect, useState, type FormEvent } from "react";
import { siteConfig } from "@/lib/site-config";
import { booking, planByQuery } from "@/lib/copy";
import { resolvePlanService } from "@/lib/booking-plans";
import { bookingSchema, mapBookingFieldErrors, type BookingFormData } from "@/lib/validation";
import { HONEYPOT_FIELD } from "@/lib/spam-guard";
import { BOOKING_LIMITS } from "@/lib/booking-limits";
import { submitBooking } from "@/lib/submit-booking";
import { Button } from "@/components/ui/Button";

type FieldErrors = Partial<Record<keyof BookingFormData, string>>;

export function BookingForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [liveMessage, setLiveMessage] = useState("");
  const [service, setService] = useState(booking.serviceOptions[0]);

  useEffect(() => {
    const queryPlan = new URLSearchParams(window.location.search).get("plan");
    const mapped = resolvePlanService(planByQuery, queryPlan);
    if (mapped && (booking.serviceOptions as readonly string[]).includes(mapped)) {
      setService(mapped);
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrors({});
    setErrorMessage("");
    setLiveMessage("Sending enquiry.");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const raw = {
      name: String(formData.get("name") ?? ""),
      venue: String(formData.get("venue") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      service: String(formData.get("service") ?? ""),
      message: String(formData.get("message") ?? "") || undefined,
      [HONEYPOT_FIELD]: String(formData.get(HONEYPOT_FIELD) ?? ""),
    };

    const parsed = bookingSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors = mapBookingFieldErrors(parsed.error);
      setErrors(fieldErrors);
      setStatus("idle");
      setLiveMessage("Please fix the highlighted fields.");
      const firstErrorField = Object.keys(fieldErrors)[0] as keyof BookingFormData | undefined;
      if (firstErrorField) {
        form.querySelector<HTMLElement>(`[name="${firstErrorField}"]`)?.focus();
      }
      return;
    }

    const result = await submitBooking({
      ...parsed.data,
      [HONEYPOT_FIELD]: raw[HONEYPOT_FIELD],
    });

    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.error);
      setLiveMessage(result.error);
      return;
    }

    setStatus("success");
    setLiveMessage("Thanks. We will be in touch.");
    form.reset();
  }

  if (status === "success") {
    return (
      <div className="book-form-card rounded-[var(--radius-lg)] text-center" role="status" aria-live="polite">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[rgba(92,122,82,0.12)] text-[var(--ok)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="mb-2 font-serif text-[1.5rem] text-[var(--ink)]">Thanks. We&apos;ll be in touch.</p>
        <p className="m-0 text-[var(--muted)]">We&apos;ll reply same day.</p>
        <Button
          type="button"
          variant="ghost"
          className="mt-6"
          onClick={() => {
            setStatus("idle");
            setLiveMessage("");
          }}
        >
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </p>
      <form
        className="book-form-card relative rounded-[var(--radius-lg)] text-[var(--ink)]"
        onSubmit={handleSubmit}
        aria-label="Book a sauna clean"
        noValidate
      >
        <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="grid-2 grid gap-0 sm:grid-cols-2 sm:gap-x-4">
          <div className="field mb-4">
            <label htmlFor="name" className="mb-1.5 block text-[0.82rem] font-bold tracking-wide text-[var(--charcoal-soft)]">
              Your name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder={booking.placeholders.name}
              required
              maxLength={BOOKING_LIMITS.name}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              className="field-input"
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-[0.8rem] text-red-700" role="alert">
                {errors.name}
              </p>
            )}
          </div>
          <div className="field mb-4">
            <label htmlFor="venue" className="mb-1.5 block text-[0.82rem] font-bold tracking-wide text-[var(--charcoal-soft)]">
              Venue / business
            </label>
            <input
              id="venue"
              name="venue"
              type="text"
              autoComplete="organization"
              placeholder={booking.placeholders.venue}
              required
              maxLength={BOOKING_LIMITS.venue}
              aria-invalid={!!errors.venue}
              aria-describedby={errors.venue ? "venue-error" : undefined}
              className="field-input"
            />
            {errors.venue && (
              <p id="venue-error" className="mt-1 text-[0.8rem] text-red-700" role="alert">
                {errors.venue}
              </p>
            )}
          </div>
        </div>
        <div className="grid-2 grid gap-0 sm:grid-cols-2 sm:gap-x-4">
          <div className="field mb-4">
            <label htmlFor="email" className="mb-1.5 block text-[0.82rem] font-bold tracking-wide text-[var(--charcoal-soft)]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={booking.placeholders.email}
              required
              maxLength={BOOKING_LIMITS.email}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="field-input"
              inputMode="email"
              autoCapitalize="none"
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-[0.8rem] text-red-700" role="alert">
                {errors.email}
              </p>
            )}
          </div>
          <div className="field mb-4">
            <label htmlFor="phone" className="mb-1.5 block text-[0.82rem] font-bold tracking-wide text-[var(--charcoal-soft)]">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={siteConfig.phone}
              required
              maxLength={BOOKING_LIMITS.phone}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className="field-input"
              inputMode="tel"
            />
            {errors.phone && (
              <p id="phone-error" className="mt-1 text-[0.8rem] text-red-700" role="alert">
                {errors.phone}
              </p>
            )}
          </div>
        </div>
        <div className="field mb-4">
          <label htmlFor="stype" className="mb-1.5 block text-[0.82rem] font-bold tracking-wide text-[var(--charcoal-soft)]">
            What do you need?
          </label>
          <select
            id="stype"
            name="service"
            className="field-input"
            value={service}
            onChange={(event) => setService(event.target.value)}
          >
            {booking.serviceOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="field mb-4">
          <label htmlFor="msg" className="mb-1.5 block text-[0.82rem] font-bold tracking-wide text-[var(--charcoal-soft)]">
            Anything else? <span className="font-normal text-[var(--muted)]">(optional)</span>
          </label>
          <textarea
            id="msg"
            name="message"
            placeholder={booking.placeholders.message}
            className="field-input"
            maxLength={BOOKING_LIMITS.message}
          />
        </div>
        {status === "error" && (
          <p className="mb-3 text-[0.9rem] text-red-700" role="alert">
            {errorMessage}
          </p>
        )}
        <Button
          type="submit"
          variant="timber"
          size="lg"
          className="mt-1 w-full"
          disabled={status === "loading"}
          aria-busy={status === "loading"}
        >
          {status === "loading" ? "Sending…" : "Send enquiry"}
        </Button>
      </form>
    </>
  );
}
