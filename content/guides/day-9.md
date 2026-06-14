---
title: "Put Claude on a Loop (Claude Code /loop)"
slug: "day-9"
description: "Claude Code's /loop command is getting a ton of attention right now, and it's worth it. It turns a one-shot ask into a self-running task: hand Claude a goal once and it keeps working until the job is done, instead of you re-asking 'is it ready yet?'. The two modes, the killer use (babysitting a deploy or PR), the exact commands to copy, and the honest caveats. From the @ImplexaAI build-solo series."
publishedAt: "2026-06-08"
day: 9
reelHook: "loop"
tags: ["day-9", "claude-code", "loop", "ai-agents", "automation", "claude", "developer", "polling", "solo-founder", "buildinpublic"]
---

# Put Claude on a Loop (Claude Code `/loop`) — Implexa AI Guide

*A standalone guide from the @ImplexaAI build-solo series. No prior reading required — if you use Claude Code (or are curious about it), this is one of the highest-leverage commands to learn.*

---

## TL;DR

`/loop` runs a task over and over on its own, so you stop being the human who keeps asking Claude "is it done yet?".

- **Fixed interval:** `/loop 5m check if the deploy went through` — runs every 5 minutes until you stop it (`s`/`m`/`h`/`d` for seconds/minutes/hours/days).
- **Self-paced (the good one):** `/loop babysit my pull request` — no time given, so Claude picks its own cadence (checks more when things are moving, less when they're not) and **stops itself when the goal is met.**
- **Stop it any time:** press `Esc` while it's waiting between runs.
- **The honest catch:** it runs **on your machine while Claude Code is open.** It's a co-pilot at your desk, not a cloud job. Close the terminal or sleep the machine and the loop stops. (For off-machine, you want Routines or scheduled tasks — that's tomorrow's guide.)

**The one line:** *stop re-asking. Put it on a loop.*

---

## The pain it kills

Most of the friction with an AI coding tool isn't the AI being wrong. It's the babysitting. You ask it to do a thing, it does it once, and then you sit there re-asking: did the deploy finish? did CI go green? are the tests passing yet? You become a human polling loop, refreshing and re-prompting, unable to walk away.

`/loop` hands that job back to Claude. You describe the goal once, and Claude becomes the one that keeps checking, keeps working, and tells *you* when something's worth your attention.

---

## The two modes

### Mode 1 — Fixed interval (a poller on a clock)

```
/loop 5m check if the deployment finished and tell me
/loop 20m run the test suite and report failures
/loop 2h check the build status
```

You give it a time, it runs the prompt on that schedule, every interval, until you stop it. Great for **watching something change** — a deploy, a long build, a queue draining. Think of it as an assistant who refreshes the page for you and taps you on the shoulder when it matters.

Two things to know: a fixed-interval loop **does not stop on its own** (press `Esc`), and each run re-does the full prompt, so use it for quick checks rather than slow grinding.

### Mode 2 — Self-paced (hand off the whole errand)

```
/loop babysit my pull request, fix what breaks, and tell me when it's green
/loop watch the deploy and address anything that fails
```

Leave the time off entirely. Now Claude **paces itself** — it reasons about the task and picks its own delay before each run (anywhere from about a minute to an hour), checking more often when things are actively moving and backing off when they're not. And the part that makes people stop scrolling: **when the goal is genuinely done, it ends the loop on its own.**

This is the mode that's more than a timer. It doesn't just re-run a command — it can *act*: pull the new review comments, fix what broke, re-run the checks, and resolve the thread. You're not setting an alarm, you're delegating the errand.

---

## The killer use: babysitting the slow stuff

The thing `/loop` is made for is the work that's mostly *waiting*:

- **Deploys:** "watch the deploy, and if it fails, tell me why." Walk away; come back to either a green check or a clear explanation.
- **Pull requests:** "watch my PR, address review comments, fix failing checks, ping me when it's green." The single best `/loop` use — it turns the slowest part of shipping into something that happens while you get coffee.
- **Flaky tests:** "re-run the suite until everything passes, and show me what was flaky."

The pattern is always the same: a goal with a finish line, plus some waiting in the middle. You define the finish line, Claude does the waiting and the poking.

---

## The honest caveats (so you don't get surprised)

`/loop` is genuinely useful, but it's not magic, and knowing the edges keeps you out of trouble:

1. **It's local and session-scoped.** It runs while Claude Code is open on your machine. Close the terminal or let the machine sleep and the loop stops. It is **not** a background daemon and **not** a cloud job. (Need it to run when your laptop's closed? That's Routines / scheduled tasks — the next guide.)
2. **Fixed loops run until you stop them.** Press `Esc`. A `/loop 5m` left running all day is 288 runs, and each run costs tokens. Use intervals for quick checks; use self-paced mode for things that should end themselves.
3. **Recurring loops expire after ~7 days.** If you need something to run for longer, that's a scheduled routine, not a `/loop`.
4. **Timing isn't to-the-second.** Loops fire approximately on their interval, not on an exact wall clock. Fine for "check the deploy," not for "fire at exactly 9:00:00."

None of these are dealbreakers. They're the difference between using `/loop` well and being surprised by it.

---

## Try it in the next five minutes

1. Kick off any deploy or long-running task.
2. In Claude Code, type: `/loop 5m check if the deploy finished and tell me when it's live`.
3. Walk away. Come back to a report instead of a blank prompt.
4. When you're comfortable, try the self-paced version on a PR: `/loop babysit this pull request, fix failing checks, and tell me when it's green` — and watch it pace itself and stop when done.
5. Press `Esc` whenever you want it to stop.

---

## The one line

**Stop re-asking. Put it on a loop.**

You stop operating Claude step by step and start handing it goals. That shift — from running the tool to delegating to it — is the whole point.

---

*Part of the @ImplexaAI "Day X of building a $Bn company, solo" series — one concrete build concept per day, in plain language. Next up: how to make a task run even when your laptop is closed.*
