import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SkillScore } from "@/lib/skill-score";

type Props = {
  score: SkillScore;
};

// Score breakdown bar — one row per dimension. Bar fills 0-10 width.
function ScoreBar({ label, value }: { label: string; value?: number | null }) {
  const v = typeof value === "number" ? Math.max(0, Math.min(10, value)) : 0;
  const pct = (v / 10) * 100;
  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="w-32 shrink-0 text-zinc-500">{label}</div>
      <div className="flex-1 h-1.5 rounded-full bg-zinc-900 overflow-hidden">
        <div
          className="h-full bg-zinc-300 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-10 shrink-0 text-right tabular-nums text-zinc-300">
        {v.toFixed(1)}
      </div>
    </div>
  );
}

export function SkillScorePanel({ score }: Props) {
  // Hard rule: if there's no display_score, render nothing (the page falls
  // back to a graceful "skill not yet scored" caption if needed).
  if (
    typeof score.display_score !== "number" ||
    Number.isNaN(score.display_score)
  ) {
    return null;
  }

  const display = score.display_score;
  const tier1 = score.tier_1;
  const tier2 = score.tier_2;

  const tier1Breakdown = tier1?.breakdown ?? {};
  const tier2Breakdown = tier2?.breakdown ?? undefined;

  // Color the headline number by the same bands as scoreBadgeStyle.
  let headlineClass = "text-zinc-200";
  if (display >= 9.0) headlineClass = "text-emerald-300";
  else if (display >= 5.0 && display < 7.0) headlineClass = "text-amber-300";
  else if (display < 5.0) headlineClass = "text-zinc-500";

  return (
    <Card className="bg-zinc-950 border-zinc-900 mb-10">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
              implexa quality score
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl font-semibold tabular-nums ${headlineClass}`}
              >
                {display.toFixed(1)}
              </span>
              <span className="text-sm text-zinc-500">/ 10</span>
              {tier2 ? (
                <Badge
                  variant="outline"
                  className="ml-2 text-[10px] border-zinc-800 text-zinc-400"
                >
                  dry-run tested
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="text-[11px] text-zinc-600">
            evaluated by implexa,{" "}
            {tier1?.model ? `${tier1.model}` : "haiku"}
            {tier1?.at
              ? ` · ${new Date(tier1.at).toISOString().slice(0, 10)}`
              : ""}
          </div>
        </div>

        {tier1?.summary ? (
          <p className="text-sm text-zinc-300 leading-relaxed mb-5">
            {tier1.summary}
          </p>
        ) : null}

        <div className="space-y-1.5 mb-5">
          <ScoreBar label="structure" value={tier1Breakdown.structure_score} />
          <ScoreBar
            label="trigger phrases"
            value={tier1Breakdown.trigger_score}
          />
          <ScoreBar label="procedure" value={tier1Breakdown.procedure_score} />
          <ScoreBar
            label="edge cases"
            value={tier1Breakdown.edge_case_score}
          />
          <ScoreBar
            label="documentation"
            value={tier1Breakdown.documentation_score}
          />
        </div>

        {tier1?.strengths?.length || tier1?.weaknesses?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 text-xs mb-1">
            {tier1?.strengths?.length ? (
              <div>
                <div className="uppercase tracking-wider text-zinc-500 mb-1.5 text-[10px]">
                  strengths
                </div>
                <ul className="space-y-1 text-zinc-300">
                  {tier1.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-400 mt-0.5 shrink-0">
                        +
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {tier1?.weaknesses?.length ? (
              <div>
                <div className="uppercase tracking-wider text-zinc-500 mb-1.5 text-[10px]">
                  weaknesses
                </div>
                <ul className="space-y-1 text-zinc-300">
                  {tier1.weaknesses.map((w, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-400 mt-0.5 shrink-0">
                        ~
                      </span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {tier2 && tier2Breakdown ? (
          <div className="mt-6 pt-5 border-t border-zinc-900">
            <div className="flex items-baseline gap-3 mb-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">
                dry-run review
              </div>
              {typeof tier2.overall === "number" ? (
                <div className="text-sm text-zinc-300 tabular-nums">
                  {tier2.overall.toFixed(1)} / 10
                </div>
              ) : null}
            </div>
            <div className="space-y-1.5 mb-4">
              <ScoreBar
                label="execution"
                value={tier2Breakdown.execution_score}
              />
              <ScoreBar
                label="output quality"
                value={tier2Breakdown.output_quality_score}
              />
              <ScoreBar
                label="usefulness"
                value={tier2Breakdown.usefulness_score}
              />
            </div>
            {tier2.review ? (
              <p className="text-sm text-zinc-300 leading-relaxed mb-3">
                {tier2.review}
              </p>
            ) : null}
            {tier2.inputs?.length ? (
              <div className="text-xs text-zinc-500">
                <span className="uppercase tracking-wider text-[10px]">
                  test scenario:
                </span>{" "}
                {tier2.inputs[0]?.scenario}
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
