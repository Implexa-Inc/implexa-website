---
title: "Claude Code skills: how they work and how to build one"
slug: "claude-code-skills"
description: "Claude Code skills are SKILL.md folders that load on demand in your terminal. Where they live, the three scopes, how to invoke them, and how to build one."
publishedAt: "2026-06-12"
tags: ["claude-code", "claude-skills", "SKILL.md", "explainer", "tutorial"]
---

# Claude Code skills: how they work and how to build one

A Claude Code skill is a folder with a `SKILL.md` file that Claude Code loads on demand when your prompt matches what the skill is for. It lives on your filesystem, not behind an upload screen, and the agent decides on its own when to pull it in.

If you have used skills on claude.ai, the idea carries over but the mechanics are different in the terminal. This guide covers what a Claude Code skill actually is, the three places Claude Code looks for one, how invocation works, and the short path to writing your first.

## What are Claude Code skills?

Claude Code skills are reusable instruction packs that the CLI discovers from disk and loads into context when they are relevant. Each one is a directory containing a single required file, `SKILL.md`, which holds a few lines of YAML metadata followed by the procedure you want Claude to follow. There is no compile step and no registry. Drop the folder in the right place, restart Claude Code, and the skill is live.

The point of a skill is to stop re-explaining the same multi-step task. Instead of pasting the same prompt about how your team formats a release note or how your migrations are structured, you write it once. From then on Claude reads the `description`, recognizes the task, and runs the steps the same way every time.

## Where does Claude Code look for skills?

Claude Code reads skills from three locations, and the location decides who can use the skill. Knowing the difference is most of what trips people up.

- **Personal skills** live in `~/.claude/skills/<name>/SKILL.md`. They follow you across every project on your machine. Use this scope for your own habits: a commit-message format, a code-review checklist, the way you like changelogs written.
- **Project skills** live in `.claude/skills/<name>/SKILL.md` inside a repository. Because they are checked into the repo, everyone who clones it gets them. This is the scope for shared team conventions, the ones a new hire should inherit without a Slack thread.
- **Plugin skills** ship inside an installed plugin. When you add a plugin to your Claude Code marketplace, its bundled skills become available alongside yours. This is how a tool like implexa adds a whole set of skills in one install rather than asking you to copy files by hand.

When two skills could match the same request, project scope is the one your team standardizes on, so it is the safest place for anything that should stay consistent across people.

## What goes inside a SKILL.md?

A `SKILL.md` is plain Markdown with a YAML frontmatter block on top, and only two fields are required. The frontmatter names the skill and tells Claude when to reach for it:

```markdown
---
name: changelog-from-commits
description: Use when the user wants a changelog or release notes built from recent git commits.
---

Read the commits since the last tag. Group them into Added, Changed, Fixed.
Write each line in past tense, user-facing, no internal ticket numbers.
```

`name` is the skill's identifier. `description` is the part that does the real work, because Claude uses it to decide whether the current task is a match. A vague description like "help with releases" rarely fires. A specific one that names the trigger ("when the user wants a changelog or release notes built from recent git commits") fires reliably. Everything under the frontmatter is just instructions, and you can grow it from three lines to a full runbook with scripts and reference files as the workflow earns it.

## How do you invoke a Claude Code skill?

There are two ways a skill runs: Claude loads it automatically when your request matches the description, or you call it directly with a slash command. Most of the time you do nothing. You ask for the thing, Claude sees the match, and the skill loads silently in the background.

When you want to force it, type `/skill-name`. You can also pass input. Both you and Claude can hand a skill arguments, which show up inside the file through the `$ARGUMENTS` placeholder. That makes a skill behave like a small parameterized command, for example `/deploy staging`.

Two frontmatter flags take over when the default is not what you want:

- `disable-model-invocation: true` means only you can trigger the skill, never the model. Reach for this on anything with a side effect you want to time yourself, like `/commit`, `/deploy`, or a send-message skill.
- `user-invocable: false` means only Claude can load it, never you with a slash. This fits background knowledge that is not a command, like a style guide the model should consult but you would never type by hand.

## How is this different from skills on claude.ai?

The format is identical, but Claude Code reads skills from your filesystem while claude.ai has you upload them. On claude.ai you package a skill folder as a ZIP, go to Customize then Skills, and turn on code execution before it runs. In Claude Code there is no ZIP and no upload screen. The skill is a directory on disk that the CLI scans at startup, which is why editing a skill is just editing a file and reloading.

That difference matters for how you work. A `SKILL.md` you write for Claude Code is the same file that runs in Cursor, Codex, and Gemini CLI, because they all read the open Agent Skills format. If you want the portability rules, see [how to use your Claude skills in Cursor, Codex, and Gemini](/blog/use-claude-skills-in-cursor-codex-gemini).

## How to build your first Claude Code skill

Building a skill takes about five minutes, and the honest first version is short. Here is the whole loop.

1. **Pick one repeatable task.** Something you have prompted for more than twice. A 3 to 7 step job with a clear input and output works best.
2. **Make the folder.** Create `~/.claude/skills/my-skill/` for a personal skill, or `.claude/skills/my-skill/` to share it with your repo.
3. **Write `SKILL.md`.** Start with the frontmatter `name` and `description`, then the steps in plain language. Do not over-engineer it. Three clear sentences beat a clever script you will not maintain.
4. **Restart Claude Code** so it picks up the new folder.
5. **Test the trigger.** Open a fresh conversation and ask the kind of question that should fire the skill. If it loads and follows your steps, you are done. If it does not, the description is usually the culprit.

Once it works, you grow it the way you find the gaps: add the edge case you actually hit, tighten the output format, drop in a reference file. The first version is a rough cut you sharpen over a few real runs. For the longer walkthrough with recording and team sharing, read [how to create a Claude skill step by step](/blog/how-to-create-a-claude-skill).

## When skills do not trigger

The fix is almost always the `description`, because that single line is what Claude reads to decide. If your skill never loads on its own, open the file and look at the first few lines. A trigger like "help with sales" gives the model nothing to match against. Rewrite it to name the exact situation: "when the user mentions an upcoming meeting with a named company, pull their recent activity and last touch." Specific descriptions fire, and generic ones sit there.

The second most common issue is scope confusion. A personal skill in `~/.claude/skills/` will not show up for a teammate who cloned the repo, because it never left your machine. If a skill should be shared, it belongs in the project's `.claude/skills/` so it travels with the code.

## How Claude Code skills fit a bigger system

One skill saves you a prompt. The leverage shows up once you have twenty of them and need to know which fire, which overlap, and which actually moved an outcome. That is the layer above a single `SKILL.md`, and it is where a control plane earns its keep: keeping your skills discoverable, shared at the right scope, and measured. If you want the structure that connects many skills, read [what is a skill graph](/resources/what-is-a-skill-graph).

## FAQ

**Are Claude Code skills the same as slash commands?**
Not quite. A skill can be invoked as a slash command, but it can also load automatically when Claude recognizes the task. A plain slash command only runs when you type it. Skills do both, which is the main reason to use one.

**Where are Claude Code skills stored?**
In three places: `~/.claude/skills/` for personal skills, a repo's `.claude/skills/` for project skills, and inside any installed plugin for plugin skills. Claude Code scans all three at startup.

**Can I use one skill across every project?**
Yes. Put it in `~/.claude/skills/` and it is available in every project on your machine. Put it in a repo's `.claude/skills/` and it is scoped to that repo and anyone who clones it.

**Do Claude Code skills cost extra?**
No. A skill is a Markdown file Claude reads. It uses context like any other instruction, but there is no separate charge for having or running one.

**Can a skill take arguments?**
Yes. Anything passed when the skill is invoked is available through the `$ARGUMENTS` placeholder inside `SKILL.md`, so you can write commands like `/deploy staging` that branch on the input.

## Next reads

- [What are Claude skills?](/blog/what-are-claude-skills) for the 5-minute concept.
- [How to create a Claude skill step by step](/blog/how-to-create-a-claude-skill) for the full build with recording and sharing.
- [Where to find Claude skills](/blog/where-to-find-claude-skills) for the libraries worth browsing.
