---
title: "How to Create a Claude Skill (Step-by-Step)"
slug: "how-to-create-a-claude-skill"
description: "A 7-step walkthrough for creating your first Claude Skill — from install through recording, interview, activation, and sharing with your team."
keywords:
  - how to create a claude skill
  - how to build a claude skill
  - create claude skill
  - how to write claude skill
  - claude skill tutorial
  - skill.md tutorial
canonical: "https://implexa.ai/blog/how-to-create-a-claude-skill"
ogImage: "/og/how-to-create-a-claude-skill.png"
publishedAt: "2026-05-18"
updatedAt: "2026-05-18"
author: "Implexa"
---

# How to Create a Claude Skill (Step-by-Step)

This tutorial walks you through creating a working Claude Skill end to end — install, demonstrate, answer the interview, activate, run, and share. About 10 minutes of actual work.

By the end, you'll have a skill that triggers automatically when the matching task comes up, produces consistent output, and can be shared with your team via a single link.

> **New to skills?** Read [What Are Claude Skills?](/blog/what-are-claude-skills) first for the 5-minute version of the concept. Then come back here for the build.

---

## What you'll need

- **Claude Code** installed (either CLI or Desktop). [Anthropic's install guide](https://docs.anthropic.com/) if you're starting from zero.
- A workflow you do repeatedly — anything 3–7 steps that touches one or more tools (CRM, docs, search, internal API). Best candidates: things you've copy-pasted prompts for more than twice.
- About 10 minutes.

---

## Step 1 — Install the Implexa plugin

Open a terminal and run:

```bash
curl -fsSL https://core.implexa.ai/install.sh | bash
```

The installer:

1. Adds Implexa to your Claude Code plugin marketplace
2. Installs the plugin into the cache
3. Wires up the MCP server (the part that captures tool calls)
4. Walks you through linking your install to your account

If you don't have an Implexa account yet, the script opens a browser tab to create one — free tier, no credit card.

Restart Claude Code (`Cmd+Q` then relaunch on Mac) so the new plugin loads.

> **Already have it installed?** Re-run the script anyway if you're below v0.6.0 — Claude Code's auto-update refreshes the marketplace but doesn't always repopulate the version cache. The script handles both fresh installs and upgrades.

---

## Step 2 — Pick a workflow to demonstrate

The skill will only be as good as the workflow you demonstrate. Pick something:

- **Concrete.** "Help me with sales" is too vague. "Pull a prospect's recent LinkedIn activity, last touch in our CRM, and any news about their company in the last 30 days" is concrete.
- **Repeatable.** If you do it once a month, it's probably not worth a skill. If you do it 3+ times a week, it is.
- **Bounded.** Skills work best with a clear start (input) and end (output). Open-ended exploration is harder to capture.

Examples that work well:

- Sales call prep for a named account
- Weekly stand-up update from this week's commits and tickets
- Code review checklist for a PR
- Investor pipeline weekly status
- New-hire onboarding research (their LinkedIn, recent role changes, top contacts)

---

## Step 3 — Start the demonstration

In Claude Code, run:

```
/implexa:record
```

Implexa asks you a few setup questions:

1. **Proposed skill name** — short, kebab-case. e.g., `prep-sales-call`, `weekly-standup`, `pr-review-checklist`.
2. **Initial intent** — one sentence on what this skill is for. This becomes the seed for the skill's `description` field.

Then it tells you to **just do the work**. Don't narrate, don't explain — Claude is watching the tool calls and conversation.

---

## Step 4 — Do the workflow

Run the workflow you'd run normally. Call the tools you'd call. Make the decisions you'd make.

A few things that improve the capture:

**Make decisions out loud when they matter.** If you're choosing between two filters, write *why* — "I'm filtering by amount > 50k because we don't need to prep for SMB deals." That rationale gets captured.

**Use `record_demo_note` for non-tool actions.** Sometimes you do something outside Claude's view — open a Notion doc, check a Slack thread. Tell Claude:

```
record this: I checked Slack #competitive for any mentions of Acme in the past 7 days
```

That note becomes part of the trace.

**Don't skip steps because they feel obvious.** The skill is being authored from the trace. If you skip the "pull the last 5 activities" step, the skill won't include it.

---

## Step 5 — End the demonstration and answer the interview

When the workflow is done, run:

```
/implexa:record stop
```

Implexa pauses for ~10 seconds while it generates **2–4 targeted interview questions**. These are not generic "tell us more" questions — they're surgical, based on what you actually did:

- *"At step 4 you filtered to only deals over $50k. Why that threshold?"* (decision)
- *"What does a good output look like — paragraph summary, structured fields, or a Slack-ready blurb?"* (output contract)
- *"What signals next week that this skill worked? CRM stage change, meeting booked, reply received?"* (outcome signal)
- *"What if zero results come back from the news search?"* (edge case)

Each question comes with **3–4 clickable options** so you can answer with a click instead of typing. The first option is what your trace evidence suggests is most likely — usually right, sometimes worth picking an alternative.

Answer all 2–4 questions. About 60 seconds.

---

## Step 6 — Activate and review

Implexa drafts the `SKILL.md` from your trace + interview answers and writes it to `~/.claude/skills/{your-skill-name}/`.

Run:

```
/implexa:activate {your-skill-name}
```

This marks the skill as active so Claude triggers it automatically when matching requests come in.

**Test it.** Open a fresh conversation and ask the kind of question that should trigger the skill. e.g., if you built `prep-sales-call`, ask:

```
I have a meeting with Acme Corp tomorrow, prep me
```

Claude should load your skill, follow the procedure, and produce the output in the format you specified.

If something looks off — wrong step, missing decision, output format wrong — go to step 7.

---

## Step 7 — Update the skill (re-record into it)

A skill isn't done at v1. Real workflows shift as you learn what's actually useful. Two ways to update:

**Option A — Manual edit.** Open `~/.claude/skills/{name}/SKILL.md` in any editor. Edit the procedure, add a step, change the output format. Save. Done.

**Option B — Re-record into the existing skill.** This is the powerful one:

```
/implexa:update-skill {your-skill-name}
```

You demonstrate the workflow again with whatever changes you've learned. Implexa **merges** the new demonstration into the existing skill — it doesn't hard-replace. Existing structure is preserved, new steps get integrated.

This is how skills evolve. The first version is the rough cut. After two or three re-records, the skill knows the edge cases you've actually hit.

---

## Step 8 — Share with your team

Once the skill is working for you, give it to your team:

```
/implexa:share {your-skill-name}
```

Pick the scope:

- **Org** — only people on your Implexa workspace can run it. Good for skills with internal context.
- **Universal** — anyone with the link can run it; appears in the public library. Good for generic workflows other teams might want.

You get back a link like `https://app.implexa.ai/s/abc123`. Drop it in Slack, email, doc, wherever. Anyone who clicks it can run the skill in their own Claude Code without copying any files.

**Undo public.** If you share publicly and want to roll it back: hit "Undo public" on the dashboard. The link stops working, the skill drops out of the universal library, and its scope reverts to whatever it was before (private or org).

---

## Troubleshooting

### The skill isn't triggering automatically

The `description` field in the skill's frontmatter is probably too vague. Open `~/.claude/skills/{name}/SKILL.md` and look at the first 5 lines. A trigger like "Help with sales" won't fire — Claude can't tell what input matches. Rewrite it to name the specific situation: "When the user mentions an upcoming meeting with a named company, pull..."

### The interview gave me "malformed JSON" or no questions

Re-run `/implexa:record stop`. If it persists, your plugin may be below v0.6.0 — run the install script again to refresh.

### The output format is wrong

Re-record with `/implexa:update-skill` and during the interview, when asked about output format, pick the option that matches what you actually want (or type a custom answer in the "Other" field). The skill regenerates with the new contract.

### I want to fork someone else's public skill

```
/implexa:fork {their-skill-name}
```

It copies the skill into your own org so you can customize without affecting the original.

---

## What good looks like

A skill is working when:

- It triggers automatically when you make a matching request (no need to type `/skill-name`)
- The output format is consistent every time
- When the input shifts slightly, the skill branches correctly instead of failing
- Your teammates can use it without you walking them through anything
- You can point at outcome data — "this skill ran 14 times this week, 9 of them moved a deal stage"

---

## Next reads

- **[What Are Claude Skills? (And the Right Way to Build Them)](/claude-skills)** — The pillar guide with the 6-component contract and how skills run under the hood.
- **[What Are Claude Skills? (5-Minute Explainer)](/blog/what-are-claude-skills)** — Definitional 5-minute version.
