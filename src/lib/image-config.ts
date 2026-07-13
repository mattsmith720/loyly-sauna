/** Shared Next/Image tuning for sharp, retina-friendly delivery. */
export const IMAGE_QUALITY = {
  hero: 92,
  gallery: 88,
} as const;

export const IMAGE_SIZES = {
  /** Hero before/after slider — full width mobile, half grid desktop, 2x retina */
  hero: "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 960px",
  /** Proof band — quarter width desktop, half mobile */
  gallery: "(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 640px",
} as const;
