import { ImageResponse } from "next/og";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

// Site-default 1200×630 OG card. Inherited by every route that doesn't ship
// its own opengraph-image — i.e. the homepage and all static pages (pricing,
// install, contact, developers, scores, search, workflows, index pages).
// Before this existed, those pages had no og:image at all, so shares on
// X / Slack / LinkedIn / iMessage rendered a bare text link.
//
// Static: no request-time data, so Next prerenders it once at build and
// serves it from cache.

export const alt = SITE_TITLE;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    renderOgCard({ title: SITE_TITLE, description: SITE_DESCRIPTION }),
    { ...size },
  );
}
