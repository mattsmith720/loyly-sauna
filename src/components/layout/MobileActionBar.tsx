import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function MobileActionBar() {
  return (
    <div className="mobile-action-bar" aria-label="Quick actions">
      <a className="btn btn-ghost" href={`tel:${siteConfig.phoneTel}`}>
        Call {siteConfig.phone}
      </a>
      <Link className="btn btn-timber" href="#book">
        Book now
      </Link>
    </div>
  );
}
