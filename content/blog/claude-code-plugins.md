---
title: "Claude Code plugins: what they are and how to use them"
slug: "claude-code-plugins"
description: "Claude Code plugins bundle skills, commands, agents, hooks, and MCP servers into one unit. What they are, how to install one, and how to build your own."
publishedAt: "2026-06-25"
tags: ["claude-code", "plugins", "marketplace", "claude-skills", "mcp"]
---

# Claude Code plugins: what they are and how to use them

A Claude Code plugin is a bundle of extensions, a skill or a command or a hook or an MCP server, sometimes all of them at once, packaged as a single installable unit. On its own a skill is a folder you copy around and hope your teammate copies the same way. As a plugin it becomes one thing with a name and a version, and installing it is two commands instead of a Slack thread titled "did you grab the latest skills folder."

That is the whole pitch. Most people arrive at plugins after the copy-paste stops scaling: they wrote a useful [Claude skill](/blog/what-are-claude-skills), a teammate wanted it, and the act of sharing it turned into a small mess of which files go where. A plugin is the container that ends the mess. This guide covers what a plugin actually is, the pieces it can hold, how you install one, and how you build and ship your own.

## What is a Claude Code plugin?

A plugin is a directory with a manifest at `.claude-plugin/plugin.json` that Claude Code can load as one named, versioned extension. The manifest is small. A name, a description, a version, an optional author, and that is enough:

```json
{
  "name": "my-first-plugin",
  "description": "A greeting plugin to learn the basics",
  "version": "1.0.0",
  "author": { "name": "Your Name" }
}
```

The `name` does double duty. It identifies the plugin in the manager, and it becomes the namespace for every skill inside, so a skill called `hello` is invoked as `/my-first-plugin:hello`. That prefix looks clunky next to a bare `/hello`, but it is the reason two plugins can both ship a `review` skill without colliding. The namespace is the price of distribution, and it is a fair one.

## What can a plugin bundle?

A plugin can carry seven kinds of component, and each lives in its own directory at the plugin root. The manifest folder, `.claude-plugin/`, holds only `plugin.json`. Everything else sits beside it:

- **Skills** in `skills/`, each a folder with a `SKILL.md`. These are model-invoked, so Claude reaches for them on its own based on the task.
- **Commands** in `commands/`, flat Markdown files you trigger by name. The docs now steer new plugins toward `skills/` instead.
- **Agents** in `agents/`, the custom [subagents](/blog/claude-code-subagents) Claude can spawn for a focused job.
- **Hooks** in `hooks/hooks.json`, the deterministic [event handlers](/blog/claude-code-hooks) that fire on things like PostToolUse.
- **MCP servers** in `.mcp.json`, the external tools and APIs an [MCP integration](/blog/claude-skills-vs-mcp) exposes.
- **LSP servers** in `.lsp.json`, for real-time code intelligence in a given language.
- **Monitors** in `monitors/monitors.json`, background watchers that tail a log or a file and notify Claude as events land.

The single most common mistake is nesting these inside `.claude-plugin/`. They do not go there. Skills, agents, hooks, and the rest all live at the plugin root, one level up from the manifest, or Claude Code will not find them.

## How do you install a Claude Code plugin?

You add a marketplace, then install a plugin from it, both through the `/plugin` command inside Claude Code. A marketplace is just a git repository that lists plugins and where to find them, so adding one points at an owner and repo:

```shell
/plugin marketplace add anthropics/claude-plugins-community
/plugin install plugin-name@claude-community
```

The first command registers the marketplace. The second installs a specific plugin from it, where the name after the `@` is the marketplace's own name from its `marketplace.json`, not the repo path. Anthropic keeps two public ones: `claude-plugins-official`, a curated set registered for you the first time you launch Claude Code interactively, and `claude-community`, where reviewed third-party submissions land.

Day to day you manage the rest from the same command. Run `/plugin` on its own to browse what is installed and remove anything you have stopped using, and removing a plugin takes its bundled skills and hooks with it. When a marketplace ships an update, `/plugin marketplace update` refreshes your local copy. If you do not see `/plugin` at all, your Claude Code is old; update it and the command appears.

## How do you build your own plugin?

You make a directory, drop a `plugin.json` in `.claude-plugin/`, add at least one component, and load it with a flag. The fastest path from nothing to a working plugin is four steps:

```bash
mkdir -p my-first-plugin/.claude-plugin
mkdir -p my-first-plugin/skills/hello
# write the manifest into my-first-plugin/.claude-plugin/plugin.json
# write a SKILL.md into my-first-plugin/skills/hello/
claude --plugin-dir ./my-first-plugin
```

The `--plugin-dir` flag loads your plugin for that session without installing it, which is how you iterate. Change a file, run `/reload-plugins`, and the new version is live without a restart. As of Claude Code v2.1.128 the flag also accepts a `.zip` archive, and you can repeat it to load several plugins at once.

If you would rather not pass a flag every launch, `claude plugin init my-tool` scaffolds a plugin straight into `~/.claude/skills/my-tool/` that auto-loads on the next session as `my-tool@skills-dir`. Already have skills and hooks sitting loose in a `.claude/` directory? Copy them into a plugin folder, move your hooks block from `settings.json` into `hooks/hooks.json` unchanged, and you have converted a personal setup into something shareable. When it is ready for other people, run `claude plugin validate`, write a README, and distribute it through a marketplace. The review pipeline runs that same validation on every submission, so it is worth running first.

## Plugin or standalone config: which should you use?

Use a plugin when you want to share, version, and reuse something across projects; use a standalone `.claude/` setup when the work is yours alone and you are still iterating. The two approaches do the same things, and the line between them is about distribution, not capability.

A loose skill in `.claude/skills/` gives you a short name like `/deploy` and zero ceremony, which is perfect for a one-project habit or a half-formed idea. The cost shows up the moment a second person wants it, or you want the same skill in three repos, or you need to know which version everyone is running. That is the seam plugins fill. The honest workflow is to start standalone, prove the thing is useful, and graduate it to a plugin once it has earned an audience. A version number is cheap to add and expensive to retrofit onto a habit nobody packaged.

## Where plugins end and a control plane begins

A plugin governs what Claude can do inside one session on one machine; it has nothing to say about what happens after Claude finishes. That boundary is easy to miss until you cross it. You can package a skill that drafts a customer email and a hook that pings Slack when it is done, ship the whole thing as a tidy plugin, and install it across the team in an afternoon. None of that decides whether the draft is safe to actually send, and none of it can pause an unattended run at 3am to wait for your one-tap approval.

The gap widens the second you start [scheduling Claude Code](/blog/schedule-claude-code) to run on its own. A plugin is installed configuration: it loads when a session starts and it is silent once the session ends. An agent running without you watching needs a layer above the session, where the result lands somewhere you read, a step that would send or publish stops and waits, and a risky action is gated whether or not anyone is at the keyboard. That is where [implexa](/) sits. It is a control plane for agents that run inside your own Claude or Codex, so your plugins keep doing their job at the session level while approval, delivery, and oversight happen one level up. Plugins are how you distribute the work. The control plane is how you trust it when you are asleep.

## FAQ

### Are Claude Code plugins the same as skills?

No. A skill is one instruction pack; a plugin is a container that can hold many skills plus commands, agents, hooks, and MCP servers. Every plugin can ship skills, but a skill on its own is not a plugin until it has a `plugin.json` manifest and is distributed as a named, versioned unit. If you are still deciding what to build, [what Claude Skills are](/blog/what-are-claude-skills) is the better starting point.

### Where do I find Claude Code plugins to install?

Start with Anthropic's `claude-plugins-official` and `claude-community` marketplaces, then branch out to third-party marketplaces and GitHub repos that publish a `marketplace.json`. Each is a git repo you add with `/plugin marketplace add owner/repo`. Our guide to [where to find Claude Skills](/blog/where-to-find-claude-skills) covers the same discovery surfaces, since plugins are how most skills now travel.

### Do I need to restart Claude Code after installing a plugin?

Not for most changes. After installing or editing a plugin, run `/reload-plugins` to pick up skills, agents, hooks, and plugin MCP servers without a restart. A full restart is only needed for things settings.json reads once at startup.

### What is the difference between a plugin and an MCP server?

An MCP server is one component, a connection to external tools and APIs; a plugin is the package that can bundle that MCP server alongside skills, hooks, and agents. You install an MCP server through a plugin's `.mcp.json`, or on its own. For the deeper tradeoff between the two building blocks, see [Claude Skills vs MCP](/blog/claude-skills-vs-mcp).

### How do I share a plugin with my team?

Put it in a git repository with a `marketplace.json`, keep the repo private if it is internal, and have teammates add it with `/plugin marketplace add`. Run `claude plugin validate` before you publish so it passes the same check the community review pipeline runs. From there, every install and update is two commands instead of a copied folder.
