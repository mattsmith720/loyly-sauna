import { cn } from "@/lib/utils";

type SectionHeadProps = {
  eyebrow: string;
  title: string;
  lead?: string;
  className?: string;
  align?: "center" | "left";
  dark?: boolean;
};

export function SectionHead({ eyebrow, title, lead, className, align = "center", dark }: SectionHeadProps) {
  return (
    <div
      className={cn(
        "sec-head mb-[clamp(1.25rem,3vw,2rem)] max-w-[62ch]",
        align === "center" && "mx-auto text-center",
        align === "left" && "text-left",
        className,
      )}
    >
      <p className={cn("eyebrow", dark && "text-[var(--sauna-glow)]")}>{eyebrow}</p>
      <h2 className={cn(dark && "text-[var(--cream)]")}>{title}</h2>
      {lead && (
        <p
          className={cn("lead", align === "center" && "mx-auto", dark && "text-[#cbbfae]")}
          style={{ margin: align === "center" ? "0 auto" : undefined }}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
