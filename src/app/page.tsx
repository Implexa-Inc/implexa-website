import Link from "next/link";
import type { Metadata } from "next";
import {
  Sparkles,
  Download,
  Search,
  Wand2,
  CircleCheck,
  Layers,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "@/components/search-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SkillCard } from "@/components/skill-card";
import { CountUpPill } from "@/components/count-up-pill";
import { CopyableInstall } from "@/components/copyable-install";
import { RotatingVerb } from "@/components/rotating-verb";
import { AnimatedTerminal } from "@/components/animated-terminal";
import type { SkillCard as SkillCardData } from "@/lib/placeholder-data";
import { CATEGORIES } from "@/lib/placeholder-data";

// Explicit canonical so the homepage is never indexed under a query-string
// variant (e.g. ?utm=x). Title + description come from layout.tsx defaults.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

type ToolMatch = {
  slug?: string;
  source?: string;
  name?: string;
  description?: string;
  fit_reason?: string;
  score?: number;
};

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

// Fetch N skills from the prod index via recommend_skills_for_context in
// explicit-search mode. We use a seed query that's broad enough to return
// diverse results across sources. Tagged with `revalidate: 600` so the
// homepage data refreshes every 10 minutes at the edge without slamming
// the backend on every visitor.
async function fetchHomeSkills(seed: string, count: number): Promise<SkillCardData[]> {
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
          name: "recommend_skills_for_context",
          arguments: {
            messages: [seed],
            topN: Math.min(count, 10),
            minScore: 0.10,
            skipGates: true,
          },
        },
      }),
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 600 },
    });

    if (!upstream.ok) return [];

    const text = await upstream.text();
    const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
    const jsonStr = dataLine ? dataLine.slice(6) : text;
    const body: { result?: { content?: Array<{ text?: string }> } } =
      JSON.parse(jsonStr);
    const raw = body?.result?.content?.[0]?.text ?? "{}";
    const parsed: { matches?: ToolMatch[] } = JSON.parse(raw);
    const matches = Array.isArray(parsed?.matches) ? parsed.matches : [];

    return matches.map((m) => ({
      slug: String(m.slug ?? ""),
      source: String(m.source ?? ""),
      title: String(m.name ?? m.slug ?? ""),
      description: String(m.description ?? m.fit_reason ?? "").slice(0, 200),
      tag: m.score ? `${(m.score * 100).toFixed(0)}% match` : "popular",
      author: String(m.source ?? ""),
    }));
  } catch {
    return [];
  }
}

// Live count of indexed skills. Server-renders into the catalog pill so the
// number reflects reality, not a stale hardcoded value. Falls back to a
// known-good fallback if backend is unreachable.
async function fetchSkillCount(): Promise<number> {
  if (!TOKEN) return 19000;
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
          name: "list_aggregated_skills",
          arguments: { limit: 1, offset: 0 },
        },
      }),
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });
    if (!upstream.ok) return 19000;
    const text = await upstream.text();
    const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
    const jsonStr = dataLine ? dataLine.slice(6) : text;
    const body: { result?: { content?: Array<{ text?: string }> } } =
      JSON.parse(jsonStr);
    const raw = body?.result?.content?.[0]?.text ?? "{}";
    const parsed: { total?: number; total_count?: number } = JSON.parse(raw);
    return parsed.total ?? parsed.total_count ?? 19000;
  } catch {
    return 19000;
  }
}

// Reusable inline command chip. Amber matches the brand "the wedge" color +
// hints visually that this is something the user actually says/types into
// their AI workspace.
function Cmd({ children }: { children: React.ReactNode }) {
  return (
    <code className="inline-block px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-900/40 text-amber-300 font-mono text-[0.85em]">
      {children}
    </code>
  );
}

export default async function HomePage() {
  // Parallel fetches: trending + fresh skills + live count.
  // If any fails, that section renders empty rather than falling back to
  // broken placeholders.
  const [trending, fresh, skillCount] = await Promise.all([
    fetchHomeSkills("automate productivity workflow", 6),
    fetchHomeSkills("integration api connector", 6),
    fetchSkillCount(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">

        {/* ─────────────────────────────────────────────────────────────
            section 1 — claude/codex hero. rotating-verb headline,
            live count chip, animated terminal demo cycling through
            three workflow examples, then install command at the bottom.
            ───────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-24 pb-16 text-center">
          {/* rotating-verb headline — Search / Run / Record / Share /
              Like & Dislike cycles through; the rest is static. */}
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.1] mb-6">
            <RotatingVerb /> Skills
            <br />
            right inside{" "}
            <span className="text-zinc-400">Claude Code &amp; Codex.</span>
          </h1>

          {/* subhead — tighter than before */}
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
            implexa indexes, scores, enriches, and recommends skills as you
            work. no installs. no restarts. no remembering when to use which.
            ever.
          </p>

          {/* live skill counter — animates up on mount + drifts upward */}
          <div className="mb-10">
            <CountUpPill target={skillCount} />
          </div>

          {/* animated terminal demo — cycles between social-media,
              record-skill, and recommend-skills scripts. typewriter for
              prompts, instant reveal for assistant answers, pulsing
              italics for status lines. */}
          <AnimatedTerminal />

          {/* install command — platform toggle picks claude code vs codex.
              signup is bundled into either install flow. */}
          <div className="mt-12">
            <CopyableInstall />
          </div>
        </section>

        <Separator className="bg-zinc-900 mx-auto max-w-6xl" />

        {/* ─────────────────────────────────────────────────────────────
            section 2 — positioning narrative + the catalog.
            "skills are the new web pages". search lives here, not above.
            sentence case body, lowercase headers (hybrid voice).
            ───────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-24">

          {/* the narrative — why this exists */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full border border-emerald-900/40 bg-emerald-500/5 text-xs text-emerald-300">
              <Layers className="size-3" aria-hidden="true" />
              ai&apos;s web moment
            </div>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-6 leading-tight">
              skills are the new web pages.
            </h2>
            <div className="text-base sm:text-lg text-zinc-400 leading-relaxed space-y-4">
              <p>
                Almost 30 years ago Google saw what the web was becoming and
                built the index that organized it. Today the same shift is
                happening for AI.
              </p>
              <p>
                Agents and the humans working with them don&apos;t need more
                web pages anymore. They need skills. And there are already
                100,000+ skills out there, written by tens of thousands of
                people, scattered across half a dozen vendors.
              </p>
              <p className="text-white">
                Implexa is the search, the score, and the runtime for that
                graph. Skills are AI&apos;s web pages, and this is where you
                find the best ones.
              </p>
              <p className="text-sm text-zinc-500">
                <Link
                  href="/resources/what-is-a-skill-graph"
                  className="text-zinc-400 hover:text-white underline decoration-zinc-700 hover:decoration-white"
                >
                  read more: what is a skill graph?
                </Link>
              </p>
            </div>
          </div>

          {/* search + catalog. live count pill sits just above the bar so
              the number anchors the entire section. */}
          <div className="max-w-3xl mx-auto mb-3 flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
              <span
                className="size-1.5 rounded-full bg-emerald-500 animate-pulse"
                aria-hidden="true"
              />
              {skillCount.toLocaleString()} skills indexed across 5 vendors
            </div>
          </div>

          <div className="max-w-3xl mx-auto mb-5">
            <SearchBar />
          </div>

          {/* example queries to reduce blank-page friction */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-16 text-sm">
            <span className="text-zinc-500">try:</span>
            {[
              "cold outreach email",
              "hubspot integration",
              "debug python types",
              "next.js codemod",
            ].map((q) => (
              <Link
                key={q}
                href={`/search?q=${encodeURIComponent(q)}`}
                prefetch
                className="px-2.5 py-1 rounded-full border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-950 hover:text-white active:bg-amber-500/10 active:border-amber-500/50 active:text-amber-300 transition-colors"
              >
                {q}
              </Link>
            ))}
          </div>

          {/* trending */}
          <div id="trending" className="mb-16">
            <div className="flex items-baseline justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                trending this week
              </h3>
              <span className="text-xs text-zinc-500">
                ranked across the cross-vendor index
              </span>
            </div>
            {trending.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trending.map((skill) => (
                  <SkillCard key={`${skill.source}/${skill.slug}`} skill={skill} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                loading trending skills...
              </p>
            )}
          </div>

          {/* categories */}
          <div className="mb-16">
            <div className="flex items-baseline justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">by category</h3>
              <span className="text-xs text-zinc-500">
                7 verticals, growing
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/search?q=${encodeURIComponent(cat.label)}`}
                  prefetch
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-950 active:bg-amber-500/10 active:border-amber-500/50 transition-colors"
                >
                  <span className="text-sm text-white group-active:text-amber-300">
                    {cat.label}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-zinc-900 text-zinc-500 text-[10px] group-hover:bg-zinc-900"
                  >
                    {cat.count}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* freshly indexed */}
          <div>
            <div className="flex items-baseline justify-between mb-6">
              <h3 className="text-xl font-semibold text-white inline-flex items-center gap-2">
                <Sparkles className="size-4 text-zinc-500" aria-hidden="true" />
                recently indexed
              </h3>
              <span className="text-xs text-zinc-500">
                skills added in the last crawl
              </span>
            </div>
            {fresh.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fresh.map((skill) => (
                  <SkillCard key={`${skill.source}/${skill.slug}`} skill={skill} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                loading recent skills...
              </p>
            )}
          </div>
        </section>

        <Separator className="bg-zinc-900 mx-auto max-w-6xl" />

        {/* ─────────────────────────────────────────────────────────────
            section 3 — what the plugin actually does. 4 features,
            each anchored on a real command you say to implexa.
            ───────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-amber-900/40 bg-amber-500/5 text-xs text-amber-400">
              <span className="size-1.5 rounded-full bg-amber-400" aria-hidden="true" />
              features
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              what the implexa plugin gives you
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              four commands, learned in 30 seconds. they live inside your
              claude code or codex session.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* feature 1: ask for a recommendation */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-7 rounded-md bg-emerald-500/10 border border-emerald-900/40 inline-flex items-center justify-center">
                  <Wand2 className="size-3.5 text-emerald-400" aria-hidden="true" />
                </div>
                <span className="text-xs text-zinc-500 font-mono">01 · ask</span>
              </div>
              <h3 className="text-base font-medium text-white mb-2">
                ask mid-task, get a skill
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                drop a question into your existing claude code or codex
                session. implexa pulls the best-fit skills from the
                cross-vendor index.
              </p>
              <div className="space-y-1.5 text-xs">
                <div>
                  <Cmd>implexa: can i use a skill here?</Cmd>
                </div>
                <div>
                  <Cmd>implexa: recommend a skill for {"<task>"}</Cmd>
                </div>
              </div>
            </div>

            {/* feature 2: ranked recommendations that get smarter */}
            <div className="rounded-lg border border-emerald-900/40 bg-emerald-500/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-7 rounded-md bg-emerald-500/20 border border-emerald-900/40 inline-flex items-center justify-center">
                  <Search className="size-3.5 text-emerald-300" aria-hidden="true" />
                </div>
                <span className="text-xs text-emerald-300 font-mono">02 · rank</span>
              </div>
              <h3 className="text-base font-medium text-white mb-2">
                ranked by quality + your workflow
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                recommendations score on completeness, implexa quality grade,
                and your own working pattern. the more you use it, the more it
                learns what fits you.
              </p>
              <div className="text-xs">
                <Cmd>implexa: suggest</Cmd>{" "}
                <span className="text-zinc-500">
                  tells you which skill to use right now
                </span>
              </div>
            </div>

            {/* feature 3: capture your own workflows */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-7 rounded-md bg-zinc-900 border border-zinc-800 inline-flex items-center justify-center">
                  <CircleCheck className="size-3.5 text-zinc-400" aria-hidden="true" />
                </div>
                <span className="text-xs text-zinc-500 font-mono">03 · record</span>
              </div>
              <h3 className="text-base font-medium text-white mb-2">
                turn your workflow into a reusable skill
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                implexa watches a session, captures the steps, and writes a
                clean SKILL.md you can keep private, share with your team, or
                publish to the index.
              </p>
              <div className="text-xs">
                <Cmd>implexa: record</Cmd>
              </div>
            </div>

            {/* feature 4: run anything inline */}
            <div className="rounded-lg border border-amber-900/40 bg-amber-500/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-7 rounded-md bg-amber-500/10 border border-amber-900/40 inline-flex items-center justify-center">
                  <Zap className="size-3.5 text-amber-400" aria-hidden="true" />
                </div>
                <span className="text-xs text-amber-400 font-mono">04 · run</span>
              </div>
              <h3 className="text-base font-medium text-white mb-2">
                run a skill without installing it
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                pass a skill name or just a natural-language prompt. implexa
                resolves the right SKILL.md and runs it inline. nothing to
                pre-install, nothing to restart.
              </p>
              <div className="space-y-1.5 text-xs">
                <div>
                  <Cmd>implexa: run draft-outreach</Cmd>
                </div>
                <div>
                  <Cmd>implexa: run {'"draft a follow-up email"'}</Cmd>
                </div>
              </div>
            </div>
          </div>

          {/* install command preview to make it real */}
          <div className="max-w-2xl mx-auto mt-12 rounded-lg border border-zinc-900 bg-zinc-950 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-900 bg-zinc-900/50">
              <span className="text-xs text-zinc-500 font-mono">terminal</span>
            </div>
            <pre className="p-4 text-sm font-mono text-zinc-300 overflow-x-auto leading-relaxed">
              <span className="text-zinc-600">$</span>{" "}
              <span className="text-emerald-400">curl</span> -fsSL{" "}
              <span className="text-amber-400">https://core.implexa.ai/install.sh</span>{" "}
              | <span className="text-emerald-400">bash</span>
            </pre>
          </div>
        </section>

        <Separator className="bg-zinc-900 mx-auto max-w-6xl" />

        {/* ─────────────────────────────────────────────────────────────
            section 4 — why this matters. reinforce the wedge against
            the "just install some skills" status quo.
            ───────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              the 10-skill ceiling is the bug.
              <br />
              <span className="text-zinc-400">implexa is the fix.</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              every vendor caps how many skills you can pre-install. but the
              skill you need next is usually one you haven&apos;t installed
              yet.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mb-12">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <div className="text-xs text-amber-400 mb-2 font-mono uppercase tracking-wider">
                the status quo
              </div>
              <h3 className="text-base font-medium text-white mb-2">
                pre-install 10-12 skills, hope you picked right
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                even claude recommends keeping the installed-skill list under a
                dozen. so you spend hours picking, then forget to use them, then
                hit the next task they don&apos;t cover.
              </p>
            </div>

            <div className="rounded-lg border border-emerald-900/40 bg-emerald-500/5 p-6">
              <div className="text-xs text-emerald-300 mb-2 font-mono uppercase tracking-wider">
                with implexa
              </div>
              <h3 className="text-base font-medium text-white mb-2">
                {skillCount.toLocaleString()}+ skills, applied on demand
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                search the full cross-vendor index from inside claude code
                or codex.
                use any skill without installing it. implexa watches your work
                and surfaces the right one mid-task.
              </p>
            </div>
          </div>

          {/* the reinforcement list */}
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6 sm:p-8 mb-12">
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                {
                  title: "search inside claude code or codex",
                  body: "one plugin, one index, one set of commands. lives next to claude code or codex without taking either over.",
                  color: "emerald" as const,
                },
                {
                  title: "use without installing",
                  body: "skills run inline. nothing to download, nothing to restart, nothing to remember.",
                  color: "emerald" as const,
                },
                {
                  title: "implexa improves skills automatically",
                  body: "every indexed skill is graded, then enriched into a canonical SKILL.md with clearer intent, edge cases, and decision logic.",
                  color: "amber" as const,
                },
                {
                  title: "recommendations get smarter with use",
                  body: "implexa learns your tool stack and work pattern. the more sessions, the sharper the suggestions.",
                  color: "amber" as const,
                },
              ].map((row) => (
                <div key={row.title} className="flex gap-3">
                  <CircleCheck
                    className={
                      row.color === "emerald"
                        ? "size-4 shrink-0 mt-0.5 text-emerald-400"
                        : "size-4 shrink-0 mt-0.5 text-amber-400"
                    }
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-sm font-medium text-white mb-0.5">
                      {row.title}
                    </div>
                    <div className="text-sm text-zinc-400 leading-relaxed">
                      {row.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* command cheatsheet — repeatable visual + reinforces memory */}
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 overflow-hidden mb-12">
            <div className="px-5 py-3 border-b border-zinc-900 bg-zinc-900/40">
              <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                cheatsheet · the seven commands
              </span>
            </div>
            <div className="divide-y divide-zinc-900">
              {[
                {
                  cmd: "implexa: suggest [for X]",
                  what: "find skills — active search or passive buffer",
                },
                {
                  cmd: "implexa: run <skill or prompt>",
                  what: "apply the best-fit skill from library + cross-vendor graph",
                },
                {
                  cmd: "implexa: record",
                  what: "capture a skill — new demo, post-hoc save, or update via re-record",
                },
                {
                  cmd: "implexa: my-skills [scope]",
                  what: "browse libraries — personal / team / org / public",
                },
                {
                  cmd: "implexa: schedule <skill> <cadence>",
                  what: "auto-run any skill on a recurrence, dashboard or slack",
                },
                {
                  cmd: "implexa: share-this",
                  what: "team-gated or public share link, one-click install",
                },
                {
                  cmd: "implexa: help",
                  what: "list commands + your current credit balance",
                },
              ].map((r) => (
                <div
                  key={r.cmd}
                  className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:gap-6"
                >
                  <code className="text-sm font-mono text-amber-300 sm:w-80 shrink-0">
                    {r.cmd}
                  </code>
                  <span className="text-sm text-zinc-400">{r.what}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-zinc-900 bg-zinc-900/20">
              <span className="text-xs text-zinc-500 leading-relaxed">
                for anything else, just ask in natural language. fork, morning brief, skill ROI, clawhub publish all route through the model.
              </span>
            </div>
          </div>

          {/* closing CTA */}
          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <Link
                href="/install"
                className={buttonVariants({
                  size: "lg",
                  className:
                    "bg-white text-black hover:bg-zinc-200 h-12 px-6 text-base inline-flex items-center gap-2",
                })}
              >
                <Download className="size-4" aria-hidden="true" />
                install the plugin
              </Link>
              <Link
                href="https://app.implexa.ai/signup"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className:
                    "border-zinc-700 text-zinc-300 hover:bg-zinc-950 hover:text-white h-12 px-6 text-base",
                })}
              >
                sign up free
              </Link>
            </div>
            <p className="text-sm text-zinc-500">
              plugin is MIT licensed. free tier forever. cross-vendor by design.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
