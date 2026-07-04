---
title: "Claude skills vs plugins: which should you build?"
slug: "claude-skills-vs-plugins"
description: "Claude skills vs plugins, settled: what each one is, when a skill is enough, when to package it as a plugin, a decision table, and how the two fit together."
publishedAt: "2026-07-04"
tags: ["claude-skills", "plugins", "claude-code", "comparison"]
---

# Claude skills vs plugins

A skill is one instruction pack. A plugin is the box you put skills in so other people can install them. So the real question is rarely "skill or plugin" the way "skills or MCP" is a genuine fork in the road. It is "I have a skill, when does it need to become a plugin," and the answer turns entirely on whether anyone but you will ever run it.

This page settles that. You will get what each one actually is, a table that maps your situation to the right move, the specific moment a loose skill should graduate into a packaged plugin, and the question that shows up after you have shipped either one.

If you have never written a skill, start with [what are Claude skills](/blog/what-are-claude-skills) and come back. This is the page for when you already have one and are staring at a teammate's message asking how to get it.

## The one-sentence answer

Build a skill when you want Claude to do a task consistently; wrap it in a plugin when you want to distribute, version, and reuse that skill across people and projects. A skill solves the "Claude keeps doing this differently" problem. A plugin solves the "now three of us need it and nobody knows which copy is current" problem. Almost every plugin exists because a skill outgrew a single folder on a single laptop.

## What a Claude skill actually is

A Claude skill is a directory whose one required file is `SKILL.md`, loaded on demand when a task matches its trigger description. That file holds three things: a description that tells Claude when to reach for it, a procedure, and the shape of the output. Claude reads the description, and when your request fits, it loads the skill, runs the steps, and returns the result in the format you asked for. In Claude Code there is no build step and no upload. The file sits in a directory and Claude finds it.

The detail worth keeping is that a skill can carry deterministic code, not only prose. Drop a script next to `SKILL.md`, have the skill call it, and the step that should run identically every time actually does. That is the line between a skill and a prompt you keep re-pasting. If you want the full anatomy, [how to create a Claude skill](/blog/how-to-create-a-claude-skill) walks all six pieces.

A skill, on its own, has one weakness that has nothing to do with what it does. It is a folder. Folders get copied, and copies drift.

## What a Claude plugin actually is

A Claude plugin is a bundle of extensions packaged as one named, versioned, installable unit, defined by a manifest at `.claude-plugin/plugin.json`. It can hold a lot more than skills. Commands, [subagents](/blog/claude-code-subagents), [hooks](/blog/claude-code-hooks), [MCP servers](/blog/claude-skills-vs-mcp), even LSP servers and background monitors all travel inside the same package, each in its own directory at the plugin root. The manifest itself is tiny: a name, a description, a version.

The name earns its keep. It identifies the plugin in the manager and namespaces every skill inside it, so a skill called `review` becomes `/my-plugin:review` and never collides with someone else's `review`. Installing one is two commands: add a marketplace, then install from it. When the author ships a fix, `/plugin marketplace update` pulls it, and everyone is on the same version without a folder-sharing thread. The full walkthrough lives in [Claude Code plugins](/blog/claude-code-plugins).

So a plugin is not a competitor to a skill. It is the shipping container a skill rides in once it needs to leave your machine.

## The decision table

Match your situation to the row. This is the part to screenshot.

| Your situation | Build this | Why |
|---|---|---|
| Claude keeps doing one task a slightly different way each time | Skill | The problem is consistency; a `SKILL.md` fixes the procedure |
| The skill works and only you will ever use it | Skill, left loose in `.claude/skills/` | Zero packaging ceremony, short `/name` trigger, easy to keep editing |
| A teammate asks for your skill and you are about to zip a folder | Plugin | Packaging ends the copy-paste drift the moment a second person is involved |
| You want the same skill in three repos, all on the same version | Plugin | A version number is what lets you answer "which copy is current" |
| You have a skill plus a hook plus an MCP server that belong together | Plugin | One package installs and updates the whole set as a unit |
| You want the behavior across Claude Code, Codex, and Cursor | Skill | `SKILL.md` is portable on its own; see the [cross-vendor guide](/blog/use-claude-skills-in-cursor-codex-gemini) |

If you keep one rule: consistency points to a skill, distribution points to a plugin, and you almost always write the skill first.

## When a skill should graduate into a plugin

Package a skill as a plugin the first time the answer to "who else runs this" stops being "nobody." Until then, a loose skill in `.claude/skills/` is the right call. You get a bare `/deploy` with no namespace prefix, you edit it in place, and you owe no one a changelog. That freedom is the whole point of the un-packaged stage, and rushing past it just to have a `plugin.json` is busywork.

Three signals mean the skill has outgrown the folder. A second person wants it. You need it in more than one project. Or you have started asking which copy is the current one, which means the copies have already diverged. When any of those is true, the plugin is worth the version number.

Graduating is cheap. Copy the loose skill into a plugin directory, move any hooks from `settings.json` into `hooks/hooks.json` unchanged, add the small manifest, and run `claude plugin validate` before you publish. The honest workflow is to start loose, prove the thing earns its keep, and package it once it has an audience. A version is cheap to add up front and expensive to retrofit onto a habit nobody wrapped.

## Using them together

The clean setup is a skill built first and a plugin wrapped around it later, along with everything else that skill needs to work. implexa itself ships this way: it is a Claude Code plugin, and inside it are the skills that find and run agents, the commands that schedule them, and the MCP server that connects the whole thing to your library. You install one plugin and the skills come with it, versioned together, instead of chasing seven loose folders that drift out of sync by Thursday.

That is the pattern to copy. Write the procedure as a skill so Claude does the task your way. When the skill needs a connection, a background watcher, or a scheduled trigger to be genuinely useful, bundle all of it into one plugin so installing the capability is a single named unit rather than a setup guide. The skill is the work. The plugin is how the work travels.

## The part that outlasts the choice

Picking skill or plugin is the easy half; the hard half is knowing which skill is worth installing in the first place. As of mid-2026 there are more than forty thousand skills scattered across Anthropic, the community marketplaces, GitHub, and a handful of vendor directories, and quite a few are saved prompts wearing a `SKILL.md` costume. Packaging a weak skill as a tidy plugin just distributes the weakness faster. You cannot tell from a name whether a skill is sharp or whether it will drift the first time an input changes.

This is the problem that shows up after the build-versus-package decision, and it is the one implexa is built for. A [skill graph](/resources/what-is-a-skill-graph) indexes skills across every vendor, and [SkillRank](/resources/skill-rank) scores them on whether they actually work, so you install the one that earns its place instead of the one that sorted first. Choosing how to ship a skill matters. Choosing a skill that is worth shipping matters more.

## FAQ

### Is a Claude plugin just a bundle of skills?

Mostly, but not only. A plugin can bundle skills, commands, subagents, hooks, MCP servers, LSP servers, and monitors, all as one named and versioned unit. Many plugins ship nothing but skills, which is why they get conflated, but the plugin is the container and the skill is one kind of thing it can hold.

### Do I need a plugin to use a skill?

No. A loose skill in `.claude/skills/` works immediately with no manifest and no packaging. You only need a plugin when you want to share, version, or reuse that skill across people and projects. Solo work on one machine never requires the extra step.

### Does packaging a skill as a plugin change how it runs?

Barely. The main visible change is the trigger: a skill inside a plugin is namespaced, so `review` becomes `/my-plugin:review` to avoid collisions with other plugins. The procedure and output are identical. The prefix is the price of distribution, and it is a fair one.

### Skill, plugin, MCP, subagent: how do they relate?

A skill is a procedure, a subagent is a separate worker, an MCP server is a connection to an external system, and a plugin is the package that can carry all three. If you are choosing between the building blocks rather than the container, [Claude skills vs MCP](/blog/claude-skills-vs-mcp) and [Claude skills vs subagents](/blog/claude-skills-vs-subagents) are the two decision pages for that.

### Where do I find plugins and skills to install?

Start with Anthropic's `claude-plugins-official` and `claude-community` marketplaces, then branch out to third-party marketplaces and GitHub repos that publish a `marketplace.json`. Our guide to [where to find Claude skills](/blog/where-to-find-claude-skills) covers the same discovery surfaces, since plugins are how most skills now travel.

---

The short version: write a skill when the problem is consistency, wrap it in a plugin when the problem is distribution, and let a real second user, not a plan, decide when to make the jump. Start at the [Claude skills pillar](/claude-skills) for the full map, or see how [implexa](/) sits above your skills and plugins to run them when you are not watching.
