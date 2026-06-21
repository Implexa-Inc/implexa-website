---
title: "AGENTS.md: the open standard for coding agent instructions"
slug: "agents-md"
description: "AGENTS.md is the open format that tells AI coding agents how to work in your repo. What it is, where it lives, what to put in it, and how it beats a README."
publishedAt: "2026-06-21"
tags: ["agents-md", "coding-agents", "claude-code", "codex", "cross-vendor"]
---

Open almost any repo built in the last year and you will find a file called AGENTS.md sitting next to the README. It is not documentation for people. It is the note your coding agent reads before it touches a single line, and twelve months ago hardly anyone wrote one.

## What is AGENTS.md?

AGENTS.md is an open Markdown file that tells AI coding agents how to work inside your project. The agents.md site calls it "a README for agents": a predictable place to put the build steps, test commands, and conventions an agent needs but a human contributor mostly does not.

The format is deliberately thin. There are no required fields and no schema to learn. You write plain Markdown, the agent parses whatever is there, and that is the whole contract. The standard is now stewarded by the Agentic AI Foundation under the Linux Foundation, and it came out of a rare bit of cooperation between competitors: OpenAI Codex, Google's Jules, Cursor, Factory, and others agreed to read the same filename instead of inventing a dozen incompatible ones.

That agreement is the point. Before AGENTS.md, every tool wanted its own config, a `.cursorrules` here and a bespoke dotfile there. Pointing five agents at one repo meant maintaining five copies of the same instructions and watching them drift apart. One shared file ends that chore.

## Where does AGENTS.md go?

AGENTS.md goes at the root of your repository, and in a monorepo you can drop more of them into subprojects. When an agent edits a file, the closest AGENTS.md up the directory tree wins. A rule you set in `packages/api/AGENTS.md` overrides the root file for anything inside that package, which is what you want when your backend and your frontend follow different conventions.

One rule sits above all of them. An explicit instruction you type into the chat overrides whatever the file says. The file is the standing default; your prompt in the moment is the final word.

For a small project a single root file is plenty. Reach for nested files only once a subdirectory genuinely needs different commands or different boundaries, because every extra file is one more thing to keep honest.

## What goes in an AGENTS.md file?

A good AGENTS.md covers the handful of things an agent cannot infer by reading your code. The commonly recommended sections are a short project overview, the exact build and test commands, code style rules, and any boundaries on what the agent should not touch.

The build and test commands matter most. An agent that knows `pnpm test` runs your suite and that `pnpm build` has to pass before a change is done will check its own work instead of handing you something broken. Spell out the real commands, not approximations.

After that, write down the things that trip agents up. If your dependency versions differ from what the model was trained on, say so. GitHub studied more than 2,500 repositories with AGENTS.md files and found the useful ones are specific and short, while the weak ones are either empty boilerplate or a wall of text nobody, human or machine, ever reads. Aim for the version a new contributor would actually find useful on their first day.

Here is a small real example. The implexa marketing site runs on a build of Next.js with breaking changes from the public docs, so its AGENTS.md is two sentences: it warns the agent that this is not the Next.js it remembers, and tells it to read the local docs in `node_modules` before writing any code. That single instruction heads off a whole class of confidently wrong edits.

## AGENTS.md vs CLAUDE.md vs README

The three files look similar and serve different readers. README.md is for the human who just cloned your repo. AGENTS.md is the cross-tool instruction file read by Codex, Cursor, GitHub Copilot, Windsurf, and the rest. CLAUDE.md is Claude Code's own memory file, with a few features the open format does not have, such as `@import` references and path-scoped rules.

The catch that surprises people is that Claude Code does not read AGENTS.md on its own. So if you keep both ecosystems happy, do not maintain two copies. Make AGENTS.md the single source of truth and let CLAUDE.md be a one-line wrapper that imports it. The implexa site does exactly this; its entire CLAUDE.md is the line `@AGENTS.md`. Codex and Cursor read AGENTS.md directly, Claude Code reads it through the import, and there is one file to update.

Splitting README and AGENTS.md is not universally loved. There is a long Hacker News thread of engineers arguing the two should just be one file. The practical answer is that human onboarding prose and machine build commands optimize for different readers, so a single document trying to serve both usually serves neither well.

## How AGENTS.md fits with reusable skills

AGENTS.md is scoped to one repository, which is both its strength and its ceiling. It tells an agent how this project works. It says nothing about the reusable capabilities you carry from project to project, like a pull-request reviewer, a changelog writer, or a release checklist. That is the job of [Claude Skills](/blog/what-are-claude-skills) and the broader [SKILL.md format](/blog/claude-code-skills), which package a workflow once and load it on demand wherever you are.

The two layers stack cleanly. AGENTS.md is the local context for a single codebase. Your skills are the portable muscle memory that travels with you, and they already [work across Cursor, Codex, and Gemini](/blog/use-claude-skills-in-cursor-codex-gemini) the same way AGENTS.md does. Map enough of those reusable workflows and you start to see the shape of a [skill graph](/resources/what-is-a-skill-graph): a composable set of capabilities you can search, rank, and run from any tool rather than a pile of loose config files. AGENTS.md got the industry to agree on one filename. The harder, more valuable step is agreeing on how the reusable parts above it get found and shared.

## Frequently asked questions

### Do I need an AGENTS.md if I already have a README?

Yes, if you use coding agents seriously. The README explains the project to people; AGENTS.md gives agents the exact commands and constraints they need to make correct changes. You can keep the README lean and move the agent-specific detail into AGENTS.md so neither file gets cluttered.

### Does Claude Code read AGENTS.md?

Not directly. Claude Code reads its own CLAUDE.md file. The clean fix is to keep your real instructions in AGENTS.md and make CLAUDE.md a thin wrapper that imports it with `@AGENTS.md`, so Codex, Cursor, and Claude Code all read the same source.

### Where should AGENTS.md live in a monorepo?

Put one at the repository root and add nested AGENTS.md files in any subproject that needs different rules. The file closest to the code being edited takes precedence, so a package-level file overrides the root for that package.

### Is AGENTS.md an official standard?

It is an open format stewarded by the Agentic AI Foundation under the Linux Foundation, adopted by tools including OpenAI Codex, Cursor, GitHub Copilot, Google's Jules, and Factory. It is supported across tens of thousands of open-source projects, though no single vendor owns it.

### How long should an AGENTS.md be?

Short and specific. The strongest files give an overview, the build and test commands, code style, and a few boundaries, then stop. Boilerplate and walls of text get ignored, so write only what an agent could not figure out by reading the code.
