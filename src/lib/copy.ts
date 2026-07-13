import { siteConfig } from "./site-config";
import { buildPlanByQuery, buildPlanServiceOptions } from "./booking-plans";

export const seo = {
  title: "Sauna Cleaning Brisbane | LÖYLY Co.",
  description:
    "Brisbane's only dedicated sauna cleaning service. Timber saunas and cold plunges across SEQ. Photo-documented every visit.",
  ogTitle: "LÖYLY CO. - Sauna Cleaning Brisbane",
  ogDescription: "Brisbane sauna-only specialists. Timber-safe cleaning across SEQ.",
} as const;

export const hero = {
  h1Accent: "$40,000",
} as const;

export const processSteps = [
  { id: "inspect", label: "Inspect", icon: "camera" as const },
  { id: "clean", label: "Clean", icon: "steam" as const },
  { id: "report", label: "Report", icon: "check" as const },
] as const;

export const trustBadges = [
  { label: "Brisbane & SEQ", icon: "pin" as const },
  { label: "Sauna-only", icon: "focus" as const },
  { label: "Timber-safe", icon: "building" as const },
  { label: "Photo report", icon: "camera" as const },
] as const;

export const local = {
  eyebrow: "SEQ service area",
} as const;

export const proof = {
  line: "Photo report on every visit.",
  photos: [
    { src: siteConfig.images.gallery.recoveryStudio, alt: "Recovery studio sauna" },
    { src: siteConfig.images.gallery.saunaInterior, alt: "Cedar sauna interior" },
    { src: siteConfig.images.gallery.wellnessSpa, alt: "Wellness spa sauna" },
    { src: siteConfig.images.gallery.timberCare, alt: "Restored timber sauna" },
  ],
} as const;

export const services = {
  title: "Most venues choose Standard",
  footnote: "All plans ex GST. Quarterly deep cleans included in the monthly rate.",
  packages: [
    {
      name: "Premium",
      price: "$1k+",
      unit: "/mo",
      frequency: "Weekly · sauna + plunge",
      bestFor: "Contrast studios and pre-open venues",
      badge: "Full suite",
      popular: false,
      role: "anchor",
      cta: "Book full care",
      features: [
        "1-2 saunas + cold plunge",
        "Weekly timber-safe maintenance",
        "Quarterly cedar restoration",
        "Priority 5-8am pre-open slot",
        "Photo report every visit",
      ],
    },
    {
      name: "Standard",
      price: "$700-$1k",
      unit: "/mo",
      frequency: "Weekly · 1-2 saunas",
      bestFor: "Recovery studios, gyms and spas",
      badge: "Most booked",
      popular: true,
      role: "core",
      cta: "Book Standard",
      features: [
        "1-2 saunas",
        "Weekly timber-safe maintenance",
        "Quarterly cedar restoration",
        "Photo report every visit",
      ],
    },
    {
      name: "Essential",
      price: "~$700",
      unit: "/mo",
      frequency: "Fortnightly · 1 sauna",
      bestFor: "Single sauna, lighter traffic",
      badge: "Starter",
      popular: false,
      role: "starter",
      cta: "Start lighter",
      features: [
        "1 sauna",
        "Fortnightly timber-safe maintenance",
        "Quarterly cedar restoration",
        "Photo report every visit",
      ],
    },
  ],
} as const;

const oneOffServiceOptions = [
  "Deep clean",
  "Maintenance clean",
  "Quarterly restoration",
  "Ice bath hygiene",
  "Multi-site / not sure yet",
] as const;

export const planServiceOptions = buildPlanServiceOptions(services.packages);
export const planByQuery = buildPlanByQuery(services.packages);

export const booking = {
  title: "Book a clean.",
  placeholders: {
    name: "Matt Smith",
    venue: "Recovery Studio Brisbane",
    email: "you@venue.com.au",
    message: "Cedar sauna, New Farm, weekday mornings",
  },
  serviceOptions: [...planServiceOptions, ...oneOffServiceOptions],
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
