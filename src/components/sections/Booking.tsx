import dynamic from "next/dynamic";
import { booking } from "@/lib/copy";
import { siteConfig } from "@/lib/site-config";
import { ContactEmails } from "@/components/ui/ContactEmails";

const BookingForm = dynamic(() => import("@/components/sections/BookingForm").then((mod) => mod.BookingForm), {
  loading: () => (
    <div
      className="book-form-card rounded-[var(--radius-lg)] min-h-[28rem] animate-pulse bg-[var(--cream)]"
      aria-hidden="true"
    />
  ),
});

export function Booking() {
  return (
    <section className="book" id="book" aria-labelledby="book-title">
      <div className="wrap book-inner relative mx-auto max-w-[480px]">
        <div className="book-intro reveal-up mb-8 text-center">
          <span className="offer-badge">{booking.offerBadge}</span>
          <h2 id="book-title" className="book-title mt-4">
            {booking.title}
          </h2>
          <p className="book-lead mx-auto mt-3">{booking.intro}</p>
          <ul className="book-list mx-auto mt-5">
            {booking.bullets.map((bullet) => (
              <li key={bullet}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <BookingForm />
        <p className="book-talk mt-5 text-center">
          {booking.talkPrompt} Call{" "}
          <a href={`tel:${siteConfig.phoneTel}`}>{siteConfig.phone}</a> or email{" "}
          <ContactEmails showNames={false} />
        </p>
      </div>
    </section>
  );
}
