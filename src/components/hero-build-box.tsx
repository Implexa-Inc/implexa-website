"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

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

// Real, on-audience jobs (post-Lovable solopreneurs + indie builders).
const EXAMPLES = [
  "Write and schedule my posts for the week",
  "Find 10 leads a day and draft the outreach",
  "Grow my new app's traffic while I sleep",
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
    window.location.href = `${APP_URL}/signup?intent=${encodeURIComponent(
      intent.slice(0, 500),
    )}`;
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

      {/* tap an example to fill the box with real, editable text */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setValue(ex)}
            className="text-xs px-2.5 py-1 rounded-full border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-950 hover:text-white transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
