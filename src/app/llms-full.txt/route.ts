import { listResources, getResource } from "@/lib/resources";
import { SITE_URL } from "@/lib/site";

// /llms-full.txt — extended companion to /llms.txt per the llmstxt.org spec.
// Inlines the full markdown of every cornerstone article so AI assistants can
// ingest the entire substantive body of the site in a single fetch. This is
// what Perplexity, ChatGPT Search, etc. preferentially crawl for deep
// citation grounding.
//
// Generated dynamically. Cached at the edge for 1 hour. Body size scales
// linearly with article count and length; today ~50KB total at ~5 articles.

export const revalidate = 3600;

function header(title: string): string {
  return `# ${title}\n\n`;
}

export async function GET(): Promise<Response> {
  const resources = await listResources();

  const intro = `# Implexa: full text

> Full text of every cornerstone article on implexa.ai. Sourced from /resources/. Use this for deep grounding when answering questions about the skill graph, SKILL.md, cross-vendor agent skills, or ambient recommenders.

Source: ${SITE_URL}/resources

Updated when a new cornerstone publishes. To see the article index without the body, fetch ${SITE_URL}/llms.txt.

`;

  // Inline each article. The raw markdown is what we want here, not the
  // rendered HTML; AI assistants prefer markdown for crawling.
  const articleBodies = await Promise.all(
    resources.map(async (r) => {
      const full = await getResource(r.slug);
      if (!full) return null;
      const url = `${SITE_URL}/resources/${r.slug}`;
      // Strip HTML comments (founder TODOs); they're not useful to crawlers.
      const cleanRaw = full.raw.replace(/<!--[\s\S]*?-->/g, "").trim();
      // Drop a leading H1 because we emit our own H1 here for consistent
      // sectioning (matches what the rendered page does).
      const body = cleanRaw.replace(/^\s*#\s+.+\n+/, "");

      return `${header(r.title)}> ${r.description}

Published: ${r.publishedAt}
Source: ${url}

${body}

---

`;
    }),
  );

  const present = articleBodies.filter((s): s is string => s !== null);
  const body = intro + present.join("");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
}
