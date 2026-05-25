// SkillScore client utilities. Talks to the implexa backend MCP endpoint
// (get_skill_score, list_skill_scores) via the same streamable-HTTP pattern
// the existing detail page + search page use.
//
// Backend reference: implexa-backend/src/mcp/tools/get-skill-score.js
// + list-skill-scores.js. Both are public-read (service-role at the backend,
// SECURITY DEFINER postgres functions for the read path).

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

export type Tier1Breakdown = {
  structure_score?: number;
  trigger_score?: number;
  procedure_score?: number;
  edge_case_score?: number;
  documentation_score?: number;
};

export type Tier2Breakdown = {
  execution_score?: number;
  output_quality_score?: number;
  usefulness_score?: number;
};

export type SkillScore = {
  ok: boolean;
  scored: boolean;
  slug: string;
  source: string;
  name?: string;
  display_score?: number | null;
  tier_1?: {
    overall?: number | null;
    breakdown?: Tier1Breakdown;
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    at?: string;
    model?: string;
  };
  tier_2?: {
    overall?: number | null;
    breakdown?: Tier2Breakdown;
    inputs?: Array<{ scenario?: string; expected_quality?: string }>;
    review?: string;
    at?: string;
    model?: string;
  } | null;
  updated_at?: string;
};

export type LeaderboardRow = {
  slug: string;
  source: string;
  name: string;
  description?: string;
  author?: string;
  install_count?: number | null;
  star_count?: number | null;
  tier_1_overall?: number | null;
  tier_1_summary?: string | null;
  tier_2_overall?: number | null;
  display_score?: number | null;
  updated_at?: string;
};

// Parse the SSE-or-plain-JSON envelope the implexa backend returns. Same
// shape as the existing detail page; keep this helper in sync.
function parseMcpEnvelope(text: string): unknown {
  const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
  const jsonStr = dataLine ? dataLine.slice(6) : text;
  const body: { result?: { content?: Array<{ text?: string }> } } =
    JSON.parse(jsonStr);
  const raw = body?.result?.content?.[0]?.text ?? "{}";
  return JSON.parse(raw);
}

async function callMcpTool(
  name: string,
  args: Record<string, unknown>,
  opts: { revalidate?: number } = {},
): Promise<unknown> {
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
      signal: AbortSignal.timeout(10000),
      next:
        typeof opts.revalidate === "number"
          ? { revalidate: opts.revalidate }
          : undefined,
    });
    if (!upstream.ok) return null;
    return parseMcpEnvelope(await upstream.text());
  } catch {
    return null;
  }
}

export async function fetchSkillScore(
  source: string,
  slug: string,
): Promise<SkillScore | null> {
  // Cache for 5 min: scores are batch-updated, not per-request.
  const data = (await callMcpTool(
    "get_skill_score",
    { source, slug },
    { revalidate: 300 },
  )) as SkillScore | null;
  if (!data || !data.ok) return null;
  return data;
}

export async function fetchLeaderboard(opts: {
  source?: string;
  minScore?: number;
  offset?: number;
  limit?: number;
  sort?: "display_score" | "tier_2_overall";
}): Promise<LeaderboardRow[]> {
  const args: Record<string, unknown> = {};
  if (opts.source) args.source = opts.source;
  if (typeof opts.minScore === "number") args.minScore = opts.minScore;
  if (typeof opts.offset === "number") args.offset = opts.offset;
  if (typeof opts.limit === "number") args.limit = opts.limit;
  if (opts.sort) args.sort = opts.sort;
  const data = (await callMcpTool("list_skill_scores", args, {
    revalidate: 300,
  })) as { ok?: boolean; rows?: LeaderboardRow[] } | null;
  if (!data || !data.ok || !Array.isArray(data.rows)) return [];
  return data.rows;
}

// Color band for the score badge. Spec from the build doc:
//   9.0+      green
//   7.0-8.9   white/neutral
//   5.0-6.9   amber
//   <5.0      hide entirely (don't shame)
//
// Returns null for the "hide" case so callers can conditionally render.
export function scoreBadgeStyle(
  score: number | null | undefined,
): { className: string; label: string } | null {
  if (typeof score !== "number" || Number.isNaN(score)) return null;
  if (score >= 9.0)
    return {
      className: "bg-emerald-950 text-emerald-300 border-emerald-900",
      label: score.toFixed(1),
    };
  if (score >= 7.0)
    return {
      className: "bg-zinc-900 text-zinc-200 border-zinc-700",
      label: score.toFixed(1),
    };
  if (score >= 5.0)
    return {
      className: "bg-amber-950 text-amber-300 border-amber-900",
      label: score.toFixed(1),
    };
  return null;
}
