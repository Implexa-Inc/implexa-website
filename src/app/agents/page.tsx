import type { Metadata } from "next";
import Link from "next/link";

import { jsonLdGraph, breadcrumbSchema, itemListSchema } from "@/lib/jsonld";
import { HUBS } from "@/lib/hub-catalog";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "AI agents by category — free, on your own Claude or Codex",
  description:
    "Browse the best AI agents by what you need done — growth, content marketing, sales outreach, and SEO/AEO. Each one runs free inside the Claude or Codex subscription you already pay for, on your real data.",
  alternates: { canonical: `${SITE_URL}/agents` },
};

export default function AgentsIndex() {
  const ld = jsonLdGraph(
    breadcrumbSchema([{ name: "Agents", url: `${SITE_URL}/agents` }]),
    itemListSchema(
      "AI agents by category",
      HUBS.map((h) => ({ name: h.h1, url: `${SITE_URL}/agents/${h.slug}` })),
    ),
  );
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld }}
      />
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        AI agents, by what you need done
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-300">
        Every agent here does a recurring job on a schedule — free, inside the
        Claude or Codex subscription you already pay for, on your real data, and
        without ever touching your accounts or credentials. Pick a category to
        see the best agents for it, ranked by proof — real run history first,
        never popularity.
      </p>

      <ul className="mt-10 space-y-4">
        {HUBS.map((h) => (
          <li key={h.slug}>
            <Link
              href={`/agents/${h.slug}`}
              className="group block rounded-lg border border-zinc-900 bg-zinc-950 p-5 transition-colors hover:border-zinc-700"
            >
              <h2 className="text-lg font-medium text-white group-hover:text-zinc-100">
                {h.h1}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                {h.answer}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <Link
          href="/install"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
        >
          Or build your own from one sentence — free
        </Link>
      </div>
    </main>
  );
}
