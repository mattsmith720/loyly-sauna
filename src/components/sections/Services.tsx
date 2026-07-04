import { services } from "@/lib/copy";
import { planBookingHref } from "@/lib/booking-plans";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Services() {
  return (
    <section className="services services-surface text-[var(--cream)]" id="services">
      <div className="wrap">
        <div className="reveal-up text-center">
          <p className="eyebrow mb-3 !text-[var(--sauna-glow)]">{services.eyebrow}</p>
          <p className="svc-anchor-line m-0 mb-2 font-serif text-[clamp(1.05rem,2.4vw,1.35rem)] text-[var(--surface-dark-muted)]">
            {services.subtitle}
          </p>
          <h2 className="mb-8 text-[var(--cream)] md:mb-10 svc-headline">{services.title}</h2>
        </div>
        <div className="svc-grid stagger-up mx-auto max-w-[920px]">
          {services.packages.map((pkg) => (
            <div
              key={pkg.name}
              className={cn(
                "svc-card relative flex h-full flex-col items-center rounded-[var(--radius-lg)] border px-5 py-8 text-center",
                pkg.role === "anchor" && "svc-card-anchor border-[var(--surface-dark-border)] bg-[var(--surface-dark)]",
                pkg.role === "starter" && "svc-card-starter border-[var(--surface-dark-border)] bg-[var(--surface-dark)]",
                pkg.popular && "svc-card-popular svc-card-core border-[var(--timber)] bg-[var(--charcoal)]",
              )}
            >
              <span
                className={cn(
                  "mb-3 rounded-full px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em]",
                  pkg.popular
                    ? "bg-[rgba(150,97,58,0.22)] text-[var(--sauna-glow)]"
                    : pkg.role === "anchor"
                      ? "border border-[rgba(221,184,130,0.35)] bg-[rgba(221,184,130,0.08)] text-[var(--sauna-glow)]"
                      : "border border-[var(--surface-dark-button-border)] bg-[rgba(255,255,255,0.03)] text-[var(--surface-dark-muted)]",
                )}
              >
                {pkg.badge}
              </span>
              <h3 className="m-0 text-[1.15rem] font-medium text-[var(--steam)]">{pkg.name}</h3>
              <p className="svc-price my-3 mb-0 font-serif leading-none text-[var(--sauna-glow)]">
                <span className="text-[2rem]">{pkg.price}</span>
                <span className="text-[0.95rem] font-sans font-semibold text-[var(--surface-dark-muted)]">{pkg.unit}</span>
              </p>
              <p className="m-0 mb-2 text-[0.82rem] text-[var(--surface-dark-muted)]">{pkg.frequency}</p>
              <p
                className={cn(
                  "m-0 mb-6 max-w-[22ch] text-[0.78rem] leading-snug",
                  pkg.popular ? "font-semibold text-[var(--steam)]" : "text-[var(--surface-dark-muted)]",
                )}
              >
                {pkg.pitch}
              </p>
              <Button
                href={planBookingHref(pkg.name)}
                variant={pkg.popular ? "timber" : "ghost"}
                className={cn(
                  "mt-auto w-full",
                  !pkg.popular &&
                    "border-[var(--surface-dark-button-border)] bg-transparent text-[var(--cream)] hover:bg-[rgba(255,255,255,0.05)]",
                  pkg.popular && "svc-cta-core",
                )}
              >
                {pkg.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
