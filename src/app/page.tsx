import Link from "next/link";
import { TrendingUp, Sparkles, Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "@/components/search-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SkillCard } from "@/components/skill-card";
import type { SkillCard as SkillCardData } from "@/lib/placeholder-data";
import { CATEGORIES } from "@/lib/placeholder-data";

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

export default async function HomePage() {
  // Two parallel queries — different seeds so the two sections show diverse
  // results. If either fails, we render that section empty rather than fall
  // back to broken placeholders.
  const [trending, fresh] = await Promise.all([
    fetchHomeSkills("automate productivity workflow", 6),
    fetchHomeSkills("integration api connector", 6),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* hero */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center justify-center mb-8">
            <span className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
              implexa
            </span>
          </div>
          <div className="mb-6">
            <SearchBar />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Link
              href="#trending"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className:
                  "text-zinc-400 hover:text-white hover:bg-zinc-900 h-9 px-3",
              })}
            >
              <TrendingUp className="size-3.5 mr-1.5" aria-hidden="true" />
              browse trending
            </Link>
            <Link
              href="/install"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className:
                  "text-zinc-400 hover:text-white hover:bg-zinc-900 h-9 px-3",
              })}
            >
              <Download className="size-3.5 mr-1.5" aria-hidden="true" />
              install plugin
            </Link>
          </div>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed">
            implexa watches you work and hands you{" "}
            <span className="text-white">the right skill at the right time</span>
            .
          </p>
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

        {/* closing pitch */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            stop downloading skills you&apos;ll never use
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-8">
            implexa runs alongside your claude code, codex, or cursor session.
            mid-task, the right skill surfaces. one tap to install and run.
          </p>
          <Link
            href="/install"
            className={buttonVariants({
              size: "lg",
              className:
                "bg-white text-black hover:bg-zinc-200 h-12 px-6 text-base",
            })}
          >
            install the plugin
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
