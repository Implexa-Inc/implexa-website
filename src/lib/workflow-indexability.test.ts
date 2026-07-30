// node --experimental-strip-types --test src/lib/workflow-indexability.test.ts
//
// Day 2 item 5 (AGENT_SEO_AEO_EXECUTION_PLAN_2026-07-30). Pins the RULE that
// decides whether a /workflows/<slug> page may claim indexation. Must keep
// matching what the sitemap's workflowPages() filters on (same function,
// imported by both) and what backend#0141's migration considers the
// indexable subset of publication_state.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isWorkflowIndexable, isWorkflowPageIndexable } from './workflow-indexability.ts';

test('reviewed_indexable and run_proven are indexable', () => {
  assert.equal(isWorkflowIndexable('reviewed_indexable'), true);
  assert.equal(isWorkflowIndexable('run_proven'), true);
});

test('draft_noindex, review_ready, and demoted_noindex are NOT indexable', () => {
  // The migration's own backfill default (draft_noindex) must fail this --
  // that is the entire point of Day 2 items 3-4: no existing workflow
  // becomes indexable merely by having a row.
  assert.equal(isWorkflowIndexable('draft_noindex'), false);
  assert.equal(isWorkflowIndexable('review_ready'), false);
  assert.equal(isWorkflowIndexable('demoted_noindex'), false);
});

test('null, undefined, and an unrecognized string all fail closed', () => {
  assert.equal(isWorkflowIndexable(null), false);
  assert.equal(isWorkflowIndexable(undefined), false);
  // @ts-expect-error -- deliberately testing a value outside the union, since
  // a backend on an unexpected code path (or a future state added on one side
  // only) must not silently become indexable.
  assert.equal(isWorkflowIndexable('some_future_state_nobody_added_here'), false);
});

// ── isWorkflowPageIndexable (Day 3-4 combined gate) ─────────────────────────

test('isWorkflowPageIndexable: indexable state AND complete profile -> true', () => {
  assert.equal(
    isWorkflowPageIndexable({ publication_state: 'run_proven', editorial_complete: true }),
    true,
  );
  assert.equal(
    isWorkflowPageIndexable({ publication_state: 'reviewed_indexable', editorial_complete: true }),
    true,
  );
});

test('isWorkflowPageIndexable: indexable state but INCOMPLETE profile -> false (fails closed)', () => {
  // This is the exact case the review flagged: publication_state alone was
  // never enough. A row that somehow reaches reviewed_indexable/run_proven
  // without a complete editorial profile must still not be indexable.
  assert.equal(
    isWorkflowPageIndexable({ publication_state: 'reviewed_indexable', editorial_complete: false }),
    false,
  );
  assert.equal(
    isWorkflowPageIndexable({ publication_state: 'run_proven', editorial_complete: false }),
    false,
  );
});

test('isWorkflowPageIndexable: complete profile but non-indexable state -> false', () => {
  assert.equal(
    isWorkflowPageIndexable({ publication_state: 'draft_noindex', editorial_complete: true }),
    false,
  );
});

test('isWorkflowPageIndexable: missing/malformed editorial_complete fails closed, not just falsy-coerced', () => {
  // editorial_complete must be the LITERAL boolean true -- a malformed
  // backend response (missing field, or a truthy non-boolean like the string
  // "true") must not accidentally pass.
  assert.equal(
    isWorkflowPageIndexable({ publication_state: 'run_proven', editorial_complete: undefined }),
    false,
  );
  assert.equal(
    isWorkflowPageIndexable({ publication_state: 'run_proven', editorial_complete: null }),
    false,
  );
});
