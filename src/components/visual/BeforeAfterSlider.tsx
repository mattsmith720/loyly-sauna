"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { beforeAfter } from "@/lib/copy";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/image-config";
import { siteConfig } from "@/lib/site-config";

export function BeforeAfterSlider() {
  const [position, setPosition] = useState(52);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(96, Math.max(4, next)));
  }, []);

  return (
    <div
      ref={containerRef}
      className={`ba-slider report overflow-hidden border border-[var(--line)] bg-[var(--white-warm)] rounded-none sm:rounded-[var(--radius-lg)] ${dragging ? "ba-slider-active" : ""}`}
      aria-label="Drag to compare before and after sauna cleaning"
      onPointerDown={(event) => {
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
        updatePosition(event.clientX);
      }}
      onPointerMove={(event) => {
        if (!dragging) return;
        updatePosition(event.clientX);
      }}
      onPointerUp={(event) => {
        setDragging(false);
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") setPosition((value) => Math.max(4, value - 4));
        if (event.key === "ArrowRight") setPosition((value) => Math.min(96, value + 4));
      }}
      tabIndex={0}
      role="slider"
      aria-valuemin={4}
      aria-valuemax={96}
      aria-valuenow={Math.round(position)}
      aria-valuetext={`${Math.round(position)} percent before, ${Math.round(100 - position)} percent after`}
    >
      <div className="ba-slider-stage relative aspect-[5/4] sm:aspect-[4/3] lg:aspect-[5/4]">
        <Image
          src={siteConfig.images.after}
          alt={`${beforeAfter.afterLabel}: ${beforeAfter.afterCaption}`}
          fill
          className="object-cover"
          sizes={IMAGE_SIZES.hero}
          priority
          quality={IMAGE_QUALITY.hero}
        />
        <div
          className="ba-slider-before absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={siteConfig.images.before}
            alt={`${beforeAfter.beforeLabel}: ${beforeAfter.beforeCaption}`}
            fill
            className="object-cover"
            sizes={IMAGE_SIZES.hero}
            priority
            fetchPriority="high"
            quality={IMAGE_QUALITY.hero}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/45 via-transparent to-transparent" />
        </div>
        <div className="ba-slider-handle" style={{ left: `${position}%` }} aria-hidden="true">
          <span className="ba-slider-knob">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 8l-4 4 4 4M16 8l4 4-4 4" />
            </svg>
          </span>
        </div>
        <span className="ba-label ba-slider-label ba-slider-label-before">{beforeAfter.beforeLabel}</span>
        <span className="ba-label ba-slider-label ba-slider-label-after">{beforeAfter.afterLabel}</span>
        <span className="ba-slider-hint">Drag</span>
      </div>
    </div>
  );
}
