"use client";

import { useEffect, useRef, useState } from "react";

// Animated demo of an Implexa agent inside a Claude Code session: describe a
// job once, the agent runs it every morning on its own, and it gets better.
// Plays ONE script on mount, then shows a Replay button. No infinite cycle,
// since an auto-loop competes with hero copy for attention. User-initiated
// replay is the linear.app / cursor.com pattern.
//
// Three render modes per step:
//   - prompt: typewriter the user's prompt character-by-character (32ms/char).
//             Prefixed with "> " in zinc.
//   - answer: reveal the assistant's response as a whole block with a short
//             fade. Multi-line allowed (\n).
//   - pulse:  status-style line that appears with a 1s pulse animation,
//             used for "running..." / "asking question..." intermediate states.
//
// Respects prefers-reduced-motion (skips typewriter, snaps to final state).

type Step =
  | { mode: "prompt"; text: string; afterMs?: number }
  | { mode: "answer"; text: string; afterMs?: number }
  | { mode: "pulse"; text: string; afterMs?: number };

type Script = {
  id: string;
  label: string;
  steps: Step[];
};

// Three scripts the user can replay through. Default plays the first.
// Edits here propagate everywhere, keep them concise + skimmable.
// Voice rule: user calls "Implexa, ..." to open the turn; subsequent
// user prompts are bare ("Run it" / "Save recording") since the
// conversation context is already established. Assistant lines (💡)
// don't repeat "Implexa:", the bulb already conveys it's Implexa
// speaking. System status lines (✓ running / scanning...) get no prefix.
// This matches how a real claude code session reads.
// The three scripts mirror the three example chips in the hero build box, in
// the same order; clicking a chip plays the matching script here (the
// "implexa-demo" CustomEvent below). Each script compresses the full arc:
// describe -> Implexa picks the stack -> approve -> scheduled -> compounding
// results. The named tools (Remotion / HeyGen / Runway) are the real stack the
// founder's own daily-reel agent uses; results are illustrative, hence the
// "example run" pill in the title bar.
const SCRIPTS: Script[] = [
  {
    id: "daily-reel",
    label: "Daily Instagram Reel",
    steps: [
      { mode: "prompt", text: "Implexa, build and post my daily Instagram Reel" },
      {
        mode: "answer",
        text:
          "💡 I'll build that agent. For production quality I recommend:\n   Remotion (motion graphics) · HeyGen (avatar) · Runway (b-roll).\n   Set it up to run daily at 9am? (Y/n)",
        afterMs: 1400,
      },
      { mode: "prompt", text: "Y" },
      { mode: "pulse", text: "Building the agent + connecting the tools...", afterMs: 1000 },
      {
        mode: "answer",
        text: "✓ Agent built. Runs daily at 9:00am. Nothing to babysit.",
        afterMs: 900,
      },
      {
        mode: "answer",
        text:
          "Day 1 ▸ reel #1 rendered + posted\nDay 2 ▸ reel #2 posted · hook rewritten from Day 1 feedback\nDay 10 ▸ 10 reels shipped · avg watch time up",
        afterMs: 1500,
      },
    ],
  },
  {
    id: "daily-seo",
    label: "Daily SEO improvements",
    steps: [
      { mode: "prompt", text: "Implexa, improve my SEO daily and email me what changed" },
      {
        mode: "answer",
        text:
          "💡 Built. Every morning it audits your pages, fixes what it can,\n   and emails you the diff. Runs as you, on your real site.",
        afterMs: 1300,
      },
      { mode: "pulse", text: "7:00am · running on its own...", afterMs: 1000 },
      {
        mode: "answer",
        text:
          "✓ This morning: 3 pages improved, 2 posts drafted,\n  1 broken link fixed. Summary in your inbox.",
        afterMs: 1200,
      },
    ],
  },
  {
    id: "competitor-watch",
    label: "Competitor watch",
    steps: [
      { mode: "prompt", text: "Implexa, watch my competitors and flag pricing changes" },
      {
        mode: "answer",
        text: "💡 Built. It checks their pages daily and only pings you on a real change.",
        afterMs: 1200,
      },
      { mode: "pulse", text: "Tuesday · change detected...", afterMs: 1000 },
      {
        mode: "answer",
        text:
          "✓ Acme moved Pro from $29 to $39 and dropped the free tier.\n  Here is the diff + a suggested response, waiting for your review.",
        afterMs: 1300,
      },
    ],
  },
];

const CHAR_DELAY_MS = 32;
const ANSWER_REVEAL_MS = 220;

type RenderedLine = {
  key: string;
  mode: Step["mode"];
  text: string;
  full: boolean;
};

export function AnimatedTerminal() {
  const [scriptIndex, setScriptIndex] = useState(0);
  const [replayNonce, setReplayNonce] = useState(0); // bumps to force re-run when user clicks the current tab
  const [lines, setLines] = useState<RenderedLine[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  // Auto-cycle: infinite loop 0 → 1 → 2 → 0 → 1 → 2 → ... The user can
  // click 1/2/3 to jump to a specific script; cycling continues from
  // there to the next one in sequence. Click the active number to
  // replay it (via replayNonce). The earlier "stop after 3" version was
  // reverted 2026-05-27, founder preferred continuous motion.
  const timersRef = useRef<number[]>([]);

  const reducedMotionRef = useRef(false);
  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Play through the current script's steps. On finish, set isPlaying=false
  // so the replay button surfaces. Doesn't auto-advance to the next script.
  useEffect(() => {
    const script = SCRIPTS[scriptIndex];
    const reduce = reducedMotionRef.current;
    setLines([]);
    setIsPlaying(true);

    let accumulated = 0;
    const newTimers: number[] = [];

    const addLineImmediate = (step: Step, k: string) => {
      setLines((prev) => [...prev, { key: k, mode: step.mode, text: step.text, full: true }]);
    };

    const typewriter = (step: Step, k: string) => {
      setLines((prev) => [...prev, { key: k, mode: step.mode, text: "", full: false }]);
      const chars = step.text.split("");
      let i = 0;
      const tickTyper = () => {
        i++;
        const slice = chars.slice(0, i).join("");
        const isDone = i >= chars.length;
        setLines((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((l) => l.key === k);
          if (idx >= 0) updated[idx] = { ...updated[idx], text: slice, full: isDone };
          return updated;
        });
        if (!isDone) {
          const t = window.setTimeout(tickTyper, CHAR_DELAY_MS);
          newTimers.push(t);
        }
      };
      tickTyper();
    };

    script.steps.forEach((step, i) => {
      const stepKey = `${script.id}-${i}`;
      const t = window.setTimeout(() => {
        if (reduce) addLineImmediate(step, stepKey);
        else if (step.mode === "prompt") typewriter(step, stepKey);
        else addLineImmediate(step, stepKey);
      }, accumulated);
      newTimers.push(t);

      const typewriterMs =
        step.mode === "prompt" && !reduce ? step.text.length * CHAR_DELAY_MS : ANSWER_REVEAL_MS;
      const dwellMs = step.afterMs ?? 700;
      accumulated += typewriterMs + dwellMs;
    });

    // When the script finishes, mark "not playing" + auto-advance to the
    // next script (wrap around past the last back to 0). Infinite cycle.
    const finishAt = accumulated;
    const finishTimer = window.setTimeout(() => {
      setIsPlaying(false);

      const advance = window.setTimeout(() => {
        // Only advance if we're still on the same script (guards against
        // race with a user click that already jumped to a different one).
        setScriptIndex((prev) =>
          prev === scriptIndex ? (prev + 1) % SCRIPTS.length : prev,
        );
      }, reduce ? 1000 : 1600);
      newTimers.push(advance);
    }, reduce ? 200 : finishAt);
    newTimers.push(finishTimer);

    timersRef.current = newTimers;
    return () => {
      for (const t of newTimers) window.clearTimeout(t);
    };
  }, [scriptIndex, replayNonce]);

  const jumpToScript = (i: number) => {
    // User-initiated jump. Cycle stays active (infinite loop), clicking
    // a tab just changes the entry point, then auto-advance continues
    // from there. Click the active tab to replay it.
    if (i === scriptIndex) {
      // Already on this script, bump the nonce to re-run the effect
      // without going through an invalid intermediate index.
      setReplayNonce((n) => n + 1);
    } else {
      setScriptIndex(i);
    }
  };

  // Chip-sync: the hero build box dispatches "implexa-demo" with the index of
  // the example the visitor tapped; the demo follows along and plays that
  // story. Restart unconditionally (index + nonce) so tapping the chip for the
  // already-active script replays it from the top.
  useEffect(() => {
    const onDemo = (e: Event) => {
      const i = (e as CustomEvent<{ index?: number }>).detail?.index;
      if (typeof i !== "number" || i < 0 || i >= SCRIPTS.length) return;
      setScriptIndex(i);
      setReplayNonce((n) => n + 1);
    };
    window.addEventListener("implexa-demo", onDemo);
    return () => window.removeEventListener("implexa-demo", onDemo);
  }, []);

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden shadow-2xl">
      {/* terminal title bar, muted dark, no longer claude-orange. cleaner. */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-900 bg-zinc-900/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex gap-1.5 shrink-0">
            <div className="size-2.5 rounded-full bg-zinc-700" />
            <div className="size-2.5 rounded-full bg-zinc-700" />
            <div className="size-2.5 rounded-full bg-zinc-700" />
          </div>
          <span className="text-xs text-zinc-500 ml-1 font-mono truncate">
            Claude Code · {SCRIPTS[scriptIndex].label}
          </span>
          {/* honesty guardrail: results shown are illustrative, never implied
              to have run on the visitor's data */}
          <span className="hidden sm:inline-block text-[9px] uppercase tracking-wider text-zinc-600 border border-zinc-800 rounded-full px-1.5 py-0.5 shrink-0">
            example run
          </span>
        </div>

        {/* numbered script picker, 1 / 2 / 3. active is white, others
            are zinc-600. clicking jumps to that script (or replays if
            it's already the active one). always visible, not just when
            the current script finishes. */}
        <div className="flex items-center gap-2 shrink-0" role="tablist" aria-label="demo scripts">
          {SCRIPTS.map((s, i) => {
            const active = i === scriptIndex;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`play demo ${i + 1}: ${s.label}`}
                onClick={() => jumpToScript(i)}
                className={
                  "font-mono text-xs tabular-nums transition-colors " +
                  (active
                    ? "text-white"
                    : "text-zinc-600 hover:text-zinc-400")
                }
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* terminal body, fixed min-height keeps the box stable, but tighter
          than before since we don't need to fit the longest script anymore */}
      <div className="p-5 font-mono text-sm leading-relaxed min-h-[260px]">
        {lines.map((line, i) => {
          // User prompts: bright white text after a muted ">" prefix.
          // Claude responses: zinc-400 (notably grayer) so the
          // user-vs-assistant distinction reads at a glance, not just
          // from the emoji marker. Pulse mode keeps emerald-italic so
          // status lines remain visually distinct from both.
          if (line.mode === "prompt") {
            return (
              <div key={line.key} className={i > 0 ? "mt-3" : ""}>
                <span className="text-zinc-600">{">"}</span>{" "}
                <span className="text-white">{line.text}</span>
                {!line.full && (
                  <span className="inline-block w-[0.5ch] -mb-[2px] bg-zinc-400 animate-pulse h-[1em] align-baseline ml-[1px]" />
                )}
              </div>
            );
          }
          if (line.mode === "answer") {
            return (
              <div
                key={line.key}
                className={(i > 0 ? "mt-2 " : "") + "text-zinc-400 whitespace-pre-line"}
                style={{
                  animation: `terminal-fade-in ${ANSWER_REVEAL_MS}ms ease forwards`,
                  opacity: 0,
                }}
              >
                {line.text}
              </div>
            );
          }
          return (
            <div
              key={line.key}
              className={(i > 0 ? "mt-2 " : "") + "text-emerald-400/80 italic animate-pulse"}
            >
              {line.text}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes terminal-fade-in {
          from {
            opacity: 0;
            transform: translateY(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
