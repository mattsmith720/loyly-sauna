import { HeroVisual } from "@/components/sections/HeroVisual";
import { Button } from "@/components/ui/Button";
import { hero, trustBadges } from "@/lib/copy";

function BadgeIcon({ type }: { type: (typeof trustBadges)[number]["icon"] }) {
  const props = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (type) {
    case "pin":
      return <svg {...props}><circle cx="12" cy="10" r="3" /><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /></svg>;
    case "focus":
      return <svg {...props}><path d="M12 2c-2 4-6 5-6 10a6 6 0 0 0 12 0c0-5-4-6-6-10z" /><path d="M12 12v4" /></svg>;
    case "building":
      return <svg {...props}><path d="M2 22h20M4 22V8l8-5 8 5v14" /></svg>;
    case "camera":
      return <svg {...props}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="12" cy="12" r="3.2" /></svg>;
  }
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="hero-assure-check"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="hero hero-surface overflow-hidden" id="hero">
      <div className="wrap hero-grid">
        <div className="order-1 mb-6 sm:mb-8 sm:mx-0 lg:order-2 lg:mb-0">
          <HeroVisual />
        </div>

        <div className="hero-copy order-2 mx-auto w-full max-w-[40rem] text-center lg:order-1 lg:mx-0 lg:max-w-none lg:text-left">
          <div className="hero-stagger-item">
            <span className="hero-tag">
              <span className="status-dot h-2 w-2 rounded-full" aria-hidden="true" />
              {hero.tag}
            </span>
          </div>
          <div className="hero-stagger-item">
            <h1 className="hero-title mb-5">
              {hero.headlineBefore}
              <span className="text-accent italic">{hero.h1Accent}</span>
              {hero.headlineAfter}
              <br />
              {hero.headlineSecond}
            </h1>
          </div>
          <div className="hero-stagger-item">
            <p className="hero-sub mx-auto mb-6 max-w-[46ch] lg:mx-0">{hero.lead}</p>
          </div>
          <div className="hero-stagger-item hero-cta flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <Button href="#book" variant="timber" size="lg" className="w-full sm:w-auto sm:min-w-[240px]">
              {hero.ctaPrimary}
            </Button>
            <Button href="#method" variant="ghost" size="lg" className="w-full sm:w-auto">
              {hero.ctaSecondary}
            </Button>
          </div>
          <div className="hero-stagger-item">
            <p className="hero-offer mt-4">
              <span className="hero-offer-badge">{hero.offer}</span>
            </p>
          </div>
          <div className="hero-stagger-item">
            <ul className="hero-assure mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
              {hero.assurances.map((item) => (
                <li key={item} className="hero-assure-item">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="hero-stagger-item">
            <div className="trust-row mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              {trustBadges.map((badge) => (
                <span key={badge.label} className="trust-pill">
                  <span className="text-[var(--timber-deep)]">
                    <BadgeIcon type={badge.icon} />
                  </span>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
