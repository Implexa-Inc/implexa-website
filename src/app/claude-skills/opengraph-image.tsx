import { ImageResponse } from "next/og";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

// OG card for the /claude-skills pillar page. Replaces the dead
// `/og-claude-skills.png` static reference. Static (no request-time data),
// so it's prerendered once at build.

export const alt = "what are claude skills?";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    renderOgCard({
      title: "what are claude skills?",
      description:
        "the pillar guide: SKILL.md anatomy, the 6-component contract, and how skills run across claude code, codex, and cursor.",
      eyebrow: "guide",
      footer: "implexa.ai/claude-skills",
    }),
    { ...size },
  );
}
