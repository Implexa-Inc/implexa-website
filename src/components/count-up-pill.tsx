"use client";

import { useEffect, useState } from "react";

// Animated skill-count pill. The `target` prop is the canonical live count
// from the backend (passed in from the server-rendered page). We ease from
// (target - 200) up to the real number over ~1.6s on mount, then settle.
//
// Earlier version had a +1-per-22s "drift" while the tab stayed open. Killed
// 2026-05-27 because once `target` became the real 40k+ total instead of a
// stale 19k fallback, drifting +1/22s = ~4/min looked visibly faked. Real
// crawler adds maybe hundreds of skills per day, nowhere near that rate. The
// honest answer: snap to the server value, let ISR (1h revalidate on the
// page fetch) refresh it on next visit.
//
// Respects prefers-reduced-motion (snaps directly to target, no animation).
export function CountUpPill({ target }: { target: number }) {
  const [n, setN] = useState<number>(() => Math.max(0, target - 200));

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setN(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const from = Math.max(0, target - 200);
    const duration = 1600;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.floor(from + (target - from) * eased);
      setN(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [target]);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
      <span
        className="size-1.5 rounded-full bg-emerald-500 animate-pulse"
        aria-hidden="true"
      />
      <span className="tabular-nums">{n.toLocaleString()}</span>
      <span>and counting skills</span>
    </div>
  );
}
