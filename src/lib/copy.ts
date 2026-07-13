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
  tag: "Now booking across Brisbane & SEQ",
  h1Accent: "$40,000",
  headlineBefore: "Your sauna is a ",
  headlineAfter: " asset.",
  headlineSecond: "Stop cleaning it like a bathroom.",
  lead: "LÖYLY CO. is Brisbane's specialist sauna cleaning service. Timber-safe deep cleans that protect the wood, keep you hygiene-audit-ready, and leave every visit backed by a before-and-after photo report.",
  offer: "Free first deep clean · no obligation",
  ctaPrimary: "Book your free first deep clean",
  ctaSecondary: "See the method",
  assurances: [
    "Fully insured",
    "Timber-safe method",
    "Photo-documented",
  ],
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
  line: "If it isn't documented, it didn't happen.",
  photos: [
    { src: siteConfig.images.gallery.recoveryStudio, alt: "Recovery studio sauna" },
    { src: siteConfig.images.gallery.saunaInterior, alt: "Cedar sauna interior" },
    { src: siteConfig.images.gallery.wellnessSpa, alt: "Wellness spa sauna" },
    { src: siteConfig.images.gallery.timberCare, alt: "Restored timber sauna" },
    { src: siteConfig.images.gallery.coldPlunge, alt: "Sanitised cold plunge" },
    { src: siteConfig.images.gallery.hotelSpa, alt: "Hotel spa sauna suite" },
  ],
} as const;

export const problem = {
  eyebrow: "The hidden cost of the wrong clean",
  title: "A cheap clean is the most expensive mistake a sauna owner makes.",
  lead: "General cleaners treat a sauna like a shower recess. The wrong chemicals, sealants and pressure don't just fail to clean the timber — they quietly destroy it and take your reputation with them.",
  cards: [
    {
      stat: "Bleach & harsh chemicals",
      title: "Timber damage",
      body: "Standard products soak into porous cedar and hemlock, dry it out, bleach it grey and trap fumes that release under heat. The wood is never the same.",
    },
    {
      stat: "$20k–$60k",
      title: "Refit territory",
      body: "Once benches and cladding are stained or rotted, you're not cleaning anymore — you're re-fitting the room. That's a $20,000 to $60,000 problem you can prevent.",
    },
    {
      stat: "Reviews tank fast",
      title: "Reputation risk",
      body: "Nothing drops a wellness venue's rating like a grimy, musty sauna. One \u201cit smelled off\u201d review costs you far more than a professional clean ever would.",
    },
  ],
} as const;

export const method = {
  eyebrow: "The LÖYLY method",
  title: "Built around one rule: protect the timber first.",
  lead: "Everything we do is engineered to be safe on wood, safe on skin, and safe under heat — the specialist moat a general cleaner simply can't cross.",
  pillars: [
    {
      id: "chemistry",
      icon: "flask" as const,
      title: "Timber-safe chemistry",
      body: "Low-tox, pH-balanced agents chosen for wood. No bleach, no residue, nothing that off-gasses when the heater fires.",
    },
    {
      id: "sanitation",
      icon: "sanitise" as const,
      title: "Deep sanitation",
      body: "Benches, backrests, floors, heater guards and door glass sanitised to a recovery-grade standard that kills the bacteria behind the musty smell.",
    },
    {
      id: "restore",
      icon: "restore" as const,
      title: "Restore & condition",
      body: "Light sand, brighten and condition to bring greyed, tired timber back to warm, honeyed cedar and extend the life of the whole room.",
    },
    {
      id: "report",
      icon: "camera" as const,
      title: "Photo report, every time",
      body: "Before-and-after images and a checklist land in your inbox after every visit, so hygiene is documented, not just promised.",
    },
  ],
} as const;

export const guarantee = {
  eyebrow: "The photo-report guarantee",
  title: "If it isn't documented, it didn't happen.",
  lead: "Every LÖYLY visit ends with a timestamped before-and-after report and a signed-off checklist. Your hygiene standard becomes a record you can hand an auditor, a franchisor or an insurer without a second thought.",
  promise: "If a visit isn't documented, that visit is free.",
  note: "No shows without proof. No \u201cwe did it, trust us.\u201d Just a clean paper trail that protects your licence and your reputation — and a timber-safe method that keeps the asset intact.",
  cta: "Get audit-ready",
  rows: [
    { title: "Timestamped photos", body: "Before and after images of every surface, filed against your venue." },
    { title: "Completion checklist", body: "Line-by-line record of exactly what was cleaned, sanitised and treated." },
    { title: "Delivered to your inbox", body: "Stored and searchable, ready for any hygiene audit or review dispute." },
    { title: "Timber-safe promise", body: "If the report shows a miss, we come back and fix it at no charge." },
  ],
} as const;

export const howItWorks = {
  eyebrow: "How it works",
  title: "Three steps to a spotless, protected sauna.",
  steps: [
    {
      n: "1",
      title: "Book your free deep clean",
      body: "Tell us about your venue and room. We schedule your no-cost first deep clean at a time that suits your timetable.",
    },
    {
      n: "2",
      title: "We clean, restore & document",
      body: "Our specialist arrives fully equipped, works timber-safe, and captures the full before-and-after photo report on the spot.",
    },
    {
      n: "3",
      title: "Set your rhythm",
      body: "Love the result? Lock in a maintenance rhythm that keeps the room audit-ready year round. No lock-in contracts.",
    },
  ],
} as const;

export const faq = {
  eyebrow: "Questions",
  title: "Everything owners ask us.",
  items: [
    {
      q: "Is the free first deep clean really free?",
      a: "Yes. Your first deep clean is on us, with no obligation to continue. It's how we prove the difference a specialist makes. You keep the full photo report whether or not you book again.",
    },
    {
      q: "Why not just use my regular cleaner?",
      a: "General cleaners use products designed for tile and porcelain. On porous sauna timber those chemicals soak in, dry out and discolour the wood, and can release fumes under heat. We use timber-safe chemistry and a method built specifically for saunas and cold plunges.",
    },
    {
      q: "What areas do you service?",
      a: "All of Brisbane and greater South East Queensland, including the Gold Coast and Sunshine Coast corridors. If you're just outside that zone, ask us anyway.",
    },
    {
      q: "Are you insured?",
      a: "Fully. We carry $20M public liability cover and can supply a certificate of currency for your records or your body corporate on request.",
    },
    {
      q: "How long does a clean take and do we close the room?",
      a: "A maintenance clean is typically under an hour; a full restoration takes longer. We work around your opening hours, including early mornings and after close, to minimise downtime.",
    },
    {
      q: "Do you handle ice baths and cold plunges too?",
      a: "Yes. Our ice bath hygiene service covers draining, scrubbing, sanitising, biofilm treatment and a filter and chiller-line check, with a water-clarity photo log.",
    },
  ],
} as const;

export const services = {
  title: "Most venues choose Standard",
  packages: [
    {
      name: "Premium",
      price: "$1k+",
      unit: "/mo",
      frequency: "Sauna + plunge",
      badge: "Full suite",
      popular: false,
      role: "anchor",
      cta: "Book full care",
    },
    {
      name: "Standard",
      price: "$700-$1k",
      unit: "/mo",
      frequency: "Weekly · 1-2 saunas",
      badge: "Most booked",
      popular: true,
      role: "core",
      cta: "Book Standard",
    },
    {
      name: "Essential",
      price: "~$700",
      unit: "/mo",
      frequency: "Fortnightly · 1 sauna",
      badge: "Starter",
      popular: false,
      role: "starter",
      cta: "Start lighter",
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
  title: "Book your free deep clean.",
  offerBadge: "Free first deep clean",
  intro:
    "See what a specialist does with your sauna — at zero cost and zero obligation. You keep the before-and-after photo report either way.",
  bullets: [
    "No obligation, no lock-in contracts",
    "Full before-and-after photo report included",
    "We usually reply the same business day",
  ],
  talkPrompt: "Prefer to talk?",
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
