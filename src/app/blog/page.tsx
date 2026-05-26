import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { listBlogPosts } from "@/lib/blog";

// /blog index. Lightweight surface that points at the SKILL.md explainer
// + tutorial. Mirrors /resources/page.tsx in structure so the voice stays
// consistent and a reader hopping between them feels they're in the same
// site.

export const metadata: Metadata = {
  title: "blog",
  description:
    "short explainers and step-by-step tutorials on Claude Skills, SKILL.md, and how to capture your own workflows.",
  alternates: { canonical: "/blog" },
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

export default async function BlogIndexPage() {
  const posts = await listBlogPosts();

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
          blog
        </h1>
        <p className="text-lg text-zinc-400 mb-10 max-w-xl">
          short explainers and step-by-step tutorials on Claude Skills,
          SKILL.md, and capturing your own workflows.
        </p>

        {posts.length === 0 ? (
          <p className="text-sm text-zinc-500">no posts yet.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group block rounded-lg border border-zinc-900 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900/40 transition-colors p-6"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
                    >
                      post
                    </Badge>
                    <span className="text-xs text-zinc-500">
                      {formatPublishDate(p.publishedAt)}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 group-hover:underline decoration-zinc-600">
                    {p.title}
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                    {p.description}
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
