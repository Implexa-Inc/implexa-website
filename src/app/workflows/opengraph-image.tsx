import { ImageResponse } from "next/og";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

// OG card for the /workflows catalog index. Static (one card for the surface);
// the per-workflow cards live at /workflows/[slug]/opengraph-image.tsx. The
// index title varies by ?vertical, but a single representative card is the
// right call for a shared link to the catalog.

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "implexa agents";

export default function Image() {
  return new ImageResponse(
    renderOgCard({
      title: "AI agents you can build and run on a schedule",
      description:
        "one agent per question people ask. build once, let it deliver, free.",
      eyebrow: "agents",
      footer: "implexa.ai/workflows",
    }),
    { ...OG_SIZE },
  );
}
