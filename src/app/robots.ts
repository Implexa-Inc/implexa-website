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
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
