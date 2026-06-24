import type { AgentGrade } from "@/lib/agent-grade";

// The proof-layer grade, the moat made public: "delivered N% across M real runs."
// Renders nothing without a real grade (the index refuses to flatter a thin
// history, and the public floor hides single-user agents).

const TONE: Record<AgentGrade["label"], string> = {
  reliable: "border-emerald-500/30 bg-emerald-950/20 text-emerald-300",
  mixed: "border-amber-500/30 bg-amber-950/20 text-amber-300",
  unproven: "border-zinc-800 bg-zinc-950/40 text-zinc-400",
};

export function AgentGradeBadge({
  grade,
  size = "md",
}: {
  grade: AgentGrade | null | undefined;
  size?: "sm" | "md";
}) {
  if (!grade?.hasGrade) return null;
  const pct = Math.round(grade.rate * 100);
  const tone = TONE[grade.label] ?? TONE.unproven;
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${pad} ${tone}`}
      title={`Delivered ${pct}% across ${grade.runs} real run${grade.runs === 1 ? "" : "s"}, graded on what actually happened, not a benchmark`}
    >
      <span aria-hidden>✓</span> delivered {pct}%
      <span className="font-normal opacity-70">
        · {grade.runs} run{grade.runs === 1 ? "" : "s"}
      </span>
    </span>
  );
}
