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
// slug -> the high-intent query string the agent answers. Lowercase to match
// the site's typographic style (every H1 on the site is lowercase). This is
// the authored layer: it is what we control before the backend returns a
// per-agent `query`, and it stays as a curated override after. Add a row to
// give any agent a hand-tuned query; unmapped agents fall through to the
// derivation below, so the catalog still scales without an entry per agent.
//
// Seeded from the example thoughts in WEBSITE_POSITIONING.md /
// DATA_AND_LEARNING_MODEL.md (the "how it works" example thoughts ARE the
// target query strings) plus the realtor / builder verticals on the launch
// path. Keys are best-effort slugs; a miss is harmless (derivation covers it).
export const QUERY_MAP: Record<string, string> = {
  // builder vertical (the app-builder graduate ICP)
  "lovable-to-claude-migration": "how do i migrate my lovable app to claude",
  "daily-build-brief": "how do i keep up with what changed in my stack overnight",
  "ship-log-to-changelog": "how do i turn my commits into a changelog my users read",
  // realtor vertical (the build-in-public proof account)
  "daily-realtor-content-pack": "how do i post listings consistently without a marketer",
  "daily-realtor-content-pack-2":
    "how do i post listings consistently without a marketer",
  "weekly-market-report": "how do i send my farm area a weekly market report",
  "listing-dispute-watch": "how do i catch errors on my listings before a client does",
  // content / social (broad high-intent)
  "daily-ig-reel-research-bundle": "how do i grow my instagram",
  "instagram-growth-pack": "how do i grow my instagram",
  "linkedin-comment-drafter": "how do i stay active on linkedin without living in it",
  "youtube-to-blog": "how do i turn my videos into blog posts that rank",
};

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
// deliberately small: a verb-led job ("draft a daily content pack") reads
// well as "how do i draft a daily content pack"; anything already phrased as a
// question is passed through untouched.
function questionize(phrase: string): string {
  const p = phrase.trim().replace(/[.?!]+$/, "").toLowerCase();
  if (!p) return "";
  if (QUESTION_RE.test(p)) return p;
  return `how do i ${p}`;
}

/**
 * resolveQuery - the single source of the page H1. Precedence: backend query
 * field -> authored QUERY_MAP -> derived question from the job/description ->
 * the agent name as a last resort (so the H1 is never empty).
 */
export function resolveQuery(w: QueryInput): string {
  if (w.query && w.query.trim()) return w.query.trim().toLowerCase();
  const mapped = QUERY_MAP[w.slug];
  if (mapped) return mapped;
  const derived = questionize(w.job || w.description || "");
  if (derived) return derived;
  return w.name.toLowerCase();
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
