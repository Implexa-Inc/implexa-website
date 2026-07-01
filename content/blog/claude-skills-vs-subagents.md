---
title: "Claude skills vs subagents: which should you use?"
slug: "claude-skills-vs-subagents"
description: "Claude skills vs subagents, settled: what each one is, a decision table for your task, and how to run them together, with real SKILL.md and subagent examples."
publishedAt: "2026-07-01"
tags: ["claude-skills", "subagents", "claude-code", "comparison"]
---

# Claude skills vs subagents

You reach for a skill when the agent you already have keeps doing a task a slightly different way every time. You reach for a subagent when you want that task handed to a separate worker so it never crowds your main session. One is instruction, the other is delegation, and most real setups end up using both.

That is the whole distinction. The rest of this page is what you need once you are actually deciding: what each one is under the hood, a table that maps your situation to the right choice, a working example of the two running together, and the problem that shows up the moment you commit to skills.

If you have never written either, [how to build an AI agent with Claude](/blog/build-an-ai-agent-with-claude) sits a level below this and is the better first stop.

## The one-sentence answer

A skill changes how the current agent behaves; a subagent adds a new agent to do the work somewhere else. Skills load a procedure into the context you are already in. Subagents spin up a fresh Claude with its own context window, its own system prompt, and usually a trimmed set of tools, do the job in isolation, and hand back only the result. Pick a skill for consistency. Pick a subagent for isolation. When a job needs both, and a surprising amount of work does, you nest a skill inside a subagent.

## What a Claude skill actually is

A skill is a folder whose one required file is `SKILL.md`. Anthropic calls these Agent Skills, and the format is deliberately boring: a trigger description, a procedure, and the shape of the output, all in plain markdown. Claude reads the description, and when a task matches it, loads the skill on demand, runs the steps, and returns the result in the format you specified. In Claude Code there is no build step and no upload; the file lives in a directory and Claude finds it.

The detail most explainers skip is that a skill can carry deterministic code, not only prose. If one step should run identically every time, you drop a script next to `SKILL.md` and the skill calls it. That is the line between a skill and a saved prompt. A prompt is a wish you paste again and again; a skill is a procedure with a fixed output, and it triggers itself. For the full anatomy, [what are Claude skills](/blog/what-are-claude-skills) walks the six pieces, and [Claude Code skills](/blog/claude-code-skills) covers the Code-specific setup.

## What a subagent actually is

A subagent is a separate Claude instance the main agent hands a single job to. It runs in its own context window, starts with only the task it was given, and when it finishes, the one thing that crosses back to the parent is its final message. Everything it read to get there, the thirty files it opened, the dead ends it explored, stays in its own context and disappears when it is done.

Claude Code ships a few out of the box. `general-purpose` is the catch-all. `Explore` is a read-only searcher tuned to sweep a codebase without touching it. `Plan` drafts implementation strategy. You manage them, and add your own, through the `/agents` command, and each is a markdown file with YAML frontmatter living in `.claude/agents/` in the repo or `~/.claude/agents/` for your personal set. [Claude Code subagents](/blog/claude-code-subagents) has the full build guide, down to the four frontmatter fields that matter.

The reason subagents exist is context. A long session piles every file read and every tool result into one window, and there is a point where asking the same thread to also go read thirty test files is how it starts forgetting the refactor it was halfway through. A subagent absorbs that cost. It burns its own context on the hunt and returns one line: the flake is a race in `auth.test.ts`. The main thread paid a summary and kept its head clear.

## The decision table

Match your situation to the row. This is the part worth a screenshot.

| Your situation | Reach for | Why |
|---|---|---|
| Claude keeps doing a recurring task a slightly different way each time | Skill | The problem is consistency, and a `SKILL.md` fixes the procedure |
| A step must run the same way every time, including a deterministic bit | Skill with a bundled script | Code inside the skill removes the drift |
| The task is bulky and read-heavy but the result you need is small | Subagent | It burns its own context and hands back a summary |
| Your main session is filling up and starting to lose the thread | Subagent | Isolation keeps the parent context clean |
| You need several independent slices done at once | Subagents in parallel | Each runs in its own window, concurrently |
| You want the same behavior across Claude Code, Codex, and Cursor | Skill | `SKILL.md` is portable; see the [cross-vendor guide](/blog/use-claude-skills-in-cursor-codex-gemini) |
| Claude needs to reach an external system it cannot see | Neither, that is MCP | See [Claude skills vs MCP](/blog/claude-skills-vs-mcp) |

If you keep only one rule: consistency points to a skill, isolation points to a subagent, and the two are not rivals.

## Using them together

The common shape is not skill or subagent, it is a skill running inside a subagent. You want a job done in a clean context and done your team's exact way, so you write the procedure once as a skill and point a subagent at it.

```markdown
---
name: release-notes-writer
description: Produce the weekly release notes from merged PRs. Use when
             someone asks for the release notes. Follows the release-notes skill.
tools: Read, Grep, Bash
model: sonnet
---

You are a release-notes writer. Follow the `release-notes` skill exactly.
Read the merged PRs since the last tag, group them by area, and write the
notes in the skill's output format. Return only the finished notes.
```

The subagent gives you the clean room: it reads a pile of PRs in its own window and the main thread never sees them. The skill gives you the procedure: the grouping, the tone, the output contract, identical every week. Neither does the other's job, and together they produce something a lone prompt in your main session would not, without wrecking your context on the way.

## The part nobody answers: which skill, which subagent?

Say you have made the call. Your task is about consistency, so you want a skill. Now you hit the real wall, and it is not a technical one.

There are more than forty thousand skills scattered across Anthropic, the community marketplaces, GitHub, and a handful of vendor directories. Quality is all over the map, and plenty of them are saved prompts wearing a `SKILL.md` costume. You cannot tell from a name whether one is sharp or whether it will quietly drift the first time an input shifts. Subagents have a gentler version of the same problem: the built-ins are solid, but a folder of half-remembered custom agents becomes its own maintenance tax.

This is the problem that shows up after the skill-versus-subagent decision, and it is the one implexa is built for. A [skill graph](/resources/what-is-a-skill-graph) indexes skills across every vendor, and [SkillRank](/resources/skill-rank) scores them on whether they actually work, so you install the one that earns its place instead of the one that sorted first. Choosing a skill over a subagent is the easy half. Choosing the right one is where the week goes.

## FAQ

### Can a subagent use a skill?

Yes, and it is the cleanest way to combine them. A subagent runs in its own context, and its system prompt can tell it to follow a specific skill, so it does the job in isolation and still follows your exact procedure. The release-notes example above is this pattern.

### Do skills and subagents replace each other?

No. They solve different problems. A skill makes the current agent do a task consistently. A subagent moves a task off the main thread so it does not eat your context. If your issue is drift, a subagent alone will not fix it, and if your issue is a bloated session, a skill alone will not either.

### Are subagents a Claude Code thing only?

Largely, yes. Subagents are a Claude Code feature, managed through `/agents` and stored in `.claude/agents/`. Skills are broader: the Agent Skills format runs on claude.ai, the API, and Claude Code, and the same `SKILL.md` carries over to Codex and Cursor.

### Which should I set up first?

Start with a skill for the task you keep doing by hand, because it pays off in every session right away. Add a subagent when you notice a specific job is bulky enough to be crowding your main context. Let real friction, not a plan, decide when you need the second one.

### Can I schedule these to run on their own?

You schedule the session, not the skill or subagent directly. A scheduled Claude Code run can load skills and delegate to subagents as part of its work. [How to schedule Claude Code](/blog/schedule-claude-code) covers the options and the limit each one hides.

---

The short version: a skill teaches the agent you have, a subagent gives you a new one to offload to, and the good setups reach for both. Decide on consistency versus isolation first, then spend your real effort on the harder question of which skill is worth installing. Start at the [Claude skills pillar](/claude-skills) for the full map.
