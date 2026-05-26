import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, BarChart3, TrendingUp } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { absoluteUrl } from "@/lib/site";
import { jsonLdGraph, breadcrumbSchema, scoresPageSchema } from "@/lib/jsonld";

// /scores is the public leaderboard of SkillScore display scores. Renders a
// ranked table of every skill that has been tier-1 scored. Updates as the
// scoring batch progresses.

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

type ScoredSkill = {
  display_score: number;
  source: string;
  slug: string;
  name: string | null;
  description: string | null;
  tier_1_summary: string | null;
  install_count: number | null;
  star_count: number | null;
};

type SearchParams = {
  source?: string | string[];
  page?: string | string[];
};

async function fetchScoredSkills(
  sourceFilter: string,
  offset: number,
  limit: number,
): Promise<ScoredSkill[]> {
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
          name: "list_skill_scores",
          arguments: {
            ...(sourceFilter ? { source: sourceFilter } : {}),
            offset,
            limit,
            sort: "display_score",
          },
        },
      }),
      signal: AbortSignal.timeout(10000),
      // Cache for 5 min at edge; scores are batched in not per-request.
      next: { revalidate: 300 },
    });
    if (!upstream.ok) return [];

    const text = await upstream.text();
    const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
    const jsonStr = dataLine ? dataLine.slice(6) : text;
    const body: { result?: { content?: Array<{ text?: string }> } } =
      JSON.parse(jsonStr);
    const raw = body?.result?.content?.[0]?.text ?? "{}";
    const parsed: { scores?: ScoredSkill[] } = JSON.parse(raw);
    return Array.isArray(parsed?.scores) ? parsed.scores : [];
  } catch {
    return [];
  }
}

export async function generateMetadata(props: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await props.searchParams;
  const source = typeof sp.source === "string" ? sp.source : "";
  return {
    title: source ? `top ${source} skills` : "top-rated skills",
    description:
      "the SkillRank leaderboard across the cross-vendor skill graph. multi-signal ranking from structural quality + semantic match + cohort signals.",
    alternates: { canonical: "/scores" },
    openGraph: {
      type: "website",
      url: absoluteUrl("/scores"),
      title: source
        ? `top ${source} skills | implexa`
        : "top-rated skills | implexa",
      description:
        "the SkillRank leaderboard across the cross-vendor skill graph.",
    },
  };
}

function scoreColor(score: number): string {
  if (score >= 9) return "text-emerald-400";
  if (score >= 7) return "text-white";
  if (score >= 5) return "text-amber-400";
  return "text-zinc-500";
}

const SOURCES = ["all", "anthropic", "smithery", "clawhub", "skills.sh", "agentskills"];

export default async function ScoresPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const sourceFilter =
    typeof sp.source === "string" ? sp.source : "";
  const pageParam =
    typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const PER_PAGE = 50;
  const offset = (page - 1) * PER_PAGE;

  const scores = await fetchScoredSkills(sourceFilter, offset, PER_PAGE);
  const hasResults = scores.length > 0;

  // JSON-LD with actual ranked entries when populated. ItemList carousel-eligible.
  const ldJson = jsonLdGraph(
    scoresPageSchema(
      scores.slice(0, 10).map((s) => ({
        position: offset + scores.indexOf(s) + 1,
        name: s.name ?? s.slug,
        url: absoluteUrl(`/s/${s.source}/${s.slug}`),
        score: s.display_score,
      })),
    ),
    breadcrumbSchema([
      { name: "implexa", url: absoluteUrl("/") },
      { name: "scores", url: absoluteUrl("/scores") },
    ]),
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back home
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <BarChart3 className="size-6 text-zinc-400" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            top-rated skills
          </h1>
        </div>
        <p className="text-lg text-zinc-400 max-w-2xl mb-8">
          the SkillScore leaderboard across the cross-vendor skill graph.
          ranked by structural quality: components present, trigger clarity,
          procedure depth, edge-case coverage, documentation polish.
        </p>

        {/* source filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SOURCES.map((s) => {
            const active = s === "all" ? !sourceFilter : sourceFilter === s;
            return (
              <Link
                key={s}
                href={s === "all" ? "/scores" : `/scores?source=${encodeURIComponent(s)}`}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  active
                    ? "bg-white text-black"
                    : "border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-950"
                }`}
              >
                {s}
              </Link>
            );
          })}
        </div>

        {hasResults ? (
          <>
            <div className="overflow-x-auto rounded-lg border border-zinc-900 bg-zinc-950">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-900 bg-zinc-950">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-zinc-500 text-xs uppercase tracking-wider w-12">#</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-500 text-xs uppercase tracking-wider w-20">score</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-500 text-xs uppercase tracking-wider w-24">source</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-500 text-xs uppercase tracking-wider">skill</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, i) => (
                    <tr
                      key={`${s.source}/${s.slug}`}
                      className="border-b border-zinc-900 last:border-b-0 hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-zinc-500 tabular-nums">
                        {offset + i + 1}
                      </td>
                      <td className={`py-3 px-4 font-semibold tabular-nums ${scoreColor(s.display_score)}`}>
                        {s.display_score.toFixed(1)}
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
                          ) : null}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* simple pagination */}
            <div className="mt-6 flex items-center justify-between">
              <Link
                href={
                  page > 1
                    ? `/scores?${sourceFilter ? `source=${sourceFilter}&` : ""}page=${page - 1}`
                    : "#"
                }
                className={`px-4 py-2 text-sm rounded-md ${
                  page > 1
                    ? "border border-zinc-800 text-zinc-300 hover:bg-zinc-950 hover:text-white"
                    : "text-zinc-700 cursor-not-allowed"
                }`}
                aria-disabled={page <= 1}
              >
                previous
              </Link>
              <span className="text-sm text-zinc-500">
                page {page} (showing {scores.length})
              </span>
              <Link
                href={
                  scores.length >= PER_PAGE
                    ? `/scores?${sourceFilter ? `source=${sourceFilter}&` : ""}page=${page + 1}`
                    : "#"
                }
                className={`px-4 py-2 text-sm rounded-md ${
                  scores.length >= PER_PAGE
                    ? "border border-zinc-800 text-zinc-300 hover:bg-zinc-950 hover:text-white"
                    : "text-zinc-700 cursor-not-allowed"
                }`}
                aria-disabled={scores.length < PER_PAGE}
              >
                next
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-8 text-center">
            <TrendingUp className="size-8 text-zinc-700 mx-auto mb-4" aria-hidden="true" />
            <p className="text-base text-white mb-2">
              {sourceFilter ? `no scored skills yet for ${sourceFilter}` : "scoring in progress"}
            </p>
            <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
              the scoring batch grades every indexed skill with Haiku. results
              appear here as soon as a skill is scored. check back in a few
              minutes.
            </p>
            <Link href="/" className="text-sm text-white hover:underline inline-flex items-center gap-1">
              browse the index
            </Link>
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
