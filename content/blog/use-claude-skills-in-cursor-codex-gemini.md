---
title: "how to use your claude skills in cursor, codex, and gemini"
slug: "use-claude-skills-in-cursor-codex-gemini"
description: "your claude skills already work in cursor, codex, and gemini. here are the SKILL.md portability rules, the directory map per agent, and how to skip the copy-paste."
publishedAt: "2026-06-02"
tags: ["SKILL.md", "cross-vendor", "claude-skills", "cursor", "codex"]
---

if you wrote a skill for claude code, you do not have to rewrite it to use it in cursor, codex, or gemini. the file format is shared. this guide covers why SKILL.md is portable, where each agent looks for skills, and how to stop copying the same file into four places by hand.

## the short answer

a SKILL.md written for one coding agent runs in the others without changes. claude code, codex, cursor, and gemini cli all read the same open agent skills format: a markdown file with yaml frontmatter (a name and a description of when to use it) followed by the procedure. the only thing that differs between agents is the folder they scan, so portability is mostly a question of where the file lives, not what is in it.

## why SKILL.md is portable

it is portable because the format is an open standard, not a vendor feature. a skill is a plain markdown file. the frontmatter names the skill and tells the agent when to load it. the body is the instructions. nothing in that structure is specific to a single vendor, which is the entire point of the agent skills standard.

that means the same file is doing the same job in every agent: it loads on demand when your prompt matches the description, then the model follows the steps. a skill that scaffolds stripe billing or writes a migration is just instructions, and instructions travel.

the practical limit is the body. if a step hardcodes a tool name or a path that only one agent has, that step will not work elsewhere. keep the procedure tool-agnostic and the skill stays portable. write "run the test suite" instead of naming one agent's specific command, and the same skill works across all of them.

## the directory map

each agent loads skills from a known folder, and most of them also read the folders the others use. here is where to put a SKILL.md so each tool picks it up:

- claude code reads `.claude/skills/` in your project and `~/.claude/skills/` in your home directory.
- codex reads `.codex/skills/` in your project and `~/.codex/skills/` in your home directory.
- cursor scans its own skills path and also reads the claude and codex directories, so a skill in `.claude/skills/` shows up in cursor automatically.
- the cross-client convention that has emerged is `.agents/skills/`, which more clients are standardizing on.

the structure inside the folder is the same everywhere: one folder per skill, each containing a SKILL.md, plus optional subfolders for scripts, references, and assets. drop a skill folder in the right place and the agent picks it up on its next run. no build step, no plugin, no conversion.

## the manual way, and why it does not scale

the obvious approach is to copy each skill into every agent's folder. it works for one skill and two tools. it falls apart fast.

the problem is drift. you fix a bug in your claude copy of a skill, then forget to update the codex and cursor copies. now three versions of the same skill disagree, and you cannot remember which one is current. multiply that by twenty skills and four agents and you are maintaining eighty files that should be one.

symlinks help a little. you can point `.codex/skills` at `.claude/skills` so both read one source. but symlinks are per-machine setup, they break when you clone the repo somewhere new, and they do nothing about the bigger question: which skill should you even be using for this task, and is it any good.

## the cross-vendor way

the better model is one ranked source that every agent reads from, instead of N copies you sync by hand. that is what [implexa](/) does: it indexes skills across vendors, ranks them by whether they actually worked, and applies them in whatever agent you are in. you find a skill once and run it anywhere, and the ranking sharpens as more builders run the same skill.

this matters more than convenience. a folder of copied files treats every skill as equal. a ranked index knows which skill shipped the job and which one wasted a turn, because it sees the outcome, not just the file. that signal is something a local folder can never have. you can see the rankings on the [skill leaderboard](/scores), and for whole recurring jobs there are [workflows](/workflows) that stitch several ranked skills into one scheduled run.

so the cross-vendor question splits in two. portability (running one file in every agent) is solved by the open format and the directory map above. discovery and trust (finding the right skill and knowing it works) is the part the format does not solve, and that is the actual reason to use an index instead of a folder.

## faq

**do claude skills really work in cursor and codex unchanged?**
yes, in almost all cases. the frontmatter and body are shared across the agent skills standard. a few clients add optional fields, but the core skill is portable as-is.

**do i need a plugin to use a SKILL.md in another agent?**
no. the agents read the skill directories natively. a plugin only adds discovery and ranking on top, it is not required to run a skill you already have.

**where do i put a skill so every agent sees it?**
put it in `.claude/skills/` or the cross-client `.agents/skills/` folder. cursor and several other clients also scan the claude and codex directories, so one location usually covers multiple agents.

**what makes a skill stop being portable?**
hardcoding a vendor-specific tool name, command, or path in the body. keep the steps tool-agnostic and the skill travels between agents cleanly.

**how do i know a skill is actually good before i use it?**
the file format does not tell you. that is what ranking is for: implexa scores skills on whether they worked across real runs, so you pick by outcome instead of by guess. browse the [top skills](/scores) to compare.

## the takeaway

your skills are more portable than they feel. the format is open, the directories overlap, and one file genuinely runs everywhere. the copy-paste tax is self-inflicted. stop syncing folders by hand, point your agents at one ranked source, and spend the saved time on the part that matters: writing skills worth running.
