import Image from "next/image";
import { beforeAfter } from "@/lib/copy";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type BeforeAfterCardProps = {
  variant?: "default" | "hero";
};

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function BeforeAfterCard({ variant = "hero" }: BeforeAfterCardProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "report overflow-hidden border bg-[var(--white-warm)]",
        isHero
          ? "rounded-none border-[var(--line)] sm:rounded-[var(--radius-lg)]"
          : "rounded-[var(--radius-lg)] border-[var(--line)] shadow-[var(--shadow-md)]",
      )}
      aria-label="Before and after sauna cleaning"
    >
      <div className="ba relative grid grid-cols-2">
        <div className="ba-divider hidden sm:block" aria-hidden="true" />
        <div className="ba-arrow hidden sm:grid" aria-hidden="true">
          <ArrowIcon />
        </div>
        <figure className="relative m-0">
          <div className={cn("panel relative overflow-hidden", isHero ? "aspect-[5/4] sm:aspect-[4/3] lg:aspect-[5/4]" : "aspect-[4/3]")}>
            <Image
              src={siteConfig.images.before}
              alt={`${beforeAfter.beforeLabel}: ${beforeAfter.beforeCaption}`}
              fill
              className="object-cover"
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 45vw, 520px"
              priority
              fetchPriority="high"
              quality={75}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/50 via-transparent to-transparent" />
            <figcaption className="ba-label absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white sm:text-[0.65rem]">
              {beforeAfter.beforeLabel}
            </figcaption>
            <span className="absolute bottom-2.5 left-2.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white drop-shadow-md sm:bottom-3 sm:left-3 sm:text-[0.72rem]">
              {beforeAfter.beforeCaption}
            </span>
          </div>
        </figure>
        <figure className="relative m-0">
          <div className={cn("panel relative overflow-hidden", isHero ? "aspect-[5/4] sm:aspect-[4/3] lg:aspect-[5/4]" : "aspect-[4/3]")}>
            <Image
              src={siteConfig.images.after}
              alt={`${beforeAfter.afterLabel}: ${beforeAfter.afterCaption}`}
              fill
              className="object-cover"
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 45vw, 520px"
              loading="lazy"
              quality={72}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/35 via-transparent to-transparent" />
            <figcaption className="ba-label absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white sm:text-[0.65rem]">
              {beforeAfter.afterLabel}
            </figcaption>
            <span className="absolute bottom-2.5 left-2.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white drop-shadow-md sm:bottom-3 sm:left-3 sm:text-[0.72rem]">
              {beforeAfter.afterCaption}
            </span>
          </div>
        </figure>
      </div>
    </div>
  );
}
