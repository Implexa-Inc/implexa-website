import { SITE_URL } from "@/lib/site";

// /.well-known/mcp.json — the discovery doc for the implexa MCP server.
//
// There's no ratified spec for an MCP .well-known descriptor yet, so this
// follows the de-facto shape: the modelcontextprotocol/registry server.json
// (name, description, version, `remotes` array with transport_type + url) plus
// the connector metadata claude.ai and Smithery surface (auth scheme, a tools
// summary, contact). We carry both a registry-style `remotes` array AND a
// flatter `server` + `authentication` + `tools` block so whichever convention
// a crawler/agent expects, it finds a usable entry point.
//
// Voice: lowercase, no em-dashes, to match the rest of the site.
//
// force-static: no runtime data, so Next prerenders this once. 24h revalidate
// matches the other AEO surfaces and only matters across redeploys.

export const dynamic = "force-static";
export const revalidate = 86400;

const MCP_URL =
  process.env.IMPLEXA_MCP_URL ?? "https://core.implexa.ai/api/v2/mcp";

// Public read-only tools that work without a key. Descriptions are written
// for humans/agents reading this doc cold, not the internal registry summaries
// (which carry roadmap jargon). Keep this list in sync with the no-auth gate
// in the backend MCP server.
const PUBLIC_TOOLS = [
  {
    name: "recommend_skills_for_context",
    description:
      "given a description of what you are working on, return the best-fit SKILL.md across the cross-vendor index, ranked by SkillRank.",
  },
  {
    name: "apply_recommended_skill",
    description:
      "inline-apply a recommended skill without installing it. returns the SKILL.md body ready to run.",
  },
  {
    name: "get_aggregated_skill",
    description:
      "fetch a single skill by (source, slug), with metadata and SkillRank score.",
  },
  {
    name: "list_aggregated_skills",
    description:
      "paginated list of every indexed skill as (source, slug, last_seen_at) tuples.",
  },
  {
    name: "get_related_skills",
    description:
      "top-N semantically related skills for a given skill, ranked by embedding similarity.",
  },
  {
    name: "get_skill_score",
    description:
      "fetch the SkillRank evaluation for one skill by (source, slug).",
  },
  {
    name: "get_skill_content",
    description: "fetch the full SKILL.md content and metadata for one skill.",
  },
  {
    name: "count_skills",
    description:
      "fast counts of the index: total rows and vetted (quality-gated) rows.",
  },
];

export function GET(): Response {
  const doc = {
    // self-reference so a fetcher can confirm what it is looking at.
    $schema: `${SITE_URL}/.well-known/mcp.json`,
    name: "implexa",
    description:
      "google + wikipedia for SKILL.md, cross-vendor. implexa indexes 40,000+ skills from anthropic, smithery, clawhub, skills.sh, agentskills.io, github, cursor, and continue, ranks them with SkillRank, and serves them over one MCP server. add it as a connector and your agent gains skill discovery + inline apply across the whole cross-vendor index.",
    version: "0.1.0",
    homepage: SITE_URL,
    documentation: `${SITE_URL}/developers`,

    // registry-style remotes array (modelcontextprotocol/registry server.json).
    remotes: [
      {
        type: "streamable-http",
        url: MCP_URL,
      },
    ],

    // flatter server block for connector UIs that read this shape directly.
    server: {
      url: MCP_URL,
      transport: "streamable-http",
    },

    authentication: {
      type: "bearer",
      header: "Authorization",
      scheme: "Bearer",
      tokenFormat: "rvk_live_*",
      example: "Authorization: Bearer rvk_live_xxxxxxxxxxxxxxxxxxxx",
      instructions: "get a key at https://app.implexa.ai",
      // a subset of read tools work with no key at all.
      publicAccess: true,
    },

    tools: {
      count: 60,
      // full machine-readable catalog (name, description, input schema).
      catalog: `${SITE_URL}/developers/openapi.json`,
      // the no-auth read tools, inline so a connector can render them without
      // a second fetch.
      public: PUBLIC_TOOLS,
    },

    // works as a claude.ai custom connector out of the box (streamable-http +
    // bearer). also runs in claude code, codex, cursor, gemini cli.
    clients: ["claude.ai", "claude code", "codex", "cursor", "gemini cli"],

    provider: {
      name: "implexa",
      url: SITE_URL,
    },
    contact: {
      email: "founder@implexa.ai",
      url: `${SITE_URL}/contact`,
    },
  };

  return new Response(JSON.stringify(doc, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=600, s-maxage=86400",
    },
  });
}
