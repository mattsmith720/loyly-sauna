"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  opacity: number;
  wobble: number;
};

export function SteamCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const context = ctx;
    if (!context) return;

    let frameId = 0;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * devicePixelRatio);
      canvas.height = Math.floor(height * devicePixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      const count = Math.min(42, Math.floor((width * height) / 9000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 8 + Math.random() * 28,
        speed: 0.15 + Math.random() * 0.45,
        drift: (Math.random() - 0.5) * 0.35,
        opacity: 0.04 + Math.random() * 0.1,
        wobble: Math.random() * Math.PI * 2,
      }));
    }

    function draw(time: number) {
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.y -= particle.speed;
        particle.wobble += 0.012;
        particle.x += Math.sin(particle.wobble + time * 0.001) * particle.drift;

        if (particle.y + particle.radius < 0) {
          particle.y = height + particle.radius;
          particle.x = Math.random() * width;
        }

        const gradient = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius,
        );
        gradient.addColorStop(0, `rgba(255, 248, 235, ${particle.opacity})`);
        gradient.addColorStop(0.45, `rgba(221, 184, 130, ${particle.opacity * 0.55})`);
        gradient.addColorStop(1, "rgba(221, 184, 130, 0)");

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }

      frameId = window.requestAnimationFrame(draw);
    }

    resize();
    frameId = window.requestAnimationFrame(draw);

    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement ?? canvas);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="steam-canvas pointer-events-none" aria-hidden="true" />;
}
