import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SkillCard } from "@/components/skill-card";
import { TRENDING } from "@/lib/placeholder-data";

type SearchParams = { q?: string | string[] };

export async function generateMetadata(props: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : Array.isArray(sp.q) ? sp.q[0] : "";
  return {
    title: q ? `search: ${q}` : "search",
    description: "search 100k+ skills across every AI agent.",
  };
}

export default async function SearchPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : Array.isArray(sp.q) ? sp.q[0] : "";

  // placeholder: until /api/search has a wired token, just show trending
  // labeled as "near matches" so the page isn't empty.
  const results = TRENDING;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-6"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back home
        </Link>

        <div className="mb-8">
          <SearchBar initialQuery={q} />
        </div>

        {q ? (
          <p className="text-sm text-zinc-500 mb-6">
            showing placeholder results for{" "}
            <span className="text-white">"{q}"</span>. live search lights up
            once IMPLEXA_PUBLIC_SEARCH_TOKEN is set on the vercel project.
          </p>
        ) : (
          <p className="text-sm text-zinc-500 mb-6">
            type a query above to search.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((skill) => (
            <SkillCard key={`${skill.source}/${skill.slug}`} skill={skill} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
