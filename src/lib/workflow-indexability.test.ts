// node --experimental-strip-types --test src/lib/workflow-indexability.test.ts
//
// Day 2 item 5 (AGENT_SEO_AEO_EXECUTION_PLAN_2026-07-30). Pins the RULE that
// decides whether a /workflows/<slug> page may claim indexation. Must keep
// matching what the sitemap's workflowPages() filters on (same function,
// imported by both) and what backend#0141's migration considers the
// indexable subset of publication_state.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isWorkflowIndexable } from './workflow-indexability.ts';

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
