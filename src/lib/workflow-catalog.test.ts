// node --experimental-strip-types --test src/lib/workflow-catalog.test.ts
//
// Day 2 item 5. workflowPages() in src/app/sitemap.ts is unexported and lives
// in a file that imports next/server's after() -- not importable outside the
// Next runtime, the same reason skillPages()/sitemap() itself weren't
// directly tested in item 2. So this proves the piece that IS testable in
// isolation: listWorkflows() carries publication_state through the MCP round
// trip faithfully. The FILTER itself (`.filter(w =>
// isWorkflowIndexable(w.publication_state))`) is one line calling an already
// -tested pure function (workflow-indexability.test.ts) against
// already-tested passthrough data -- the closest honest proof of "sitemap
// membership follows the persisted state" obtainable without a live backend
// in CI, same characterization as skill-catalog.test.ts.
//
// ENV-VAR ORDERING: see skill-catalog.test.ts's header -- TOKEN is a
// module-level const read at import time, so this uses a dynamic import
// after setting the vars, for the same reason.

import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN = 'test-token';
process.env.IMPLEXA_API_URL = 'https://backend.example.test';

const { listWorkflows } = await import('./workflow-catalog.ts');

function sseEnvelope(payload: unknown): string {
  return `event: message\ndata: ${JSON.stringify({ result: { content: [{ text: JSON.stringify(payload) }] } })}\n\n`;
}

const WORKFLOW_ROW = (overrides: Record<string, unknown> = {}) => ({
  source: 'web-seed', slug: 'a', name: 'A', description: 'd',
  vertical: null, cadence: null, primary_outcome: null,
  step_count: 1, bound_step_count: 1, run_count: 0, scheduled_count: 0,
  curated: true, unproven: false, last_seen_at: null,
  ...overrides,
});

async function withFetch<T>(payload: unknown, fn: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => new Response(sseEnvelope(payload), { status: 200 })) as typeof fetch;
  try {
    return await fn();
  } finally {
    globalThis.fetch = original;
  }
}

test('publication_state round-trips through listWorkflows() unchanged', async () => {
  const out = await withFetch(
    { ok: true, count: 1, workflows: [WORKFLOW_ROW({ publication_state: 'run_proven' })] },
    () => listWorkflows(),
  );
  assert.equal(out[0].publication_state, 'run_proven');
});

test('a workflow row with no publication_state (pre-migration backend) normalizes to null', async () => {
  // This is the FAIL-CLOSED case that matters: an old backend omitting the
  // field entirely must not make the workflow indexable by accident.
  const { publication_state: _drop, ...noState } = WORKFLOW_ROW({ publication_state: undefined });
  const out = await withFetch(
    { ok: true, count: 1, workflows: [noState] },
    () => listWorkflows(),
  );
  assert.equal(out[0].publication_state, null);
});

test('a non-string publication_state (malformed response) normalizes to null, not thrown through', async () => {
  const out = await withFetch(
    { ok: true, count: 1, workflows: [WORKFLOW_ROW({ publication_state: 42 })] },
    () => listWorkflows(),
  );
  assert.equal(out[0].publication_state, null);
});
