---
title: "CLAUDE.md: The One File That Makes Claude Code Actually Know Your Project"
slug: "day-14"
description: "CLAUDE.md is the project-memory file Claude Code reads automatically at the start of every session, so you stop re-explaining your stack, your folder layout, and your rules in every new chat. Here's what it is, exactly what to put in it, how to make one in ten seconds with /init, the project vs personal (~/.claude/CLAUDE.md) split, and the honest catch — it loads into context every time, so keep it tight. From the @ImplexaAI build-solo series."
publishedAt: "2026-06-14"
day: 14
reelHook: "claude-md"
tags: ["day-14", "claude", "claude-code", "claude-md", "ai-memory", "context-engineering", "anthropic", "ai-coding", "solo-founder", "buildinpublic"]
---

# CLAUDE.md: The One File That Makes Claude Code Actually Know Your Project — Implexa AI Guide

*A standalone guide from the @ImplexaAI build-solo series. No prior reading required — if you use Claude Code (or are curious about it), this is the ten-minute setup that makes it dramatically smarter about your project.*

---

## TL;DR

**CLAUDE.md** is a plain markdown file in your project that Claude Code reads **automatically at the start of every session**. You write down the things you'd otherwise re-explain in every new chat, once, and from then on Claude just knows them.

- **Why it matters:** Claude starts each conversation from zero. CLAUDE.md gives it persistent context — how to run and test the app, your folder layout, your conventions — so you stop repeating yourself.
- **What goes in it:** how to build / run / test, the project structure, and your rules ("always do this, never touch that").
- **How to make one:** run **`/init`** and Claude scans your project and writes a first draft. Then you trim it.
- **Two levels:** **`./CLAUDE.md`** in your repo (check it into git — shared with your team and future you) and **`~/.claude/CLAUDE.md`** (personal, applies across all your projects).
- **The honest catch:** it's loaded into context **every single session**, so keep it short — a bloated file spends tokens and buries the rules that matter.

The one line: **stop repeating yourself — write it down once.**

---

## The problem it fixes

Every new Claude Code conversation starts with a blank slate. The model doesn't remember the last chat. So it doesn't know how you start your dev server, where your components live, that you use one package manager and not another, or that there's one directory it should never touch. You end up explaining the same project facts over and over — and when you forget to, Claude guesses, and the guess is sometimes wrong.

That repetition is pure tax. It's slower, and it's the source of a lot of "why did it do *that*?" moments. CLAUDE.md removes the tax by writing those facts down in one place Claude reads on its own, every time.

---

## What CLAUDE.md actually is

It's just a markdown file named `CLAUDE.md`. When Claude Code starts a session, it **automatically loads** that file as context before you type anything — think of it as the briefing note Claude reads before every shift. There's nothing magic about the format: headings and bullet points are perfect. The power is entirely in it being read automatically, every time, without you pasting anything.

Important framing so you don't get "well, actually'd": **CLAUDE.md is a file you write and curate.** It isn't Claude silently "remembering" things on its own — it's you telling Claude what's true about your project, and Claude re-reading that on every session. You stay in control of what's in it.

---

## What to put in it

Aim for the stuff you're tired of repeating — the things a sharp new teammate would need on day one:

- **How to run it.** The exact commands to install, start the dev server, build, and run tests.
- **The layout.** Where things live — `app/` vs `components/` vs `lib/`, where config and env files are, anything non-obvious.
- **Conventions.** The package manager, the styling approach, naming patterns, how you write commits.
- **Your rules.** The "always do this, never touch that" list — e.g. "never edit files in `generated/`," "always run the tests before saying you're done," "use the existing UI components, don't invent new ones."

A good CLAUDE.md is short and specific. You're not writing documentation for humans; you're giving Claude the few facts that change its behavior.

---

## How to make one (ten seconds)

**The fast way — `/init`.** In your project, run `/init`. Claude reads your whole project — your files, your config, your structure — and writes a starter `CLAUDE.md` for you. Then you do the important part: **trim it.** Cut the obvious, keep the high-signal facts and your rules. The generated draft is a starting point, not the finished file.

**The by-hand way.** You can also just create `CLAUDE.md` in your repo root and write it yourself. A dozen tight bullet points beats three pages of prose.

Either way, commit it. Which brings us to the two levels.

---

## Project vs personal: the two levels

- **Project memory — `./CLAUDE.md`** (in your repo root). This is about *the project*: how it runs, its structure, its rules. **Check it into git.** Now every collaborator — and future you, six weeks from now — gets the same briefing automatically.
- **Personal memory — `~/.claude/CLAUDE.md`** (in your home directory). This is about *you*: your preferred style, your shortcuts, the way you like Claude to talk to you. It applies across **every** project on your machine, and it doesn't get committed to anyone's repo.

The mental model: the repo file describes the work, the home file describes the worker. Most people only ever make the project one — the personal one is the quiet upgrade that follows you everywhere.

---

## The honest catch (so you keep it useful)

CLAUDE.md is loaded into context at the start of **every** session. That's the whole point — and it's also the constraint:

- **Keep it short and sharp.** Every line costs context budget on every run. A bloated CLAUDE.md spends tokens and, worse, buries your three load-bearing rules under twenty paragraphs of filler the model has to wade through.
- **Trim the `/init` output.** The auto-generated draft is usually too long. Delete anything Claude could figure out on its own; keep what changes its behavior.
- **Curate it over time.** When you catch yourself correcting Claude on the same thing twice, that's a line for CLAUDE.md. When a rule stops being true, delete it. Treat it like a living config, not a write-once document.

Tight beats long. A focused 30-line file outperforms a sprawling 300-line one.

---

## Why this matters if you're building solo

The premise of building a billion-dollar company solo is leverage: one person doing the work of a team because the tools got good enough. When there's no team to hold the project's context in their heads, the thing that compounds is making your tools remember it for you.

CLAUDE.md is the cheapest, highest-leverage version of that. Ten minutes once, and every future session starts with Claude already knowing how your project works and what your rules are. You stop being the project's memory. You get to spend your attention on the decisions only you can make.

---

## The one line

**Stop repeating yourself. Write it down once.**

Open your project, run `/init`, trim the draft to the essentials, and add your top three "always / never" rules. Then make a `~/.claude/CLAUDE.md` for the preferences you carry everywhere. That's the whole setup — and Claude stops feeling forgetful and starts working like it's on your team.

---

*Part of the @ImplexaAI "Day X of building a $Bn company, solo" series — one concrete build concept per day, in plain language. Source: Claude Code memory & context (CLAUDE.md) documentation.*
