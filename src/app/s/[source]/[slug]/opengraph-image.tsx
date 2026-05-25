import { ImageResponse } from "next/og";

// Dynamic 1200×630 OG card per skill detail page. Renders skill.name +
// description + source badge on the implexa dark theme. Next.js wires this
// route automatically: visiting /s/<source>/<slug>/opengraph-image returns
// the PNG, and generated <meta property="og:image"> in the detail page's
// metadata points at it.
//
// Cost: ~$0.0001 per generation via Vercel's edge runtime. Most requests
// hit Next.js's static cache once the page is built so this is effectively
// free across the steady state.

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "implexa skill";

type RouteParams = { source: string; slug: string };

type AggregatedSkill = {
  ok: boolean;
  name?: string;
  description?: string;
};

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

// Lighter version of the detail page's fetcher: we only need name +
// description. No content. Falls back to slug-derived defaults so the OG
// card always renders something even when the backend is unreachable.
async function fetchSkillForOg(
  source: string,
  slug: string,
): Promise<AggregatedSkill | null> {
  if (!TOKEN) return null;
  try {
    const upstream = await fetch(`${BACKEND}/api/v2/mcp`, {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
        authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "get_aggregated_skill",
          arguments: { source, slug },
        },
      }),
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 },
    });
    if (!upstream.ok) return null;
    const text = await upstream.text();
    const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
    const jsonStr = dataLine ? dataLine.slice(6) : text;
    const body: { result?: { content?: Array<{ text?: string }> } } =
      JSON.parse(jsonStr);
    const raw = body?.result?.content?.[0]?.text ?? "{}";
    const parsed: AggregatedSkill = JSON.parse(raw);
    if (!parsed?.ok) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Trim description to fit two lines on the card without overflow.
function clamp(s: string | undefined, max: number): string {
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export default async function Image(props: {
  params: Promise<RouteParams>;
}) {
  const { source, slug } = await props.params;
  const skill = await fetchSkillForOg(source, slug);

  const name = skill?.name ?? slug.replace(/-/g, " ");
  const description = clamp(skill?.description, 180);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#000000",
          color: "#ffffff",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* top row: brand + source badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            fontSize: 28,
            color: "#a1a1aa",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "#ffffff",
              fontWeight: 600,
              letterSpacing: -0.5,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: "#ffffff",
                display: "flex",
              }}
            />
            implexa
          </div>
          <div
            style={{
              display: "flex",
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid #27272a",
              color: "#d4d4d8",
              fontSize: 22,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            {source}
          </div>
        </div>

        {/* middle: name + description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 78,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#ffffff",
            }}
          >
            {clamp(name, 80)}
          </div>
          {description ? (
            <div
              style={{
                display: "flex",
                fontSize: 32,
                lineHeight: 1.4,
                color: "#a1a1aa",
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        {/* bottom: positioning + URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            fontSize: 24,
            color: "#71717a",
          }}
        >
          <div style={{ display: "flex" }}>
            cross-vendor SKILL.md, one-click apply
          </div>
          <div style={{ display: "flex", color: "#a1a1aa" }}>
            implexa.ai/s/{source}/{slug}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
