---
title: "What are Claude Skills? The 2026 builder's guide"
slug: "what-are-claude-skills"
description: "Claude Skills are reusable instruction packs loaded on demand. What's inside a SKILL.md, skill vs prompt, where to find them, and how they differ from MCP."
publishedAt: "2026-05-18"
tags: ["claude-skills", "SKILL.md", "anthropic", "explainer"]
---

# What are Claude Skills?

A Claude Skill is a reusable instruction pack, a small directory with a `SKILL.md` file inside, that Claude loads on demand when a matching task comes up.

Instead of pasting the same multi-paragraph prompt every time you want to do something repeatable, you write the instructions once as a skill. Claude figures out when to use it.

This page is the practical version: what a skill is, what's inside it, how it compares to a prompt, whether it is genuinely new, where to find skills, and how it relates to MCP, subagents, and plugins.

## The one-sentence version

A Claude Skill is a function Claude knows how to call, defined in plain markdown, loaded automatically when its description matches the request. There is no code to compile and no API to wire up. The skill is the instructions, and Claude does the work.

## What's inside a skill

Every skill is a directory whose only required file is `SKILL.md`. That single file carries everything Claude needs to recognize the task and run it.

```
prep-sales-call/
└── SKILL.md
```

`SKILL.md` has YAML frontmatter at the top, then markdown:

```markdown
---
name: prep-sales-call
description: Prep for a sales call. Pull CRM activity, recent news,
             and the last touchpoint for the named account.
---

# Sales call prep

## When to use
When the user mentions an upcoming meeting with a named company.

## Inputs
- Company name or domain
- Meeting date (defaults to next 7 days)

## Procedure
1. Call `crm_query` for the account
2. Pull last 5 activities across all contacts
3. Call `news_search` for the company, last 30 days
4. Format using the output template below

## Output
**Account:** {name}
**Last touch:** {date, channel, who}
**Recent news:** {3 bullets}
**Recommended angle:** {one sentence}
```

That's it. No build step, no compile, no install. Drop it in `~/.claude/skills/` and Claude picks it up on next launch.

## The 6 components of a good skill

A good skill covers six components, and the two most builders skip are exactly the two that keep a skill working when inputs change. The skill above hits four of them. The full list:

| # | component | what it is |
|---|-----------|------------|
| 1 | **intent** | why this skill exists and when to trigger it |
| 2 | **inputs** | what the user provides; what defaults apply |
| 3 | **procedure** | the step-by-step, including specific tools to call |
| 4 | **decision points** | the branches, why path A over B when the input varies |
| 5 | **output contract** | what the result looks like (format, fields, length) |
| 6 | **outcome signal** | how you know it worked next time (CRM event, reply, etc.) |

Most skills you'll find online cover 1, 2, 3, and 5. The two that consistently get skipped are **decision points** and **outcome signal**, and those are exactly the two that matter when inputs shift or when you want to know if the skill is actually paying off.

Full breakdown in the [pillar guide](/claude-skills).

## How do Claude Skills actually work?

Claude loads a skill in two stages, and that detail is the whole reason you can install a lot of them without slowing anything down. At all times Claude can see only the short `description` line from every installed skill. The full `SKILL.md` body stays on disk. The moment a request semantically matches one of those descriptions, Claude pulls that one file into the working context and follows it.

People call this progressive disclosure. The practical effect is that a 2,000-word skill you never trigger costs you zero tokens in the conversation where it never came up. You pay for a skill's instructions only in the runs that actually use it.

This is also why the `description` does so much heavy lifting. It is the only part of your skill Claude reads on every request, so it is the part that decides whether the skill fires at all. A specific description gets matched; a vague one sits on disk forever. Anthropic shipped this loading model as part of the Agent Skills format in late 2025, and the same two-stage behavior is what lets a single agent carry hundreds of skills without bloating its context window.

## Claude Skills vs. Projects vs. custom instructions

Skills, Projects, and custom instructions look similar because all three shape how Claude behaves, but they operate at different scopes. A skill is a single task Claude triggers when it is relevant. A Project is a persistent workspace that holds files and context for a body of related work. Custom instructions are always-on preferences that color every response. You reach for a different one depending on whether you are encoding a *task*, a *workspace*, or a *preference*.

| | what it is | scope | when it applies |
|---|---|---|---|
| **Claude Skill** | a `SKILL.md` task pack | one repeatable workflow | only when its description matches a request |
| **Project** | a saved workspace + files | a body of related work | whenever you're working inside that Project |
| **Custom instructions** | standing preferences | your whole account | every message, always on |

They compose rather than compete. You can keep custom instructions for tone, work inside a Project for a given client, and trigger a skill for one repeatable task within it. If you find yourself writing the same multi-step procedure into a Project's instructions over and over, that procedure wants to be a skill.

## When a Claude Skill is the wrong tool

A skill is the wrong tool when the work runs once, changes shape every time, or is faster to just ask for directly. Skills earn their keep through repetition and a stable output, so a task that has neither gains nothing from being wrapped in a `SKILL.md`. Cases where you should not bother:

- **One-off tasks.** If you'll run it once, a plain prompt is faster than authoring, testing, and installing a skill.
- **Work with no fixed output.** Open-ended brainstorming or exploration has no output contract to hold steady, so the main thing a skill gives you does not apply.
- **A single tool call.** If the whole job is "call this one API," an MCP server or a direct request is the right layer, not a skill wrapping it.
- **Anything that needs human judgment mid-flight.** A skill that stops to ask you to decide on every run is just a checklist with extra steps.

The honest test is the second-time rule from earlier in this page. If you have not done the task twice and expect to do it again, hold off. Premature skills are the SKILL.md equivalent of premature abstraction, and a folder full of skills you never trigger is its own kind of clutter. The companion piece on [how many Claude Skills is too many](/blog/how-many-claude-skills-is-too-many) goes deeper on keeping the set tight.

## Are Claude Skills just prompts with extra steps?

No. A prompt lives in one conversation and disappears. A skill is a named, reusable unit that Claude triggers on its own, runs the same way every time, can call tools by name, and can be shared as a single artifact. That combination is what a raw prompt cannot do.

The skepticism is fair to name, because a thin skill really is just a saved prompt. The difference shows up in the four components a saved prompt can never carry: automatic triggering from a description, a fixed output contract, named tool calls, and an outcome signal you can measure across runs. A prompt gives you none of those. A well-built skill gives you all four.

So the honest answer is that a skill is not magic and does not let Claude do anything it could not do with the perfect prompt typed by hand every single time. What a skill removes is the "typed by hand every single time" part, plus the drift that comes with it. That is the whole point: consistency and reuse, not new raw capability.

## Claude Skill vs. prompt

A skill beats a prompt the second time you reuse it, because it triggers itself and holds its format steady while a pasted prompt drifts. Side by side:

| | prompt | Claude Skill |
|---|---|---|
| reusable? | copy-paste each time | triggers automatically |
| consistent output? | drifts every time you edit | same format every run |
| shareable? | paste in Slack, hope they save it | one link, anyone runs it |
| calls tools? | only what's in current context | specifies tools by name |
| tracks outcomes? | no | yes (with the right skill graph) |
| edits over time? | find-and-replace in your Notes | re-record or edit the `.md` file |

A prompt is fine for a one-off. A skill is what you build the second time you find yourself pasting the same prompt.

## Claude Skills vs. MCP vs. subagents vs. plugins

These are four different layers that work together, not four names for the same thing. A skill is the instructions, MCP is how Claude reaches tools, a subagent is a separate worker Claude hands a task to, and a plugin is a package that bundles the rest for distribution.

| layer | what it is | what it does |
|---|---|---|
| **Claude Skill** | a `SKILL.md` instruction pack | tells Claude when and how to run a repeatable task |
| **MCP** | Model Context Protocol | the protocol Claude uses to call external tools and data |
| **subagent** | a delegated worker | runs a focused sub-task in its own context, reports back |
| **plugin** | a distributable bundle | packages skills, commands, and MCP servers as one installable unit |

The clean mental model: a skill often *uses* one or more MCP servers as its execution backend, can *delegate* a step to a subagent, and can ship *inside* a plugin. They stack. You do not pick one instead of the others. The deeper comparison lives in [Claude Skills vs. MCP](/blog/claude-skills-vs-mcp).

## How skills get triggered

Claude triggers a skill by reading the `description` field of every installed skill and loading the one that semantically matches your request. The description is the single most important line in the file.

Vague descriptions don't trigger. Specific descriptions trigger reliably. "Help with sales" won't fire. "Prep for a sales call, pull CRM activity for the named account" fires every time.

You can also force a skill explicitly with `/skill-name` if you want to override the auto-trigger.

## Where to find Claude Skills

You can find Claude Skills in three places: Anthropic's own bundled and documented skills, open-source community libraries, and skill-graph hosts that add sharing and outcome tracking. Each suits a different need.

- **Anthropic's bundled skills and docs.** Claude Code ships with a set of built-in skills, and Anthropic publishes a format reference plus a long-form building guide. Start here for the canonical spec.
- **Community libraries and repos.** Open-source collections on GitHub gather hundreds of skills, many of which also run in other coding agents. Good for examples and for copy-and-adapt starting points.
- **Skill-graph hosts.** Tools like [implexa](https://implexa.ai) give each skill a shareable link, version it, and track whether it actually produced an outcome when a teammate ran it.

A quick note on quality: the comprehensive "100 skills I tried" lists are useful for discovery, but most listed skills cover only intent, inputs, procedure, and output. Before you rely on one, check whether it also encodes decision points and an outcome signal. Those two are what keep it from drifting.

## Claude Skills examples

The clearest way to understand skills is a few concrete ones, because the pattern is always the same: a repeatable task with a fixed output. A handful that map cleanly to the `SKILL.md` format:

- **Sales call prep:** pull CRM activity and recent news for a named account, return a one-page brief (the example above).
- **Pull request review:** run a fixed review checklist against a diff, return findings grouped by severity.
- **Weekly status report:** gather the week's shipped work from your tracker, return a three-section summary in the same layout every time.
- **Incident write-up:** take an incident channel, return a timeline, root cause, and action items in your team's template.

Each one is something you would otherwise re-explain from scratch. Writing it once as a skill is what makes the second, fifth, and fiftieth run identical.

## Do Claude Skills work outside Claude Code?

Skills work most fully inside Claude Code, where the `SKILL.md` auto-loader lives, but the format is portable enough that several other coding agents can read it too. The auto-discovery behavior is the part that varies.

Inside Claude Code, skills load and trigger automatically. In Claude Desktop or through the Anthropic API, there is no auto-loader, so you paste the skill into a system prompt or wrap it in an agent. Several third-party coding agents now read the same `SKILL.md` format. The full cross-vendor walkthrough is in [use Claude Skills in Cursor, Codex, and Gemini](/blog/use-claude-skills-in-cursor-codex-gemini).

## "Claude Skills" vs. "Claude Code Skills" vs. "Anthropic Skills" vs. "SKILL.md"

These four phrases all point to the same thing: the `SKILL.md` spec. The difference is only context.

- **Claude Skills:** the general term.
- **Claude Code Skills:** using them inside the Claude Code CLI specifically.
- **Anthropic Skills:** Anthropic's branding when they announced the format.
- **SKILL.md:** the actual file format.

## How do you build one?

You build a skill one of two ways: hand-write the `SKILL.md`, or demonstrate the workflow once and have it captured for you. Both produce the same file format.

**Hand-write it.** Open a text editor, write the `SKILL.md`, save it in `~/.claude/skills/your-skill/`. Works for short skills. Falls apart at length because you have to articulate decisions you'd normally make on autopilot.

**Demonstrate it once.** Run [implexa](https://implexa.ai) and `/implexa:record`. Do the workflow normally. Answer 2 to 4 short interview questions about decisions, output format, and what signals success. The skill gets authored from your actual behavior plus your answers, including the decision rationale most hand-written skills skip.

We call the captured layer **decision traces**: visible tool calls plus the interview-extracted rationale. Walkthrough in [how to create a Claude Skill](/blog/how-to-create-a-claude-skill).

## How many skills should you install?

Install as many as you genuinely reuse, but keep each one focused, because triggering reliability drops when many vague descriptions compete for the same request. Quantity is not the problem. Overlapping, fuzzy descriptions are.

The practical ceiling is about description quality, not a hard number. Hundreds of installed skills are fine as long as each description is specific enough that Claude can tell them apart. The full reasoning is in [how many Claude Skills is too many](/blog/how-many-claude-skills-is-too-many).

## FAQ

### Is a Claude Skill the same as a system prompt?

No. A system prompt applies to every message in a conversation. A skill is loaded only when its description matches a request, and unloaded after. You can have hundreds of skills installed without bloating every conversation.

### Do I need to write code to build a skill?

No. `SKILL.md` is plain markdown. The procedure describes what tools to call, but Claude does the calling.

### Are Claude Skills free?

The format is free and open. A `SKILL.md` file costs nothing to write, store, or run, and the auto-loader is built into Claude Code. You only pay for the underlying Claude usage the skill consumes, plus any third-party host you choose for sharing or tracking.

### Are Claude Skills available on the Claude free plan?

The `SKILL.md` format itself is plan-agnostic, since it is just a file. What varies by plan is the surface that runs it: the Claude Code auto-loader and Claude's tool use are where skills do their work, so the practical answer depends on your access to those, not on the skill files. If you can run Claude Code, you can run skills.

### How many Claude Skills can you install at once?

There is no hard cap. Because Claude only loads a skill's full body when its description matches, hundreds of installed skills add almost nothing to a given conversation. The real limit is description overlap, not count. Two skills with fuzzy, similar descriptions will compete and misfire long before you run out of room. The detail is in [how many Claude Skills is too many](/blog/how-many-claude-skills-is-too-many).

### Can a skill call other skills?

Yes. A skill's procedure can reference another skill by name. Best practice is to keep skills focused on one workflow and compose them rather than building one mega-skill.

### What's the difference between a skill and a plugin?

A skill is a single instruction pack. A plugin is a distributable bundle that can contain several skills, slash commands, and MCP servers as one installable unit. You install a plugin to get a set of skills at once.

### Can I version-control skills?

Yes. Either commit the skill directory to a repo (project-level skills live in `.claude/skills/`), or use a skill-graph host that handles versioning for you.

### Do skills work in Claude Desktop or only in Claude Code?

The `SKILL.md` auto-loader is a Claude Code feature. Claude Desktop and the Anthropic API don't auto-discover skills the same way. You'd paste contents into a system prompt or wrap the skill in an agent.

### What's the relationship between Skills and MCP?

MCP (Model Context Protocol) is the protocol Claude uses to call external tools. Skills are the instructions for when and how to call them. A skill typically uses one or more MCP servers as its execution backend.

## Next reads

- **[How to create a Claude Skill (step-by-step)](/blog/how-to-create-a-claude-skill)**: 7-step build tutorial.
- **[What are Claude Skills? (and the right way to build them)](/claude-skills)**: full pillar guide with the 6-component contract.
- **[Use Claude Skills in Cursor, Codex, and Gemini](/blog/use-claude-skills-in-cursor-codex-gemini)**: running the same `SKILL.md` across other agents.
- **[What is a skill graph?](/resources/what-is-a-skill-graph)**: the structure that connects many skills together.
