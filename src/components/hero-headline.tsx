"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";

// A/B-ready hero headline. Ships BOTH locked candidates as a pair:
//
//   variant "a" (primary): "Building with AI got easy. Running your business
//                           with it didn't." (the post-Replit/Lovable insight)
//   variant "b":           "Run your whole business with a team of agents.
//                           Yours is a team of one." (the leverage angle)
//
// How the A/B works without a flash for the primary cohort:
//   - Server renders variant "a" (the locked primary), so SSR + the first
//     client render always match. No hydration mismatch.
//   - On mount, a sticky 50/50 assignment is read from (or written to)
//     localStorage and the chosen variant is applied. Variant "b" visitors
//     see a one-frame swap, which is the accepted trade for a no-middleware
//     test. The assignment is reported once via Vercel Analytics so the two
//     headlines can be compared on real conversion.
//
// To drive this from a real experiment instead (Vercel Flags / Edge Config
// cookie set in middleware), pass `forced` and the client assignment is
// skipped. That is the one-line upgrade path to a flash-free, server-decided
// test.

export type HeroVariant = "a" | "b";

const STORAGE_KEY = "implexa_hero_variant";

function HeadlineA() {
  return (
    <>
      Build and run powerful agents.
      <span className="block">Inside Claude or Codex.</span>
      <span className="block mt-2">
        Unlimited agents.{" "}
        <span className="underline decoration-amber-400 decoration-2 underline-offset-[6px]">
          Free forever
        </span>
        .
      </span>
    </>
  );
}

function HeadlineB() {
  return (
    <>
      Run your whole business with a{" "}
      <span className="underline decoration-amber-400 decoration-2 underline-offset-[6px]">
        team of agents
      </span>
      . Yours is a team of one.
    </>
  );
}

export function HeroHeadline({ forced }: { forced?: HeroVariant }) {
  const [variant, setVariant] = useState<HeroVariant>(forced ?? "a");

  useEffect(() => {
    if (forced) {
      // Server decided the variant (middleware cookie). Still report the view
      // once so the A/B test has conversion data for the forced cohort.
      try {
        track("hero_variant_view", { variant: forced });
      } catch {
        // analytics is best-effort; never block render on it
      }
      return;
    }
    let assigned: HeroVariant;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "a" || stored === "b") {
        assigned = stored;
      } else {
        // Sticky 50/50. Math.random is fine here: assignment only needs to be
        // unbiased per new visitor, then it is persisted so it never re-rolls.
        assigned = Math.random() < 0.5 ? "a" : "b";
        window.localStorage.setItem(STORAGE_KEY, assigned);
      }
    } catch {
      assigned = "a";
    }
    setVariant(assigned);
    try {
      track("hero_variant_view", { variant: assigned });
    } catch {
      // analytics is best-effort; never block render on it
    }
  }, [forced]);

  return (
    <h1
      data-hero-variant={variant}
      className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-[1.12] mb-5"
    >
      {variant === "b" ? <HeadlineB /> : <HeadlineA />}
    </h1>
  );
}
