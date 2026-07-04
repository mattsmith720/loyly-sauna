import { siteConfig } from "./site-config";

export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.name,
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
    sameAs: siteConfig.sameAs,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Sauna cleaning services Brisbane",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Essential Package",
            serviceType: "Sauna cleaning",
          },
          priceCurrency: "AUD",
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: "700",
            maxPrice: "700",
            priceCurrency: "AUD",
            unitText: "MONTH",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Standard Package",
            serviceType: "Sauna cleaning",
          },
          priceCurrency: "AUD",
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: "700",
            maxPrice: "1000",
            priceCurrency: "AUD",
            unitText: "MONTH",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Maintenance Clean",
            serviceType: "Sauna cleaning",
          },
          priceCurrency: "AUD",
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: "140",
            maxPrice: "180",
            priceCurrency: "AUD",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Quarterly Restoration",
            serviceType: "Sauna restoration",
          },
          priceCurrency: "AUD",
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: "450",
            maxPrice: "750",
            priceCurrency: "AUD",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Ice Bath Hygiene",
            serviceType: "Cold plunge hygiene",
          },
          priceCurrency: "AUD",
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: "60",
            maxPrice: "90",
            priceCurrency: "AUD",
          },
        },
      ],
    },
  };
}
