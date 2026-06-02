---
title: "How to use your Claude skills in Cursor, Codex, and Gemini"
slug: "use-claude-skills-in-cursor-codex-gemini"
description: "Your Claude skills already work in Cursor, Codex, and Gemini. Here are the SKILL.md portability rules, the directory map per agent, and how to skip the copy-paste."
publishedAt: "2026-06-02"
tags: ["SKILL.md", "cross-vendor", "claude-skills", "cursor", "codex"]
---

If you wrote a skill for Claude Code, you do not have to rewrite it to use it in Cursor, Codex, or Gemini. The file format is shared. This guide covers why SKILL.md is portable, where each agent looks for skills, and how to stop copying the same file into four places by hand.

## The short answer

A SKILL.md written for one coding agent runs in the others without changes. Claude Code, Codex, Cursor, and Gemini CLI all read the same open Agent Skills format: a Markdown file with YAML frontmatter (a name and a description of when to use it) followed by the procedure. The only thing that differs between agents is the folder they scan, so portability is mostly a question of where the file lives, not what is in it.

## Why SKILL.md is portable

It is portable because the format is an open standard, not a vendor feature. A skill is a plain Markdown file. The frontmatter names the skill and tells the agent when to load it. The body is the instructions. Nothing in that structure is specific to a single vendor, which is the entire point of the Agent Skills standard.

That means the same file is doing the same job in every agent: it loads on demand when your prompt matches the description, then the model follows the steps. A skill that scaffolds Stripe billing or writes a migration is just instructions, and instructions travel.

The practical limit is the body. If a step hardcodes a tool name or a path that only one agent has, that step will not work elsewhere. Keep the procedure tool-agnostic and the skill stays portable. Write "run the test suite" instead of naming one agent's specific command, and the same skill works across all of them.

## The directory map

Each agent loads skills from a known folder, and most of them also read the folders the others use. Here is where to put a SKILL.md so each tool picks it up:

- Claude Code reads `.claude/skills/` in your project and `~/.claude/skills/` in your home directory.
- Codex reads `.codex/skills/` in your project and `~/.codex/skills/` in your home directory.
- Cursor scans its own skills path and also reads the Claude and Codex directories, so a skill in `.claude/skills/` shows up in Cursor automatically.
- The cross-client convention that has emerged is `.agents/skills/`, which more clients are standardizing on.

The structure inside the folder is the same everywhere: one folder per skill, each containing a SKILL.md, plus optional subfolders for scripts, references, and assets. Drop a skill folder in the right place and the agent picks it up on its next run. No build step, no plugin, no conversion.

## The manual way, and why it does not scale

The obvious approach is to copy each skill into every agent's folder. It works for one skill and two tools. It falls apart fast.

The problem is drift. You fix a bug in your Claude copy of a skill, then forget to update the Codex and Cursor copies. Now three versions of the same skill disagree, and you cannot remember which one is current. Multiply that by twenty skills and four agents and you are maintaining eighty files that should be one.

Symlinks help a little. You can point `.codex/skills` at `.claude/skills` so both read one source. But symlinks are per-machine setup, they break when you clone the repo somewhere new, and they do nothing about the bigger question: which skill should you even be using for this task, and is it any good.

## The cross-vendor way

The better model is one ranked source that every agent reads from, instead of N copies you sync by hand. That is what [Implexa](/) does: it indexes skills across vendors, ranks them by whether they actually worked, and applies them in whatever agent you are in. You find a skill once and run it anywhere, and the ranking sharpens as more builders run the same skill.

This matters more than convenience. A folder of copied files treats every skill as equal. A ranked index knows which skill shipped the job and which one wasted a turn, because it sees the outcome, not just the file. That signal is something a local folder can never have. You can see the rankings on the [skill leaderboard](/scores), and for whole recurring jobs there are [workflows](/workflows) that stitch several ranked skills into one scheduled run.

So the cross-vendor question splits in two. Portability (running one file in every agent) is solved by the open format and the directory map above. Discovery and trust (finding the right skill and knowing it works) is the part the format does not solve, and that is the actual reason to use an index instead of a folder.

## FAQ

**Do Claude skills really work in Cursor and Codex unchanged?**
Yes, in almost all cases. The frontmatter and body are shared across the Agent Skills standard. A few clients add optional fields, but the core skill is portable as-is.

**Do I need a plugin to use a SKILL.md in another agent?**
No. The agents read the skill directories natively. A plugin only adds discovery and ranking on top, it is not required to run a skill you already have.

**Where do I put a skill so every agent sees it?**
Put it in `.claude/skills/` or the cross-client `.agents/skills/` folder. Cursor and several other clients also scan the Claude and Codex directories, so one location usually covers multiple agents.

**What makes a skill stop being portable?**
Hardcoding a vendor-specific tool name, command, or path in the body. Keep the steps tool-agnostic and the skill travels between agents cleanly.

**How do I know a skill is actually good before I use it?**
The file format does not tell you. That is what ranking is for: Implexa scores skills on whether they worked across real runs, so you pick by outcome instead of by guess. Browse the [top skills](/scores) to compare.

## The takeaway

Your skills are more portable than they feel. The format is open, the directories overlap, and one file genuinely runs everywhere. The copy-paste tax is self-inflicted. Stop syncing folders by hand, point your agents at one ranked source, and spend the saved time on the part that matters: writing skills worth running.
