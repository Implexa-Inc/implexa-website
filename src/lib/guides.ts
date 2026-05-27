import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// /guides — the "Day X of building solo" series that the @ImplexaAI Instagram
// reels reference. Each day's post DM-bait promises "comment X and I'll DM
// you the guide" — the resulting URLs (implexa.ai/guides/day-1, day-2, etc.)
// resolve here. Same markdown + frontmatter pattern as /resources, separate
// route + index page so the series stays visually distinct from cornerstone
// resources.

export type GuideFrontmatter = {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  // Series-specific metadata.
  day?: number;          // 1, 2, 3...
  reelHook?: string;     // the comment-bait keyword ("Claude", "frontend", ...)
  tags?: string[];
};

export type Guide = {
  frontmatter: GuideFrontmatter;
  html: string;
  raw: string;
};

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

function assertFrontmatter(
  data: Record<string, unknown>,
  filename: string,
): asserts data is GuideFrontmatter {
  const required: ReadonlyArray<keyof GuideFrontmatter> = [
    "title",
    "slug",
    "description",
    "publishedAt",
  ];
  for (const key of required) {
    if (typeof data[key] !== "string" || (data[key] as string).length === 0) {
      throw new Error(
        `guide ${filename}: missing or empty frontmatter field "${key}"`,
      );
    }
  }
}

export async function getGuideSlugs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(GUIDES_DIR);
    return entries
      .filter((name) => name.endsWith(".md"))
      .map((name) => name.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

export async function getGuide(slug: string): Promise<Guide | null> {
  const filename = `${slug}.md`;
  const filepath = path.join(GUIDES_DIR, filename);

  let raw: string;
  try {
    raw = await fs.readFile(filepath, "utf8");
  } catch {
    return null;
  }

  const parsed = matter(raw);
  assertFrontmatter(parsed.data, filename);

  // Strip HTML comments (TODOs, image placeholders) so they don't render.
  const bodyWithoutComments = parsed.content.replace(/<!--[\s\S]*?-->/g, "");

  // Strip a leading H1 — page renders the title from frontmatter so the
  // visible title and SEO/OG title stay in sync. Authors may include `# title`
  // at the top of the markdown for readability when editing; we drop it.
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

export async function listGuides(): Promise<GuideFrontmatter[]> {
  const slugs = await getGuideSlugs();
  const items = await Promise.all(slugs.map((s) => getGuide(s)));
  return items
    .filter((g): g is Guide => g !== null)
    .map((g) => g.frontmatter)
    .sort((a, b) => {
      // Sort by day ascending (so day-1, day-2, day-3 in series order); fall
      // back to publishedAt descending for entries without a day field.
      if (typeof a.day === "number" && typeof b.day === "number") {
        return a.day - b.day;
      }
      return a.publishedAt < b.publishedAt ? 1 : -1;
    });
}
