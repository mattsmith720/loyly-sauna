import { NextResponse } from "next/server";
import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";
import { bookingSchema } from "@/lib/validation";

const rateLimit = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;
  entry.count += 1;
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
    }

    const { name, venue, email, phone, service, message } = parsed.data;
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

    const apiKey = process.env.RESEND_API_KEY;
    const to = siteConfig.bookingToEmails;

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
