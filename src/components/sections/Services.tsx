import { services } from "@/lib/copy";
import { planBookingHref } from "@/lib/booking-plans";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const tierVisuals = {
  anchor: "◆",
  core: "●",
  starter: "○",
} as const;

export function Services() {
  return (
    <section className="services services-surface text-[var(--cream)]" id="services">
      <div className="heat-orbs" aria-hidden="true">
        <span className="heat-orb heat-orb-a" />
        <span className="heat-orb heat-orb-b" />
      </div>
      <div className="wrap">
        <div className="reveal-up text-center">
          <h2 className="mb-8 text-[var(--cream)] md:mb-10 svc-headline">{services.title}</h2>
        </div>
        <div className="svc-grid stagger-up mx-auto max-w-[920px]">
          {services.packages.map((pkg) => (
            <div
              key={pkg.name}
              className={cn(
                "svc-card relative flex h-full flex-col items-center rounded-[var(--radius-lg)] border px-5 py-8 text-center",
                pkg.role === "anchor" && "svc-card-anchor border-[var(--surface-dark-border)]",
                pkg.role === "starter" && "svc-card-starter border-[var(--surface-dark-border)]",
                pkg.popular && "svc-card-popular svc-card-core border-[var(--timber)]",
              )}
            >
              <span className="svc-tier-glyph mb-2" aria-hidden="true">
                {tierVisuals[pkg.role]}
              </span>
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
              <p className="m-0 mb-6 text-[0.82rem] text-[var(--surface-dark-muted)]">{pkg.frequency}</p>
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
