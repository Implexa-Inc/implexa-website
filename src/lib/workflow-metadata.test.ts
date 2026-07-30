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
