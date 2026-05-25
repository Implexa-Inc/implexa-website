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
        "content-type": "application/json",
        authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "recommend_skills_for_context",
          arguments: { query: q, k: 12 },
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

    const body = await upstream.json();
    // backend returns MCP tools/call shape. extract the content array.
    const raw = body?.result?.content?.[0]?.text ?? "[]";
    let results: Skill[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) results = parsed as Skill[];
      else if (Array.isArray(parsed?.skills))
        results = parsed.skills as Skill[];
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
