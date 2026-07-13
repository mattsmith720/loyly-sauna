"use client";

import { useEffect, useRef } from "react";
import { moveInput } from "./input";

type StickProps = {
  visible: boolean;
};

export function MobileControls({ visible }: StickProps) {
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeId = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!visible) {
      moveInput.forward = 0;
      moveInput.right = 0;
    }
  }, [visible]);

  if (!visible) return null;

  const radius = 48;

  const setFromPoint = (clientX: number, clientY: number) => {
    const dx = clientX - origin.current.x;
    const dy = clientY - origin.current.y;
    const len = Math.hypot(dx, dy);
    const clamped = Math.min(len, radius);
    const nx = len > 0 ? (dx / len) * clamped : 0;
    const ny = len > 0 ? (dy / len) * clamped : 0;
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${nx}px, ${ny}px)`;
    }
    moveInput.right = nx / radius;
    moveInput.forward = -ny / radius;
  };

  const reset = () => {
    activeId.current = null;
    moveInput.forward = 0;
    moveInput.right = 0;
    if (knobRef.current) {
      knobRef.current.style.transform = "translate(0px, 0px)";
    }
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 md:hidden"
      aria-hidden={!visible}
    >
      <div
        ref={stickRef}
        className="pointer-events-auto absolute bottom-24 left-6 h-28 w-28 touch-none select-none rounded-full border border-[rgba(221,208,188,0.28)] bg-[rgba(26,22,19,0.45)] backdrop-blur-sm"
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          activeId.current = event.pointerId;
          const rect = event.currentTarget.getBoundingClientRect();
          origin.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
          setFromPoint(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (activeId.current !== event.pointerId) return;
          setFromPoint(event.clientX, event.clientY);
        }}
        onPointerUp={reset}
        onPointerCancel={reset}
      >
        <div
          ref={knobRef}
          className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(221,184,130,0.55)] shadow-md will-change-transform"
        />
      </div>
    </div>
  );
}
