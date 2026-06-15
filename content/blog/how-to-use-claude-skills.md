---
title: "How to use Claude skills: trigger, invoke, and manage"
slug: "how-to-use-claude-skills"
description: "How to use Claude skills: how Claude triggers the right one, invoking one yourself with a slash command, passing arguments, and fixing skills that never fire."
publishedAt: "2026-06-15"
tags: ["claude-skills", "SKILL.md", "how-to", "claude-code"]
---

# How to use Claude skills

To use a Claude skill, you either let Claude load it on its own when your request matches what the skill is for, or you call it directly with a slash command. The skill runs the same way either way. Most of the time you do nothing and the right one loads in the background.

This is the practical side of skills: not what they are or how to write one, but how to actually run the skills you already have. If you want the concept first, the [what are Claude skills](/blog/what-are-claude-skills) guide covers it. This page is about the day to day: getting a skill to fire, forcing a specific one, passing it input, and figuring out why one sits there doing nothing.

## How do Claude skills work when you use one?

Claude reads the short `description` line from every installed skill, and when your prompt matches one, it loads that skill's full instructions and follows them. The description is doing all the matching, which is why it decides whether a skill ever runs.

Only the descriptions sit in context by default. The body of a skill, the actual steps, loads when the skill is triggered and then stays in the conversation. That design is what lets you keep dozens of skills installed without every one of them crowding the context window. You carry the table of contents at all times and pull the full chapter only when you need it.

## How do you get Claude to use a skill automatically?

You describe the task in plain language, and if a skill's description matches, Claude loads it without being told. This is the default and the way you will use skills most of the time.

Say you have a skill whose description is "draft release notes from recent git commits." You type "write up the release notes for this version" and Claude recognizes the match, loads the skill, and runs your steps. You never named the skill. The cleaner and more specific the description, the more reliably this happens, because Claude has a sharp target to match against instead of a vague one.

The flip side is worth knowing up front: a skill with a fuzzy description like "help with releases" gives Claude almost nothing to match, so it tends not to fire on its own. When automatic triggering feels unreliable, the description is nearly always the reason.

## How do you invoke a skill yourself?

Type `/skill-name` to run a skill directly, skipping the automatic match entirely. This is the manual override for when you want a specific skill regardless of how you phrase the request.

Explicit invocation earns its keep in a few spots. When two skills are close in meaning and you want a particular one, naming it removes the guesswork. When the wording you would naturally use does not quite match any description, the slash command runs it anyway. And for anything with a real side effect, like a deploy or a send step, calling it yourself means you decide the moment it runs rather than leaving that to the model.

## Can you pass arguments to a skill?

Yes. Anything you type after the slash command is handed to the skill and available inside its `SKILL.md` through the `$ARGUMENTS` placeholder, so `/fix-issue 4821` runs the skill with `4821` as its input.

That single feature is what turns a skill from a fixed macro into a small parameterized command. A skill that summarizes a pull request can take the PR number. A skill that drafts a reply can take the ticket ID. Inside the file, the procedure refers to `$ARGUMENTS` and works the input into the steps, which is why a well-written skill names what it expects near the top instead of hoping Claude infers it.

## How do you control which skills are available?

Where a skill lives decides who can use it, and Claude Code reads from a few scopes at once. A personal skill in `~/.claude/skills/` follows you across every project on your machine. A project skill in a repo's `.claude/skills/` is checked in, so everyone who clones the repo inherits it. Skills bundled inside a plugin show up once you install the plugin.

The practical upshot is that you choose the scope to choose the audience. Your own commit-message habit belongs in `~/.claude/skills/`, where it stays yours. The team's deploy runbook belongs in the project's `.claude/skills/`, where a new hire gets it without a Slack thread. If you are working in the Claude Code CLI specifically, the [Claude Code skills](/blog/claude-code-skills) guide goes deeper on the directories and the invocation flags.

## How do you use a skill you did not write?

You install it the same way you would your own, by putting the skill folder in one of the scopes Claude reads, and then it triggers like any other skill. The harder part is finding one worth installing.

Open-source libraries on GitHub collect hundreds of skills, and Anthropic ships a built-in set plus a format reference. The catch with a raw folder of community skills is that they all look equally trustworthy on disk, even the ones that quietly waste a turn. That is the gap a ranked index closes: [implexa](/) scores skills by whether they actually finished the job when someone ran them, so you pick by outcome instead of by filename, and it applies the skill in whatever agent you are already using. For where to browse, see [where to find Claude skills](/blog/where-to-find-claude-skills).

## Why does my Claude skill not trigger?

Almost always the `description`. If a skill never loads on its own, open the file and read the first few lines, because that is the exact text Claude is matching your request against. "Help with sales" matches nothing in particular. Rewrite it to name the situation and the action, something like "when the user mentions an upcoming meeting with a named company, pull recent activity and the last touch," and it starts firing.

The second usual suspect is scope. A personal skill in `~/.claude/skills/` will not appear for a teammate who cloned the repo, because it never left your machine. If a skill should be shared, move it into the project's `.claude/skills/` so it travels with the code. And if you recently edited a skill, note that Claude Code picks up changes to existing skills within the session, though creating the very first `~/.claude/skills/` directory takes a restart before it starts watching.

## FAQ

**Do I have to name a skill every time I want to use it?**
No. The normal path is automatic: you describe the task and Claude loads the matching skill on its own. Naming it with `/skill-name` is the override for when you want a specific one.

**What is the difference between using a skill and using a slash command?**
A skill can run both ways, automatically on a match or explicitly as `/skill-name`. A plain slash command only runs when you type it. The automatic triggering is the part a command alone does not give you.

**Can I use the same skill in more than one project?**
Yes. Put it in `~/.claude/skills/` and it is available in every project on your machine. Put it in a repo's `.claude/skills/` and it is scoped to that repo and anyone who clones it.

**How do I pass information into a skill?**
Type it after the slash command. Whatever you pass is available in the `SKILL.md` through `$ARGUMENTS`, so `/deploy staging` runs the deploy skill with `staging` as its input.

**Does using a skill cost extra?**
No. A skill is a markdown file Claude reads. It uses context like any other instruction, but there is no separate charge for running one.

**Why did Claude load the wrong skill?**
Usually two descriptions overlap, so Claude matched the request to the broader one. Tighten the descriptions so each names a distinct trigger, or invoke the one you want explicitly with its slash command.

## Next reads

- [What are Claude skills?](/blog/what-are-claude-skills) for the concept and the anatomy of a `SKILL.md`.
- [How to create a Claude skill step by step](/blog/how-to-create-a-claude-skill) for writing your own.
- [Claude Code skills](/blog/claude-code-skills) for the CLI scopes and invocation flags in detail.
- [Where to find Claude skills](/blog/where-to-find-claude-skills) for the libraries worth browsing.
