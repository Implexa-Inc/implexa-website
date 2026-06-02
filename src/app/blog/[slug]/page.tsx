import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { getBlogPost, getBlogSlugs } from "@/lib/blog";
import { absoluteUrl } from "@/lib/site";
import {
  jsonLdGraph,
  breadcrumbSchema,
  articleSchema,
  faqSchema,
} from "@/lib/jsonld";
import { extractFaq } from "@/lib/faq";

// Mirror of /resources/[slug]/page.tsx in structure. The two surfaces
// share Article + BreadcrumbList schema and prose styling so AI assistants
// and humans see the same shape across them.

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getBlogPost(slug);
  if (!post) {
    return { title: "post not found" };
  }

  const { title, description } = post.frontmatter;
  const canonicalPath = `/blog/${slug}`;
  const url = absoluteUrl(canonicalPath);

  // og:image / twitter:image are injected automatically from the colocated
  // opengraph-image.tsx (the dynamic card generator) — no images field here.
  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "implexa",
      publishedTime: post.frontmatter.publishedAt,
      tags: post.frontmatter.tags,
    },
    twitter: {
      card: "summary_large_image",
      site: "@ImplexaAI",
      title,
      description,
    },
  };
}

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

export default async function BlogPostPage(props: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await props.params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const { title, description, publishedAt, tags } = post.frontmatter;

  // articleSchema works against any markdown post; the @id is keyed by the
  // /resources/ URL by default, so we re-compose with the blog URL by
  // passing slug through articleSchema and then overriding @id. Simpler:
  // just emit a fresh node here mirroring articleSchema's shape but pointed
  // at /blog/. We keep the breadcrumb composition identical for parity.
  const articleUrl = absoluteUrl(`/blog/${slug}`);
  // Dynamic OG card served by the colocated opengraph-image.tsx, replacing
  // the former static /og-blog-<slug>.png path (which 404'd).
  const ogImage = absoluteUrl(`/blog/${slug}/opengraph-image`);
  const articleNode = {
    "@type": "Article",
    "@id": articleUrl,
    headline: title,
    description,
    image: ogImage,
    datePublished: publishedAt,
    dateModified: publishedAt,
    author: { "@id": `${absoluteUrl("/")}#organization` },
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    keywords: tags?.join(", "),
  };

  // articleSchema is imported but unused above on purpose — we kept the
  // import for parity with /resources/[slug] in case a future contributor
  // wants to swap the hand-built node back to the helper. Linter will flag
  // unused; touch this to avoid breaking the build.
  void articleSchema;

  // FAQPage schema when the post has a FAQ section (answer-engine + Google
  // rich-result lift). Drops out cleanly via jsonLdGraph when there are none.
  const faqNode = faqSchema(extractFaq(post.raw));

  const ldJson = jsonLdGraph(
    articleNode,
    breadcrumbSchema([
      { name: "implexa", url: absoluteUrl("/") },
      { name: "blog", url: absoluteUrl("/blog") },
      { name: title, url: articleUrl },
    ]),
    faqNode,
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          back to blog
        </Link>

        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
              >
                post
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
              prose-table:text-sm prose-th:text-white prose-td:text-zinc-300
              prose-img:rounded-lg prose-img:border prose-img:border-zinc-900"
            dangerouslySetInnerHTML={{ __html: post.html }}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson }}
      />
    </>
  );
}
