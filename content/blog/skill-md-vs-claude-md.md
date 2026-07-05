---
title: "SKILL.md vs CLAUDE.md: what each file does in Claude Code"
slug: "skill-md-vs-claude-md"
description: "SKILL.md vs CLAUDE.md in Claude Code: CLAUDE.md is always-on project memory, SKILL.md is an on-demand capability Claude loads only when a task matches it."
publishedAt: "2026-07-05"
tags: ["claude-code", "SKILL.md", "claude-md", "claude-skills", "comparison"]
---

# SKILL.md vs CLAUDE.md

They look like the same thing. Both are Markdown, both sit in your repo, both exist to feed Claude Code context it would otherwise forget between sessions. So people drop everything into whichever one they made first, then wonder why the context window is full and Claude still ignores half of it.

The two files are loaded on opposite principles, and getting the split right is the difference between a lean setup Claude follows and a bloated one it skims. Here is the short answer, what each file really is, a decision table for your situation, and the part that trips everyone up: what to do once the answer is "make it a skill."

## The one-sentence answer

CLAUDE.md is always-on project memory that loads in full at the start of every session, while SKILL.md is an on-demand capability Claude loads only when a task matches its description. Reach for CLAUDE.md when something is true for all your work in a repo. Reach for SKILL.md when you have a specific, repeatable procedure that only applies some of the time.

Put another way: CLAUDE.md tells Claude how your project works, every session. A [skill](/blog/what-are-claude-skills) tells Claude how to do one job, when that job comes up.

## What CLAUDE.md actually is

CLAUDE.md is a plain Markdown file you write that Claude Code reads into context at the start of every conversation. It holds the standing instructions you would otherwise retype each session: your build and test commands, code style, project layout, the "always do X in this repo" rules. You own it, and it says the same thing every time until you change it.

It is hierarchical. Claude walks up the directory tree and concatenates every `CLAUDE.md` it finds, from an org-wide managed policy down through `~/.claude/CLAUDE.md` for your personal preferences to the project `./CLAUDE.md` you check into git. A file can pull in others with `@path/to/file` imports, nested up to four hops deep, which is how a repo that already keeps its instructions in [AGENTS.md](/blog/agents-md) can make CLAUDE.md a one-line `@AGENTS.md` wrapper instead of maintaining two copies.

The thing to internalize is the cost. Because CLAUDE.md loads in full on every session, every line competes for the context window whether this session needs it or not. That is why the standing guidance is to keep each CLAUDE.md under roughly 200 lines. The [full memory guide](/blog/claude-code-memory) covers the load order and import rules in depth.

## What SKILL.md actually is

SKILL.md is the one required file in a skill directory, and it loads on demand rather than up front. Claude reads the full file only when an incoming task matches the trigger description at the top, runs the steps inside, and returns the result in the shape you specified.

The file opens with YAML frontmatter holding a `name` and a `description`, then a body with the procedure. That description is doing real work. It is the trigger Claude reads to decide whether this skill is relevant right now, so a vague one gets the skill ignored and a sharp one gets it fired at the right moment.

```markdown
---
name: weekly-revenue-digest
description: Summarize last week's revenue from the finance database.
             Use when someone asks for the weekly revenue digest.
---

# Weekly revenue digest

## Procedure
1. Query bookings, expansion, and churn for the last 7 days
2. Compare each against the prior 7 days
3. Flag any line that moved more than 15 percent
4. Format using the output contract below
```

A skill can also carry more than prose. Drop a script next to `SKILL.md`, have the skill call it, and a step that should run identically every time actually does. Skills live in `.claude/skills/` in your project or `~/.claude/skills/` for personal ones, and the same `SKILL.md` runs unchanged in Codex and Cursor because it is just Markdown with a trigger. The [step-by-step guide](/blog/how-to-create-a-claude-skill) walks through building one.

## The real difference: always-on versus on-demand

The distinction that matters is when each file enters the context window. CLAUDE.md is loaded every session, in full, before Claude has read a single line of your code. SKILL.md uses progressive disclosure: only its name and description sit in context by default, and the rest of the file arrives only when a task actually matches.

That one design choice decides where things belong. Anything Claude needs on every task earns its place in CLAUDE.md. Anything Claude needs occasionally is cheaper as a skill, because forty skills you rarely touch cost almost nothing until one is triggered, while forty paragraphs in CLAUDE.md cost you context on every single request. A release checklist you run twice a month has no business sitting in memory the other twenty-eight days.

Neither file is enforced, which is worth saying plainly. Both shape what Claude tends to do, and neither guarantees it. If something must happen at a fixed moment, like a check before every commit, that is a [hook](/blog/claude-code-hooks), not a memory file and not a skill.

## The decision table

Match your situation to the row.

| Your situation | Put it in | Why |
|---|---|---|
| A rule true for all work in this repo (build command, code style, layout) | CLAUDE.md | Always-on facts belong in always-on memory |
| A repeatable multi-step procedure that only applies sometimes | SKILL.md | On-demand loading keeps it out of context until needed |
| A step that must run identically every time | SKILL.md with a bundled script | Code in the skill removes drift a prompt cannot |
| Instructions you want to reuse across projects or share with a team | SKILL.md | A skill is portable; CLAUDE.md is scoped to its directory |
| The same guidance for Claude Code, Codex, and Cursor | SKILL.md | `SKILL.md` is read by all three; CLAUDE.md is Claude-only |
| Something that must happen no matter what Claude decides | Neither, use a [hook](/blog/claude-code-hooks) | Memory and skills shape behavior; hooks enforce it |

If you remember one line: always-on and project-wide points to CLAUDE.md, occasional and procedural points to SKILL.md.

## Can you use both together

Yes, and a healthy setup usually does. CLAUDE.md carries the always-true facts about your project, and skills carry the procedures that sit on top of those facts. They do not compete. They cover different halves.

A realistic shape looks like this. Your CLAUDE.md tells Claude that this is a pnpm monorepo, tests run with `pnpm test`, and API routes follow a house pattern. A `release-checklist` skill, triggered only when you say you are cutting a release, encodes the eight-step release procedure and calls a script to bump versions. The always-on file sets the ground rules once. The skill runs the specific job when the job appears. The mistake is collapsing both into CLAUDE.md, which is how a memory file grows into a wall of text nobody, Claude included, reads all of.

## The part nobody covers: once it is a skill, which skill?

Say you have made the call. Your instruction is really a procedure, so it wants to be a skill rather than a line in CLAUDE.md. Now you hit the wall the tutorials skip.

There are tens of thousands of skills scattered across Anthropic, the community marketplaces, GitHub, and a handful of vendor directories, and quality is wildly uneven. Plenty are a saved prompt wearing a `SKILL.md` costume. You cannot tell from a name whether one is sharp or whether it will quietly drift the first time an input changes. That discovery-and-trust problem is the one implexa works on: a [skill graph](/resources/what-is-a-skill-graph) indexes skills across every vendor, and [SkillRank](/resources/skill-rank) scores them on real outcomes so you install the one that works instead of the one that ranked first alphabetically. Deciding SKILL.md over CLAUDE.md is the easy half. Finding the right skill is where the week goes.

## Frequently asked questions

### Is SKILL.md the same as CLAUDE.md?

No. CLAUDE.md is always-on memory that loads in full every session and holds your standing project instructions. SKILL.md defines a single skill that loads on demand, only when a task matches its description. One is background context; the other is a triggerable capability.

### Can a skill and CLAUDE.md conflict?

Rarely, because they act at different moments. CLAUDE.md sets the always-on ground rules for the repo, and a skill runs a specific procedure when triggered. If a skill's steps contradict a CLAUDE.md rule, the skill's instructions govern the task it was invoked for while CLAUDE.md keeps governing everything else.

### Does CLAUDE.md work in Codex and Cursor?

No. CLAUDE.md is specific to Claude Code. Other tools read [AGENTS.md](/blog/agents-md) instead, which is why many repos make CLAUDE.md a one-line `@AGENTS.md` import. `SKILL.md`, by contrast, is portable and runs across Claude Code, Codex, and Cursor unchanged.

### When should I move something out of CLAUDE.md into a skill?

When the instruction is really a multi-step workflow you use occasionally rather than an always-true fact. A PR reviewer, a changelog writer, a release checklist: each is a procedure that only applies sometimes, so each belongs in a [skill](/blog/claude-code-skills) that loads when relevant instead of taxing context on every request.

### Where do these files live?

CLAUDE.md sits at your project root (`./CLAUDE.md` or `./.claude/CLAUDE.md`), with optional versions at `~/.claude/CLAUDE.md` for personal preferences and org-managed paths for policy. A skill lives in its own folder at `.claude/skills/<skill-name>/SKILL.md` in the project, or under `~/.claude/skills/` for a personal one.

---

The short version: CLAUDE.md is what Claude should always know, SKILL.md is what Claude should sometimes do, and the split follows one rule about when each file loads. Start at the [Claude Skills pillar](/claude-skills) for the full map, or read the [memory guide](/blog/claude-code-memory) if CLAUDE.md is where your real questions are.
