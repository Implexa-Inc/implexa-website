---
title: "Claude Skills examples: 10 real SKILL.md files to copy"
slug: "claude-skills-examples"
description: "Claude Skills examples you can copy: 10 real SKILL.md files for PR review, sales prep, standups, changelogs, and invoices, each with the full instruction pack."
publishedAt: "2026-06-03"
tags: ["claude-skills", "SKILL.md", "examples", "anthropic", "agent-skills"]
---

# Claude Skills examples

Here are 10 Claude Skills examples you can copy, paste, and adapt today. Each one is a complete `SKILL.md` file, not a description of a tool to install, so you can read exactly how it works and change it to fit your stack.

Most "best Claude Skills" roundups list third-party skills by name and tell you what they do in prose. This page does the opposite. Every example below is the actual instruction pack, organized the way Claude reads it, so you learn the format while you grab something useful. If you are new to the format, start with [what are Claude Skills](/blog/what-are-claude-skills) and come back.

## What makes a good Claude Skill example?

A good Claude Skill example is a complete `SKILL.md` with a sharp trigger, named tools, and a fixed output, not just a saved prompt. The strong ones cover six components: intent, inputs, procedure, decision points, an output contract, and an outcome signal. The two most examples skip are decision points and the outcome signal, and those are the two that keep a skill from drifting when inputs change. The [pillar guide](/claude-skills) breaks down all six.

Read each example for the `description` line first. That single field is what triggers the skill, so it has to be specific. Vague descriptions never fire.

## Example 1: Pull request review

This skill runs a fixed review checklist against a diff and returns findings grouped by severity, so reviews stay consistent no matter who opens the PR.

    ---
    name: review-pr
    description: Review a pull request diff. Check correctness, tests,
                 and security, return findings grouped by severity.
    ---

    ## When to use
    When the user shares a diff, a PR link, or asks for a code review.

    ## Procedure
    1. Read the full diff
    2. Check correctness, missing tests, and obvious security issues
    3. Group findings as Blocker, Should-fix, or Nit
    4. For each finding, give file:line and a one-line fix

    ## Output
    **Verdict:** {approve / request changes}
    **Blockers:** {list or "none"}
    **Should-fix:** {list}
    **Nits:** {list}

## Example 2: Systematic debugging

This skill forces Claude to debug like a senior engineer: name the root cause and hypotheses first, then the fix, instead of jumping to a patch.

    ---
    name: debug-systematically
    description: Debug an error or failing behavior. State the root cause
                 and hypotheses before proposing any code change.
    ---

    ## Procedure
    1. Restate the observed failure and the expected behavior
    2. List up to 3 hypotheses, ranked by likelihood
    3. Name the single cheapest check that would confirm the top one
    4. Only then propose a fix, with the reasoning

    ## Output
    **Failure:** {what breaks}
    **Most likely cause:** {one sentence}
    **Confirm by:** {the cheap check}
    **Fix:** {the change}

## Example 3: Flaky test triage

This skill takes a failing CI run, decides whether the failure is flaky or real, and either quarantines the test or escalates it, so a red build does not block the team for the wrong reason.

    ---
    name: triage-flaky-test
    description: Triage a failing test. Decide flaky vs real, then
                 quarantine the flaky one or file a real-bug issue.
    ---

    ## Inputs
    - The failing test name and its CI log

    ## Decision points
    - Reproduces locally on retry: treat as real, file an issue
    - Passes on retry and touches time, network, or order: flaky

    ## Procedure
    1. Read the log, classify flaky vs real
    2. If flaky, add the skip marker and link a tracking issue
    3. If real, open an issue with the log excerpt and suspected cause

## Example 4: Sales call prep

This skill pulls CRM activity and recent news for a named account and returns a one-page brief, so you walk into every call with the same prep instead of scrambling.

    ---
    name: prep-sales-call
    description: Prep for a sales call. Pull CRM activity, recent news,
                 and the last touchpoint for the named account.
    ---

    ## Inputs
    - Company name or domain
    - Meeting date (defaults to next 7 days)

    ## Procedure
    1. Call crm_query for the account, pull last 5 activities
    2. Call news_search for the company, last 30 days
    3. Format with the template below

    ## Output
    **Account:** {name}
    **Last touch:** {date, channel, who}
    **Recent news:** {3 bullets}
    **Recommended angle:** {one sentence}

## Example 5: Cold email rewrite

This skill rewrites a draft cold email into a tighter version with one ask and a clear subject line, so outreach stops reading like a template.

    ---
    name: rewrite-cold-email
    description: Rewrite a cold email draft. Cut to one ask, add a
                 specific subject line, keep it under 90 words.
    ---

    ## Procedure
    1. Identify the single ask, drop every other request
    2. Open with a line specific to the recipient, not a generic hook
    3. Keep the body under 90 words, one short paragraph plus the ask
    4. Propose 2 subject lines under 6 words each

    ## Output
    **Subject options:** {2 lines}
    **Rewrite:** {the email}
    **Cut:** {what you removed and why}

## Example 6: Weekly status report

This skill gathers the week's shipped work from your tracker and returns a three-section summary in the same layout every time, so the update writes itself.

    ---
    name: weekly-status
    description: Write the weekly status report. Pull shipped, in-progress,
                 and blocked items from the tracker, format in 3 sections.
    ---

    ## Procedure
    1. Query the tracker for items closed in the last 7 days
    2. Query items still open and assigned
    3. Flag anything blocked or past its due date

    ## Output
    **Shipped:** {bullets}
    **In progress:** {bullets}
    **Blocked or at risk:** {bullets, with owner}

## Example 7: Incident write-up

This skill turns an incident channel into a timeline, root cause, and action items in your team's template, so the postmortem is consistent and fast.

    ---
    name: incident-writeup
    description: Write an incident postmortem. Build a timeline, root cause,
                 and action items from the incident channel.
    ---

    ## Procedure
    1. Read the channel, build a timestamped timeline
    2. Identify the root cause and the trigger
    3. List action items, each with an owner

    ## Output
    **Summary:** {one paragraph}
    **Timeline:** {timestamped events}
    **Root cause:** {what and why}
    **Action items:** {owner, task, due}

## Example 8: Invoice and receipt organizer

This skill parses a receipt or invoice, standardizes the filename, and logs it into your accounting format, so expenses stop piling up unnamed in a folder.

    ---
    name: organize-invoice
    description: Parse a receipt or invoice. Standardize the filename and
                 log vendor, date, amount, and category to the ledger.
    ---

    ## Procedure
    1. Read the file, extract vendor, date, total, and currency
    2. Rename to YYYY-MM-DD_vendor_amount
    3. Append a row to the ledger with a best-guess category

    ## Output
    **Filename:** {standardized name}
    **Logged:** {vendor, date, amount, category}
    **Needs review:** {anything ambiguous}

## Example 9: Changelog from commits

This skill turns a range of git commits into release notes grouped by type, so shipping a version does not mean hand-writing the changelog.

    ---
    name: changelog-from-commits
    description: Write release notes from git commits. Group by feature,
                 fix, and breaking change, skip noise like merge commits.
    ---

    ## Inputs
    - A commit range or the latest tag to HEAD

    ## Procedure
    1. Read the commit log for the range
    2. Drop merge commits and pure chores
    3. Group the rest into Features, Fixes, Breaking changes
    4. Rewrite each line in user-facing language

    ## Output
    **Version:** {tag}
    **Features:** {bullets}
    **Fixes:** {bullets}
    **Breaking:** {bullets or "none"}

## Example 10: Meeting notes to action items

This skill reads raw meeting notes and extracts only the decisions and action items, each with an owner and a due date, so nothing agreed in the room gets lost.

    ---
    name: notes-to-actions
    description: Extract action items from meeting notes. Return decisions
                 and tasks only, each with an owner and a due date.
    ---

    ## Procedure
    1. Read the notes, separate discussion from decisions
    2. Pull every committed action, infer the owner from context
    3. Flag any action with no clear owner

    ## Output
    **Decisions:** {bullets}
    **Action items:** {owner, task, due}
    **Unassigned:** {actions missing an owner}

## How to use these examples

Copy any block above into `~/.claude/skills/<name>/SKILL.md`, then restart Claude Code so the auto-loader picks it up. Edit the `description` to match how you actually phrase the request, swap the tool names for the ones you use, and run it once on a real task. If the output is close but not right, tweak the output contract until it holds.

Two of these examples, the flaky-test triage and the invoice organizer, include a decision-points section. That is the part most online examples skip, and it is what lets the skill make the right call when the input varies instead of asking you every time.

If hand-writing the file feels like a chore, you can demonstrate the workflow once instead. Run [implexa](https://implexa.ai) and `/implexa:record`, do the task normally, and answer a few short questions about your decisions and output format. The skill gets authored from your real behavior, including the decision rationale these examples encode by hand. The full walkthrough is in [how to create a Claude Skill](/blog/how-to-create-a-claude-skill).

## FAQ

### Where can I find more Claude Skills examples?

Three places: Anthropic's own bundled skills and docs, open-source GitHub collections of community skills, and skill-graph hosts that add sharing and outcome tracking. The bundled skills are the canonical reference for the `SKILL.md` spec.

### Do these example skills work in Cursor or Codex?

Mostly yes. The `SKILL.md` format is portable, and several coding agents read it, though the auto-trigger behavior varies by tool. The full cross-vendor walkthrough is in [use Claude Skills in Cursor, Codex, and Gemini](/blog/use-claude-skills-in-cursor-codex-gemini).

### Do I need to write code to use these examples?

No. Every example is plain markdown. The procedure names the tools to call, but Claude does the calling. You only edit text.

### How many of these should I install at once?

Install as many as you genuinely reuse, but keep each description specific so they do not compete for the same request. The reasoning is in [how many Claude Skills is too many](/blog/how-many-claude-skills-is-too-many).

### What is the difference between these examples and a saved prompt?

Each example triggers itself from its description, holds a fixed output format, and names the tools it calls. A saved prompt does none of those. That gap is covered in [what are Claude Skills](/blog/what-are-claude-skills).

## Next reads

- **[What are Claude Skills?](/blog/what-are-claude-skills)**: the format, the 6 components, and skill vs prompt.
- **[How to create a Claude Skill (step-by-step)](/blog/how-to-create-a-claude-skill)**: the 7-step build tutorial.
- **[What are Claude Skills, and the right way to build them](/claude-skills)**: the full pillar guide.
- **[What is a skill graph?](/resources/what-is-a-skill-graph)**: the structure that connects many skills together.
