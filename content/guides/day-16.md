---
title: "Claude Code Skills: Teach Claude a Job Once and It Runs It Forever"
slug: "day-16"
description: "A Claude Code skill is a folder with a SKILL.md where you write down how you do a repeatable job once, so Claude loads and runs it on its own whenever that job comes up. Here's what a skill is, how the auto-loading works, how to write one in .claude/skills, the project vs personal scope split, how to install marketplace skills safely, and the honest catch — a skill can run code on your machine. From the @ImplexaAI build-solo series."
publishedAt: "2026-06-16"
day: 16
reelHook: "skills"
tags: ["day-16", "claude", "claude-code", "claude-skills", "agent-skills", "anthropic", "ai-agents", "ai-coding", "solo-founder", "buildinpublic"]
---

# Claude Code Skills: Teach Claude a Job Once and It Runs It Forever — Implexa AI Guide

*A standalone guide from the @ImplexaAI build-solo series. No prior reading required — if you use Claude Code (or are curious about it), this is the setup that stops you re-explaining the same job in every new chat.*

---

## TL;DR

A **skill** is a folder with a single `SKILL.md` file where you write down **how you do a repeatable job** — your code-review checklist, your brand voice, your deploy steps. You add a one-line description of *when* to use it, and Claude reads that description and **loads the skill on its own** the moment that job comes up. You don't invoke it.

- **What it is:** a folder containing a `SKILL.md` (a short Markdown file with a `name` and a `description`, then your instructions). It can also bundle scripts and files the skill needs.
- **The magic:** Claude decides when a skill is relevant from its `description` and loads it automatically (this is called progressive disclosure / a model-invoked skill). Unlike a slash command, you don't run it. Unlike `CLAUDE.md`, it isn't loaded every session — only when its job comes up.
- **How to make one:** drop a folder in `.claude/skills/`, add a `SKILL.md` with a `name`, a `description` of when to use it, and the steps.
- **Two scopes:** `.claude/skills/` in your repo (commit it — your whole team gets the skill) and `~/.claude/skills/` (personal, applies across all your projects).
- **The honest catch:** a skill can include and **run code on your machine**, and skills you install from a marketplace aren't vetted for you. Only install skills you trust, and read the `SKILL.md` first.

The one line: **stop re-typing the same prompt — teach Claude the job once.**

---

## The problem it fixes

You have jobs you do the same way every time. Reviewing a pull request the way your team likes. Writing a post in your voice. Cutting a release with the same five steps. Claude can do all of these — but every new conversation starts from zero, so you re-explain the procedure each time. You become the playbook: the steps live in your head, and you re-type them on demand.

That's a tax. It's slow, it's inconsistent (you phrase it a little differently each time), and the moment you forget a step, Claude guesses. A skill removes the tax: you write the procedure down once, and Claude runs it the same way every time, on its own.

---

## What a skill actually is

A skill is just a directory with a `SKILL.md` file in it:

```
.claude/skills/
  pr-review/
    SKILL.md
```

The `SKILL.md` starts with a tiny bit of frontmatter and then the instructions:

```markdown
---
name: pr-review
description: Review a pull request to our team's standards. Use when the user asks to review a PR, check a diff, or before merging.
---

# How we review a PR

1. Summarize what the change does in two sentences.
2. Check for: missing tests, error handling, and anything that touches auth or billing.
3. Flag naming that doesn't match the surrounding code.
4. End with a clear verdict: approve, approve-with-nits, or request-changes.
```

That's the whole thing. The `name` identifies it; the `description` is the important part — it's how Claude decides when to use the skill. The body is your procedure, written the way you'd explain it to a new teammate.

---

## The magic: Claude loads it on its own

Here's what makes a skill different from everything else in Claude Code.

- A **slash command** is something *you* run.
- **`CLAUDE.md`** is loaded into context at the start of *every* session, whether it's relevant or not.
- A **skill** is loaded by *Claude*, *only when it's relevant*.

When you ask Claude to do something, it looks at the `description` of each available skill and decides, on its own, whether one applies. If your message is "can you review this PR?", the `pr-review` skill's description matches, so Claude pulls in those instructions and follows them. You never typed the skill's name. This is called **progressive disclosure**: skills sit quietly until their moment, then load. That's why a skill doesn't bloat your context the way a long `CLAUDE.md` can — it's only "in the room" when its job is on the table.

So the better your `description` ("use when…"), the more reliably Claude reaches for the skill at the right time. Treat the description as the trigger, not an afterthought.

---

## What to teach it (ideas that pay off fast)

- **Your code-review checklist** → it reviews every pull request your way, not the generic way.
- **Your brand voice** → every draft, caption, or reply sounds like you (tone, banned words, sentence length).
- **Your deploy / release steps** → it ships the same way every time, in the same order, with the same checks.
- **Your bug-triage flow** → it labels, reproduces, and routes incoming issues consistently.
- **Your data-pull recipe** → the exact query + format you always want for a weekly report.

Rule of thumb: anything you've explained to Claude more than twice is a candidate for a skill.

---

## How to make one

1. **Make the folder.** `.claude/skills/<name>/` in your project (or `~/.claude/skills/<name>/` for a personal one).
2. **Write `SKILL.md`.** Add the `name`, a `description` that says *when to use it*, then the steps in plain Markdown.
3. **That's it.** Next time the job comes up, Claude loads the skill on its own. Test it by asking for the job in your own words and watching whether the skill kicks in; if it doesn't, sharpen the `description`.

> Faster path: depending on your Claude Code version and plugins, there may be a skill-creator or a plugin marketplace that scaffolds a skill for you. The hand-written folder above always works and is the clearest way to understand what a skill is — start there.

---

## Two scopes: your team vs just you

- **Project scope — `.claude/skills/` in the repo.** Commit it to git and the skill ships with the project. Everyone who clones the repo gets the same skill, so your whole team reviews PRs and cuts releases the same way. This is how a skill becomes shared, durable team know-how instead of something locked in one person's head.
- **Personal scope — `~/.claude/skills/`.** Lives in your home directory and applies across every project you work on. Great for your personal style, your editor habits, the way *you* like things — without imposing it on the team.

You can have both. Personal skills follow you everywhere; project skills make sure the team is consistent.

---

## The honest catch: a skill can run code

This is the part to take seriously. A skill is instructions, and those instructions can include or invoke **scripts that run on your machine**. That's powerful — it's what lets a skill actually *do* the job and not just describe it — but it means a skill is code you're choosing to trust.

- **Skills you write:** you know exactly what they do. Safe.
- **Skills you install from a marketplace or a link:** they are **not vetted for you**. Treat an installed skill the way you'd treat any script from the internet.

The safe path is simple: **only install skills you trust, and open the `SKILL.md` and read it before you run it.** If a skill wants to run commands or reach the network, make sure you understand why. This isn't a reason to avoid skills — it's the one rule that keeps them safe.

---

## How this fits the bigger picture

If you've set up `CLAUDE.md` (persistent project facts) and connected your tools with MCP (so Claude can act in your real systems), skills are the third leg: **reusable know-how**. `CLAUDE.md` tells Claude *about* your project, MCP gives it *hands*, and skills teach it *how you do specific jobs*. Together they turn Claude from a code writer into a teammate who knows your project, can act in your tools, and does your recurring work your way.

---

## The one line

**Stop re-typing the same prompt. Write the job down once as a skill, and Claude runs it your way, every time.**

---

*Part of the @ImplexaAI build-in-public series — one concrete Claude Code concept per day, explained for solo builders and small teams. Free, on the Claude you already use.*
