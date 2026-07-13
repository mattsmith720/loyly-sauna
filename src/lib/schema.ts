import { booking, services } from "./copy";
import { siteConfig } from "./site-config";
import { parsePriceRange } from "./schema-pricing";

export function buildLocalBusinessSchema() {
  const packageOffers = services.packages.map((pkg) => {
    const pricing = parsePriceRange(pkg.price);
    return {
      "@type": "Offer" as const,
      itemOffered: {
        "@type": "Service" as const,
        name: pkg.name,
        serviceType: "Sauna cleaning",
        description: pkg.frequency,
      },
      priceCurrency: "AUD",
      ...(pricing.minPrice
        ? {
            priceSpecification: {
              "@type": "PriceSpecification" as const,
              ...pricing,
              priceCurrency: "AUD",
            },
          }
        : {}),
    };
  });

  const serviceOffers = booking.serviceOptions.map((name) => ({
    "@type": "Offer" as const,
    itemOffered: {
      "@type": "Service" as const,
      name,
      serviceType: "Sauna cleaning",
    },
    priceCurrency: "AUD",
  }));

  const sameAs = siteConfig.sameAs.map((entry) => entry.trim()).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.name,
    legalName: siteConfig.legalEntity,
    taxID: siteConfig.abn,
    description:
      "Specialist, timber-safe sauna cleaning and restoration service in Brisbane and South East Queensland. Photo-documented, fully insured deep cleans for recovery studios, bathhouses, gyms, hotels, strata and homes.",
    url: siteConfig.url,
    telephone: siteConfig.phoneTel,
    email: siteConfig.email,
    priceRange: "$$",
    image: `${siteConfig.url}${siteConfig.images.og}`,
    areaServed: [
      { "@type": "City", name: "Brisbane" },
      { "@type": "AdministrativeArea", name: "South East Queensland" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brisbane",
      addressRegion: "QLD",
      postalCode: "4000",
      addressCountry: "AU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -27.4698,
      longitude: 153.0251,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "06:00",
        closes: "18:00",
      },
    ],
    knowsAbout: [
      "sauna cleaning",
      "timber sauna maintenance",
      "ice bath hygiene",
      "sauna restoration",
    ],
    slogan: siteConfig.tagline,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Sauna cleaning services Brisbane",
      itemListElement: [...packageOffers, ...serviceOffers],
    },
  };
}
