// skill-indexability.ts — the ONE rule that decides whether a /s/ skill
// detail page is allowed to claim indexation.
//
// EXTRACTED from the page's generateMetadata() (2026-07-30, Day 2 item 2).
// It lived inline in `src/app/s/[source]/[slug]/page.tsx` as an unexported
// `hasOriginalBody` constant — correct, but untestable, since nothing outside
// a Next.js render pass could call it. This is the module both the page AND
// its test import, so a change to the rule cannot drift between what ships
// and what's verified.
//
// THE RULE MUST MATCH THE BACKEND'S enrichedOnly FILTER EXACTLY
// (backend#111, hardened backend#112). Two independent implementations of
// "is this skill worth indexing" is exactly the sitemap/metadata disagreement
// #73 was written to close — if this file and the backend's SQL filter ever
// diverge, a page can end up either (a) in the sitemap but noindex, or
// (b) indexable but absent from the sitemap. Both are the bug.
//
//   this file:        enriched === true AND enriched_content is a non-empty string
//   backend (#112):   skill_enrichments row exists AND enriched_content IS NOT NULL AND <> ''
//
// `enriched_content: ''` is already falsy in JS, so `Boolean(x && y)` excludes
// it without an explicit length check — this predicate was already correct on
// that dimension before #112; #112 brought the BACKEND's SQL join up to match
// it, not the other way around.

export type SkillEnrichmentForIndexability = {
  enriched?: boolean;
  enriched_content?: string | null;
} | null | undefined;

export function isSkillIndexable(enrichment: SkillEnrichmentForIndexability): boolean {
  return Boolean(enrichment?.enriched && enrichment.enriched_content);
}
