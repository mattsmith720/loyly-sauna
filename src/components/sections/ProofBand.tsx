"use client";

import Image from "next/image";
import { proof } from "@/lib/copy";
import { Reveal } from "@/components/motion/Reveal";

export function ProofBand() {
  return (
    <section className="proof-band bg-[var(--charcoal)]" aria-label="Photo-documented sauna cleaning">
      <div className="proof-grid grid grid-cols-2 md:grid-cols-4">
        {proof.photos.map((photo, i) => (
          <div key={photo.src} className="proof-photo group relative aspect-[3/4] overflow-hidden md:aspect-[4/5]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, 25vw"
              priority={i < 2}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/40 via-transparent to-[#1a1510]/10 transition-opacity duration-300 group-hover:opacity-60" />
          </div>
        ))}
      </div>
      <Reveal as="p" className="proof-line m-0 px-6 py-8 text-center font-serif text-[clamp(1.2rem,3.2vw,1.75rem)] font-medium leading-snug text-[var(--cream)] sm:py-10">
        {proof.line}
      </Reveal>
    </section>
  );
}
