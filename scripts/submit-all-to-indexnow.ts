#!/usr/bin/env node
// One-shot bootstrap submitter for IndexNow.
//
// Runs ONCE after the IndexNow integration first lands in production, to
// flush every URL the sitemap knows about into Bing's queue. After this,
// the sitemap's `after()` hook handles incremental submissions on its
// own daily revalidate cycle, so you should not need to run this again
// unless you do a big content reshape.
//
// Usage:
//   IMPLEXA_INDEXNOW_KEY=<key> node --experimental-strip-types \
//     scripts/submit-all-to-indexnow.ts
//
// Or with a different site (preview testing):
//   IMPLEXA_INDEXNOW_KEY=<key> SITE_URL=https://implexa-git-foo.vercel.app \
//     node --experimental-strip-types scripts/submit-all-to-indexnow.ts
//
// Node 22.6+ understands `--experimental-strip-types`. On Node 23.6+ the
// flag is unnecessary. Or run via tsx: `npx tsx scripts/...`.
//
// This file is intentionally standalone — no imports from src/ — so it
// doesn't need the bundler's path-alias resolution to execute.

const SITE_URL = (process.env.SITE_URL ?? "https://implexa.ai").replace(
  /\/+$/,
  ""
);
const KEY = process.env.IMPLEXA_INDEXNOW_KEY?.trim() ?? "";
const ENDPOINT = "https://api.indexnow.org/IndexNow";
const MAX_PER_SUBMISSION = 10_000;

function die(msg: string): never {
  console.error(`[indexnow-bootstrap] ${msg}`);
  process.exit(1);
}

if (!KEY || KEY.length < 32) {
  die("Set IMPLEXA_INDEXNOW_KEY (32+ char hex) in the environment.");
}

const host = new URL(SITE_URL).host;
const keyLocation = `${SITE_URL}/${KEY}.txt`;

async function fetchSitemap(): Promise<string[]> {
  const url = `${SITE_URL}/sitemap.xml`;
  console.log(`[indexnow-bootstrap] fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    die(`sitemap fetch failed: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();
  // Pull every <loc>...</loc>. The sitemap is plain XML — no namespaces
  // need parsing, no CDATA expected from Next's MetadataRoute output —
  // so a regex is the right tool here.
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) ?? [];
  return matches.map((m) => m.slice(5, -6).trim()).filter(Boolean);
}

function chunk<T>(items: T[], size: number): T[][] {
  if (items.length <= size) return [items];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function submit(urls: string[]): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
      accept: "application/json",
    },
    body: JSON.stringify({ host, key: KEY, keyLocation, urlList: urls }),
  });
  const ok = res.ok || res.status === 202;
  console.log(
    `[indexnow-bootstrap] batch of ${urls.length}: ${res.status} ${res.statusText}${ok ? " ✓" : " ✗"}`
  );
  if (!ok) {
    const body = await res.text().catch(() => "");
    die(`submission failed${body ? `: ${body}` : ""}`);
  }
}

async function main(): Promise<void> {
  const urls = await fetchSitemap();
  console.log(`[indexnow-bootstrap] found ${urls.length} URLs in sitemap`);
  if (urls.length === 0) {
    die("sitemap returned zero URLs — refusing to submit empty batch");
  }

  const batches = chunk(urls, MAX_PER_SUBMISSION);
  for (const [i, batch] of batches.entries()) {
    console.log(
      `[indexnow-bootstrap] submitting batch ${i + 1}/${batches.length}`
    );
    await submit(batch);
  }

  console.log(
    `[indexnow-bootstrap] done — submitted ${urls.length} URLs across ${batches.length} batch(es)`
  );
}

main().catch((err) => {
  die(err instanceof Error ? err.message : String(err));
});
