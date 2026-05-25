import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { listResources } from "@/lib/resources";

export const metadata: Metadata = {
  title: "resources",
  description:
    "deep dives on cross-vendor skill discovery, ambient recommenders, the SKILL.md ecosystem, and the road to google + wikipedia for agent skills.",
  alternates: { canonical: "https://implexa.ai/resources" },
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

export default async function ResourcesIndexPage() {
  const resources = await listResources();

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
          resources
        </h1>
        <p className="text-lg text-zinc-400 mb-10 max-w-xl">
          deep dives on cross-vendor skill discovery, the SKILL.md ecosystem,
          and how implexa works.
        </p>

        {resources.length === 0 ? (
          <p className="text-sm text-zinc-500">no posts yet.</p>
        ) : (
          <ul className="space-y-4">
            {resources.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/resources/${r.slug}`}
                  className="group block rounded-lg border border-zinc-900 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900/40 transition-colors p-6"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
                    >
                      cornerstone
                    </Badge>
                    <span className="text-xs text-zinc-500">
                      {formatPublishDate(r.publishedAt)}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 group-hover:underline decoration-zinc-600">
                    {r.title}
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                    {r.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-500 group-hover:text-white">
                    read
                    <ArrowRight className="size-3" aria-hidden="true" />
                  </span>
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
