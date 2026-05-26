"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComponentRow } from "@/lib/skill-enrichment";

type Props = {
  rows: ComponentRow[];
};

function ComponentBar({ label, score }: { label: string; score: number }) {
  const v = Math.max(0, Math.min(10, score));
  const pct = (v / 10) * 100;
  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="w-32 shrink-0 text-zinc-500">{label}</div>
      <div className="flex-1 h-1.5 rounded-full bg-zinc-900 overflow-hidden">
        <div
          className="h-full bg-emerald-400/70 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-10 shrink-0 text-right tabular-nums text-zinc-300">
        {v.toFixed(0)}/10
      </div>
    </div>
  );
}

// Client-only piece of the enrichment panel. Holds the expand/collapse state
// for the "what we improved" scorecard so the parent panel can stay a server
// component (markdown rendering is server-side).
export function ComponentsToggle({ rows }: Props) {
  const [open, setOpen] = useState(false);
  if (!rows.length) return null;
  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1"
        aria-expanded={open}
      >
        see what we improved
        <ChevronDown
          className={cn(
            "size-3 transition-transform",
            open ? "rotate-180" : "",
          )}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <Card className="bg-zinc-950 border-zinc-900 mt-3 w-full sm:w-[420px]">
          <CardContent className="pt-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
              component coverage (post-enrichment)
            </div>
            <div className="space-y-1.5">
              {rows.map((r) => (
                <ComponentBar key={r.key} label={r.label} score={r.score} />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
