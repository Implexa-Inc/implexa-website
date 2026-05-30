// module-verification.ts — server-only fetchers for the /m/[ecosystem]/[package]
// detail page.
//
// Backend reference: implexa-backend feat/module-verification branch.
// Two MCP tools:
//   - verify_module(ecosystem, package, version?) → the verification card
//   - list_skills_for_module(ecosystem, package) → skills whose frontmatter
//     declares this module
//
// The backend chip is in-flight in parallel with this one. The verify_module
// tool may not be merged by the time the website code lands; both helpers
// degrade gracefully (null / []) so the route renders a sane fallback when
// either upstream is missing. For local visual development we also fall
// through to a fixture for @stripe/stripe-node — see VISUAL_DEV_FIXTURES.
//
// Streamable-HTTP envelope parsing matches the pattern used by every other
// MCP wrapper in this repo (skill-score, skill-catalog, /scores, /u/[handle]).

const BACKEND = process.env.IMPLEXA_API_URL ?? "https://core.implexa.ai";
const TOKEN = process.env.IMPLEXA_PUBLIC_SEARCH_TOKEN ?? "";

// Trust tier label for the verification card. Mirrors the backend's
// frontmatter.modules[].trust_tier enum. See AGENTS.md / module spec.
export type TrustTier = "signed" | "declared" | "unverified";

export type ModuleEditorial = {
  // Wirecutter-shape: a short take, why-we-like-it, and an honest call-out.
  pick_summary?: string;
  why?: string;
  caveats?: string;
  // Editorial byline if a human curated this entry.
  curated_by?: string | null;
  curated_at?: string | null;
};

export type OsvVulnerability = {
  id: string;
  severity?: "low" | "medium" | "high" | "critical" | string;
  summary?: string;
};

export type ModuleVerification = {
  ok: boolean;
  ecosystem: string;
  package: string;
  // Range string as declared by the skill frontmatter, e.g. "^15.0.0".
  // Distinct from `latest_version`, which is the current release on the
  // upstream registry.
  version_range?: string | null;
  latest_version?: string | null;

  // SPDX identifier + canonical URL. Hide the section if both absent.
  license_spdx?: string | null;
  license_url?: string | null;

  // Sigstore tier. "signed" means we verified a Sigstore bundle for this
  // version; "declared" means the maintainer asserts provenance (e.g.
  // npm provenance), but we haven't fully verified; "unverified" is the
  // floor — no provenance signal.
  trust_tier?: TrustTier | null;
  trust_detail?: string | null;

  // deps.dev signals. Both optional — render a row only if present.
  downloads_30d?: number | null;
  scorecard?: number | null; // OpenSSF Scorecard, 0..10
  scorecard_url?: string | null;

  // OSV vulnerability roll-up. count is the total, top is the first ~3 by
  // severity for display. We don't render the full list on this page.
  osv_count?: number;
  osv_top?: OsvVulnerability[];

  // Provenance + repo links
  source_url?: string | null; // git repo url
  author?: string | null;
  homepage?: string | null;
  programming_language?: string | null;

  // Optional editorial section. Hidden when not present.
  editorial?: ModuleEditorial | null;

  verified_at?: string | null;
  error?: string;
};

export type PairedSkill = {
  source: string;
  slug: string;
  name: string | null;
  description: string | null;
  author: string | null;
  display_score: number | null;
};

// Parse the SSE-or-plain-JSON envelope every MCP tool wraps its response in.
// Same shape as skill-score.ts; copy kept inline so this file is independent
// (no shared-helper churn risk while module endpoints are still in flux).
function parseMcpEnvelope(text: string): unknown {
  const dataLine = text.split("\n").find((ln) => ln.startsWith("data: "));
  const jsonStr = dataLine ? dataLine.slice(6) : text;
  const body: { result?: { content?: Array<{ text?: string }> } } =
    JSON.parse(jsonStr);
  const raw = body?.result?.content?.[0]?.text ?? "{}";
  return JSON.parse(raw);
}

async function callMcpTool<T>(
  name: string,
  args: Record<string, unknown>,
  revalidate: number,
): Promise<T | null> {
  if (!TOKEN) return null;
  try {
    const upstream = await fetch(`${BACKEND}/api/v2/mcp`, {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
        authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name, arguments: args },
      }),
      signal: AbortSignal.timeout(15000),
      next: { revalidate },
    });
    if (!upstream.ok) return null;
    return parseMcpEnvelope(await upstream.text()) as T;
  } catch {
    return null;
  }
}

// ── Visual dev fixture ─────────────────────────────────────────────────────
//
// The backend tool isn't merged yet. To keep this page renderable in local
// dev (and on preview deploys before the backend ships) we return a
// hand-shaped fixture for ONE module: npm/@stripe/stripe-node. Every other
// (ecosystem, package) tuple falls through to a real MCP call.
//
// Remove this block once verify_module is GA and stable on prod.

const VISUAL_DEV_FIXTURES: Record<string, ModuleVerification> = {
  "npm/@stripe/stripe-node": {
    ok: true,
    ecosystem: "npm",
    package: "@stripe/stripe-node",
    version_range: "^15.0.0",
    latest_version: "15.12.0",
    license_spdx: "MIT",
    license_url: "https://spdx.org/licenses/MIT.html",
    trust_tier: "signed",
    trust_detail:
      "Sigstore bundle verified against the @stripe npm publisher identity.",
    downloads_30d: 12_450_000,
    scorecard: 9.2,
    scorecard_url:
      "https://api.securityscorecards.dev/projects/github.com/stripe/stripe-node",
    osv_count: 0,
    osv_top: [],
    source_url: "https://github.com/stripe/stripe-node",
    author: "stripe",
    homepage: "https://stripe.com/docs/api?lang=node",
    programming_language: "TypeScript",
    editorial: {
      pick_summary:
        "the reference SDK for stripe in node. typed, well-tested, and the one stripe themselves ship integrations against.",
      why: "first-party support, full coverage of the API surface, and a stable release cadence. webhook verification helpers and idempotency keys are first-class.",
      caveats:
        "the bundle is large. for serverless cold starts, scope your imports to the resources you actually use rather than importing the whole client.",
      curated_by: "implexa",
      curated_at: "2026-05-29T00:00:00Z",
    },
    verified_at: "2026-05-29T00:00:00Z",
  },
};

/**
 * fetchModuleVerification(ecosystem, package, version?) — the verification
 * card payload for /m/[ecosystem]/[package]. ISR cache: 24 hours.
 *
 * Falls through to a fixture for @stripe/stripe-node when the backend tool
 * isn't available (no token, network error, tool unmerged). Returns null on
 * unknown (ecosystem, package) when there's no fixture either, which the
 * page maps to 404.
 */
export async function fetchModuleVerification(
  ecosystem: string,
  pkg: string,
  version?: string,
): Promise<ModuleVerification | null> {
  const args: Record<string, unknown> = { ecosystem, package: pkg };
  if (version) args.version = version;

  const data = await callMcpTool<ModuleVerification>(
    "verify_module",
    args,
    86400, // 24h
  );

  if (data?.ok) return data;

  // Backend unavailable → try the visual-dev fixture for this exact tuple.
  // This keeps local dev productive while the backend chip lands.
  const fixtureKey = `${ecosystem}/${pkg}`;
  if (VISUAL_DEV_FIXTURES[fixtureKey]) {
    return VISUAL_DEV_FIXTURES[fixtureKey];
  }
  return null;
}

/**
 * fetchPairedSkills(ecosystem, package) — implexa skills whose frontmatter
 * declares this module under its `modules:` array. Backend joins on the
 * JSONB column via list_skills_for_module. ISR cache: 24 hours.
 *
 * Returns [] if the backend tool is missing or the module has no callers.
 * The page hides the rail when empty rather than rendering an empty state.
 */
export async function fetchPairedSkills(
  ecosystem: string,
  pkg: string,
): Promise<PairedSkill[]> {
  type PairedResponse = {
    ok?: boolean;
    rows?: PairedSkill[];
  };

  const data = await callMcpTool<PairedResponse>(
    "list_skills_for_module",
    { ecosystem, package: pkg },
    86400, // 24h
  );

  if (!data?.ok || !Array.isArray(data.rows)) {
    // Fixture: when querying @stripe/stripe-node in visual-dev mode, return
    // a couple of plausible callers so the rail isn't empty during review.
    if (ecosystem === "npm" && pkg === "@stripe/stripe-node") {
      return [
        {
          source: "implexa",
          slug: "stripe-best-practices",
          name: "stripe-best-practices",
          description:
            "guardrails + idempotent patterns for any stripe integration. covers webhooks, retries, and test-mode hygiene.",
          author: "implexa",
          display_score: 9.4,
        },
        {
          source: "implexa",
          slug: "stripe-projects",
          name: "stripe-projects",
          description:
            "scaffolds a fresh stripe-backed project with sensible defaults — env vars, webhook routing, test-mode keys.",
          author: "implexa",
          display_score: 8.7,
        },
      ];
    }
    return [];
  }
  return data.rows;
}

// ── Display helpers ────────────────────────────────────────────────────────

// Map trust tier → badge styling. Aligned with skill-card / SkillRank tiers:
//   signed     → emerald  (matches tier-1)
//   declared   → green    (matches tier-2)
//   unverified → amber    (matches tier-3)
export function trustTierStyle(
  tier: TrustTier | null | undefined,
): { className: string; label: string } {
  switch (tier) {
    case "signed":
      return {
        className: "bg-emerald-950 text-emerald-300 border-emerald-900",
        label: "signed",
      };
    case "declared":
      return {
        className: "bg-green-950 text-green-300 border-green-900",
        label: "declared",
      };
    case "unverified":
    default:
      return {
        className: "bg-amber-950 text-amber-300 border-amber-900",
        label: "unverified",
      };
  }
}

// Ecosystem → schema.org programmingLanguage. Used for JSON-LD on the
// detail page. Fallback to the ecosystem name itself rather than guessing
// when the mapping is ambiguous.
export function ecosystemLanguage(ecosystem: string): string {
  switch (ecosystem.toLowerCase()) {
    case "npm":
      return "JavaScript";
    case "pypi":
      return "Python";
    case "crates":
    case "crates.io":
      return "Rust";
    case "rubygems":
      return "Ruby";
    case "go":
      return "Go";
    case "packagist":
      return "PHP";
    case "maven":
      return "Java";
    case "nuget":
      return "C#";
    default:
      return ecosystem;
  }
}

// Ecosystem → upstream registry URL for a package. Used by the "report an
// issue" + "view on registry" outbound links.
export function ecosystemRegistryUrl(
  ecosystem: string,
  pkg: string,
): string | null {
  switch (ecosystem.toLowerCase()) {
    case "npm":
      return `https://www.npmjs.com/package/${pkg}`;
    case "pypi":
      return `https://pypi.org/project/${pkg}/`;
    case "crates":
    case "crates.io":
      return `https://crates.io/crates/${pkg}`;
    case "rubygems":
      return `https://rubygems.org/gems/${pkg}`;
    case "packagist":
      return `https://packagist.org/packages/${pkg}`;
    default:
      return null;
  }
}
