---
title: "Where to find Claude Skills: 7 places to look in 2026"
slug: "where-to-find-claude-skills"
description: "Where to find Claude Skills in 2026: Anthropic's official library, the Claude Code marketplace, GitHub, third-party marketplaces, and cross-vendor search."
publishedAt: "2026-06-09"
tags: ["claude-skills", "skill-discovery", "SKILL.md", "marketplace", "claude-code"]
---

You find Claude Skills in seven places: Anthropic's official library, the Claude Code plugin marketplace, GitHub repositories, third-party skill marketplaces, curated security-reviewed catalogs, plugin directories, and cross-vendor search tools that index all of the above at once. Which one you reach for depends on whether you want something Anthropic vetted, something the community shipped last week, or something you can trust enough to run on a real codebase.

The catch is that "find" splits into two jobs. There is locating a `SKILL.md` file that exists somewhere, and there is deciding which of the thousands now floating around is worth the context budget it will eat. Most of the sources below are good at the first job. A few are starting to get serious about the second.

## What a Claude Skill actually is before you go looking

A Claude Skill is a folder with a `SKILL.md` file at its root, plus optional `scripts/`, `references/`, and `assets/` directories. The `SKILL.md` carries YAML frontmatter that tells Claude when to use the skill and a markdown body with the instructions it follows once triggered. That is the whole format, and it is why a skill written for Claude Code can run in Cursor or Codex with no translation. If you want the full anatomy, the [what are Claude Skills](/blog/what-are-claude-skills) guide walks the frontmatter field by field.

Knowing the shape matters for discovery because every source below is, underneath, just a different way of pointing you at a `SKILL.md`. Some host the file. Some link to a GitHub repo. Some only index the description so you can search across many at once.

## 1. Anthropic's official skills

Start with Anthropic if you want skills that are tested and maintained by the people who built the format. The official set lives at claude.com/skills and in Anthropic's public GitHub repositories, and it covers the document-heavy cases first: filling and parsing PDFs, generating slide decks, working with spreadsheets, that kind of thing. Anthropic also published a long-form authoring reference, "The Complete Guide to Building Skills for Claude," which doubles as a quality bar for everything else you will find.

These are the safest skills to install. They are also the narrowest. Anthropic is not going to ship you a skill for your company's deploy process or your specific CRM, so the official library is a floor, not a ceiling.

## 2. The Claude Code plugin marketplace

If you live inside Claude Code, the fastest place to find skills is the plugin marketplace built into the CLI itself. Skills ship as part of plugins, and you can browse and install them with the `/plugin` command without leaving your terminal. Anthropic runs an official marketplace, and you can add third-party marketplace sources by URL, which is how most teams distribute internal skills.

One thing that trips people up: Claude Code reads skills at session startup. Install one mid-session and it will not appear until you restart. Personal skills live in `~/.claude/skills/`, project skills in `.claude/skills/` at the repo root, and the file has to be named `SKILL.md` in exact uppercase. A lowercase `skill.md` is the single most common reason a freshly installed skill never triggers.

## 3. GitHub repositories

GitHub is where most community skills are born, and a search for "SKILL.md" or "claude skills" surfaces thousands of repos. The signal here is the same signal you already use for any open-source dependency: stars, recent commits, whether the README explains what the skill does, whether anyone has filed issues and gotten answers. A skill is just instructions, so you can read the entire thing before you trust it, which is a luxury you do not get with a compiled package.

The downside is that GitHub has no concept of skill quality or duplication. Search "PR review skill" and you will get forty variations of the same idea, none of them ranked, most of them abandoned. You are the curator.

## 4. Third-party skill marketplaces

Third-party marketplaces are the highest-volume option, and there are now several competing for the same catalog. claudeskills.info bills itself as a marketplace with both official and community skills. agentskill.club advertises thousands of free, open-source skills. skillsmp.com and skills.pub index skills across Claude, Codex, and ChatGPT, since they all read the same `SKILL.md`. The numbers these sites quote are large and climbing, and that is exactly the problem: volume without ranking is just a bigger haystack.

Use these when you know roughly what you want and need options. A marketplace is great for "show me every changelog-generator skill" and bad for "which one should I actually run." For the why behind that, see [how many Claude Skills is too many](/blog/how-many-claude-skills-is-too-many), which gets into the context-budget cost of hoarding skills you found but never pruned.

## 5. Curated, security-reviewed catalogs

When the skill is going to touch a real system, find it somewhere that reviews what it does first. A `SKILL.md` can tell Claude to run shell commands, hit your filesystem, or call external APIs, and a malicious or sloppy one can do real damage on a live codebase. Catalogs like agensi.io have started positioning around exactly this, offering skills that have been read and security-reviewed before they list them.

This category barely existed a year ago, and its growth tells you something about where the ecosystem is heading. The first wave of skill distribution was "more, faster." The second wave is "can I trust this enough to give it tool access," which is a harder and more valuable question.

## 6. Directories and aggregators

Directories are the right starting point when you do not yet know which marketplace has what you need. Sites like claudemarketplaces.com catalog the marketplaces, plugins, and MCP servers themselves rather than individual skills, so they work as a map of the territory. You go there to discover that a marketplace exists, then go to the marketplace to get the skill.

It is a thin layer, but a useful one early on, because the marketplace landscape changes fast enough that a hand-maintained list of "where the skills are" is worth bookmarking.

## 7. Cross-vendor search across every source

The last place to look is a search layer that indexes all the others at once, which is what you reach for when the question stops being "where is a skill" and becomes "what is the best skill for this, anywhere." This is the discovery problem, and it is the one implexa was built for: one index across the official library, GitHub, and the major marketplaces, with a [SkillRank](/resources/skill-rank) score that ranks every skill on quality and relevance so you are not manually comparing forty repos. Skills surface inside Claude Code and Codex as you work and apply inline, so there is no copy-paste and no install step.

The shift this represents is the same one search engines made for the early web. When there were a hundred pages you used a directory. When there were a billion you needed a ranked index. Skills are somewhere past the directory stage now, and a [skill graph](/resources/what-is-a-skill-graph) that connects, scores, and composes them is what the next stage looks like.

## How to install one once you have found it

Installing a skill is a copy operation: put the skill folder where Claude looks for it, then restart the session. For a personal skill, drop the folder containing `SKILL.md` into `~/.claude/skills/`. For a project skill that ships with a repo, put it in `.claude/skills/`. If you found the skill as part of a plugin, `/plugin install` handles the placement for you. Then start a fresh session, because the loader only scans at startup.

If a skill refuses to trigger after you install it, the cause is almost always one of three things: the file is not named `SKILL.md` in exact uppercase, you did not restart the session, or the description is too vague for Claude to know when to fire it. The [how to create a Claude Skill](/blog/how-to-create-a-claude-skill) walkthrough covers writing descriptions that actually trigger, and the same rules tell you which downloaded skills will work.

## How to pick a skill worth installing

Pick on description quality and tool scope, not star count. Read the frontmatter description first: if it does not clearly say when the skill should be used, Claude will not reliably trigger it, no matter how good the body is. Then read the body for what it touches. A skill that only writes prose is low-risk. A skill that runs scripts or hits your filesystem deserves the same scrutiny you would give a pull request from a stranger. Because a skill is plain text, you can do that review in two minutes, which is the best argument for the format.

The same `SKILL.md` you install will run across agents, so a skill you find for Claude Code also works in [Cursor, Codex, and Gemini](/blog/use-claude-skills-in-cursor-codex-gemini). Found once, used everywhere is the actual payoff of the open format.

## FAQ

### Where do I find official Claude Skills from Anthropic?

Anthropic's official skills are at claude.com/skills and in its public GitHub repositories. They cover document-centric tasks like PDFs, slides, and spreadsheets, and they are the most reliably maintained skills available.

### Are Claude Skills free?

Most skills are free and open source, since a skill is just a `SKILL.md` text file plus optional supporting files. You pay for the Claude usage that runs them, not for the skill itself. Some curated or security-reviewed catalogs may charge for vetting.

### Where does Claude Code look for skills on my machine?

Personal skills go in `~/.claude/skills/` and project skills in `.claude/skills/` at the root of the repo. Claude Code scans both at session startup, so a skill installed mid-session will not appear until you restart.

### How do I find the best skill instead of just any skill?

Use a cross-vendor search layer that indexes multiple sources and ranks them, rather than browsing one marketplace at a time. Ranking matters once the same idea exists in dozens of near-identical copies, which is now true for most common skills.

### Can I use a skill I found for Claude in other coding agents?

Yes. The `SKILL.md` format is read by Cursor, Codex, and Gemini, among others, so a skill you download for Claude Code generally runs in those agents with no changes. The directory each agent reads from differs, but the file does not.

### Is it safe to install community skills?

It depends on what the skill does. A skill that only generates text is low-risk; one that runs shell commands or accesses your files can do real harm. Read the body before installing, or get the skill from a catalog that security-reviews its listings.

The honest summary: locating a Claude Skill is easy and getting easier, with new marketplaces appearing most months. Deciding which one to trust with tool access on a real project is the part still worth slowing down for. Start at the official library, reach for GitHub and the marketplaces when you need range, and lean on a ranked cross-vendor index when the haystack gets too big to read by hand.
