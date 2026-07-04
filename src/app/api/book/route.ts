import { NextResponse } from "next/server";
import { Resend } from "resend";
import { bookingSchema } from "@/lib/validation";
import { isHoneypotTripped } from "@/lib/spam-guard";
import { getBookingToEmails, getClientIp, getRateLimitRetryAfterSeconds, isBodyTooLarge, isJsonRequest, isRateLimited } from "@/lib/booking-api";
import { formatBookingEnquiryEmail } from "@/lib/booking-email";

export async function POST(request: Request) {
  try {
    if (isBodyTooLarge(request)) {
      return NextResponse.json({ error: "Request body too large." }, { status: 413 });
    }

    if (!isJsonRequest(request)) {
      return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
    }

    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      const retryAfter = getRateLimitRetryAfterSeconds(ip);
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: retryAfter > 0 ? { "Retry-After": String(retryAfter) } : undefined,
        },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    if (isHoneypotTripped(body)) {
      return NextResponse.json({ ok: true });
    }

    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
    }

    const { email } = parsed.data;
    const { subject, text } = formatBookingEnquiryEmail(parsed.data);

    const apiKey = process.env.RESEND_API_KEY;
    const to = getBookingToEmails();

    if (to.length === 0) {
      console.error("[booking] No booking recipients configured.");
      return NextResponse.json({ error: "Failed to send enquiry. Please email us directly." }, { status: 502 });
    }

    if (!apiKey) {
      console.info("[booking] Dev mode: no RESEND_API_KEY. Enquiry logged:\n", text);
      return NextResponse.json({ ok: true, mode: "dev" });
    }

    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL ?? "bookings@loylyco.com.au";

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject,
      text,
    });

    if (error) {
      console.error("[booking] Resend error:", error);
      return NextResponse.json({ error: "Failed to send enquiry. Please email us directly." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[booking] Unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
