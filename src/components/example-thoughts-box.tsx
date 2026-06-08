"use client";

import { useEffect, useRef, useState } from "react";
import { EXAMPLE_THOUGHTS, type ExampleThought } from "@/lib/example-thoughts";

// A describe box that rotates through real example jobs (the growing list in
// lib/example-thoughts.ts). It is intentionally NOT a live search bar: it shows
// the kind of one-sentence job you hand to Implexa, then cycles to the next.
// Respects prefers-reduced-motion by snapping between items with no typing.
//
// Honesty note: nothing here runs on the visitor's data. It only previews the
// sentence you would describe; the real run happens after install.

const TYPE_MS = 38;
const HOLD_MS = 1900;
const ERASE_MS = 16;

const KIND_LABEL: Record<ExampleThought["kind"], string> = {
  business: "run my business",
  chores: "do my chores",
  builder: "after the app",
};

export function ExampleThoughtsBox({
  thoughts = EXAMPLE_THOUGHTS,
}: {
  thoughts?: ExampleThought[];
}) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState("");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const current = thoughts[index]?.text ?? "";
    const local: number[] = [];

    const next = () => {
      const t = window.setTimeout(
        () => setIndex((i) => (i + 1) % thoughts.length),
        reduce ? 1600 : 320,
      );
      local.push(t);
    };

    if (reduce) {
      setShown(current);
      next();
      timers.current = local;
      return () => local.forEach((t) => window.clearTimeout(t));
    }

    // type in
    let i = 0;
    const typeTick = () => {
      i++;
      setShown(current.slice(0, i));
      if (i < current.length) {
        const t = window.setTimeout(typeTick, TYPE_MS);
        local.push(t);
      } else {
        // hold, then erase
        const hold = window.setTimeout(() => {
          let j = current.length;
          const eraseTick = () => {
            j--;
            setShown(current.slice(0, Math.max(0, j)));
            if (j > 0) {
              const t = window.setTimeout(eraseTick, ERASE_MS);
              local.push(t);
            } else {
              next();
            }
          };
          eraseTick();
        }, HOLD_MS);
        local.push(hold);
      }
    };
    setShown("");
    const start = window.setTimeout(typeTick, 240);
    local.push(start);

    timers.current = local;
    return () => local.forEach((t) => window.clearTimeout(t));
  }, [index, thoughts]);

  const kind = thoughts[index]?.kind ?? "business";

  return (
    <div className="w-full max-w-xl">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs uppercase tracking-wider text-zinc-500">
            describe a job
          </span>
          <span className="text-[10px] uppercase tracking-wider text-amber-300/80 border border-amber-900/40 bg-amber-500/5 rounded-full px-2 py-0.5">
            {KIND_LABEL[kind]}
          </span>
        </div>
        <div className="font-mono text-base sm:text-lg text-white leading-relaxed min-h-[3.5rem]">
          <span className="text-zinc-600 select-none mr-1.5">{">"}</span>
          {shown}
          <span className="inline-block w-[0.55ch] -mb-[2px] bg-amber-400 animate-pulse h-[1.05em] align-baseline ml-[1px]" />
        </div>
      </div>
      <p className="text-xs text-zinc-600 mt-2 text-center">
        Real examples. You describe it once, the agent runs it on its own.
      </p>
    </div>
  );
}
