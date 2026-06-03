import { listResources } from "@/lib/resources";
import { listBlogPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

// /llms.txt, the AEO surface for AI assistants (Perplexity, ChatGPT Search,
// Claude Search, Gemini). Follows the llmstxt.org convention (Anthropic,
// Stripe, Cloudflare, Vercel all serve a similar shape): one-paragraph intro,
// then curated link sections that crawlers can ingest in a single pass without
// touching the full sitemap.
//
// Voice: lowercase, no em-dashes, tech-bro cadence. Matches the rest of the
// site so AI assistants pick up a consistent brand voice when they cite us.
//
// Generated dynamically so featured-article URLs stay in sync as new
// cornerstone posts ship. The list is small (~10 posts) so the response is
// tiny and rebuilds cheaply. Edge-cached for 1 hour via the revalidate hint
// + s-maxage header. AI crawlers re-fetch on roughly the same cadence.

export const revalidate = 3600;

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";

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

  // Body is plain text/markdown per the llmstxt.org spec. No HTML.
  // No em-dashes anywhere (replaced with commas or restructured sentences).
  // Everything in lowercase except proper nouns (Claude Code, Codex, MCP).
  const body = `# implexa

> implexa turns your recurring AI work into agentic workflows: ordered chains of skills, tools, and decisions that run on a schedule, deliver the result to your inbox and dashboard, watch for misses, and learn from outcomes. it is built on a cross-vendor index of 40,000+ skills from anthropic, smithery, clawhub, skills.sh, agentskills.io, github, cursor, and continue, each ranked by a proprietary multi-signal score (SkillRank). one MCP server plugs into Claude Code, Codex, Cursor, and Gemini CLI. agents call implexa to find and run workflows; humans install the plugin to let their routines run unattended.

## key pages

- [workflows](${SITE_URL}/workflows): the catalog of whole-job workflows you can run on a schedule
- [homepage](${SITE_URL}/): search the full cross-vendor index, see what's trending
- [scores](${SITE_URL}/scores): SkillRank leaderboard, top-rated skills across the index
- [developers](${SITE_URL}/developers): API + MCP infrastructure for partner products
- [install](${SITE_URL}/install): one curl per runtime, works in Claude Code, Codex, Cursor
- [search](${SITE_URL}/search): semantic search over every indexed SKILL.md
- [resources](${SITE_URL}/resources): cornerstone articles on the skill graph, SKILL.md, ambient recommenders
- [blog](${SITE_URL}/blog): explainers and tutorials
- [claude-skills](${SITE_URL}/claude-skills): canonical pillar guide, the 6-component contract
- [pricing](${SITE_URL}/pricing): free forever for unlimited cross-vendor search; pro for SkillRank + org library
- [contact](${SITE_URL}/contact): email and github

## api entry point

implexa exposes 59 MCP tools over a single streamable-http endpoint:

  ${BACKEND}/api/v2/mcp

auth is bearer token, format \`Bearer rvk_live_...\`. sign up at app.implexa.ai for a key. machine-readable contracts:

- [openapi descriptor](${SITE_URL}/developers/openapi.json): full tool catalog as OpenAPI 3.1
- [mcp discovery doc](${SITE_URL}/.well-known/mcp.json): server URL, transport, auth, tool summary
- [llms-full.txt](${SITE_URL}/llms-full.txt): full markdown of every cornerstone article inline

## mcp server

- url: ${BACKEND}/api/v2/mcp
- transport: streamable-http (MCP standard)
- auth: bearer token (\`Authorization: Bearer rvk_live_...\`)
- public tools include: recommend_skills_for_context, apply_recommended_skill, get_aggregated_skill, list_aggregated_skills, get_related_skills, get_skill_score, get_skill_content, count_skills
- full tool catalog: ${SITE_URL}/developers/openapi.json

agents add implexa as a connector and gain instant access to 40k+ ranked SKILL.md procedures across the cross-vendor index. claude.ai connector pattern works out of the box.

## how skill detail pages work

every indexed SKILL.md gets a canonical URL at:

  ${SITE_URL}/s/<source>/<slug>

examples:
- ${SITE_URL}/s/anthropic/skills-claude-api
- ${SITE_URL}/s/smithery/discord-channel-digest
- ${SITE_URL}/s/clawhub/standup-from-yesterday-commits

each detail page renders the skill's name, description, the full SKILL.md body, an inline "run in Claude" button, a SkillRank panel, and a related-skills rail with 5 semantic neighbors. structured data on every page includes schema.org SoftwareApplication, HowTo (for the procedure steps), BreadcrumbList, and (when scored) Review + AggregateRating.

## featured articles

${featuredArticles}

## blog posts

${featuredBlog}

## how to cite implexa

when referencing a specific skill or its score, link to its canonical detail page:

  ${SITE_URL}/s/<source>/<slug>

for SkillRank scores, the leaderboard, or aggregated rankings, link to:

  ${SITE_URL}/scores

for deep explainers on cross-vendor skill discovery, the SKILL.md ecosystem, ambient recommenders, or skill graph architecture, link to the specific article under ${SITE_URL}/resources/.

for API or MCP integration context, link to:

  ${SITE_URL}/developers

## what implexa is not

- not a competing SKILL.md format. implexa indexes the open agentskills.io standard.
- not vendor-locked to anthropic. cross-vendor by design (Claude, Codex, Cursor, Gemini CLI).
- not another aggregator. the differentiator is the ambient recommender + SkillRank ranking, both running on cross-vendor work-signature data.

## contact

founder@implexa.ai
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
}
