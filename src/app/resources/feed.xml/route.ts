import { listResources } from "@/lib/resources";
import { SITE_URL, SITE_DESCRIPTION } from "@/lib/site";

// RSS 2.0 feed for /resources. AI assistants subscribe to RSS for low-noise
// publish notifications (Perplexity especially weights freshly-published
// content from sources it trusts). Standard RSS readers also subscribe.
//
// Cached at the edge for 1 hour. Generated from the same gray-matter
// frontmatter the resources index reads, so a new cornerstone publishes to
// the feed automatically on the next revalidation pass.

export const revalidate = 3600;

// XML-escape values that are interpolated into the body. Titles and
// descriptions are author-controlled (us), but defensive escaping is the
// right hygiene regardless.
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function pubDate(iso: string): string {
  // RFC 822 format expected by RSS 2.0 readers.
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toUTCString();
}

export async function GET(): Promise<Response> {
  const resources = await listResources();
  const now = new Date().toUTCString();

  const items = resources
    .map((r) => {
      const url = `${SITE_URL}/resources/${r.slug}`;
      const categories =
        r.tags?.map((t) => `      <category>${xmlEscape(t)}</category>`).join("\n") ??
        "";

      return `    <item>
      <title>${xmlEscape(r.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${xmlEscape(r.description)}</description>
      <pubDate>${pubDate(r.publishedAt)}</pubDate>
${categories}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>implexa resources</title>
    <link>${SITE_URL}/resources</link>
    <atom:link href="${SITE_URL}/resources/feed.xml" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
}
