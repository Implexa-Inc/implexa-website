import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { jsonLdGraph, breadcrumbSchema, faqSchema, itemListSchema } from "@/lib/jsonld";
import { listWorkflows, type WorkflowCard } from "@/lib/workflow-catalog";
import { resolveQuery, hasResolvedQuery } from "@/lib/workflow-query";
import { getHub, HUBS, selectForHub, trustLabel } from "@/lib/hub-catalog";
import { SITE_URL } from "@/lib/site";

// SSR + ISR: hubs are DB-backed (listWorkflows) but change slowly.
export const revalidate = 3600;

export function generateStaticParams() {
  return HUBS.map((h) => ({ category: h.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await props.params;
  const hub = getHub(category);
  if (!hub) return {};
  const title = `${hub.h1} — free, on your own Claude or Codex`;
  const url = `${SITE_URL}/agents/${hub.slug}`;
  return {
    title,
    description: hub.answer,
    alternates: { canonical: url },
    openGraph: { title, description: hub.answer, url },
    twitter: { card: "summary_large_image", title, description: hub.answer },
  };
}

function hubFaq(category: string) {
  return [
    {
      question: `Are these ${category} agents safe?`,
      answer:
        "Yes. They run inside your own Claude or Codex on your machine with scoped tools, and never receive your passwords or credentials — you sign into any tool yourself. Any action that writes or posts asks for your approval first.",
    },
    {
      question: `What do these ${category} agents cost?`,
      answer:
        "Nothing extra. They run on the Claude or Codex subscription you already pay for, so there are no per-run fees and no separate API bill.",
    },
    {
      question: "What plan do I need?",
      answer:
        "Any paid Claude (Pro or Max) or Codex/ChatGPT plan that includes agent runs. You install Implexa once, describe the job in a sentence, and it runs on your plan's included capacity.",
    },
  ];
}

// verified = run-proven (measured), reviewed = hand-vetted web-seed (no run
// proof yet), seeded = auto-generated. Colour tracks proof strength.
const TIER_STYLE: Record<string, string> = {
  verified: "border-emerald-800 text-emerald-400",
  reviewed: "border-amber-800 text-amber-400",
  seeded: "border-zinc-800 text-zinc-500",
};

function AgentRow({ w, rank }: { w: WorkflowCard; rank: number }) {
  const query = resolveQuery(w);
  const tier = trustLabel(w);
  return (
    <li>
      <Link
        href={`/workflows/${w.slug}`}
        className="group flex gap-4 rounded-lg border border-zinc-900 bg-zinc-950 p-4 transition-colors hover:border-zinc-700"
      >
        <span className="mt-0.5 select-none font-mono text-sm text-zinc-600">
          {String(rank).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-base font-medium text-white group-hover:text-zinc-100">
              {query}
            </span>
            <span
              className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${TIER_STYLE[tier]}`}
            >
              {tier}
            </span>
          </span>
          {hasResolvedQuery(w) ? (
            <span className="mt-0.5 block text-xs text-zinc-500">
              Answered by <span className="text-zinc-300">{w.name}</span>
            </span>
          ) : null}
          <span className="mt-1 block line-clamp-2 text-sm text-zinc-400">
            {w.primary_outcome || w.description}
          </span>
        </span>
      </Link>
    </li>
  );
}

export default async function HubPage(props: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await props.params;
  const hub = getHub(category);
  if (!hub) notFound();

  const all = await listWorkflows();
  const agents = selectForHub(hub, all);
  const faq = hubFaq(hub.category);
  const otherHubs = HUBS.filter((h) => h.slug !== hub.slug);

  const ld = jsonLdGraph(
    breadcrumbSchema([
      { name: "Agents", url: `${SITE_URL}/agents` },
      { name: hub.h1, url: `${SITE_URL}/agents/${hub.slug}` },
    ]),
    itemListSchema(
      hub.h1,
      agents.slice(0, 25).map((w) => ({
        name: resolveQuery(w),
        url: `${SITE_URL}/workflows/${w.slug}`,
      })),
    ),
    faqSchema(faq),
  );

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld }}
      />

      <nav className="mb-6 text-xs text-zinc-500">
        <Link href="/agents" className="hover:text-zinc-300">
          Agents
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-400">{hub.category}</span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {hub.h1}
      </h1>
      {/* The 2-sentence direct answer — written to be lifted verbatim by answer engines. */}
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-300">{hub.answer}</p>
      <p className="mt-2 text-sm text-zinc-500">{hub.intro}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/install"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
        >
          Run one in your own Claude — free
        </Link>
        <Link
          href="/workflows"
          className="rounded-md border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-600"
        >
          Browse the full catalog
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          {agents.length > 0
            ? `${agents.length} ${hub.category} agent${agents.length === 1 ? "" : "s"}`
            : `${hub.category} agents`}
        </h2>
        {agents.length > 0 ? (
          // Honest badge legend — "verified" is reserved for real run proof,
          // never hand-curation. Keeps the trust tiers legible on-page.
          <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
            <span>
              <span className="text-emerald-400">verified</span> = proven by
              real runs
            </span>
            <span>
              <span className="text-amber-400">reviewed</span> = hand-vetted by
              us, not yet run-proven
            </span>
            <span>
              <span className="text-zinc-400">seeded</span> = new, unproven
            </span>
          </p>
        ) : null}
        {agents.length === 0 ? (
          <p className="rounded-lg border border-zinc-900 bg-zinc-950 p-6 text-sm text-zinc-400">
            No agents are seeded for {hub.category} yet — but you can build one
            from a sentence.{" "}
            <Link href="/install" className="text-white underline">
              Describe the job
            </Link>{" "}
            and it runs on your own Claude or Codex.
          </p>
        ) : (
          <ol className="space-y-3">
            {agents.map((w, i) => (
              <AgentRow key={`${w.source}-${w.slug}`} w={w} rank={i + 1} />
            ))}
          </ol>
        )}
      </section>

      <section className="mt-12 border-t border-zinc-900 pt-8">
        <h2 className="mb-4 text-lg font-medium text-white">Questions</h2>
        <dl className="space-y-5">
          {faq.map((f) => (
            <div key={f.question}>
              <dt className="text-sm font-medium text-zinc-200">{f.question}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-zinc-400">
                {f.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 border-t border-zinc-900 pt-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Other categories
        </h2>
        <ul className="flex flex-wrap gap-2">
          {otherHubs.map((h) => (
            <li key={h.slug}>
              <Link
                href={`/agents/${h.slug}`}
                className="rounded-full border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600"
              >
                {h.h1}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
