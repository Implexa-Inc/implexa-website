import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "@/components/search-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SkillCard } from "@/components/skill-card";
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

// Live count of indexed skills. Server-renders into the hero pill so the
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
      // Cache for 1 hour at the edge. Indexed count grows slowly.
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

export default async function HomePage() {
  // Parallel fetches: trending + fresh skills + live count for the pill.
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
        {/* hero */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-24 pb-12 text-center">
          {/* headline */}
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.05] mb-6">
            stop downloading skills.
            <br />
            <span className="text-zinc-400">
              implexa runs them inline as you work.
            </span>
          </h1>

          {/* subhead */}
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
            implexa indexes, scores, enriches, and recommends skills as you
            work in claude, codex, cursor, gemini. no installs. no restarts.
            no remembering when to use which. ever.
          </p>

          {/* search bar */}
          <div className="mb-5">
            <SearchBar />
          </div>

          {/* example queries to reduce blank-page friction */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-sm">
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
                className="px-2.5 py-1 rounded-full border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-950 hover:text-white transition-colors"
              >
                {q}
              </Link>
            ))}
          </div>

          {/* live count pill — moved below search per founder feedback */}
          <div className="inline-flex items-center gap-2 mb-12 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
            <span
              className="size-1.5 rounded-full bg-emerald-500 animate-pulse"
              aria-hidden="true"
            />
            {skillCount.toLocaleString()} skills indexed across 5 vendors
          </div>

          {/* demo cue: the wedge moment in a terminal mock */}
          <div className="max-w-2xl mx-auto text-left bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-900 bg-zinc-900/50">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-zinc-700" />
                <div className="size-2.5 rounded-full bg-zinc-700" />
                <div className="size-2.5 rounded-full bg-zinc-700" />
              </div>
              <span className="text-xs text-zinc-500 ml-2 font-mono">
                claude code
              </span>
            </div>
            <div className="p-5 font-mono text-sm leading-relaxed">
              <div className="text-zinc-300">
                <span className="text-zinc-600">{">"}</span>{" "}
                <span className="text-white">
                  implexa, find me a skill for cold outreach
                </span>
              </div>
              <div className="mt-3 text-zinc-400">
                <span className="text-emerald-400">💡</span>{" "}
                try{" "}
                <span className="text-white">draft-outreach</span>{" "}
                <span className="text-zinc-500">(smithery)</span>
              </div>
              <div className="text-zinc-500 ml-6 mt-0.5">
                drafts personalized cold emails with prospect research
              </div>
              <div className="mt-3 text-zinc-300">
                <span className="text-zinc-600">{">"}</span>{" "}
                <span className="text-white">yes apply</span>
              </div>
              <div className="mt-2 text-zinc-500 italic">
                running draft-outreach inline...
              </div>
            </div>
          </div>

        </section>

        <Separator className="bg-zinc-900 mx-auto max-w-6xl" />

        {/* trending */}
        <section
          id="trending"
          className="mx-auto max-w-6xl px-4 sm:px-6 py-16"
        >
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              trending this week
            </h2>
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
        </section>

        {/* categories — links to search queries instead of broken /c/ routes */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">by category</h2>
            <span className="text-xs text-zinc-500">7 verticals, growing</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/search?q=${encodeURIComponent(cat.label)}`}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-950 transition-colors"
              >
                <span className="text-sm text-white">{cat.label}</span>
                <Badge
                  variant="secondary"
                  className="bg-zinc-900 text-zinc-500 text-[10px] group-hover:bg-zinc-900"
                >
                  {cat.count}
                </Badge>
              </Link>
            ))}
          </div>
        </section>

        {/* freshly improved */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-semibold text-white inline-flex items-center gap-2">
              <Sparkles className="size-4 text-zinc-500" aria-hidden="true" />
              recently indexed
            </h2>
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
        </section>

        <Separator className="bg-zinc-900 mx-auto max-w-6xl" />

        {/* plugin section: the key thing */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-amber-900/40 bg-amber-500/5 text-xs text-amber-400">
              <span className="size-1.5 rounded-full bg-amber-400" aria-hidden="true" />
              the wedge
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              the plugin is where it gets magical
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              without the plugin, implexa is a really good skill search
              engine. with it, every claude code, codex, cursor, and gemini
              session has implexa watching, recommending, and applying skills
              inline.
            </p>
          </div>

          {/* 3-step how it works */}
          <div className="grid gap-4 sm:grid-cols-3 mb-12">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
              <div className="text-xs text-zinc-500 mb-2 font-mono">step 1</div>
              <h3 className="text-base font-medium text-white mb-1.5">
                browse the catalog
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                search {skillCount.toLocaleString()}+ skills on implexa.ai
                without installing anything. always free.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-900/40 bg-emerald-500/5 p-5">
              <div className="text-xs text-emerald-400 mb-2 font-mono">step 2</div>
              <h3 className="text-base font-medium text-white mb-1.5">
                install the plugin (30s)
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                one curl command. wires implexa into your existing claude
                code, codex, cursor, or gemini cli session. no restart.
              </p>
            </div>
            <div className="rounded-lg border border-amber-900/40 bg-amber-500/5 p-5">
              <div className="text-xs text-amber-400 mb-2 font-mono">step 3</div>
              <h3 className="text-base font-medium text-white mb-1.5">
                implexa watches + applies
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                mid-task, the right skill surfaces. say &quot;yes apply&quot;
                and the SKILL.md runs inline. nothing to pre-install,
                nothing to remember.
              </p>
            </div>
          </div>

          {/* install command preview */}
          <div className="max-w-2xl mx-auto mb-8 rounded-lg border border-zinc-900 bg-zinc-950 overflow-hidden">
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

          {/* CTAs */}
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
          <p className="text-center text-sm text-zinc-500">
            works in claude code, codex, cursor, gemini cli. plugin is MIT
            licensed. free tier forever.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
