// module-verification.ts — server-only fetchers for the /m/[ecosystem]/[package]
// detail page.
//
// Backend reference: implexa-backend feat/module-verification branch.
// Two MCP tools:
//   - verify_module(ecosystem, package, version?) → the verification card
//   - list_skills_for_module(ecosystem, package) → skills whose frontmatter
//     declares this module
//
// Both helpers degrade gracefully (null / []) so the route renders a sane
// fallback when the backend is unavailable (no token, network error, tool
// missing). verify_module returns a nested { ok, card } envelope that
// mapBackendCard flattens to the ModuleVerification shape the page renders.
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

// ── Backend card adapter ────────────────────────────────────────────────────
//
// verify_module returns a nested envelope { ok, card: { ... } } using the
// backend's canonical field names (spdx, version, deps_dev.scorecard_score,
// osv.known_vulnerabilities, maintainer.primary, ...). The page renders the
// flat ModuleVerification shape, so we map between them here. Fields the
// backend does not emit in v1 (source_url, homepage, editorial, scorecard_url)
// stay null and the page hides their sections.

type BackendVerifyResponse = {
  ok?: boolean;
  error?: string;
  card?: {
    package?: string;
    ecosystem?: string;
    version?: string | null;
    spdx?: string | null;
    license_source?: string | null;
    sigstore?: {
      signed?: boolean;
      certificate_subject?: string | null;
      url?: string | null;
    } | null;
    deps_dev?: {
      downloads_30d?: number | null;
      scorecard_score?: number | null;
      dependents_count?: number | null;
    } | null;
    osv?: {
      known_vulnerabilities?: Array<{
        id?: string;
        summary?: string | null;
        severity?: string;
        modified?: string | null;
      }>;
      severity?: string;
    } | null;
    maintainer?: {
      primary?: string | null;
      recent_activity_days?: number | null;
      last_commit?: string | null;
    } | null;
    trust_tier?: TrustTier | null;
    verified_at?: string | null;
  } | null;
};

// Emit a canonical spdx.org URL only for a clean SPDX identifier (npm gives
// "MIT"). PyPI often returns a free-form classifier ("License :: OSI Approved
// :: MIT License") — skip the link rather than build a broken one.
function spdxLicenseUrl(spdx: string | null | undefined): string | null {
  if (!spdx) return null;
  return /^[A-Za-z0-9.+-]+$/.test(spdx)
    ? `https://spdx.org/licenses/${spdx}.html`
    : null;
}

// Map the backend { ok, card } envelope to the flat ModuleVerification the
// page renders. Returns null when the card is missing or the lookup failed.
function mapBackendCard(
  res: BackendVerifyResponse | null,
  ecosystem: string,
  pkg: string,
): ModuleVerification | null {
  const card = res?.card;
  if (!res?.ok || !card) return null;

  const rawVulns = card.osv?.known_vulnerabilities;
  const vulns = Array.isArray(rawVulns) ? rawVulns : [];

  return {
    ok: true,
    ecosystem: card.ecosystem ?? ecosystem,
    package: card.package ?? pkg,
    // version_range is declared per-skill in frontmatter, not by the module
    // card; the standalone /m page has no skill context, so leave it null.
    version_range: null,
    latest_version: card.version ?? null,
    license_spdx: card.spdx ?? null,
    license_url: spdxLicenseUrl(card.spdx),
    trust_tier: card.trust_tier ?? "unverified",
    trust_detail: card.sigstore?.signed
      ? `signed attestation${
          card.sigstore.certificate_subject
            ? ` (${card.sigstore.certificate_subject})`
            : ""
        }`
      : null,
    downloads_30d: card.deps_dev?.downloads_30d ?? null,
    scorecard: card.deps_dev?.scorecard_score ?? null,
    scorecard_url: null,
    osv_count: vulns.length,
    osv_top: vulns.slice(0, 3).map((v) => ({
      id: v.id ?? "",
      severity: v.severity,
      summary: v.summary ?? undefined,
    })),
    source_url: null,
    author: card.maintainer?.primary ?? null,
    homepage: null,
    programming_language: ecosystemLanguage(card.ecosystem ?? ecosystem),
    editorial: null,
    verified_at: card.verified_at ?? null,
  };
}

/**
 * fetchModuleVerification(ecosystem, package, version?) — the verification
 * card for /m/[ecosystem]/[package], mapped from the backend verify_module
 * { ok, card } envelope to the flat shape the page renders. ISR cache: 24h.
 *
 * Returns null when the backend is unavailable (no token, network error,
 * tool missing) or the package is unknown, which the page maps to 404.
 */
export async function fetchModuleVerification(
  ecosystem: string,
  pkg: string,
  version?: string,
): Promise<ModuleVerification | null> {
  const args: Record<string, unknown> = { ecosystem, package: pkg };
  if (version) args.version = version;

  const res = await callMcpTool<BackendVerifyResponse>(
    "verify_module",
    args,
    86400, // 24h
  );

  return mapBackendCard(res, ecosystem, pkg);
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
    // Backend unavailable or no callers → hide the rail (no empty state).
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
