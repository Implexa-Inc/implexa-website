"use client";

import { useEffect, useState } from "react";

// Rotating verb shown at the top of the homepage hero:
//
//   [Search / Run / Record / Share / Like & Dislike] Skills right
//   inside Claude Code & Codex.
//
// Cycles through the verb list with a fade+slide transition every
// `intervalMs` ms. Respects prefers-reduced-motion (pinned to first
// verb when reduced motion is on, no animation).
//
// The container reserves max-content width so the layout doesn't
// jitter when "Like & Dislike" (the longest verb) cycles in.
const DEFAULT_VERBS = [
  "Search",
  "Run",
  "Record",
  "Share",
  "Like & Dislike",
] as const;

const TRANSITION_MS = 380; // crossfade duration
const DEFAULT_INTERVAL_MS = 2200; // total time each word is on screen

export function RotatingVerb({
  verbs = DEFAULT_VERBS as unknown as string[],
  intervalMs = DEFAULT_INTERVAL_MS,
  className = "",
}: {
  verbs?: readonly string[] | string[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setPhase("out");
      window.setTimeout(() => {
        if (cancelled) return;
        setIndex((i) => (i + 1) % verbs.length);
        setPhase("in");
      }, TRANSITION_MS);
    };
    const id = window.setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [verbs.length, intervalMs]);

  // Longest verb pads the container so layout never jitters mid-cycle.
  const longest = verbs.reduce((a, b) => (a.length >= b.length ? a : b), "");

  return (
    <span
      className={`relative inline-block align-baseline ${className}`}
      // Reserve width based on the longest entry. We render it invisibly
      // to set the natural width, then position the rotating word
      // absolutely on top so layout stays stable.
    >
      <span className="invisible" aria-hidden="true">
        {longest}
      </span>
      <span
        className="absolute inset-0 inline-flex items-baseline justify-start text-amber-300"
        style={{
          opacity: phase === "in" ? 1 : 0,
          transform: phase === "in" ? "translateY(0)" : "translateY(-0.18em)",
          transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
        }}
        aria-live="polite"
      >
        {verbs[index]}
      </span>
    </span>
  );
}
