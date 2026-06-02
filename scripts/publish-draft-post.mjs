#!/usr/bin/env node
// publish-draft-post.mjs
//
// Takes a generated blog post (a markdown file with YAML frontmatter), validates
// it against the same contract content/blog/<slug>.md must satisfy at build time,
// and opens a GitHub PR adding it under content/blog/. Never writes to main
// directly: the change always lands as a PR, and the merge triggers the Vercel
// deploy. This is the publish primitive the scheduled SEO/AEO workflow calls.
//
// With --merge, the PR is auto-merged ONLY after every PR check passes (the
// Vercel build/deploy among them). If any check fails or checks do not finish
// in time, the PR is left OPEN and the script exits 3. This is the mechanical
// backstop: --merge can never publish onto a broken build.
//
// usage:
//   node scripts/publish-draft-post.mjs <path-to-draft.md> [--dry-run] [--merge] [--base main]
//
// exit codes:
//   0  validated (dry-run), PR opened, or PR opened + merged
//   1  validation failed (NO git operation performed)
//   2  git/gh operation failed
//   3  PR opened but NOT merged: a check failed or did not complete (--merge only)
//
// validation gates (all must pass before any git op):
//   - required frontmatter: title, slug, description, publishedAt (non-empty strings)
//   - slug is kebab-case and matches the frontmatter slug
//   - no em-dash anywhere (the house voice rule, enforced mechanically)
//   - body is at least MIN_WORDS words (no thin-content stubs)
//   - markdown parses cleanly
//   - content/blog/<slug>.md does not already exist (no clobber)

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

const MIN_WORDS = 400;
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_DIR = path.join(REPO_ROOT, "content", "blog");
const REQUIRED = ["title", "slug", "description", "publishedAt"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(msg) {
  console.error(`[publish] VALIDATION FAILED: ${msg}`);
  process.exit(1);
}

function git(args, cwd = REPO_ROOT) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function gh(args, cwd = REPO_ROOT) {
  return execFileSync("gh", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

// gh variant that never throws: returns { status, stdout, stderr } so callers
// can inspect a non-zero exit (e.g. `gh pr checks` exits non-zero when a check
// is failing) instead of blowing up.
function ghTry(args, cwd = REPO_ROOT) {
  const r = spawnSync("gh", args, { cwd, encoding: "utf8" });
  return {
    status: r.status,
    stdout: (r.stdout || "").trim(),
    stderr: (r.stderr || "").trim(),
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Poll the PR's checks until they all settle, then decide whether to merge.
// Returns "pass" (all checks green / skipped), "fail" (at least one failing),
// or "timeout" (still pending past the deadline). Never merges on anything but
// a clean "pass" — the deploy build is one of these checks, so this refuses to
// publish onto a broken main.
async function pollChecks(branch, cwd, { deadlineMs = 8 * 60 * 1000, intervalMs = 15 * 1000 } = {}) {
  const deadline = Date.now() + deadlineMs;
  for (;;) {
    const r = ghTry(["pr", "checks", branch, "--json", "name,state,bucket"], cwd);
    let checks = [];
    try {
      checks = JSON.parse(r.stdout || "[]");
    } catch {
      checks = [];
    }
    const failed = checks.filter((c) => c.bucket === "fail" || c.bucket === "cancel");
    if (failed.length) {
      return { decision: "fail", failed: failed.map((c) => c.name) };
    }
    const pending = checks.filter((c) => c.bucket === "pending");
    if (checks.length > 0 && pending.length === 0) {
      return { decision: "pass", passed: checks.map((c) => c.name) };
    }
    if (Date.now() >= deadline) {
      return { decision: "timeout", pending: pending.map((c) => c.name) };
    }
    await sleep(intervalMs);
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const autoMerge = argv.includes("--merge");
  const baseIdx = argv.indexOf("--base");
  const base = baseIdx !== -1 ? argv[baseIdx + 1] : "main";
  const draftPath = argv.find((a) => !a.startsWith("--") && a !== base);
  if (!draftPath) fail("no draft file path given. usage: publish-draft-post.mjs <draft.md> [--dry-run]");

  let raw;
  try {
    raw = await fs.readFile(draftPath, "utf8");
  } catch {
    fail(`cannot read draft file: ${draftPath}`);
  }

  // gate: no em-dash anywhere (title, description, body). house rule.
  const emDash = raw.match(/[—–]/);
  if (emDash) {
    const idx = raw.indexOf(emDash[0]);
    const around = raw.slice(Math.max(0, idx - 40), idx + 40).replace(/\n/g, " ");
    fail(`em-dash found (house voice rule). near: "...${around}...". use a comma, colon, period, or hyphen.`);
  }

  let parsed;
  try {
    parsed = matter(raw);
  } catch (e) {
    fail(`frontmatter does not parse: ${e.message}`);
  }
  const fm = parsed.data || {};

  for (const key of REQUIRED) {
    if (typeof fm[key] !== "string" || fm[key].length === 0) {
      fail(`missing or empty frontmatter field "${key}"`);
    }
  }
  if (!SLUG_RE.test(fm.slug)) fail(`slug "${fm.slug}" is not kebab-case (^[a-z0-9-]+$)`);
  if (fm.tags !== undefined && !Array.isArray(fm.tags)) fail(`frontmatter "tags" must be a list if present`);
  if (!/^\d{4}-\d{2}-\d{2}/.test(fm.publishedAt)) fail(`publishedAt "${fm.publishedAt}" must start YYYY-MM-DD`);

  const body = parsed.content.trim();
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < MIN_WORDS) fail(`body is ${words} words, under the ${MIN_WORDS}-word floor (no thin-content stubs)`);
  try {
    marked.parse(body);
  } catch (e) {
    fail(`markdown body does not render: ${e.message}`);
  }

  const slug = fm.slug;
  const target = path.join(BLOG_DIR, `${slug}.md`);
  try {
    await fs.access(target);
    fail(`content/blog/${slug}.md already exists. pick a different slug or update the existing post by hand.`);
  } catch {
    // good: does not exist
  }

  console.log(`[publish] validated: "${fm.title}" -> content/blog/${slug}.md (${words} words)`);

  if (dryRun) {
    console.log(`[publish] dry-run: would open a PR adding content/blog/${slug}.md against ${base}. no git op performed.`);
    return;
  }

  // ---- git ops (only after every gate passed) ----
  // Use an isolated worktree branched off origin/<base> so the main checkout
  // and any uncommitted work in it are never touched. The PR is a clean
  // single-file diff regardless of local repo state. Matches the repo's
  // worktree-for-parallel-branches convention.
  const branch = `auto/blog-${slug}`;
  const wt = path.join(os.tmpdir(), `implexa-publish-${slug}-${Date.now()}`);
  let wtAdded = false;
  try {
    git(["fetch", "origin", base, "--quiet"]);
    git(["worktree", "add", "-B", branch, wt, `origin/${base}`, "--quiet"]);
    wtAdded = true;
    const wtTarget = path.join(wt, "content", "blog", `${slug}.md`);
    await fs.mkdir(path.dirname(wtTarget), { recursive: true });
    await fs.writeFile(wtTarget, raw.endsWith("\n") ? raw : `${raw}\n`, "utf8");
    git(["add", "--", `content/blog/${slug}.md`], wt);
    git(["commit", "-q", "-m", `content(blog): ${fm.title} (auto-generated draft)\n\nfrom the scheduled SEO/AEO workflow. merging deploys it live via Vercel.\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`], wt);
    git(["push", "-u", "origin", branch, "--force-with-lease", "--quiet"], wt);
    const prUrl = gh([
      "pr", "create",
      "--base", base,
      "--head", branch,
      "--title", `blog: ${fm.title}`,
      "--body", `Auto-generated blog draft from the scheduled SEO/AEO workflow.\n\nMerging this PR publishes the post live on implexa.ai via Vercel.${autoMerge ? " This run was launched with --merge: it auto-merges only after every check (the Vercel build among them) passes." : ""}\n\n- slug: \`${slug}\`\n- words: ${words}\n- target: \`content/blog/${slug}.md\`\n\nIf the draft is not good enough to ship, close the PR (nothing goes live).`,
    ], wt);
    console.log(`[publish] PR opened: ${prUrl}`);

    if (autoMerge) {
      console.log(`[publish] --merge: polling checks; will merge only if every check passes...`);
      const result = await pollChecks(branch, wt);
      if (result.decision === "pass") {
        // No --delete-branch: the branch is checked out in this worktree, so gh
        // cannot delete the local ref and would error on an otherwise-good merge.
        // Merge first, then best-effort delete the remote branch (never throws).
        gh(["pr", "merge", branch, "--squash"], wt);
        ghTry(["api", "-X", "DELETE", `repos/{owner}/{repo}/git/refs/heads/${branch}`], wt);
        console.log(`[publish] --merge: all checks passed (${result.passed.join(", ")}). merged + deployed: ${prUrl}`);
      } else if (result.decision === "fail") {
        console.error(`[publish] --merge: NOT merging, failing checks: ${result.failed.join(", ")}. PR left open for a human: ${prUrl}`);
        process.exitCode = 3;
      } else {
        console.error(`[publish] --merge: checks did not finish in time (still pending: ${result.pending.join(", ") || "unknown"}). PR left open: ${prUrl}`);
        process.exitCode = 3;
      }
    }
  } catch (e) {
    console.error(`[publish] git/gh step failed: ${e.message}`);
    process.exitCode = 2;
  } finally {
    if (wtAdded) {
      try {
        git(["worktree", "remove", wt, "--force"]);
      } catch {
        /* best effort cleanup */
      }
    }
  }
}

main().catch((e) => {
  console.error(`[publish] unexpected error: ${e.message}`);
  process.exit(2);
});
