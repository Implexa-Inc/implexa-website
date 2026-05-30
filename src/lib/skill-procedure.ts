// skill-procedure.ts — best-effort extractor of procedural steps from a
// SKILL.md body for the schema.org HowTo JSON-LD on detail pages.
//
// SKILL.md is unstructured markdown. There's no canonical "Steps" field,
// but the agentskills.io convention is well-established: most skills carry
// a heading like "## Procedure", "## How to use", "## Steps", or "## Usage"
// followed by a numbered or bulleted list. When we can identify that shape
// we emit a real HowTo. When we can't, we emit nothing — silent fallback
// beats invalid structured data (Google demotes pages with broken schema).
//
// Returns null if nothing actionable was found. The detail page reads that
// as "skip the HowTo graph node entirely".

const PROCEDURE_HEADINGS =
  /^#{1,4}\s+(steps?|procedure|how[ -]to(?:\s+use)?|usage|workflow|when to use|instructions|process)\b/im;

// Match a numbered ordered list item: "1. text", "1) text", "- 1. text", etc.
const ORDERED_ITEM = /^\s{0,3}(?:\d+[.)]|[-*+]\s+\d+[.)])\s+(.+)$/;
// Match a bullet list item: "- text", "* text", "+ text". We use this as
// the fallback when there's no numbered list under a procedure heading.
const BULLET_ITEM = /^\s{0,3}[-*+]\s+(.+)$/;

export type ExtractedStep = {
  name: string;
  description?: string;
};

export type ExtractedProcedure = {
  steps: ExtractedStep[];
  // Tools called out in a frontmatter `tools:` array, a `## Tools` section,
  // or inline backtick-mentioned MCP-tool-style snake_case names.
  tools: string[];
  // Best-effort ISO 8601 duration parsed from "Takes ~5 min", "5 minutes",
  // etc. Null when nothing parseable surfaces.
  totalTime: string | null;
};

/**
 * Split a markdown body into (heading, body) sections at H1/H2/H3 boundaries.
 * Sections preserve their own internal heading hierarchy when nested.
 */
function splitSections(md: string): Array<{ heading: string; body: string }> {
  const lines = md.split(/\r?\n/);
  const out: Array<{ heading: string; body: string }> = [];
  let currentHeading = "";
  let buf: string[] = [];
  for (const ln of lines) {
    const m = /^#{1,4}\s+(.+?)\s*#*\s*$/.exec(ln);
    if (m) {
      if (currentHeading || buf.length > 0) {
        out.push({ heading: currentHeading, body: buf.join("\n") });
      }
      currentHeading = m[1];
      buf = [];
    } else {
      buf.push(ln);
    }
  }
  if (currentHeading || buf.length > 0) {
    out.push({ heading: currentHeading, body: buf.join("\n") });
  }
  return out;
}

/**
 * Pull the first contiguous ordered or bulleted list from a body block.
 * Steps with a colon split into name + description (e.g.
 * "Connect: run `implexa: connect` and approve the OAuth flow").
 */
function extractListItems(body: string): ExtractedStep[] {
  const lines = body.split(/\r?\n/);
  const ordered: string[] = [];
  const bulleted: string[] = [];

  let inOrdered = false;
  for (const ln of lines) {
    const o = ORDERED_ITEM.exec(ln);
    if (o) {
      inOrdered = true;
      ordered.push(o[1].trim());
      continue;
    }
    if (inOrdered) {
      // Stop at the first blank line after an ordered list begins. Anything
      // after that belongs to the next prose block.
      if (ln.trim() === "") break;
      // Continuation lines (indented) get glued to the previous item.
      if (/^\s{2,}\S/.test(ln) && ordered.length > 0) {
        ordered[ordered.length - 1] += " " + ln.trim();
      }
    }
  }

  if (ordered.length === 0) {
    // Fall back to bullets only when the body block doesn't contain any
    // numbered items at all. We don't mix the two.
    let inBullet = false;
    for (const ln of lines) {
      const b = BULLET_ITEM.exec(ln);
      if (b) {
        inBullet = true;
        bulleted.push(b[1].trim());
        continue;
      }
      if (inBullet) {
        if (ln.trim() === "") break;
        if (/^\s{2,}\S/.test(ln) && bulleted.length > 0) {
          bulleted[bulleted.length - 1] += " " + ln.trim();
        }
      }
    }
  }

  const raw = ordered.length > 0 ? ordered : bulleted;
  return raw.map((line) => {
    // "Connect Salesforce: open settings and..." → name=Connect Salesforce,
    // description=open settings and... We split on the first colon when
    // (a) the prefix is <60 chars and (b) the suffix is substantive (>10).
    const m = /^([^:]{3,60}):\s+(.{10,})$/.exec(line);
    if (m) return { name: m[1].trim(), description: m[2].trim() };
    return { name: line };
  });
}

/**
 * Hunt for MCP-style tool references. Looks at:
 *   1. yaml frontmatter `tools: [...]` line (when present)
 *   2. A `## Tools` section's bullet list
 *   3. Inline backtick references that match the snake_case_tool naming
 *      we use across the implexa MCP catalog (get_skill_score etc.)
 *
 * Deduplicated, capped at 8 (longer lists are noise in JSON-LD).
 */
function extractTools(md: string, frontmatter?: Record<string, unknown>): string[] {
  const found = new Set<string>();

  if (frontmatter) {
    const t = frontmatter.tools;
    if (Array.isArray(t)) {
      for (const v of t) if (typeof v === "string") found.add(v.trim());
    } else if (typeof t === "string") {
      // Comma-separated string fallback ("get_skill_score, list_org_skills").
      for (const v of t.split(",")) {
        const s = v.trim();
        if (s) found.add(s);
      }
    }
  }

  const sections = splitSections(md);
  for (const s of sections) {
    if (/^tools?$/i.test(s.heading.trim())) {
      for (const item of extractListItems(s.body)) {
        // Strip backticks and trailing prose from "`tool_name` — what it does"
        const m = /^`?([a-z][a-z0-9_]+)`?(?:\s|:|—|-|,|$)/.exec(item.name);
        if (m) found.add(m[1]);
        else if (item.name.length < 40) found.add(item.name);
      }
    }
  }

  // Inline backtick mentions of snake_case identifiers ≥ 8 chars to avoid
  // matching every `foo` literal. Cap to the first dozen unique to keep
  // schema payload bounded.
  const inline = md.matchAll(/`([a-z][a-z0-9_]{6,})`/g);
  for (const m of inline) {
    if (m[1].includes("_")) found.add(m[1]);
    if (found.size >= 20) break;
  }

  return Array.from(found).slice(0, 8);
}

/**
 * Best-effort ISO 8601 duration from prose. Recognizes "5 min", "5 minutes",
 * "~2 hours", "30s", "1h30m". Returns null when nothing matches.
 */
function extractTotalTime(md: string): string | null {
  // Pull from a frontmatter-like `Total time:` or `Takes: ~5 min` line first,
  // since those are the canonical signal in well-formed SKILL.md.
  const explicit =
    /(?:total[\s-]?time|takes|duration|estimated[\s-]?time)[:\s]+(?:~|about\s+)?(\d+)\s*(s|sec|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours)\b/i.exec(
      md,
    );
  if (explicit) {
    const n = Number(explicit[1]);
    const unit = explicit[2].toLowerCase();
    if (Number.isFinite(n) && n > 0) {
      if (unit.startsWith("s")) return `PT${n}S`;
      if (unit.startsWith("m") && !unit.startsWith("min")) return `PT${n}M`;
      if (unit.startsWith("min")) return `PT${n}M`;
      if (unit.startsWith("m")) return `PT${n}M`;
      if (unit.startsWith("h")) return `PT${n}H`;
    }
  }
  return null;
}

/**
 * Top-level entry. Pass the raw SKILL.md body (markdown, no HTML). Returns
 * the procedure block if at least 2 steps are discoverable; otherwise null.
 *
 * Strategy:
 *   1. Find a section whose heading matches PROCEDURE_HEADINGS, prefer it.
 *   2. If nothing matches, fall back to the first numbered list anywhere
 *      in the body (some skills go straight into "1. ... 2. ...").
 *   3. Always also pull tools + totalTime regardless of how steps surfaced.
 */
export function extractProcedure(
  markdown: string,
  frontmatter?: Record<string, unknown>,
): ExtractedProcedure | null {
  if (typeof markdown !== "string" || markdown.length < 30) return null;

  const sections = splitSections(markdown);
  let steps: ExtractedStep[] = [];

  for (const s of sections) {
    if (PROCEDURE_HEADINGS.test(`## ${s.heading}`)) {
      const list = extractListItems(s.body);
      if (list.length >= 2) {
        steps = list;
        break;
      }
    }
  }

  if (steps.length === 0) {
    // Fallback: first numbered list anywhere in the doc.
    const list = extractListItems(markdown);
    if (list.length >= 2 && list.every((l) => l.name.length > 0)) {
      steps = list;
    }
  }

  if (steps.length < 2) return null;

  // Cap at 12 steps. Anything longer is usually a nested checklist that
  // doesn't render well as HowTo and bloats the JSON-LD payload.
  return {
    steps: steps.slice(0, 12),
    tools: extractTools(markdown, frontmatter),
    totalTime: extractTotalTime(markdown),
  };
}
