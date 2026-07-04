"use client";

import { useState, type FormEvent } from "react";
import { siteConfig } from "@/lib/site-config";
import { booking } from "@/lib/copy";
import { bookingSchema, type BookingFormData } from "@/lib/validation";
import { Button } from "@/components/ui/Button";

type FieldErrors = Partial<Record<keyof BookingFormData, string>>;

export function BookingForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrors({});
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const raw = {
      name: String(formData.get("name") ?? ""),
      venue: String(formData.get("venue") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      service: String(formData.get("service") ?? ""),
      message: String(formData.get("message") ?? "") || undefined,
    };

    const parsed = bookingSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      parsed.error.errors.forEach((err) => {
        const key = err.path[0] as keyof BookingFormData;
        if (key) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      setStatus("idle");
      return;
    }

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="book-form-card rounded-[var(--radius-lg)] p-8 text-center" role="status">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[rgba(92,122,82,0.12)] text-[var(--ok)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="mb-2 font-serif text-[1.5rem] text-[var(--ink)]">Thanks. We&apos;ll be in touch.</p>
        <p className="m-0 text-[var(--muted)]">We&apos;ll reply same day.</p>
        <Button type="button" variant="ghost" className="mt-6" onClick={() => setStatus("idle")}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form
      className="book-form-card rounded-[var(--radius-lg)] p-[clamp(1.75rem,3vw,2.25rem)] text-[var(--ink)]"
      onSubmit={handleSubmit}
      aria-label="Book a sauna clean"
      noValidate
    >
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
        />
      </div>
      {status === "error" && (
        <p className="mb-3 text-[0.9rem] text-red-700" role="alert">
          {errorMessage}
        </p>
      )}
      <Button type="submit" variant="timber" size="lg" className="mt-1 w-full" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}
