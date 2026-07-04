"use client";

import dynamic from "next/dynamic";

const BeforeAfterSlider = dynamic(
  () => import("@/components/visual/BeforeAfterSlider").then((mod) => mod.BeforeAfterSlider),
  {
    loading: () => (
      <div
        className="report aspect-[5/4] animate-pulse rounded-none border border-[var(--line)] bg-[var(--cream)] sm:aspect-[4/3] sm:rounded-[var(--radius-lg)] lg:aspect-[5/4]"
        aria-hidden="true"
      />
    ),
  },
);

const SteamCanvas = dynamic(
  () => import("@/components/visual/SteamCanvas").then((mod) => mod.SteamCanvas),
  { ssr: false },
);

export function HeroVisual() {
  return (
    <div className="hero-visual-shell hero-visual-edge hero-animate-in relative">
      <BeforeAfterSlider />
      <SteamCanvas />
    </div>
  );
}
