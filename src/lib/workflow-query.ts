// workflow-query.ts - the query-to-agent resolution layer.
//
// The locked positioning (WEBSITE_POSITIONING.md, "AEO pages become
// query-addressable") makes every agent detail page BE a real high-intent
// query: the H1 is the thought a person actually types ("how do i grow my
// instagram"), and the agent is the vetted answer. This file is the single
// seam that turns a backend agent record into the query-shaped values the
// page renders, so the page template stays dumb and the data plumbing scales
// to hundreds of query-addressable pages.
//
// Every resolver follows the same precedence so the backend integration point
// is clean:
//   1. the dedicated backend field (the parallel read path the backend stream
//      is building) - preferred the moment it lands, zero page changes;
//   2. authored data here (QUERY_MAP) - the curated mapping we control today;
//   3. a graceful derivation from existing fields - so a brand-new agent the
//      backend just generated still renders a sensible query page.
//
// Honesty + amplification discipline (locked guardrails) live here too:
//   - example Results are always flagged (derived vs real) so the page can
//     label them and never imply a run happened on the visitor's data;
//   - the "improved this week" proof line only resolves for PROVEN agents
//     (real, non-degraded run history); unproven agents stay indexable but get
//     no proof treatment and no internal promotion.

import type {
  WorkflowCard,
  WorkflowDetail,
  WorkflowImprovement,
} from "@/lib/workflow-catalog";

// ── The query-to-agent mapping ──────────────────────────────────────────────
// slug -> the high-intent query string the agent answers. Sentence case
// (capitalize the first word and proper nouns only) to match the site's
// typographic style. This is the authored layer: it is what we control before
// the backend returns a per-agent `query`, and it stays as a curated override
// after. Add a row to give any agent a hand-tuned query; unmapped agents fall
// through to the derivation below, so the catalog still scales without an entry
// per agent.
//
// Seeded from the example thoughts in WEBSITE_POSITIONING.md /
// DATA_AND_LEARNING_MODEL.md (the "how it works" example thoughts ARE the
// target query strings) plus the realtor / builder verticals on the launch
// path. Keys are best-effort slugs; a miss is harmless (derivation covers it).
export const QUERY_MAP: Record<string, string> = {
  // builder vertical (the app-builder graduate ICP)
  "lovable-to-claude-migration": "How do I migrate my Lovable app to Claude",
  "daily-build-brief": "How do I keep up with what changed in my stack overnight",
  "ship-log-to-changelog": "How do I turn my commits into a changelog my users read",
  // realtor vertical (the build-in-public proof account)
  "daily-realtor-content-pack": "How do I post listings consistently without a marketer",
  "daily-realtor-content-pack-2":
    "How do I post listings consistently without a marketer",
  "weekly-market-report": "How do I send my farm area a weekly market report",
  "listing-dispute-watch": "How do I catch errors on my listings before a client does",
  // content / social (broad high-intent)
  "daily-ig-reel-research-bundle": "How do I grow my Instagram",
  "instagram-growth-pack": "How do I grow my Instagram",
  "linkedin-comment-drafter": "How do I stay active on LinkedIn without living in it",
  "youtube-to-blog": "How do I turn my videos into blog posts that rank",
};

// ── CLUSTERS: curated internal-linking groups (Day 3-4/10) ──────────────────
// The plan's launch clusters (AGENT_SEO_AEO_EXECUTION_PLAN_2026-07-30,
// "Initial content clusters") group agents by real task adjacency -- a
// visitor comparing the SEO brief drafters, or the video-editing chain, wants
// to see the other agents in that same job, not just whatever happens to
// share the same generic `vertical` tag. The video cluster in particular
// spans FOUR different vertical values (builder/creator/marketing/video
// production), so the vertical-only related-agents logic below would not
// connect them to each other at all without this.
//
// This is additive to, not a replacement for, the vertical-based fallback:
// resolveRelatedWorkflows() prefers cluster siblings when the current page is
// in a defined cluster, and falls back to the existing same-vertical logic
// otherwise (most of the catalog isn't in a cluster yet).
const CLUSTERS: string[][] = [
  // Cluster A: creator and video production
  [
    "raw-recording-clean-cut-claude-remotion",
    "cinematic-b-roll-generator",
    "cinematic-b-roll-generator-with-avatar-presenter",
    "markdown-brief-to-remotion-text-animations",
    "final-video-editor-with-avatar-presenter",
  ],
  // Cluster B: SEO and AEO
  [
    "seo-content-brief-drafter",
    "weekly-seo-content-brief",
    "verify-gsc-wire-search-data-into-seo-brief",
  ],
  // Cluster C: recurring growth and research
  ["daily-hn-comment-drafts", "daily-ig-reel-research-bundle"],
];

const CLUSTER_SIBLINGS: Map<string, Set<string>> = new Map();
for (const cluster of CLUSTERS) {
  for (const slug of cluster) {
    CLUSTER_SIBLINGS.set(slug, new Set(cluster.filter((s) => s !== slug)));
  }
}

/**
 * resolveRelatedWorkflows - internal-linking selection for the "related
 * agents" section. Prefers curated cluster siblings (real task adjacency,
 * not a coincidental shared tag), fills any remaining slots with same-
 * vertical siblings (the existing fallback), then the rest of the catalog --
 * proven agents ranked first at each tier, same amplification discipline as
 * before. Caps at `limit`.
 */
export function resolveRelatedWorkflows(
  w: Pick<WorkflowDetail, "slug" | "vertical">,
  allWorkflows: WorkflowCard[],
  limit = 4,
): WorkflowCard[] {
  const others = allWorkflows.filter((x) => x.slug !== w.slug);
  const provenFirst = (a: WorkflowCard, b: WorkflowCard) =>
    (isCardProven(b) ? 1 : 0) - (isCardProven(a) ? 1 : 0);

  const siblingSlugs = CLUSTER_SIBLINGS.get(w.slug);
  const clusterSiblings = siblingSlugs
    ? others.filter((x) => siblingSlugs.has(x.slug)).sort(provenFirst)
    : [];

  const sameVertical = others
    .filter((x) => w.vertical && x.vertical === w.vertical && !clusterSiblings.includes(x))
    .sort(provenFirst);

  const rest = others
    .filter((x) => !clusterSiblings.includes(x) && !sameVertical.includes(x))
    .sort(provenFirst);

  return [...clusterSiblings, ...sameVertical, ...rest].slice(0, limit);
}

// ── isProven: the amplification gate (locked discipline) ────────────────────
// Only an agent with real, non-degraded run history earns the proof treatment
// (the "improved this week" line) and internal promotion. Unproven agents are
// still indexable (they stay in the sitemap and render fully) - they simply
// are not amplified. The "boringbiz lesson": a directory of buildable agents is
// zero-moat; the proof stapled to a page is the defensible part, and a fresh
// clone cannot fabricate run history.
export function isProven(w: WorkflowDetail): boolean {
  if (w.unproven) return false;
  if (w.activity.run_count > 0 || w.activity.scheduled_count > 0) return true;
  // curated agents with an applied history are proven enough to amplify even
  // before the activity counters warm up (they are hand-vetted, not generated).
  return !w.generated && w.versions.length > 0;
}

// Card-level equivalent for the catalog grouping/ranking (the card carries a
// thinner signal set than the detail record).
export function isCardProven(w: WorkflowCard): boolean {
  if (w.unproven) return false;
  return w.run_count > 0 || w.scheduled_count > 0 || w.curated;
}

// ── resolveQuery: the H1 ─────────────────────────────────────────────────────
type QueryInput = {
  query: string | null;
  slug: string;
  job?: string;
  description?: string;
  name: string;
  vertical?: string | null;
};

const QUESTION_RE = /^(how|what|why|when|where|which|can|should|is|do|does)\b/i;

// Turn a job phrase into a question H1 when it is not already one. Kept
// deliberately small: a verb-led job ("Draft a daily content pack") reads
// well as "How do I draft a daily content pack"; anything already phrased as a
// question is passed through with a capitalized first word. Output is sentence
// case: the leading word is capitalized and the authored proper nouns inside
// the phrase are preserved.
function questionize(phrase: string): string {
  const p = phrase.trim().replace(/[.?!]+$/, "");
  if (!p) return "";
  if (QUESTION_RE.test(p)) return p.charAt(0).toUpperCase() + p.slice(1);
  const body = p.charAt(0).toLowerCase() + p.slice(1);
  return `How do I ${body}`;
}

/**
 * resolveQuery - the single source of the page H1. Precedence: backend query
 * field -> authored QUERY_MAP -> derived question from the job/description ->
 * the agent name as a last resort (so the H1 is never empty).
 */
export function resolveQuery(w: QueryInput): string {
  if (w.query && w.query.trim()) return w.query.trim();
  const mapped = QUERY_MAP[w.slug];
  if (mapped) return mapped;
  const derived = questionize(w.job || w.description || "");
  if (derived) return derived;
  return w.name;
}

// True when resolveQuery produced a real query (map/backend/derived), false
// when it could only fall back to the agent name. Lets the page decide whether
// to lead with the query as the H1 or keep the name as the H1.
export function hasResolvedQuery(w: QueryInput): boolean {
  if (w.query && w.query.trim()) return true;
  if (QUERY_MAP[w.slug]) return true;
  return Boolean(questionize(w.job || w.description || ""));
}

// ── resolveImprovement: the "improved this week / here is why" proof line ─────
export type ResolvedImprovement = WorkflowImprovement & {
  thisWeek: boolean; // applied within the last 7 days
  derived: boolean; // true = reconstructed from the changelog, not a backend signal
};

function daysSince(iso: string): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86_400_000);
}

/**
 * resolveImprovement - the defensible proof element. Returns null for any
 * unproven agent (the amplification gate) and for any proven agent with no
 * qualifying improvement. Precedence: the dedicated backend improvement signal
 * -> the newest feedback-sourced changelog entry (a run flagged a gap and the
 * fix was applied). Anything older than ~60 days is dropped: a stale "improved"
 * line is not proof of a living agent.
 */
export function resolveImprovement(
  w: WorkflowDetail,
): ResolvedImprovement | null {
  if (!isProven(w)) return null;

  // 1. dedicated backend signal (preferred once the read path lands)
  if (w.improvement && w.improvement.summary) {
    const d = daysSince(w.improvement.at);
    if (d === null || d <= 60) {
      return {
        ...w.improvement,
        thisWeek: d !== null && d <= 7,
        derived: false,
      };
    }
  }

  // 2. derive from the feedback-sourced changelog: a run's feedback IS the
  // self-captured-gap signal the proof line describes.
  const feedback = w.versions.find((v) => v.source === "feedback" && v.summary);
  if (feedback) {
    const d = daysSince(feedback.at);
    if (d === null || d <= 60) {
      return {
        at: feedback.at,
        summary: feedback.summary as string,
        // the changelog has no separate "why" column; the feedback source IS
        // the why. The backend slot (above) will carry the richer reason.
        why: "a run flagged its own gap and the fix was applied",
        version: feedback.version,
        thisWeek: d !== null && d <= 7,
        derived: true,
      };
    }
  }

  return null;
}

// ── resolveExampleResult: the labeled example deliverable ────────────────────
export type ResolvedExampleResult = {
  title: string | null;
  body: string;
  format: "markdown" | "text";
  // derived = reconstructed from the agent's outcome shape (illustrative, not a
  // captured run). real = a sample deliverable the backend supplied. Either
  // way the page labels it an example and never implies it ran on the
  // visitor's data (locked honesty guardrail).
  derived: boolean;
};

/**
 * resolveExampleResult - the on-page "what a finished run looks like". Prefers
 * a real example deliverable from the backend's pre-built library; otherwise
 * derives an illustrative description of the deliverable's shape from the
 * agent's primary outcome + captured signals. Returns null only when there is
 * nothing to show at all.
 */
export function resolveExampleResult(
  w: WorkflowDetail,
): ResolvedExampleResult | null {
  if (w.example_result && w.example_result.body.trim()) {
    return {
      title: w.example_result.title,
      body: w.example_result.body,
      format: w.example_result.format,
      derived: false,
    };
  }

  const outcome = (w.primary_outcome || w.job || w.description || "").trim();
  if (!outcome) return null;

  const signals = w.signals.filter(Boolean);
  const signalLine =
    signals.length > 0
      ? `\n\nEach run captures: ${signals.join(", ")}.`
      : "";
  const cadence = w.cadence ? `${w.cadence} ` : "";

  return {
    title: null,
    body: `A finished ${cadence}run delivers: ${outcome}${signalLine}`,
    format: "text",
    derived: true,
  };
}

// ── resolveLimitations: "limits and recovery" (Day 3-4) ─────────────────────
/**
 * resolveLimitations - prefers the authored `limitations` field (Day 3-4,
 * human-reviewed, the same field the indexability evaluator requires to be
 * non-empty for an indexable page) over the auto-parsed `caveat` (extracted
 * from the workflow's raw markdown content at read time). Both describe the
 * same kind of thing -- boundaries, failure modes, what the agent doesn't do
 * -- but an authored field is more deliberate than a parsed one, so it wins
 * when both are present. Returns null only when neither exists.
 */
export function resolveLimitations(
  w: Pick<WorkflowDetail, "limitations" | "caveat">,
): string | null {
  if (w.limitations && w.limitations.trim()) return w.limitations.trim();
  if (w.caveat && w.caveat.trim()) return w.caveat.trim();
  return null;
}
