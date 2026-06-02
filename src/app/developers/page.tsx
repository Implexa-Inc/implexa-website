import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Code2, Sparkles, Layers, Search, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/site";
import { jsonLdGraph, breadcrumbSchema } from "@/lib/jsonld";
import { PartnerWaitlistForm } from "./waitlist-form";

// /developers — public surface for the API + MCP infrastructure track.
//
// Positioning: implexa today is consumed via the Claude / Codex plugin.
// We're seeding the same tools as callable infrastructure for partners
// (Mastra, Continue.dev, Cline, etc.). Full API key auth lands when
// migration 0039 (partner_api_keys) ships; this page documents the
// surface and captures interest while that finishes.
//
// ISR: revalidate every 24h. The tool catalog changes when we add a new
// MCP tool, which is on the order of weeks. 24h staleness is invisible.
// Aligned with /scores (1h) and /u/[handle] (24h) — same Vercel free-tier
// CPU budget that drove the recent revalidate bumps (commit 605a77b).
export const revalidate = 86400;

const PAGE_TITLE = "implexa for builders, API + MCP infrastructure for skills";
const PAGE_DESCRIPTION =
  "implexa is a substrate of MCP tools for skill discovery, ranking, and remix across 40,000+ vetted skills. available via the implexa plugin today, direct API access via waitlist for partner products.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/developers" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/developers"),
    title: `${PAGE_TITLE} | implexa`,
    description: PAGE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

// ── tool catalog ────────────────────────────────────────────────────────────
//
// Hand-curated from the live tools at implexa-backend/src/mcp/tools/. Each
// entry is the minimum partners need to evaluate fit: name, what it does,
// the actual zod input shape, the response envelope. Categories mirror the
// four pillars we pitch: discovery, ranking, attribution, remix.
//
// Why this lives as a static const rather than fetched from the backend:
//   1. The page renders at build time (revalidate 86400). A network call
//      per render is wasted budget.
//   2. The schemas are docs, not config — they're stable across deploys
//      and copy-edited for readability (the live zod schemas have helper
//      annotations we don't need to render).
//   3. Keeps /developers fully renderable in CI / preview / docs even
//      when the backend is unreachable.

type ToolCategory = "discovery" | "ranking" | "attribution" | "remix";

type ToolDoc = {
  name: string;
  category: ToolCategory;
  summary: string;
  // Compact TypeScript-ish shape strings, rendered in a monospace block.
  input: string;
  output: string;
  // Forthcoming tools render with a "coming soon" badge and no copy button.
  comingSoon?: boolean;
};

const TOOLS: ToolDoc[] = [
  // ─── discovery ─────────────────────────────────────────────────────
  {
    name: "recommend_skills_for_context",
    category: "discovery",
    summary:
      "semantic-matches recent user messages against the cross-vendor aggregated index. the ambient recommender; powers the plugin's UserPromptSubmit hook and the homepage search bar.",
    input: `{
  messages: string[],              // 1..5, most recent last
  topN?: number,                   // 1..50, default 1
  minScore?: number,               // 0..0.99, default 0.20
  excludeAlreadyInstalled?: string[],
  sessionId?: string,
  skipGates?: boolean,             // true = bypass relative-gap gates
  source?: 'ambient' | 'explicit' | 'periodic'
}`,
    output: `{
  matches: Array<{
    slug: string,
    source: string,
    name: string,
    description: string,
    fit_reason: string,
    score: number,
    install_hint?: string
  }>,
  recommendation_event_id?: string,
  suppress_until_prompts?: number,
  nextAction: string
}`,
  },
  {
    name: "recommend_skills",
    category: "discovery",
    summary:
      "co-occurrence recommender. given a user or a focus skill, returns the next skills most likely to be useful based on the org's run history.",
    input: `{
  context: 'for_user' | 'for_skill',
  skillSlug?: string,              // required when context='for_skill'
  limit?: number                   // 1..20, default 5
}`,
    output: `{
  context: 'for_user' | 'for_skill',
  focusSlug?: string,
  recommendations: Array<{
    skillId: string,
    slug: string,
    name: string,
    score: number,
    reason: string
  }>,
  count: number,
  nextAction: string
}`,
  },
  {
    name: "list_aggregated_skills",
    category: "discovery",
    summary:
      "paginated keyset catalog of every active, embedding-ready skill. powers implexa.ai/sitemap.xml and any partner who wants to mirror the index.",
    input: `{
  pageSize?: number,               // 1..5000, default 1000
  cursor?: string                  // opaque keyset cursor; omit on first page
}`,
    output: `{
  ok: true,
  rows: Array<{
    source: string,
    slug: string,
    last_seen_at: string
  }>,
  nextCursor: string | null,       // null when at the end
  count: number                    // rows.length on this page
}`,
  },
  {
    name: "count_skills",
    category: "discovery",
    summary:
      "head-only counts of the aggregated index. powers the homepage headline and live pill counter. cheapest call in the catalog.",
    input: `{}                                  // no arguments`,
    output: `{
  ok: true,
  vetted: number | null,           // is_active AND embedding_status='ok'
  total:  number | null            // unfiltered table count
}`,
  },
  {
    name: "get_aggregated_skill",
    category: "discovery",
    summary:
      "read one indexed skill by (source, slug). returns the full SKILL.md body plus frontmatter and source attribution. SSR-friendly.",
    input: `{
  slug: string,
  source: 'anthropic' | 'agentskills' | 'clawhub'
        | 'skills.sh' | 'smithery' | 'github'
        | 'cursor' | 'continue' | 'implexa' | 'community'
}`,
    output: `{
  ok: true,
  id: string,
  source: string,
  slug: string,
  name: string,
  description: string | null,
  content: string,                 // full SKILL.md
  frontmatter: object | null,
  author: string | null,
  source_url: string | null,
  install_count: number,
  star_count: number,
  last_seen_at: string,
  is_active: boolean
}`,
  },
  {
    name: "get_skill_content",
    category: "discovery",
    summary:
      "fetch the SKILL.md body of a skill in the caller's org library (org_skills, scope-aware). distinct from get_aggregated_skill, which reads the public index.",
    input: `{
  slug: string                     // kebab-case slug or skill UUID
}`,
    output: `{
  ok: true,
  skillId: string,
  slug: string,
  name: string,
  description: string | null,
  content: string,
  version: string | number,
  scope: 'org' | 'system' | 'private',
  status: string,
  tags: string[],
  triggerPhrases: string[]
}`,
  },

  // ─── ranking ───────────────────────────────────────────────────────
  {
    name: "get_skill_score",
    category: "ranking",
    summary:
      "the SkillScore evaluation for one indexed skill: tier-1 structural + tier-2 dry-run. powers the score panel on every implexa.ai/s/* page.",
    input: `{
  slug: string,
  source: string                   // valid sources enum
}`,
    output: `{
  ok: true,
  scored: true,
  slug: string,
  source: string,
  name: string,
  display_score: number,           // 0..10
  tier_1: {
    overall: number,
    breakdown: object,             // 5-dim
    summary: string,
    strengths: string[],
    weaknesses: string[],
    at: string,
    model: string
  },
  tier_2: null | {
    overall: number,
    breakdown: object,             // 3-dim
    inputs: object,
    review: string,
    at: string,
    model: string
  },
  updated_at: string
}`,
  },
  {
    name: "list_skill_scores",
    category: "ranking",
    summary:
      "paginated leaderboard of scored skills, joined with name + author + counts. powers implexa.ai/scores. ranks by display_score by default.",
    input: `{
  source?: string,                 // optional source filter
  minScore?: number,               // 0..10, default 0
  offset?: number,                 // default 0
  limit?: number,                  // 1..200, default 50
  sort?: 'display_score' | 'tier_2_overall'
}`,
    output: `{
  ok: true,
  count: number,
  rows: Array<{
    slug: string,
    source: string,
    name: string,
    description: string | null,
    author: string | null,
    install_count: number,
    star_count: number,
    tier_1_overall: number,
    tier_1_summary: string,
    tier_2_overall: number | null,
    display_score: number,
    updated_at: string
  }>
}`,
  },

  // ─── attribution ──────────────────────────────────────────────────
  {
    name: "list_skills_by_author",
    category: "attribution",
    summary:
      "every active skill credited to one author handle, ranked by SkillRank. powers implexa.ai/u/<author> pages; exact case-sensitive match.",
    input: `{
  author: string                   // 1..120 chars, exact case-sensitive
}`,
    output: `{
  ok: true,
  count: number,
  rows: Array<{
    id: string,
    source: string,
    slug: string,
    name: string,
    description: string | null,
    author: string,
    source_url: string | null,
    install_count: number,
    star_count: number,
    last_seen_at: string,
    display_score: number | null,
    tier_1_summary: string | null
  }>
}`,
  },
  {
    name: "get_related_skills",
    category: "attribution",
    summary:
      "top-N cosine-similarity neighbors of a skill via stored embeddings. the internal-link backbone of the index; always returns related: [] on failure so callers never see 500s.",
    input: `{
  slug: string,
  source: string,                  // valid sources enum
  limit?: number                   // 1..20, default 5
}`,
    output: `{
  ok: true,
  related: Array<{
    source: string,
    slug: string,
    name: string,
    description: string | null,
    author: string | null,
    source_url: string | null,
    install_count: number,
    star_count: number,
    similarity: number             // 0..1
  }>,
  count: number
}`,
  },

  // ─── remix ────────────────────────────────────────────────────────
  {
    name: "apply_recommended_skill",
    category: "remix",
    summary:
      "fetches the full SKILL.md the recommender surfaced and returns it for immediate in-session execution. also patches the surfacing event for conversion analytics.",
    input: `{
  slug: string,
  source: string,                  // valid sources enum
  recommendation_event_id?: string,
  session_id?: string
}`,
    output: `{
  ok: true,
  skill_content: string,           // full SKILL.md body
  skill_metadata: {
    name: string,
    slug: string,
    source: string,
    source_url: string | null,
    description: string | null,
    author: string | null,
    contributor_attribution: string
  },
  execution_instruction: string,
  applied_skill_event_id: string | null,
  feedback_prompt: {
    must_render_verbatim: true,
    line: string,
    after_picked: object
  }
}`,
  },
  {
    name: "prepare_fusion",
    category: "remix",
    summary:
      "compose two or more skills into a single derived SKILL.md (merged frontmatter, step-aware diff). the foundation of the upcoming skill-remix surface.",
    input: `(schema in flight, see waitlist)`,
    output: `(schema in flight, see waitlist)`,
    comingSoon: true,
  },
];

// Visual chips for each category. Same palette family the rest of the
// site uses (amber for premium / curated, emerald for live, zinc for
// neutral, sky for the forthcoming pillar).
const CATEGORY_META: Record<
  ToolCategory,
  { label: string; tone: string; ring: string; icon: typeof Search }
> = {
  discovery: {
    label: "discovery",
    tone: "text-amber-300",
    ring: "border-amber-900/40 bg-amber-500/5",
    icon: Search,
  },
  ranking: {
    label: "ranking",
    tone: "text-emerald-300",
    ring: "border-emerald-900/40 bg-emerald-500/5",
    icon: Sparkles,
  },
  attribution: {
    label: "attribution",
    tone: "text-zinc-300",
    ring: "border-zinc-800 bg-zinc-900/40",
    icon: Layers,
  },
  remix: {
    label: "remix",
    tone: "text-sky-300",
    ring: "border-sky-900/40 bg-sky-500/5",
    icon: Code2,
  },
};

const PILLAR_ORDER: ToolCategory[] = [
  "discovery",
  "ranking",
  "attribution",
  "remix",
];

export default function DevelopersPage() {
  const ldJson = jsonLdGraph(
    breadcrumbSchema([
      { name: "implexa", url: absoluteUrl("/") },
      { name: "developers", url: absoluteUrl("/developers") },
    ]),
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back home
        </Link>

        {/* ── hero ───────────────────────────────────────────────── */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Code2 className="size-6 text-zinc-400" aria-hidden="true" />
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              implexa for builders
            </h1>
          </div>
          <p className="text-lg text-zinc-400 leading-relaxed max-w-3xl">
            implexa is a substrate of MCP tools for skill discovery, ranking,
            and remix. build with it.
          </p>
        </header>

        {/* ── current state callout ─────────────────────────────── */}
        <div className="rounded-lg border border-amber-900/40 bg-amber-500/5 p-5 mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="size-7 rounded-md bg-amber-500/10 border border-amber-900/40 inline-flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles
                className="size-3.5 text-amber-400"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm text-zinc-200">
                available today via the implexa claude plugin. direct API
                access via waitlist for builders.
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                the same MCP tools below are callable from any conformant MCP
                client. partner keys (Mastra, Continue.dev, custom agents)
                ship behind a short waitlist while we finish the metering and
                docs.
              </p>
            </div>
          </div>
          <Link
            href="#waitlist"
            className="shrink-0 inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium bg-white text-black hover:bg-zinc-200 transition-colors"
          >
            join the waitlist
          </Link>
        </div>

        {/* ── how to call it today ──────────────────────────────── */}
        <section className="mb-14">
          <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-500 mb-3">
            how to call it today
          </h2>
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-5 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm text-white font-medium mb-2">
                via the plugin
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                already wired into claude code and codex. one curl command
                writes the hook + MCP server config.
              </p>
              <Link
                href="/install"
                className="text-sm text-amber-300 hover:text-amber-200 inline-flex items-center gap-1"
              >
                install instructions
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div>
              <h3 className="text-sm text-white font-medium mb-2">
                via direct MCP
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                point any MCP client at the streamable HTTP endpoint with a
                bearer token. tool schemas mirror the live registry.
              </p>
              <code className="block text-xs text-zinc-300 bg-black border border-zinc-900 rounded px-3 py-2 font-mono overflow-x-auto">
                POST https://core.implexa.ai/api/v2/mcp
              </code>
            </div>
          </div>
        </section>

        {/* ── tool catalog ──────────────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-500 mb-3">
            tools
          </h2>
          <p className="text-sm text-zinc-400 mb-6 max-w-3xl">
            twelve core tools across four pillars. inputs are zod schemas;
            outputs are JSON envelopes. schemas below are the partner-stable
            surface, not the full wire shape.
          </p>

          {PILLAR_ORDER.map((pillar) => {
            const tools = TOOLS.filter((t) => t.category === pillar);
            if (tools.length === 0) return null;
            const meta = CATEGORY_META[pillar];
            const Icon = meta.icon;
            return (
              <div key={pillar} className="mb-10 last:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${meta.ring} ${meta.tone}`}
                  >
                    <Icon className="size-3" aria-hidden="true" />
                    {meta.label}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {tools.length} {tools.length === 1 ? "tool" : "tools"}
                  </span>
                </div>
                <div className="grid gap-3">
                  {tools.map((tool) => (
                    <ToolRow key={tool.name} tool={tool} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* ── waitlist ─────────────────────────────────────────── */}
        <section id="waitlist" className="scroll-mt-20 mb-12">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              partner waitlist
            </h2>
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400 font-mono"
            >
              private beta
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 max-w-2xl mb-6 leading-relaxed">
            we&apos;re onboarding a small batch of partners (IDEs, agent
            frameworks, marketplaces) ahead of opening direct API keys. tell
            us what you&apos;d build and we&apos;ll reach out with credentials
            and a short integration call.
          </p>
          <PartnerWaitlistForm />
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson }}
      />
    </>
  );
}

// ── one row of the tool table ───────────────────────────────────────────────
//
// Kept as a local component (not exported) because it only makes sense in
// the context of TOOLS + CATEGORY_META above. Lifting it out of the file
// would force passing both via props for no real reuse benefit.
function ToolRow({ tool }: { tool: ToolDoc }) {
  return (
    <div className="rounded-lg border border-zinc-900 bg-zinc-950 hover:border-zinc-800 transition-colors p-5">
      <div className="flex flex-wrap items-baseline gap-2 mb-2">
        <code className="text-sm font-mono text-white font-medium">
          {tool.name}
        </code>
        {tool.comingSoon ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-sky-300/80">
            <Clock className="size-3" aria-hidden="true" />
            coming soon
          </span>
        ) : null}
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed mb-4">
        {tool.summary}
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            input
          </div>
          <pre className="text-xs text-zinc-200 bg-black border border-zinc-900 rounded-md px-3 py-2 overflow-x-auto font-mono leading-relaxed whitespace-pre">
{tool.input}
          </pre>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            output
          </div>
          <pre className="text-xs text-zinc-200 bg-black border border-zinc-900 rounded-md px-3 py-2 overflow-x-auto font-mono leading-relaxed whitespace-pre">
{tool.output}
          </pre>
        </div>
      </div>
    </div>
  );
}
