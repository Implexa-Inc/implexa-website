// node --experimental-strip-types --test src/lib/workflow-metadata.test.ts
//
// Day 2 item 5, hardening pass (2026-07-30 review). isWorkflowIndexable() was
// already pinned by workflow-indexability.test.ts, but nothing exercised the
// CONSUMER -- the `...(indexable ? {} : { robots: ... })` spread inside
// buildWorkflowMetadata(). Deleting that spread (while leaving the predicate
// itself correct) would have left every prior test green. This file targets
// that exact seam. Extracting the builder out of page.tsx (JSX, unloadable by
// node --experimental-strip-types) is what makes this possible at all.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildWorkflowMetadata } from './workflow-metadata.ts';

const WORKFLOW = (overrides: Record<string, unknown> = {}) => ({
  source: 'web-seed',
  slug: 'grow-instagram',
  name: 'Instagram growth pack',
  description: 'Grows an Instagram account.',
  job: '',
  persona: null,
  vertical: null,
  cadence: null,
  primary_outcome: 'A weekly content pack ready to post.',
  signals: [],
  steps: [],
  caveat: null,
  sources: [],
  capabilities: [],
  content: null,
  source_url: null,
  last_seen_at: null,
  created_at: null,
  updated_at: null,
  generated: false,
  unproven: false,
  publication_state: null,
  activity: { run_count: 0, apply_count: 0, scheduled_count: 0, last_run_at: null },
  version: null,
  versions: [],
  proposed_count: 0,
  query: null,
  improvement: null,
  example_result: null,
  // Day 3-4: defaults to complete so the publication_state tests below keep
  // isolating JUST the state-transition behavior they're named for. The
  // editorial-completeness-specific tests further down override this.
  editorial_complete: true,
  editorial_summary: null,
  limitations: null,
  audience: null,
  prerequisites: null,
  required_inputs: null,
  last_reviewed_at: null,
  ...overrides,
});

test('reviewed_indexable: no robots field is set (indexable)', () => {
  const meta = buildWorkflowMetadata(
    WORKFLOW({ publication_state: 'reviewed_indexable' }),
    'grow-instagram',
  );
  assert.equal(meta.robots, undefined);
});

test('run_proven: no robots field is set (indexable)', () => {
  const meta = buildWorkflowMetadata(
    WORKFLOW({ publication_state: 'run_proven' }),
    'grow-instagram',
  );
  assert.equal(meta.robots, undefined);
});

test('draft_noindex: robots is index:false, follow:true', () => {
  const meta = buildWorkflowMetadata(
    WORKFLOW({ publication_state: 'draft_noindex' }),
    'grow-instagram',
  );
  assert.deepEqual(meta.robots, { index: false, follow: true });
});

test('no publication_state at all (pre-migration row): robots is index:false, follow:true', () => {
  // The mutation this test exists to catch: deleting the robots spread
  // entirely, or defaulting a missing state to indexable, would both make
  // this workflow's detail page indexable by accident.
  const { publication_state: _drop, ...noState } = WORKFLOW();
  const meta = buildWorkflowMetadata(noState as never, 'grow-instagram');
  assert.deepEqual(meta.robots, { index: false, follow: true });
});

test('unknown workflow (null, 404 path): returns not-found metadata, no robots override', () => {
  const meta = buildWorkflowMetadata(null, 'does-not-exist');
  assert.equal(meta.title, 'Agent not found');
  assert.equal(meta.robots, undefined);
});

// ── Day 3-4: editorial-completeness fail-closed (the review's flagged gap) ──

test('reviewed_indexable/run_proven WITH editorial_complete:false -> robots is index:false, follow:true', () => {
  // The exact bug class the review caught: publication_state alone used to
  // be sufficient. A row that reaches an indexable state without a complete
  // authored profile (bad backfill, direct SQL, admin-tool bug) must still
  // fail closed.
  for (const state of ['reviewed_indexable', 'run_proven']) {
    const meta = buildWorkflowMetadata(
      WORKFLOW({ publication_state: state, editorial_complete: false }),
      'grow-instagram',
    );
    assert.deepEqual(
      meta.robots,
      { index: false, follow: true },
      `${state} with an incomplete profile must still be noindex`,
    );
  }
});

test('reviewed_indexable/run_proven WITH editorial_complete:true -> indexable (both gates satisfied)', () => {
  for (const state of ['reviewed_indexable', 'run_proven']) {
    const meta = buildWorkflowMetadata(
      WORKFLOW({ publication_state: state, editorial_complete: true }),
      'grow-instagram',
    );
    assert.equal(meta.robots, undefined, `${state} with a complete profile should be indexable`);
  }
});

test('missing editorial_complete field (pre-#0142 backend) fails closed to noindex', () => {
  const { editorial_complete: _drop, ...noField } = WORKFLOW({ publication_state: 'run_proven' });
  const meta = buildWorkflowMetadata(noField as never, 'grow-instagram');
  assert.deepEqual(meta.robots, { index: false, follow: true });
});

test('canonical always points at /workflows/<slug> regardless of indexability', () => {
  const indexable = buildWorkflowMetadata(
    WORKFLOW({ publication_state: 'run_proven' }),
    'grow-instagram',
  );
  const notIndexable = buildWorkflowMetadata(
    WORKFLOW({ publication_state: 'draft_noindex' }),
    'grow-instagram',
  );
  assert.equal(
    (indexable.alternates as { canonical: string }).canonical,
    '/workflows/grow-instagram',
  );
  assert.equal(
    (notIndexable.alternates as { canonical: string }).canonical,
    '/workflows/grow-instagram',
  );
});
