---
title: "The First Thing to Automate With AI"
slug: "day-8"
description: "You can hand a task to Claude and have it run on its own every morning while you sleep. The hard part is picking the right first one. A 3-test filter for choosing a first automation that wins, plus the one routine almost everyone should start with (a morning brief) and a copy-paste version to steal. From the @ImplexaAI build-solo series."
publishedAt: "2026-06-06"
day: 8
reelHook: "automate"
tags: ["day-8", "automate", "ai-agents", "routines", "claude", "claude-code", "automation", "solo-founder", "buildinpublic"]
---

# The First Thing to Automate With AI (Implexa AI Guide)

*A standalone guide from the @ImplexaAI build-solo series. No prior reading required — if you've heard "AI agents" and want to actually use one, start here.*

---

## TL;DR (the filter — run a candidate through all three)

1. **Boring, and on a clock** — you already do it every morning or every Monday, same time. Recurring is the whole point of a routine.
2. **Drafts, sorts, or summarizes — never the final send** — the agent does the prep, *you* press the button. You automate the work, not the decision.
3. **Writable as an intern checklist** — if you can't write the steps down, the agent can't follow them. No magic, just your process on autopilot.

**The best first routine for almost everyone: a morning brief.** Overnight it pulls what happened while you slept — signups, replies, the key numbers — and drafts your day. You wake up to a head start, not a blank page.

**The one line to remember:** *automate the prep, not the decision.*

---

## The thing nobody tells you

The hard part of automation isn't setting up the routine — the tools make that almost one-click now. The hard part is **picking the right first one.**

Almost everyone picks wrong. They automate the flashy thing — "draft my investor update," "decide which leads to chase," "write my launch tweet." Those all need *judgment*. The agent gets it subtly wrong, the output is off, and the person concludes "AI can't really do my job" and quietly stops. One bad first pick kills the habit before it starts.

Your first routine has exactly one job: **earn your trust.** It should be so boring and so low-stakes that the agent basically can't disappoint you — and so genuinely useful that you feel the time it gives back the very first morning. Get that win, and you'll happily build the next five. That's the whole game on Day 8: not "what's the most impressive thing I can automate," but "what's the first thing that will make me a believer."

---

## The 3-test filter (the real one)

Run any candidate task through these three. It has to pass all three to be a good *first* routine.

### Test 1 — Is it boring, and does it happen on a clock?

A routine runs on a schedule, so the task has to *be* schedule-shaped. Daily, weekly, same time, predictable trigger. "Every morning at 6, summarize overnight activity." "Every Monday at 8, compile last week's numbers."

If the task only happens once a quarter, skip it — the agent can't get repetitions in, you can't build trust through repetition, and you'll have forgotten how it even works by the time it fires. Recurring and boring is a *feature* here, not a compromise. The boring tasks are the ones eating your mornings anyway.

### Test 2 — Does it draft, sort, or summarize — and stop before the final send?

This is the most important test, and the one people skip. **The agent should do the prep work and hand you something to approve — never pull the trigger itself.**

- Good: *drafts* the follow-up emails. You read and send.
- Good: *sorts* incoming requests into buckets. You action them.
- Good: *summarizes* the overnight numbers. You decide what to do.
- Risky for a first routine: *sends* the emails. *Pays* the invoice. *Posts* the tweet. *Deletes* the rows.

Why this matters so much early: **your first routines will get things wrong.** That's normal — you're still learning to write the instructions, the agent is still learning your taste. If the worst case is "I got a slightly-off draft I had to fix," you lose two minutes. If the worst case is "it sent a slightly-off email to 400 people," you lose a lot more. Keep a human at the trigger until the routine has earned the right to pull it. *Automate the work, not the decision.*

### Test 3 — Could you hand it to a brand-new intern as a checklist?

Here's the honesty test. Open a notes file and try to write the task as numbered steps a smart 19-year-old on their first day could follow with no context. "1. Open the signups table. 2. Pull rows from the last 24 hours. 3. Group by source. 4. For each, draft a one-line welcome. 5. Put it all in a doc titled today's date."

If you can write that, the agent can run it — an AI routine is basically a very fast, very tireless intern who never forgets a step. If you *can't* write it down — if the real instruction is "use your judgment" or "you'll know it when you see it" — then the task isn't ready to automate yet, no matter how much you'd love to offload it. The checklist is the spec. No checklist, no routine.

---

## Why this order (the bigger shift)

Week 1 was about *building* things. Week 2 is about *delegating* them — and delegation has a learning curve that has nothing to do with code. The shift is from "I do the work" to "I design the work, an agent does it, and I check the result."

That shift only sticks if your first delegation succeeds. This is exactly how it works with people, too: you don't hand a new hire the most judgment-heavy, highest-stakes task on day one. You hand them something bounded and repeatable, watch them nail it, and *then* you trust them with more. Same with agents. The filter above is just "how to onboard your first AI teammate without setting them up to fail."

And the morning-brief pick is the canonical first hire because it touches every part of the loop safely: it runs on a clock (Test 1), it only summarizes and drafts (Test 2), and it's trivially writable as a checklist (Test 3). It's the "make me a believer" routine.

---

## Steal this: a copy-paste morning-brief routine

Here's a starting point. Set it up as a daily routine (Day 7 covered *how* to make it run reliably), point it at whatever data you actually have, and tune from there. Adjust the bracketed parts.

```
Every morning at 6:00am, prepare my daily brief.

1. Pull everything that happened in the last 24 hours from [your sources —
   e.g. new signups, support replies, Stripe payments, GitHub issues,
   calendar for today].
2. Summarize it in 5 bullets or fewer. Lead with anything unusual or
   urgent. Plain language, no fluff.
3. List today's calendar events with the one thing I need to prep for each.
4. Draft replies to anything that obviously needs one, but DO NOT SEND —
   leave them as drafts for me to review.
5. Put it all in a doc titled with today's date, newest day at the top.

Stop there. Do not send, post, pay, or delete anything. I'll review and
press the buttons.
```

Notice every line obeys the filter: it's scheduled, it only summarizes and drafts, the final step is an explicit "stop before the send," and the whole thing reads as a checklist an intern could run. That's not an accident — that's what a good first routine looks like.

---

## Common Day 8 gotchas (the real ones)

1. **Automating a decision instead of the prep.** "Decide which leads to chase" is a judgment call dressed up as a task. Automate "pull and rank the leads with the reasons," then *you* decide. Prep, not decision.

2. **Picking something too rare to trust.** A quarterly report feels high-value, so people reach for it first. But you can't build trust on four runs a year. Start with something daily and boring; graduate to the rare, high-value stuff once you trust the boring stuff.

3. **No "stop before the send" line.** If you don't explicitly tell the routine to stop at drafts, an eager agent may try to finish the job — send the email, post the update. Always include the hard stop until the routine has earned the trigger.

4. **A task you can't actually write down.** If your instructions devolve into "use good judgment," the routine will produce mush. That's a signal the task needs you, not an agent — at least for now.

5. **Skipping the "watch it run once" habit from Day 7.** A first routine you've never watched run end-to-end is a guess. Pick it with this filter, then run it once by hand before you trust the schedule. (Day 7 covered exactly how.)

6. **Forgetting it can silently not run.** Even a perfect first pick is worthless if it quietly fails to fire and you never notice. That's tomorrow's whole topic.

---

## Day-by-day series map

| day | topic |  |
|---|---|---|
| Day 5 | Deployment, the magic moment (custom domain + analytics) | done |
| Day 6 | Ship day: end-to-end, real users, real URL | done · Week 1 🎉 |
| Day 7 | Make your Claude routine actually run (run-once · bypass permissions · never sleep) | done |
| **Day 8** | What to automate first (the 3-test filter + a morning brief) | ← you are here |
| Day 9 | The one mistake that quietly breaks new routines (did it actually run?) | next |

---

## What Day 9 covers

You picked the right first routine and made it run reliably. There's still one quiet failure mode left: **a routine that silently doesn't run — and you never find out.** No error, no output, just a job that didn't fire while you assumed it did. Day 9 is how to know your routines actually ran, so a missed morning brief never turns into a missed week. Follow [@ImplexaAI](https://instagram.com/implexaai) so you don't miss it.

---

## Resources

- Claude Code: [claude.com/claude-code](https://claude.com/claude-code) — where you set up and run routines
- The whole series so far: [implexa.ai/guides](https://implexa.ai/guides) — Day 7 covered making a routine *run reliably*; this one is what to point it at.
- The filter in one line: **automate the prep, not the decision.** Screenshot it.
- DM me the one boring task you'd automate first on Instagram — tag [@ImplexaAI](https://instagram.com/implexaai). I read every one.

---

**Week 2 is about making AI run your business — one routine at a time:** follow [@ImplexaAI](https://instagram.com/implexaai), Day 9 drops at 9am PT.

[implexa.ai](https://implexa.ai)
