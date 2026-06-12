"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

/**
 * Hero build box - the Lovable-style "type a job, hit Build" entry point, styled
 * as the "DESCRIBE A JOB" terminal: a `>` prompt that self-types real example
 * jobs (typewriter, with an amber caret) while the box is empty and unfocused,
 * so a cold visitor instantly sees the shape of what they can ask for.
 *
 * The examples are CLICKABLE: tapping one fills the box (it does not navigate),
 * giving a hesitant visitor a one-tap starting point. The moment they focus or
 * type, the demo gets out of the way and it is a normal input.
 *
 * On Build we carry the prompt to signup via the URL (?intent=) - the ONE
 * transport that crosses origins (implexa.ai -> app.implexa.ai). The signup page
 * re-stashes it so it survives the auth round-trip, then turns it into a build
 * run-request. Losing the prompt is the unforgivable failure, so it rides the
 * most durable channel. Respects prefers-reduced-motion (snaps, no typing).
 */

const APP_URL = "https://app.implexa.ai";

// Real, on-audience jobs (post-Lovable solopreneurs + indie builders). `label`
// is the rotating kind pill in the header; `text` is what fills the box.
const EXAMPLES: Array<{ label: string; text: string }> = [
  { label: "content", text: "Write and schedule my posts for the week" },
  { label: "sales", text: "Find 10 leads a day and draft the outreach" },
  { label: "your app", text: "Grow my new app's traffic while I sleep" },
  { label: "builder", text: "Turn my changelog into a weekly customer email" },
  { label: "growth", text: "Improve my SEO daily and email me what changed" },
];

const TYPE_MS = 42;
const HOLD_MS = 1900;
const ERASE_MS = 18;

export function HeroBuildBox() {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [index, setIndex] = useState(0); // which example the typewriter is on
  const [ghost, setGhost] = useState(""); // the typed-so-far demo string
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter: type -> hold -> erase -> next. Only runs while the box is empty
  // (no point animating a hidden ghost once the user has a value). Cleans up all
  // timers on re-run/unmount.
  useEffect(() => {
    if (value) return; // user is in control; stop the demo
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const current = EXAMPLES[index]?.text ?? "";
    const timers: number[] = [];

    const next = () => {
      const t = window.setTimeout(
        () => setIndex((i) => (i + 1) % EXAMPLES.length),
        reduce ? 1600 : 320,
      );
      timers.push(t);
    };

    if (reduce) {
      setGhost(current);
      next();
      return () => timers.forEach((t) => window.clearTimeout(t));
    }

    let i = 0;
    const typeTick = () => {
      i++;
      setGhost(current.slice(0, i));
      if (i < current.length) {
        timers.push(window.setTimeout(typeTick, TYPE_MS));
      } else {
        timers.push(
          window.setTimeout(() => {
            let j = current.length;
            const eraseTick = () => {
              j--;
              setGhost(current.slice(0, Math.max(0, j)));
              if (j > 0) timers.push(window.setTimeout(eraseTick, ERASE_MS));
              else next();
            };
            eraseTick();
          }, HOLD_MS),
        );
      }
    };
    setGhost("");
    timers.push(window.setTimeout(typeTick, 240));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [index, value]);

  function build() {
    const intent = value.trim();
    if (!intent) return;
    window.location.href = `${APP_URL}/signup?intent=${encodeURIComponent(
      intent.slice(0, 500),
    )}`;
  }

  function fill(text: string, i: number) {
    setValue(text);
    setIndex(i); // keep the header kind pill in sync with the picked example
    // focus so the caret lands at the end and the box reads as "ready to build"
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        const n = el.value.length;
        el.setSelectionRange(n, n);
      }
    });
  }

  const showGhost = !value && !focused;
  const kind = EXAMPLES[index]?.label ?? "";

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-4 sm:p-5 shadow-2xl shadow-black/40 focus-within:border-zinc-500 transition-colors">
        {/* header: DESCRIBE A JOB + rotating kind pill + Build action */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Describe a job
          </span>
          <span
            key={kind}
            className="text-[10px] font-mono uppercase tracking-wider text-amber-300/90 border border-amber-900/40 bg-amber-500/5 rounded-full px-2 py-0.5"
          >
            {kind}
          </span>
        </div>

        {/* the terminal line: > prompt, then either the live input or the
            self-typing demo ghost (an overlay, so the input value stays clean) */}
        <div className="flex items-center font-mono text-base sm:text-lg min-h-[2.25rem]">
          <span className="text-zinc-600 select-none mr-2 shrink-0">{">"}</span>
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  build();
                }
              }}
              aria-label="Describe the job your agent should do"
              className="w-full bg-transparent text-white outline-none caret-amber-400"
            />
            {showGhost ? (
              <div className="pointer-events-none absolute inset-0 flex items-center whitespace-pre overflow-hidden text-white/90">
                {ghost}
                <span className="inline-block w-[0.55ch] h-[1.05em] bg-amber-400 animate-pulse ml-[1px]" />
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={build}
            disabled={!value.trim()}
            className="ml-3 inline-flex flex-none items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Build it
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* clickable examples - tap to fill the box, then hit Build */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-zinc-500 mr-0.5">Try one:</span>
        {EXAMPLES.map((ex, i) => (
          <button
            key={ex.text}
            type="button"
            onClick={() => fill(ex.text, i)}
            className="text-xs px-2.5 py-1 rounded-full border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-950 hover:text-white transition-colors"
          >
            {ex.text.length > 38 ? `${ex.text.slice(0, 36)}…` : ex.text}
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-zinc-600">
        Real examples. You describe it once, the agent runs it on its own.
      </p>
    </div>
  );
}
