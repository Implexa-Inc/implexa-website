import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { absoluteUrl } from "@/lib/site";
import { jsonLdGraph, breadcrumbSchema, scoresPageSchema } from "@/lib/jsonld";

// /scores is the public leaderboard of SkillRank scores. The SkillScore chip
// ships the real implementation; this page stands up the route + canonical
// surface + JSON-LD scaffolding so Google can start crawling on day 1 even
// before the SkillScore chip merges. When SkillScore lands, replace the
// "no scores yet" body with the live leaderboard render.
//
// Schema: WebPage + ItemList (currently empty). Once SkillScore data is
// live, the page builder will populate scoresPageSchema(topSkills) with
// real entries and the JSON-LD will become a ranked list eligible for
// Google's carousel rich result.

export const metadata: Metadata = {
  title: "top-rated skills",
  description:
    "the SkillRank leaderboard across the cross-vendor index. multi-signal ranking from semantic match, tool overlap, cohort co-occurrence, and outcome attribution.",
  alternates: { canonical: "/scores" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/scores"),
    title: "top-rated skills | implexa",
    description:
      "the SkillRank leaderboard across the cross-vendor index.",
  },
};

export default function ScoresPage() {
  // Empty list while SkillScore chip is in flight. The JSON-LD still emits
  // a valid WebPage + ItemList(numberOfItems: 0); Google treats this as a
  // legitimate placeholder.
  const ldJson = jsonLdGraph(
    scoresPageSchema([]),
    breadcrumbSchema([
      { name: "implexa", url: absoluteUrl("/") },
      { name: "scores", url: absoluteUrl("/scores") },
    ]),
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back home
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <BarChart3 className="size-6 text-zinc-400" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            top-rated skills
          </h1>
        </div>
        <p className="text-lg text-zinc-400 max-w-2xl mb-10">
          the SkillRank leaderboard across the cross-vendor index. multi-signal
          ranking from semantic match, tool overlap, cohort co-occurrence, and
          outcome attribution.
        </p>

        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-8 text-center">
          <p className="text-base text-white mb-2">
            leaderboard is computing
          </p>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            SkillRank scores light up as soon as we hit critical mass of
            outcome signals. check back in a few days, or watch the index
            grow on the homepage.
          </p>
          <Link
            href="/"
            className="text-sm text-white hover:underline inline-flex items-center gap-1"
          >
            browse the index
          </Link>
        </div>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson }}
      />
    </>
  );
}
