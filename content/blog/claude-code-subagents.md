---
title: "Claude Code subagents: what they are and how to build one"
slug: "claude-code-subagents"
description: "Claude Code subagents are focused helpers that Claude spawns in their own context to handle one job. What they are, when to use them, and how to build one."
publishedAt: "2026-06-23"
tags: ["claude-code", "subagents", "ai-agents", "claude-skills", "context"]
---

A Claude Code subagent is a separate Claude instance that the main agent hands a single job to, with its own context window, its own system prompt, and usually a trimmed set of tools. You ask Claude to review a diff, and instead of doing it inline, it spins up a `code-reviewer` that reads the diff, thinks it through in a clean context, and reports back a summary. The main thread never sees the 4,000 lines the reviewer scrolled through. It just gets the verdict.

That last part is the whole point, and it is easy to miss until you have watched a long session fall apart. This guide covers what subagents actually are, when they earn their keep, how to write one, and how they differ from skills, which people mix them up with constantly.

## What is a Claude Code subagent?

A subagent is a child Claude that runs in isolation and returns only its result to the parent. It does not share the main conversation. It gets the task you (or the main agent) hands it, works in a fresh context window, and when it finishes, the only thing that crosses back is its final message. Everything it read, every dead end it explored, every file it opened stays in its own context and disappears when it is done.

Claude Code ships with a few built in. `general-purpose` is the catch-all. `Explore` is a read-only searcher tuned to sweep a codebase and report findings without touching anything. `Plan` drafts implementation strategy. You can see them, and add your own, through the `/agents` command. Each one is a markdown file with some YAML at the top, which is the part that surprises people: there is no SDK, no registration step, no build. A subagent is a text file in a folder.

## Why use a subagent instead of just asking Claude?

The honest answer is context. A Claude session has a finite context window, and on a 1M-token model that feels infinite right up until it isn't. Every file you read, every command output, every tool result piles into the same window. Around the point where the main thread is juggling the architecture, three open files, and a half-finished refactor, asking it to also go read 30 test files to find a flaky one is how you get a session that starts forgetting what it was doing.

A subagent absorbs that. You send the flaky-test hunt to a subagent, it burns through its own context reading those 30 files, and it hands back one line: "the flake is in `auth.test.ts:142`, a race on the token refresh." The main thread stays clean. It paid one summary's worth of tokens for a job that would have cost it a third of its window.

There are three other reasons people reach for them, and they matter less often than the context one but still count. Specialization: a subagent with a tight system prompt that only does security review will out-focus a generalist asked to "also check for vulnerabilities" on the side. Parallelism: you can fan several subagents out at once, each on an independent slice, and they run concurrently instead of one after another. Tool restriction: a subagent you give only `Read` and `Grep` literally cannot edit a file, which is a real safety rail when you are turning it loose on a sweep.

## When you should not use one

Skip the subagent when the task is small or when you need the full output in front of you. If the answer is one grep away, delegating it just adds the overhead of spinning up a child and waiting for a summary, for no gain. And summaries lose detail by design, so when you genuinely need every line a step produced sitting in the main context, because you are about to edit based on all of it, keep the work inline. The rule I use: delegate when the work is bulky and the result is small. A 40-file audit that boils down to a list of three problems is the perfect shape. A two-line config tweak is not.

## How to build a Claude Code subagent

You build a subagent by dropping a markdown file into an `agents` directory and writing a description that tells Claude when to use it. There are two locations. Project subagents live in `.claude/agents/` inside the repo and ship with the project, so your whole team gets them. Personal ones live in `~/.claude/agents/` and follow you across every project. When a name collides, the project version wins.

The file is YAML frontmatter plus a body. Here is a real one for reviewing pull requests:

```markdown
---
name: pr-reviewer
description: Reviews a diff for correctness bugs, missing tests, and security issues. Use after writing code, before opening a PR.
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a focused code reviewer. Read the diff and the files it touches.
Report only real problems, ranked by severity. For each one, give the
file and line, what is wrong, and the smallest fix. Do not restate code
that is fine. If you find nothing, say so in one line.
```

Four fields do the work. `name` is the handle. `description` is the most important line in the whole file, because it is what Claude reads when deciding whether to delegate to this subagent on its own, so write it as "what this does and when to use it," not a vague label. `tools` is an optional comma-separated allowlist; leave it out and the subagent inherits every tool the main agent has, which is rarely what you want for a focused job. `model` is optional too: pick `haiku` for cheap mechanical work, `opus` for the hard reasoning, or `inherit` to match the parent. The body below the frontmatter is the subagent's system prompt, and it is where you spend your effort. Tell it exactly what to do and what to leave alone.

The fastest way to start is the `/agents` command, which opens an interactive editor, lets Claude draft the file from a description you give it, and writes it to the right folder. Generate a first version that way, then hand-edit the prompt, because the generated one is always a little generic.

## How do you actually invoke one?

Two ways: Claude picks it on its own, or you name it. Automatic delegation is the common path. Claude reads the `description` field across all your subagents and, when a task matches, routes the work there without being told. This is exactly why the description has to be sharp. If yours says "code helper," it will never fire; if it says "use after writing code, before opening a PR," it fires at the right moment. The other way is to just ask: "use the pr-reviewer subagent on this branch." Explicit beats automatic when you already know which one you want.

A subagent gets one shot at the task and returns one result. It cannot ask you a follow-up mid-run. So write its instructions to handle ambiguity on its own and make a reasonable call rather than stall, the same way you would brief a contractor you cannot reach for a week.

## Subagents vs skills: which one do you want?

A skill teaches the agent that is already working, and a subagent hands the work to a different agent entirely. That is the cleanest way to hold them apart. A [Claude Code skill](/blog/claude-code-skills) is a `SKILL.md` instruction pack that loads into the current context when it is relevant, so the same agent now knows how to, say, format your release notes. A subagent is a whole separate worker with its own context and its own tools.

You combine them more than you choose between them. A subagent can use skills. A common setup is a subagent whose body says "follow the release-notes skill" and whose job is to go produce that artifact in isolation and hand it back. If you are weighing the two for a specific task, the [skills vs MCP breakdown](/blog/claude-skills-vs-mcp) covers the neighboring question of where capabilities should live, and if you are newer to all of this, [how to build an AI agent with Claude](/blog/build-an-ai-agent-with-claude) starts a level below.

## Frequently asked questions

### Where are Claude Code subagents stored?

In an `agents` directory. Project subagents go in `.claude/agents/` inside the repository and are shared with anyone who clones it. Personal subagents go in `~/.claude/agents/` and are available in every project on your machine. If both define a subagent with the same name, the project one takes precedence.

### Do subagents share the main conversation's context?

No. Each subagent runs in its own context window and starts fresh, knowing only the task it was handed. It does not see your earlier messages or the main agent's working state, and when it finishes, only its final summary returns to the parent. That isolation is the feature, not a limitation, because it keeps the main thread from filling up with everything the subagent had to read.

### Can a subagent call another subagent?

In practice, no. Subagents are spawned by the main agent, and they are not designed to spin up their own children, so plan for a flat structure: one orchestrator delegating to focused workers, not a deep tree. If you need multi-step coordination, keep the orchestration in the main thread and fan work out from there.

### How many subagents should I create?

As many as you have distinct, repeatable jobs, but no more. A subagent earns its place when there is a real recurring task with a clear shape, like reviewing diffs or sweeping a codebase. Creating one for a job you do once adds a file to maintain for no payoff. Start with the two or three you actually reach for, and let the rest come from real friction.

### Can I schedule a subagent to run on its own?

Not directly, but you can schedule the session that uses one. Scheduling happens at the level of a Claude Code run, and that run can delegate to subagents as part of its work. See [how to schedule Claude Code](/blog/schedule-claude-code) for the scheduling options and the limit each one hides.

## The short version

Subagents are how you keep a long Claude Code session from collapsing under its own context. Send the bulky, read-heavy, easy-to-isolate work to a child that does it in a clean window and reports back a summary, and reserve the main thread for the work that needs everything in view. Write a sharp `description` so Claude knows when to delegate, restrict the tools to what the job needs, and spend your effort on the system prompt. The rest you learn by watching which jobs you keep wishing you had handed off.
