import dynamic from "next/dynamic";
import { booking } from "@/lib/copy";

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
    <section className="book" id="book">
      <div className="wrap book-inner relative mx-auto max-w-[480px]">
        <h2 className="book-title reveal-up mb-8">{booking.title}</h2>
        <BookingForm />
      </div>
    </section>
  );
}
