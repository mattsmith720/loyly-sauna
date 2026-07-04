import { local } from "@/lib/copy";
import { siteConfig } from "@/lib/site-config";

export function LocalStrip() {
  const suburbs = siteConfig.serviceAreas.filter((area) => !area.startsWith("wider"));

  return (
    <section className="local-strip border-y border-[var(--line)] bg-[var(--white-warm)]" aria-label="Service area">
      <div className="wrap py-7 text-center sm:py-8">
        <div className="reveal-up">
          <p className="eyebrow mb-2">{local.eyebrow}</p>
          <p className="local-niche mx-auto mb-2 max-w-[36ch] font-serif text-[var(--ink)]">{local.niche}</p>
          <p className="m-0 mb-5 text-[0.88rem] font-medium text-[var(--muted)]">{local.clients}</p>
        </div>
        <div className="local-areas flex flex-wrap items-center justify-center gap-2">
          {suburbs.map((area) => (
            <span
              key={area}
              className="local-chip rounded-full border border-[var(--line)] bg-[var(--cream)] px-3 py-1.5 text-[0.78rem] font-semibold text-[var(--charcoal-soft)]"
            >
              {area}
            </span>
          ))}
          <span className="rounded-full border border-dashed border-[var(--line)] px-3 py-1 text-[0.78rem] font-medium text-[var(--muted)]">
            + wider SEQ
          </span>
        </div>
      </div>
    </section>
  );
}
