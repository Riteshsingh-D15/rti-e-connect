"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Interactive 3D perspective card with subtle cursor-reactive tilt and specular glare.
 * Falls back cleanly to elevated 3D shadow without tilt on touch devices or reduced motion.
 */
export function TiltCard({
  children,
  className,
  intensity = 6,
  scale = 1.01,
  glare = true,
  ...props
}) {
  const cardRef = useRef(null);
  const frameRef = useRef(0);
  const pointerEnabledRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    pointerEnabledRef.current = finePointer && !reducedMotion;

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleMouseMove = (event) => {
    const el = cardRef.current;
    if (!el || !pointerEnabledRef.current) return;

    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const px = Math.min(Math.max(x / rect.width, 0), 1);
    const py = Math.min(Math.max(y / rect.height, 0), 1);

    const rotateY = (px - 0.5) * 2 * intensity;
    const rotateX = (0.5 - py) * 2 * intensity;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
      el.style.setProperty("--sc", String(scale));
      el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      el.style.setProperty("--go", glare ? "1" : "0");
    });
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--sc", "1");
    el.style.setProperty("--go", "0");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "tilt-3d-card surface-3d rounded-2xl border border-slate-200/90 bg-white",
        className
      )}
      {...props}
    >
      {glare ? <div aria-hidden="true" className="tilt-3d-glare" /> : null}
      {children}
    </div>
  );
}
