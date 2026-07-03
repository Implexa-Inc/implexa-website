---
title: "Claude Code settings.json: the complete config guide"
slug: "claude-code-settings-json"
description: "Claude Code settings.json controls permissions, environment variables, the model, and hooks. Where each file lives, how they layer, and what the keys do."
publishedAt: "2026-07-03"
tags: ["claude-code", "settings", "configuration", "permissions", "hooks"]
---

Claude Code reads its behavior from a file called `settings.json`: what it can run without stopping to ask, which environment variables every session inherits, which model it defaults to, and what fires on each lifecycle event. Most people meet this file the first time Claude Code interrupts a run to ask permission for a command they trust, and they go looking for the switch that makes the interruption stop. That switch lives here. This guide walks the file top to bottom, grounded in the [official settings reference](https://code.claude.com/docs/en/settings), and shows the handful of keys that matter for day-to-day work before the long tail of managed-policy options nobody touches.

We run Claude Code unattended at implexa, hundreds of scheduled agent runs a week with no human at the keyboard, and `settings.json` is the difference between a run that finishes and a run that hangs on a permission prompt at 3am. So the advice below is not theoretical.

## What is the Claude Code settings.json file?

`settings.json` is a JSON configuration file that tells Claude Code how to behave across every session. It is separate from your `CLAUDE.md` memory file: memory carries instructions and project context in prose, while `settings.json` carries machine-readable configuration like permission rules, environment variables, and hook definitions. A rough way to hold the two apart is that `CLAUDE.md` is what Claude reads, and `settings.json` is what the harness enforces.

The file is plain JSON, so no comments and no trailing commas. If Claude Code silently ignores a change you made, a stray comma is the first thing to check.

## Where does settings.json live?

There are five places Claude Code looks, each with a different scope and owner. From highest priority to lowest:

| Scope | Location | Committed to git? |
|-------|----------|-------------------|
| Managed | `/etc/claude-code/managed-settings.json` (or the OS equivalent) | Deployed by IT |
| Command line | `--settings` flag and other CLI args | No |
| Local | `.claude/settings.local.json` | No, gitignored |
| Project | `.claude/settings.json` | Yes |
| User | `~/.claude/settings.json` | No |

The two you will edit by hand are the user file at `~/.claude/settings.json`, which follows you across every project on your machine, and the project file at `.claude/settings.json`, which you commit so a teammate who clones the repo inherits the same rules. The local file is for the exceptions you do not want in git, like a permission you granted for your machine alone.

## How do the settings files layer?

Higher-priority files win key by key, they do not replace the whole file. If your user settings allow `Bash(npm run test:*)` and the project settings deny `Bash(curl *)`, both rules apply, because they touch different keys. When two files set the same key, the higher-priority one takes it. Managed settings sit at the top of that stack on purpose: an organization can enforce a `deny` rule that an individual developer cannot override from their own file. For everyone else the mental model is simple. Machine-wide defaults go in the user file, per-project rules go in the project file, and personal one-offs go in the local file.

## What goes in the permissions object?

The `permissions` object is where you decide which tools Claude Code runs on its own, which ones it pauses to ask about, and which ones are off-limits. It has three lists plus a couple of modifiers:

```json
{
  "permissions": {
    "allow": ["Bash(npm run lint)", "Bash(npm run test:*)", "Read(~/.zshrc)"],
    "ask": ["Bash(git push:*)"],
    "deny": ["Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)"],
    "defaultMode": "acceptEdits",
    "additionalDirectories": ["~/shared-tools"]
  }
}
```

`allow` runs automatically. `ask` stops for a yes on each occurrence. `deny` blocks outright, and deny wins over allow when a command matches both, which is what makes it safe to allow a broad pattern and carve out the dangerous cases. `defaultMode` sets the baseline behavior when nothing matches, and `additionalDirectories` grants read access to paths outside the working directory.

Two things save real pain here. First, put your secrets in `deny` so a `Read(./.env)` never lands in a transcript. Second, scope your `allow` patterns tightly. `Bash(npm run test:*)` is a good rule; a blanket `Bash(*)` hands over the shell, and you will regret it the first time a run decides a `rm` is the reasonable next step. Permission rules take effect the moment you save, so you can tune them mid-session without a restart.

## How do you set environment variables?

The `env` key is a flat map of strings that Claude Code injects into every session and every subprocess it spawns. This is how you point Claude Code at a proxy, set a region, or feed a value to a tool without exporting it in your shell profile. A minimal example is `"env": { "NODE_ENV": "development", "AWS_REGION": "us-east-1" }`, and you can add as many pairs as you need.

Because these reach every subprocess, `env` is also how you keep an unattended run from prompting for something a subprocess needs. Do not put long-lived secrets here in a committed project file, though. For anything sensitive that has to rotate, `apiKeyHelper` runs a command that returns the value at request time, which keeps the raw secret out of the file entirely.

## How do you choose the model?

The `model` key overrides the default model for the session, for example `"model": "claude-sonnet-5"`. If you want a hard list of what is selectable, `availableModels` is an allowlist, and `fallbackModel` names what to use when the primary is unavailable. One catch worth knowing: `model` and `outputStyle` are read once at startup, so changing them mid-session does nothing until you restart. Compare that to `permissions` and `hooks`, which reload live.

## How do hooks fit in?

The `hooks` key runs your own shell commands at defined lifecycle events, like before a tool call or when a session starts. A hook is how you make a rule the harness enforces rather than a request Claude might forget: format-on-save, a pre-commit guard, a notification when a long run finishes. Because hooks are their own topic with their own matchers and payloads, the mechanics live in the [Claude Code hooks guide](/blog/claude-code-hooks). What matters for `settings.json` is only that the definition sits here, and that edits to it apply without a restart.

## Which settings reload live, and which need a restart?

Some keys reload the instant you save, and a few are read only when Claude Code boots. `permissions`, `hooks`, `apiKeyHelper`, and the credential helpers all reload live, which is why you can tighten a permission rule in the middle of a run. `model` and `outputStyle` are read at startup, so a change to either waits for the next session. When a config edit seems to do nothing, this split is usually why.

## A starter settings.json worth copying

Here is a project file that covers the common cases without overreaching:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": ["Bash(npm run lint)", "Bash(npm run test:*)", "Bash(git diff:*)", "Bash(git log:*)"],
    "deny": ["Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)"],
    "defaultMode": "acceptEdits"
  },
  "env": { "NODE_ENV": "development" },
  "cleanupPeriodDays": 30
}
```

The `$schema` line is the one addition people skip and then miss. Point it at `https://json.schemastore.org/claude-code-settings.json` and VS Code, Cursor, or any editor that reads JSON schema will autocomplete the keys and flag a typo before it costs you a confused debugging session. `cleanupPeriodDays` controls how long session files and orphaned subagent worktrees stick around, and 30 is the default.

## How we use settings.json to run Claude Code unattended

The unattended case exposes what the interactive case hides. When there is no human to click "yes," every `ask` is a stall, so a scheduled agent needs its real tool surface in `allow` and its dangerous edges in `deny`, with nothing left to prompt on. We lean on `env` to hand each run the endpoints and values it needs so no subprocess ever blocks, and on a `SessionStart` hook to arm work the moment a session wakes up. It took a few silent 3am hangs to learn that a single un-allowed command is enough to freeze an entire run, which is the whole reason the permission model is worth setting up deliberately rather than clicking through prompts forever. If scheduling Claude Code is where you are headed, the [guide to running Claude Code on its own](/blog/schedule-claude-code) picks up there.

## FAQ

### Where is the Claude Code settings.json file?

Your personal settings are at `~/.claude/settings.json`, and a project's shared settings are at `.claude/settings.json` in the repo root. Machine-wide managed settings, when an organization deploys them, live at `/etc/claude-code/managed-settings.json` or the operating system's equivalent.

### What is the difference between settings.json and settings.local.json?

`settings.json` in a project is meant to be committed to git and shared with your team, while `settings.local.json` is gitignored and holds the personal overrides you do not want to push, such as a permission you granted only for your own machine. The local file takes priority over the committed project file.

### How do I stop Claude Code from asking permission for a command?

Add the command to the `allow` list in `permissions`, for example `"Bash(npm run test:*)"`. Scope the pattern to the specific commands you trust rather than allowing the whole shell, and keep secrets and destructive commands in `deny`, which overrides `allow` on any command that matches both.

### Can settings.json have comments?

No. It is standard JSON, so comments and trailing commas will break it. If a change is being ignored, check for a syntax error first, then confirm a higher-priority file is not overriding the same key.

### What is the difference between settings.json and CLAUDE.md?

`settings.json` is machine-readable configuration the harness enforces: permissions, environment variables, hooks, and the model. `CLAUDE.md` is prose memory that Claude reads for project context and instructions. You can learn more in the [Claude Code memory guide](/blog/claude-code-memory).

Once the file is set the way you want, the next step is deciding what Claude Code actually does with that freedom. Wiring up an [MCP server](/blog/claude-code-mcp), writing a [skill](/blog/claude-code-skills), or letting it [plan before it edits](/blog/claude-code-plan-mode) are all cleaner to reason about once the permission model underneath them is settled.
