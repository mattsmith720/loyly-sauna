import { siteConfig } from "@/lib/site-config";

export function HeroTag() {
  return (
    <p className="hero-tag">{siteConfig.tagline}</p>
  );
}
