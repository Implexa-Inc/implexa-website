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
  // catalog signals (drive the Recommended / Popular / All grouping)
  run_count: number;
  scheduled_count: number;
  curated: boolean; // proven, hand-curated workflow (source = web-seed)
  unproven: boolean; // auto-generated, no real runs yet
  last_seen_at: string | null;
  // ── BACKEND INTEGRATION SLOT (query-addressable pages) ──────────────────
  // The high-intent query this agent answers ("how do i grow my instagram").
  // The parallel backend stream will return this per agent; until it lands it
  // is null and the query is resolved from the query map / derivation in
  // lib/workflow-query.ts. Keeping the raw field here keeps the seam clean:
  // when the backend ships, resolveQuery() prefers this with zero page changes.
  query: string | null;
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

// One applied entry in a workflow's changelog. Workflows are alive, not frozen:
// each change to the steps is a version, surfaced as a Git-like history.
export type WorkflowVersionEntry = {
  version: number;
  summary: string | null;
  source: string; // seed | generated | feedback | manual
  at: string;
};

// ── BACKEND INTEGRATION SLOT (proof + "improved this week") ─────────────────
// The dedicated improvement signal the parallel backend stream is building: a
// dated, run-attributed "improved this week / here is why" delta. Until that
// read path lands this is null and resolveImprovement() derives the proof line
// from the feedback-sourced changelog (WorkflowVersionEntry) instead. When the
// backend ships, it carries the richer `why` (what a run flagged) that the
// changelog summary alone can only approximate. Per the locked amplification
// discipline this is ONLY shown on proven agents (real, non-degraded runs).
export type WorkflowImprovement = {
  at: string; // ISO date the improvement was applied
  summary: string; // what changed ("caught the 2 disputes v2 missed")
  why: string | null; // why it changed ("last run flagged its own gap")
  version: number | null; // the version this improvement produced
};

// ── BACKEND INTEGRATION SLOT (example Result) ───────────────────────────────
// A real, rendered example deliverable for this agent's job category, pulled
// from a pre-built library by the backend. Rendered under a hard "example
// result" label and a "not run on your data" disclaimer (honesty guardrail).
// Until the backend returns it this is null and resolveExampleResult() falls
// back to a descriptive, clearly-illustrative shape built from primary_outcome
// + signals. `format` tells the page how to render `body`.
export type WorkflowExampleResult = {
  title: string | null;
  body: string; // the example deliverable (markdown or plain text)
  format: "markdown" | "text";
};

// A one-glance summary of the verified skill a step is bound to. Lets the
// workflow page show each step's real substance inline (name + what it does +
// a content preview) instead of just a label and a link to /s/<source>/<slug>.
export type WorkflowStepRefSummary = {
  name: string;
  description: string | null;
  preview: string | null;
};

export type WorkflowStep = {
  order: number;
  kind: string; // 'skill' | 'tool' | 'decision'
  label: string;
  // workflow-specific substance: what this step does here and what good looks
  // like. Authored per workflow; gives the unbound tool/decision steps real
  // depth instead of a bare label.
  detail: string | null;
  ref: { source: string; slug: string } | null;
  ref_summary: WorkflowStepRefSummary | null;
  // W3: when this step's bound skill already appeared earlier in the chain,
  // the earlier step's order (so the page renders "same skill as step N").
  same_as_step: number | null;
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
  version: number | null; // current (newest applied) version number
  versions: WorkflowVersionEntry[]; // applied changelog, newest first
  proposed_count: number; // pending feedback-driven revisions
  // ── BACKEND INTEGRATION SLOTS (query-addressable rebuild) ─────────────────
  // All three are null until the parallel backend read path lands. The page
  // never depends on them directly; it calls the resolvers in
  // lib/workflow-query.ts, which prefer these and fall back to derived values.
  query: string | null; // the high-intent thought this agent answers
  improvement: WorkflowImprovement | null; // dated "improved this week" delta
  example_result: WorkflowExampleResult | null; // a real example deliverable
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
 * listWorkflows() — the full workflow catalog for the index page. Cached 5m:
 * the cards now carry live activity (run + autopilot counts) that drives the
 * Popular ranking, so a long cache would show stale proof. The `catalog` arg is
 * a cache-key version marker (ignored by the backend); bump it to bust the edge
 * cache after a card-shape change.
 */
export async function listWorkflows(): Promise<WorkflowCard[]> {
  type Resp = { ok: boolean; count?: number; workflows?: WorkflowCard[] };
  const resp = await callMcpTool<Resp>("list_workflows", { catalog: "v2" }, 300);
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
    run_count: typeof w.run_count === "number" ? w.run_count : 0,
    scheduled_count:
      typeof w.scheduled_count === "number" ? w.scheduled_count : 0,
    curated: w.curated === true,
    unproven: w.unproven === true,
    last_seen_at: w.last_seen_at ?? null,
    // backend slot; null until the query read path lands (see workflow-query.ts)
    query: typeof w.query === "string" && w.query ? w.query : null,
  }));
}

/**
 * getWorkflow(slug, source) — full detail for one workflow. Cached 10m (the
 * response now carries live-ish activity counts + last_run_at, so a 1h cache
 * would show stale run counts; only ~12 workflow pages exist so the shorter
 * window is negligible load). source defaults to 'web-seed'.
 */
export async function getWorkflow(
  slug: string,
  source = "web-seed",
): Promise<WorkflowDetail | null> {
  type Resp = { ok: boolean; workflow?: WorkflowDetail; error?: string };
  const resp = await callMcpTool<Resp>(
    "get_workflow",
    { slug, source },
    600,
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
    version?: number | null;
    versions?: Array<{
      version?: number;
      summary?: string | null;
      source?: string;
      at?: string;
    }>;
    proposed_count?: number;
    query?: string | null;
    improvement?: {
      at?: string;
      summary?: string;
      why?: string | null;
      version?: number | null;
    } | null;
    example_result?: {
      title?: string | null;
      body?: string;
      format?: string;
    } | null;
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
      ? w.steps.map((s) => {
          const rs = (s as { ref_summary?: unknown }).ref_summary as
            | { name?: unknown; description?: unknown; preview?: unknown }
            | null
            | undefined;
          const detail = (s as { detail?: unknown }).detail;
          const sameAs = (s as { same_as_step?: unknown }).same_as_step;
          return {
            order: s.order,
            kind: s.kind || "skill",
            label: s.label || "",
            detail: typeof detail === "string" && detail ? detail : null,
            same_as_step: typeof sameAs === "number" ? sameAs : null,
            ref: s.ref ?? null,
            ref_summary:
              rs && typeof rs === "object"
                ? {
                    name: String(rs.name ?? ""),
                    description:
                      typeof rs.description === "string" ? rs.description : null,
                    preview:
                      typeof rs.preview === "string" && rs.preview
                        ? rs.preview
                        : null,
                  }
                : null,
            gap: s.gap === true,
            fallbacks: Array.isArray(s.fallbacks) ? s.fallbacks : [],
          };
        })
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
    version: typeof raw.version === "number" ? raw.version : null,
    versions: Array.isArray(raw.versions)
      ? raw.versions
          .filter((v) => v && typeof v.version === "number")
          .map((v) => ({
            version: v.version as number,
            summary: typeof v.summary === "string" ? v.summary : null,
            source: String(v.source ?? "manual"),
            at: String(v.at ?? ""),
          }))
      : [],
    proposed_count: num(raw.proposed_count),
    // backend slots; null until the read path lands. The page reads these only
    // through the resolvers in workflow-query.ts, which fall back gracefully.
    query: typeof raw.query === "string" && raw.query ? raw.query : null,
    improvement:
      raw.improvement && typeof raw.improvement.summary === "string"
        ? {
            at: String(raw.improvement.at ?? ""),
            summary: raw.improvement.summary,
            why:
              typeof raw.improvement.why === "string" ? raw.improvement.why : null,
            version:
              typeof raw.improvement.version === "number"
                ? raw.improvement.version
                : null,
          }
        : null,
    example_result:
      raw.example_result && typeof raw.example_result.body === "string"
        ? {
            title:
              typeof raw.example_result.title === "string"
                ? raw.example_result.title
                : null,
            body: raw.example_result.body,
            format: raw.example_result.format === "markdown" ? "markdown" : "text",
          }
        : null,
  };
}
