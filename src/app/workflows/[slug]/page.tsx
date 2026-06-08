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
  TrendingUp,
  FileText,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CopyableInstall } from "@/components/copyable-install";
import { absoluteUrl } from "@/lib/site";
import {
  jsonLdGraph,
  breadcrumbSchema,
  howToSchema,
  qaPageSchema,
} from "@/lib/jsonld";
import {
  getWorkflow,
  listWorkflows,
  type WorkflowDetail,
} from "@/lib/workflow-catalog";
import {
  resolveQuery,
  hasResolvedQuery,
  resolveExampleResult,
  resolveImprovement,
  isProven,
  isCardProven,
} from "@/lib/workflow-query";

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
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const w = await getWorkflow(slug);
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
  return {
    title,
    description: desc,
    alternates: { canonical: `/workflows/${slug}` },
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
            Step {step.order}
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
        {/* workflow-specific substance: what this step does here + what good
            looks like. Shown for every step, so the unbound tool/decision steps
            read as real work instead of a bare label. Falls back to the bound
            skill's generic description only when no detail was authored. */}
        {step.detail ? (
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
            {step.detail}
          </p>
        ) : bound && step.ref_summary?.description ? (
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
            {step.ref_summary.description}
          </p>
        ) : null}
        {/* W3: this step reuses a skill already shown earlier in the chain.
            Render a compact pointer instead of repeating the full summary. */}
        {bound && step.same_as_step ? (
          <p className="mt-1 text-xs text-zinc-500">
            ↳ same skill as step {step.same_as_step}
            {step.ref_summary?.name ? ` (${step.ref_summary.name})` : ""}
          </p>
        ) : null}
        {/* the bound skill's actual procedure depth, one click of context inline */}
        {bound && !step.same_as_step && step.ref_summary?.preview ? (
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
              ? `Full skill: ${step.ref_summary.name}`
              : `Uses verified skill: ${step.ref.slug}`}
            <ExternalLink className="size-2.5" aria-hidden="true" />
          </Link>
        ) : step.kind === "decision" ? (
          <span className="mt-1 block text-xs text-zinc-600">
            Decision step
          </span>
        ) : (
          <span className="mt-1 block text-xs text-zinc-600">
            Your model fills this step
          </span>
        )}
        {step.fallbacks.length > 0 ? (
          <ul className="mt-1.5 space-y-0.5">
            {step.fallbacks.map((fb) => (
              <li key={fb} className="text-xs text-zinc-500">
                <span className="text-zinc-600">No integration? </span>
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

  // Query-addressable resolution: the page IS the high-intent query. These
  // resolvers prefer the backend fields (when the read path lands) and fall
  // back to the authored map / derivation, so the template stays dumb.
  const query = resolveQuery(w);
  const queryIsH1 = hasResolvedQuery(w);
  const exampleResult = resolveExampleResult(w);
  const improvement = resolveImprovement(w); // null unless proven + recent
  const proven = isProven(w);
  // The agent's one-line answer to the query.
  const answer = w.job || w.primary_outcome || w.description || "";

  // related agents: prefer same-vertical siblings, fill with the rest, cap 4.
  // interlinks the query-addressable pages with each other (internal linking
  // for ranking, since these are the surface we lean into for higher-intent
  // queries). Amplification discipline: proven agents (real run history) are
  // promoted ahead of unproven ones in the internal link graph, so we never
  // rank up an un-vetted page. listWorkflows is cached and tiny (~12 rows).
  const otherWorkflows = allWorkflows.filter((x) => x.slug !== w.slug);
  const provenFirst = (a: typeof otherWorkflows[number], b: typeof a) =>
    (isCardProven(b) ? 1 : 0) - (isCardProven(a) ? 1 : 0);
  const sameVertical = otherWorkflows
    .filter((x) => w.vertical && x.vertical === w.vertical)
    .sort(provenFirst);
  const relatedWorkflows = [
    ...sameVertical,
    ...otherWorkflows
      .filter((x) => !sameVertical.includes(x))
      .sort(provenFirst),
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
    Boolean(updatedAt) ||
    w.version != null;

  const pageUrl = absoluteUrl(`/workflows/${slug}`);
  const ldJson = jsonLdGraph(
    // QAPage: the page is literally a question; the agent is the accepted
    // answer. upvoteCount only when proven (real run history), never faked.
    qaPageSchema({
      question: query,
      answerText: w.primary_outcome || answer || w.name,
      url: pageUrl,
      upvoteCount: proven ? w.activity.run_count || undefined : undefined,
      dateModified: w.updated_at || undefined,
    }),
    // HowTo kept + sharpened: the procedure that answers the query. Naming it
    // with the query (not the agent name) is what answer engines lift for
    // "how do i X" prompts.
    howToSchema({
      name: queryIsH1 ? query : w.name,
      description: answer || undefined,
      url: pageUrl,
      steps: w.steps.map((s) => ({ name: s.label })),
    }),
    {
      "@type": "SoftwareApplication",
      name: w.name,
      applicationCategory: "AI Agent",
      operatingSystem: "Cross-platform (Claude Code, Cursor, Codex, Gemini CLI)",
      description: answer || undefined,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      url: pageUrl,
    },
    breadcrumbSchema([
      { name: "implexa", url: absoluteUrl("/") },
      { name: "agents", url: absoluteUrl("/workflows") },
      { name: queryIsH1 ? query : w.name, url: pageUrl },
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
          All agents
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

        {/* H1 = the high-intent query (the thought the visitor typed). The page
            IS the query: SEO/AEO landing, product, and proof, all on one URL.
            When no query resolves (a generated agent with no map entry and an
            un-questionable job) the agent name stays the H1 and the "answered
            by" line is dropped. */}
        {queryIsH1 ? (
          <>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              {query}
            </h1>
            <div className="mb-5">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
                the agent that answers this
              </p>
              <p className="text-lg text-zinc-300">
                <span className="text-white font-medium">{w.name}</span>
                {answer ? (
                  <span className="text-zinc-400">. {answer}</span>
                ) : null}
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
              {w.name}
            </h1>
            <p className="text-lg text-zinc-400 mb-5">{answer}</p>
          </>
        )}

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
                Last run {lastRun}
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
                Updated {updatedAt}
              </span>
            ) : null}
            {w.version != null ? (
              <span className="inline-flex items-center gap-1.5 text-zinc-600">
                v{w.version}
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

        {/* example result: the on-page aha. ALWAYS labeled an example and
            explicitly "not run on your data" (locked honesty guardrail). Real
            sample deliverable from the backend when present; an illustrative
            shape derived from the outcome otherwise. */}
        {exampleResult ? (
          <Card className="bg-zinc-950 border-zinc-900 mb-8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-sky-400" aria-hidden="true" />
                  <h2 className="text-sm font-medium text-white uppercase tracking-wider">
                    example result
                  </h2>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase tracking-wider border-sky-500/30 text-sky-300/90"
                >
                  {exampleResult.derived ? "illustrative" : "sample deliverable"}
                </Badge>
              </div>
              {exampleResult.title ? (
                <p className="text-sm font-medium text-zinc-200 mb-2">
                  {exampleResult.title}
                </p>
              ) : null}
              <div className="rounded-md border border-zinc-900 bg-black/30 p-4">
                <p className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">
                  {exampleResult.body}
                </p>
              </div>
              <p className="mt-2.5 text-xs text-zinc-600">
                Example output, to show the shape of the deliverable. It has not
                run on your data. Build the agent to get this on yours.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* improved this week / here is why: the most defensible element on the
            page and the breaker of the "so it is just a scheduler" reflex. Gated
            on proof: resolveImprovement returns null for any unproven agent, so
            this never renders on a directory listing with no real run history. */}
        {improvement ? (
          <Card className="bg-emerald-950/15 border-emerald-900/40 mb-8">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <TrendingUp
                  className="size-4 text-emerald-400"
                  aria-hidden="true"
                />
                <h2 className="text-sm font-medium text-emerald-200 uppercase tracking-wider">
                  {improvement.thisWeek ? "improved this week" : "improved recently"}
                </h2>
                {improvement.version != null ? (
                  <Badge
                    variant="outline"
                    className="text-[9px] uppercase tracking-wider border-emerald-500/30 text-emerald-300/90"
                  >
                    v{improvement.version}
                  </Badge>
                ) : null}
                {shortDate(improvement.at) ? (
                  <span className="text-xs text-emerald-300/50">
                    {shortDate(improvement.at)}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-emerald-100/90">{improvement.summary}</p>
              {improvement.why ? (
                <p className="mt-1.5 text-xs text-emerald-300/70">
                  <span className="uppercase tracking-wider text-emerald-400/70">
                    why:{" "}
                  </span>
                  {improvement.why}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-emerald-300/50">
                Agents are alive: a run can catch its own gaps and propose a fix.
                This is real run history, not a directory listing.
              </p>
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

        {/* runs best with: the capabilities that take it hands-free */}
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
                Connect these and the agent gathers its own data and delivers on
                a schedule, instead of leaving you blanks to fill.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* CTA: build-and-run. Ownership + portability framing (locked copy
            guardrail: never "data never leaves your machine"). Free because it
            runs on the Claude/Codex subscription the user already pays for. */}
        <Card className="bg-zinc-950 border-zinc-800 mb-8">
          <CardContent className="p-5">
            <h2 className="text-base font-medium text-white mb-1">
              Build and run this on your own Claude or Codex, free
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              Install Implexa, then say{" "}
              <span className="text-zinc-200 font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded">
                build the {w.name} agent
              </span>{" "}
              and approve the schedule. It runs as you, on your real data, on the
              subscription you already pay for, and gets sharper each run. Your
              agent&apos;s memory is yours and travels with you across Claude,
              Codex, and whatever comes next. About 5 minutes to your first real
              run.
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
                Implexa assembles public best-practice into runnable agents and
                credits the sources it drew from.
              </p>
            </div>
          </>
        ) : null}

        {/* changelog: agents are alive, this is how this one has evolved */}
        {w.versions.length > 0 ? (
          <>
            <Separator className="bg-zinc-900 mb-6" />
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  changelog
                </h2>
                {w.proposed_count > 0 ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-wider border-amber-500/30 text-amber-300/90"
                  >
                    {w.proposed_count} proposed{" "}
                    {w.proposed_count === 1 ? "improvement" : "improvements"}
                  </Badge>
                ) : null}
              </div>
              <ol className="relative ml-1 space-y-3 border-l border-zinc-900">
                {w.versions.map((v) => (
                  <li key={v.version} className="relative pl-4">
                    <span
                      className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-zinc-700"
                      aria-hidden="true"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-zinc-300 tabular-nums">
                        v{v.version}
                      </span>
                      {shortDate(v.at) ? (
                        <span className="text-xs text-zinc-600">
                          {shortDate(v.at)}
                        </span>
                      ) : null}
                      <Badge
                        variant="outline"
                        className={`text-[9px] uppercase tracking-wider border-zinc-800 ${
                          v.source === "feedback"
                            ? "text-amber-300/90"
                            : "text-zinc-500"
                        }`}
                      >
                        {v.source}
                      </Badge>
                    </div>
                    {v.summary ? (
                      <p className="mt-0.5 text-xs text-zinc-500">{v.summary}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-zinc-600">
                Agents are alive: every change is a version, and a run can
                propose improvements that get reviewed and applied.
              </p>
            </div>
          </>
        ) : null}

        {/* related agents: interlink the query-addressable pages. Each card
            leads with the QUERY it answers (the thought), so the internal link
            graph reads as a web of high-intent questions. */}
        {relatedWorkflows.length > 0 ? (
          <>
            <Separator className="bg-zinc-900 mb-6" />
            <div className="mb-4">
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                related agents
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {relatedWorkflows.map((r) => {
                  const rQuery = resolveQuery(r);
                  const rIsQuery = hasResolvedQuery(r);
                  return (
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
                        <p className="text-sm text-zinc-200 group-hover:underline decoration-zinc-600">
                          {rQuery}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                          {rIsQuery
                            ? r.name
                            : r.primary_outcome || r.description}
                        </p>
                      </Link>
                    </li>
                  );
                })}
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
