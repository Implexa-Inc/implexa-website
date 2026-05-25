import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SkillCard as SkillCardData } from "@/lib/placeholder-data";
import { scoreBadgeStyle } from "@/lib/skill-score";

export function SkillCard({ skill }: { skill: SkillCardData }) {
  // Subtle score badge: green at 9+, neutral at 7-8.9, amber at 5-6.9, hide
  // entirely below 5 (don't shame). Returns null for the hide case.
  const badge = scoreBadgeStyle(skill.score);

  return (
    <Link
      href={`/s/${skill.source}/${skill.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-lg"
    >
      <Card className="h-full bg-zinc-950 border-zinc-900 hover:border-zinc-700 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
            >
              {skill.source}
            </Badge>
            <div className="flex items-center gap-1.5">
              {badge ? (
                <span
                  title={`implexa score ${badge.label}/10`}
                  className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded border text-[10px] tabular-nums ${badge.className}`}
                >
                  {badge.label}
                </span>
              ) : null}
              <Badge
                variant="secondary"
                className="text-[10px] bg-zinc-900 text-zinc-400 hover:bg-zinc-900"
              >
                {skill.tag}
              </Badge>
            </div>
          </div>
          <CardTitle className="text-base font-medium text-white group-hover:text-zinc-100">
            {skill.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-zinc-400 line-clamp-3">
            {skill.description}
          </p>
          <p className="mt-3 text-xs text-zinc-500">by @{skill.author}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
