import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// Blog posts live in /content/blog/<slug>.md as markdown with YAML
// frontmatter. They render at build time on /blog/[slug]. This file mirrors
// resources.ts intentionally — same shape, same parser, just a different
// content root — so the two surfaces stay consistent and easy to maintain.
// Blog vs resources: blog is for shorter, more SEO-pointed explainers and
// tutorials; resources is for cornerstone positioning pieces.

export type BlogFrontmatter = {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  tags?: string[];
};

export type BlogPost = {
  frontmatter: BlogFrontmatter;
  html: string;
  raw: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function assertFrontmatter(
  data: Record<string, unknown>,
  filename: string,
): asserts data is BlogFrontmatter {
  const required: ReadonlyArray<keyof BlogFrontmatter> = [
    "title",
    "slug",
    "description",
    "publishedAt",
  ];
  for (const key of required) {
    if (typeof data[key] !== "string" || (data[key] as string).length === 0) {
      throw new Error(
        `blog ${filename}: missing or empty frontmatter field "${key}"`,
      );
    }
  }
}

export async function getBlogSlugs(): Promise<string[]> {
  const entries = await fs.readdir(BLOG_DIR);
  return entries
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const filename = `${slug}.md`;
  const filepath = path.join(BLOG_DIR, filename);

  let raw: string;
  try {
    raw = await fs.readFile(filepath, "utf8");
  } catch {
    return null;
  }

  const parsed = matter(raw);
  assertFrontmatter(parsed.data, filename);

  // Strip HTML comments (author TODOs, image placeholders) so they don't
  // render in the post body. Same convention as resources.ts.
  const bodyWithoutComments = parsed.content.replace(/<!--[\s\S]*?-->/g, "");

  // Strip a leading H1 — the page emits the title from frontmatter so the
  // visible title stays aligned with the SEO/OG title.
  const bodyWithoutLeadingH1 = bodyWithoutComments.replace(
    /^\s*#\s+.+\n+/,
    "",
  );

  const html = await marked.parse(bodyWithoutLeadingH1, {
    async: true,
    gfm: true,
    breaks: false,
  });

  return {
    frontmatter: parsed.data,
    html,
    raw: parsed.content,
  };
}

export async function listBlogPosts(): Promise<BlogFrontmatter[]> {
  const slugs = await getBlogSlugs();
  const items = await Promise.all(slugs.map((s) => getBlogPost(s)));
  return items
    .filter((p): p is BlogPost => p !== null)
    .map((p) => p.frontmatter)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}
