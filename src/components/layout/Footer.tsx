import { siteConfig } from "@/lib/site-config";
import { footer } from "@/lib/copy";
import { ContactEmails } from "@/components/ui/ContactEmails";

export function Footer() {
  return (
    <footer className="site bg-[#1a1613] text-[#b7ac9d] text-[0.88rem]">
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--timber)]/40 to-transparent" />
      <div className="wrap flex flex-col items-center gap-4 py-9 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <div className="brand font-serif text-[1.3rem] text-[var(--cream)]">
            LÖYLY<span className="text-[var(--timber)]">.</span> CO.
          </div>
          <p className="m-0 mt-1.5 text-[0.82rem] text-[#8f8474]">{footer.tagline}</p>
        </div>
        <div className="text-[0.85rem]">
          <a href={`tel:${siteConfig.phoneTel}`} className="text-[#b7ac9d] no-underline transition-colors hover:text-[var(--cream)] hover:no-underline">
            {siteConfig.phone}
          </a>
          <span className="text-[#5a5148]"> · </span>
          <ContactEmails linkClassName="text-[#b7ac9d] no-underline transition-colors hover:text-[var(--cream)] hover:no-underline" />
        </div>
      </div>
      <div className="wrap border-t border-[#2e2822] py-4 text-center text-[0.75rem] text-[#8f8474]">
        &copy; {new Date().getFullYear()} {siteConfig.legalEntity} · {siteConfig.liabilityCover} · Brisbane
      </div>
    </footer>
  );
}
