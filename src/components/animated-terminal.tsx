"use client";

import { useEffect, useRef, useState } from "react";

// Animated demo of three Implexa workflows running inside a Claude Code
// session. Cycles between scripts: social-media-campaign, record-skill,
// recommend-based-on-work. Each script is a list of "steps" with one of
// three rendering modes:
//
//   - prompt: typewriter the user's prompt character-by-character (fast,
//     about 32ms/char). Prefixed with "> " in zinc-300.
//   - answer: reveal the assistant's response as a whole sentence with a
//     short fade. Multi-line allowed (\n).
//   - pulse:  status-style line that appears with a 1s pulse animation,
//     used for "running..." / "asking question..." / "recording for N min"
//     intermediate states.
//
// After all steps in a script finish, we hold for `holdAfterMs` then
// clear and advance to the next script.
//
// Respects prefers-reduced-motion: jumps to each script's terminal state
// instead of typing, and keeps the cycle to one script-per-page-load.

type Step =
  | { mode: "prompt"; text: string; afterMs?: number }
  | { mode: "answer"; text: string; afterMs?: number }
  | { mode: "pulse"; text: string; afterMs?: number };

type Script = {
  id: string;
  steps: Step[];
  holdAfterMs?: number; // how long to show the finished state before clearing
};

// 3 cycling scripts. Edits here propagate to all renders.
const SCRIPTS: Script[] = [
  {
    id: "social-media",
    steps: [
      { mode: "prompt", text: "Implexa, help me automate my social media campaigns..." },
      {
        mode: "answer",
        text:
          "💡 Implexa: try social-media-daily-for-enterprises (smithery · 9.2/10)\n   drafts + schedules a week of cross-channel posts from one brief",
        afterMs: 1100,
      },
      { mode: "prompt", text: "Implexa: run it" },
      {
        mode: "answer",
        text: "✓ running social-media-daily-for-enterprises inline...",
        afterMs: 1500,
      },
    ],
    holdAfterMs: 2200,
  },
  {
    id: "record-skill",
    steps: [
      { mode: "prompt", text: "Implexa, record a skill..." },
      {
        mode: "answer",
        text:
          "💡 Implexa: sure, just start doing your work. i'll watch + capture the steps, then turn them into a skill.",
        afterMs: 900,
      },
      { mode: "pulse", text: "(recording work for over 30 mins...)", afterMs: 1800 },
      { mode: "prompt", text: "Implexa: save recording" },
      { mode: "pulse", text: "asking interview question 1/4...", afterMs: 1400 },
    ],
    holdAfterMs: 1800,
  },
  {
    id: "recommend",
    steps: [
      { mode: "prompt", text: "Implexa, based on my work recommend me skills to use..." },
      { mode: "pulse", text: "scanning your recent sessions...", afterMs: 900 },
      {
        mode: "answer",
        text:
          "💡 Implexa: spotted 4 strong fits from what you've been doing this week:\n   1. cold-outreach-drafter (smithery · 9.4) — for the prospect emails\n   2. hubspot-pipeline-sync (clawhub · 8.8) — your crm work pattern\n   3. linkedin-comment-drafter (skills.sh · 8.6) — daily engagement\n   4. jira-ticket-triage (anthropic · 8.5) — your triage routine",
        afterMs: 1800,
      },
      { mode: "prompt", text: "Implexa: run #2" },
      { mode: "answer", text: "✓ running hubspot-pipeline-sync inline...", afterMs: 1300 },
    ],
    holdAfterMs: 2400,
  },
];

const CHAR_DELAY_MS = 32; // typewriter speed
const ANSWER_REVEAL_MS = 200; // fade duration for assistant lines

type RenderedLine = {
  key: string;
  mode: Step["mode"];
  text: string;
  full: boolean; // true when the line is done animating in
};

export function AnimatedTerminal() {
  const [scriptIndex, setScriptIndex] = useState(0);
  const [lines, setLines] = useState<RenderedLine[]>([]);
  const timersRef = useRef<number[]>([]);

  // Reduced-motion check — once at mount.
  const reducedMotionRef = useRef(false);
  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Step orchestrator. Each script run owns its own setTimeout chain;
  // when it finishes we clear, bump scriptIndex, and the effect re-fires
  // to start the next one.
  useEffect(() => {
    const script = SCRIPTS[scriptIndex];
    const reduce = reducedMotionRef.current;
    setLines([]);

    let accumulated = 0;
    const newTimers: number[] = [];

    const addLineImmediate = (step: Step, k: string) => {
      // Add the full text instantly (for reduced motion OR answer mode).
      setLines((prev) => [...prev, { key: k, mode: step.mode, text: step.text, full: true }]);
    };

    const typewriter = (step: Step, k: string) => {
      // Start the line with empty text.
      setLines((prev) => [...prev, { key: k, mode: step.mode, text: "", full: false }]);
      const chars = step.text.split("");
      let i = 0;
      const tickTyper = () => {
        i++;
        const slice = chars.slice(0, i).join("");
        const isDone = i >= chars.length;
        setLines((prev) => {
          const updated = [...prev];
          const lastIdx = updated.findIndex((l) => l.key === k);
          if (lastIdx >= 0) {
            updated[lastIdx] = { ...updated[lastIdx], text: slice, full: isDone };
          }
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
      const delayBeforeStep = accumulated;
      // Steps need slight delays between them so the user can see each appear.
      const t = window.setTimeout(() => {
        if (reduce) {
          addLineImmediate(step, stepKey);
        } else if (step.mode === "prompt") {
          typewriter(step, stepKey);
        } else {
          // answer + pulse: instant reveal (rely on CSS transitions for fade/pulse)
          addLineImmediate(step, stepKey);
        }
      }, delayBeforeStep);
      newTimers.push(t);

      // Estimate how long this step takes to finish "appearing".
      const typewriterMs =
        step.mode === "prompt" && !reduce ? step.text.length * CHAR_DELAY_MS : ANSWER_REVEAL_MS;
      // Plus the step's own dwell time after it lands.
      const dwellMs = step.afterMs ?? 700;
      accumulated += typewriterMs + dwellMs;
    });

    // After the last step's accumulated time, hold then advance.
    const advanceAt = accumulated + (script.holdAfterMs ?? 1800);
    const advance = window.setTimeout(() => {
      setScriptIndex((s) => (s + 1) % SCRIPTS.length);
    }, reduce ? 12000 : advanceAt);
    newTimers.push(advance);

    timersRef.current = newTimers;
    return () => {
      for (const t of newTimers) window.clearTimeout(t);
    };
  }, [scriptIndex]);

  return (
    <div className="max-w-2xl mx-auto text-left bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden shadow-2xl">
      {/* claude-orange title bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-900"
        style={{ backgroundColor: "#cc785c" }}
      >
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-black/30" />
          <div className="size-2.5 rounded-full bg-black/30" />
          <div className="size-2.5 rounded-full bg-black/30" />
        </div>
        <span className="text-xs text-white/90 ml-2 font-mono">claude code</span>
      </div>

      {/* terminal body — min-height keeps the box stable while content
          animates in and out across script transitions */}
      <div className="p-5 font-mono text-sm leading-relaxed min-h-[280px]">
        {lines.map((line, i) => {
          if (line.mode === "prompt") {
            return (
              <div key={line.key} className={i > 0 ? "mt-3 text-zinc-300" : "text-zinc-300"}>
                <span className="text-zinc-600">{">"}</span>{" "}
                <span className="text-white">{line.text}</span>
                {/* blinking caret while typing */}
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
                className={(i > 0 ? "mt-2 " : "") + "text-zinc-300 whitespace-pre-line opacity-0 animate-fade-in"}
                style={{
                  animation: `terminal-fade-in ${ANSWER_REVEAL_MS}ms ease forwards`,
                }}
              >
                {line.text}
              </div>
            );
          }
          // pulse
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
