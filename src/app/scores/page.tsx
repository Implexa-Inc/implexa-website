import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { fetchLeaderboard, scoreBadgeStyle } from "@/lib/skill-score";

// The /scores leaderboard. Server-rendered, cached for 5 min, paginated via
// ?page=N&source=X&sort=Y query params. THE second SEO surface: a single page
// that aggregates "best AI agent skills, scored by implexa" — exactly the
// kind of comparative/listicle content answer engines love to cite from.

type SearchParams = {
  page?: string | string[];
  source?: string | string[];
  sort?: string | string[];
};

const PAGE_SIZE = 50;

const VALID_SOURCES = [
  "anthropic",
  "agentskills",
  "clawhub",
  "skills.sh",
  "smithery",
  "github",
  "cursor",
  "continue",
] as const;

function pickString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

export const metadata: Metadata = {
  title: "skill leaderboard | implexa",
  description:
    "every indexed AI agent skill, scored by implexa. structural quality + dry-run testing. cross-vendor: anthropic, smithery, clawhub, skills.sh.",
  openGraph: {
    type: "website",
    title: "skill leaderboard | implexa",
    description:
      "every indexed AI agent skill, scored by implexa. cross-vendor.",
  },
};

export default async function ScoresPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const page = Math.max(1, parseInt(pickString(sp.page) ?? "1", 10) || 1);
  const sourceFilter = pickString(sp.source);
  const sourceFilterValid =
    sourceFilter && (VALID_SOURCES as readonly string[]).includes(sourceFilter)
      ? sourceFilter
      : undefined;
  const sortParam =
    pickString(sp.sort) === "tier_2_overall"
      ? "tier_2_overall"
      : "display_score";

  // Pull one extra row so we can tell whether a "next page" exists without a
  // separate count query.
  const rows = await fetchLeaderboard({
    source: sourceFilterValid,
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE + 1,
    sort: sortParam,
  });
  const hasNext = rows.length > PAGE_SIZE;
  const pageRows = rows.slice(0, PAGE_SIZE);

  // Aggregate JSON-LD for the leaderboard itself: ItemList schema lets
  // answer engines understand the ranking and cite "implexa ranked X #1".
  const itemListJsonLd =
    pageRows.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": sourceFilterValid
            ? `top scored ${sourceFilterValid} skills`
            : "top scored AI agent skills",
          "numberOfItems": pageRows.length,
          "itemListElement": pageRows.map((r, i) => ({
            "@type": "ListItem",
            "position": (page - 1) * PAGE_SIZE + i + 1,
            "url": `https://implexa.ai/s/${r.source}/${r.slug}`,
            "name": r.name,
          })),
        }
      : null;

  function pageHref(opts: {
    page?: number;
    source?: string | null;
    sort?: string;
  }) {
    const qs = new URLSearchParams();
    const p = opts.page ?? page;
    if (p > 1) qs.set("page", String(p));
    const s =
      opts.source === null
        ? undefined
        : (opts.source ?? sourceFilterValid);
    if (s) qs.set("source", s);
    const so = opts.sort ?? sortParam;
    if (so !== "display_score") qs.set("sort", so);
    const q = qs.toString();
    return q ? `/scores?${q}` : "/scores";
  }

  return (
    <>
      {itemListJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-6"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-2">
          skill leaderboard
        </h1>
        <p className="text-zinc-400 max-w-2xl mb-8">
          every indexed AI agent skill, scored by implexa across structural
          quality and (for the top 100) dry-run testing. cross-vendor, no
          vendor picks the score.
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs uppercase tracking-wider text-zinc-500 mr-1">
            source:
          </span>
          <Link
            href={pageHref({ page: 1, source: null })}
            className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs ${
              !sourceFilterValid
                ? "border-zinc-700 bg-zinc-900 text-white"
                : "border-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            all
          </Link>
          {VALID_SOURCES.map((src) => (
            <Link
              key={src}
              href={pageHref({ page: 1, source: src })}
              className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs ${
                sourceFilterValid === src
                  ? "border-zinc-700 bg-zinc-900 text-white"
                  : "border-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {src}
            </Link>
          ))}
          <span className="ml-auto text-xs uppercase tracking-wider text-zinc-500">
            sort:
          </span>
          <Link
            href={pageHref({ page: 1, sort: "display_score" })}
            className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs ${
              sortParam === "display_score"
                ? "border-zinc-700 bg-zinc-900 text-white"
                : "border-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            overall
          </Link>
          <Link
            href={pageHref({ page: 1, sort: "tier_2_overall" })}
            className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs ${
              sortParam === "tier_2_overall"
                ? "border-zinc-700 bg-zinc-900 text-white"
                : "border-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            dry-run only
          </Link>
        </div>

        {pageRows.length === 0 ? (
          <p className="text-sm text-zinc-500">
            no scored skills yet. the scoring batch may still be running, or
            the source filter has no matches.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-900">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3 w-12">#</th>
                  <th className="px-4 py-3">skill</th>
                  <th className="px-4 py-3 hidden sm:table-cell">source</th>
                  <th className="px-4 py-3 text-right">score</th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">
                    dry-run
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r, i) => {
                  const overallBadge = scoreBadgeStyle(r.display_score);
                  const tier2Badge = scoreBadgeStyle(r.tier_2_overall);
                  const rank = (page - 1) * PAGE_SIZE + i + 1;
                  return (
                    <tr
                      key={`${r.source}/${r.slug}`}
                      className="border-t border-zinc-900 hover:bg-zinc-950/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-zinc-500 tabular-nums">
                        {rank}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/s/${r.source}/${r.slug}`}
                          className="text-white hover:underline font-medium"
                        >
                          {r.name || r.slug}
                        </Link>
                        {r.description ? (
                          <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                            {r.description}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
                        >
                          {r.source}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {overallBadge ? (
                          <span
                            className={`inline-flex items-center justify-center min-w-12 px-2 py-0.5 rounded-md border text-xs tabular-nums ${overallBadge.className}`}
                          >
                            {overallBadge.label}
                          </span>
                        ) : (
                          <span className="text-zinc-700 tabular-nums">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        {tier2Badge ? (
                          <span
                            className={`inline-flex items-center justify-center min-w-12 px-2 py-0.5 rounded-md border text-xs tabular-nums ${tier2Badge.className}`}
                          >
                            {tier2Badge.label}
                          </span>
                        ) : (
                          <span className="text-zinc-700">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 text-sm">
          <div className="text-zinc-500">page {page}</div>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={pageHref({ page: page - 1 })}
                className="px-3 py-1.5 rounded-md border border-zinc-900 text-zinc-400 hover:text-white"
              >
                previous
              </Link>
            ) : null}
            {hasNext ? (
              <Link
                href={pageHref({ page: page + 1 })}
                className="px-3 py-1.5 rounded-md border border-zinc-900 text-zinc-400 hover:text-white"
              >
                next
              </Link>
            ) : null}
          </div>
        </div>

        <p className="text-xs text-zinc-600 mt-10 max-w-2xl">
          scoring methodology: tier 1 (structural) evaluates every skill on
          structure, trigger phrases, procedure, edge cases, and
          documentation, scored by claude haiku without executing the skill.
          tier 2 (dry-run) runs the top 100 skills against generated test
          inputs and grades execution, output quality, and usefulness.
          re-scored when the upstream SKILL.md changes.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
