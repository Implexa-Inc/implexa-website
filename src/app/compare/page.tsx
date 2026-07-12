import type { Metadata } from "next";
import Link from "next/link";

import { jsonLdGraph, breadcrumbSchema, itemListSchema } from "@/lib/jsonld";
import { COMPARISONS } from "@/lib/comparisons";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Implexa vs the autonomous agents — the honest comparison",
  description:
    "How Implexa compares to self-hosted autonomous agents like OpenClaw and Hermes: run agents inside the Claude or Codex you already pay for, never hand over a credential, and get the recurring work done free — without a new process to host or secure.",
  alternates: { canonical: `${SITE_URL}/compare` },
};

export default function CompareIndex() {
  const ld = jsonLdGraph(
    breadcrumbSchema([{ name: "Compare", url: `${SITE_URL}/compare` }]),
    itemListSchema(
      "Implexa comparisons and alternatives",
      COMPARISONS.map((c) => ({
        name: c.h1,
        url: `${SITE_URL}/compare/${c.slug}`,
      })),
    ),
  );
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld }}
      />
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Implexa vs the autonomous agents
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-300">
        Most &ldquo;agents that do your work&rdquo; are a new process you install
        and hand your accounts. Implexa is the other shape: agents that run inside
        the Claude or Codex you already pay for, as you, without ever holding a
        credential. Each comparison below is honest about where the incumbent is
        the more powerful tool — and where a surface with nothing to steal wins.
      </p>

      <ul className="mt-10 space-y-4">
        {COMPARISONS.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/compare/${c.slug}`}
              className="group block rounded-lg border border-zinc-900 bg-zinc-950 p-5 transition-colors hover:border-zinc-700"
            >
              <h2 className="text-lg font-medium text-white group-hover:text-zinc-100">
                {c.h1}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                {c.answer}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/install"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
        >
          Run one in your own Claude — free
        </Link>
        <Link
          href="/agents"
          className="rounded-md border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-600"
        >
          Browse agents by category
        </Link>
      </div>
    </main>
  );
}
