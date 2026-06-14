---
title: "Claude Code Subagents: How One Person Runs a Whole Team of AI Agents"
slug: "day-13"
description: "Claude Code subagents let a single builder fan work out to many specialist agents that each run in their own context and report back just the answer. Here's what a subagent is, the three reasons it matters, the two ways to make one (the /agents command or a file in .claude/agents/), and the honest limits — including the parallel gotcha and why a subagent can't spawn its own subagents. From the @ImplexaAI build-solo series."
publishedAt: "2026-06-11"
day: 13
reelHook: "subagents"
tags: ["day-13", "claude", "claude-code", "subagents", "ai-agents", "parallel-agents", "anthropic", "ai-coding", "solo-founder", "buildinpublic"]
---

# Claude Code Subagents: How One Person Runs a Whole Team of AI Agents — Implexa AI Guide

*A standalone guide from the @ImplexaAI build-solo series. No prior reading required — if you use Claude Code (or are curious about it), this is the feature that lets one person move like a team.*

---

## TL;DR

A **subagent** is a specialist Claude Code spins up to handle one job in its **own separate context window**, with its own instructions and its own tool access. It does the work and hands back just the answer.

- **Why it matters:** your main conversation stays clean (the messy searching and logs stay in the subagent), you can keep a roster of specialists (a reviewer, a researcher, a debugger) that Claude routes to automatically, and several can run **in parallel**.
- **How to make one:** run the **`/agents`** command and answer a couple of questions, or drop a small Markdown file in **`.claude/agents/`** (for this project) or **`~/.claude/agents/`** (for all your projects).
- **The honest catch:** the parallel win only holds when the jobs don't overlap (give each agent its own files), subagents work **within a single session**, and a **subagent can't spawn its own subagents**.

The one line: **a team of one, moving like a team of ten.**

---

## What a subagent actually is

When you work in a single chat, everything piles into one context window: your task, every file Claude reads, every search result, every log. The window fills up, and the model's attention gets split across a lot of noise.

A subagent fixes that by **delegation**. Instead of one assistant doing everything, Claude hands a side job to a specialized assistant that runs in its **own context window**, with a **custom system prompt**, **specific tool access**, and **independent permissions**. It works on its own and returns only the result.

In the docs' words: *"Use one when a side task would flood your main conversation with search results, logs, or file contents you won't reference again: the subagent does that work in its own context and returns only the summary."*

Claude decides when to use a subagent by reading its **description** — so a well-written description ("Expert code reviewer. Use proactively after code changes.") is what makes delegation automatic.

---

## The three reasons it matters

### 1. A clean main context
This is the headline benefit. All the exploration — grepping the codebase, reading ten files, scrolling test output — happens **inside the subagent**, and only the conclusion comes back. Your main conversation stays focused on the actual decision instead of drowning in the raw material. Claude Code ships built-in subagents for exactly this (the **Explore** agent searches a codebase without polluting your main context; **Plan** gathers research during plan mode).

### 2. Reusable specialists
You can define your own subagents, each with a focused job and its own tool limits:
- A **code reviewer** that only reads (`Read`, `Grep`, `Glob`) and reports issues.
- A **researcher** that searches the web and your docs.
- A **debugger** that reproduces failures and traces them.

Each is a small Markdown file with a clear description, and Claude picks the right one automatically when the task matches. You can also **control cost** by routing a subagent to a faster, cheaper model like Haiku for the grunt work, while your main session stays on the heavyweight model.

### 3. They run in parallel
Because each subagent has its own context, Claude can run several **at the same time**. Point one at the auth layer, one at the API layer, one at the database layer, one at the tests, and they all work concurrently, then hand back their summaries. For a solo builder, that's the closest thing there is to having a team — four investigations finishing in the time of one.

---

## How to make one (two ways)

**The fast way — the `/agents` command.** Run `/agents`, switch to the **Library** tab, choose **Create new agent**, pick **Personal** (saved to `~/.claude/agents/`, available in every project) or **Project**, and Claude will help you write the identifier, description, and system prompt. Subagents created this way take effect **immediately**, no restart.

**The file way — drop a Markdown file.** A subagent is just a Markdown file with YAML frontmatter:

```markdown
---
name: code-reviewer
description: Expert code reviewer. Use proactively after code changes.
tools: Read, Glob, Grep
model: sonnet
---
You are a code reviewer. When invoked, analyze the recent changes and
report concrete issues with file:line references and suggested fixes.
```

Put it in:
- **`.claude/agents/`** — project-scoped. Check it into git so your collaborators (or future you) get it too.
- **`~/.claude/agents/`** — user-scoped. Available across all your projects.

Only `name` and `description` are required. If you add a file directly on disk, restart the session to load it (agents created through `/agents` load instantly).

---

## The honest limits (so you don't get "well, actually'd")

This is the part most hype posts skip — and the part that will get fact-checked in the comments:

- **Parallel only wins when the jobs don't overlap.** Run agents concurrently on **independent** work (different files, different parts of the project). If two agents edit the same file at once, you get conflicts, not speed. Give each agent its own corner.
- **Subagents work within a single session.** They aren't cloud jobs and they don't keep running after you close Claude Code. (If you want jobs that run **off-machine, on a schedule, even when your laptop is closed**, that's **Routines** / scheduled tasks — a different feature. And to run many independent *sessions* in parallel and watch them from one place, that's **background agents**; for sessions that talk to each other, **agent teams**. Don't confuse the four.)
- **A subagent can't spawn another subagent.** No infinite nesting — a subagent does its job and returns; it can't recursively fan out further. This is a deliberate guardrail.
- **Delegation costs a round trip.** For a tiny task, doing it inline is faster than spinning up a subagent. Reach for subagents when the side job is big enough that its output would clutter your main context, or when you genuinely want parallelism.

---

## Why this matters if you're building solo

The whole premise of building a billion-dollar company solo is leverage: one person doing the work of a team because the tools got good enough. Subagents are that leverage made literal. You stay the orchestrator — you decide what gets done and you make the calls — and a roster of specialists does the legwork in parallel, each in its own clean context, each reporting back just what you need.

You don't scale by working more hours. You scale by handing the right jobs to the right agents and keeping your own head clear for the decisions only you can make.

---

## The one line

**A team of one, moving like a team of ten.**

Pick one repetitive specialist job you do by hand — reviewing your own diffs, say. Make it a subagent today with `/agents` or a file in `.claude/agents/`. Then point a few agents at a few independent parts of your next task and watch them run at once.

---

*Part of the @ImplexaAI "Day X of building a $Bn company, solo" series — one concrete build concept per day, in plain language. Source: [Create custom subagents — Claude Code Docs](https://code.claude.com/docs/en/sub-agents).*
