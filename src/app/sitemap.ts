import type { MetadataRoute } from "next";
import { after } from "next/server";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { listResources } from "@/lib/resources";
import { listBlogPosts } from "@/lib/blog";
import { listWorkflows } from "@/lib/workflow-catalog";
import { buildWorkflowSitemapEntries } from "@/lib/workflow-sitemap";
import { HUBS } from "@/lib/hub-catalog";
import { COMPARISONS } from "@/lib/comparisons";
import { submitToIndexNow } from "@/lib/indexnow";

// Dynamic sitemap for the SEO surface. Lists the core pages only: static pages,
// category hubs, comparisons, resources, blog posts and published workflows.
//
// Skill detail pages (/s/<source>/<slug>) are deliberately NOT listed. As of
// 2026-10-31 Google indexed only the homepage, crawled about 11 URLs a day, and
// spent under 1% of that on discovery, while 10,876 URLs sat in "crawled,
// currently not indexed". This sitemap offered 818 skill pages against 66 core
// pages, so it asked Google to spend almost all of a tiny crawl allowance on the
// pages it had just rejected. The pages stay live and keep their robots rules;
// they just aren't advertised. Add the best ones back once blog posts are indexed
// and earning impressions. listAllSkillsForSitemap stays in skill-catalog for that.
//
// /search is excluded because robots.txt disallows it.
//
// Next.js caches this route by default, so the sitemap is effectively static at
// the edge for ~1 day per region. Content that ships often also lives in its own
// small sitemap (see src/app/blog/sitemap.ts), because a few-KB file that actually
// changes gets re-read far more often: Google read this file on 2026-06-02 and not
// again until it was resubmitted by hand on 2026-10-31.

export const revalidate = 86400; // 1 day

type SitemapEntry = MetadataRoute.Sitemap[number];

function staticPages(now: Date): MetadataRoute.Sitemap {
  // /scores doesn't exist in main yet (SkillScore chip ships it); include it
  // anyway so Google starts crawling on day 1 when the SkillScore chip lands.
  // If the page 404s temporarily the crawler will retry on the next pass.
  return [
    {
      // Slash-less to match the homepage canonical (site.ts treats the
      // no-trailing-slash form as canonical; absoluteUrl("/") would emit
      // "https://implexa.ai/" and create a canonical-vs-sitemap mismatch).
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/install"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/scores"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      // /workflows — the whole-job workflow catalog (the AEO + distribution
      // surface). High priority: every workflow detail page is a unique
      // indexable URL and the install funnel for that workflow.
      url: absoluteUrl("/workflows"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/resources"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/claude-skills"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/pricing"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      // /developers — the builder-facing API + MCP surface (2026-05-28).
      // Static-ish (revalidate 86400), low churn (catalog changes when
      // we add a tool). Priority high enough to crawl on day 1 since
      // every partner outreach links here.
      url: absoluteUrl("/developers"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}

async function blogPages(): Promise<MetadataRoute.Sitemap> {
  const items = await listBlogPosts();
  return items.map<SitemapEntry>((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: new Date(`${p.publishedAt}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
}

async function resourcePages(): Promise<MetadataRoute.Sitemap> {
  const items = await listResources();
  return items.map<SitemapEntry>((r) => ({
    url: absoluteUrl(`/resources/${r.slug}`),
    lastModified: new Date(`${r.publishedAt}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));
}

async function workflowPages(): Promise<MetadataRoute.Sitemap> {
  const entries = await listWorkflows();
  // Day 2 item 5 (2026-07-30): membership follows the PERSISTED
  // publication_state, via buildWorkflowSitemapEntries -- the same filter the
  // detail page's noindex decision is built on (both call isWorkflowIndexable)
  // -- see that file's header for why a second, independently-computed rule
  // here would be exactly the sitemap/metadata disagreement the plan forbids.
  // Before this, all ~172 workflows entered the sitemap unconditionally
  // regardless of proof state. Extracted to its own module (rather than
  // inlined here) so the filter+map is directly unit-testable -- this file
  // imports next/server's after(), which a plain node --test run can't load.
  return buildWorkflowSitemapEntries(entries);
}

// Category hubs ("Best AI agents for X") — the pSEO/AEO landing surface that
// routes into workflow pages. Static set from HUBS + the /agents index.
function hubPages(now: Date): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/agents"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...HUBS.map<SitemapEntry>((h) => ({
      url: absoluteUrl(`/agents/${h.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  ];
}

// Judo / comparison pages ("<incumbent> alternative", "run <registry> skills
// safely", the anchor comparison article) — the incumbent-capture AEO surface
// that routes into the category hubs. Static set from COMPARISONS + the
// /compare index. Same shape as hubPages().
function comparePages(now: Date): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/compare"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...COMPARISONS.map<SitemapEntry>((c) => ({
      url: absoluteUrl(`/compare/${c.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [resources, blog, workflows] = await Promise.all([
    resourcePages(),
    blogPages(),
    workflowPages(),
  ]);
  const entries = [
    ...staticPages(now),
    ...hubPages(now),
    ...comparePages(now),
    ...resources,
    ...blog,
    ...workflows,
  ];

  // Side-effect: ping IndexNow with anything modified in the last 24h so
  // Bing pulls it out of "discovered but not crawled" within minutes
  // instead of weeks. This is the main AEO unblock — Perplexity and
  // chatgpt-search both ride Bing's index.
  //
  // `after()` runs the callback once the response is flushed, so it
  // doesn't add latency to the sitemap response itself. The helper is a
  // no-op when IMPLEXA_INDEXNOW_KEY is unset, so dev/preview builds
  // never accidentally ping the API.
  //
  // We filter to the last 24h because the sitemap revalidates daily —
  // anything older than that was already submitted on a previous
  // revalidation. Resubmitting unchanged URLs wastes our IndexNow quota
  // and (per the protocol's own warnings) risks rate-limiting.
  after(() => {
    const cutoff = now.getTime() - 24 * 60 * 60 * 1000;
    const recent = entries
      .filter((e) => {
        if (!e.lastModified) return false;
        const t =
          e.lastModified instanceof Date
            ? e.lastModified.getTime()
            : new Date(e.lastModified).getTime();
        return Number.isFinite(t) && t >= cutoff;
      })
      .map((e) => e.url);

    if (recent.length === 0) return;

    void submitToIndexNow(recent).then((result) => {
      if (result.ok) {
        console.log(
          `[indexnow] sitemap-driven submission: ${result.submitted} URLs`
        );
      } else {
        console.warn(`[indexnow] sitemap submission skipped: ${result.error}`);
      }
    });
  });

  return entries;
}
