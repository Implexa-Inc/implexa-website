// IndexNow submission helper.
//
// IndexNow is a protocol Bing + Yandex (and a handful of smaller engines)
// support for "I changed this URL, please come crawl it now". A POST to
// api.indexnow.org with a small JSON payload turns the standard
// "discovered but not crawled" wait from weeks into minutes.
//
// Protocol docs: https://www.indexnow.org/documentation
//
// Key handling: the host (implexa.ai) serves the secret key at
// /<key>.txt (see src/app/[key].txt/route.ts). When the IndexNow API gets
// a submission, it fetches that file and matches the body against the
// `key` field in the payload. So the key is shared between this helper
// and the public route handler via the IMPLEXA_INDEXNOW_KEY env var.
//
// When the env var is unset (dev, preview, anyone else's fork) this
// module is a no-op — submission silently returns ok:false with a hint.
// We never throw out of here; sitemap rendering and content updates must
// not fail because a third-party API is rate-limiting us.
//
// Server-only: do not import this from a Client Component. The env var
// is read at call time; it must never end up in a client bundle.

import { SITE_URL } from "@/lib/site";

const ENDPOINT = "https://api.indexnow.org/IndexNow";

// IndexNow caps a single submission at 10,000 URLs. Anything bigger
// has to be split into multiple POSTs.
const MAX_URLS_PER_SUBMISSION = 10_000;

// Module-level timestamp of the most recent successful submission. Read
// by the /api/indexnow-debug route so the founder can verify the wiring
// without us having to leak the actual key. Not persisted — resets when
// the function instance recycles, which is fine: it's a sanity check,
// not an audit trail.
let lastSubmissionAt: number | null = null;

export type IndexNowResult = {
  ok: boolean;
  submitted: number;
  // Present on failure. Stable string so callers can log without thinking.
  error?: string;
};

export function getIndexNowKey(): string | null {
  const key = process.env.IMPLEXA_INDEXNOW_KEY?.trim();
  return key && key.length >= 32 ? key : null;
}

export function getIndexNowKeyUrl(): string | null {
  const key = getIndexNowKey();
  if (!key) return null;
  return `${SITE_URL}/${key}.txt`;
}

export function getLastSubmissionAt(): number | null {
  return lastSubmissionAt;
}

// Extracts the host portion of SITE_URL (e.g. "implexa.ai" from
// "https://implexa.ai"). IndexNow wants the bare host in the payload.
function siteHost(): string {
  return new URL(SITE_URL).host;
}

function chunk<T>(items: T[], size: number): T[][] {
  if (items.length <= size) return [items];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

// Filters and de-duplicates the URL list. IndexNow rejects submissions
// that contain URLs from a different host than the `host` field, so we
// drop anything that isn't on implexa.ai. Also strips query strings —
// IndexNow expects canonical URLs and our sitemap entries are already
// canonical, so this is a belt-and-suspenders check.
function normalizeUrls(urls: string[]): string[] {
  const host = siteHost();
  const seen = new Set<string>();
  for (const raw of urls) {
    try {
      const u = new URL(raw);
      if (u.host !== host) continue;
      // Drop fragments + queries to keep submissions canonical.
      u.hash = "";
      u.search = "";
      seen.add(u.toString());
    } catch {
      // Skip malformed entries silently — not our job to validate the
      // caller's input strictly.
    }
  }
  return Array.from(seen);
}

export async function submitToIndexNow(
  urls: string[]
): Promise<IndexNowResult> {
  const key = getIndexNowKey();
  if (!key) {
    return {
      ok: false,
      submitted: 0,
      error: "IMPLEXA_INDEXNOW_KEY not configured",
    };
  }

  const normalized = normalizeUrls(urls);
  if (normalized.length === 0) {
    return { ok: true, submitted: 0 };
  }

  const host = siteHost();
  const keyLocation = `${SITE_URL}/${key}.txt`;
  const batches = chunk(normalized, MAX_URLS_PER_SUBMISSION);

  let submitted = 0;
  let lastError: string | undefined;

  for (const batch of batches) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json; charset=utf-8",
          accept: "application/json",
        },
        body: JSON.stringify({
          host,
          key,
          keyLocation,
          urlList: batch,
        }),
        // Don't let Next cache the POST response. IndexNow doesn't return
        // body content we care about, and caching this would suppress
        // future submissions for the same URL set.
        cache: "no-store",
      });

      // IndexNow returns 200/202 on success, 4xx on validation issues.
      // 200 = success. 202 = accepted (still processing). Both mean we
      // can move on.
      if (res.ok || res.status === 202) {
        submitted += batch.length;
        continue;
      }

      lastError = `IndexNow returned ${res.status} ${res.statusText}`;
      console.warn(
        `[indexnow] batch failed: ${lastError} (${batch.length} URLs)`
      );
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn(`[indexnow] network error: ${lastError}`);
    }
  }

  if (submitted > 0) {
    lastSubmissionAt = Date.now();
  }

  if (submitted === 0 && lastError) {
    return { ok: false, submitted: 0, error: lastError };
  }
  return { ok: true, submitted };
}
