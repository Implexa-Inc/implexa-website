import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Workflow, Calendar, Layers } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { absoluteUrl } from "@/lib/site";
import { jsonLdGraph, breadcrumbSchema } from "@/lib/jsonld";
import { listWorkflows, type WorkflowCard } from "@/lib/workflow-catalog";

// /workflows — the public catalog of whole-job workflows. Each workflow
// stitches verified skills into a complete recurring job (a daily content
// pack, a weekly market report) that runs on a schedule inside Claude. This
// is both the browse surface AND the AEO/distribution surface: one indexable
// URL per workflow, each with a one-click path into Claude.

const VERTICAL_LABEL: Record<string, string> = {
  builder: "builders",
  realtor: "realtors",
};

type SearchParams = { vertical?: string | string[] };

export async function generateMetadata(props: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await props.searchParams;
  const vertical = typeof sp.vertical === "string" ? sp.vertical : "";
  const title = vertical
    ? `${vertical} workflows you can run on a schedule`
    : "AI workflows you can run on a schedule";
  return {
    title,
    description:
      "Ready-made AI workflows that stitch verified skills into a whole recurring job, a daily content pack, a weekly market report, a morning build brief, and run on a schedule inside Claude. Install once, let it deliver.",
    alternates: { canonical: "/workflows" },
    // og:image injected from the colocated opengraph-image.tsx.
    openGraph: {
      type: "website",
      url: absoluteUrl("/workflows"),
      title: `${title} | implexa`,
      description:
        "Whole-job AI workflows built from verified skills, runnable on a schedule. Browse the catalog and install in one line.",
    },
  };
}

const VERTICALS = ["all", "builder", "realtor"];

function cadenceBadge(cadence: string | null) {
  if (!cadence) return null;
  return (
    <Badge
      variant="outline"
      className="text-[10px] uppercase tracking-wider border-zinc-800 text-amber-300/90"
    >
      <Calendar className="size-2.5 mr-1" aria-hidden="true" />
      {cadence}
    </Badge>
  );
}

function WorkflowGridCard({ w }: { w: WorkflowCard }) {
  return (
    <Card className="h-full bg-zinc-950 border-zinc-900 hover:border-zinc-700 transition-colors">
      <Link href={`/workflows/${w.slug}`} className="group block h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            {w.vertical ? (
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
              >
                {w.vertical}
              </Badge>
            ) : (
              <span />
            )}
            {cadenceBadge(w.cadence)}
          </div>
          <CardTitle className="text-base font-medium text-white group-hover:text-zinc-100 lowercase">
            {w.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-zinc-400 line-clamp-3">
            {w.primary_outcome || w.description}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Layers className="size-3" aria-hidden="true" />
            {w.step_count} steps
            {w.bound_step_count > 0 ? (
              <span className="text-emerald-400/80">
                · {w.bound_step_count} from verified skills
              </span>
            ) : null}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

export default async function WorkflowsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const verticalFilter = typeof sp.vertical === "string" ? sp.vertical : "";

  const all = await listWorkflows();
  const workflows = verticalFilter
    ? all.filter((w) => w.vertical === verticalFilter)
    : all;
  const hasResults = workflows.length > 0;

  const ldJson = jsonLdGraph(
    {
      "@type": "CollectionPage",
      name: "AI workflows you can run on a schedule",
      description:
        "Whole-job AI workflows built from verified skills, runnable on a schedule inside Claude.",
      url: absoluteUrl("/workflows"),
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: workflows.length,
        itemListElement: workflows.slice(0, 20).map((w, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(`/workflows/${w.slug}`),
          name: w.name,
        })),
      },
    },
    breadcrumbSchema([
      { name: "implexa", url: absoluteUrl("/") },
      { name: "workflows", url: absoluteUrl("/workflows") },
    ]),
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back home
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <Workflow className="size-6 text-zinc-400" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white lowercase">
            workflows
          </h1>
        </div>
        <p className="text-lg text-zinc-400 max-w-2xl mb-8">
          whole-job automations. each one stitches{" "}
          <Link
            href="/scores"
            className="text-white underline decoration-amber-400 decoration-2 underline-offset-4 hover:decoration-amber-300 transition-colors"
          >
            verified skills
          </Link>{" "}
          into a complete recurring job, a daily content pack, a weekly market
          report, a morning build brief, and runs it on a schedule inside
          Claude. install once, let it deliver.
        </p>

        {/* vertical filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {VERTICALS.map((v) => {
            const active = v === "all" ? !verticalFilter : verticalFilter === v;
            return (
              <Link
                key={v}
                href={
                  v === "all"
                    ? "/workflows"
                    : `/workflows?vertical=${encodeURIComponent(v)}`
                }
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  active
                    ? "bg-white text-black"
                    : "border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-950"
                }`}
              >
                {v === "all" ? "all" : VERTICAL_LABEL[v] ?? v}
              </Link>
            );
          })}
        </div>

        {hasResults ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((w) => (
              <WorkflowGridCard key={w.slug} w={w} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-8 text-center">
            <Workflow
              className="size-8 text-zinc-700 mx-auto mb-4"
              aria-hidden="true"
            />
            <p className="text-base text-white mb-2">
              {verticalFilter
                ? `no workflows yet for ${verticalFilter}`
                : "workflows are loading"}
            </p>
            <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
              the workflow catalog is seeded from the best repeatable jobs across
              the web. check back shortly, or browse the skill index.
            </p>
            <Link
              href="/scores"
              className="text-sm text-white hover:underline inline-flex items-center gap-1"
            >
              browse skills
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson }}
      />
    </>
  );
}
