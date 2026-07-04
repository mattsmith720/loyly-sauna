import { describe, expect, it } from "vitest";
import { buildLocalBusinessSchema } from "./schema";
import { booking, services } from "./copy";

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
  });
});
