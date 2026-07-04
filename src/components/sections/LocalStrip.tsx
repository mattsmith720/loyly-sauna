import { local } from "@/lib/copy";
import { siteConfig } from "@/lib/site-config";

export function LocalStrip() {
  const suburbs = siteConfig.serviceAreas.filter((area) => !area.startsWith("wider"));

  return (
    <section className="local-strip border-y border-[var(--line)] bg-[var(--white-warm)]" aria-label="Service area">
      <div className="wrap py-6 text-center sm:py-7">
        <p className="eyebrow mb-4">{local.eyebrow}</p>
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
