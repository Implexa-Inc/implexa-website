import { createFileRoute } from "@tanstack/react-router";

let cachedBuffer: ArrayBuffer | null = null;
let cachedEtag: string | null = null;

async function loadVideo(request: Request): Promise<ArrayBuffer> {
  if (cachedBuffer) return cachedBuffer;
  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/implexa-trailer.mp4`);
  if (!res.ok) throw new Error(`Failed to load video: ${res.status}`);
  cachedEtag = res.headers.get("etag");
  cachedBuffer = await res.arrayBuffer();
  return cachedBuffer;
}

function buildResponse(buffer: ArrayBuffer, range: string | null): Response {
  const total = buffer.byteLength;
  const baseHeaders: Record<string, string> = {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
  };
  if (cachedEtag) baseHeaders["ETag"] = cachedEtag;

  const match = range ? /^bytes=(\d*)-(\d*)$/.exec(range.trim()) : null;

  if (!match) {
    return new Response(buffer, {
      status: 200,
      headers: { ...baseHeaders, "Content-Length": String(total) },
    });
  }

  const start = match[1] ? parseInt(match[1], 10) : 0;
  const end = match[2] ? parseInt(match[2], 10) : total - 1;
  if (isNaN(start) || isNaN(end) || start > end || end >= total) {
    return new Response("Range Not Satisfiable", {
      status: 416,
      headers: { "Content-Range": `bytes */${total}` },
    });
  }

  const slice = buffer.slice(start, end + 1);
  return new Response(slice, {
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
        const buffer = await loadVideo(request);
        return buildResponse(buffer, request.headers.get("range"));
      },
      HEAD: async ({ request }) => {
        const buffer = await loadVideo(request);
        const res = buildResponse(buffer, request.headers.get("range"));
        return new Response(null, { status: res.status, headers: res.headers });
      },
    },
  },
});
