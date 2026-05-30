import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, GitFork, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RunInClaudeButton } from "@/components/run-in-claude-button";
import { SkillScorePanel } from "@/components/skill-score-panel";
import { SkillEnrichmentPanel } from "@/components/skill-enrichment-panel";
import { fetchSkillScore } from "@/lib/skill-score";
import {
  fetchSkillEnrichment,
  firstParagraphOf,
} from "@/lib/skill-enrichment";
import { SkillCard } from "@/components/skill-card";
import { ModuleCard } from "@/components/module-card";
import type { TrustTier } from "@/lib/module-verification";
import { absoluteUrl } from "@/lib/site";
import {
  jsonLdGraph,
  breadcrumbSchema,
  softwareApplicationSchema,
} from "@/lib/jsonld";
import { fetchRelatedSkills } from "@/lib/skill-catalog";

type RouteParams = { source: string; slug: string };

// Module entry as declared by SKILL.md frontmatter, surfaced verbatim by the
// backend's get_aggregated_skill tool (lifted out of frontmatter). Absent on
// legacy / procedure-only skills, where the modules rail no-ops.
// Shape mirrors the verify_module output we render on /m/<ecosystem>/<pkg>.
type SkillModuleDeclaration = {
  ecosystem: string;
  package: string;
  version_range?: string | null;
  license_spdx?: string | null;
  trust_tier?: TrustTier | null;
};

type AggregatedSkill = {
  ok: boolean;
  id?: string;
  source?: string;
  slug?: string;
  name?: string;
  description?: string;
  content?: string;
  author?: string;
  source_url?: string;
  install_count?: number | null;
  star_count?: number | null;
  last_seen_at?: string;
  is_active?: boolean;
  // Populated by the backend's get_aggregated_skill tool when the skill's
  // frontmatter declares `modules:`. Absent on legacy / procedure-only
  // skills; the rail renders nothing for those (no empty state).
  modules?: SkillModuleDeclaration[];
  error?: string;
};

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

// Server-side fetch of one aggregated_skills row via the get_aggregated_skill
// MCP tool. Read-only, no side effects. Returns null on any failure path so
// the detail page can fall back to a graceful 404 / placeholder state.
async function fetchAggregatedSkill(
  source: string,
  slug: string,
): Promise<AggregatedSkill | null> {
  if (!TOKEN) return null;

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
          name: "get_aggregated_skill",
          arguments: { source, slug },
        },
      }),
      signal: AbortSignal.timeout(10000),
      // Cache at the edge for 6 hours. Detail page content rarely changes
      // (crawler refreshes nightly), and there are 40k+ such pages — at 5 min
      // ISR they were the second-biggest Fluid CPU consumer after author
      // pages. Bumped 2026-05-28 from 300s → 21600s after Vercel free-tier
      // warning. Cuts function invocations on this route by 72x.
      next: { revalidate: 21600 },
    });

    if (!upstream.ok) return null;

    const text = await upstream.text();
    const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
    const jsonStr = dataLine ? dataLine.slice(6) : text;
    const body: { result?: { content?: Array<{ text?: string }> } } =
      JSON.parse(jsonStr);
    const raw = body?.result?.content?.[0]?.text ?? "{}";
    const parsed: AggregatedSkill = JSON.parse(raw);
    if (!parsed?.ok) return null;
    // modules[] arrives directly off get_aggregated_skill (the backend lifts
    // it out of frontmatter); the rail reads skill.modules verbatim.
    return parsed;
  } catch {
    return null;
  }
}

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { source, slug } = await props.params;
  // Enrichment fetched in parallel with the base skill. When an enriched
  // version exists, its first paragraph beats the raw description for SEO
  // (unique authored text > scraped upstream blurb).
  const [skill, enrichment] = await Promise.all([
    fetchAggregatedSkill(source, slug),
    fetchSkillEnrichment(source, slug),
  ]);
  const title = skill?.name ?? slug.replace(/-/g, " ");
  const enrichedDesc =
    enrichment?.enriched && enrichment.enriched_content
      ? firstParagraphOf(enrichment.enriched_content, 200)
      : "";
  const description =
    enrichedDesc ||
    skill?.description ||
    `${title}, a SKILL.md from ${source}. one-click install to claude code, codex, or cursor via implexa.`;
  const canonicalPath = `/s/${source}/${slug}`;

  return {
    title: `${title} (${source})`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      url: absoluteUrl(canonicalPath),
      title: `${title} | implexa`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | implexa`,
      description,
    },
  };
}

export default async function SkillDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const { source, slug } = await props.params;
  // Fetch skill + score + enrichment in parallel. All three are independent
  // of each other; serializing would compound latency for no reason. Each
  // helper returns null on failure so partial state still renders.
  const [skill, score, enrichment] = await Promise.all([
    fetchAggregatedSkill(source, slug),
    fetchSkillScore(source, slug),
    fetchSkillEnrichment(source, slug),
  ]);

  // If the backend doesn't recognize this (source, slug), render 404 so we
  // don't pollute Google with placeholder pages for skills we don't have.
  if (!skill) {
    notFound();
  }

  // Related skills run in parallel with whatever else this page does. We
  // don't await up-top because the rail can render empty if it fails; the
  // page still works without it.
  const related = await fetchRelatedSkills(source, slug, 5);

  const title = skill.name ?? slug.replace(/-/g, " ");
  const description = skill.description ?? "";
  const content = skill.content ?? "";
  const sourceUrl =
    skill.source_url ??
    `https://github.com/search?q=path%3A**%2FSKILL.md+${encodeURIComponent(title)}`;
  const installs =
    typeof skill.install_count === "number" ? skill.install_count : null;
  const stars =
    typeof skill.star_count === "number" ? skill.star_count : null;

  // Build unified JSON-LD graph for this page. Combines SoftwareApplication
  // + BreadcrumbList (SEO foundation) with Review + AggregateRating (SkillScore
  // AEO weapon) when score data is available. Single @graph block — AI
  // assistants + Google parse this as one semantically-linked entity set.
  const hasScore =
    score?.scored === true &&
    typeof score.display_score === "number" &&
    !Number.isNaN(score.display_score);

  const baseSchemas: Array<Record<string, unknown>> = [
    softwareApplicationSchema({
      source,
      slug,
      name: skill.name,
      description: skill.description,
      author: skill.author,
      source_url: skill.source_url,
      install_count: skill.install_count ?? null,
      star_count: skill.star_count ?? null,
      last_seen_at: skill.last_seen_at,
    }),
    breadcrumbSchema([
      { name: "implexa", url: absoluteUrl("/") },
      { name: "skills", url: absoluteUrl("/search") },
      { name: source, url: absoluteUrl(`/search?q=${encodeURIComponent(source)}`) },
      { name: title, url: absoluteUrl(`/s/${source}/${slug}`) },
    ]),
  ];

  const reviewSchemas: Array<Record<string, unknown>> = hasScore
    ? [
        {
          "@type": "Review",
          "itemReviewed": {
            "@type": "SoftwareApplication",
            "name": title,
            "applicationCategory": "AI Agent Skill",
            "operatingSystem": "Cross-platform",
          },
          "author": { "@type": "Organization", "name": "Implexa" },
          "datePublished":
            score?.tier_1?.at ?? score?.updated_at ?? undefined,
          "reviewBody": score?.tier_1?.summary ?? "",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": score?.display_score,
            "bestRating": 10,
            "worstRating": 0,
          },
        },
        {
          "@type": "AggregateRating",
          "itemReviewed": {
            "@type": "SoftwareApplication",
            "name": title,
            "applicationCategory": "AI Agent Skill",
          },
          "ratingValue": score?.display_score,
          "bestRating": 10,
          "worstRating": 0,
          "ratingCount": 1,
          "reviewCount": 1,
        },
      ]
    : [];

  // CreativeWork schema for the Tier B enriched version. Signals to Google
  // + AI assistants that we host an authored derivative work (NOT a
  // duplicate of the upstream SKILL.md). isBasedOn links back to the
  // original; author = Implexa (we wrote the canonical version).
  const enrichmentSchemas: Array<Record<string, unknown>> =
    enrichment?.enriched && enrichment.enriched_content
      ? [
          {
            "@type": "CreativeWork",
            name: `${title} (Implexa-enriched)`,
            author: { "@type": "Organization", "name": "Implexa" },
            isBasedOn: {
              "@type": "SoftwareApplication",
              name: title,
              ...(skill.author
                ? { author: { "@type": "Person", name: skill.author } }
                : {}),
            },
            datePublished: enrichment.enriched_at,
            // Preview only — full body is on the page itself and Google
            // doesn't need the full text duplicated in JSON-LD.
            text: enrichment.enriched_content.slice(0, 500),
          },
        ]
      : [];

  const ldJson = jsonLdGraph(
    ...baseSchemas,
    ...reviewSchemas,
    ...enrichmentSchemas,
  );

  const hasEnrichment =
    enrichment?.enriched === true &&
    typeof enrichment.enriched_content === "string" &&
    enrichment.enriched_content.length > 100;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back to search
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
          >
            {source}
          </Badge>
          {/* author byline. Linked to /u/<author> so each skill detail
              page becomes an inbound anchor to its author page, building
              a navigable graph instead of a flat list. */}
          {skill.author ? (
            <Link
              href={`/u/${encodeURIComponent(skill.author)}`}
              className="inline-flex items-center text-[10px] uppercase tracking-wider border border-zinc-800 text-zinc-400 hover:text-amber-300 hover:border-amber-500/40 rounded-full px-2.5 py-0.5 transition-colors"
            >
              by @{skill.author}
            </Link>
          ) : null}
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
          {title}
        </h1>
        {description ? (
          <p className="text-lg text-zinc-400 max-w-2xl mb-8">{description}</p>
        ) : null}

        <div className="flex flex-wrap items-start gap-4 mb-10">
          <RunInClaudeButton slug={slug} source={source} />
          <Link
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className:
                "border-zinc-800 text-zinc-300 hover:bg-zinc-950 hover:text-white h-12 px-6 text-base",
            })}
          >
            <ExternalLink className="size-4 mr-2" aria-hidden="true" />
            view source
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          <Card className="bg-zinc-950 border-zinc-900">
            <CardContent className="pt-6">
              <div className="text-xs text-zinc-500 mb-1">installs</div>
              <div className="text-2xl font-semibold text-white">
                {installs !== null ? installs.toLocaleString() : "--"}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-950 border-zinc-900">
            <CardContent className="pt-6">
              <div className="text-xs text-zinc-500 mb-1 inline-flex items-center gap-1">
                <Star className="size-3" aria-hidden="true" /> stars
              </div>
              <div className="text-2xl font-semibold text-white">
                {stars !== null ? stars.toLocaleString() : "--"}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-950 border-zinc-900">
            <CardContent className="pt-6">
              <div className="text-xs text-zinc-500 mb-1 inline-flex items-center gap-1">
                <GitFork className="size-3" aria-hidden="true" /> karma
              </div>
              <div className="text-2xl font-semibold text-white">--</div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-zinc-900 mb-10" />

        {score && score.scored ? <SkillScorePanel score={score} /> : null}

        {hasEnrichment && enrichment ? (
          <SkillEnrichmentPanel
            enrichment={enrichment}
            author={skill.author ?? null}
            source={source}
          />
        ) : null}

        {content && content.length > 100 ? (
          hasEnrichment ? (
            // Original SKILL.md collapsed beneath the canonical Implexa
            // version. Open-by-default for unenriched skills (above).
            <details className="group rounded-lg border border-zinc-900 bg-zinc-950">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm text-zinc-400 hover:text-white inline-flex items-center justify-between w-full select-none">
                <span>view original SKILL.md from {source}</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-600 group-open:hidden">
                  click to expand
                </span>
              </summary>
              <pre className="border-t border-zinc-900 p-4 text-xs text-zinc-300 overflow-auto whitespace-pre-wrap font-mono leading-relaxed">
                {content}
              </pre>
            </details>
          ) : (
            <div className="prose prose-invert max-w-none">
              <h2 className="text-lg font-semibold text-white mb-3">SKILL.md</h2>
              <pre className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 text-xs text-zinc-300 overflow-auto whitespace-pre-wrap font-mono leading-relaxed">
                {content}
              </pre>
            </div>
          )
        ) : (
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <h2 className="text-base font-semibold text-white mb-2">
              full SKILL.md lives at the source
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              we&apos;ve indexed the metadata for this skill but the body is
              fetched on demand. click &quot;view source&quot; above to read
              the canonical SKILL.md on {source}, or &quot;run inline in
              claude&quot; to apply it without leaving your session.
            </p>
            <Link
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white hover:underline inline-flex items-center gap-1"
            >
              read on {source}
              <ExternalLink className="size-3" aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* verified modules rail. Shown only when the skill's frontmatter
            declares a `modules:` array. The procedure (this SKILL.md) +
            its verified module pairs are the two halves of a v1 implexa
            skill: the procedure tells claude what to do, the modules tell
            it what code is safe to call. Hidden entirely on legacy /
            procedure-only skills — no empty state. */}
        {Array.isArray(skill.modules) && skill.modules.length > 0 ? (
          <section className="mt-16">
            <Separator className="bg-zinc-900 mb-10" />
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                verified modules
              </h2>
              <span className="text-xs text-zinc-500">
                packages this skill wraps, with implexa trust tiers
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skill.modules.map((m) => (
                <ModuleCard
                  key={`${m.ecosystem}/${m.package}`}
                  module={m}
                />
              ))}
            </div>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="mt-16">
            <Separator className="bg-zinc-900 mb-10" />
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                related skills
              </h2>
              <span className="text-xs text-zinc-500">
                semantically similar in the cross-vendor index
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <SkillCard
                  key={`${r.source}/${r.slug}`}
                  skill={{
                    slug: r.slug,
                    source: r.source,
                    title: r.name,
                    description: r.description.slice(0, 200),
                    author: r.author ?? r.source,
                    tag:
                      r.similarity != null
                        ? `${(r.similarity * 100).toFixed(0)}% match`
                        : "related",
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-10 text-sm text-zinc-500">
          <p>
            don&apos;t have the plugin yet?{" "}
            <Link href="/install" className="text-white hover:underline">
              install it
            </Link>{" "}
            then click &quot;run inline in claude&quot; again.
          </p>
        </div>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        // ldJson is built from server-side fetched skill metadata. The
        // backend already strips HTML; JSON.stringify escapes embedded
        // quotes. Safe to inline here.
        dangerouslySetInnerHTML={{ __html: ldJson }}
      />
    </>
  );
}
