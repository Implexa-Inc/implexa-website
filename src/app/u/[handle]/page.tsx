import Link from "next/link";
import type { Metadata } from "next";
// lucide-react doesn't export "Github" (legacy/removed). The brand-icon
// for github lives in the "simple-icons" set on newer lucide builds, but
// we don't ship that; using a generic external-link glyph instead, which
// keeps the chip readable + bundle small.
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/site";
import { jsonLdGraph, breadcrumbSchema } from "@/lib/jsonld";
import { aggregateRepoMetrics } from "@/lib/parent-repo";

// /u/[handle] — author page. Lists every skill credited to an author,
// ranked by SkillRank.
//
// 2026-05-27: replaced the previous P3-wiki placeholder with a real
// data-backed page. Each /u/* URL is now an indexable SEO surface
// ranking for "[author] claude skills" queries — that's ~11k+ new
// pages from existing data alone, growing as we backfill clawhub
// authors and onboard new sources.
//
// Data path: hits list_skills_by_author MCP tool (added in same
// release). Falls back to a clean "no skills found" state if the
// handle has zero matches (typo, unknown author, or scoring lag).

type RouteParams = { handle: string };

type AuthorSkill = {
  id: string;
  source: string;
  slug: string;
  name: string | null;
  description: string | null;
  author: string;
  source_url: string | null;
  install_count: number | null;
  star_count: number | null;
  last_seen_at: string | null;
  display_score: number | null;
  tier_1_summary: string | null;
};

type ListByAuthorEnvelope = {
  ok?: boolean;
  count?: number;
  rows?: AuthorSkill[];
};

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

async function fetchAuthorSkills(handle: string): Promise<AuthorSkill[]> {
  if (!TOKEN) return [];
  try {
    const upstream = await fetch(`${BACKEND}/api/v2/mcp`, {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
        authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "list_skills_by_author",
          arguments: { author: handle },
        },
      }),
      signal: AbortSignal.timeout(10_000),
      // Cache author pages for 24h. SkillRank re-ranks daily; author
      // composition (which skills a person has authored) changes at most
      // daily once the catalog stabilizes. Author pages are 11k+ surfaces
      // and were the biggest single contributor to Vercel Fluid CPU burn
      // when ISR was at 10 min. Bumped to 86400 (24h) 2026-05-28 after
      // free-tier 50% warning.
      next: { revalidate: 86400 },
    });
    if (!upstream.ok) return [];
    const text = await upstream.text();
    const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
    const jsonStr = dataLine ? dataLine.slice(6) : text;
    const body: { result?: { content?: Array<{ text?: string }> } } =
      JSON.parse(jsonStr);
    const raw = body?.result?.content?.[0]?.text ?? "{}";
    const parsed: ListByAuthorEnvelope = JSON.parse(raw);
    return Array.isArray(parsed?.rows) ? parsed.rows : [];
  } catch {
    return [];
  }
}

// Aligned with the badge route's tierFor (2026-05-28) so a row's score
// color on the author page matches the badge color they'd embed.
function scoreColor(score: number | null): string {
  if (score === null) return "text-zinc-600";
  if (score >= 9) return "text-emerald-400";
  if (score >= 8) return "text-emerald-300";
  if (score >= 7) return "text-white";
  if (score >= 5) return "text-amber-400";
  return "text-zinc-500";
}

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { handle } = await props.params;
  const skills = await fetchAuthorSkills(handle);
  const totalSkills = skills.length;
  const topScored = skills.find((s) => typeof s.display_score === "number");
  const sources = Array.from(new Set(skills.map((s) => s.source)));

  const titleBase = totalSkills > 0
    ? `${handle} (${totalSkills} skill${totalSkills === 1 ? "" : "s"} ranked by SkillRank)`
    : `${handle}`;

  const descBase = totalSkills > 0
    ? `${totalSkills} AI skill${totalSkills === 1 ? "" : "s"} by ${handle}, ranked by SkillRank across ${sources.length} source${sources.length === 1 ? "" : "s"}.${topScored ? ` Top scored: ${topScored.name ?? topScored.slug} at ${topScored.display_score?.toFixed(1)}/10.` : ""}`
    : `contributor profile for ${handle} on implexa. browse + run any of 40k+ vetted AI skills indexed from anthropic, smithery, clawhub, skills.sh, and github.`;

  return {
    title: titleBase,
    description: descBase,
    alternates: { canonical: `/u/${handle}` },
    // Now that this is real data, allow indexing. Author pages own
    // "[author] claude skills" SERP queries.
    robots: { index: totalSkills > 0, follow: true },
    openGraph: {
      type: "profile",
      url: absoluteUrl(`/u/${handle}`),
      title: titleBase + " | implexa",
      description: descBase,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary",
      title: titleBase,
      description: descBase,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

export default async function AuthorPage(props: {
  params: Promise<RouteParams>;
}) {
  const { handle } = await props.params;
  const skills = await fetchAuthorSkills(handle);

  const totalSkills = skills.length;
  const scoredSkills = skills.filter((s) => typeof s.display_score === "number");
  const avgScore = scoredSkills.length > 0
    ? scoredSkills.reduce((acc, s) => acc + (s.display_score ?? 0), 0) / scoredSkills.length
    : null;
  const sources = Array.from(new Set(skills.map((s) => s.source)));
  // Dedupe star_count + install_count by parent repo before summing.
  // skills.sh and github (anthropic) store repo-level metrics on every
  // child row; naïve sum was off by ~50x. aggregateRepoMetrics groups
  // by parent_repo_key and counts once per unique parent. Rows with no
  // parent grouping (clawhub, agentskills, implexa) count as their own
  // standalone unit.
  const { stars: totalStars, installs: totalInstalls, repoCount } =
    aggregateRepoMetrics(skills);

  // Heuristic: skills.sh + smithery authors with valid-github-username
  // handles are often the same handle on github too. We probe-link to
  // github.com/<handle>; if the account doesn't exist, the user gets a
  // github 404 (not our problem) — but for the ~70-80% who DO match
  // we just earned a quality outbound + signal that we're a graph,
  // not a walled garden.
  const githubProbeUrl = /^[a-zA-Z0-9_-]{1,39}$/.test(handle)
    ? `https://github.com/${handle}`
    : null;

  const ldJson = jsonLdGraph(
    breadcrumbSchema([
      { name: "implexa", url: absoluteUrl("/") },
      { name: "leaderboard", url: absoluteUrl("/scores") },
      { name: `@${handle}`, url: absoluteUrl(`/u/${handle}`) },
    ]),
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-12">
        <Link
          href="/scores"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back to leaderboard
        </Link>

        {/* author header — avatar (initials), handle, summary line */}
        <div className="flex flex-wrap items-start gap-5 mb-8">
          <div className="size-16 sm:size-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl sm:text-2xl font-semibold text-zinc-300 shrink-0">
            {handle.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-1 break-words">
              @{handle}
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              {totalSkills > 0 ? (
                <>contributor on implexa, with {totalSkills} skill{totalSkills === 1 ? "" : "s"} ranked by{" "}
                  <Link
                    href="/resources/skill-rank"
                    className="text-zinc-300 hover:text-amber-300 transition-colors underline decoration-amber-400/40 decoration-1 underline-offset-2"
                  >
                    SkillRank
                  </Link>{" "}across {sources.length} source{sources.length === 1 ? "" : "s"}.</>
              ) : (
                <>nothing indexed under this handle yet. either it&apos;s a typo, the author hasn&apos;t been scored, or we haven&apos;t crawled their work.</>
              )}
            </p>
          </div>
        </div>

        {/* external links + source chips. only render if we have a
            plausible github handle (the handle regex test passed). */}
        {githubProbeUrl ? (
          <div className="mb-10 flex flex-wrap items-center gap-2">
            <Link
              href={githubProbeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/40 rounded-full px-3 py-1 transition-colors"
            >
              {handle} on github
              <ExternalLink className="size-3 opacity-60" aria-hidden="true" />
            </Link>
            {sources.map((src) => (
              <Badge
                key={src}
                variant="outline"
                className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
              >
                publishes to {src}
              </Badge>
            ))}
          </div>
        ) : null}

        {/* stat cards — all four now correctly accounted for. Stars +
            installs are deduped by parent_repo_key (see lib/parent-repo)
            so a 50-file skills.sh repo counts its 13,500 stars once,
            not 50 times. */}
        {totalSkills > 0 ? (
          <div className="grid gap-3 sm:grid-cols-4 mb-10">
            <StatCard label="skills" value={totalSkills.toString()} />
            <StatCard
              label="avg SkillRank"
              value={avgScore !== null ? avgScore.toFixed(1) : "—"}
              hint={`${scoredSkills.length} scored / ${totalSkills} total`}
            />
            <StatCard
              label="total stars"
              value={totalStars > 0 ? totalStars.toLocaleString() : "—"}
              hint={`across ${repoCount} repo${repoCount === 1 ? "" : "s"}`}
            />
            <StatCard
              label="total installs"
              value={totalInstalls > 0 ? totalInstalls.toLocaleString() : "—"}
              hint={`across ${repoCount} repo${repoCount === 1 ? "" : "s"}`}
            />
          </div>
        ) : null}

        {/* skills list — the actual catalog */}
        {totalSkills > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">
              skills, ranked by SkillRank
            </h2>
            <div className="overflow-x-auto rounded-lg border border-zinc-900 bg-zinc-950">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-900 bg-zinc-950">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-zinc-500 text-xs uppercase tracking-wider w-20">score</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-500 text-xs uppercase tracking-wider w-24">source</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-500 text-xs uppercase tracking-wider">skill</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-zinc-900 last:border-b-0 hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className={`py-3 px-4 font-semibold tabular-nums ${scoreColor(s.display_score)}`}>
                        {s.display_score !== null ? s.display_score.toFixed(1) : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-zinc-400 font-mono">{s.source}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/s/${s.source}/${s.slug}`}
                          className="block group"
                        >
                          <div className="text-white group-hover:text-zinc-100 font-medium">
                            {s.name || s.slug}
                          </div>
                          {s.tier_1_summary ? (
                            <div className="text-xs text-zinc-500 mt-0.5 line-clamp-2 max-w-2xl">
                              {s.tier_1_summary}
                            </div>
                          ) : s.description ? (
                            <div className="text-xs text-zinc-500 mt-0.5 line-clamp-2 max-w-2xl">
                              {s.description}
                            </div>
                          ) : null}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          // empty state — keep friendly + helpful, not 404-y. nudges
          // the visitor back to /scores or /search where they have
          // a chance of finding what they were after.
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-8 text-center">
            <p className="text-base text-white mb-2">no skills found for @{handle}</p>
            <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
              the skill index might not have crawled their work yet, or the
              handle is spelled differently in our data. browse the full
              catalog or search the cross-vendor graph.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/scores"
                className="text-sm text-white hover:underline"
              >
                browse leaderboard →
              </Link>
              <Link
                href="/search"
                className="text-sm text-white hover:underline"
              >
                search skills →
              </Link>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson }}
      />
    </>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="bg-zinc-950 border-zinc-900">
      <CardContent className="pt-5 pb-5">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
          {label}
        </div>
        <div className="text-2xl font-semibold text-white tabular-nums">
          {value}
        </div>
        {hint ? (
          <div className="text-[11px] text-zinc-600 mt-1">{hint}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
