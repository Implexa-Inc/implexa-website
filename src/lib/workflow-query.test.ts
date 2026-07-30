// node --experimental-strip-types --test src/lib/workflow-query.test.ts
//
// Day 3-4 (AGENT_SEO_AEO_EXECUTION_PLAN_2026-07-30). This is the first test
// file for workflow-query.ts. Scope, stated honestly: it covers ONLY
// resolveLimitations(), the resolver added in this change. resolveQuery(),
// resolveExampleResult(), resolveImprovement(), isProven(), and
// isCardProven() predate this file and have no test coverage yet -- that gap
// existed before this change and isn't closed here.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { resolveLimitations, resolveRelatedWorkflows } from './workflow-query.ts';

test('authored limitations wins when both limitations and caveat are present', () => {
  assert.equal(
    resolveLimitations({ limitations: 'Needs a Runway API key.', caveat: 'Old parsed caveat text.' }),
    'Needs a Runway API key.',
  );
});

test('falls back to the auto-parsed caveat when limitations is absent', () => {
  assert.equal(
    resolveLimitations({ limitations: null, caveat: 'Requires ffmpeg locally.' }),
    'Requires ffmpeg locally.',
  );
});

test('whitespace-only limitations is treated as absent, falls back to caveat', () => {
  assert.equal(
    resolveLimitations({ limitations: '   ', caveat: 'Requires ffmpeg locally.' }),
    'Requires ffmpeg locally.',
  );
});

test('neither present -> null', () => {
  assert.equal(resolveLimitations({ limitations: null, caveat: null }), null);
});

// ── resolveRelatedWorkflows: curated cluster siblings over raw vertical ────

const CARD = (overrides: Record<string, unknown> = {}) => ({
  source: 'web-seed', slug: 'x', name: 'X', description: 'd',
  vertical: null, cadence: null, primary_outcome: null,
  step_count: 1, bound_step_count: 1, run_count: 0, scheduled_count: 0,
  curated: false, unproven: false, last_seen_at: null, query: null,
  editorial_complete: true,
  ...overrides,
});

test('two agents in the same curated cluster link to each other even with different vertical values', () => {
  // The exact real-world case that motivated this function: the video
  // cluster's own agents span 4 different `vertical` tags, so the old
  // same-vertical-only logic would not have connected them at all.
  const current = CARD({ slug: 'cinematic-b-roll-generator-with-avatar-presenter', vertical: 'marketing' });
  const all = [
    current,
    CARD({ slug: 'raw-recording-clean-cut-claude-remotion', vertical: 'builder' }),
    CARD({ slug: 'unrelated-marketing-agent', vertical: 'marketing' }),
  ];
  const related = resolveRelatedWorkflows(current, all);
  const slugs = related.map((r) => r.slug);
  assert.ok(
    slugs.includes('raw-recording-clean-cut-claude-remotion'),
    'a cluster sibling with a DIFFERENT vertical must still be related',
  );
});

test('cluster siblings are ranked ahead of same-vertical-only matches', () => {
  const current = CARD({ slug: 'seo-content-brief-drafter', vertical: 'builder' });
  const all = [
    current,
    CARD({ slug: 'some-other-builder-agent', vertical: 'builder' }), // same vertical, NOT a cluster sibling
    CARD({ slug: 'weekly-seo-content-brief', vertical: 'builder' }), // cluster sibling AND same vertical
  ];
  const related = resolveRelatedWorkflows(current, all, 1);
  assert.deepEqual(related.map((r) => r.slug), ['weekly-seo-content-brief']);
});

test('an agent with no defined cluster falls back to the same-vertical logic unchanged', () => {
  const current = CARD({ slug: 'some-uncatalogued-agent', vertical: 'creator' });
  const all = [
    current,
    CARD({ slug: 'sibling-a', vertical: 'creator' }),
    CARD({ slug: 'unrelated-b', vertical: 'builder' }),
  ];
  const related = resolveRelatedWorkflows(current, all);
  assert.deepEqual(related.map((r) => r.slug), ['sibling-a', 'unrelated-b']);
});

test('never includes the current workflow itself', () => {
  const current = CARD({ slug: 'daily-hn-comment-drafts', vertical: 'builder' });
  const all = [
    current,
    CARD({ slug: 'daily-ig-reel-research-bundle', vertical: 'creator' }),
  ];
  const related = resolveRelatedWorkflows(current, all);
  assert.ok(!related.some((r) => r.slug === current.slug));
});

test('respects the limit parameter', () => {
  const current = CARD({ slug: 'seo-content-brief-drafter', vertical: 'builder' });
  const all = [
    current,
    CARD({ slug: 'weekly-seo-content-brief', vertical: 'builder' }),
    CARD({ slug: 'verify-gsc-wire-search-data-into-seo-brief', vertical: 'builder' }),
  ];
  const related = resolveRelatedWorkflows(current, all, 1);
  assert.equal(related.length, 1);
});
