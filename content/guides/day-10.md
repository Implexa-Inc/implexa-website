---
title: "Make Claude Run While Your Laptop's Closed (Claude Code Routines)"
slug: "day-10"
description: "Claude Code Routines run in the cloud on Anthropic's infrastructure, so a scheduled job fires even when your laptop is asleep or fully off. Set one up with /schedule, give it a plain-English job and a repo, and a 7am standup is done before you wake up. The setup, three routines worth stealing, the schedule-vs-event triggers, and the honest caveats (cloud repo clone, daily run caps). From the @ImplexaAI build-solo series."
publishedAt: "2026-06-09"
day: 10
reelHook: "routines"
tags: ["day-10", "claude-code", "routines", "scheduled-tasks", "ai-agents", "automation", "claude", "developer", "cron", "solo-founder", "buildinpublic"]
---

# Make Claude Run While Your Laptop's Closed (Claude Code Routines) — Implexa AI Guide

*A standalone guide from the @ImplexaAI build-solo series. No prior reading required — if you use Claude Code (or are curious about it), this is the feature that turns "Claude helps me while I work" into "Claude did the work while I slept."*

---

## TL;DR

A **routine** is a Claude Code job that runs **in the cloud on a schedule** (or on an event), so it fires even when your laptop is closed.

- **Set it up:** type `/schedule` inside Claude Code, describe the job in plain English ("every morning at 7, pull my open issues and write me a standup"), connect a repo, save.
- **It runs remotely.** Routines execute on Anthropic's infrastructure, **not your machine.** Your computer can be asleep or fully off and the job still runs. (This is the hard contrast with `/loop`, which is local and only runs while Claude Code is open on your machine.)
- **Two main triggers:** a **schedule** (a time, cron-style) or a **GitHub event** (e.g. when your code ships / a PR opens). There's also an on-demand API trigger.
- **The honest catch:** a routine works off a **fresh cloud clone of your repo's default branch**, not your local files. It's built for repo-scoped work, and your plan **caps how many routines run per day** (roughly 5/day on the entry plan, more on the bigger ones).

**The one line:** *close your laptop. Claude keeps working.*

---

## The pain it kills

`/loop` and other in-session automation are great, but they all share one limit: they only run while you're sitting there with Claude Code open. Close the terminal, shut the lid, or let the machine sleep, and the work stops. So the moment you actually want — "just do this overnight and have it ready when I wake up" — is the one thing a local loop can't do.

Routines move the job off your machine. You describe it once, Claude runs it in the cloud on the schedule you set, and the result is waiting for you whether or not your laptop was ever on.

---

## How to set one up

Inside Claude Code:

1. **Run `/schedule`.** This is the command that creates and manages routines. (You can also create and manage them at `claude.ai/code`.)
2. **Describe the job in plain English, with a trigger.** For example:
   *"Every weekday at 7am, pull my open GitHub issues, group them by priority, and write me a short standup."*
3. **Connect the repo** the routine should work against. The routine will clone that repo (default branch) fresh each run, in the cloud.
4. **Save it.** From now on it runs on its own — no terminal open, no machine on.

That's it. The next morning at 7, the standup is sitting there waiting.

---

## The two triggers (it's not only a clock)

### 1. Schedule (time-based)
The default mental model: run this job at these times. *"Every morning at 7,"* *"every Friday at 5pm,"* *"every night at midnight."* Cron-style recurrence, run in the cloud.

### 2. Event (reacts to your work)
A routine can also fire on a **GitHub event** instead of a clock — for example, **every time your code ships** (a push/merge to your default branch) or when a PR opens. So instead of "every hour, check if anything shipped," the routine wakes up *because* something shipped. (Event triggers need the Claude GitHub App installed on the repo.)

> There's also an **on-demand API trigger** (kick a routine via an HTTP call) for wiring routines into other tools. Nice for power users; not needed to get value on day one.

---

## Three routines worth stealing

1. **Morning standup.** *"Every weekday at 7am, pull my open issues, group by priority, flag anything stale > 3 days, and write me a 5-line standup."* You wake up oriented instead of triaging.
2. **Ship-time changelog.** *(event trigger)* *"When code ships to main, summarize what changed in plain English and draft a changelog entry."* Your release notes write themselves at the moment of the merge.
3. **Nightly dependency / health check.** *"Every night at 1am, check for outdated or vulnerable dependencies and open an issue with the findings if anything's off."* You only hear about it when there's something to fix.

The pattern: pick a recurring, repo-scoped chore you currently do by hand, describe it once, and let the routine carry it on a schedule.

---

## The honest caveats (so you don't get surprised)

- **Cloud clone, not your local files.** A routine works off a **fresh clone of your repo's default branch** in the cloud. It does **not** see your uncommitted local changes, local config, or files outside the repo. Build routines around committed, repo-scoped work.
- **Default branch.** Routines clone the default branch (usually `main`), not arbitrary local branches.
- **Daily run caps by plan.** There's a limit on how many routine runs you get per day — roughly **5/day on the entry plan**, more on higher tiers. Routine runs also share the same usage budget as your interactive Claude Code sessions, so very heavy automation can eat into your interactive headroom.
- **GitHub App for event triggers.** To trigger on GitHub events, the Claude GitHub App must be installed on the repo.
- **It's real cloud execution, not magic.** It runs your prompt as an agent in a sandbox; treat it like any automated job (least-privilege, review what it can touch).

None of these are dealbreakers. They're the boundary of the feature, and knowing them is the difference between "this is amazing" and "why didn't it see my local file."

---

## `/loop` vs Routines — which one do I want?

| | `/loop` | Routines (`/schedule`) |
|---|---|---|
| **Runs where** | Your machine | Anthropic's cloud |
| **Machine on / Claude open?** | Yes, both | No |
| **Best for** | Babysitting something *while you work* (watch this deploy, fix the PR until it's green) | Jobs that should run *while you're away* (a 7am standup, a ship-time changelog) |
| **Trigger** | You start it in the session | A schedule, a GitHub event, or an API call |
| **Sees your local files?** | Yes | No — fresh cloud clone of the repo |

Use `/loop` when you want a co-pilot at your desk right now. Use a routine when you want the work to happen without you there at all.

---

## What's next

A routine runs whether or not you're watching, which raises the obvious question: **how do you know it actually ran, and did the right thing?** That's the next guide — making automated work *observable* so a silent failure doesn't slip past you.

*Close your laptop. Claude keeps working — and tomorrow, how to make sure it actually did.*

---

*Part of the @ImplexaAI build-solo series — one concrete build concept a day, Claude-Code-first. Follow [@ImplexaAI](https://instagram.com/ImplexaAI) for the daily reel.*
