import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { listResources } from "@/lib/resources";
import { listBlogPosts } from "@/lib/blog";
import { listGuides } from "@/lib/guides";

// /resources is the content HUB. It pulls the three content surfaces into one
// indexable page so none of them is orphaned: the build-solo guides, the blog
// explainers, and the cornerstone deep dives. Hub-and-spoke internal linking
// gives the blog (which has no nav entry of its own) a crawlable parent and
// concentrates topical authority. The /guides and /blog index URLs stay live;
// this hub links to them, it does not replace them.

export const metadata: Metadata = {
  title: "resources",
  description:
    "the implexa content hub: build-solo guides, explainers on Claude skills and SKILL.md, and cornerstone deep dives on cross-vendor skill discovery.",
  alternates: {
    canonical: "/resources",
    types: {
      "application/rss+xml": [
        { url: "/resources/feed.xml", title: "implexa resources" },
      ],
    },
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

type HubItem = {
  href: string;
  title: string;
  description: string;
  publishedAt: string;
  badge: string;
};

function ItemCard({ item }: { item: HubItem }) {
  return (
    <li>
      <Link
        href={item.href}
        className="group block rounded-lg border border-zinc-900 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900/40 transition-colors p-6"
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-wider border-zinc-800 text-zinc-400"
          >
            {item.badge}
          </Badge>
          <span className="text-xs text-zinc-500">
            {formatPublishDate(item.publishedAt)}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 group-hover:underline decoration-zinc-600">
          {item.title}
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-3">
          {item.description}
        </p>
        <span className="inline-flex items-center gap-1 text-xs text-zinc-500 group-hover:text-white">
          read
          <ArrowRight className="size-3" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}

function Section({
  id,
  title,
  blurb,
  items,
  allHref,
  allLabel,
}: {
  id: string;
  title: string;
  blurb: string;
  items: HubItem[];
  allHref?: string;
  allLabel?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section id={id} className="mb-14 scroll-mt-20">
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        {allHref ? (
          <Link
            href={allHref}
            className="text-xs text-zinc-500 hover:text-white whitespace-nowrap transition-colors"
          >
            {allLabel} →
          </Link>
        ) : null}
      </div>
      <p className="text-sm text-zinc-400 mb-5 max-w-xl">{blurb}</p>
      <ul className="space-y-4">
        {items.map((item) => (
          <ItemCard key={item.href} item={item} />
        ))}
      </ul>
    </section>
  );
}

export default async function ResourcesHubPage() {
  const [resources, blog, guides] = await Promise.all([
    listResources(),
    listBlogPosts(),
    listGuides(),
  ]);

  const guideItems: HubItem[] = guides.map((g) => ({
    href: `/guides/${g.slug}`,
    title: g.title,
    description: g.description,
    publishedAt: g.publishedAt,
    badge: typeof g.day === "number" ? `day ${g.day}` : "guide",
  }));

  const blogItems: HubItem[] = blog.map((b) => ({
    href: `/blog/${b.slug}`,
    title: b.title,
    description: b.description,
    publishedAt: b.publishedAt,
    badge: "blog",
  }));

  const resourceItems: HubItem[] = resources.map((r) => ({
    href: `/resources/${r.slug}`,
    title: r.title,
    description: r.description,
    publishedAt: r.publishedAt,
    badge: "cornerstone",
  }));

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
        <p className="text-lg text-zinc-400 mb-12 max-w-xl">
          guides, explainers, and deep dives on cross-vendor skill discovery,
          the SKILL.md ecosystem, and building solo with AI.
        </p>

        <Section
          id="guides"
          title="guides"
          blurb="the build-solo series: ship a real product with AI, one day at a time."
          items={guideItems}
          allHref="/guides"
          allLabel="all guides"
        />
        <Section
          id="blog"
          title="blog"
          blurb="short, practical explainers on Claude skills, SKILL.md, and the workflow loop."
          items={blogItems}
          allHref="/blog"
          allLabel="all posts"
        />
        <Section
          id="deep-dives"
          title="deep dives"
          blurb="cornerstone pieces on why a cross-vendor skill graph exists and how it ranks."
          items={resourceItems}
        />
      </main>
      <SiteFooter />
    </>
  );
}
