import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ShieldCheck,
  Plug,
  Infinity as InfinityIcon,
  Wallet,
  Clock,
  RefreshCw,
  Boxes,
  CircleCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "@/components/search-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SkillCard } from "@/components/skill-card";
import { CopyableInstall } from "@/components/copyable-install";
import { AnimatedTerminal } from "@/components/animated-terminal";
import { HeroHeadline } from "@/components/hero-headline";
import { HeroBuildBox } from "@/components/hero-build-box";
import { ExampleThoughtsBox } from "@/components/example-thoughts-box";
import type { SkillCard as SkillCardData } from "@/lib/placeholder-data";
import { CATEGORIES } from "@/lib/placeholder-data";

// Explicit canonical so the homepage is never indexed under a query-string
// variant (e.g. ?utm=x). Title + description come from layout.tsx defaults
// (src/lib/site.ts), which now carry the locked agents positioning.
export const metadata: Metadata = {
  title: "Implexa: build and run powerful agents, free",
  description:
    "Build and run powerful AI agents for free, in your own Claude or Codex, from a single sentence. You don't need to be a developer. Implexa is the AI manager that builds, schedules, and runs your agents on the plan you already pay for.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Implexa: build and run powerful agents, free",
    description:
      "Build and run powerful AI agents for free, in your own Claude or Codex, from a single sentence. No developer needed.",
  },
};

type ToolMatch = {
  slug?: string;
  source?: string;
  name?: string;
  description?: string;
  fit_reason?: string;
  score?: number;
  author?: string | null;
};

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

// Fetch N skills from the prod index via recommend_skills_for_context in
// explicit-search mode. We use a seed query that's broad enough to return
// diverse results across sources. Tagged with `revalidate: 3600` (1 hr) since
// the homepage's catalog rail doesn't need finer granularity than that.
async function fetchHomeSkills(seed: string, count: number): Promise<SkillCardData[]> {
  if (!TOKEN) return [];

  try {
    const upstream = await fetch(`${BACKEND}/api/v2/mcp`, {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
        authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "recommend_skills_for_context",
          arguments: {
            messages: [seed],
            topN: Math.min(count, 10),
            minScore: 0.1,
            skipGates: true,
          },
        },
      }),
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 },
    });

    if (!upstream.ok) return [];

    const text = await upstream.text();
    const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
    const jsonStr = dataLine ? dataLine.slice(6) : text;
    const body: { result?: { content?: Array<{ text?: string }> } } =
      JSON.parse(jsonStr);
    const raw = body?.result?.content?.[0]?.text ?? "{}";
    const parsed: { matches?: ToolMatch[] } = JSON.parse(raw);
    const matches = Array.isArray(parsed?.matches) ? parsed.matches : [];

    return matches.map((m) => ({
      slug: String(m.slug ?? ""),
      source: String(m.source ?? ""),
      title: String(m.name ?? m.slug ?? ""),
      description: String(m.description ?? m.fit_reason ?? "").slice(0, 200),
      tag: m.score ? `${(m.score * 100).toFixed(0)}% match` : "popular",
      author: m.author ? String(m.author) : "",
    }));
  } catch {
    return [];
  }
}

// Live count of indexed skills via the backend count_skills MCP tool. Used
// only in the subordinate catalog section ("the skills your agents are built
// from"), never in the hero. Falls back so the page never renders broken
// numbers.
async function fetchSkillCounts(): Promise<{ vetted: number; total: number }> {
  const FALLBACK = { vetted: 19000, total: 40000 };
  if (!TOKEN) return FALLBACK;
  try {
    const upstream = await fetch(`${BACKEND}/api/v2/mcp`, {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
        authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "count_skills", arguments: {} },
      }),
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });
    if (!upstream.ok) return FALLBACK;
    const text = await upstream.text();
    const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
    const jsonStr = dataLine ? dataLine.slice(6) : text;
    const body: { result?: { content?: Array<{ text?: string }> } } =
      JSON.parse(jsonStr);
    const raw = body?.result?.content?.[0]?.text ?? "{}";
    const parsed: { vetted?: number | null; total?: number | null } =
      JSON.parse(raw);
    return {
      vetted: typeof parsed.vetted === "number" ? parsed.vetted : FALLBACK.vetted,
      total: typeof parsed.total === "number" ? parsed.total : FALLBACK.total,
    };
  } catch {
    return FALLBACK;
  }
}

// The four scoped trust-rail claims. This copy is locked: it is the privacy
// line scoped to accounts + credentials (never an unscoped "no data access"),
// plus the free / unlimited / your-own-plan promises.
const TRUST_RAIL = [
  { icon: ShieldCheck, text: "We never touch your accounts or credentials" },
  { icon: Plug, text: "No complex integrations to set up" },
  { icon: InfinityIcon, text: "Unlimited agents, free" },
  { icon: Wallet, text: "Just your Claude or Codex plan" },
];

export default async function HomePage() {
  const [trending, counts] = await Promise.all([
    fetchHomeSkills("automate productivity sales content", 6),
    fetchSkillCounts(),
  ]);

  // Hero A/B is PAUSED (founder chose variant A). Hardcoding it removes the
  // only reason this page rendered dynamically per request (the cookie read) -
  // so the homepage is now statically generated + ISR-revalidated (the fetches
  // below cache for 1h), and bot/crawler hits serve from the CDN instead of
  // triggering a render. That's the edge-request fix. To resume a real A/B,
  // restore the cookie read + re-add the proxy middleware (HeadlineB still ships).
  const heroVariant: "a" | "b" = "a";

  return (
    <>
      <SiteHeader />
      <main className="flex-1">

        {/* ============================================================
            1 - HERO. Lovable/Emergent shape: centered, the build box IS the
            hero. headline -> one line of subcopy -> the big prompt box ->
            a single trust rail. The animated agent demo sits below as a
            framed "what a run looks like" visual, not a competing column.
            ============================================================ */}
        {/* Kept deliberately SPARSE (founder feedback 2026-06-12: "too much
            happening"): headline -> one subcopy line -> the box -> one quiet
            footer line. Free/Claude/Codex each said ONCE (in the headline);
            the badge pill, second tagline, and duplicate micro-lines are gone.
            The full trust rail still lives in the final CTA section. */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-24 pb-12 text-center">
          {/* A/B-ready locked headline pair (centered for the hero shape) */}
          <div className="flex justify-center">
            <HeroHeadline forced={heroVariant} />
          </div>

          <p className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-xl mx-auto">
            You don&apos;t need to be a developer.
          </p>

          {/* The build box IS the primary CTA: type (or tap an example to
              fill), hit Build, and the prompt rides through signup to your
              first real agent. */}
          <div className="max-w-2xl mx-auto">
            <HeroBuildBox />
          </div>

          {/* objection-killers at the decision point. Three, no overlaps, and
              none repeat the headline's claims (free lives up there only). */}
          <ul className="mt-6 space-y-1.5 max-w-md mx-auto text-left">
            {[
              "Works with the Claude or Codex subscription you already have",
              "No new tools, no API integrations to wire up",
              "You describe the job. Implexa builds and runs the agent for you.",
            ].map((t) => (
              <li
                key={t}
                className="flex items-start gap-2.5 text-sm text-zinc-400"
              >
                <CircleCheck
                  className="size-4 shrink-0 mt-0.5 text-emerald-400"
                  aria-hidden="true"
                />
                {t}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-zinc-600">
            About 5 minutes to your first agent ·{" "}
            <Link
              href="/workflows"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              or start from an example →
            </Link>
          </p>
        </section>

        {/* the agent demo, framed and centered below the hero */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
          <AnimatedTerminal />
          <p className="text-xs text-zinc-600 mt-3 text-center">
            A real run, inside your own Claude Code. Works the same in Codex.
          </p>
        </section>

        {/* ============================================================
            2 - THE ECONOMIC FLIP. co-leads with the hero. the one thing
            the resellers structurally cannot match.
            ============================================================ */}
        <section className="border-y border-zinc-900 bg-zinc-950/40">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-wider text-amber-400 mb-3 font-mono">
                why it is free
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4 leading-tight">
                You pay for a supercomputer. You use a sliver of it.
              </h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                Your Claude or Codex plan can run agents all day, but you only
                touch it when you sit down to chat. Implexa puts the rest of it
                to work. Every other agent product is a wrapper: it resells you
                someone else&apos;s AI at a markup and meters every run on top.
                We never run the AI at all, yours does, so your agents are free.
                Build as many as you want.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-8">
              <div className="rounded-lg border border-zinc-800 bg-black p-6">
                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-wider">
                  everyone else
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Their servers run the AI on their API keys, with a margin on
                  top. You pay your subscription, then you pay them, then you pay
                  the metered usage per run. The bill grows with the work.
                </p>
              </div>
              <div className="rounded-lg border border-emerald-900/40 bg-emerald-500/5 p-6">
                <div className="text-xs text-emerald-300 mb-2 font-mono uppercase tracking-wider">
                  implexa
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Your agents run on the Claude or Codex plan you already bought.
                  No second AI bill, no per-run metering, no markup. Unlimited
                  agents, free, because we never resell you inference.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            3 - NOW WHAT + WHY NOT BUILD IT DIRECTLY + THE IKEA MOMENT. the
            objection-handler arc: you have the tools, here is why you still
            need a manager, and (the skeptic's question) is it really free.
            ============================================================ */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3 font-mono">
              you shipped it. now what?
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-5 leading-tight">
              You built your product. You bought the Claude plan. Now what?
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed mb-10">
              Claude and Codex are incredibly powerful, but they are built for
              developers. To really use them you have to wire up agents yourself,
              piece by piece. Most people never do, and all that capability sits
              idle.
            </p>

            {/* the Ikea moment: setup, then Implexa one-ups it (it assembles
                for you, where Ikea still makes you do the assembly). */}
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-black p-6 sm:p-8 mb-6">
              <div className="text-xs uppercase tracking-wider text-amber-400 mb-3 font-mono">
                the Ikea moment for AI agents
              </div>
              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                Before Ikea, furniture meant hiring an expert. Ikea made it
                something anyone could put together. Implexa goes one step
                further: you do not even assemble it. You describe the job in a
                sentence, and your AI agent manager builds it, runs it on a
                schedule, and sharpens it over time. You manage one thing,
                Implexa. It manages the agents.
              </p>
            </div>

            {/* the skeptic's question, answered out loud (trust > hiding it) */}
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-500/[0.04] p-5 sm:p-6">
              <h3 className="text-base font-semibold text-white mb-1.5">
                Is it really free?
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Yes. We are not a wrapper sitting on top of someone else&apos;s
                LLM. Builders like you already pay for Claude or Codex. Implexa
                just helps you get the full value of what you already pay for, so
                there is no second AI bill and no per-run charge. It does need a
                paid Claude or Codex plan, because that is where your agents run.
              </p>
            </div>
          </div>
        </section>

        <Separator className="bg-zinc-900 mx-auto max-w-6xl" />

        {/* ============================================================
            4 - HOW IT WORKS. "describe a job once. it runs every
            morning." rotating example thoughts (the target query
            strings) + the four steps + a LABELED example result.
            ============================================================ */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-emerald-900/40 bg-emerald-500/5 text-xs text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              How it works
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              Describe a job once. It runs every morning.
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              No flows to wire, no integrations to maintain. You say it the way
              you would say it to a person.
            </p>
          </div>

          {/* the describe box (rotating, growing list of example jobs) */}
          <div className="flex justify-center mb-14">
            <ExampleThoughtsBox />
          </div>

          {/* the four steps */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-14">
            {[
              {
                n: "1",
                title: "Describe the job",
                body: "One sentence, in plain words. The same way you would ask a capable assistant.",
              },
              {
                n: "2",
                title: "Implexa builds the agent",
                body: "It picks the steps, the schedule, and the tools, and sets up the fallbacks so it does not stall.",
              },
              {
                n: "3",
                title: "It runs on its own",
                body: "Inside your own Claude or Codex, as you, on your real data, on the schedule you set.",
              },
              {
                n: "4",
                title: "It gets better",
                body: "Every run it learns what worked. You see what it changed this week, in plain words.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-5"
              >
                <div className="size-7 rounded-md bg-amber-500/10 border border-amber-900/40 inline-flex items-center justify-center text-amber-300 font-mono text-sm mb-3">
                  {step.n}
                </div>
                <h3 className="text-base font-medium text-white mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          {/* LABELED example result (honesty guardrail: clearly an example,
              never implied to have run on the visitor's data). */}
          <div className="max-w-3xl mx-auto rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-zinc-900 bg-zinc-900/40">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                example result
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 border border-zinc-800 rounded-full px-2 py-0.5">
                sample, not your data
              </span>
            </div>
            <div className="grid gap-0 sm:grid-cols-[1fr_1.2fr]">
              {/* the agent spec */}
              <div className="p-5 border-b sm:border-b-0 sm:border-r border-zinc-900">
                <div className="text-xs text-zinc-500 mb-3 font-mono">
                  The agent
                </div>
                <div className="text-sm text-white font-medium mb-3">
                  Find new customers, every morning
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-zinc-500 w-20 shrink-0">Runs</dt>
                    <dd className="text-zinc-300">Every day, 7:00am</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-zinc-500 w-20 shrink-0">As</dt>
                    <dd className="text-zinc-300">You, in your own Claude or Codex</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-zinc-500 w-20 shrink-0">Delivers</dt>
                    <dd className="text-zinc-300">A shortlist + drafted outreach</dd>
                  </div>
                </dl>
              </div>
              {/* the improved-this-week proof line */}
              <div className="p-5">
                <div className="text-xs text-emerald-300 mb-3 font-mono inline-flex items-center gap-1.5">
                  <RefreshCw className="size-3" aria-hidden="true" />
                  Improved this week
                </div>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex gap-2">
                    <CircleCheck className="size-4 shrink-0 mt-0.5 text-emerald-400" aria-hidden="true" />
                    Caught 2 strong leads last week&apos;s run missed
                  </li>
                  <li className="flex gap-2">
                    <CircleCheck className="size-4 shrink-0 mt-0.5 text-emerald-400" aria-hidden="true" />
                    Learned to skip the duplicates you kept deleting
                  </li>
                </ul>
                <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
                  Why: the last run flagged its own gap, so it fixed itself.
                </p>
              </div>
            </div>
          </div>

          {/* portability line (locked: ownership + portability, never
              "your data never leaves your machine"). */}
          <p className="text-center text-sm text-zinc-500 max-w-2xl mx-auto mt-8 leading-relaxed">
            Your agent&apos;s memory is yours, private to you, never shared, and
            it travels with you across Claude, Codex, and whatever comes next.
          </p>
        </section>

        <Separator className="bg-zinc-900 mx-auto max-w-6xl" />

        {/* ============================================================
            5 - BUILT IT WITH AI? WHAT NEXT? homepage section that hands
            off to the dedicated /built-with-ai landing page.
            ============================================================ */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-24">
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-black p-8 sm:p-12">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-wider text-amber-400 mb-3 font-mono">
                built it with AI?
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4 leading-tight">
                You built the app with AI. Now let AI run the business around it.
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                The marketing, the outreach, the support replies, the onboarding
                emails, the weekly reports. The work that surrounds the thing you
                shipped. Describe each one once and an agent runs it every
                morning, on the plan you already pay for.
              </p>
              <Link
                href="/built-with-ai"
                className={buttonVariants({
                  size: "lg",
                  className:
                    "bg-white text-black hover:bg-zinc-200 h-12 px-6 text-base inline-flex items-center gap-2",
                })}
              >
                See what comes next
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <Separator className="bg-zinc-900 mx-auto max-w-6xl" />

        {/* ============================================================
            6 - WHY IMPLEXA. the locked differentiators, agents-framed.
            ============================================================ */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              Why Implexa
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              The things only a vendor-neutral manager that runs on your own plan
              can do.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Wallet,
                title: "Free, on the plan you own",
                body: "Agents run on your Claude or Codex subscription. No second AI bill, no per-run metering.",
                color: "amber" as const,
              },
              {
                icon: Clock,
                title: "Runs unattended, on a schedule",
                body: "As you, on your real data, while you sleep. The work is done before you start.",
                color: "emerald" as const,
              },
              {
                icon: RefreshCw,
                title: "Gets better every run",
                body: "It learns what worked and shows you what it changed this week, in plain words.",
                color: "emerald" as const,
              },
              {
                icon: Boxes,
                title: "Your agent's brain is portable",
                body: "The memory is yours and travels across Claude, Codex, and whatever comes next. Export or delete it any time.",
                color: "amber" as const,
              },
              {
                icon: ShieldCheck,
                title: "We never touch your accounts",
                body: "No passwords, no credentials, no contents of your work. No fragile integrations to set up.",
                color: "emerald" as const,
              },
              {
                icon: InfinityIcon,
                title: "Unlimited agents",
                body: "Build one for every recurring job. There is no cap and no per-agent charge.",
                color: "amber" as const,
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-6"
              >
                <div
                  className={
                    "size-8 rounded-md inline-flex items-center justify-center mb-3 " +
                    (f.color === "emerald"
                      ? "bg-emerald-500/10 border border-emerald-900/40"
                      : "bg-amber-500/10 border border-amber-900/40")
                  }
                >
                  <f.icon
                    className={
                      "size-4 " +
                      (f.color === "emerald" ? "text-emerald-400" : "text-amber-300")
                    }
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-base font-medium text-white mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator className="bg-zinc-900 mx-auto max-w-6xl" />

        {/* ============================================================
            7 - THE CATALOG, subordinate. honest framing: agents are built
            from skills, and you can browse the index they draw from.
            keeps the live backend integration + SEO value.
            ============================================================ */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4">
              What your agents are built from
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed">
              Under the hood, every agent is assembled from skills, the indexed,
              graded, cross-vendor building blocks of what AI can do. Implexa
              picks the right ones for you. You can browse the index too.
            </p>
          </div>

          <div className="max-w-3xl mx-auto mb-3 flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
              <span
                className="size-1.5 rounded-full bg-emerald-500 animate-pulse"
                aria-hidden="true"
              />
              {counts.total.toLocaleString()} skills indexed across 6 sources
            </div>
          </div>

          <div className="max-w-3xl mx-auto mb-5">
            <SearchBar />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-16 text-sm">
            <span className="text-zinc-500">Try:</span>
            {[
              "cold outreach email",
              "hubspot integration",
              "debug python types",
              "next.js codemod",
            ].map((q) => (
              <Link
                key={q}
                href={`/search?q=${encodeURIComponent(q)}`}
                prefetch
                className="px-2.5 py-1 rounded-full border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-950 hover:text-white active:bg-amber-500/10 active:border-amber-500/50 active:text-amber-300 transition-colors"
              >
                {q}
              </Link>
            ))}
          </div>

          {/* trending */}
          <div id="trending" className="mb-16">
            <div className="flex items-baseline justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Trending this week
              </h3>
              <span className="text-xs text-zinc-500">
                Ranked across the cross-vendor index
              </span>
            </div>
            {trending.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trending.map((skill) => (
                  <SkillCard key={`${skill.source}/${skill.slug}`} skill={skill} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Loading trending skills...</p>
            )}
          </div>

          {/* categories */}
          <div>
            <div className="flex items-baseline justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">By category</h3>
              <span className="text-xs text-zinc-500">7 verticals, growing</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/search?q=${encodeURIComponent(cat.label)}`}
                  prefetch
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-950 active:bg-amber-500/10 active:border-amber-500/50 transition-colors"
                >
                  <span className="text-sm text-white group-active:text-amber-300">
                    {cat.label}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-zinc-900 text-zinc-500 text-[10px] group-hover:bg-zinc-900"
                  >
                    {cat.count}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Separator className="bg-zinc-900 mx-auto max-w-6xl" />

        {/* ============================================================
            8 - FINAL CTA. install command + the realistic-time line +
            the locked trust claims restated.
            ============================================================ */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              Build your first agent
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              One command installs the plugin into your own Claude or Codex. Then
              you describe a job and it runs. About 5 minutes to your first real
              one.
            </p>
          </div>

          <CopyableInstall />

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10">
            {TRUST_RAIL.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-2 text-sm text-zinc-400"
              >
                <Icon className="size-4 text-emerald-400" aria-hidden="true" />
                {text}
              </span>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
