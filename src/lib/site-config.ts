/**
 * LÖYLY CO. single swap point at go-live.
 *
 * Launch checklist:
 * - [x] Replace phone + phoneTel (must match GBP NAP exactly)
 * - [ ] Replace abn + legalEntity
 * - [ ] Set isStaging: false (removes banner, allows indexing)
 * - [x] Hero before/after + OG image (swap with real job photos when available)
 * - [ ] Add GBP map embed (GTM Kit §5)
 * - [ ] Set RESEND_API_KEY + BOOKING_TO_EMAIL in Vercel production env
 */
export const siteConfig = {
  name: "LÖYLY CO.",
  legalEntity: "LÖYLY CO.", // STAGING: update with registered entity name
  tagline: "The steam is sacred. Keep it clean.",
  url: "https://loylyco.com.au",
  contacts: [
    { name: "Matt Smith", email: "matt@sparrcombat.com" },
    { name: "Blake", email: "blake@sparrcombat.com" },
  ] as const,
  email: "matt@sparrcombat.com",
  emails: ["matt@sparrcombat.com", "blake@sparrcombat.com"] as const,
  phone: "0407 733 940",
  phoneTel: "+61407733940",
  abn: "00 000 000 000", // STAGING
  isStaging: true,
  liabilityCover: "$20M public liability",
  serviceAreas: [
    "Brisbane CBD",
    "New Farm",
    "Newstead",
    "Fortitude Valley",
    "West End",
    "Paddington",
    "Coorparoo",
    "Bulimba",
    "Hamilton",
    "Chermside",
    "Mount Gravatt",
    "Indooroopilly",
    "Gold Coast",
    "Sunshine Coast",
    "wider South East Queensland",
  ],
  sameAs: [] as string[], // Add GBP, Instagram URLs at launch
  images: {
    before: "/images/before.jpg",
    after: "/images/after.jpg",
    og: "/og-image.jpg",
    gallery: {
      timberCare: "/images/gallery/timber-care.jpg",
      saunaInterior: "/images/gallery/sauna-interior.jpg",
      wellnessSpa: "/images/gallery/wellness-spa.jpg",
      recoveryStudio: "/images/gallery/recovery-studio.jpg",
      coldPlunge: "/images/gallery/cold-plunge.jpg",
      hotelSpa: "/images/gallery/hotel-spa.jpg",
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
