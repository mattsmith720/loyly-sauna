import { describe, expect, it } from "vitest";
import { buildLocalBusinessSchema } from "./schema";
import { booking, services } from "./copy";
import { siteConfig } from "./site-config";

describe("buildLocalBusinessSchema", () => {
  it("includes current package and service offers", () => {
    const schema = buildLocalBusinessSchema();
    const offers = schema.hasOfferCatalog.itemListElement;
    const names = offers.map((offer) => offer.itemOffered.name);

    for (const pkg of services.packages) {
      expect(names).toContain(pkg.name);
    }

    for (const service of booking.serviceOptions) {
      expect(names).toContain(service);
    }
  });

  it("lists package offers in Hormozi anchor-first order", () => {
    const schema = buildLocalBusinessSchema();
    const packageNames = schema.hasOfferCatalog.itemListElement
      .slice(0, services.packages.length)
      .map((offer) => offer.itemOffered.name);

    expect(packageNames).toEqual(["Premium", "Standard", "Essential"]);
  });

  it("uses Brisbane business metadata", () => {
    const schema = buildLocalBusinessSchema();
    expect(schema["@type"]).toBe("LocalBusiness");
    expect(schema.address.addressLocality).toBe("Brisbane");
    expect(schema.legalName).toBe(siteConfig.legalEntity);
    expect(schema.taxID).toBe(siteConfig.abn);
  });

  it("omits sameAs when no profiles are configured", () => {
    const schema = buildLocalBusinessSchema();
    expect(schema.sameAs).toBeUndefined();
  });

  it("includes sameAs when profiles are configured", () => {
    const mutableConfig = siteConfig as unknown as { sameAs: string[] };
    const originalSameAs = [...mutableConfig.sameAs];

    mutableConfig.sameAs = ["https://example.com/company", "https://example.com/profile"];

    try {
      const schema = buildLocalBusinessSchema();
      expect(schema.sameAs).toEqual(["https://example.com/company", "https://example.com/profile"]);
    } finally {
      mutableConfig.sameAs = originalSameAs;
    }
  });
});
