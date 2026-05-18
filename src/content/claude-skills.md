---
title: "What Are Claude Skills? (And the Right Way to Build Them)"
slug: "claude-skills"
description: "Claude Skills are reusable instructions Claude loads on demand. Learn what they are, how they work, and why demonstrating a workflow beats describing it."
keywords:
  - claude skills
  - claude code skills
  - anthropic skills
  - claude skill
  - skill.md
  - claude agent skills
canonical: "https://implexa.ai/claude-skills"
ogImage: "/og/claude-skills.png"
publishedAt: "2026-05-18"
updatedAt: "2026-05-18"
author: "Implexa"
---

# What Are Claude Skills? (And the Right Way to Build Them)

A **Claude Skill** is a small, self-contained instruction pack — usually a single `SKILL.md` file — that Claude loads on demand to handle a specific task. You can think of it as a function Claude knows how to call: it has a name, a description, and a procedure inside.

When Claude encounters a request that matches a skill's description, it loads the skill, follows the procedure, and produces the output. Skills replace pasting the same multi-paragraph prompt into every new conversation.

This guide covers what skills actually are, how to build one that works on the first try, and why **demonstrating a workflow** produces a better skill than writing one by hand.

---

## Why Claude Skills exist

Most people use Claude by writing a prompt every time they want something done. That works for one-off tasks. It falls apart the moment you want repeatability — pricing a deal, drafting a stand-up update, reviewing a PR, sourcing candidates for a role.

You end up with:

- A Notes file of prompts you keep pasting
- Slightly different output every time, because the prompt drifted
- No way to share the prompt with your team
- No record of which prompt produced which result

**Claude Skills solve the repeatability problem.** Once a skill exists, Claude triggers it automatically when the request matches. The same input produces the same output. Your team can use it. Your future self can use it.

---

## How a Claude Skill is structured

Every Claude Skill is a directory with at least one file: `SKILL.md`.

```
my-skill/
├── SKILL.md         ← required: instructions + frontmatter
├── reference.md     ← optional: additional context Claude can read
└── examples/        ← optional: sample inputs/outputs
```

The `SKILL.md` file has YAML frontmatter at the top, followed by Markdown instructions:

```markdown
---
name: prep-sales-call
description: Pull recent activity for an account before a sales call —
             company news, contact roles, last touchpoint, open opportunities.
---

# Sales call prep

## When to use
Trigger when the user mentions an upcoming meeting with a named company.

## Inputs needed
- Company name or domain
- Meeting date (defaults to next 7 days)

## Procedure
1. Look up the company in the CRM
2. Pull last 5 activities across all contacts
3. Check for news in the past 30 days
4. Summarize in the format below

## Output format
**Account:** {name}
**Last touch:** {date, channel, who}
**Recent news:** {bullets}
**Open opps:** {stage, amount}
**Recommended angle:** {one sentence}

## What "good" looks like
The rep walks into the call knowing the deal status, the last conversation,
and one fresh news hook to open with.
```

That frontmatter `description` is the most important field. Claude reads it to decide whether to load the skill, so it has to be specific. "Help with sales" is too vague. "Pull recent activity for an account before a sales call" is specific enough to trigger reliably.

---

## The 6 components of a great skill

Most "skill" tutorials online stop at three things: name, description, procedure. That's enough to make Claude load the skill. It's not enough to make the skill consistently produce good output.

A skill that holds up under real use covers six components:

| # | Component | What it answers |
|---|-----------|-----------------|
| 1 | **Intent** | What is this skill for? When should Claude trigger it? |
| 2 | **Inputs** | What does the user need to provide? What defaults apply? |
| 3 | **Procedure** | What's the step-by-step? Which tools get called? |
| 4 | **Decision points** | Where does the workflow branch? Why pick path A over B? |
| 5 | **Output contract** | What does the result look like? What format, what fields? |
| 6 | **Outcome signal** | How do you know it worked? What event in your system of record confirms success? |

Most hand-written skills cover 1, 2, 3, and 5. They skip **decision points** (the why-this-not-that choices) and **outcome signal** (how you'd measure if the skill actually worked).

Skipping those two is why hand-written skills feel brittle. The procedure looks right, but the moment the input shifts slightly, the skill doesn't know how to branch — because the author never wrote down *why* they made each choice when they did it themselves.

---

## Two ways to build a Claude Skill

### Approach 1: Write it by hand

Open a text editor, write the `SKILL.md`, drop it in `~/.claude/skills/your-skill/`, and Claude will pick it up.

**Pros:** Total control. Good for very short skills (under ~20 lines).

**Cons:** You have to articulate every decision you'd make subconsciously while doing the work. Most people miss the branches. You write down what you *think* you do, not what you *actually* do.

This is the path Anthropic's official [Skill Creator](https://docs.anthropic.com/) plugin guides you through — it interviews you, then drafts the file. It works, but it relies on you accurately describing your own workflow from memory.

### Approach 2: Demonstrate it once, let it be captured

The other approach: do the workflow normally — once. The tool calls, the data you pulled, the decisions you made, the output you produced — all of it gets captured. Then a short post-demonstration interview fills in the gaps: *why* did you choose this filter over that one, what signals success, what edge cases matter.

The output is the same `SKILL.md` file. But because it was captured from your actual behavior plus a structured interview about decision rationale, it covers all six components — including the decision points most authors leave out.

This is what [Implexa](https://implexa.ai) does. We call the captured layer **decision traces**: the visible tool calls *plus* the interview-extracted rationale behind each branch. It's the difference between a skill that handles your happy path and a skill that knows what to do when the input doesn't match.

---

## How skills run

When you make a request, Claude scans available skills' `description` fields. If one matches, it loads that skill's `SKILL.md` and follows the procedure. The skill can call tools (MCP servers, your CRM, your data warehouse), read additional reference files, and produce structured output.

You don't have to invoke skills explicitly. If the description is well-written, Claude triggers them automatically. You *can* invoke explicitly with `/your-skill-name` if you want to force a specific one.

Skills live in two places:

- **User-level:** `~/.claude/skills/` — only you can run them
- **Project-level:** `.claude/skills/` in a repo — anyone who clones the repo gets them

If you're sharing skills across a team without git, you need a separate sharing layer (the next section).

---

## Sharing Claude Skills with your team

There's no built-in way to share `SKILL.md` files across a team. You can:

1. **Commit to a shared repo** — works if every teammate clones the same repo
2. **Paste in Slack** — works once, becomes stale immediately
3. **Use a skill-graph host** — what Implexa provides: skills get a shareable link, your org sees them in a library, every run reports outcome data back so you can see which skills are working

The third option also opens up a public library — workflows other people have shared, ready to fork into your own org. If three people on different teams all build a "weekly competitor intel" skill, only one of them needs to exist publicly; the rest fork it and customize.

---

## What makes a skill actually work

A few things separate skills that work the first time from ones that need three rounds of fixing:

**Specific descriptions.** "Sales help" doesn't trigger. "Pull last 30 days of CRM activity for a named account before a meeting" triggers exactly when you want it to.

**Named tools.** If your skill needs a CRM lookup, name the tool. Don't say "look up the account" — say "call `crm_query` with the account name." Claude is much better at executing specific tool calls than improvising.

**Output examples.** Show what good looks like. One sample output beats three paragraphs of "should be concise."

**Decision rationale.** Write down *why* you'd pick option A. When the input shifts and the skill needs to branch, that rationale is what lets Claude generalize.

**Outcome signal.** Write down what event tells you the skill worked next time. CRM stage change? Calendar event accepted? Reply received? Without this, you have no feedback loop.

---

## Install Implexa to record your first skill

```bash
curl -fsSL https://core.implexa.ai/install.sh | bash
```

This installs the plugin into Claude Code. Restart Claude, then run:

```
/implexa:record
```

Demonstrate the workflow once. Answer 2–4 short interview questions. You get a working skill with all six components covered, plus a shareable link if you want to give it to your team or post it publicly.

---

## FAQ

### What's the difference between Claude Skills and Claude Code Skills?

They're the same thing. "Claude Skills" is the general term; "Claude Code Skills" refers to using them inside the Claude Code CLI specifically. The `SKILL.md` format is identical in both.

### Where do Claude Skills live on disk?

User-level skills live in `~/.claude/skills/`. Project-level skills live in `.claude/skills/` inside the repo. Both are auto-discovered.

### Can I share a skill without giving someone access to my whole codebase?

Yes. Either commit the skill to a public repo and share the path, or use a skill-graph host (like Implexa) that gives each skill its own shareable link.

### Do Claude Skills work outside Claude Code?

The `SKILL.md` format is specific to Claude Code's loader. Claude Desktop and the Anthropic API don't auto-load skills the same way — you'd paste the contents into a system prompt or wrap them in an agent.

### How is this different from MCP?

MCP (Model Context Protocol) is the protocol Claude uses to *call* external tools. Skills are the *instructions* for when and how to call them. A skill can use one or more MCP servers; an MCP server is useful even without skills.

### What does Anthropic's Skill Creator plugin do?

Skill Creator is Anthropic's official skill-authoring tool. It interviews you about a workflow, then generates a `SKILL.md`. It's a description-first approach — you tell it what the workflow is. [Implexa](/blog/how-to-create-a-claude-skill) is a demonstration-first approach — you do the workflow once and the capture layer plus interview produce the skill.

---

## Next reads

- **[How to Create a Claude Skill (Step-by-Step)](/blog/how-to-create-a-claude-skill)** — A 7-step walkthrough from install to running your first skill.
- **[What Are Claude Skills? (5-Minute Explainer)](/blog/what-are-claude-skills)** — Short definitional read with sample `SKILL.md`.
