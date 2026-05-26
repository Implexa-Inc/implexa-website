import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { listResources } from "@/lib/resources";
import { listBlogPosts } from "@/lib/blog";
import { listAllSkillsForSitemap } from "@/lib/skill-catalog";

// Dynamic sitemap for the SEO surface. Lists:
//   - static pages (home, search, install, scores)
//   - every cornerstone post under /resources
//   - every active skill detail page under /s/<source>/<slug>
//
// Next.js caches this route by default; the catalog fetch sits behind its
// own per-call revalidate, so the sitemap itself is effectively static at
// the edge for ~1 day per region. That's the right tradeoff because the
// catalog churns slowly (the crawler runs nightly) and crawlers re-fetch
// the sitemap roughly daily anyway.
//
// At 11k+ entries we're well under Google's 50k-per-sitemap limit so a
// single file is fine. If we ever hit 50k we'll split via generateSitemaps.

export const revalidate = 86400; // 1 day

type SitemapEntry = MetadataRoute.Sitemap[number];

function staticPages(now: Date): MetadataRoute.Sitemap {
  // /scores doesn't exist in main yet (SkillScore chip ships it); include it
  // anyway so Google starts crawling on day 1 when the SkillScore chip lands.
  // If the page 404s temporarily the crawler will retry on the next pass.
  return [
    {
      url: absoluteUrl("/"),
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
      url: absoluteUrl("/search"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/scores"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
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

async function skillPages(): Promise<MetadataRoute.Sitemap> {
  const entries = await listAllSkillsForSitemap();
  return entries.map<SitemapEntry>((s) => ({
    url: absoluteUrl(`/s/${s.source}/${s.slug}`),
    lastModified: s.last_seen_at ? new Date(s.last_seen_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  // Parallel: independent IO, makes a real difference when the skill catalog
  // pagination walks 11 pages.
  const [resources, blog, skills] = await Promise.all([
    resourcePages(),
    blogPages(),
    skillPages(),
  ]);
  return [...staticPages(now), ...resources, ...blog, ...skills];
}
