// node --experimental-strip-types --test src/lib/skill-indexability.test.ts
//
// Day 2 item 2 (AGENT_SEO_AEO_EXECUTION_PLAN_2026-07-30). First executable
// test in this repo — see skill-catalog.test.ts for why the sitemap half of
// the invariant is verified separately, and the package.json "test" script
// comment for why this repo now runs tests via node's native TS stripping
// rather than a bundled runner.
//
// This pins the RULE the /s/ detail page's metadata uses to decide noindex.
// It must keep matching the backend's enrichedOnly SQL filter (backend#112)
// exactly — see the header comment in skill-indexability.ts for the mapping.
// If this predicate and that filter ever diverge, a page ends up either in
// the sitemap but noindex, or indexable but absent from the sitemap: the
// exact sitemap/metadata disagreement #73 was written to close.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isSkillIndexable } from './skill-indexability.ts';

test('enriched with real content is indexable', () => {
  assert.equal(isSkillIndexable({ enriched: true, enriched_content: 'a full procedure write-up' }), true);
});

test('enriched flag true but EMPTY content is NOT indexable', () => {
  // The case backend#112 hardened for: a placeholder enrichment row exists
  // (enriched=true reported) but carries no body. Matches the backend rule
  // exactly (`enriched_content <> ''`), not merely "a row exists".
  assert.equal(isSkillIndexable({ enriched: true, enriched_content: '' }), false);
});

test('enriched flag true but NULL content is NOT indexable', () => {
  assert.equal(isSkillIndexable({ enriched: true, enriched_content: null }), false);
});

test('content present but enriched flag false is NOT indexable', () => {
  // Defensive: the API contract should never produce this shape, but the
  // predicate must not trust `enriched_content` alone if it ever does.
  assert.equal(isSkillIndexable({ enriched: false, enriched_content: 'stray content' }), false);
});

test('no enrichment record at all is NOT indexable', () => {
  assert.equal(isSkillIndexable(null), false);
  assert.equal(isSkillIndexable(undefined), false);
});

test('whitespace-only content still counts as present (matches JS truthiness, not a stricter rule)', () => {
  // Documents the boundary rather than asserting a stricter rule this file
  // does not implement: ' ' is truthy in JS, so it passes today. If the plan
  // later wants a trimmed-length check, it changes HERE and in backend#112's
  // SQL together, or the two diverge again.
  assert.equal(isSkillIndexable({ enriched: true, enriched_content: ' ' }), true);
});
