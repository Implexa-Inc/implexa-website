import type { ReactElement } from "react";

// Shared renderer for dynamic OG cards (next/og ImageResponse children).
//
// Every route-level opengraph-image.tsx imports renderOgCard() so the social
// card looks identical across the site (homepage, articles, pillar pages) and
// matches the per-skill card at /s/[source]/[slug]/opengraph-image.tsx. The
// only thing that varies per route is the title / description / eyebrow.
//
// Kept framework-agnostic: returns a plain ReactElement, so each route wraps
// it in `new ImageResponse(renderOgCard(...), { ...OG_SIZE })`. Uses only
// inline styles + system-ui (the default font ImageResponse bundles), so no
// font file needs loading and the helper runs on either the node or edge
// runtime depending on the calling route's data source.

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

// Trim a string to `max` chars on a word-ish boundary so titles/descriptions
// never overflow the card. Mirrors the clamp in the /s/ generator.
export function clampOg(s: string | undefined, max: number): string {
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export type OgCardOptions = {
  title: string;
  description?: string;
  // Small uppercase pill in the top-right (e.g. "guide", "blog", "resource").
  // Omit for the site-default card.
  eyebrow?: string;
  // Left-aligned footer tagline. Defaults to the site positioning line.
  tagline?: string;
  // Right-aligned footer URL/path shown under the card.
  footer?: string;
};

export function renderOgCard(opts: OgCardOptions): ReactElement {
  const {
    title,
    description,
    eyebrow,
    tagline = "cross-vendor skill graph, one-click apply",
    footer = "implexa.ai",
  } = opts;

  return (
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
      {/* top row: brand + optional eyebrow pill */}
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
        {eyebrow ? (
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
            {eyebrow}
          </div>
        ) : null}
      </div>

      {/* middle: title + description */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
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
          {clampOg(title, 80)}
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
            {clampOg(description, 180)}
          </div>
        ) : null}
      </div>

      {/* bottom: positioning + url */}
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
        <div style={{ display: "flex" }}>{tagline}</div>
        <div style={{ display: "flex", color: "#a1a1aa" }}>{footer}</div>
      </div>
    </div>
  );
}
