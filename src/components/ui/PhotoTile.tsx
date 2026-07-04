import Image from "next/image";
import { cn } from "@/lib/utils";

type PhotoTileProps = {
  src: string;
  alt: string;
  title: string;
  subtitle?: string;
  className?: string;
  tall?: boolean;
};

export function PhotoTile({ src, alt, title, subtitle, className, tall }: PhotoTileProps) {
  return (
    <figure
      className={cn(
        "group relative m-0 overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--charcoal)] shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      <div className={cn("relative w-full overflow-hidden", tall ? "aspect-[3/4]" : "aspect-[4/3]")}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/85 via-[#1a1510]/25 to-transparent" />
      </div>
      <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <strong className="block font-serif text-[1.05rem] text-white sm:text-[1.15rem]">{title}</strong>
        {subtitle && <span className="mt-1 block text-[0.82rem] text-[#d8cfc2]">{subtitle}</span>}
      </figcaption>
    </figure>
  );
}
