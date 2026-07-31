import type { MetadataRoute } from "next";
// Relative (not "@/lib/...") so this file resolves under plain
// `node --experimental-strip-types` in tests, not only Next's bundler --
// see workflow-sitemap.test.ts.
import { absoluteUrl } from "./site.ts";
import { isWorkflowPageIndexable } from "./workflow-indexability.ts";
import type { WorkflowCard } from "./workflow-catalog.ts";

// Extracted out of src/app/sitemap.ts (a .tsx-adjacent route file that also
// imports next/server's after(), which a plain node --test run can't load)
// so the actual filter+map that decides sitemap membership is directly
// testable, not just the isWorkflowPageIndexable predicate it calls. A test
// that only pins the predicate would stay green even if this file's
// `.filter(...)` call were deleted -- see workflow-sitemap.test.ts.
//
// Day 3-4: uses the COMBINED gate (publication_state AND editorial_complete),
// not the bare state check -- see workflow-indexability.ts's header for why
// this must be the one function both the sitemap and the metadata robots
// decision call, never publication_state read directly.
export function buildWorkflowSitemapEntries(
  entries: WorkflowCard[],
): MetadataRoute.Sitemap {
  return entries
    .filter((w) => isWorkflowPageIndexable(w))
    .map((w) => ({
      url: absoluteUrl(`/workflows/${w.slug}`),
      lastModified: w.last_seen_at ? new Date(w.last_seen_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
}
