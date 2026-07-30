// node --experimental-strip-types --test src/lib/skill-catalog.test.ts
//
// Day 2 item 2 (AGENT_SEO_AEO_EXECUTION_PLAN_2026-07-30) — the sitemap half of
// the sitemap/metadata invariant. skill-indexability.test.ts pins the RULE the
// page's noindex decision uses; this pins that the sitemap's ONLY request
// mechanism (enrichedOnly:true on every call) is what actually enforces the
// same rule on the membership side. Together they are the closest honest
// proof of "sitemap membership and page metadata agree" obtainable without a
// live backend in CI — a true end-to-end check would need one.
//
// ENV VARS MUST BE SET BEFORE THE MODULE LOADS. `TOKEN` in skill-catalog.ts
// is a module-level `const` read from process.env at import time, and static
// imports evaluate before any other top-level statement in this file would
// run — setting env vars AFTER a static `import './skill-catalog.ts'` would
// be too late; the module would already have captured TOKEN as ''. Using a
// dynamic `import()` after setting the env vars is what makes this ordering
// deterministic.

import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN = 'test-token';
process.env.IMPLEXA_API_URL = 'https://backend.example.test';

const { listAllSkillsForSitemap } = await import('./skill-catalog.ts');

// The exact envelope shape callMcpTool expects: an SSE `data:` line (or plain
// JSON, which it also tolerates) wrapping { result: { content: [{ text }] } },
// where `text` is itself a JSON string — mirrors the real MCP transport.
function sseEnvelope(payload: unknown): string {
  return `event: message\ndata: ${JSON.stringify({ result: { content: [{ text: JSON.stringify(payload) }] } })}\n\n`;
}

test('listAllSkillsForSitemap sends enrichedOnly:true on every page request', async () => {
  const calls: Array<{ url: string; body: unknown }> = [];
  const originalFetch = globalThis.fetch;
  // Two pages, so this also proves enrichedOnly survives pagination (the
  // second call reuses the args object with only `cursor` added).
  let page = 0;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    page += 1;
    const body = JSON.parse(String(init.body));
    calls.push({ url, body });
    const payload = page === 1
      ? { ok: true, rows: [{ source: 'clawhub', slug: 'a', last_seen_at: null }], nextCursor: 'cursor-1' }
      : { ok: true, rows: [{ source: 'clawhub', slug: 'b', last_seen_at: null }], nextCursor: null };
    return new Response(sseEnvelope(payload), { status: 200 });
  }) as typeof fetch;

  try {
    const entries = await listAllSkillsForSitemap();
    assert.equal(entries.length, 2, 'both pages must be walked');
    assert.equal(calls.length, 2, 'pagination must actually issue a second request');
    for (const [i, call] of calls.entries()) {
      assert.equal(call.body.params.name, 'list_aggregated_skills');
      assert.equal(
        call.body.params.arguments.enrichedOnly, true,
        `page ${i + 1} must request enrichedOnly:true — a false/omitted value here is exactly how ~19k noindex URLs got back into the sitemap before #73`,
      );
    }
    // The second call's cursor must be the first call's nextCursor, or
    // pagination silently restarts from page 1 forever.
    assert.equal(calls[1].body.params.arguments.cursor, 'cursor-1');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('an empty backend response (tool not deployed) degrades to an empty sitemap, not a crash', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response('not found', { status: 404 })) as typeof fetch;
  try {
    const entries = await listAllSkillsForSitemap();
    assert.deepEqual(entries, []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
