import Image from "next/image";
import { proof } from "@/lib/copy";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/image-config";

export function ProofBand() {
  return (
    <section className="proof-band" aria-label="Photo-documented sauna cleaning">
      <div className="proof-grid grid grid-cols-2 md:grid-cols-4">
        {proof.photos.map((photo) => (
          <div key={photo.src} className="proof-photo group relative aspect-[3/4] overflow-hidden md:aspect-[4/5]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover proof-ken-burns"
              sizes={IMAGE_SIZES.gallery}
              loading="lazy"
              quality={IMAGE_QUALITY.gallery}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--charcoal-deep)]/40 via-transparent to-[var(--charcoal-deep)]/10 transition-opacity duration-300 group-hover:opacity-60" />
          </div>
        ))}
      </div>
      <p className="proof-line reveal-up m-0 px-5 py-8 text-center font-serif text-[clamp(1.15rem,3.2vw,1.75rem)] font-medium leading-snug text-[var(--cream)] sm:px-6 sm:py-10">
        {proof.line}
      </p>
    </section>
  );
}
