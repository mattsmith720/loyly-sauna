import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { planBookingHref } from "@/lib/booking-plans";

export function MobileActionBar() {
  return (
    <div className="mobile-action-bar" aria-label="Quick actions">
      <a className="btn btn-ghost mobile-call-btn" href={`tel:${siteConfig.phoneTel}`}>
        Call
      </a>
      <Link className="btn btn-timber" href={planBookingHref("Standard")}>
        Book now
      </Link>
    </div>
  );
}
