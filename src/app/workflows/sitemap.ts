import type { MetadataRoute } from "next";
import { listWorkflows } from "@/lib/workflow-catalog";
import { buildWorkflowSitemapEntries } from "@/lib/workflow-sitemap";

// A dedicated sitemap for agent (workflow) pages, served at
// /workflows/sitemap.xml. Mirrors src/app/blog/sitemap.ts's exact rationale
// and pattern (see that file's header for the full argument): the root
// sitemap is one 3.3MB file with ~20k entries, almost all auto-generated
// /s/<source>/<slug> catalog pages, and Google re-reads it on its own slow
// schedule (weeks, not hours). A few-KB file scoped to just this fast-moving
// surface gets re-read far more often.
//
// AGENT_SEO_AEO_EXECUTION_PLAN_2026-07-30, Day 6: "Add a small dedicated
// agent sitemap. Include only reviewed_indexable and run_proven." Reuses
// buildWorkflowSitemapEntries() (lib/workflow-sitemap.ts) -- the SAME
// filter+map the root sitemap's workflow entries already use, via
// isWorkflowPageIndexable() -- so this file can never diverge from what the
// root sitemap or the detail pages' own robots meta consider indexable. A
// workflow is listed in BOTH the root sitemap and here on purpose (same
// reasoning as blog): listing a URL in two sitemaps is allowed by the
// protocol and is not duplicate content, since the canonical tag decides
// identity, not sitemap membership.
//
// revalidate matches blog's: short enough that a promotion (draft_noindex ->
// reviewed_indexable) is picked up within the hour, not up to a day later.

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await listWorkflows();
  return buildWorkflowSitemapEntries(entries);
}
