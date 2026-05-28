// Parent-repo identifier extraction.
//
// Why this exists
// ───────────────
// Many sources organize their skills as files inside a single github repo
// (or a logical equivalent). skills.sh stores the canonical SKILL.md at
// `www.skills.sh/<author>/<repo>/<slug>`. Github skills come from
// `github.com/<owner>/<repo>/blob/...`. Smithery uses one server id per
// MCP server which is itself a multi-tool unit.
//
// When we display per-row install_count or star_count we're showing the
// PARENT REPO's count, since the upstream platform only exposes that
// granularity. Summing those counts across skills the way we used to was
// off by ~50x for prolific authors (one repo's 13,500 stars × 50 child
// skills = 675,613 displayed).
//
// `parentRepoKey(source, source_url)` returns a deterministic id for the
// parent unit, or null if we can't determine one (treat the row as its
// own parent). Callers can use this to dedupe before summing.
//
// Per-source URL patterns observed in production:
//   skills.sh   www.skills.sh/<author>/<repo>/<slug>   → <author>/<repo>
//   anthropic   github.com/<owner>/<repo>/blob/main/skills/<slug>/SKILL.md
//                                                       → <owner>/<repo>
//   smithery    smithery.ai/server/<id>                → <id>
//   clawhub     clawhub.ai/skills/<slug>               → null (each skill
//                                                          is its own
//                                                          entity, no repo
//                                                          grouping)
//   agentskills agentskills.io/<various>               → null
//   implexa     local / curated                        → null
//
// As new sources or URL shapes appear, extend the switch. Keep the
// function pure + cheap (it gets called per-row on potentially large
// lists).

export function parentRepoKey(
  source: string,
  sourceUrl: string | null | undefined,
): string | null {
  if (!sourceUrl) return null;

  switch (source) {
    case "skills.sh": {
      // Two URL shapes seen: with and without the `www.` prefix.
      // Capture <author>/<repo> after the host.
      const m = sourceUrl.match(/skills\.sh\/([^\/?#]+)\/([^\/?#]+)/i);
      return m ? `${m[1]}/${m[2]}` : null;
    }

    case "anthropic": {
      // Anthropic skills live in `anthropics/skills/blob/main/...`.
      // Extract <owner>/<repo>.
      const m = sourceUrl.match(/github\.com\/([^\/?#]+)\/([^\/?#]+)/i);
      return m ? `${m[1]}/${m[2]}` : null;
    }

    case "smithery": {
      // smithery.ai/server/<id> is the parent unit (servers, not files).
      const m = sourceUrl.match(/smithery\.ai\/server\/([^\/?#]+)/i);
      return m ? m[1] : null;
    }

    default: {
      // Generic github URL detection (covers cases where a non-github
      // source happens to have a github source_url, or future github
      // source).
      const gh = sourceUrl.match(/github\.com\/([^\/?#]+)\/([^\/?#]+)/i);
      if (gh) return `${gh[1]}/${gh[2]}`;
      // For clawhub, agentskills, implexa, and any other source where
      // each row is its own parent unit, return null. The caller treats
      // null as "this row counts on its own."
      return null;
    }
  }
}

// Sum repo-level metrics correctly: at most one row per parent repo
// contributes. Rows with no parent_repo_key (clawhub, agentskills, etc)
// count as individual units (one row = one repo for accounting).
//
// Returns { stars, installs, repoCount } where repoCount is the number
// of distinct parent units across all rows.
export function aggregateRepoMetrics<
  T extends {
    source: string;
    source_url: string | null;
    star_count: number | null;
    install_count: number | null;
  },
>(rows: T[]): { stars: number; installs: number; repoCount: number } {
  const repoMap = new Map<
    string,
    { stars: number; installs: number }
  >();
  let standalone = 0; // rows with no parent_repo_key, each counts as its own unit
  let standaloneStars = 0;
  let standaloneInstalls = 0;

  for (const row of rows) {
    const key = parentRepoKey(row.source, row.source_url);
    if (key === null) {
      // No parent repo grouping: count this row independently.
      standalone += 1;
      standaloneStars += row.star_count ?? 0;
      standaloneInstalls += row.install_count ?? 0;
      continue;
    }
    if (repoMap.has(key)) continue; // already counted this repo
    repoMap.set(key, {
      stars: row.star_count ?? 0,
      installs: row.install_count ?? 0,
    });
  }

  let stars = standaloneStars;
  let installs = standaloneInstalls;
  for (const { stars: s, installs: i } of repoMap.values()) {
    stars += s;
    installs += i;
  }

  return {
    stars,
    installs,
    repoCount: repoMap.size + standalone,
  };
}
