import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { getResource, getResourceSlugs } from "@/lib/resources";

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  const slugs = await getResourceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const resource = await getResource(slug);
  if (!resource) {
    return { title: "resource not found" };
  }

  const { title, description } = resource.frontmatter;
  const url = `https://implexa.ai/resources/${slug}`;
  const ogImage = `/og-resources-${slug}.png`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "implexa",
      publishedTime: resource.frontmatter.publishedAt,
      tags: resource.frontmatter.tags,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@ImplexaAI",
      title,
      description,
      images: [ogImage],
    },
  };
}

function formatPublishDate(iso: string): string {
  // Render as e.g. "may 25, 2026" (lowercase, voice-consistent).
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

export default async function ResourcePage(props: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await props.params;
  const resource = await getResource(slug);

  if (!resource) {
    notFound();
  }

  const { title, description, publishedAt, tags } = resource.frontmatter;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back to resources
        </Link>

        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
              >
                cornerstone
              </Badge>
              <span className="text-xs text-zinc-500">
                published {formatPublishDate(publishedAt)}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-5 leading-[1.15]">
              {title}
            </h1>
            {description ? (
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                {description}
              </p>
            ) : null}
            {tags && tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] uppercase tracking-wider text-zinc-500"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          <div
            className="prose prose-invert prose-zinc max-w-none
              prose-headings:tracking-tight
              prose-h1:text-3xl sm:prose-h1:text-4xl prose-h1:font-semibold prose-h1:mb-6 prose-h1:mt-0 prose-h1:text-white
              prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-white
              prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-white
              prose-p:text-zinc-300 prose-p:leading-relaxed
              prose-a:text-white prose-a:underline prose-a:decoration-zinc-600 hover:prose-a:decoration-white
              prose-strong:text-white
              prose-code:text-zinc-200 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.875em] prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-900 prose-pre:text-zinc-200 prose-pre:rounded-lg prose-pre:text-sm
              prose-li:text-zinc-300
              prose-ul:my-4 prose-ol:my-4
              prose-hr:border-zinc-900 prose-hr:my-10
              prose-blockquote:border-zinc-800 prose-blockquote:text-zinc-400
              prose-img:rounded-lg prose-img:border prose-img:border-zinc-900"
            dangerouslySetInnerHTML={{ __html: resource.html }}
          />
        </article>

        <hr className="border-zinc-900 my-12" />

        <section className="text-sm text-zinc-400">
          <p className="mb-3">
            ready to try implexa?{" "}
            <Link href="/install" className="text-white hover:underline">
              install the plugin
            </Link>{" "}
            in 30 seconds, or{" "}
            <Link href="/" className="text-white hover:underline">
              search the index
            </Link>{" "}
            without installing anything.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
