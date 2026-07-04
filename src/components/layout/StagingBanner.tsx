import { siteConfig } from "@/lib/site-config";
import { stagingBanner } from "@/lib/copy";

export function StagingBanner() {
  if (!siteConfig.isStaging) return null;

  return (
    <div
      role="status"
      className="border-b border-[var(--line)] bg-[var(--steam)] text-center text-[0.8rem] font-medium text-[var(--muted)] py-2 px-4"
    >
      {stagingBanner}
    </div>
  );
}
