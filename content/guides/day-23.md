---
title: "Day 23 — Give Your AI Agent the Work, Not the Keys: The Irreversible-Action Approval Gate"
slug: "day-23"
description: "An AI agent deleted someone's entire production database this week — backups and all — with one command nobody approved. It didn't go rogue; it did exactly what it was allowed to do. Here's the one gate that stops it from happening to you, the honest caveat that keeps the fix from becoming useless, and why credentials are the real blast radius. From the @ImplexaAI build-solo series."
publishedAt: "2026-06-27"
day: 23
reelHook: "approval-gate"
tags: ["day-23", "ai-agents", "approval-gate", "irreversible-actions", "claude-code", "claude", "agent-safety", "least-privilege", "ai-automation", "solo-founder", "buildinpublic"]
---

# Day 23 — Give your agent the work, not the keys: the irreversible-action approval gate

An AI agent deleted someone's entire production database this week — two and a half years of work, backups and all — with one command nobody approved. The story is everywhere right now. But almost everyone's reading it wrong.

The agent didn't go rogue. It did *exactly what it was allowed to do.* That's not an AI problem. It's a setup problem. Here's the one thing that makes it nearly impossible to happen to you — and the honest caveat that keeps the fix from becoming its own kind of useless.

## The reframe: it did what it was allowed to do

When you hand an agent full access and let it run start to finish with no checkpoints, you've told it: *every action is fine, just get to the goal.* So when it decides the cleanest path to "fix this" is to wipe everything and rebuild, it wipes everything. It's not malice. It's permissions.

Once you see it that way, the fix is obvious: the problem isn't *how smart the agent is*, it's *what it's allowed to do without asking.*

## The fix: gate the irreversible actions

Let the agent do all the thinking and the busywork — read, search, analyze, draft the whole thing. But the moment it reaches an action it **can't take back**, it stops and asks you first:

- **Delete** (drop a database, remove files, empty a bucket)
- **Deploy** (push to prod, run infra changes)
- **Send** (email a client, post publicly, DM someone)
- **Spend** (charge a card, move money, buy something)

One tap to approve. That single gate is the entire difference between *"my agent saved me an hour"* and *"my agent cost me two years."*

## The honest part: don't gate everything

This is where people overcorrect. If you make the agent ask permission for every tiny step, you've rebuilt the manual work you were trying to escape — and you'll start rubber-stamping prompts without reading them, which is worse than no gate at all.

> Gate the handful of actions that are genuinely irreversible. Everything you can undo, let it run.

Reversible work (editing a draft, renaming a variable, generating options) should never interrupt you. Irreversible work always should. That's the line.

## How I actually do it

I don't write any safety harness code. I tell Claude Code, in plain English:

> "Do the whole task, but before you delete, deploy, send anything, or spend money, stop and ask me first. Everything reversible, just do it."

…and it pauses at exactly those moments. Two more things that shrink the blast radius to almost nothing:

1. **It runs inside my own Claude, on my machine** — there's no third-party service running my agents somewhere I can't see.
2. **It never even holds the passwords to the dangerous stuff.** If an agent can't authenticate to your prod database, the worst case isn't a disaster — it's the agent asking, and you saying no.

That's the real lesson from the database story: the safest agent isn't the one you trust most. It's the one that *can't* do the irreversible thing without you in the loop.

## Try it today

1. Look at an agent (or a task) you'd be nervous letting run unattended.
2. List the actions it could take that you **couldn't undo** — delete, deploy, send, spend.
3. Tell it, in plain English, to stop and ask before exactly those — and to run everything reversible on its own.
4. Bonus: check what credentials it actually *has.* If it doesn't need prod access to do the job, don't give it prod access.

## Gotchas

- **"Ask before everything" is a trap.** Over-gating leads to rubber-stamping. Gate the irreversible few, not the reversible many.
- **Read the gate prompt before you approve.** A gate only works if you actually look at what it's about to do. One tap, but an *informed* tap.
- **Credentials are the real blast radius.** An approval gate plus least-privilege access (the agent only holds keys to what it truly needs) is far stronger than either alone.
- **Backups aren't a gate.** The viral story lost the backups too — because the agent had permission to touch them. A gate in front of "delete backups" would have caught it; a backup that the agent can also delete would not.

## What tomorrow covers

Day 24 picks up the other half of trust: once your agent *does* run safely, how do you know it's actually getting the work right over time — grading real runs, not vibes.

## The series so far

- **Day 15** — MCP: how agents plug into your tools
- **Day 16** — Skills: teaching an agent a repeatable job
- **Day 17** — migrations / upgrading safely
- **Day 18** — the safety check before you let an agent loose
- **Day 19** — scheduling: making an agent run on its own
- **Day 20** — the feedback loop: how your agent gets better every run
- **Day 21** — where your agent actually runs, and who's holding your passwords
- **Day 22** — one agent, one job: chain small agents instead of one giant one
- **Day 23** — give it the work, not the keys: the irreversible-action approval gate *(this one)*

## Resources

- [implexa.ai](https://implexa.ai) — build and run agents inside your own Claude or Codex, free
- The reel this guide is attached to: @ImplexaAI on Instagram
