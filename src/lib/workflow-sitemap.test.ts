// node --experimental-strip-types --test src/lib/workflow-sitemap.test.ts
//
// Day 2 item 5, hardening pass (2026-07-30 review). isWorkflowIndexable() was
// already pinned by workflow-indexability.test.ts, but nothing exercised the
// CONSUMER -- buildWorkflowSitemapEntries()'s `.filter(...)` call. Deleting
// that filter (while leaving the predicate itself correct) would have left
// every prior test green. This file targets that exact seam.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildWorkflowSitemapEntries } from './workflow-sitemap.ts';

const CARD = (overrides: Record<string, unknown> = {}) => ({
  source: 'web-seed', slug: 'a', name: 'A', description: 'd',
  vertical: null, cadence: null, primary_outcome: null,
  step_count: 1, bound_step_count: 1, run_count: 0, scheduled_count: 0,
  curated: true, unproven: false, last_seen_at: null,
  publication_state: null,
  // Day 3-4: defaults to complete so the publication_state tests below keep
  // isolating JUST the state-transition behavior. The dedicated
  // editorial-completeness tests further down override this.
  editorial_complete: true,
  ...overrides,
});

test('only reviewed_indexable / run_proven workflows enter the sitemap', () => {
  const entries = [
    CARD({ slug: 'a', publication_state: 'reviewed_indexable' }),
    CARD({ slug: 'b', publication_state: 'run_proven' }),
    CARD({ slug: 'c', publication_state: 'draft_noindex' }),
    CARD({ slug: 'd', publication_state: 'review_ready' }),
    CARD({ slug: 'e', publication_state: 'demoted_noindex' }),
  ];
  const out = buildWorkflowSitemapEntries(entries);
  const slugs = out.map((e) => e.url.split('/').pop());
  assert.deepEqual(new Set(slugs), new Set(['a', 'b']));
});

test('a workflow with no publication_state at all (pre-migration row) is excluded', () => {
  // This is the mutation this test exists to catch: restoring the pre-fix
  // behavior (no filter, or a filter that treats missing state as eligible)
  // would let this row leak into the sitemap.
  const { publication_state: _drop, ...noState } = CARD({ slug: 'z' });
  const out = buildWorkflowSitemapEntries([noState]);
  assert.equal(out.length, 0);
});

test('sitemap entry shape: absolute /workflows/<slug> URL and lastModified from last_seen_at', () => {
  const out = buildWorkflowSitemapEntries([
    CARD({
      slug: 'grow-instagram',
      publication_state: 'run_proven',
      last_seen_at: '2026-07-20T00:00:00Z',
    }),
  ]);
  assert.equal(out.length, 1);
  assert.match(out[0].url, /\/workflows\/grow-instagram$/);
  assert.equal(
    (out[0].lastModified as Date).toISOString(),
    '2026-07-20T00:00:00.000Z',
  );
});

test('an empty catalog produces an empty sitemap slice, not a crash', () => {
  assert.deepEqual(buildWorkflowSitemapEntries([]), []);
});

// ── Day 3-4: editorial-completeness fail-closed ─────────────────────────────

test('reviewed_indexable/run_proven with editorial_complete:false never enters the sitemap', () => {
  // The exact bug class the review caught: publication_state alone used to
  // be sufficient here. A card that reaches an indexable state without a
  // complete authored profile must still be excluded.
  const entries = [
    CARD({ slug: 'complete-a', publication_state: 'reviewed_indexable', editorial_complete: true }),
    CARD({ slug: 'incomplete-b', publication_state: 'reviewed_indexable', editorial_complete: false }),
    CARD({ slug: 'complete-c', publication_state: 'run_proven', editorial_complete: true }),
    CARD({ slug: 'incomplete-d', publication_state: 'run_proven', editorial_complete: false }),
  ];
  const out = buildWorkflowSitemapEntries(entries);
  const slugs = out.map((e) => e.url.split('/').pop());
  assert.deepEqual(new Set(slugs), new Set(['complete-a', 'complete-c']));
});

test('a promoted workflow enters the sitemap EXACTLY ONCE, not duplicated', () => {
  const entries = [
    CARD({ slug: 'once-only', publication_state: 'run_proven', editorial_complete: true }),
  ];
  const out = buildWorkflowSitemapEntries(entries);
  assert.equal(out.length, 1);
  assert.equal(out.filter((e) => e.url.endsWith('/once-only')).length, 1);
});
