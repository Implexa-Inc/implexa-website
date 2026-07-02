---
title: "Claude Code memory: how CLAUDE.md and auto memory work"
slug: "claude-code-memory"
description: "How Claude Code memory works: CLAUDE.md files, the load order and @import syntax, auto memory in ~/.claude, and when to use memory vs a skill, rule, or hook."
publishedAt: "2026-07-02"
tags: ["claude-code", "claude-md", "memory", "ai-agents", "claude"]
---

Every Claude Code session starts with an empty context window. It does not remember the correction you made yesterday, the build command it finally got right, or the one directory it keeps editing that it should leave alone. Memory is how that knowledge survives the gap between sessions, and Claude Code has two separate systems for it: the file you write, and the notes it writes for itself.

## What is Claude Code memory?

Claude Code loads two kinds of memory at the start of every conversation.

The first is **CLAUDE.md**, a plain Markdown file you write. It holds the standing instructions you would otherwise re-type each session: build and test commands, code style, project layout, "always do X" rules. You own it, and it says the same thing every time until you change it.

The second is **auto memory**, notes Claude writes itself as it works. When you correct it or it discovers something useful, like the fact that your tests need a local Redis instance, it can save that for next time without you lifting a finger. You own the file, but Claude is the author.

The split is the whole point. CLAUDE.md is where you tell Claude how you want it to behave. Auto memory is where Claude records what it has learned about your project on its own. Both load into context automatically; neither is enforced. If you need something to happen no matter what Claude decides, that is a job for a [hook](/blog/claude-code-hooks), not a memory file.

## Where CLAUDE.md files live

CLAUDE.md can sit in several places, each with a different scope. Claude loads them from broadest to most specific, so a project rule lands in context after a personal one and can refine it.

- **Managed policy** — an organization-wide file IT deploys to every machine. On macOS it lives at `/Library/Application Support/ClaudeCode/CLAUDE.md`, on Linux and WSL at `/etc/claude-code/CLAUDE.md`, on Windows at `C:\Program Files\ClaudeCode\CLAUDE.md`. Individual settings cannot exclude it, which is what makes it useful for compliance and security rules.
- **User** — `~/.claude/CLAUDE.md`, your personal preferences across every project on the machine.
- **Project** — `./CLAUDE.md` or `./.claude/CLAUDE.md`, the team-shared file you check into source control.
- **Local** — `./CLAUDE.local.md`, private per-project notes you add to `.gitignore` so they never get committed.

For most repositories a single project `CLAUDE.md` at the root is all you need. Reach for the others only when you actually have a personal preference or an org-wide policy that belongs at a different level.

The fastest way to start is `/init`. It reads your codebase and generates a CLAUDE.md with the build commands, test instructions, and conventions it can discover. If a CLAUDE.md already exists, it suggests improvements instead of overwriting it, and if your repo already has an [AGENTS.md](/blog/agents-md), it folds the relevant parts in.

## How CLAUDE.md files load

Claude Code walks up the directory tree from wherever you launched it, picking up every `CLAUDE.md` and `CLAUDE.local.md` along the way. Run it in `foo/bar/` and it loads `foo/bar/CLAUDE.md`, `foo/CLAUDE.md`, and any local files beside them.

All of those files are concatenated into context rather than overriding one another, ordered from the filesystem root down to your working directory. Instructions closest to where you launched are read last, and within a directory `CLAUDE.local.md` comes after `CLAUDE.md`, so your personal notes get the final word at that level. Files in subdirectories below you are not loaded up front; they join the context only when Claude reads a file in that subdirectory.

One small convenience worth knowing: block-level HTML comments (`<!-- like this -->`) are stripped before the file enters context, so you can leave notes for human maintainers without spending tokens on them.

## Importing files with @

A CLAUDE.md can pull in other files with `@path/to/file` syntax. The imported content is expanded and loaded at launch alongside the file that references it. Both relative and absolute paths work, relative ones resolving against the file doing the importing. Imports can nest, up to a maximum depth of four hops.

This is the clean answer to the AGENTS.md question. Claude Code reads CLAUDE.md, not [AGENTS.md](/blog/agents-md) — so if your repo already keeps its instructions in AGENTS.md for Codex, Cursor, and the rest, don't maintain two copies. Make CLAUDE.md a one-line wrapper:

```markdown
@AGENTS.md
```

Now every tool reads the same source, and you can still add Claude-specific lines below the import. To keep a path literal instead of importing it, wrap it in backticks. To share personal instructions across git worktrees, import from your home directory with something like `@~/.claude/my-project-notes.md`.

## Auto memory: what Claude remembers on its own

Auto memory (available in Claude Code v2.1.59 and later, on by default) lets Claude accumulate knowledge without you writing anything. As it works, it decides whether something is worth keeping for a future session and, if so, saves a note.

Those notes live in a per-repository directory at `~/.claude/projects/<project>/memory/`, derived from the git repository so every worktree in the same repo shares one memory. Inside, a `MEMORY.md` file acts as the index, with optional topic files like `debugging.md` or `api-conventions.md` beside it.

Only the first 200 lines (or 25KB) of `MEMORY.md` load at the start of each conversation; the topic files are read on demand when Claude needs them. That is why Claude works to keep `MEMORY.md` short and pushes detail into the topic files. When you see "Writing memory" or "Recalled memory" in the interface, this directory is what it is touching.

Everything here is plain Markdown you can read, edit, or delete. Run `/memory` to browse the auto memory folder and every CLAUDE.md and rule loaded in the current session, toggle auto memory on or off, and open any file in your editor. When you tell Claude "remember that we use pnpm, not npm," it saves that to auto memory; when you say "add this to CLAUDE.md," it writes to the file instead.

## What belongs in memory, and what doesn't

The most common mistake is stuffing everything into CLAUDE.md until it becomes a wall of text nobody reads. Because the file loads into context every session, length has a real cost: aim to keep each CLAUDE.md under 200 lines, and remember that vague instructions get followed less reliably than specific ones. "Run `npm test` before committing" beats "test your changes."

When an instruction outgrows a line or two, move it to the right home:

- **A multi-step procedure or a reusable capability** — a release checklist, a PR reviewer, a changelog writer — belongs in a [skill](/blog/what-are-claude-skills), which loads only when it is relevant instead of sitting in context all the time.
- **Rules that only matter for part of the codebase** belong in `.claude/rules/`, where you can scope them to file patterns with a `paths:` field so they load only when Claude touches matching files.
- **Something that must happen at a fixed moment**, like a check that always runs before a commit, belongs in a [hook](/blog/claude-code-hooks), because memory shapes behavior but never guarantees it.

That division of labor is also why persistent memory matters beyond a single session. An agent that records what it learns and reloads it next time is an agent that gets a little sharper every run rather than starting from zero — the difference between a tool you re-explain each morning and one that compounds. It is the same reason [Implexa](/) leans on your own Claude Code setup: the memory, skills, and context live with you, so the agents you build keep improving on your real work.

## Frequently asked questions

### Where should I put CLAUDE.md?

Start with a single `./CLAUDE.md` (or `./.claude/CLAUDE.md`) at your project root and check it into version control so your team shares it. Use `~/.claude/CLAUDE.md` for preferences that apply to every project, and `CLAUDE.local.md` (gitignored) for private per-project notes.

### Does Claude Code read AGENTS.md?

Not directly — it reads CLAUDE.md. If your repo already uses [AGENTS.md](/blog/agents-md), make your CLAUDE.md a one-line `@AGENTS.md` import (or a symlink) so Claude Code, Codex, and Cursor all read the same instructions from one source.

### How big should a CLAUDE.md be?

Target under 200 lines. Files loaded into every session compete for context, and longer files reduce how consistently Claude follows them. If yours is growing, split it with `.claude/rules/` or `@` imports and cut anything Claude could figure out by reading the code.

### What's the difference between CLAUDE.md and auto memory?

You write CLAUDE.md to give Claude instructions; Claude writes auto memory to record what it learns. CLAUDE.md holds standards and workflows and loads in full every session. Auto memory holds discovered facts like build commands and debugging insights, lives in `~/.claude/projects/<project>/memory/`, and loads its `MEMORY.md` index (first 200 lines) at startup.

### How do I see what Claude has memorized?

Run `/memory`. It lists every CLAUDE.md, CLAUDE.local.md, and rule loaded in your session, lets you toggle auto memory, and links to the auto memory folder. Every file there is plain Markdown you can edit or delete.

### When should I use a skill instead of memory?

Use a [skill](/blog/claude-code-skills) for a repeatable, multi-step procedure you want available on demand rather than loaded into every session. Keep CLAUDE.md for the always-on facts about how your project works, and reach for a skill when the instruction is really a workflow.
