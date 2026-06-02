import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { listGuides } from "@/lib/guides";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "guides · build a product solo with claude code",
  description:
    "the day-by-day companion guides for the @ImplexaAI build-a-product-solo series. each one is the long-form version of a daily reel: prompts, tooling, gotchas, and the mental model shifts.",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    type: "website",
    url: "/guides",
    title: "guides · build a product solo with claude code | implexa",
    description:
      "the long-form companion to the @ImplexaAI daily series. prompts, gotchas, and the mental models behind shipping a product solo with claude code.",
    images: [DEFAULT_OG_IMAGE],
  },
};

function formatPublishDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    })
    .toLowerCase();
}

export default async function GuidesIndexPage() {
  const guides = await listGuides();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
          guides
        </h1>
        <p className="text-lg text-zinc-400 mb-10 max-w-xl">
          the long-form companion to the @ImplexaAI daily series. each guide is
          the prompts, gotchas, and mental models behind one day of building a
          product end-to-end, solo.
        </p>

        {guides.length === 0 ? (
          <p className="text-sm text-zinc-500">no guides yet.</p>
        ) : (
          <ul className="space-y-4">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="group block rounded-lg border border-zinc-900 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900/40 transition-colors p-6"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
                    >
                      {typeof g.day === "number" ? `day ${g.day}` : "guide"}
                    </Badge>
                    <span className="text-xs text-zinc-500">
                      {formatPublishDate(g.publishedAt)}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 group-hover:underline decoration-zinc-600">
                    {g.title}
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {g.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
