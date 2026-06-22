---
title: "How to schedule Claude Code to run on its own"
slug: "schedule-claude-code"
description: "How to schedule Claude Code to run on its own: desktop scheduled tasks, the loop command, cloud routines, and the limit each option quietly hides from you."
publishedAt: "2026-06-22"
tags: ["claude-code", "scheduled-tasks", "automation", "ai-agents", "cron"]
---

# How to schedule Claude Code to run on its own

To schedule Claude Code, you have three options, and which one you pick depends on whether your machine needs to be awake. Desktop scheduled tasks fire on a recurring schedule as long as the app is open. The CLI has a lighter `/loop` command for repeating a prompt inside a single session. And Claude Code routines run in Anthropic's cloud, so they keep going when your laptop is shut. All three take the same raw material: a prompt written in plain English and a cadence, like every Monday at 8am.

Most people find this feature while trying to get rid of one recurring chore. They already run the task by hand in Claude Code, it works, and the obvious next thought is "why am I the trigger?" That instinct is right. The trouble is that "schedule it" turns out to mean three different things with three different sets of fine print, and the docs hand you all of them at once. This guide sorts them out, then names the limit that all of them share.

## Can Claude Code run on a schedule?

Yes. Claude Code can run a saved prompt on a recurring schedule without you starting it, and it has been able to since the scheduled-tasks feature shipped. You write the prompt once, attach a cadence, and Claude spins up a fresh session each time the schedule fires.

The catch is that "Claude Code" now means several different surfaces. There is the desktop app, the CLI in your terminal, and cloud routines. Each one schedules work differently, and the differences are not cosmetic. One runs on your machine, one runs only while a terminal session is alive, and one runs on infrastructure you never see. Pick the wrong one and your 6am brief silently never fires because your laptop was asleep.

## How do you schedule a task in the Claude Code desktop app?

In the desktop app, click Schedule in the sidebar, then New task, and fill in the prompt and cadence. This is the path most people want, because the schedule survives restarts and runs on a clear visual calendar.

A task takes a name, a short description of what it does, the prompt Claude should run, and the schedule itself, which can be hourly, daily, weekly, or a custom interval. You also set the model, the permission mode, and the working folder, so a task that edits a repo can be pinned to that repo and isolated in its own worktree. When the time comes, Claude opens a fresh session, runs the prompt, and stops.

The thing to internalize: a desktop scheduled task is machine-bound. It fires only while the app is open and the computer is awake. Close the lid on Sunday night and the Monday-morning run waits until you open it again, which is usually the moment you stop trusting it.

## How do you schedule a prompt from the Claude Code CLI?

In the terminal, use `/loop` to repeat a prompt on an interval inside the current session. Type something like `/loop 5m check if the deploy finished and tell me what happened`, and Claude parses the interval, converts it to a cron expression, and confirms the cadence and a job id.

This is the lightest of the three, and it is meant for short-lived monitoring rather than durable automation. The job lives in the Claude Code process you started it in. When you close that terminal, the loop is gone. So `/loop` is the right tool for "watch this build and ping me when it breaks" during an afternoon, and the wrong tool for "every weekday, draft my standup." If you need a cron expression directly, the CLI's scheduling tools accept one, so `0 8 * * 1` gives you 8am every Monday without the natural-language step.

## What are Claude Code routines, and when should you use them?

Claude Code routines are saved configurations, a prompt plus repositories and connectors, that run automatically on Anthropic's cloud. Use them when the work has to happen whether or not your computer is on.

A routine can be triggered three ways: on a recurring schedule, by an HTTP API call, or by a GitHub event like a new pull request. Because it runs in the cloud, a routine keeps firing when your laptop is closed and you are on a plane, which is the one thing neither desktop tasks nor `/loop` can promise. The tradeoff is that the work runs on Anthropic's infrastructure with the connectors you grant it, not on your machine with your local files, so a routine fits a self-contained job better than one that depends on whatever is sitting in your downloads folder.

## Which scheduling option should you pick?

Pick by where the work needs to run and how long it needs to live. The short version: `/loop` for an afternoon, desktop tasks for daily work on a machine you leave on, routines for work that cannot depend on your laptop.

| Option | Runs where | Survives a restart? | Best for |
| --- | --- | --- | --- |
| `/loop` (CLI) | Your terminal session | No, dies when you close the session | Quick polling, watching a build |
| Desktop scheduled task | Your machine, app open | Yes, but only while awake and open | Daily and weekly jobs you can babysit lightly |
| Cloud routine | Anthropic's cloud | Yes, laptop can be off | Self-contained jobs that must always fire |

If you are choosing for the first time and the job is "do this every morning," start with a desktop scheduled task. It is the least setup and the easiest to watch. Move to a routine the day you notice it failed because your machine was asleep.

## The limit every Claude Code schedule hides

The hard part of scheduling is not starting the run. It is everything around the run: the machine has to be reachable, the result has to reach you, and anything risky has to wait for your say-so. Raw cron solves the first problem and ignores the other two.

Walk it through. A desktop task fires at 8am, drafts the thing perfectly, and then the output sits in a session you are not looking at. A routine runs in the cloud and emails you, but it also charges its own tokens, separate from the Claude subscription you already pay for. And none of the three knows the difference between "summarize my week" and "send this to the client," so a schedule that can take a consequential action is a schedule you cannot fully walk away from. An agent that runs unattended on a bad instruction does not fail loudly. It produces confident, wrong output every Monday until someone notices.

This is the seam [implexa](/) sits in. It is a control plane for agents that run inside your own Claude or Codex, so the schedule fires on the subscription you already have rather than a metered cloud, the result lands somewhere you actually read, and a step that would send or publish something stops and waits for one tap of approval first. The scheduling primitive is the easy 20 percent. The delivery and the approval gate are the 80 percent that decide whether you trust the thing.

## How do you go from a scheduled prompt to an agent you trust?

Build the job as a skill, run it by hand until it is boring, and only then put it on a schedule. A schedule is a trigger, not a substitute for getting the instructions right.

The order matters. First, write the steps down once as a skill, the plain `SKILL.md` file Claude Code loads on demand; our [how to create a Claude skill](/blog/how-to-create-a-claude-skill) walkthrough covers that file end to end. Second, trigger it yourself two or three times and correct it where it drifts. Third, attach the cadence. Skipping straight to step three is how people end up with a confident, wrong report arriving on autopilot. If you are still deciding what the job even is, [how to build an AI agent with Claude](/blog/build-an-ai-agent-with-claude) is the better starting point, and [Claude Code skills](/blog/claude-code-skills) explains the file the schedule will actually run.

## FAQ

### Does my computer need to be on for Claude Code scheduled tasks?

For desktop scheduled tasks, yes. The machine has to be awake and the app has to be open, or the run waits. Cloud routines are the exception: they run on Anthropic's infrastructure and fire whether or not your laptop is on.

### Can Claude Code run on a cron schedule?

Yes. The CLI scheduling tools accept a standard cron expression, so `0 8 * * 1` runs a prompt at 8am every Monday. The natural-language `/loop` command is a convenience layer that compiles down to the same cron underneath.

### What is the difference between /loop and a scheduled task?

`/loop` is session-scoped and disappears when you close the terminal, which makes it good for short monitoring. A scheduled task is persistent and survives restarts, so it is the right tool for recurring daily or weekly work.

### Is scheduling Claude Code free?

Desktop scheduled tasks and `/loop` run on the Claude subscription you already pay for, so there is no extra charge beyond your usage. Cloud routines run on Anthropic-managed infrastructure and meter their own tokens separately, which is the tradeoff for running while your machine is off.

### How do I get the result of a scheduled run if I am not watching?

Out of the box, the output stays in the session that ran it, so you have to go look. Delivering the result somewhere you read, and gating any risky step behind your approval, is the job of a control plane like implexa rather than the raw scheduler.
