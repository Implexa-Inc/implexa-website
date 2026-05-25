import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// Cornerstone resources live in /content/resources/<slug>.md as markdown with
// YAML frontmatter. We render them at build time on the dynamic route
// /resources/[slug]. Content is repo-owned, so no sanitization is needed.

export type ResourceFrontmatter = {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  tags?: string[];
};

export type Resource = {
  frontmatter: ResourceFrontmatter;
  html: string;
  raw: string;
};

const RESOURCES_DIR = path.join(process.cwd(), "content", "resources");

function assertFrontmatter(
  data: Record<string, unknown>,
  filename: string,
): asserts data is ResourceFrontmatter {
  const required: ReadonlyArray<keyof ResourceFrontmatter> = [
    "title",
    "slug",
    "description",
    "publishedAt",
  ];
  for (const key of required) {
    if (typeof data[key] !== "string" || (data[key] as string).length === 0) {
      throw new Error(
        `resource ${filename}: missing or empty frontmatter field "${key}"`,
      );
    }
  }
}

export async function getResourceSlugs(): Promise<string[]> {
  const entries = await fs.readdir(RESOURCES_DIR);
  return entries
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""));
}

export async function getResource(slug: string): Promise<Resource | null> {
  const filename = `${slug}.md`;
  const filepath = path.join(RESOURCES_DIR, filename);

  let raw: string;
  try {
    raw = await fs.readFile(filepath, "utf8");
  } catch {
    return null;
  }

  const parsed = matter(raw);
  assertFrontmatter(parsed.data, filename);

  // Strip HTML comments (TODOs for the founder, image placeholders, etc.) so
  // they don't render in the post body. The TODO comments live in the source
  // as guidance, not as visible content.
  const bodyWithoutComments = parsed.content.replace(/<!--[\s\S]*?-->/g, "");

  // Strip a leading H1 from the markdown body if present. The page renders
  // the H1 from frontmatter so the visible title and the SEO/OG title stay
  // in sync. Authors may include `# title` at the top of the markdown for
  // readability when editing; we drop it on render.
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

export async function listResources(): Promise<ResourceFrontmatter[]> {
  const slugs = await getResourceSlugs();
  const items = await Promise.all(slugs.map((s) => getResource(s)));
  return items
    .filter((r): r is Resource => r !== null)
    .map((r) => r.frontmatter)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}
