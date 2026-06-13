"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { track } from "@vercel/analytics";

/**
 * Hero build box - the "type a job, hit Build" entry point.
 *
 * Deliberately a PLAIN input (founder feedback 2026-06-12): the previous
 * self-typing ghost overlay read as real text, so visitors tried to edit it and
 * couldn't. Now the rotating example lives in the native `placeholder` - dim,
 * obviously a hint, gone the moment you type. The example chips below FILL the
 * box with real, editable text (they don't navigate).
 *
 * On Build we carry the prompt to signup via the URL (?intent=) - the ONE
 * transport that crosses origins (implexa.ai -> app.implexa.ai). The signup page
 * re-stashes it so it survives the auth round-trip, then turns it into a build
 * run-request. Losing the prompt is the unforgivable failure, so it rides the
 * most durable channel.
 */

const APP_URL = "https://app.implexa.ai";

// Real, on-audience jobs (solopreneurs + small businesses, NOT sales-tool
// positioning; founder call 2026-06-12). Order matters: index i maps to the
// demo terminal's SCRIPTS[i], so tapping a chip plays its matching story.
const EXAMPLES = [
  "Build and post my daily Instagram Reel",
  "Improve my SEO daily and email me what changed",
  "Watch my competitors and flag pricing changes",
];

const ROTATE_MS = 3200;

export function HeroBuildBox() {
  const [value, setValue] = useState("");
  const [idx, setIdx] = useState(0);

  // Rotate the placeholder while the box is empty. A placeholder only shows on
  // an empty input, so there is nothing to gate on focus; respect
  // prefers-reduced-motion by rotating slower (it is a text swap, not motion,
  // but slower is calmer).
  useEffect(() => {
    if (value) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setInterval(
      () => setIdx((i) => (i + 1) % EXAMPLES.length),
      reduce ? 6000 : ROTATE_MS,
    );
    return () => window.clearInterval(t);
  }, [value]);

  function build() {
    const intent = value.trim();
    if (!intent) return;
    // Mint a stable intent_id at the FIRST step of the funnel so this build
    // can be traced + de-duped end to end: it rides the cross-origin hop to
    // signup (alongside ?intent=) and becomes the dedup key on the resulting
    // build run-request. crypto.randomUUID is in every evergreen browser;
    // fall back to a timestamp id on the rare engine that lacks it.
    const intentId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `i_${Date.now().toString(36)}_${Math.random()
            .toString(36)
            .slice(2, 10)}`;
    // funnel_event = the first measurable conversion step. Best-effort: never
    // block the build hop on analytics (Vercel <Analytics/> is mounted in the
    // root layout, so this lands in real conversion data).
    try {
      track("funnel_event", { step: "hero_cta_build", intent_id: intentId });
    } catch {
      /* analytics is best-effort */
    }
    window.location.href = `${APP_URL}/signup?intent=${encodeURIComponent(
      intent.slice(0, 500),
    )}&intent_id=${encodeURIComponent(intentId)}`;
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950/80 p-2 pl-4 shadow-2xl shadow-black/40 focus-within:border-zinc-500 transition-colors">
        <span className="text-zinc-600 select-none font-mono text-lg shrink-0">
          {">"}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              build();
            }
          }}
          placeholder={EXAMPLES[idx]}
          aria-label="Describe the job your agent should do"
          className="flex-1 min-w-0 bg-transparent py-2.5 text-base sm:text-lg text-white placeholder:text-zinc-600 outline-none caret-amber-400"
        />
        <button
          type="button"
          onClick={build}
          disabled={!value.trim()}
          className="inline-flex flex-none items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Build it
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* tap an example to fill the box with real, editable text. It also
          nudges the demo terminal below to play that example's story
          (CustomEvent; the terminal listens for "implexa-demo"). */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {EXAMPLES.map((ex, i) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setValue(ex);
              try {
                window.dispatchEvent(
                  new CustomEvent("implexa-demo", { detail: { index: i } }),
                );
              } catch {
                /* demo sync is best-effort */
              }
            }}
            className="text-xs px-2.5 py-1 rounded-full border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-950 hover:text-white transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
