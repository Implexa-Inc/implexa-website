---
title: "How to add an MCP server to Claude Code"
slug: "claude-code-mcp"
description: "How to add an MCP server to Claude Code: the claude mcp add command for HTTP and stdio servers, the three config scopes, OAuth sign-in, and the safety check."
publishedAt: "2026-06-26"
tags: ["claude-code", "mcp", "model-context-protocol", "ai-agents", "claude"]
---

# How to add an MCP server to Claude Code

You keep pasting the same Linear ticket, the same Sentry stack trace, the same row from your database into the chat. An MCP server is how you stop. Once it is connected, Claude Code reads and acts on that system directly, and you never copy that context in by hand again.

This is the working guide. The command, the three transports, where the config actually lives, how to sign in to a server that wants OAuth, and the one check you do before you trust any of it.

## The short answer

Run `claude mcp add` from your terminal. For most modern services one line does it: `claude mcp add --transport http notion https://mcp.notion.com/mcp`. That registers a remote HTTP server named `notion`, and the next time you start Claude Code its tools are available, so you can ask Claude to read a page or update a database in plain English.

Everything below is the detail behind that line: the other transports, where the entry gets written, and what to do when the server needs you to log in.

If you are still deciding whether you even want an MCP server or a Skill for a given job, read [Claude Skills vs MCP](/blog/claude-skills-vs-mcp) first. MCP is about access. A Skill is about how Claude does the work once it has that access. This guide assumes you have decided you need access.

## What an MCP server gives Claude Code

An MCP server gives Claude Code a live connection to a system it otherwise cannot see. The Model Context Protocol is an open standard, originally from Anthropic and now used well beyond it, that lets a tool expose its capabilities to an AI client in a consistent way. The server publishes tools and resources. Claude Code calls them.

The practical version: with the GitHub server connected, "review PR #456 and suggest improvements" actually pulls the diff. With a Postgres server connected, "what was revenue last month" runs a real query against your warehouse. With Sentry connected, Claude can look up the stack trace for an error ID instead of waiting for you to find it. The access persists across sessions, so you set it up once.

Anthropic keeps a directory of reviewed connectors at claude.ai/directory, and any remote server listed there installs with the same `claude mcp add` command you are about to use.

## Add a remote HTTP server, the common case

HTTP is the transport you want for almost every cloud service. The syntax is `claude mcp add --transport http <name> <url>`, the name is yours to pick, and a server that authenticates with a static token instead of a browser login takes a `--header` flag:

```bash
# The common case, a hosted service
claude mcp add --transport http notion https://mcp.notion.com/mcp
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
claude mcp add --transport http stripe https://mcp.stripe.com

# A server that wants a static token (GitHub uses a fine-grained PAT)
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ \
  --header "Authorization: Bearer YOUR_GITHUB_PAT"
```

For the GitHub case you generate the fine-grained personal access token in your GitHub settings first, scoped to the repositories you actually want Claude touching. One older detail worth knowing so you are not thrown by other people's configs: SSE, the Server-Sent Events transport, still works through `--transport sse`, but Anthropic has deprecated it. If a server offers both, take HTTP.

## Add a local stdio server

A stdio server runs as a process on your own machine, which is what you use for local tools, custom scripts, and anything that needs direct filesystem access. The shape is different because Claude Code has to launch the process, so the command to run it comes after a double dash:

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

That `--` matters more than it looks. Everything before it is a flag for Claude Code, like `--transport` or `--env`. Everything after it is the command that runs your server, passed through untouched. Drop the double dash and Claude Code tries to read your server's own `--dsn` as one of its options, and the whole thing falls over. If the server needs secrets, set them with `--env KEY=value` rather than baking them into the command.

## Sign in to servers that need OAuth

When a remote server needs a real login, Claude Code drives an OAuth flow for you, and the trigger is the `/mcp` command inside a session. Add the server first with something like `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp`, then start Claude Code, run `/mcp`, pick the server, and finish the login in the browser tab that opens.

Tokens are stored in your system keychain on macOS, and they refresh on their own, so you do this once and forget it. From version 2.1.186 there is also a shell shortcut, `claude mcp login sentry`, that runs the same flow without opening the panel, which is the one you reach for over SSH where no browser exists.

A real gotcha lives here. A few Anthropic-hosted connectors, Gmail, Google Calendar, and Microsoft 365 among them, do not support logging in directly from Claude Code, because the identity provider only trusts the redirect URL that claude.ai registered. For those, connect them once in your claude.ai settings and they appear in Claude Code automatically.

## Choose the right scope: local, project, or user

The scope decides which projects a server loads in and whether your teammates get it too. There are three, and the default is `local`.

| Scope | Loads in | Shared | Stored in |
| --- | --- | --- | --- |
| local (default) | current project only | no | `~/.claude.json` |
| project | current project only | yes, via git | `.mcp.json` in the repo |
| user | all your projects | no | `~/.claude.json` |

Local is private to you and tied to one project, which is right for experiments and anything carrying a credential you would never commit. User scope follows you across every project on the machine, good for a server you lean on constantly. Project scope is the interesting one. Adding a server with `--scope project` writes a `.mcp.json` file at the repo root that you check into version control, so every teammate who clones the repo inherits the same tools. Claude Code asks each person for approval before it runs a project server, which is the guardrail against a poisoned `.mcp.json` arriving in a pull request.

## Manage and check your servers

A short set of commands covers the entire lifecycle. List what you have, inspect one, remove one:

```bash
claude mcp list
claude mcp get github
claude mcp remove github
```

Inside a session, `/mcp` is the live view. It shows each connected server, the count of tools it exposes, and it flags anything stuck waiting on authentication or sitting pending approval. A project server that is paused on approval shows in `claude mcp list` as pending until you start Claude interactively and accept it.

One thing that quietly scales well: Claude Code defers MCP tool definitions by default and only loads the ones a task actually needs, so stacking up a dozen servers barely touches your context window. You are not punished for connecting everything you use.

## Import the servers you already have

If you set MCP servers up in Claude Desktop already, you do not redo them. Run `claude mcp add-from-claude-desktop` and a picker lets you choose which to bring across. It works on macOS and on Windows Subsystem for Linux. Separately, if you log into Claude Code with your claude.ai account, the connectors you added there appear in Claude Code on their own, with no import step at all. Two paths, same result: the setup you have done once does not get done twice.

## The safety check before you connect anything

Verify you trust a server before you connect it, because an MCP server that fetches outside content is a path for prompt injection. This is the part the quick tutorials skip. A server that reads web pages, issues, or emails can pull in text that was written to manipulate the model, and once that text is in the context, Claude may act on it. The protocol does not protect you from a hostile server. Your judgment does.

So the rule is plain. Connect official servers and ones from the Anthropic directory freely. For a third-party or homegrown server, read what it does before you wire it in, scope any credential as narrowly as it will go, and prefer a read-only token when the work only needs reads. Treat a `.mcp.json` that shows up in a pull request the way you would treat any other code from a stranger, because that is exactly what it is.

If you want the workflow layer on top of all this, where Claude reaches a connected system and then runs your team's exact procedure against it, that is what Skills are for. [Claude Skills examples](/blog/claude-skills-examples) has copyable SKILL.md files, and [what are Claude Skills](/blog/what-are-claude-skills) covers the format from the start.

## FAQ

### What is the difference between an MCP server and a Claude Skill?

An MCP server gives Claude access to an external system, and a Skill gives Claude a repeatable procedure to run. You often use both: the server supplies the database connection, the Skill encodes how your team queries it and what a good answer looks like. The full breakdown is in [Claude Skills vs MCP](/blog/claude-skills-vs-mcp).

### Where does Claude Code store MCP server config?

Local and user scoped servers live in `~/.claude.json` in your home directory, while project scoped servers live in a `.mcp.json` file at the root of the repo so the whole team shares them. Note that this is separate from general settings, which use `.claude/settings.json`.

### How do I remove an MCP server from Claude Code?

Run `claude mcp remove <name>` from the terminal, using the name you gave it when you added it. Run `claude mcp list` first if you are not sure of the exact name.

### Do MCP servers work in other tools besides Claude Code?

Yes. MCP is an open standard, so the same server can connect to Claude Desktop, Cursor, and other MCP-aware clients. The connection config differs per tool, but the server itself is portable, which is the same portability story behind [using your Claude skills in Cursor, Codex, and Gemini](/blog/use-claude-skills-in-cursor-codex-gemini).

### Is it safe to connect any MCP server?

No, not blindly. Official and directory-listed servers are safe to add, but a server that pulls in external content can expose you to prompt injection, so review any third-party server before connecting it and scope its credentials tightly.

The honest summary is that MCP is the easy half. Connecting a server takes one command. Knowing which ones to trust, and what they are allowed to touch, is the half that is actually yours to own.
