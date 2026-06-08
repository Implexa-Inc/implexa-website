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
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CopyableInstall } from "@/components/copyable-install";
import { ExampleThoughtsBox } from "@/components/example-thoughts-box";
import { BUILDER_THOUGHTS } from "@/lib/example-thoughts";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/site";

const TITLE = "Built with AI? Let AI run the business around it";
const DESCRIPTION =
  "You built the app with AI. Now let Implexa run the marketing, outreach, support, and reports around it. Describe each job once and an agent runs it every morning, free on the Claude or Codex plan you already pay for.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/built-with-ai" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/built-with-ai"),
    title: `${TITLE} | implexa`,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | implexa`,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

// Locked scoped trust-rail claims, shared shape with the homepage hero.
const TRUST_RAIL = [
  { icon: ShieldCheck, text: "We never touch your accounts or credentials" },
  { icon: Plug, text: "No complex integrations to set up" },
  { icon: InfinityIcon, text: "Unlimited agents, free" },
  { icon: Wallet, text: "Just your Claude or Codex plan" },
];

export default function BuiltWithAiPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">

        {/* ============================================================
            HERO. fixed ICP headline (not the A/B pair).
            ============================================================ */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-20 pb-14 text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-900/40 bg-amber-500/5 text-xs text-amber-300">
            for everyone who just shipped something with AI
          </div>
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-semibold tracking-tight text-white leading-[1.07] mb-6">
            You built the app with AI. Now let AI run the{" "}
            <span className="underline decoration-amber-400 decoration-2 underline-offset-[6px]">
              business
            </span>{" "}
            around it.
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
            The build was the easy part. The marketing, the outreach, the
            support replies, the onboarding, the reports, that is the work now.
            Describe each one once and an agent runs it every morning, on the
            plan you already pay for.
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8 max-w-xl mx-auto text-left">
            {TRUST_RAIL.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2.5 text-sm text-zinc-300"
              >
                <Icon
                  className="size-4 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
                {text}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
            <Link
              href="/install"
              className={buttonVariants({
                size: "lg",
                className:
                  "bg-white text-black hover:bg-zinc-200 h-12 px-6 text-base inline-flex items-center gap-2",
              })}
            >
              Build your first agent
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/workflows"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className:
                  "border-zinc-700 text-zinc-300 hover:bg-zinc-950 hover:text-white h-12 px-6 text-base",
              })}
            >
              See example agents
            </Link>
          </div>
          <p className="text-sm text-zinc-500">
            about 5 minutes to your first real one.
          </p>
        </section>

        {/* ============================================================
            THE INSIGHT. the app builders learned there is no moat in the
            artifact. the business around it is the durable part.
            ============================================================ */}
        <section className="border-y border-zinc-900 bg-zinc-950/40">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
            <div className="text-xs uppercase tracking-wider text-amber-400 mb-3 font-mono">
              the part nobody warned you about
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4 leading-tight">
              Anyone can build the app now. Running the business is the work.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-4">
              AI took the cost of building to nearly zero, which means the app
              itself is no longer the moat. What compounds is everything around
              it: the customers you find, the users you keep, the reputation you
              build, the work you do every single day without dropping it.
            </p>
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
              That is exactly the part you can hand to agents. Describe the job
              once and it runs every morning, learns from each run, and never
              forgets.
            </p>
          </div>
        </section>

        {/* ============================================================
            ECONOMIC FLIP.
            ============================================================ */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
          <div className="max-w-3xl mb-8">
            <div className="text-xs uppercase tracking-wider text-amber-400 mb-3 font-mono">
              why it is free
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4 leading-tight">
              You already pay for the AI. Why pay again to use it?
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
              You already pay for Claude or Codex. Everyone else resells you the
              same lab APIs at a markup, then bills you for the usage on top.
              Implexa runs on the subscription you already own, so your agents
              are free. Build as many as your business needs.
            </p>
          </div>
        </section>

        {/* ============================================================
            HOW IT WORKS, builder-flavored describe box.
            ============================================================ */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t border-zinc-900">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              Describe a job once. It runs every morning.
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              The jobs that surround a freshly shipped product. Pick one, say it
              in a sentence, and let the agent run it.
            </p>
          </div>

          <div className="flex justify-center mb-14">
            <ExampleThoughtsBox thoughts={BUILDER_THOUGHTS} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "1",
                title: "Describe the job",
                body: "One sentence, in plain words. No flow builder, no integration setup.",
              },
              {
                n: "2",
                title: "Implexa builds the agent",
                body: "It picks the steps, the schedule, and the fallbacks so it runs unattended without stalling.",
              },
              {
                n: "3",
                title: "It runs on its own",
                body: "Inside your own Claude or Codex, as you, on your real data, every morning.",
              },
              {
                n: "4",
                title: "It gets better",
                body: "It learns from each run and shows you what it changed this week, in plain words.",
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
        </section>

        {/* ============================================================
            LABELED example result, builder flavored.
            ============================================================ */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
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
              <div className="p-5 border-b sm:border-b-0 sm:border-r border-zinc-900">
                <div className="text-xs text-zinc-500 mb-3 font-mono">
                  the agent
                </div>
                <div className="text-sm text-white font-medium mb-3">
                  onboard every new signup, every morning
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-zinc-500 w-20 shrink-0">runs</dt>
                    <dd className="text-zinc-300">every day, 8:00am</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-zinc-500 w-20 shrink-0">as</dt>
                    <dd className="text-zinc-300">you, in your own Claude</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-zinc-500 w-20 shrink-0">delivers</dt>
                    <dd className="text-zinc-300">a personal email per new user</dd>
                  </div>
                </dl>
              </div>
              <div className="p-5">
                <div className="text-xs text-emerald-300 mb-3 font-mono inline-flex items-center gap-1.5">
                  <RefreshCw className="size-3" aria-hidden="true" />
                  improved this week
                </div>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex gap-2">
                    <CircleCheck className="size-4 shrink-0 mt-0.5 text-emerald-400" aria-hidden="true" />
                    started referencing what each user signed up to do
                  </li>
                  <li className="flex gap-2">
                    <CircleCheck className="size-4 shrink-0 mt-0.5 text-emerald-400" aria-hidden="true" />
                    learned the subject lines that got the most replies
                  </li>
                </ul>
                <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
                  why: the last run flagged its own gap, so it fixed itself.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-zinc-500 max-w-2xl mx-auto mt-8 leading-relaxed">
            Your agent&apos;s memory is yours, private to you, never shared, and
            it travels with you across Claude, Codex, and whatever comes next.
          </p>
        </section>

        {/* ============================================================
            WHY IMPLEXA, condensed for this ICP.
            ============================================================ */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20 border-t border-zinc-900">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Wallet,
                title: "Free, on the plan you own",
                body: "No second AI bill, no per-run metering. Agents run on your Claude or Codex subscription.",
              },
              {
                icon: Clock,
                title: "Runs while you build",
                body: "Unattended, on a schedule, as you. The business work happens without stealing your focus.",
              },
              {
                icon: Boxes,
                title: "Portable, vendor-neutral",
                body: "Your agent's brain travels across Claude, Codex, and whatever comes next. Yours to export or delete.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-6"
              >
                <div className="size-8 rounded-md bg-amber-500/10 border border-amber-900/40 inline-flex items-center justify-center mb-3">
                  <f.icon className="size-4 text-amber-300" aria-hidden="true" />
                </div>
                <h3 className="text-base font-medium text-white mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================
            FINAL CTA.
            ============================================================ */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-24 border-t border-zinc-900">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              Let AI run the business around your app
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
