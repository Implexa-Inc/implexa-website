import { createFileRoute } from "@tanstack/react-router";

// Cache the full video bytes in module scope (per isolate) so repeated
// range requests don't refetch from origin every time.
let cachedBytes: Uint8Array | null = null;
let cachedEtag: string | null = null;

async function loadVideo(request: Request): Promise<Uint8Array> {
  if (cachedBytes) return cachedBytes;
  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/implexa-trailer.mp4`);
  if (!res.ok) throw new Error(`Failed to load video: ${res.status}`);
  cachedEtag = res.headers.get("etag");
  const buf = new Uint8Array(await res.arrayBuffer());
  cachedBytes = buf;
  return buf;
}

function buildResponse(bytes: Uint8Array, range: string | null): Response {
  const total = bytes.byteLength;
  const baseHeaders: Record<string, string> = {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
  };
  if (cachedEtag) baseHeaders["ETag"] = cachedEtag;

  if (!range) {
    return new Response(new Blob([bytes]), {
      status: 200,
      headers: { ...baseHeaders, "Content-Length": String(total) },
    });
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!match) {
    return new Response(new Blob([bytes]), {
      status: 200,
      headers: { ...baseHeaders, "Content-Length": String(total) },
    });
  }

  let start = match[1] ? parseInt(match[1], 10) : 0;
  let end = match[2] ? parseInt(match[2], 10) : total - 1;
  if (isNaN(start) || isNaN(end) || start > end || end >= total) {
    return new Response("Range Not Satisfiable", {
      status: 416,
      headers: { "Content-Range": `bytes */${total}` },
    });
  }

  const slice = bytes.subarray(start, end + 1);
  return new Response(new Blob([slice]), {
    status: 206,
    headers: {
      ...baseHeaders,
      "Content-Length": String(slice.byteLength),
      "Content-Range": `bytes ${start}-${end}/${total}`,
    },
  });
}

export const Route = createFileRoute("/api/public/trailer")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const bytes = await loadVideo(request);
        return buildResponse(bytes, request.headers.get("range"));
      },
      HEAD: async ({ request }) => {
        const bytes = await loadVideo(request);
        const res = buildResponse(bytes, request.headers.get("range"));
        return new Response(null, { status: res.status, headers: res.headers });
      },
    },
  },
});
