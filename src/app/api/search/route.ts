import { NextResponse, type NextRequest } from "next/server";

// proxies to the implexa backend MCP endpoint.
// the backend implements recommend_skills_for_context which does the
// semantic search against aggregated_skills.
//
// auth: a public-search bearer token is required by the backend. set
// IMPLEXA_PUBLIC_SEARCH_TOKEN in vercel env. while empty, the route returns
// an empty result set with a hint so the frontend can render a placeholder.

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

type Skill = {
  slug: string;
  source: string;
  title: string;
  description: string;
  score?: number;
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ query: "", results: [] satisfies Skill[] });
  }

  if (!TOKEN) {
    return NextResponse.json({
      query: q,
      results: [] satisfies Skill[],
      hint: "set IMPLEXA_PUBLIC_SEARCH_TOKEN in vercel env to wire live search",
    });
  }

  try {
    const upstream = await fetch(`${BACKEND}/api/v2/mcp`, {
      method: "POST",
      headers: {
        // The Implexa MCP endpoint is a streamable HTTP server. It enforces an
        // Accept header that lists BOTH application/json and text/event-stream,
        // otherwise it rejects with 406 "Not Acceptable". This isn't optional.
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
        authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "recommend_skills_for_context",
          // The tool's Zod schema requires `messages` as an array of strings
          // (representing recent user prompts, oldest first). We pass the
          // single search query as the only message. top_n caps results.
          arguments: { messages: [q], top_n: 12, min_score: 0.20 },
        },
      }),
      // keep this snappy; the search box is interactive.
      signal: AbortSignal.timeout(8000),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { query: q, results: [], error: `upstream ${upstream.status}` },
        { status: 502 },
      );
    }

    // Backend responds as SSE: `event: message\ndata: {json}\n\n`. Parse the
    // first data line. Fall back to plain JSON parsing if upstream ever stops
    // wrapping in SSE.
    const text = await upstream.text();
    const dataLine = text
      .split("\n")
      .find((ln) => ln.startsWith("data: "));
    const jsonStr = dataLine ? dataLine.slice(6) : text;

    let body: { result?: { content?: Array<{ text?: string }> } };
    try {
      body = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ query: q, results: [], raw: text.slice(0, 500) });
    }

    // MCP tools/call wraps the tool's return in result.content[0].text as a
    // JSON string. recommend_skills_for_context returns { matches: [...] }.
    const raw = body?.result?.content?.[0]?.text ?? "{}";
    let results: Skill[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.matches)) {
        results = parsed.matches.map((m: Record<string, unknown>) => ({
          slug: String(m.slug ?? ""),
          source: String(m.source ?? ""),
          title: String(m.name ?? m.slug ?? ""),
          description: String(m.description ?? m.fit_reason ?? ""),
          score: typeof m.score === "number" ? m.score : undefined,
        }));
      } else if (Array.isArray(parsed)) {
        results = parsed as Skill[];
      }
    } catch {
      // backend returned plain text. surface it for debugging.
      return NextResponse.json({ query: q, results: [], raw });
    }

    return NextResponse.json({ query: q, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      { query: q, results: [], error: message },
      { status: 502 },
    );
  }
}
