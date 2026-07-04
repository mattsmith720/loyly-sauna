import { services } from "@/lib/copy";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Services() {
  return (
    <section
      className="services py-[clamp(3rem,6vw,4.5rem)] text-[var(--cream)]"
      id="services"
      style={{ background: "linear-gradient(180deg, #1f1b17 0%, var(--charcoal-soft) 50%, var(--charcoal) 100%)" }}
    >
      <div className="wrap">
        <p className="eyebrow mb-3 text-center text-[var(--sauna-glow)]">{services.eyebrow}</p>
        <h2 className="mb-10 text-center text-[var(--cream)]">{services.title}</h2>
        <div className="svc-grid mx-auto grid max-w-[920px] gap-4 sm:grid-cols-3 sm:gap-5">
          {services.packages.map((pkg) => (
            <div
              key={pkg.name}
              className={cn(
                "svc-card relative flex flex-col items-center rounded-[var(--radius-lg)] border px-5 py-8 text-center",
                pkg.popular
                  ? "svc-card-popular border-[var(--timber)] bg-[var(--charcoal)]"
                  : "border-[#4a423a] bg-[rgba(47,41,36,0.85)]",
              )}
            >
              {pkg.popular && (
                <span className="mb-4 rounded-full bg-[rgba(169,113,63,0.2)] px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--sauna-glow)]">
                  Most booked
                </span>
              )}
              {!pkg.popular && <span className="mb-4 h-[26px]" aria-hidden="true" />}
              <h3 className="m-0 text-[1.15rem] font-medium text-white">{pkg.name}</h3>
              <p className="my-3 mb-1 font-serif text-[2rem] leading-none text-[var(--sauna-glow)]">{pkg.price}</p>
              <p className="m-0 mb-6 text-[0.82rem] text-[#a89c8c]">{pkg.frequency}</p>
              <Button
                href="#book"
                variant={pkg.popular ? "timber" : "ghost"}
                className={cn("mt-auto w-full", !pkg.popular && "border-[#5a5148] bg-transparent text-[var(--cream)] hover:bg-[rgba(255,255,255,0.04)]")}
              >
                Book
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
