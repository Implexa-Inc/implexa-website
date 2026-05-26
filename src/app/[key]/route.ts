import { notFound } from "next/navigation";
import { timingSafeEqual } from "node:crypto";

import { getIndexNowKey } from "@/lib/indexnow";

// Serves the IndexNow key verification file at `/<key>.txt`.
//
// How the protocol uses this: when we POST a URL submission to
// api.indexnow.org, Bing fetches this URL and compares the response body
// against the `key` field we sent. Match => crawl. Mismatch or 404 =>
// reject the submission and (if abused) potentially blacklist the host.
//
// Folder naming: Next 16 doesn't recognize a literal suffix on a
// dynamic-segment folder (`[key].txt`) — the bracketed name must BE the
// whole segment. So we capture the entire `<key>.txt` slug here and
// validate that the part before `.txt` matches the configured key.
// Static routes (`/blog`, `/sitemap.xml`, `/llms.txt`, etc.) take
// precedence so this only catches single-segment paths with no static
// match — the same universe of requests that would have 404'd anyway.
//
// force-dynamic: do NOT pre-render this. Doing so would either bake the
// key into the build artifact or try to render at build time when the
// env var isn't available. We want a fresh env-var read per request.

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key: slug } = await params;
  const expected = getIndexNowKey();

  // Env var unset (preview, dev, anyone's fork). Pretend the route
  // doesn't exist — don't reveal whether the feature is even wired.
  if (!expected) notFound();

  // IndexNow expects the key file at `/<key>.txt`. Require the suffix
  // so requests for `/4756...` (no extension) don't match — that would
  // still leak the key on a hit.
  if (!slug.endsWith(".txt")) notFound();
  const requested = slug.slice(0, -".txt".length);

  // Length-gate before timing-safe compare. Different-length inputs
  // can't be timingSafeEqual'd directly, and bailing on length is
  // acceptable here — the expected length is fixed (64 hex chars), so
  // we're not leaking variable information.
  if (requested.length !== expected.length) notFound();

  const a = Buffer.from(requested, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (!timingSafeEqual(a, b)) notFound();

  return new Response(expected, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // Bing re-validates the key file periodically. A short cache is
      // fine and avoids hammering this route on every submission, but
      // we don't want stale validation if we ever rotate the key.
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
