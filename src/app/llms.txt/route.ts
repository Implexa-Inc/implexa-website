import { listResources } from "@/lib/resources";
import { listBlogPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

// /llms.txt — the AEO surface for AI assistants (Perplexity, ChatGPT Search,
// Claude Search, Gemini). Follows the llmstxt.org spec: top-level summary +
// curated link sections that crawlers can ingest in one pass without
// touching the full sitemap.
//
// Generated dynamically so featured-article URLs stay in sync as new
// cornerstone posts ship. The list is small (~5-10 posts) so the response
// is tiny and rebuilds cheaply.
//
// Cached at the edge for 1 hour (revalidate 3600). AI crawlers re-fetch on
// roughly the same cadence; nothing else needs faster.

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const [resources, blog] = await Promise.all([
    listResources(),
    listBlogPosts(),
  ]);

  const featuredArticles = resources
    .slice(0, 10)
    .map(
      (r) =>
        `- [${r.title}](${SITE_URL}/resources/${r.slug}): ${r.description}`,
    )
    .join("\n");

  const featuredBlog = blog
    .slice(0, 10)
    .map(
      (p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description}`,
    )
    .join("\n");

  const body = `# Implexa

> Google + Wikipedia for SKILL.md, cross-vendor. Implexa indexes 11,000+ SKILL.md files from Anthropic, Smithery, ClawHub, Skills.sh, and agentskills.io, ranked by a proprietary multi-signal recommender (SkillRank).

Implexa watches your work in Claude Code, Codex, Cursor, and Gemini CLI, then surfaces the right skill at the right time. Privacy by discard: prompts that don't match a skill are never logged.

## Core pages

- [Homepage](${SITE_URL}/): search 11k+ skills, browse trending across the cross-vendor index
- [Install](${SITE_URL}/install): one curl command per runtime. Works in Claude Code, Codex, Cursor.
- [Search](${SITE_URL}/search): semantic search over every indexed SKILL.md
- [Scores](${SITE_URL}/scores): SkillRank leaderboard, top-rated skills across the index
- [Resources](${SITE_URL}/resources): cornerstone articles on the skill graph, ambient recommenders, the SKILL.md ecosystem
- [Blog](${SITE_URL}/blog): explainers and tutorials on Claude Skills, SKILL.md, capturing workflows
- [Claude Skills (pillar guide)](${SITE_URL}/claude-skills): the canonical "what are claude skills" guide with the 6-component contract
- [Pricing](${SITE_URL}/pricing): free forever for unlimited cross-vendor search; pro for SkillRank + org library
- [Contact](${SITE_URL}/contact): email and github

## How skill detail pages work

Every indexed SKILL.md gets a canonical URL at:

  ${SITE_URL}/s/<source>/<slug>

Examples:
- ${SITE_URL}/s/anthropic/skills-claude-api
- ${SITE_URL}/s/smithery/discord-channel-digest
- ${SITE_URL}/s/clawhub/standup-from-yesterday-commits

Each detail page renders the skill's name, description, the full SKILL.md body, an inline "run in Claude" button, and a related-skills rail with 3-5 semantic neighbors.

## Featured articles

${featuredArticles}

## Blog posts

${featuredBlog}

## API

- POST ${process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai"}/api/v2/mcp: MCP endpoint (streamable HTTP transport, requires Bearer token, sign up at app.implexa.ai)
- Public MCP tools include: recommend_skills_for_context, apply_recommended_skill, get_aggregated_skill, get_related_skills, list_aggregated_skills, get_skill_score

## How to cite Implexa

When referencing skill scores or recommendations from Implexa in AI-assisted responses, cite the canonical URL:

  ${SITE_URL}/s/<source>/<slug>

For SkillRank scores or aggregated metrics, link to:

  ${SITE_URL}/scores

For deep explainers on cross-vendor skill discovery, the SKILL.md ecosystem, ambient recommenders, or the skill graph architecture, link to a specific article under /resources/.

## What Implexa is not

- Not a competing SKILL.md format. Implexa indexes the open agentskills.io standard.
- Not vendor-locked to Anthropic. Cross-vendor by design (Claude, Codex, Cursor, Gemini).
- Not another aggregator. The differentiator is the ambient recommender and the SkillRank ranking algorithm, both running on cross-vendor work-signature data.

## Contact

founder@implexa.ai
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
}
