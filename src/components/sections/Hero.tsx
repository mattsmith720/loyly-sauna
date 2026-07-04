import { hero, trustBadges } from "@/lib/copy";
import { Button } from "@/components/ui/Button";
import { BeforeAfterCard } from "@/components/ui/BeforeAfterCard";

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

export function Hero() {
  return (
    <section
      className="hero overflow-hidden pb-10 pt-[clamp(1.25rem,3vw,2rem)] sm:pb-12"
      id="hero"
      style={{
        background:
          "linear-gradient(165deg, var(--cream) 0%, var(--cream-2) 45%, #ebe3d4 100%)",
      }}
    >
      <div className="wrap hero-grid">
        <div className="hero-visual order-1 -mx-[24px] mb-8 overflow-hidden sm:mx-0 lg:order-2 lg:mb-0">
          <BeforeAfterCard variant="hero" />
        </div>

        <div className="hero-copy order-2 mx-auto max-w-[40rem] text-center lg:order-1 lg:mx-0 lg:max-w-none lg:text-left">
          <span className="tag mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[rgba(251,248,242,0.85)] px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--charcoal-soft)] shadow-[var(--shadow-sm)] backdrop-blur-md">
            <span className="status-dot h-2 w-2 rounded-full" aria-hidden="true" />
            {hero.tag}
          </span>
          <h1 className="hero-title mb-4">
            Your sauna is a{" "}
            <span className="bg-gradient-to-r from-[var(--timber-deep)] to-[var(--timber)] bg-clip-text italic text-transparent">
              {hero.h1Accent}
            </span>{" "}
            asset.
            <br className="hidden sm:block" />
            Stop cleaning it like a bathroom.
          </h1>
          <p className="hero-sub mx-auto mb-7 max-w-[34ch] text-[1.02rem] leading-snug text-[var(--muted)] lg:mx-0 lg:text-left">
            {hero.sub}
          </p>
          <Button href="#book" variant="timber" size="lg" className="min-w-[240px]">
            Book a deep clean
          </Button>
          <div className="trust-row mt-8 flex flex-wrap items-center justify-center gap-2">
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
    </section>
  );
}
