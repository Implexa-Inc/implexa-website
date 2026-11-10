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

import { conciseJob, hasResolvedQuery, readableSummary, resolveLimitations, resolveQuery, resolveRelatedWorkflows } from './workflow-query.ts';

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

// ── resolveQuery: video agents ───────────────────────────────────────────────
// These agents' descriptions are internal contract text, so without a curated
// entry the derived H1 was unreadable ("How do I planning-only portable
// presenter-overlay project author: canonical transcript, ...") and, for the
// placer, ungrammatical ("How do I an execution-ready ..."). The descriptions
// below are the real ones those H1s were derived from.

test('video agents get their curated query instead of a description-derived H1', () => {
  const cases: Array<[string, string, string]> = [
    ['visual-treatment-planner-runway-remotion',
      'planning-only portable presenter-overlay project author: canonical transcript, typed custody',
      'How do I plan a YouTube video from a presenter recording'],
    ['visual-evidence-remotion-compositor',
      'produce a verified Remotion master from typed inputs and a frozen scene_execution_contract',
      'How do I render a finished YouTube video with Remotion'],
    ['cinematic-b-roll-placer-prompt-writer',
      'an execution-ready visual production bundle that routes every transcript beat',
      'How do I plan where B-roll goes in my video'],
  ];
  for (const [slug, description, expected] of cases) {
    assert.equal(
      resolveQuery({ slug, name: slug, query: null, description }),
      expected,
    );
  }
});

test('a backend-supplied query still wins over the curated map', () => {
  assert.equal(
    resolveQuery({
      slug: 'visual-evidence-remotion-compositor', name: 'x',
      query: 'Backend-owned query', description: 'ignored',
    }),
    'Backend-owned query',
  );
});

// ── resolveQuery: derived questions from internal job text ───────────────────
// The inputs are real agent descriptions behind live H1s on 2026-11-10, when
// 164 of 176 agent pages had an H1 longer than 14 words and 49 started with
// "How do I each ...".

test('a leading cadence clause and trailing explanation are dropped', () => {
  assert.equal(
    resolveQuery({
      slug: 'unmapped-a', name: 'Content ideas', query: null,
      description: 'each week, generate content ideas grounded in the real questions and pains your audience posts publicly, so you never stare at a blank calendar',
    }),
    'How do I generate content ideas grounded in the real questions and pains your audience posts publicly',
  );
  assert.equal(
    resolveQuery({
      slug: 'unmapped-b', name: 'Content refresh', query: null,
      description: 'each month, audit existing published content and plan what to update, repurpose, or retire, so old work keeps earning',
    }),
    'How do I audit existing published content and plan what to update, repurpose, or retire',
  );
});

test('parentheticals and follow-on steps are removed', () => {
  assert.equal(
    conciseJob('turn a raw talking-head video (e.g. a HeyGen avatar clip) into a polished vertical reel, then post it to Instagram'),
    'turn a raw talking-head video into a polished vertical reel',
  );
});

test('text still too long after trimming falls back to the agent name', () => {
  const w = {
    slug: 'unmapped-c', name: 'Boardroom brief', query: null,
    description: 'read the latest Implexa Boardroom Debate output and turn it into a prioritized action plan split across website, dashboard, and marketing inputs',
  };
  assert.equal(resolveQuery(w), 'Boardroom brief');
  assert.equal(hasResolvedQuery(w), false);
});

test('chain wording and noun phrases never become a question', () => {
  assert.equal(conciseJob('run these agents in order, each feeding the next'), '');
  assert.equal(conciseJob('an execution-ready visual production bundle'), '');
});

test('readableSummary keeps the first sentence and caps long text', () => {
  assert.equal(readableSummary('Drafts the brief. Then emails it.'), 'Drafts the brief.');
  const long = Array.from({ length: 60 }, (_, i) => `w${i}`).join(' ');
  const out = readableSummary(long, 10);
  assert.equal(out, 'w0 w1 w2 w3 w4 w5 w6 w7 w8 w9…');
});
