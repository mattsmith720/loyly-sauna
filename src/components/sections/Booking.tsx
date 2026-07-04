import { booking } from "@/lib/copy";
import { BookingForm } from "@/components/sections/BookingForm";

export function Booking() {
  return (
    <section className="book" id="book">
      <div className="wrap relative mx-auto max-w-[480px] py-[clamp(3rem,6vw,4.5rem)]">
        <h2 className="book-title mb-8 text-center">{booking.title}</h2>
        <BookingForm />
      </div>
    </section>
  );
}
