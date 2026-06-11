"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

/**
 * Hero build box — the Lovable-style "type a job, hit Build" entry point.
 *
 * On submit we carry the prompt to signup via the URL (?intent=) — the ONE
 * transport that crosses origins (implexa.ai -> app.implexa.ai). The signup page
 * stashes it in its own localStorage so it survives the auth round-trip, then
 * turns it into a build run-request the moment the account exists. Losing the
 * prompt is the unforgivable failure, so it rides the most durable channel.
 *
 * Example chips FILL the box (they don't navigate), so a hesitant visitor gets a
 * concrete, tempting starting point in one tap.
 */

const APP_URL = "https://app.implexa.ai";

const EXAMPLES = [
  "Improve my SEO daily and email me what changed",
  "Make an end-to-end Instagram reel for my product, daily",
  "Every morning, email me my key signup and revenue numbers",
  "Watch my competitors and tell me the moment they change pricing",
  "Every day, find 10 new leads matching my ICP and draft the outreach",
];

export function HeroBuildBox() {
  const [value, setValue] = useState("");

  function build() {
    const intent = value.trim();
    if (!intent) return;
    // URL is the cross-origin bridge; signup re-stashes + builds it.
    window.location.href = `${APP_URL}/signup?intent=${encodeURIComponent(intent.slice(0, 500))}`;
  }

  return (
    <div>
      <div className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-1.5 focus-within:border-zinc-500 transition-colors">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); build(); }
          }}
          rows={2}
          placeholder="e.g. every morning, email me my key numbers"
          className="w-full resize-none bg-transparent px-3.5 py-2.5 text-base text-white placeholder:text-zinc-500 focus:outline-none"
          aria-label="Describe the job your agent should do"
        />
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-xs text-zinc-600">Runs in your own Claude or Codex</span>
          <button
            type="button"
            onClick={build}
            disabled={!value.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Build it
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* tempting starting points — tap to fill the box */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-zinc-500 self-center mr-1">Try one:</span>
        {EXAMPLES.slice(0, 3).map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setValue(ex)}
            className="text-xs px-2.5 py-1 rounded-full border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-950 hover:text-white transition-colors text-left"
          >
            {ex.length > 42 ? `${ex.slice(0, 40)}…` : ex}
          </button>
        ))}
      </div>
    </div>
  );
}
