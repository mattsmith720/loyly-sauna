import { services } from "@/lib/copy";
import { planBookingHref } from "@/lib/booking-plans";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const tierVisuals = {
  anchor: "◆",
  core: "●",
  starter: "○",
} as const;

function FeatureCheck() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function Services() {
  return (
    <section className="services services-surface text-[var(--cream)]" id="services">
      <div className="heat-orbs" aria-hidden="true">
        <span className="heat-orb heat-orb-a" />
        <span className="heat-orb heat-orb-b" />
      </div>
      <div className="wrap">
        <div className="reveal-up text-center">
          <h2 className="mb-8 md:mb-10 svc-headline">{services.title}</h2>
        </div>
        <div className="svc-grid-scroll">
          <div className="svc-grid stagger-up mx-auto w-full max-w-[1140px]">
          {services.packages.map((pkg) => (
            <div
              key={pkg.name}
              className={cn(
                "svc-card relative flex h-full flex-col rounded-[var(--radius-lg)] border px-5 py-8 sm:px-6",
                pkg.role === "anchor" && "svc-card-anchor border-[var(--surface-dark-border)]",
                pkg.role === "starter" && "svc-card-starter border-[var(--surface-dark-border)]",
                pkg.popular && "svc-card-popular svc-card-core border-[var(--timber)]",
              )}
            >
              <div className="svc-card-head text-center">
                <span className="svc-tier-glyph mb-2 block" aria-hidden="true">
                  {tierVisuals[pkg.role]}
                </span>
                <span
                  className={cn(
                    "mb-3 inline-block rounded-full px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em]",
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
                <p className="svc-best-for m-0 mt-2 text-[0.78rem] leading-snug text-[var(--surface-dark-muted)]">
                  {pkg.bestFor}
                </p>
                <p className="svc-price my-3 mb-0 font-serif leading-none text-[var(--sauna-glow)]">
                  <span className="text-[2rem]">{pkg.price}</span>
                  <span className="text-[0.95rem] font-sans font-semibold text-[var(--surface-dark-muted)]">{pkg.unit}</span>
                </p>
                <p className="m-0 text-[0.82rem] font-semibold text-[var(--cream)]">{pkg.frequency}</p>
              </div>

              <ul className="svc-features m-0 mt-5 mb-6 flex-1 list-none p-0">
                {pkg.features.map((feature) => (
                  <li key={feature} className="svc-feature">
                    <FeatureCheck />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

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
        <p className="svc-footnote reveal-up m-0 mt-8 text-center text-[0.82rem] leading-relaxed text-[var(--surface-dark-muted)]">
          {services.footnote}
        </p>
      </div>
    </section>
  );
}
