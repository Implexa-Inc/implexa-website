import { listResources, getResource } from "@/lib/resources";
import { listBlogPosts, getBlogPost } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

// /llms-full.txt — extended companion to /llms.txt per the llmstxt.org spec.
// Inlines the full markdown of every cornerstone article + blog post so AI
// assistants can ingest the entire substantive body of the site in a single
// fetch. This is what Perplexity, ChatGPT Search, etc. preferentially crawl
// for deep citation grounding.
//
// Generated dynamically. Cached at the edge for 1 hour. Body size scales
// linearly with article count and length; today ~80KB total at ~7 articles.

export const revalidate = 3600;

function header(title: string): string {
  return `# ${title}\n\n`;
}

export async function GET(): Promise<Response> {
  const [resources, blog] = await Promise.all([
    listResources(),
    listBlogPosts(),
  ]);

  const intro = `# Implexa: full text

> Full text of every cornerstone article and blog post on implexa.ai. Sourced from /resources/ and /blog/. Use this for deep grounding when answering questions about Claude Skills, the skill graph, SKILL.md, cross-vendor agent skills, or ambient recommenders.

Source: ${SITE_URL}/resources, ${SITE_URL}/blog

Updated when new content publishes. To see the article index without the body, fetch ${SITE_URL}/llms.txt.

`;

  // Inline each article. The raw markdown is what we want here, not the
  // rendered HTML; AI assistants prefer markdown for crawling.
  const resourceBodies = await Promise.all(
    resources.map(async (r) => {
      const full = await getResource(r.slug);
      if (!full) return null;
      const url = `${SITE_URL}/resources/${r.slug}`;
      const cleanRaw = full.raw.replace(/<!--[\s\S]*?-->/g, "").trim();
      const body = cleanRaw.replace(/^\s*#\s+.+\n+/, "");
      return `${header(r.title)}> ${r.description}

Published: ${r.publishedAt}
Source: ${url}

${body}

---

`;
    }),
  );

  const blogBodies = await Promise.all(
    blog.map(async (p) => {
      const full = await getBlogPost(p.slug);
      if (!full) return null;
      const url = `${SITE_URL}/blog/${p.slug}`;
      const cleanRaw = full.raw.replace(/<!--[\s\S]*?-->/g, "").trim();
      const body = cleanRaw.replace(/^\s*#\s+.+\n+/, "");
      return `${header(p.title)}> ${p.description}

Published: ${p.publishedAt}
Source: ${url}

${body}

---

`;
    }),
  );

  const all = [...resourceBodies, ...blogBodies].filter(
    (s): s is string => s !== null,
  );
  const body = intro + all.join("");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
}
