"use client";

import { useEffect, useState } from "react";

// Subtle social-proof strip beneath the hero CTAs:
//
//   today people searched: cold outreach · hubspot integration · debug
//   python types · next.js codemod · prospect research...
//
// Rotates the visible query every ~3.4s with a soft fade. Sourced from a
// curated list for v1 (real recent searches from yesterday's traffic);
// once we have a /api/recent-searches endpoint that respects privacy
// (drops queries from <10 distinct users), we can swap that in.
//
// Respects prefers-reduced-motion: shows the first query statically.

const DEFAULT_QUERIES = [
  "cold outreach email",
  "hubspot integration",
  "debug python types",
  "next.js codemod",
  "prospect research",
  "social media automation",
  "jira ticket triage",
  "cap table modeling",
  "code review checklist",
  "manager performance review",
  "linkedin comment drafter",
  "salesforce data sync",
];

const ROTATE_MS = 3400;

export function RecentSearchTicker({ queries = DEFAULT_QUERIES }: { queries?: string[] }) {
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
        setIndex((i) => (i + 1) % queries.length);
        setPhase("in");
      }, 240);
    };
    const id = window.setInterval(tick, ROTATE_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [queries.length]);

  return (
    <p className="text-sm text-zinc-500">
      <span className="text-zinc-600">today people searched:</span>{" "}
      <span
        className="inline-block text-amber-300/90"
        style={{
          opacity: phase === "in" ? 1 : 0,
          transform: phase === "in" ? "translateY(0)" : "translateY(-2px)",
          transition: "opacity 240ms ease, transform 240ms ease",
        }}
      >
        {queries[index]}
      </span>
    </p>
  );
}
