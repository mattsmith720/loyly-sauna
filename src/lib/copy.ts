import { siteConfig } from "./site-config";

export const seo = {
  title: "Sauna Cleaning Brisbane | LÖYLY Co.",
  description:
    "Brisbane's only dedicated sauna cleaning service. Timber saunas and cold plunges across SEQ. Photo-documented every visit.",
  ogTitle: "LÖYLY CO. - Sauna Cleaning Brisbane",
  ogDescription: "Brisbane sauna-only specialists. Timber-safe cleaning across SEQ.",
} as const;

export const hero = {
  tag: "Brisbane sauna specialists",
  sub: "Timber saunas and cold plunges only. Not general cleaning.",
  h1Accent: "$40,000",
} as const;

export const trustBadges = [
  { label: "Brisbane & SEQ", icon: "pin" as const },
  { label: "Sauna-only", icon: "focus" as const },
  { label: "Timber-safe", icon: "building" as const },
  { label: "Photo report", icon: "camera" as const },
] as const;

export const local = {
  eyebrow: "Local to South East Queensland",
  niche: "We only service saunas, ice baths and timber wellness rooms.",
  clients: "Recovery studios · gyms · hotels · strata · home saunas",
} as const;

export const proof = {
  line: "If it isn't documented, it didn't happen.",
  photos: [
    { src: siteConfig.images.gallery.recoveryStudio, alt: "Recovery studio sauna" },
    { src: siteConfig.images.gallery.saunaInterior, alt: "Cedar sauna interior" },
    { src: siteConfig.images.gallery.wellnessSpa, alt: "Wellness spa sauna" },
    { src: siteConfig.images.gallery.timberCare, alt: "Restored timber sauna" },
  ],
} as const;

export const services = {
  eyebrow: "Brisbane commercial & residential",
  title: "From $700/mo",
  packages: [
    { name: "Essential", price: "~$700", frequency: "Fortnightly · 1 sauna", popular: false },
    { name: "Standard", price: "$700-$1k", frequency: "Weekly · 1-2 saunas", popular: true },
    { name: "Premium", price: "$1k+", frequency: "Sauna + plunge", popular: false },
  ],
} as const;

export const booking = {
  title: "Book a clean.",
  placeholders: {
    name: "Your name",
    venue: "Venue name",
    email: "you@venue.com.au",
    message: "Room type, timber, suburb, best times...",
  },
  serviceOptions: [
    "Deep clean",
    "Maintenance clean",
    "Quarterly restoration",
    "Ice bath hygiene",
    "Multi-site / not sure yet",
  ],
} as const;

export const beforeAfter = {
  beforeLabel: "Before",
  beforeCaption: "Grime + salt",
  afterLabel: "After",
  afterCaption: "Restored cedar",
} as const;

export const footer = {
  tagline: "Brisbane's sauna-only cleaning crew. SEQ-wide.",
} as const;

export const stagingBanner =
  "Site in setup. Some contact and business details are still being finalised.";
