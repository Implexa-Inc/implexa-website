"use client";

import { useEffect, useRef } from "react";

// Fixed-viewport background that paints a faint dot grid + an amber
// radial spotlight that follows the cursor (the "magic wand reveals the
// block structure" effect the founder asked for on 2026-05-26).
//
// Two layers stacked in one element via background-image:
//   1) static dot grid at very low opacity (always visible)
//   2) amber radial spotlight at the cursor position (additive)
//
// The whole thing sits at -z-10 with pointer-events:none so it never
// interferes with scrolling, taps, or text selection. Mouse tracking uses
// requestAnimationFrame coalescing so we never schedule more than one
// CSS write per frame, regardless of pointermove frequency.
export function MouseGridSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let x = 0;
    let y = 0;

    // Respect reduced motion: render the static grid only, no spotlight.
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !ref.current) return;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (ref.current) {
          ref.current.style.setProperty("--mx", `${x}px`);
          ref.current.style.setProperty("--my", `${y}px`);
        }
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        // Layer order (top → bottom):
        //   1. amber radial spotlight following cursor
        //   2. faint static white-dot grid baseline
        //   3. base bg via tailwind (zinc-950 from body)
        backgroundImage: [
          // spotlight: tight amber center, fades to transparent at ~380px
          "radial-gradient(circle 380px at var(--mx, 50%) var(--my, -200px), rgba(251, 191, 36, 0.10), transparent 70%)",
          // dot grid: 1px white-ish dots every 32px, very faint
          "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.06) 1px, transparent 0)",
          // a SECOND amber-tinted dot pattern, only revealed by the
          // spotlight via its own mask layering — done by stacking a
          // brighter amber dot pattern with a tight spotlight overlay
          "radial-gradient(circle 320px at var(--mx, 50%) var(--my, -200px), rgba(251, 191, 36, 0.04), transparent 65%)",
        ].join(", "),
        backgroundSize: [
          "100% 100%",
          "32px 32px",
          "100% 100%",
        ].join(", "),
        backgroundRepeat: "no-repeat, repeat, no-repeat",
      }}
    />
  );
}
