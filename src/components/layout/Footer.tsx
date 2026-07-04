import { siteConfig } from "@/lib/site-config";
import { footer } from "@/lib/copy";
import { ContactEmails } from "@/components/ui/ContactEmails";
import { BrandMark } from "@/components/ui/BrandMark";

export function Footer() {
  return (
    <footer className="site site-footer text-[0.88rem]">
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--timber)]/40 to-transparent" />
      <div className="wrap flex flex-col items-center gap-4 py-9 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <BrandMark inverted size="sm" />
          <p className="m-0 mt-1.5 text-[0.82rem] text-[var(--footer-muted)]">{footer.tagline}</p>
        </div>
        <div className="text-[0.85rem]">
          <a
            href={`tel:${siteConfig.phoneTel}`}
            className="text-[var(--footer-text)] no-underline transition-colors hover:text-[var(--cream)] hover:no-underline"
          >
            {siteConfig.phone}
          </a>
          <span className="text-[var(--surface-dark-button-border)]"> · </span>
          <ContactEmails linkClassName="text-[var(--footer-text)] no-underline transition-colors hover:text-[var(--cream)] hover:no-underline" />
        </div>
      </div>
      <div className="wrap border-t border-[var(--footer-border)] py-4 text-center text-[0.75rem] text-[var(--footer-muted)]">
        &copy; {new Date().getFullYear()} {siteConfig.legalEntity} · {siteConfig.liabilityCover} · Brisbane
      </div>
    </footer>
  );
}
