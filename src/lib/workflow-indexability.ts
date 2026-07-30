// workflow-indexability.ts — the ONE rule that decides whether a
// /workflows/<slug> agent page is allowed to claim indexation.
//
// Day 2 item 5 (AGENT_SEO_AEO_EXECUTION_PLAN_2026-07-30). Mirrors
// skill-indexability.ts's role on the skills surface: the page's
// generateMetadata() and the sitemap's workflowPages() both import THIS
// function rather than each computing their own notion of "is this agent
// worth indexing" — that duplication is exactly the sitemap/metadata
// disagreement the plan's guardrails forbid ("No sitemap/indexing
// disagreement"), just on the agent surface instead of the skills one.
//
// THE RULE IS "READ THE PERSISTED DECISION", NOT "COMPUTE ONE" (plan,
// verbatim): "The website reads the publication decision. It must not
// independently reconstruct eligibility from a looser subset of fields."
// So this function does NOT look at run_count, unproven, curated, or
// anything else — only publication_state, set by backend#0141 and (later)
// a human editorial/privacy review. A workflow with no state at all (missing
// field, pre-migration, or a state value not in the indexable set) is NOT
// indexable — the fail-closed direction, matching the migration's own
// backfill default of draft_noindex.

// The VALID values a write path should ever set. Documentation of intent,
// not the read-side input type: the value arriving here came off an untyped
// backend JSON response (see workflow-catalog.ts), so the function that
// CHECKS it must accept the honest, wider type below rather than assume the
// backend can only ever send one of these five strings. That is also
// precisely the "unrecognized string fails closed" case pinned in
// workflow-indexability.test.ts -- narrowing the parameter type would make
// TypeScript quietly vouch for a runtime guarantee nothing actually enforces.
export type WorkflowPublicationState =
  | 'draft_noindex'
  | 'review_ready'
  | 'reviewed_indexable'
  | 'run_proven'
  | 'demoted_noindex';

const INDEXABLE_STATES: ReadonlySet<string> = new Set<WorkflowPublicationState>(['reviewed_indexable', 'run_proven']);

export function isWorkflowIndexable(publicationState: string | null | undefined): boolean {
  return typeof publicationState === 'string' && INDEXABLE_STATES.has(publicationState);
}
