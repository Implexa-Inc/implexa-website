import { Loader2, ArrowLeft, BarChart3 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Fallback for /scores. The leaderboard pulls list_skill_scores via MCP
// then renders ~50 ranked rows. Without this, the tab sits blank during
// the round-trip; with this, the user gets immediate "we're loading the
// leaderboard" feedback. Layout matches the real page so the swap is
// shift-free.
export default function ScoresLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-12">
        <div className="inline-flex items-center gap-2 text-sm text-zinc-600 mb-8">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back home
        </div>

        <div className="flex items-center gap-3 mb-3">
          <BarChart3 className="size-6 text-zinc-400" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            top-rated skills
          </h1>
        </div>

        <div className="flex items-center gap-3 mb-8" role="status" aria-live="polite">
          <Loader2 className="size-4 text-zinc-500 animate-spin" aria-hidden="true" />
          <span className="text-sm text-zinc-400">loading the leaderboard...</span>
        </div>

        {/* skeleton table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-900 bg-zinc-950">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-900 bg-zinc-950">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-zinc-500 text-xs uppercase tracking-wider w-12">#</th>
                <th className="text-left py-3 px-4 font-medium text-zinc-500 text-xs uppercase tracking-wider w-20">score</th>
                <th className="text-left py-3 px-4 font-medium text-zinc-500 text-xs uppercase tracking-wider w-24">source</th>
                <th className="text-left py-3 px-4 font-medium text-zinc-500 text-xs uppercase tracking-wider">skill</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-900 last:border-b-0 animate-pulse" aria-hidden="true">
                  <td className="py-3 px-4">
                    <div className="h-3 w-4 bg-zinc-900 rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-3 w-8 bg-zinc-900 rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-3 w-16 bg-zinc-900 rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-3 w-2/3 bg-zinc-900 rounded mb-1.5" />
                    <div className="h-2.5 w-1/2 bg-zinc-900 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
