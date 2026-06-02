import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Target,
  CheckCircle2,
  CircleDashed,
  AlertTriangle,
  ExternalLink,
  Workflow as WorkflowIcon,
  Zap,
  Globe,
  Clock,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CopyableInstall } from "@/components/copyable-install";
import { absoluteUrl } from "@/lib/site";
import { jsonLdGraph, breadcrumbSchema, howToSchema } from "@/lib/jsonld";
import {
  getWorkflow,
  listWorkflows,
  type WorkflowDetail,
} from "@/lib/workflow-catalog";

type RouteParams = { slug: string };

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Compact relative time ("2h ago", "3d ago") for the activity strip. The page
// is ISR-cached (~1h via the get_workflow fetch revalidate), so this is accurate
// to within the cache window, which is fine for a social-proof signal.
function timeAgo(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 90) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function shortDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    .toLowerCase();
}

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const w = await getWorkflow(slug);
  if (!w) {
    return {
      title: "workflow not found",
      description: "this workflow is not in the catalog.",
      alternates: { canonical: `/workflows/${slug}` },
    };
  }
  const cadence = w.cadence ? `${w.cadence} ` : "";
  const vertical = w.vertical ? `${w.vertical} ` : "";
  const desc =
    (w.primary_outcome || w.job || w.description || "").slice(0, 200) ||
    "a whole-job AI workflow you can run on a schedule inside Claude.";
  return {
    title: `${w.name}: a ${cadence}${vertical}workflow`,
    description: desc,
    alternates: { canonical: `/workflows/${slug}` },
    // og:image / twitter:image are injected automatically from the colocated
    // opengraph-image.tsx (the dynamic card generator), no images field here.
    openGraph: {
      type: "article",
      url: absoluteUrl(`/workflows/${slug}`),
      title: `${w.name} | implexa workflow`,
      description: desc,
    },
    twitter: {
      card: "summary_large_image",
      title: w.name,
      description: desc,
    },
  };
}

function StepRow({
  step,
}: {
  step: WorkflowDetail["steps"][number];
}) {
  const bound = step.ref && !step.gap;
  return (
    <li className="flex gap-3 py-3">
      <div className="flex-none mt-0.5">
        {bound ? (
          <CheckCircle2 className="size-4 text-emerald-400" aria-hidden="true" />
        ) : (
          <CircleDashed className="size-4 text-zinc-600" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] tabular-nums text-zinc-600">
            step {step.order}
          </span>
          {step.kind !== "skill" ? (
            <Badge
              variant="outline"
              className="text-[9px] uppercase tracking-wider border-zinc-800 text-zinc-500"
            >
              {step.kind}
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-zinc-200">{step.label}</p>
        {/* inline the bound skill's real substance: what it does + a preview of
            the procedure, so the step reads as actual work, not just a label */}
        {bound && step.ref_summary?.description ? (
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
            {step.ref_summary.description}
          </p>
        ) : null}
        {bound && step.ref_summary?.preview ? (
          <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed border-l border-zinc-800 pl-3">
            {step.ref_summary.preview}
          </p>
        ) : null}
        {bound && step.ref ? (
          <Link
            href={`/s/${step.ref.source}/${step.ref.slug}`}
            className="mt-1.5 inline-flex items-center gap-1 text-xs text-emerald-400/90 hover:text-emerald-300 transition-colors"
          >
            {step.ref_summary?.name
              ? `full skill: ${step.ref_summary.name}`
              : `uses verified skill: ${step.ref.slug}`}
            <ExternalLink className="size-2.5" aria-hidden="true" />
          </Link>
        ) : step.kind === "decision" ? (
          <span className="mt-1 block text-xs text-zinc-600">
            decision step
          </span>
        ) : (
          <span className="mt-1 block text-xs text-zinc-600">
            your model fills this step
          </span>
        )}
        {step.fallbacks.length > 0 ? (
          <ul className="mt-1.5 space-y-0.5">
            {step.fallbacks.map((fb) => (
              <li key={fb} className="text-xs text-zinc-500">
                <span className="text-zinc-600">no integration? </span>
                {fb}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

export default async function WorkflowDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await props.params;
  const [w, allWorkflows] = await Promise.all([
    getWorkflow(slug),
    listWorkflows(),
  ]);
  if (!w) notFound();

  // related workflows: prefer same-vertical siblings, fill with the rest, cap 4.
  // interlinks the high-intent workflow pages with each other (internal linking
  // for ranking, since these are the surface we lean into for higher-intent
  // queries). listWorkflows is cached and tiny (~12 rows).
  const otherWorkflows = allWorkflows.filter((x) => x.slug !== w.slug);
  const sameVertical = otherWorkflows.filter(
    (x) => w.vertical && x.vertical === w.vertical,
  );
  const relatedWorkflows = [
    ...sameVertical,
    ...otherWorkflows.filter((x) => !sameVertical.includes(x)),
  ].slice(0, 4);

  const boundCount = w.steps.filter((s) => s.ref && !s.gap).length;

  // Activity strip inputs. Show run/schedule counts only when > 0 (never a
  // demoralizing "0 runs"), but always surface the "updated" date as a
  // freshness signal. Aggregate counts only, never individual run content.
  const activity = w.activity;
  const lastRun = timeAgo(activity.last_run_at);
  const updatedAt = shortDate(w.updated_at);
  const hasActivity =
    activity.run_count > 0 ||
    activity.scheduled_count > 0 ||
    Boolean(updatedAt);

  const ldJson = jsonLdGraph(
    howToSchema({
      name: w.name,
      description: w.job || w.description || undefined,
      url: absoluteUrl(`/workflows/${slug}`),
      steps: w.steps.map((s) => ({ name: s.label })),
    }),
    {
      "@type": "SoftwareApplication",
      name: w.name,
      applicationCategory: "AI Workflow",
      operatingSystem: "Cross-platform (Claude Code, Cursor, Codex, Gemini CLI)",
      description: w.job || w.description || undefined,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      url: absoluteUrl(`/workflows/${slug}`),
    },
    breadcrumbSchema([
      { name: "implexa", url: absoluteUrl("/") },
      { name: "workflows", url: absoluteUrl("/workflows") },
      { name: w.name, url: absoluteUrl(`/workflows/${slug}`) },
    ]),
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
        <Link
          href="/workflows"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          all workflows
        </Link>

        {/* header */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {w.vertical ? (
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
            >
              {w.vertical}
            </Badge>
          ) : null}
          {w.cadence ? (
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wider border-zinc-800 text-amber-300/90"
            >
              <Calendar className="size-2.5 mr-1" aria-hidden="true" />
              {w.cadence}
            </Badge>
          ) : null}
          {w.unproven ? (
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wider border-amber-500/30 text-amber-300/90"
            >
              auto-generated · unproven
            </Badge>
          ) : null}
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white lowercase mb-3">
          {w.name}
        </h1>
        <p className="text-lg text-zinc-400 mb-5">{w.job || w.description}</p>

        {/* activity strip: live usage signal + freshness (aggregate only) */}
        {hasActivity ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 mb-8">
            {activity.run_count > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <Zap className="size-3 text-amber-300/80" aria-hidden="true" />
                {activity.run_count} {activity.run_count === 1 ? "run" : "runs"}
              </span>
            ) : null}
            {activity.run_count > 0 && lastRun ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3" aria-hidden="true" />
                last run {lastRun}
              </span>
            ) : null}
            {activity.scheduled_count > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3" aria-hidden="true" />
                {activity.scheduled_count} on a schedule
              </span>
            ) : null}
            {updatedAt ? (
              <span className="inline-flex items-center gap-1.5 text-zinc-600">
                updated {updatedAt}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* what you get */}
        {w.primary_outcome ? (
          <Card className="bg-zinc-950 border-zinc-900 mb-8">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="size-4 text-emerald-400" aria-hidden="true" />
                <h2 className="text-sm font-medium text-white uppercase tracking-wider">
                  what you get
                </h2>
              </div>
              <p className="text-sm text-zinc-300">{w.primary_outcome}</p>
              {w.signals.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {w.signals.map((sig) => (
                    <Badge
                      key={sig}
                      variant="secondary"
                      className="text-[10px] bg-zinc-900 text-zinc-400"
                    >
                      {sig}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {/* steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-white uppercase tracking-wider flex items-center gap-2">
              <WorkflowIcon className="size-4 text-zinc-400" aria-hidden="true" />
              the steps
            </h2>
            <span className="text-xs text-zinc-500">
              {w.steps.length} steps
              {boundCount > 0 ? (
                <span className="text-emerald-400/80">
                  {" "}
                  · {boundCount} from verified skills
                </span>
              ) : null}
            </span>
          </div>
          <ul className="divide-y divide-zinc-900 rounded-lg border border-zinc-900 bg-zinc-950 px-5">
            {w.steps.map((s) => (
              <StepRow key={`${s.order}-${s.label.slice(0, 20)}`} step={s} />
            ))}
          </ul>
        </div>

        {/* caveat */}
        {w.caveat ? (
          <Card className="bg-amber-950/20 border-amber-900/40 mb-8">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle
                  className="size-4 text-amber-400"
                  aria-hidden="true"
                />
                <h2 className="text-sm font-medium text-amber-200 uppercase tracking-wider">
                  keep in mind
                </h2>
              </div>
              <p className="text-sm text-amber-100/80">{w.caveat}</p>
            </CardContent>
          </Card>
        ) : null}

        {/* runs best with — the capabilities that take it hands-free */}
        {w.capabilities.length > 0 ? (
          <Card className="bg-zinc-950 border-zinc-900 mb-8">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="size-4 text-amber-300" aria-hidden="true" />
                <h2 className="text-sm font-medium text-white uppercase tracking-wider">
                  runs hands-free with
                </h2>
              </div>
              <ul className="space-y-3">
                {w.capabilities.map((cap) => (
                  <li key={cap.id} className="flex gap-3">
                    <div className="flex-none mt-0.5">
                      {cap.id === "chrome-mcp" ? (
                        <Globe
                          className="size-4 text-emerald-400"
                          aria-hidden="true"
                        />
                      ) : (
                        <Clock
                          className="size-4 text-emerald-400"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-zinc-200">{cap.name}</p>
                      <p className="text-xs text-zinc-500">{cap.why}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-zinc-600">
                connect these and the workflow gathers its own data and delivers
                on a schedule, instead of leaving you blanks to fill.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* CTA */}
        <Card className="bg-zinc-950 border-zinc-800 mb-8">
          <CardContent className="p-5">
            <h2 className="text-base font-medium text-white mb-1">
              run this workflow
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              install implexa, then in Claude say{" "}
              <span className="text-zinc-200 font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded">
                run the {w.name} workflow
              </span>{" "}
              and approve the schedule. it delivers on its own from then on.
            </p>
            <CopyableInstall />
          </CardContent>
        </Card>

        {/* attribution / sources */}
        {w.sources.length > 0 ? (
          <>
            <Separator className="bg-zinc-900 mb-6" />
            <div className="mb-4">
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                built from
              </h2>
              <ul className="space-y-2">
                {w.sources.map((src) => (
                  <li key={src}>
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="size-3" aria-hidden="true" />
                      {hostOf(src)}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-zinc-600">
                implexa assembles public best-practice into runnable workflows
                and credits the sources it drew from.
              </p>
            </div>
          </>
        ) : null}

        {/* related workflows: interlink the high-intent workflow pages */}
        {relatedWorkflows.length > 0 ? (
          <>
            <Separator className="bg-zinc-900 mb-6" />
            <div className="mb-4">
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                related workflows
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {relatedWorkflows.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/workflows/${r.slug}`}
                      className="group block rounded-lg border border-zinc-900 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900/40 transition-colors p-4 h-full"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        {r.cadence ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase tracking-wider border-zinc-800 text-amber-300/90"
                          >
                            {r.cadence}
                          </Badge>
                        ) : null}
                        {r.vertical ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
                          >
                            {r.vertical}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-zinc-200 lowercase group-hover:underline decoration-zinc-600">
                        {r.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                        {r.primary_outcome || r.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson }}
      />
    </>
  );
}
