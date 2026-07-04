import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  /** Light text for dark backgrounds (footer). */
  inverted?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "text-[1.2rem]",
  md: "text-[1.45rem]",
  lg: "text-[1.65rem]",
};

export function BrandMark({ className, inverted = false, size = "md" }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "brand-mark inline-flex items-baseline gap-1.5 font-serif font-semibold tracking-[0.02em]",
        sizeClasses[size],
        inverted ? "text-[var(--cream)]" : "text-[var(--ink)]",
        className,
      )}
    >
      LÖYLY<span className="text-[var(--timber)]">.</span>{" "}
      <small
        className={cn(
          "self-center font-sans text-[0.58rem] font-bold uppercase tracking-[0.32em]",
          inverted ? "text-[var(--footer-muted)]" : "text-[var(--muted)]",
        )}
      >
        CO.
      </small>
    </span>
  );
}
