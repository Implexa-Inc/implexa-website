import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SkillCard as SkillCardData } from "@/lib/placeholder-data";
import { scoreBadgeStyle } from "@/lib/skill-score";

export function SkillCard({ skill }: { skill: SkillCardData }) {
  // Subtle score badge: green at 9+, neutral at 7-8.9, amber at 5-6.9, hide
  // entirely below 5 (don't shame). Returns null for the hide case.
  const badge = scoreBadgeStyle(skill.score);

  // 2026-05-27: restructured to have TWO independent links inside the card:
  //   - main body (header + title + description) → /s/<source>/<slug>
  //   - author byline → /u/<author>
  // The old version wrapped everything in one parent <Link>, which made the
  // author byline navigate to the skill page instead of the author page. We
  // can't nest <Link> (invalid HTML), so the card is a styled div + the
  // children are independent Links. The "group" hover semantics are now
  // owned by the inner body Link, not the card itself, which is fine
  // because the byline shouldn't share that hover state anyway (different
  // destination).
  return (
    <Card className="h-full bg-zinc-950 border-zinc-900 hover:border-zinc-700 transition-colors">
      <Link
        href={`/s/${skill.source}/${skill.slug}`}
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-t-lg"
      >
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
        </CardContent>
      </Link>
      {skill.author ? (
        <div className="px-6 pb-4 -mt-2">
          <Link
            href={`/u/${encodeURIComponent(skill.author)}`}
            className="text-xs text-zinc-500 hover:text-amber-300 transition-colors"
          >
            by @{skill.author}
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
