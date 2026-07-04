import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="site sticky top-0 z-[100] border-b bg-[rgba(246,241,231,0.88)] backdrop-blur-[16px] backdrop-saturate-[180%]">
      <div className="wrap flex min-h-[var(--header-h)] items-center justify-between gap-3 py-2">
        <Link className="brand flex shrink-0 items-baseline gap-1.5 font-serif text-[1.45rem] font-semibold tracking-wide text-[var(--ink)] no-underline hover:no-underline" href="#top" aria-label="LÖYLY CO. home">
          LÖYLY<span className="text-[var(--timber)]">.</span>{" "}
          <small className="self-center font-sans text-[0.58rem] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">CO.</small>
        </Link>
        <div className="flex shrink-0 items-center gap-2.5">
          <a
            className="nav-phone hidden min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 font-semibold text-[var(--ink)] no-underline transition-colors hover:bg-[rgba(169,113,63,0.08)] hover:no-underline md:inline-flex"
            href={`tel:${siteConfig.phoneTel}`}
          >
            <PhoneIcon />
            <span>{siteConfig.phone}</span>
          </a>
          <a
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[var(--line)] bg-[var(--white-warm)] text-[var(--ink)] no-underline shadow-[var(--shadow-sm)] md:hidden"
            href={`tel:${siteConfig.phoneTel}`}
            aria-label={`Call ${siteConfig.phone}`}
          >
            <PhoneIcon />
          </a>
          <Link className="btn btn-timber nav-cta px-4 py-3 text-[0.88rem] sm:px-5" href="#book">
            Book now
          </Link>
        </div>
      </div>
    </header>
  );
}
