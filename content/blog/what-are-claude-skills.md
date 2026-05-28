---
title: "what are claude skills? the 2026 builder's guide"
slug: "what-are-claude-skills"
description: "claude skills are reusable instruction packs that load on demand. this is the practical guide: what's inside a SKILL.md, when to use one vs a prompt, and how 40,000+ ranked skills work across anthropic, smithery, clawhub, and skills.sh."
publishedAt: "2026-05-18"
tags: ["claude-skills", "SKILL.md", "anthropic", "explainer"]
---

# what are claude skills?

a **Claude Skill** is a reusable instruction pack, a small directory with a `SKILL.md` file inside, that Claude loads on demand when a matching task comes up.

instead of pasting the same multi-paragraph prompt every time you want to do something repeatable, you write the instructions once as a skill. Claude figures out when to use it.

this page is the short version: what a skill is, what's inside it, how it compares to a prompt, and where to go next.

## the one-sentence version

a Claude Skill is a function Claude knows how to call, defined in plain markdown, loaded automatically when its description matches the user's request.

## what's inside a skill

every skill is a directory. the only required file is `SKILL.md`:

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

that's it. no build step, no compile, no install. drop it in `~/.claude/skills/` and Claude picks it up on next launch.

## the 6 components of a good skill

the skill above hits four of the six components that separate skills that work from skills that drift. the full list:

| # | component | what it is |
|---|-----------|------------|
| 1 | **intent** | why this skill exists and when to trigger it |
| 2 | **inputs** | what the user provides; what defaults apply |
| 3 | **procedure** | the step-by-step, including specific tools to call |
| 4 | **decision points** | the branches, why path A over B when the input varies |
| 5 | **output contract** | what the result looks like (format, fields, length) |
| 6 | **outcome signal** | how you know it worked next time (CRM event, reply, etc.) |

most skills you'll find online cover 1, 2, 3, and 5. the two that consistently get skipped are **decision points** and **outcome signal**, and those are exactly the two that matter when inputs shift or when you want to know if the skill is actually paying off.

full breakdown in the [pillar guide](/claude-skills).

## Claude Skill vs. prompt

| | prompt | Claude Skill |
|---|---|---|
| reusable? | copy-paste each time | triggers automatically |
| consistent output? | drifts every time you edit | same format every run |
| shareable? | paste in Slack, hope they save it | one link, anyone runs it |
| calls tools? | only what's in current context | specifies tools by name |
| tracks outcomes? | no | yes (with the right skill graph) |
| edits over time? | find-and-replace in your Notes | re-record or edit the `.md` file |

a prompt is fine for a one-off. a skill is what you build the second time you find yourself pasting the same prompt.

## where skills live

two locations, both auto-discovered:

- **`~/.claude/skills/`**: user-level. only you can run them.
- **`.claude/skills/`**: project-level (inside a repo). anyone who clones the repo gets them.

if you want a third option, share with your team without giving them repo access, or with the public, you need a skill-graph host like [Implexa](https://implexa.ai). it gives each skill a shareable link and tracks outcomes when teammates run it.

## how skills get triggered

when you make a request, Claude scans the `description` fields of available skills. if one matches semantically, Claude loads that skill's `SKILL.md` and follows the procedure.

the description is the most important line in the whole file. vague descriptions don't trigger. specific descriptions trigger reliably. "help with sales" won't fire. "prep for a sales call, pull CRM activity for the named account" fires every time.

you can also force a skill explicitly with `/skill-name` if you want to override the auto-trigger.

## "Claude Skills" vs. "Claude Code Skills" vs. "Anthropic Skills" vs. "SKILL.md"

these all refer to the same thing:

- **Claude Skills**: the general term
- **Claude Code Skills**: using them inside the Claude Code CLI specifically
- **Anthropic Skills**: Anthropic's branding when they announced the format
- **SKILL.md**: the actual file format

all four phrases point to the same `SKILL.md` spec.

## how do you build one?

two paths:

**hand-write it.** open a text editor, write the `SKILL.md`, save it in `~/.claude/skills/your-skill/`. works for short skills. falls apart at length because you have to articulate decisions you'd normally make on autopilot.

**demonstrate it once.** run [Implexa](https://implexa.ai) and `/implexa:record`. do the workflow normally. answer 2 to 4 short interview questions about decisions, output format, and what signals success. the skill gets authored from your actual behavior plus your answers, including the decision rationale most hand-written skills skip.

we call the captured layer **decision traces**: visible tool calls *plus* the interview-extracted rationale. walkthrough in [how to create a claude skill](/blog/how-to-create-a-claude-skill).

## FAQ

### is a Claude Skill the same as a system prompt?

no. a system prompt applies to every message in a conversation. a skill is loaded only when its description matches a request, and unloaded after. you can have hundreds of skills installed without bloating every conversation.

### do I need to write code to build a skill?

no. `SKILL.md` is plain markdown. the procedure describes *what tools to call*, but Claude does the calling.

### can a skill call other skills?

yes. a skill's procedure can reference another skill by name. best practice is to keep skills focused on one workflow and compose them rather than building one mega-skill.

### can I version-control skills?

yes. either commit the skill directory to a repo (project-level skills live in `.claude/skills/`), or use a skill-graph host that handles versioning for you.

### do skills work in Claude Desktop or only in Claude Code?

the `SKILL.md` auto-loader is a Claude Code feature. Claude Desktop and the Anthropic API don't auto-discover skills the same way. you'd paste contents into a system prompt or wrap the skill in an agent.

### what's the relationship between Skills and MCP?

MCP (Model Context Protocol) is the protocol Claude uses to call external tools. skills are the *instructions* for when and how to call them. a skill typically uses one or more MCP servers as its execution backend.

## next reads

- **[how to create a claude skill (step-by-step)](/blog/how-to-create-a-claude-skill)**: 7-step build tutorial.
- **[what are claude skills? (and the right way to build them)](/claude-skills)**: full pillar guide with the 6-component contract.
- **[what is a skill graph?](/resources/what-is-a-skill-graph)**: the structure that connects many skills together.
