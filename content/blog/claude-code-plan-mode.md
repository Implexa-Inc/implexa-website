---
title: "Claude Code plan mode: how and when to use it"
slug: "claude-code-plan-mode"
description: "Claude Code plan mode is a read-only state where Claude proposes a plan and changes nothing until you approve. How to turn it on, and when it earns its place."
publishedAt: "2026-07-02"
tags: ["claude-code", "plan-mode", "ai-agents", "workflow", "automation"]
---

# Claude Code plan mode: how and when to use it

Claude Code plan mode is a read-only state where Claude reads your code, works out how it would make a change, and shows you the whole plan before it edits a single file. You approve the plan, or you send it back for another pass. Nothing lands on disk until you say so. It is the difference between an agent that starts typing while you are still explaining the problem and one that thinks the problem through in front of you first.

Most people find it the hard way. You ask for a small refactor, Claude confidently rewrites four files, and two of them were not the four you meant. Plan mode is the fix for that whole category of "it did something, just not the thing I wanted." This guide covers what plan mode is, the three ways to switch it on, what it actually does under the hood (which is less magical than it looks), when it pays for itself, and where its usefulness runs out.

## What is Claude Code plan mode?

Plan mode is a permission mode that lets Claude explore and propose but not modify. In it, Claude can read files, search the codebase, and run read-only commands to understand what it is looking at, then it writes up a structured plan: what it will change, in which files, and in what order. What it cannot do is edit, create, or delete anything until you leave plan mode by approving. The official docs put it plainly: Claude "reads files and proposes a plan but makes no edits until you approve."

That gate matters most on the changes where a wrong first move is expensive. A schema migration, a rename that threads through a dozen imports, a security check you cannot afford to get subtly wrong. In normal mode Claude is already editing by the time you notice it misread the task. In plan mode you get a checkpoint: a written proposal you can read in ten seconds and correct before any of it is real.

## How do you turn on plan mode?

There are three ways in, and which one you reach for depends on whether you are already mid-session. The fastest is the keyboard: press `Shift+Tab` to cycle Claude Code's permission modes, and plan mode is one of the stops in that cycle alongside normal and auto-accept. You will see the mode indicator at the bottom of the prompt change as you tab through.

If you know before you even start that a task deserves the gate, launch the session in plan mode:

```bash
claude --permission-mode plan
```

Every prompt in that session then defaults to planning first. Recent versions of Claude Code also add a `/plan` slash command, which is handy when you are deep in a conversation and want to switch to planning without hunting for the keyboard shortcut. All three land in the same place. The plan appears, you read it, and you approve or revise. If you want to change the plan yourself before approving, you can open it in your editor and edit the text directly, which is often faster than describing the change in prose.

## What plan mode actually does under the hood

One thing changes how much you should trust plan mode: it is a workflow guardrail, not a sandbox. Under the hood it is built largely from prompting. Claude is told, in effect, that you do not want it to execute yet, it writes its plan to a file, and it reads that plan back before acting once you approve. The tools available to it are not physically locked down at the system level. As Armin Ronacher observed in a close look at the feature, most of the value comes from structured prompting and a confirmation screen rather than a hard technical wall.

Why does that distinction matter in practice? Because it tells you where the seatbelt ends. Plan mode reliably stops the ordinary failure it was built for: Claude charging ahead and editing before you have agreed on the approach. It is not a security boundary you should lean on to contain a genuinely untrusted instruction, and it is not the same thing as a permission allowlist that governs which tools can run at all. Treat it as a very good review step, which is exactly what it is, and pair it with real permission controls when the stakes are about safety rather than about getting the change right.

## When should you use plan mode?

Reach for plan mode whenever a wrong first edit would cost you more than the ten seconds of reading a plan costs. The clear cases: any change that touches three or more files, a database schema change, anything security-sensitive, and any task where you are not fully sure Claude has understood the goal. In all of those, the plan is cheap insurance. You catch the misunderstanding on paper instead of in a diff you now have to unwind.

Skip it when the overhead outweighs the benefit. A one-line fix, a typo, a rename in a single file, a read-only question you already know the answer to. Forcing a planning step onto a trivial edit just adds a screen to click through. The rule of thumb that holds up: the larger the blast radius of a mistake, the more plan mode earns its place, and the smaller it is, the more plan mode is just friction. On a real codebase, plan mode also doubles as a teaching tool for someone new to the project, since the plan shows how Claude reasons about your architecture before anything changes.

## Plan mode or just asking for a plan?

You could type "give me a plan first, do not edit anything yet" and get most of the same behavior, so what does the mode add? Two things. It gives you a confirmation screen, an explicit approve step instead of hoping Claude honors an instruction buried three messages back. And it makes the intent sticky for the whole session rather than for one prompt, so you are not re-asking for restraint every time. The tradeoff, and it is a fair criticism, is that you are switching interface modes to get structure that careful prompting could also produce. If you already prompt with discipline, plan mode mostly buys you the approval gate and the guarantee that it stays on. For most people that guarantee is the point, because discipline is the thing that slips at 5pm on a Friday.

## Where plan mode stops, and a control plane begins

Plan mode is built for a person sitting at the keyboard, and its whole design assumes you are there to read the plan and click approve. That assumption is also its ceiling. The moment the work leaves your terminal, an agent [running on a schedule](/blog/schedule-claude-code) overnight, a task kicked off from your phone, a job that should pause before it emails a customer, there is no one at the prompt to approve the plan. Plan mode has nothing to say about that world.

That is a different problem than the one plan mode solves, and it is the seam [implexa](/) sits in. Plan mode gates an agent while you watch it; a control plane gates one while you are asleep. When Claude Code or Codex runs unattended, the review step has to move off the keyboard: a risky action pauses and waits for a single tap of approval wherever you are, the result lands somewhere you actually read, and a human stays [in the loop](/blog/ai-agent-human-in-the-loop) without having to babysit the session. The same instinct that makes you press `Shift+Tab` before a schema change, see it before you ship it, is what plan mode gives you inside one session and what a control plane gives you across every unattended run. Plan mode is the interactive version. It pairs well with the other levers Claude Code hands you, from [subagents](/blog/claude-code-subagents) that keep exploration out of your main context to [hooks](/blog/claude-code-hooks) that enforce a rule whether you remember it or not.

## FAQ

### How do I turn on plan mode in Claude Code?

Press `Shift+Tab` mid-session to cycle into plan mode, or start the session with `claude --permission-mode plan` so every prompt plans first. Recent versions also add a `/plan` slash command. However you enter it, Claude proposes a plan and edits nothing until you approve.

### Does plan mode stop Claude from editing files?

Yes, until you approve. In plan mode Claude reads files, searches, and proposes a change, but it does not create, edit, or delete anything until you leave plan mode by accepting the plan. The gate is on the edit, not on reading or analysis.

### Is plan mode a security sandbox?

No. It relies on prompting and a confirmation step to hold Claude back, so it works as a review gate but does not physically lock the tools down. It reliably keeps Claude from editing before you agree on the approach. For genuine safety containment, reach for real permission controls rather than leaning on plan mode alone.

### When should I use plan mode versus normal mode?

Use plan mode for changes that span three or more files, schema changes, security-sensitive code, or any task where you are unsure Claude understood the goal. Skip it for one-line fixes, single-file renames, and read-only questions, where the planning step is just extra clicks.

### What is the difference between plan mode and asking Claude for a plan?

Asking for a plan is a one-off instruction Claude can drift from later in the session. Plan mode adds an explicit approval screen and keeps the "plan first" intent on for the whole session, so you get a reliable gate instead of hoping a mid-conversation instruction still holds.
