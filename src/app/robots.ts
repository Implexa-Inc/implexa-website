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
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
