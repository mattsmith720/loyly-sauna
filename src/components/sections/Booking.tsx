"use client";

import { booking } from "@/lib/copy";
import { BookingForm } from "@/components/sections/BookingForm";
import { Reveal } from "@/components/motion/Reveal";

export function Booking() {
  return (
    <section className="book" id="book">
      <div className="wrap relative mx-auto max-w-[480px] py-[clamp(3rem,6vw,4.5rem)]">
        <Reveal as="h2" className="book-title mb-8 text-center">
          {booking.title}
        </Reveal>
        <Reveal delay={0.08}>
          <BookingForm />
        </Reveal>
      </div>
    </section>
  );
}
