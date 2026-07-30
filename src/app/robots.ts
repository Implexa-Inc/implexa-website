import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Dynamic robots.txt. Wires the sitemap URL off the same SITE_URL constant
// the rest of the SEO surface uses so we don't get an environment-mismatch
// bug between preview deploys and prod.
//
// Cached statically by Next.js (no request-time APIs touched), so production
// serves a flat file from the edge.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /search is an infinite ?q= query space (a crawl trap) with no SEO
        // value: the canonical content lives on /s/<source>/<slug> skill pages,
        // which stay fully crawlable. Disallowing it stops compliant crawlers
        // from burning render budget on result pages we never want indexed.
        // (Bad scrapers ignore robots entirely; the Vercel Firewall handles
        // those.) The skill + agent catalogs (/s/, /workflows) are intentionally
        // NOT disallowed, so they keep ranking and feeding answer engines.
        disallow: ["/search", "/api/"],
      },
    ],
    // Three sitemaps are advertised. /sitemap.xml carries the full
    // ~20k-entry catalog; /blog/sitemap.xml and /workflows/sitemap.xml each
    // carry just their own fast-moving surface. Both are listed redundantly
    // alongside the root sitemap on purpose: the big file is only re-read
    // every few weeks (Google read it on 2026-06-02 and not again for the
    // next 43 days), which left every post published in that window
    // undiscovered. The small files are cheap to re-read, so new posts and
    // newly-promoted agent pages (Day 6, AGENT_SEO_AEO_EXECUTION_PLAN_2026-
    // 07-30) get picked up in hours instead.
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/blog/sitemap.xml`,
      `${SITE_URL}/workflows/sitemap.xml`,
    ],
    host: SITE_URL,
  };
}
