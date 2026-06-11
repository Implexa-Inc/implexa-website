// SkillEnrichment client utilities (Tier B). Talks to the implexa backend
// MCP endpoint (get_skill_enrichment) via the same streamable-HTTP pattern
// the existing detail page + score lib use.
//
// Backend reference: implexa-backend/src/mcp/tools/get-skill-enrichment.js.
// Public-read (service-role at the backend, SECURITY DEFINER postgres function
// for the read path).
//
// Enrichments rarely change (re-enriched only when source content fingerprint
// shifts), so we cache aggressively at the edge (1 day revalidate).

import { cache } from "react";

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

export type EnrichmentComponents = {
  intent?: number;
  inputs?: number;
  procedure?: number;
  decision_points?: number;
  output_contract?: number;
  outcome_signal?: number;
};

export type SkillEnrichment = {
  ok: boolean;
  enriched: boolean;
  source: string;
  slug: string;
  enriched_content?: string;
  enrichment_summary?: string;
  components_present?: EnrichmentComponents;
  source_fingerprint?: string;
  enriched_at?: string;
  enriched_by_model?: string;
};

// Parse the SSE-or-plain-JSON envelope the implexa backend returns. Same
// shape as the existing detail page + skill-score lib; keep this helper
// behavior in sync.
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

// cache() dedupes within a request (called in both generateMetadata and the
// page body of the skill detail page) so a render does one upstream call, not
// two. Pure CPU/latency win, no behavior change.
export const fetchSkillEnrichment = cache(async (
  source: string,
  slug: string,
): Promise<SkillEnrichment | null> => {
  // Cache for 1 day: enrichments are re-run only when source content
  // fingerprint changes (rare, batch-triggered).
  const data = (await callMcpTool(
    "get_skill_enrichment",
    { source, slug },
    { revalidate: 86400 },
  )) as SkillEnrichment | null;
  if (!data || !data.ok) return null;
  return data;
});

// Pull the first paragraph of the enriched body for use in <meta description>.
// Skips frontmatter and headings. Returns trimmed plain text capped at maxLen.
export function firstParagraphOf(
  enrichedContent: string | undefined,
  maxLen = 200,
): string {
  if (!enrichedContent) return "";

  // Strip leading YAML frontmatter (--- ... ---).
  let body = enrichedContent.trimStart();
  if (body.startsWith("---")) {
    const closingIdx = body.indexOf("\n---", 3);
    if (closingIdx !== -1) {
      body = body.slice(closingIdx + 4).trimStart();
    }
  }

  // Walk lines, find the first non-heading non-empty paragraph.
  const lines = body.split("\n");
  const paragraph: string[] = [];
  let inParagraph = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inParagraph) break;
      continue;
    }
    if (trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("```")) continue;
    paragraph.push(trimmed);
    inParagraph = true;
    if (paragraph.join(" ").length >= maxLen) break;
  }
  let text = paragraph.join(" ").replace(/[*_`]/g, "").replace(/\s+/g, " ").trim();
  if (text.length > maxLen) text = text.slice(0, maxLen - 1).trimEnd() + "…";
  return text;
}

// Components_present panel data — turn the raw 1-10 scores into ordered
// rows for the "what we improved" panel.
export type ComponentRow = { key: keyof EnrichmentComponents; label: string; score: number };
export function componentRows(
  components: EnrichmentComponents | undefined,
): ComponentRow[] {
  if (!components) return [];
  const order: Array<{ key: keyof EnrichmentComponents; label: string }> = [
    { key: "intent", label: "intent" },
    { key: "inputs", label: "inputs" },
    { key: "procedure", label: "procedure" },
    { key: "decision_points", label: "decision points" },
    { key: "output_contract", label: "output contract" },
    { key: "outcome_signal", label: "outcome signal" },
  ];
  // Only return rows the model actually scored. Coercing missing keys to 0
  // renders a wall of 0/10 bars when the enrichment call truncated before
  // the COMPONENTS marker (common when MAX_OUTPUT_TOKENS clips the tail).
  return order
    .map((o) => ({ ...o, score: components[o.key] }))
    .filter((r): r is ComponentRow => typeof r.score === "number");
}
