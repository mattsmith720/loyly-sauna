import { describe, expect, it } from "vitest";
import {
  buildPlanByQuery,
  buildPlanServiceLabel,
  buildPlanServiceOptions,
  planBookingHref,
  resolvePlanService,
} from "./booking-plans";
import { booking, planByQuery, planServiceOptions, services } from "./copy";

describe("buildPlanServiceOptions", () => {
  it("orders plans core first for Hormozi middle-tier push", () => {
    expect(buildPlanServiceOptions(services.packages)).toEqual([
      "Standard · Weekly · 1-2 saunas",
      "Premium · Sauna + plunge",
      "Essential · Fortnightly · 1 sauna",
    ]);
  });

  it("matches exported planServiceOptions", () => {
    expect(planServiceOptions[0]).toContain("Standard");
    expect(planServiceOptions).toEqual(buildPlanServiceOptions(services.packages));
  });
});

describe("planByQuery", () => {
  it("maps query keys to booking service labels", () => {
    expect(planByQuery).toEqual(buildPlanByQuery(services.packages));
    expect(resolvePlanService(planByQuery, "standard")).toBe("Standard · Weekly · 1-2 saunas");
    expect(resolvePlanService(planByQuery, "PREMIUM")).toBe("Premium · Sauna + plunge");
  });
});

describe("planBookingHref", () => {
  it("builds plan deep links to the booking section", () => {
    expect(planBookingHref("Standard")).toBe("/?plan=standard#book");
  });
});

describe("booking.serviceOptions", () => {
  it("leads with plan tiers then one-off services", () => {
    expect(booking.serviceOptions.slice(0, 3)).toEqual(planServiceOptions);
    expect(booking.serviceOptions).toContain("Deep clean");
  });
});

describe("buildPlanServiceLabel", () => {
  it("joins package name and frequency", () => {
    expect(buildPlanServiceLabel("Standard", "Weekly · 1-2 saunas")).toBe("Standard · Weekly · 1-2 saunas");
  });
});

describe("services.packages Hormozi structure", () => {
  it("anchors premium first in display order", () => {
    expect(services.packages.map((pkg) => pkg.name)).toEqual(["Premium", "Standard", "Essential"]);
  });

  it("marks Standard as the pushed core tier", () => {
    const standard = services.packages.find((pkg) => pkg.name === "Standard");
    expect(standard?.popular).toBe(true);
    expect(standard?.role).toBe("core");
  });
});
