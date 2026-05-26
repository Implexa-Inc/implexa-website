import { Loader2, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Fallback for /s/<source>/<slug>. The detail page does up to three
// parallel MCP calls (skill content, score, enrichment) so worst-case
// it's the slowest top-level surface on the site. This skeleton mirrors
// the real layout (back link → title block → enriched body) so the swap
// to real content doesn't shift things.
export default function SkillDetailLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-10">
        <div className="inline-flex items-center gap-2 text-sm text-zinc-600 mb-6">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back
        </div>

        {/* status pill */}
        <div className="flex items-center gap-3 mb-8" role="status" aria-live="polite">
          <Loader2 className="size-4 text-zinc-500 animate-spin" aria-hidden="true" />
          <span className="text-sm text-zinc-400">loading skill details...</span>
        </div>

        {/* title block skeleton */}
        <div className="animate-pulse mb-8" aria-hidden="true">
          <div className="h-8 w-2/3 bg-zinc-900 rounded mb-3" />
          <div className="h-3 w-full bg-zinc-900 rounded mb-2" />
          <div className="h-3 w-5/6 bg-zinc-900 rounded mb-2" />
          <div className="h-3 w-3/4 bg-zinc-900 rounded mb-4" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-zinc-900 rounded-full" />
            <div className="h-6 w-24 bg-zinc-900 rounded-full" />
            <div className="h-6 w-16 bg-zinc-900 rounded-full" />
          </div>
        </div>

        {/* body skeleton — vertical bars to imitate markdown paragraphs */}
        <div className="space-y-3 animate-pulse" aria-hidden="true">
          <div className="h-4 w-1/3 bg-zinc-900 rounded" />
          <div className="h-3 w-full bg-zinc-900 rounded" />
          <div className="h-3 w-full bg-zinc-900 rounded" />
          <div className="h-3 w-5/6 bg-zinc-900 rounded" />
          <div className="h-3 w-4/6 bg-zinc-900 rounded mb-6" />
          <div className="h-4 w-1/4 bg-zinc-900 rounded" />
          <div className="h-3 w-full bg-zinc-900 rounded" />
          <div className="h-3 w-5/6 bg-zinc-900 rounded" />
          <div className="h-3 w-3/4 bg-zinc-900 rounded" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
