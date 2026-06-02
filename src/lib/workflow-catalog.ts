// workflow-catalog.ts — server-only helpers that read the workflow artifacts
// (artifact_type='workflow') from the backend via its read-only MCP tools.
//
// Two consumers:
//   1. /workflows            (index — every workflow as a card)
//   2. /workflows/[slug]     (detail — one workflow, full steps + sources)
//
// Both call the backend's list_workflows / get_workflow MCP tools. All
// functions degrade gracefully (return [] / null on any failure) so the
// pages never 500 — important because the backend tools land in a separate
// deploy and because local dev has no IMPLEXA_PUBLIC_SEARCH_TOKEN.

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

export type WorkflowCard = {
  source: string;
  slug: string;
  name: string;
  description: string;
  vertical: string | null;
  cadence: string | null;
  primary_outcome: string | null;
  step_count: number;
  bound_step_count: number;
  last_seen_at: string | null;
};

export type WorkflowCapability = {
  id: string;
  name: string;
  why: string;
  install_hint: string;
};

// Aggregate usage signal for one workflow (counts only, never run content).
// Drives the activity strip on the detail page: live social proof + an
// "updated" freshness signal that doubles as an AEO ranking input.
export type WorkflowActivity = {
  run_count: number;
  apply_count: number;
  scheduled_count: number;
  last_run_at: string | null;
};

export type WorkflowStep = {
  order: number;
  kind: string; // 'skill' | 'tool' | 'decision'
  label: string;
  ref: { source: string; slug: string } | null;
  gap: boolean;
  fallbacks: string[]; // tool-step manual paths when the integration is not connected
};

export type WorkflowDetail = {
  source: string;
  slug: string;
  name: string;
  description: string;
  job: string;
  persona: string | null;
  vertical: string | null;
  cadence: string | null;
  primary_outcome: string | null;
  signals: string[];
  steps: WorkflowStep[];
  caveat: string | null;
  sources: string[];
  capabilities: WorkflowCapability[];
  content: string | null;
  source_url: string | null;
  last_seen_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  generated: boolean;
  unproven: boolean;
  activity: WorkflowActivity;
};

// Parse the SSE-wrapped MCP response. The backend wraps responses as
// `event: message\ndata: {json}\n\n`. Tolerate plain JSON as a fallback.
function parseMcpResponse(text: string): unknown {
  const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
  const jsonStr = dataLine ? dataLine.slice(6) : text;
  return JSON.parse(jsonStr);
}

type McpEnvelope = { result?: { content?: Array<{ text?: string }> } };

async function callMcpTool<T>(
  name: string,
  args: Record<string, unknown>,
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
      signal: AbortSignal.timeout(10000),
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
 * listWorkflows() — the full workflow catalog for the index page. Cached at
 * the edge for 1h (the catalog changes only when we seed new workflows).
 */
export async function listWorkflows(): Promise<WorkflowCard[]> {
  type Resp = { ok: boolean; count?: number; workflows?: WorkflowCard[] };
  const resp = await callMcpTool<Resp>("list_workflows", {}, 3600);
  if (!resp?.ok || !Array.isArray(resp.workflows)) return [];
  return resp.workflows.map((w) => ({
    source: w.source,
    slug: w.slug,
    name: String(w.name ?? w.slug.replace(/-/g, " ")),
    description: String(w.description ?? ""),
    vertical: w.vertical ?? null,
    cadence: w.cadence ?? null,
    primary_outcome: w.primary_outcome ?? null,
    step_count: typeof w.step_count === "number" ? w.step_count : 0,
    bound_step_count:
      typeof w.bound_step_count === "number" ? w.bound_step_count : 0,
    last_seen_at: w.last_seen_at ?? null,
  }));
}

/**
 * getWorkflow(slug, source) — full detail for one workflow. Cached 1h. source
 * defaults to 'web-seed' (the only workflow source today).
 */
export async function getWorkflow(
  slug: string,
  source = "web-seed",
): Promise<WorkflowDetail | null> {
  type Resp = { ok: boolean; workflow?: WorkflowDetail; error?: string };
  const resp = await callMcpTool<Resp>(
    "get_workflow",
    { slug, source },
    3600,
  );
  if (!resp?.ok || !resp.workflow) return null;
  const w = resp.workflow;
  // New activity/version fields may be absent on older backends, read them off
  // a loose view so the mapping stays defensive (the page renders without them).
  const raw = w as unknown as {
    created_at?: string | null;
    updated_at?: string | null;
    generated?: boolean;
    unproven?: boolean;
    activity?: {
      run_count?: number;
      apply_count?: number;
      scheduled_count?: number;
      last_run_at?: string | null;
    };
  };
  const num = (v: unknown) => (typeof v === "number" && v >= 0 ? v : 0);
  return {
    source: w.source,
    slug: w.slug,
    name: String(w.name ?? w.slug.replace(/-/g, " ")),
    description: String(w.description ?? ""),
    job: String(w.job ?? w.description ?? ""),
    persona: w.persona ?? null,
    vertical: w.vertical ?? null,
    cadence: w.cadence ?? null,
    primary_outcome: w.primary_outcome ?? null,
    signals: Array.isArray(w.signals) ? w.signals : [],
    steps: Array.isArray(w.steps)
      ? w.steps.map((s) => ({
          order: s.order,
          kind: s.kind || "skill",
          label: s.label || "",
          ref: s.ref ?? null,
          gap: s.gap === true,
          fallbacks: Array.isArray(s.fallbacks) ? s.fallbacks : [],
        }))
      : [],
    caveat: w.caveat ?? null,
    sources: Array.isArray(w.sources) ? w.sources : [],
    capabilities: Array.isArray(w.capabilities)
      ? w.capabilities.map((c) => ({
          id: String(c.id ?? ""),
          name: String(c.name ?? ""),
          why: String(c.why ?? ""),
          install_hint: String(c.install_hint ?? ""),
        }))
      : [],
    content: w.content ?? null,
    source_url: w.source_url ?? null,
    last_seen_at: w.last_seen_at ?? null,
    created_at: raw.created_at ?? null,
    updated_at: raw.updated_at ?? null,
    generated: raw.generated === true,
    unproven: raw.unproven === true,
    activity: {
      run_count: num(raw.activity?.run_count),
      apply_count: num(raw.activity?.apply_count),
      scheduled_count: num(raw.activity?.scheduled_count),
      last_run_at: raw.activity?.last_run_at ?? null,
    },
  };
}
