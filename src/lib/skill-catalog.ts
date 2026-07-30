// skill-catalog.ts — server-only helpers that read across the full
// aggregated_skills index via the backend's MCP tools.
//
// Two consumers:
//   1. /sitemap.xml (lists all 11k detail-page URLs)
//   2. /s/[source]/[slug] related-skills rail (top-N semantic neighbors)
//
// Both call the backend's read-only MCP tools (list_aggregated_skills and
// get_related_skills, added on backend branch feat/seo-aeo-mcp-tools).
//
// All functions degrade gracefully — they return [] on any failure so the
// pages they back never 500. This is important because the backend tools
// land in a separate deploy.

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

export type CatalogEntry = {
  source: string;
  slug: string;
  last_seen_at: string | null;
};

export type RelatedSkill = {
  source: string;
  slug: string;
  name: string;
  description: string;
  author: string | null;
  source_url: string | null;
  similarity: number | null;
};

// Parse the SSE-wrapped MCP response. The backend wraps its responses as
// `event: message\ndata: {json}\n\n`. We tolerate plain JSON as a fallback.
function parseMcpResponse(text: string): unknown {
  const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
  const jsonStr = dataLine ? dataLine.slice(6) : text;
  return JSON.parse(jsonStr);
}

type McpEnvelope = { result?: { content?: Array<{ text?: string }> } };

async function callMcpTool<T>(
  name: string,
  args: Record<string, unknown>,
  // Cache duration in seconds. Sitemap entries change at most daily, related
  // rails change at most weekly. Both can absorb stale data.
  revalidate: number,
): Promise<T | null> {
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
        params: { name, arguments: args },
      }),
      // 20s timeout — the sitemap pagination call may scan 1000 rows. The
      // related-skills call does an embedding lookup + RPC, usually <2s.
      signal: AbortSignal.timeout(20000),
      next: { revalidate },
    });

    if (!upstream.ok) return null;

    const text = await upstream.text();
    const body = parseMcpResponse(text) as McpEnvelope;
    const raw = body?.result?.content?.[0]?.text;
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * listAllSkillsForSitemap() — walk the paginated list_aggregated_skills
 * MCP tool until the server says "no more rows". Returns every active,
 * well-embedded, ENRICHED (source, slug, last_seen_at) tuple in the index.
 *
 * enrichedOnly:true (2026-07-30, AGENT_SEO_AEO_EXECUTION_PLAN Day 1). The /s/
 * detail page ships `noindex` unless the skill carries skill_enrichments
 * original body copy (website#72, backend#111) — measured 928 of 56,603
 * active skills. Before this flag the sitemap listed every active+embedded
 * skill regardless of enrichment, advertising ~19k URLs that render noindex —
 * a sitemap/metadata disagreement, which is itself a quality signal search
 * engines penalize and the exact thing the plan's guardrails forbid.
 *
 * At ~928 rows + 1000/page that's now ~1 paginated call (down from ~21 over
 * the unfiltered ~20k). Wrapped at the edge with revalidate: 86400 so we
 * touch the backend at most daily per region.
 *
 * Returns [] (empty sitemap) if the backend tool isn't deployed yet, OR if
 * it's deployed but predates enrichedOnly (unknown Zod keys are stripped
 * server-side, so an old backend would silently return the UNFILTERED
 * ~20k-row list instead — this function does not special-case that; the
 * backend enrichedOnly deploy (backend#111) landed before this file changed,
 * per the plan's stated dependency order).
 */
export async function listAllSkillsForSitemap(): Promise<CatalogEntry[]> {
  const out: CatalogEntry[] = [];
  let cursor: string | undefined;
  // Safety bound: even at 5k pageSize cap, 20 iterations = 100k rows. Real
  // (enriched) catalog is ~928 rows, ~1 page. This guards against an
  // infinite loop if a backend bug ever returns the same cursor forever.
  const MAX_PAGES = 20;

  type ListResponse = {
    ok: boolean;
    rows?: Array<CatalogEntry>;
    nextCursor?: string | null;
  };

  for (let i = 0; i < MAX_PAGES; i++) {
    const args: Record<string, unknown> = { pageSize: 1000, enrichedOnly: true };
    if (cursor) args.cursor = cursor;

    const resp = await callMcpTool<ListResponse>(
      "list_aggregated_skills",
      args,
      86400, // 1 day
    );
    if (!resp?.ok || !Array.isArray(resp.rows)) break;

    for (const r of resp.rows) {
      out.push({
        source: r.source,
        slug: r.slug,
        last_seen_at: r.last_seen_at ?? null,
      });
    }

    if (!resp.nextCursor) break;
    cursor = resp.nextCursor;
  }

  return out;
}

/**
 * fetchRelatedSkills(source, slug, limit) — top-N semantic neighbors for
 * a detail page's related-skills rail. Calls get_related_skills on the
 * backend.
 *
 * Cached at the edge with revalidate: 604800 (7 days) — once the
 * recommender's embeddings stabilize for a given skill, its neighbor set
 * is stable too. Crawlers visiting a detail page hit the cache.
 */
export async function fetchRelatedSkills(
  source: string,
  slug: string,
  limit = 5,
): Promise<RelatedSkill[]> {
  type RelatedResponse = {
    ok: boolean;
    related?: Array<{
      source: string;
      slug: string;
      name?: string | null;
      description?: string | null;
      author?: string | null;
      source_url?: string | null;
      similarity?: number | null;
    }>;
  };

  const resp = await callMcpTool<RelatedResponse>(
    "get_related_skills",
    { source, slug, limit },
    604800, // 7 days
  );

  if (!resp?.ok || !Array.isArray(resp.related)) return [];

  return resp.related.map((r) => ({
    source: r.source,
    slug: r.slug,
    name: String(r.name ?? r.slug.replace(/-/g, " ")),
    description: String(r.description ?? ""),
    author: r.author ?? null,
    source_url: r.source_url ?? null,
    similarity: typeof r.similarity === "number" ? r.similarity : null,
  }));
}
