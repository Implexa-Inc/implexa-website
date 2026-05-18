---
title: "What Are Claude Skills? (5-Minute Explainer)"
slug: "what-are-claude-skills"
description: "Claude Skills are reusable instruction packs Claude loads on demand. Here's what they are, what's inside a SKILL.md file, and how they compare to prompts."
keywords:
  - what are claude skills
  - what is a claude skill
  - claude skills explained
  - skill.md
  - claude skill vs prompt
  - anthropic skills
canonical: "https://implexa.ai/blog/what-are-claude-skills"
ogImage: "/og/what-are-claude-skills.png"
publishedAt: "2026-05-18"
updatedAt: "2026-05-18"
author: "Implexa"
---

# What Are Claude Skills? (5-Minute Explainer)

A **Claude Skill** is a reusable instruction pack — a small directory with a `SKILL.md` file inside — that Claude loads on demand when a matching task comes up.

Instead of pasting the same multi-paragraph prompt every time you want to do something repeatable, you write the instructions once as a skill. Claude figures out when to use it.

This page is the short version: what a skill is, what's inside it, how it compares to a prompt, and where to go next.

---

## The one-sentence version

A Claude Skill is a function Claude knows how to call — defined in plain Markdown, loaded automatically when its description matches the user's request.

---

## What's inside a skill

Every skill is a directory. The only required file is `SKILL.md`:

```
prep-sales-call/
└── SKILL.md
```

`SKILL.md` has YAML frontmatter at the top, then Markdown:

```markdown
---
name: prep-sales-call
description: Prep for a sales call — pull CRM activity, recent news,
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

---

## The 6 components of a good skill

The skill above hits four of the six components that separate skills that work from skills that drift. The full list:

| # | Component | What it is |
|---|-----------|------------|
| 1 | **Intent** | Why this skill exists and when to trigger it |
| 2 | **Inputs** | What the user provides; what defaults apply |
| 3 | **Procedure** | The step-by-step, including specific tools to call |
| 4 | **Decision points** | The branches — why path A over B when the input varies |
| 5 | **Output contract** | What the result looks like (format, fields, length) |
| 6 | **Outcome signal** | How you know it worked next time (CRM event, reply, etc.) |

Most skills you'll find online cover 1, 2, 3, and 5. The two that consistently get skipped are **decision points** and **outcome signal** — and those are exactly the two that matter when inputs shift or when you want to know if the skill is actually paying off.

Full breakdown in the [pillar guide](/claude-skills).

---

## Claude Skill vs. prompt

| | Prompt | Claude Skill |
|---|---|---|
| Reusable? | Copy-paste each time | Triggers automatically |
| Consistent output? | Drifts every time you edit | Same format every run |
| Shareable? | Paste in Slack, hope they save it | One link, anyone runs it |
| Calls tools? | Only what's in current context | Specifies tools by name |
| Tracks outcomes? | No | Yes (with the right skill graph) |
| Edits over time? | Find-and-replace in your Notes | Re-record or edit the `.md` file |

A prompt is fine for a one-off. A skill is what you build the second time you find yourself pasting the same prompt.

---

## Where skills live

Two locations, both auto-discovered:

- **`~/.claude/skills/`** — user-level. Only you can run them.
- **`.claude/skills/`** — project-level (inside a repo). Anyone who clones the repo gets them.

If you want a third option — share with your team without giving them repo access, or with the public — you need a skill-graph host like [Implexa](https://implexa.ai). It gives each skill a shareable link and tracks outcomes when teammates run it.

---

## How skills get triggered

When you make a request, Claude scans the `description` fields of available skills. If one matches semantically, Claude loads that skill's `SKILL.md` and follows the procedure.

The description is the most important line in the whole file. Vague descriptions don't trigger. Specific descriptions trigger reliably. "Help with sales" — won't fire. "Prep for a sales call — pull CRM activity for the named account" — fires every time.

You can also force a skill explicitly with `/skill-name` if you want to override the auto-trigger.

---

## "Claude Skills" vs. "Claude Code Skills" vs. "Anthropic Skills" vs. "SKILL.md"

These all refer to the same thing:

- **Claude Skills** — the general term
- **Claude Code Skills** — using them inside the Claude Code CLI specifically
- **Anthropic Skills** — Anthropic's branding when they announced the format
- **SKILL.md** — the actual file format

All four phrases point to the same `SKILL.md` spec.

---

## How do you build one?

Two paths:

**Hand-write it.** Open a text editor, write the `SKILL.md`, save it in `~/.claude/skills/your-skill/`. Works for short skills. Falls apart at length because you have to articulate decisions you'd normally make on autopilot.

**Demonstrate it once.** Run [Implexa](https://implexa.ai) and `/implexa:record`. Do the workflow normally. Answer 2–4 short interview questions about decisions, output format, and what signals success. The skill gets authored from your actual behavior plus your answers — including the decision rationale most hand-written skills skip.

We call the captured layer **decision traces**: visible tool calls *plus* the interview-extracted rationale. Walkthrough in [How to Create a Claude Skill](/blog/how-to-create-a-claude-skill).

---

## FAQ

### Is a Claude Skill the same as a system prompt?

No. A system prompt applies to every message in a conversation. A skill is loaded only when its description matches a request — and unloaded after. You can have hundreds of skills installed without bloating every conversation.

### Do I need to write code to build a skill?

No. `SKILL.md` is plain Markdown. The procedure describes *what tools to call*, but Claude does the calling.

### Can a skill call other skills?

Yes — a skill's procedure can reference another skill by name. Best practice is to keep skills focused on one workflow and compose them rather than building one mega-skill.

### Can I version-control skills?

Yes. Either commit the skill directory to a repo (project-level skills live in `.claude/skills/`), or use a skill-graph host that handles versioning for you.

### Do skills work in Claude Desktop or only in Claude Code?

The `SKILL.md` auto-loader is a Claude Code feature. Claude Desktop and the Anthropic API don't auto-discover skills the same way — you'd paste contents into a system prompt or wrap the skill in an agent.

### What's the relationship between Skills and MCP?

MCP (Model Context Protocol) is the protocol Claude uses to call external tools. Skills are the *instructions* for when and how to call them. A skill typically uses one or more MCP servers as its execution backend.

---

## Next reads

- **[How to Create a Claude Skill (Step-by-Step)](/blog/how-to-create-a-claude-skill)** — 7-step build tutorial.
- **[What Are Claude Skills? (And the Right Way to Build Them)](/claude-skills)** — Full pillar guide with the 6-component contract.
