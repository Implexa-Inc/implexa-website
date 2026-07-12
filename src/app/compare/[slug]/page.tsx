import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { jsonLdGraph, breadcrumbSchema, faqSchema } from "@/lib/jsonld";
import { COMPARISONS, getComparison } from "@/lib/comparisons";
import { getHub } from "@/lib/hub-catalog";
import { SITE_URL } from "@/lib/site";

// SSR + ISR: fully static content (no DB), but keep the same revalidate cadence
// as the hubs so the whole AEO surface behaves uniformly at the edge.
export const revalidate = 3600;

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const cmp = getComparison(slug);
  if (!cmp) return {};
  const url = `${SITE_URL}/compare/${cmp.slug}`;
  return {
    title: cmp.metaTitle,
    description: cmp.answer,
    alternates: { canonical: url },
    openGraph: { title: cmp.metaTitle, description: cmp.answer, url },
    twitter: {
      card: "summary_large_image",
      title: cmp.metaTitle,
      description: cmp.answer,
    },
  };
}

export default async function ComparePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const cmp = getComparison(slug);
  if (!cmp) notFound();

  // Resolve CTA hub slugs to real hubs (drop any that no longer exist so a
  // renamed hub can never render a dead link).
  const hubs = cmp.ctaHubs
    .map((s) => getHub(s))
    .filter((h): h is NonNullable<typeof h> => h != null);

  const others = COMPARISONS.filter((c) => c.slug !== cmp.slug);

  const ld = jsonLdGraph(
    breadcrumbSchema([
      { name: "Compare", url: `${SITE_URL}/compare` },
      { name: cmp.h1, url: `${SITE_URL}/compare/${cmp.slug}` },
    ]),
    faqSchema(cmp.faq),
  );

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld }}
      />

      <nav className="mb-6 text-xs text-zinc-500">
        <Link href="/compare" className="hover:text-zinc-300">
          Compare
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-400">{cmp.h1}</span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {cmp.h1}
      </h1>
      {/* The 2-sentence direct answer — written to be lifted verbatim by answer engines. */}
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-300">
        {cmp.answer}
      </p>
      <p className="mt-2 text-sm text-zinc-500">{cmp.intro}</p>

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

      {/* The honest comparison table. Two columns: incumbent vs Implexa. */}
      <section className="mt-10">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Side by side
        </h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-900">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950 text-left">
                <th className="w-1/5 px-4 py-3 font-medium text-zinc-500" />
                <th className="px-4 py-3 font-medium text-zinc-300">
                  {cmp.themLabel}
                </th>
                <th className="px-4 py-3 font-medium text-white">
                  {cmp.usLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {cmp.contrast.map((row) => (
                <tr
                  key={row.dimension}
                  className="border-b border-zinc-900 last:border-0 align-top"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 text-left font-medium text-zinc-400"
                  >
                    {row.dimension}
                  </th>
                  <td className="px-4 py-3 leading-relaxed text-zinc-500">
                    {row.them}
                  </td>
                  <td className="px-4 py-3 leading-relaxed text-zinc-200">
                    {row.us}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* The honest caveat — where the incumbent is genuinely the better tool.
          The honesty is the trust move; it is never omitted. */}
      <section className="mt-8">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-sm font-medium text-zinc-200">
            {cmp.caveat.heading}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {cmp.caveat.body}
          </p>
        </div>
      </section>

      {/* CTA into the category hubs this page routes to. */}
      {hubs.length > 0 ? (
        <section className="mt-12 border-t border-zinc-900 pt-8">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
            See the agents
          </h2>
          <ul className="space-y-3">
            {hubs.map((h) => (
              <li key={h.slug}>
                <Link
                  href={`/agents/${h.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-lg border border-zinc-900 bg-zinc-950 p-4 transition-colors hover:border-zinc-700"
                >
                  <span className="text-base font-medium text-white group-hover:text-zinc-100">
                    {h.h1}
                  </span>
                  <span className="shrink-0 text-sm text-zinc-500 group-hover:text-zinc-300">
                    View →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12 border-t border-zinc-900 pt-8">
        <h2 className="mb-4 text-lg font-medium text-white">Questions</h2>
        <dl className="space-y-5">
          {cmp.faq.map((f) => (
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
          More comparisons
        </h2>
        <ul className="flex flex-wrap gap-2">
          {others.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/compare/${c.slug}`}
                className="rounded-full border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600"
              >
                {c.h1}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
