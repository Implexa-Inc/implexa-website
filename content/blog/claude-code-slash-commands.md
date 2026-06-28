---
title: "Claude Code slash commands: how to create one"
slug: "claude-code-slash-commands"
description: "Claude Code slash commands are Markdown files in .claude/commands you invoke with a slash. How to write one, pass arguments, and how skills changed them."
publishedAt: "2026-06-28"
tags: ["claude-code", "slash-commands", "skills", "ai-agents", "automation"]
---

# Claude Code slash commands: how to create one

A Claude Code slash command is a saved prompt you invoke by typing a slash and a name, so a workflow you would otherwise retype every session becomes `/review` or `/changelog`. You write the prompt once as a Markdown file, drop it in a folder Claude Code watches, and from then on the command shows up in the `/` menu for you and anyone who clones the repo. The mechanic is small. The payoff is that your team stops pasting the same three-paragraph instruction into every chat.

Most people meet slash commands the second time they type the same long prompt. You explain how you want a PR reviewed, Claude does it well, and the next day you are typing the whole thing again from memory. A slash command is the fix: capture that prompt as a file, give it a name, and call it in one keystroke forever. This guide covers what a command is, where it lives, how to pass it arguments, what the frontmatter controls, and the change in 2026 that quietly folded commands into skills.

## What is a Claude Code slash command?

A slash command is a reusable prompt stored as a Markdown file and triggered by typing `/` followed by its name. Claude Code already ships built-in commands like `/clear`, `/help`, and `/model`, and a custom command is the same idea with your prompt behind it instead of Anthropic's. When you run it, the file's contents are sent to Claude as if you had typed them.

The distinction worth holding onto is between a command and a [skill](/blog/what-are-claude-skills). You invoke a command deliberately, every time, by name. A skill can load itself when Claude notices its description matches what you are doing. A command is the explicit lever you pull on purpose; that is its whole appeal for repeatable jobs where you always want the same instruction to run.

## Where do slash commands live, and how do you create one?

Slash commands are Markdown files in a `commands/` directory, and where you put that directory decides who can use the command. Project commands go in `.claude/commands/` and ship with the repo, so the whole team inherits them. Personal commands go in `~/.claude/commands/` and follow you across every project on your machine.

Creating one takes a single file. Make the directory, write the prompt, and the filename becomes the command name:

```markdown
# .claude/commands/changelog.md
Summarize the commits since the last tag into a changelog.
Group them under Added, Changed, and Fixed. Keep each line short.
```

Save that and `/changelog` is live the next time the `/` menu loads. Subdirectories namespace the command: a file at `.claude/commands/git/review.md` becomes `/git:review`, which is how a busy project keeps fifty commands from turning into an unreadable wall in the menu. There is nothing to register and no config to edit. The file's presence is the whole installation.

## How do you pass arguments to a slash command?

You pass arguments with placeholders that Claude Code substitutes before sending the prompt. The broad one is `$ARGUMENTS`, which is replaced by everything you type after the command name. The precise ones are `$1`, `$2`, and so on, which map to individual words for commands that take more than one input.

Put the placeholder anywhere in the file and the text lands there:

```bash
# .claude/commands/fix-issue.md contains:
#   Find and fix issue #$1. Follow our coding standards in $2.

/fix-issue 1234 CONTRIBUTING.md
# Claude receives: Find and fix issue #1234. Follow our coding standards in CONTRIBUTING.md.
```

`$ARGUMENTS` is the right choice when the input is a single blob, like a filename or a sentence. The numbered form earns its keep when the command genuinely has slots, such as an issue number and a style guide, that you want to reference separately. Two more touches make commands feel native: a line beginning with `!` runs a bash command and feeds its output into the prompt, and an `@` prefix pulls a file's contents in by path, so a command can gather its own context instead of waiting for you to paste it.

## What can the frontmatter do?

Optional YAML frontmatter at the top of the file sets metadata and guardrails for the command. It is enclosed in triple dashes and sits above the prompt, the same shape every Markdown file in the Claude ecosystem uses. None of it is required, but a few fields are worth setting on any command you share.

The ones that matter: `description` is the one-line summary shown in the `/` menu, and without it the menu just shows the filename, which ages badly once you have a dozen commands. `argument-hint` displays the expected arguments as you type, so `/fix-issue` can prompt you for an issue number instead of leaving you guessing. `allowed-tools` restricts which tools the command may use, so a review command can be locked to read-only and never edit a file, the same safety instinct behind a [PreToolUse hook](/blog/claude-code-hooks). And `model` pins the command to a specific model when the job wants a cheaper or stronger one than your session default. Set `description` and `allowed-tools` on anything that touches real work; treat the rest as polish.

## Slash commands or skills: what changed in 2026?

In Claude Code v2.1.3, custom slash commands were merged into skills, and the change was backwards compatible, so nothing you already wrote broke. A command at `.claude/commands/deploy.md` and a [skill](/blog/claude-code-skills) at `.claude/skills/deploy/SKILL.md` both create `/deploy` and run the same way when you invoke them. Your existing `commands/` files keep working exactly as before.

What the merge added was a clear recommendation about which surface to reach for next. A skill is the richer form: it gets its own directory for supporting files, frontmatter that controls whether you or Claude triggers it, and the ability to load automatically when it is relevant rather than only when you type its name. If a skill and a command share a name, the skill wins, and across scopes the usual order holds, with personal overriding project. The practical read for 2026 is simple. Keep your slash commands; they are still the fastest way to capture a prompt you always run by hand. When a job grows past a single prompt, wants reference files, or should fire on its own, graduate it into a skill using the [skill creation walkthrough](/blog/how-to-create-a-claude-skill). Commands are the quick capture. Skills are where they grow up.

## Where slash commands end and a control plane begins

A slash command is excellent at the single-session, single-machine layer, and it runs out of room the moment the work leaves your terminal. It can package a perfect prompt and hand it to you in one keystroke. It cannot run that prompt at 6am while you sleep, decide whether the output is safe to send to a customer, or pause before publishing to wait for your sign-off.

That ceiling shows up fast once you start [scheduling Claude Code](/blog/schedule-claude-code) to run on its own. A command fires inside one session, on one computer that has to be awake and watched by you. An agent running unattended needs more than an on-demand trigger: the result has to land somewhere you actually read, a step that would send or publish something has to stop and wait for one tap, and a risky action has to be gated whether you are at the keyboard or not. This is the seam [implexa](/) sits in. It is a control plane for agents that run inside your own Claude or Codex, so your commands and [skills](/blog/how-to-use-claude-skills) keep doing their job at the session level while approval, scheduling, and delivery happen at a level a Markdown file in `commands/` was never built to reach. The command is the keystroke. The control plane is what lets it run while you are not there.

## FAQ

### How do I create a custom slash command in Claude Code?

Create a Markdown file in `.claude/commands/` for a project command, or `~/.claude/commands/` for a personal one, and write your prompt inside it. The filename becomes the command name, so `deploy.md` gives you `/deploy`. It is available the next time the `/` menu loads, with nothing to register.

### How do I pass arguments to a slash command?

Use the `$ARGUMENTS` placeholder for all the text after the command name, or `$1`, `$2`, and so on for individual positional arguments. Claude Code substitutes them into the prompt before sending it, so `/fix-issue 1234` drops `1234` wherever `$1` appears in the file.

### Where do Claude Code slash commands live?

Project commands live in `.claude/commands/` and ship with the repository so the whole team shares them. Personal commands live in `~/.claude/commands/` and follow you across every project. Subdirectories namespace a command, so `.claude/commands/git/review.md` becomes `/git:review`.

### What is the difference between a slash command and a skill?

You invoke a slash command deliberately by typing its name. A skill can do the same, but it can also load itself automatically when its description matches your task, carry supporting files, and control who triggers it. Since Claude Code v2.1.3 commands are part of the skills system, and a skill wins if it shares a name with a command.

### Can a slash command run a shell command?

Yes. A line in the command file that begins with `!` runs a bash command, and its output is included in the prompt sent to Claude. Pair it with an `allowed-tools` entry in the frontmatter so the command is permitted to run bash, and the command can gather its own context before Claude acts.

### Do my existing slash commands still work after the skills merge?

Yes. The v2.1.3 merge of commands into skills was backwards compatible. Files in `.claude/commands/` keep working exactly as before, and you can adopt skills gradually for the workflows that have outgrown a single prompt.
