---
title: "Day 17 — The Agent Did the Step I Forgot to Ask For"
slug: "day-17"
description: "The Day 17 moment from the @ImplexaAI build-solo series. I let an agent migrate a friend's site off a vibe-coding platform onto my own stack — and without being asked, it set up Google Search Console and submitted the sitemap. The boring SEO last mile everyone forgets. This is the line between a tool that does the task and an agent that owns the outcome — and the exact public agent that ran it."
publishedAt: "2026-06-17"
day: 17
reelHook: "outcome"
tags: ["day-17", "agents", "outcome", "seo", "search-console", "lovable", "replit", "vercel", "claude-code", "codex", "implexa", "solo-founder"]
---

# Day 17 — The Agent Did the Step I Forgot to Ask For (Implexa AI Guide)

*Part of "YOU building a $Bn company, solo." Day-N is an internal index — this one stands on its own.*

---

## TL;DR (the moves)

1. **Point a migration agent at a vibe-coded site** (Lovable/Replit) and give it the destination stack (Claude-owned Vercel + Supabase).
2. **Let it run mostly hands-off** — it only stops you at the risky bits (credentials, DNS).
3. **It rebuilds the app so AI search can actually read it** (AEO-ready), not just lifts-and-shifts it.
4. **It closes the boring last mile unprompted** — verifies the property in Google Search Console and submits the sitemap. The step almost everyone forgets, and the reason new sites don't show up on Google.
5. **You built the whole agent by prompting Claude Code or Codex** — and it runs inside your own Claude. This exact one is public; point it at your own site.

The whole job is ~15 steps and a full day by hand if you even know the playbook. Run hands-off: minutes of your attention.

---

## Why it matters

There's a real line being crossed right now: from agents that do **the task you asked** to agents that own **the whole outcome** — including the parts you'd have forgotten.

The task was "move my site." The outcome was "…and make sure Google can actually find it." Nobody typed "go set up Search Console." The agent did it because finishing the *outcome* of a site migration means the site is findable, and Search Console + sitemap is how that's true.

That's the difference between a tool and an agent: **the stuff it does that you forgot to ask for.**

Grounding (so this stays honest): a developer who knows the playbook could do every one of these steps. This was one clean run (a Vite/Lovable + Supabase stack). The defensible, repeatable wow isn't "no human could" — it's the **unprompted initiative** on the last mile, run end-to-end without hand-holding.

---

## The steps (what the agent actually ran)

1. **Read the source app** on the vibe-coding platform — components, data model, routes.
2. **Stand up the new stack** — a Claude-owned Vercel project + Supabase for data/auth.
3. **Port the code** and rewire it to the new backend.
4. **Rebuild for AEO** — server-render / prerender so AI search and crawlers can read the content (the part Lovable/Replit exports usually miss).
5. **Wire the domain** — DNS cutover (human-approval gate: you confirm the records).
6. **Credentials gate** — the agent pauses for anything sensitive instead of guessing.
7. **The unprompted move → Google Search Console**: verify the property, **submit the sitemap.** Not in the original ask. Done anyway.
8. **Hand back** a live, findable site.

---

## Gotchas

- **n=1.** Clean stacks migrate clean. A heavily-customized app will need more gate stops.
- **Don't skip the credential/DNS gates.** "Mostly hands-off" is not "walk away forever" — the agent stops you on purpose at the irreversible bits.
- **AEO ≠ a screenshot of your old site.** The value is the rebuild so machines can read it, not a pixel-perfect lift.
- **Search Console is the tell.** If a migration tool doesn't touch findability, it moved your site but left it invisible.

---

## How you get it

You don't write code to build this agent. **You prompt Claude Code or Codex**, and the agent runs inside your own Claude. This exact migration agent is **public** on Implexa — point it at your own Lovable or Replit site and run the same job.

→ Run this agent: [Graduate a Lovable/Replit app to a Claude-owned, AEO-ready Vercel stack](https://implexa.ai/workflows/graduate-a-lovable-replit-app-to-a-claude-owned-aeo-ready-ve)

---

## What tomorrow covers

Day 18 picks up from "the outcome is done" → keeping it healthy: letting an agent watch the live site and fix the small things before you notice them.

## The series so far

Days 1–6: ship a real full-stack app this week. Days 7–16: teach your agent one repeatable skill at a time (MCP, Skills, and friends). Day 17: agents that own the whole outcome. The throughline — you, solo, prompting your way to a company.

## Resources

- Implexa: build and run agents inside your own Claude or Codex — [implexa.ai](https://implexa.ai)
- [The public migration agent](https://implexa.ai/workflows/graduate-a-lovable-replit-app-to-a-claude-owned-aeo-ready-ve)
- Google Search Console — [search.google.com/search-console](https://search.google.com/search-console)
