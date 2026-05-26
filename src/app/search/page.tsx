import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SkillCard } from "@/components/skill-card";
import type { SkillCard as SkillCardData } from "@/lib/placeholder-data";

type SearchParams = { q?: string | string[] };

// the recommend_skills_for_context tool's response shape.
type ToolMatch = {
  slug?: string;
  source?: string;
  name?: string;
  description?: string;
  fit_reason?: string;
  score?: number;
  install_hint?: string;
};

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

export async function generateMetadata(props: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : Array.isArray(sp.q) ? sp.q[0] : "";
  // Canonical always points at /search (no query string). Queried variants
  // shouldn't compete with the canonical entrypoint in Google's index;
  // they're effectively infinite long-tail and de-rank the brand page.
  return {
    title: q ? `search: ${q}` : "search",
    description: "search 100k+ skills across every AI agent.",
    alternates: { canonical: "/search" },
    robots: q ? { index: false, follow: true } : undefined,
  };
}

// Server-side search via the MCP recommend_skills_for_context tool. We call it
// in explicit-search mode (skipGates=true) so the search bar returns ranked
// top-N results instead of the high-precision ambient-recommender output.
async function fetchSearchResults(q: string): Promise<SkillCardData[]> {
  if (!q || !TOKEN) return [];

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
            messages: [q],
            topN: 30,
            minScore: 0.18,
            skipGates: true,
          },
        },
      }),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    if (!upstream.ok) return [];

    // backend wraps in SSE: `event: message\ndata: {json}\n\n`. parse the
    // first data line. fall back to plain JSON if upstream changes format.
    const text = await upstream.text();
    const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
    const jsonStr = dataLine ? dataLine.slice(6) : text;

    const body: { result?: { content?: Array<{ text?: string }> } } =
      JSON.parse(jsonStr);
    const raw = body?.result?.content?.[0]?.text ?? "{}";
    const parsed: { matches?: ToolMatch[] } = JSON.parse(raw);
    const matches = Array.isArray(parsed?.matches) ? parsed.matches : [];

    // Map to SkillCard shape. Defaults for fields the recommender doesn't
    // currently return (tag, author) until we wire those through the index.
    return matches.map((m) => ({
      slug: String(m.slug ?? ""),
      source: String(m.source ?? ""),
      title: String(m.name ?? m.slug ?? ""),
      description: String(m.fit_reason ?? m.description ?? ""),
      tag: m.score ? `${(m.score * 100).toFixed(0)}% match` : "match",
      author: String(m.source ?? ""),
    }));
  } catch {
    return [];
  }
}

export default async function SearchPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : Array.isArray(sp.q) ? sp.q[0] : "";
  const results = q ? await fetchSearchResults(q) : [];

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-6"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back home
        </Link>

        <div className="mb-8">
          <SearchBar initialQuery={q} />
        </div>

        {!q ? (
          <p className="text-sm text-zinc-500 mb-6">
            type a query above to search.
          </p>
        ) : results.length === 0 ? (
          <p className="text-sm text-zinc-500 mb-6">
            no matches for{" "}
            <span className="text-white">&quot;{q}&quot;</span>. try a different
            phrasing or a broader concept.
          </p>
        ) : (
          <p className="text-sm text-zinc-500 mb-6">
            {results.length} {results.length === 1 ? "match" : "matches"} for{" "}
            <span className="text-white">&quot;{q}&quot;</span>
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((skill) => (
            <SkillCard key={`${skill.source}/${skill.slug}`} skill={skill} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
