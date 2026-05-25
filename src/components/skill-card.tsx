import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SkillCard as SkillCardData } from "@/lib/placeholder-data";

export function SkillCard({ skill }: { skill: SkillCardData }) {
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
            <Badge
              variant="secondary"
              className="text-[10px] bg-zinc-900 text-zinc-400 hover:bg-zinc-900"
            >
              {skill.tag}
            </Badge>
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
