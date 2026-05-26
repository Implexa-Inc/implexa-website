"use client";

import { useEffect, useState } from "react";

// Animated skill-count pill. Server passes the canonical count from the
// backend; we ease from (count - 200) up to the real number over ~1.6s on
// mount, then nudge +1 every ~22s while the tab stays open. The "and
// counting" framing is honest: the real count grows over time as the
// crawler indexes more skills, and the ticker just makes that visible
// on every page refresh.
//
// Two design choices worth keeping:
//   1. Never tick BELOW the server-rendered count. The number is allowed
//      to drift slightly ahead between hourly revalidations, but never
//      behind, so refreshing the page never feels like the index shrunk.
//   2. Use prefers-reduced-motion to skip the easing animation entirely
//      for users who've opted out of motion.
export function CountUpPill({ target }: { target: number }) {
  const [n, setN] = useState<number>(() => Math.max(0, target - 200));

  useEffect(() => {
    // Respect reduced motion: just snap to target + tick.
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    if (reduce) {
      setN(target);
    } else {
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
    }

    // Slow live drift: +1 every ~22s. Visible on long-form reads, doesn't
    // race past believable boundaries.
    const drift = setInterval(() => {
      setN((cur) => cur + 1);
    }, 22000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(drift);
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
