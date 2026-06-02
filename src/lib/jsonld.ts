// JSON-LD schema.org builders for the AEO surface.
//
// Each builder returns a raw JSON-LD object (not a stringified <script> tag),
// so individual pages can compose them into a single @graph block alongside
// schemas produced by other features (e.g. the SkillScore chip adds Review +
// AggregateRating on detail pages). The page calls jsonLdGraph(...schemas)
// to get a single string ready to drop into a <script type="application/ld+json">
// tag via dangerouslySetInnerHTML.
//
// Why @graph instead of multiple <script> tags:
//   1. Google's Rich Results Test recognizes both, but @graph lets schemas
//      reference each other via @id (e.g. Article.publisher → Organization).
//   2. One DOM node, one parse pass for the crawler.
//
// Source: schema.org + Google Search Central guidelines as of 2026-05.

import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, TWITTER_HANDLE } from "./site";

// ── ID anchors used across schemas so cross-references resolve ─────────────
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// JSON-LD node shape. We avoid Record<string, unknown> as the param type
// because schema.org graphs are deeply nested and the value side mixes
// strings, numbers, nested nodes, and arrays. Defining the exact type isn't
// worth the maintenance cost; this is the lowest-risk escape hatch.
type JsonLdNode = Record<string, unknown>;

/**
 * Organization schema. Site-wide. Embed once on the root layout. Every
 * other schema references this via @id (e.g. Article.publisher).
 */
export function organizationSchema(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    sameAs: [
      "https://github.com/Implexa-Inc",
      `https://x.com/${TWITTER_HANDLE.replace(/^@/, "")}`,
    ],
  };
}

/**
 * WebSite schema with SearchAction. Tells search engines the site has a
 * search endpoint and how to construct query URLs. Google uses this to
 * render a search box directly in the SERP for our brand name.
 */
export function websiteSchema(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * BreadcrumbList. Pass an array of (name, url) tuples ordered from root
 * to the current page (exclusive of the homepage if you want — Google is
 * tolerant either way; we include it for clarity).
 */
export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── SoftwareApplication for skill detail pages ─────────────────────────────

export type SkillForSchema = {
  source: string;
  slug: string;
  name?: string;
  description?: string;
  author?: string;
  source_url?: string;
  install_count?: number | null;
  star_count?: number | null;
  last_seen_at?: string;
};

/**
 * SoftwareApplication schema for a SKILL.md detail page. Google treats
 * SoftwareApplication as a structured-data type with rich-results
 * potential. We use applicationCategory "DeveloperApplication" because
 * skills are developer tools (run inside Claude Code / Codex / Cursor).
 *
 * Composability: returns just the SoftwareApplication node. The page
 * composes with breadcrumbSchema() + (optionally) SkillScore's Review /
 * AggregateRating via jsonLdGraph().
 */
export function softwareApplicationSchema(skill: SkillForSchema): JsonLdNode {
  const skillUrl = `${SITE_URL}/s/${skill.source}/${skill.slug}`;
  const name = skill.name ?? skill.slug.replace(/-/g, " ");
  const description =
    skill.description ??
    `${name}, a SKILL.md from ${skill.source}. one-click install to claude code, codex, or cursor via implexa.`;

  const node: JsonLdNode = {
    "@type": "SoftwareApplication",
    "@id": skillUrl,
    name,
    description,
    url: skillUrl,
    applicationCategory: "DeveloperApplication",
    // The SKILL.md format runs inside any agentskills.io-compatible agent.
    // Listing each runtime helps disambiguation in AI-citation contexts.
    operatingSystem: "Claude Code, Codex, Cursor, Gemini CLI",
    // SKILL.md is the canonical name of the standard. Including it in
    // additionalType nudges AI assistants to associate this page with the
    // open SKILL.md ecosystem rather than a vendor-specific format.
    additionalType: "https://schema.org/CreativeWork",
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  if (skill.author) {
    node.author = {
      "@type": "Person",
      name: skill.author,
      url: `${SITE_URL}/u/${skill.author}`,
    };
  }
  if (skill.source_url) {
    node.sameAs = [skill.source_url];
  }
  if (skill.last_seen_at) {
    node.dateModified = skill.last_seen_at;
  }
  // install_count + star_count are real usage signals. Schema.org doesn't
  // have a perfect property for installs, but interactionStatistic with
  // ReadAction is the conventional dodge.
  const stats: Array<JsonLdNode> = [];
  if (typeof skill.install_count === "number" && skill.install_count > 0) {
    stats.push({
      "@type": "InteractionCounter",
      interactionType: { "@type": "InstallAction" },
      userInteractionCount: skill.install_count,
    });
  }
  if (typeof skill.star_count === "number" && skill.star_count > 0) {
    stats.push({
      "@type": "InteractionCounter",
      interactionType: { "@type": "LikeAction" },
      userInteractionCount: skill.star_count,
    });
  }
  if (stats.length > 0) {
    node.interactionStatistic = stats;
  }

  return node;
}

// ── Article for resource posts ─────────────────────────────────────────────

export type ResourceForSchema = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  tags?: string[];
  // Optional URL section — defaults to "resources" so existing callers
  // (resource posts) keep working unchanged. /guides passes "guides" so
  // its JSON-LD @id + image point at /guides/<slug> instead of /resources.
  // Without this the rich-result @id mismatched the HTML canonical, which
  // confused entity resolution.
  section?: "resources" | "guides";
};

/**
 * Article schema for a long-form post. Google's Article rich result needs
 * headline, datePublished, author, and an image (we use the OG image).
 * mainEntityOfPage links the schema to the canonical URL.
 */
export function articleSchema(post: ResourceForSchema): JsonLdNode {
  const section = post.section ?? "resources";
  const url = `${SITE_URL}/${section}/${post.slug}`;
  // Dynamically generated OG card served by the route's opengraph-image.tsx
  // (e.g. /resources/<slug>/opengraph-image). Replaces the former static
  // /og-<section>-<slug>.png path, which 404'd and disqualified the Article
  // rich result (Google requires a resolvable image).
  const ogImage = `${url}/opengraph-image`;

  return {
    "@type": "Article",
    "@id": url,
    headline: post.title,
    description: post.description,
    image: ogImage,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: post.tags?.join(", "),
  };
}

// ── WebPage + ItemList for the /scores leaderboard ─────────────────────────

export type ScoredSkillForSchema = {
  source: string;
  slug: string;
  name?: string;
  score?: number;
};

/**
 * WebPage + ItemList combo for the /scores leaderboard. ItemList tells
 * Google this is a ranked list (eligible for "carousel" rich results when
 * the ranks are linked entities). Each entry references the detail page
 * by its canonical URL.
 */
export function scoresPageSchema(
  topSkills: Array<ScoredSkillForSchema>,
): JsonLdNode {
  return {
    "@type": "WebPage",
    "@id": `${SITE_URL}/scores`,
    name: "top-rated skills",
    description:
      "implexa SkillRank scores across the 11k+ cross-vendor index. multi-signal ranking from semantic match, tool overlap, cohort co-occurrence, and outcome attribution.",
    url: `${SITE_URL}/scores`,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: topSkills.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: topSkills.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/s/${s.source}/${s.slug}`,
        name: s.name ?? s.slug.replace(/-/g, " "),
      })),
    },
  };
}

// ── SoftwareSourceCode for future module pages ─────────────────────────────
//
// Forward-compat helper. Module pages (/m/[ecosystem]/[package]) wrap an
// npm/pypi/cargo module behind an implexa skill manifest. SoftwareSourceCode
// is the schema.org type Google + AI engines use to identify code packages
// with semantic version + license + repo. Consumed by the module detail page
// (/m/[ecosystem]/[...package]); kept here so future package surfaces reuse
// one canonical builder instead of hand-rolling the node.

export type SoftwareSourceCodeInput = {
  name: string;
  description?: string;
  url?: string;             // canonical page on implexa.ai
  version?: string;         // semver (omitted from output when absent)
  programmingLanguage: string; // TypeScript, Python, Go, Rust, etc.
  license?: string;         // SPDX id (MIT, Apache-2.0, etc.)
  codeRepository?: string;  // github / gitlab / etc. URL
  author?: { name: string; url?: string };
  // Optional: the ecosystem package registry URL (npmjs.com, pypi.org).
  // Schema.org has no first-class field for this; we map it onto sameAs.
  registryUrl?: string;
  // Optional date last modified (ISO 8601).
  dateModified?: string;
};

/**
 * SoftwareSourceCode schema for a module page. The Google Rich Results Test
 * validates this against the SoftwareApplication ruleset — close enough for
 * AEO grounding even though it's a distinct schema type.
 *
 * License is emitted as an SPDX-style URL string per schema.org guidance
 * (https://schema.org/license), with a fallback to the raw identifier if the
 * caller passes a non-SPDX string.
 */
export function softwareSourceCodeSchema(
  input: SoftwareSourceCodeInput,
): JsonLdNode {
  const node: JsonLdNode = {
    "@type": "SoftwareSourceCode",
    name: input.name,
    programmingLanguage: input.programmingLanguage,
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
  if (input.version) node.version = input.version;
  if (input.description) node.description = input.description;
  if (input.url) {
    node.url = input.url;
    node["@id"] = input.url;
  }
  if (input.license) {
    // SPDX identifiers resolve at spdx.org/licenses/<id>. Pass the resolved
    // URL when input matches a known shape; fall back to the raw string.
    const SPDX = /^[A-Za-z0-9.+-]+$/;
    node.license = SPDX.test(input.license)
      ? `https://spdx.org/licenses/${input.license}`
      : input.license;
  }
  if (input.codeRepository) node.codeRepository = input.codeRepository;
  if (input.author) {
    node.author = {
      "@type": "Person",
      name: input.author.name,
      ...(input.author.url ? { url: input.author.url } : {}),
    };
  }
  if (input.registryUrl) node.sameAs = [input.registryUrl];
  if (input.dateModified) node.dateModified = input.dateModified;
  return node;
}

// ── HowTo for skill detail pages ───────────────────────────────────────────
//
// AI-engine angle: HowTo is the schema.org type Perplexity / ChatGPT Search /
// Google AI Overviews preferentially surface for procedural queries (how do I
// X, what's the workflow for Y). SKILL.md procedures map directly to HowTo:
// each step gets a name + a one-line text body. The "tool" array lets us tag
// the MCP tools each step invokes so an AI engine reasoning about "which MCP
// tools handle a sales-call brief" can pull the right skill straight from
// structured data without parsing prose.

export type HowToStepInput = {
  name: string;
  description?: string;
};

export type HowToToolInput = {
  name: string;
  url?: string;
};

export type HowToInput = {
  name: string;
  description?: string;
  url?: string;
  totalTime?: string;       // ISO 8601 duration (PT5M, PT1H30M, etc.)
  steps: HowToStepInput[];
  tools?: HowToToolInput[]; // MCP tools, runtimes, etc.
  supplies?: string[];      // wrapped modules, deps — for future module pages
};

/**
 * HowTo schema for a procedural SKILL.md. Pair with SoftwareApplication +
 * BreadcrumbList in jsonLdGraph(). Validates against the Rich Results Test
 * when name + ≥2 steps are present, which is what we require below.
 *
 * Steps with no name or only whitespace are dropped; we never emit an
 * empty HowToStep because that fails schema.org validation.
 */
export function howToSchema(input: HowToInput): JsonLdNode | null {
  const cleanSteps = input.steps
    .map((s) => ({ ...s, name: s.name.trim() }))
    .filter((s) => s.name.length > 0)
    .map((s, i) => {
      const node: JsonLdNode = {
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        // schema.org requires text (machine-readable) — when no separate
        // description is supplied, the step name doubles as the text.
        text: s.description?.trim() || s.name,
      };
      if (s.description && s.description.trim() !== s.name) {
        node.itemListElement = [
          {
            "@type": "HowToDirection",
            text: s.description.trim(),
          },
        ];
      }
      return node;
    });

  if (cleanSteps.length < 2) return null;

  const node: JsonLdNode = {
    "@type": "HowTo",
    name: input.name,
    step: cleanSteps,
  };
  if (input.description) node.description = input.description;
  if (input.url) node.url = input.url;
  if (input.totalTime) node.totalTime = input.totalTime;
  if (input.tools && input.tools.length > 0) {
    node.tool = input.tools.map((t) => {
      const tn: JsonLdNode = { "@type": "HowToTool", name: t.name };
      if (t.url) tn.url = t.url;
      return tn;
    });
  }
  if (input.supplies && input.supplies.length > 0) {
    node.supply = input.supplies.map((s) => ({
      "@type": "HowToSupply",
      name: s,
    }));
  }
  return node;
}

// ── Graph assembler ────────────────────────────────────────────────────────

/**
 * Compose 1..N schema nodes into a single @graph block ready for a
 * <script type="application/ld+json"> tag. Variadic signature so callers
 * can spread their own arrays in.
 *
 * Return value is a JSON string (already stringified) because that's what
 * dangerouslySetInnerHTML wants. Newlines/indent are dropped — minified is
 * what crawlers see anyway.
 */
export function jsonLdGraph(...nodes: Array<JsonLdNode | null | undefined>): string {
  const present = nodes.filter((n): n is JsonLdNode => n != null);
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": present,
  });
}
