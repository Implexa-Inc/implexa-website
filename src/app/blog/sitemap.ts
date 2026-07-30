import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { listBlogPosts } from "@/lib/blog";

// A dedicated sitemap for the blog, served at /blog/sitemap.xml.
//
// Why this exists when the root sitemap already lists every post:
// the root sitemap is one 3.3MB file with ~20k entries, almost all of them
// auto-generated /s/<source>/<slug> catalog pages. Google fetched it on
// 2026-05-20, re-read it once on 2026-06-02, and then stopped: as of
// 2026-07-15 Search Console still reported "last read Jun 2". Crawlers re-read
// a large, mostly-unchanged sitemap on their own slow schedule, so the 26 posts
// published during that 43-day gap were never discovered. URL inspection on
// /blog/claude-code-hooks (published Jun 24) returned "URL is unknown to
// Google", with "No referring sitemaps detected".
//
// A few-KB file that changes every time a post ships gets re-read far more
// often than a 3.3MB one that effectively never does, so the posts are listed
// here as well. Listing a URL in two sitemaps is allowed by the protocol and
// is not duplicate content: the canonical tag on the post decides identity,
// not sitemap membership. The root sitemap keeps its ~20k entries and its
// existing submission untouched, so nothing Google already discovered
// regresses.
//
// This intentionally lists only /blog/<slug> and not the /blog index itself.
// A sitemap's scope is its own directory, so an entry for /blog (a sibling of
// /blog/, not a child) risks being treated as out-of-scope. The index is
// already carried by the root sitemap, so there is nothing to gain here.
//
// revalidate is deliberately shorter than the root sitemap's 86400: this file
// is a few KB, so regenerating it hourly is cheap, and it means a post merged
// at 09:00 is listed by 10:00 rather than up to a day later.

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listBlogPosts();

  return posts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: new Date(`${p.publishedAt}T00:00:00Z`),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
}
