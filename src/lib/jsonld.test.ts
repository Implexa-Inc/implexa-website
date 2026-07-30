// node --experimental-strip-types --test src/lib/jsonld.test.ts
//
// Day 3-4 (AGENT_SEO_AEO_EXECUTION_PLAN_2026-07-30). This is the first test
// file for jsonld.ts. Scope, stated honestly: it covers ONLY howToSchema()'s
// new `audience` field. Every other schema helper in this file
// (organizationSchema, websiteSchema, breadcrumbSchema,
// softwareApplicationSchema, articleSchema, scoresPageSchema,
// softwareSourceCodeSchema, faqSchema, qaPageSchema, itemListSchema,
// jsonLdGraph) predates this file and has no test coverage yet -- that gap
// existed before this change and isn't closed here.
//
// "Structured data contains no invented claims" (a Days 3-7 test
// requirement): the check that matters here is that `audience` NEVER appears
// in the emitted HowTo node unless the caller explicitly passed one -- the
// page (page.tsx) only ever passes one when it's also rendering that exact
// sentence visibly, so this test pins the schema side of that agreement.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { howToSchema } from './jsonld.ts';

const STEPS = [
  { name: 'Step one', description: 'Do the first thing.' },
  { name: 'Step two', description: 'Do the second thing.' },
];

test('audience is omitted entirely when not provided (no invented claim)', () => {
  const node = howToSchema({ name: 'Test agent', steps: STEPS });
  assert.equal(node?.audience, undefined);
});

test('audience is emitted as a schema.org Audience node, verbatim, only when provided', () => {
  const node = howToSchema({
    name: 'Test agent',
    steps: STEPS,
    audience: 'Solo founders who already have Search Console data.',
  });
  assert.deepEqual(node?.audience, {
    '@type': 'Audience',
    audienceType: 'Solo founders who already have Search Console data.',
  });
});

test('an empty-string audience is treated as not provided (falsy), not emitted as an empty claim', () => {
  const node = howToSchema({ name: 'Test agent', steps: STEPS, audience: '' });
  assert.equal(node?.audience, undefined);
});
