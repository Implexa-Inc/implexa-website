import type { Metadata } from "next";
// Relative (not "@/lib/...") so this file resolves under plain
// `node --experimental-strip-types` in tests, not only Next's bundler --
// see workflow-metadata.test.ts.
import { absoluteUrl } from "./site.ts";
import { isWorkflowIndexable } from "./workflow-indexability.ts";
import { resolveQuery, hasResolvedQuery } from "./workflow-query.ts";
import type { WorkflowDetail } from "./workflow-catalog.ts";

// Extracted out of generateMetadata() in
// src/app/workflows/[slug]/page.tsx -- that file is .tsx (JSX, not just TS
// types), which node's --experimental-strip-types can't load, so the actual
// metadata object (including the robots wiring) was previously untestable in
// isolation. generateMetadata() is now a thin wrapper: fetch, then call this.
// A test that only pinned isWorkflowIndexable would stay green even if the
// `...(indexable ? {} : { robots: ... })` spread below were deleted -- see
// workflow-metadata.test.ts for that exact case.
export function buildWorkflowMetadata(
  w: WorkflowDetail | null,
  slug: string,
): Metadata {
  if (!w) {
    return {
      title: "Agent not found",
      description: "This agent is not in the catalog.",
      alternates: { canonical: `/workflows/${slug}` },
    };
  }
  // The page IS the query: lead the title tag with the high-intent thought, so
  // it matches the searcher's phrasing in the SERP and in answer-engine cites.
  const query = resolveQuery(w);
  const isQuery = hasResolvedQuery(w);
  const desc =
    (w.primary_outcome || w.job || w.description || "").slice(0, 200) ||
    "A whole-job AI agent you build once and run on a schedule inside your own Claude or Codex.";
  const title = isQuery ? `${query}: the agent that answers it` : w.name;
  // query is sentence case (resolveQuery); the suffix stays lowercase after the
  // colon, which is valid sentence case for a continuation clause.
  //
  // Day 2 item 5 (2026-07-30): noindex unless the PERSISTED publication_state
  // says otherwise -- isWorkflowIndexable, same predicate
  // workflow-sitemap.ts's buildWorkflowSitemapEntries() filters on. Before
  // this, all workflow pages were implicitly indexable (no robots field was
  // ever set here). `follow` is deliberate, same reasoning as the
  // skills-surface fix (#72): the page stays live, usable, and internally
  // linked; this withdraws an index claim, not the page itself.
  const indexable = isWorkflowIndexable(w.publication_state);
  return {
    title,
    description: desc,
    alternates: { canonical: `/workflows/${slug}` },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    // og:image / twitter:image are injected automatically from the colocated
    // opengraph-image.tsx (the dynamic card generator), no images field here.
    openGraph: {
      type: "article",
      url: absoluteUrl(`/workflows/${slug}`),
      title: isQuery ? query : `${w.name} | implexa agent`,
      description: desc,
    },
    twitter: {
      card: "summary_large_image",
      title: isQuery ? query : w.name,
      description: desc,
    },
  };
}
