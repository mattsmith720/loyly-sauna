type ServicePackage = {
  name: string;
  frequency: string;
  role: "anchor" | "core" | "starter";
};

const PLAN_ORDER = { core: 0, anchor: 1, starter: 2 } as const;

export function buildPlanServiceLabel(name: string, frequency: string) {
  return `${name} · ${frequency}`;
}

export function buildPlanServiceOptions(packages: readonly ServicePackage[]) {
  return [...packages]
    .sort((a, b) => PLAN_ORDER[a.role] - PLAN_ORDER[b.role])
    .map((pkg) => buildPlanServiceLabel(pkg.name, pkg.frequency));
}

export function buildPlanByQuery(packages: readonly ServicePackage[]) {
  return Object.fromEntries(
    packages.map((pkg) => [pkg.name.toLowerCase(), buildPlanServiceLabel(pkg.name, pkg.frequency)]),
  ) as Record<string, string>;
}

export function resolvePlanService(
  planByQuery: Record<string, string>,
  queryPlan: string | null | undefined,
): string | undefined {
  if (!queryPlan) return undefined;
  return planByQuery[queryPlan.trim().toLowerCase()];
}

export function planBookingHref(planName: string) {
  return `/?plan=${encodeURIComponent(planName.toLowerCase())}#book`;
}
