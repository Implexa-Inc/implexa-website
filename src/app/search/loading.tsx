import { Loader2, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Server-rendered fallback shown while /search streams. The skeleton
// mirrors the real page's layout (back link → search bar → result grid)
// so the swap to real content is layout-shift-free.
//
// Next.js app router auto-mounts this between navigation start and the
// resolution of the route's `page.tsx` data fetches. With a 10s upstream
// timeout on the MCP recommend_skills_for_context call, this is the
// difference between "tab feels frozen" and "we acknowledged the click".
export default function SearchLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-10">
        {/* back link placeholder — non-interactive during loading */}
        <div className="inline-flex items-center gap-2 text-sm text-zinc-600 mb-6">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back home
        </div>

        {/* status line: spinner + "searching" so the user has unambiguous
            feedback that work is happening. */}
        <div className="flex items-center gap-3 mb-8" role="status" aria-live="polite">
          <Loader2 className="size-4 text-zinc-500 animate-spin" aria-hidden="true" />
          <span className="text-sm text-zinc-400">searching the index...</span>
        </div>

        {/* skeleton grid mirroring the real card layout. 6 placeholders
            keeps the page from feeling empty during the wait. */}
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-900 bg-zinc-950 p-5 animate-pulse"
              aria-hidden="true"
            >
              <div className="h-4 w-2/3 bg-zinc-900 rounded mb-3" />
              <div className="h-3 w-full bg-zinc-900 rounded mb-2" />
              <div className="h-3 w-5/6 bg-zinc-900 rounded mb-2" />
              <div className="h-3 w-4/6 bg-zinc-900 rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-5 w-14 bg-zinc-900 rounded-full" />
                <div className="h-5 w-20 bg-zinc-900 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
