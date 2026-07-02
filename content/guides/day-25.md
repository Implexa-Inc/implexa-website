---
title: "Day 25 — Your AI Isn't Lying, It's Guessing: How to Stop Your Agent Making Things Up"
slug: "day-25"
description: "A giant firm just pulled an AI report after only five of its forty-five sources turned out to be real. Your own agent is doing a quieter version of the same thing — because it answers from a fuzzy memory of the internet instead of your real files. Here's the one plain-English rule (grounding / RAG) that stops most of it: point it at your real sources and let it say 'I don't know'. From the @ImplexaAI build-solo series."
publishedAt: "2026-07-01"
day: 25
reelHook: "grounding"
tags: ["day-25", "ai-agents", "rag", "grounding", "hallucination", "claude-code", "claude", "ai-automation", "solo-founder", "buildinpublic"]
---

# Day 25 — Your AI isn't lying, it's guessing: how to stop your agent making things up


A giant consulting firm just published a big report on AI. Someone actually checked the sources — and only five of the forty-five were real. The AI had made up the rest: fabricated titles, altered citations, references that pointed nowhere. A serious firm shipped it anyway, because the made-up sources *looked* exactly like real ones.

Your own agent is probably doing a quieter version of this to you right now. Here's why — and the one plain-English rule that stops most of it.

## Why agents make things up (it's not lying)

Lying needs intent. Your agent doesn't have any. Here's what's actually happening:

When you ask an agent a question, most of the time it isn't *reading* anything. It's answering from its training — a fuzzy, compressed memory of a big chunk of the internet from a couple of years ago. It's not looking at your prices, your notes, your real docs. It's reconstructing what the answer *probably sounds like*, token by token, and then delivering it with total confidence.

That confidence is the trap. A wrong answer and a right answer come out in the exact same self-assured voice. There's no wobble, no "I'm not sure." So you get an agent that **sounds exactly right and is quietly wrong** — it quotes a policy you never wrote, gives a number that was true for some other company, cites a source that doesn't exist.

In a demo, this is invisible — you ask the one thing you already know the answer to. On the fiftieth real task, on the questions you *can't* eyeball, it's just making things up.

## The name for the fix: grounding

The 2026 consensus fix has a plain shape: **stop letting the model answer from memory, and make it answer from a real source instead.** Anchor every answer to authoritative material you actually trust. The industry calls this *data grounding*, and the numbers are stark — grounded tasks can hallucinate under 1% of the time, while ungrounded queries on the same models run far higher (some categories up to ~88%). Agents relying on training data alone hallucinate roughly **35% more** on anything that needs current information.

"RAG" (retrieval-augmented generation) is the scary-sounding acronym for the simplest version of this: **retrieve the relevant real text first, then generate the answer from it.** Read first, then answer. That's the whole idea.

## The one rule that does most of the work

You do not need a vector database, embeddings, or a chunking pipeline to start. As a solo builder, you need one habit:

> **Point the agent at your real files, and tell it: answer from these — and if the answer isn't in here, say you don't know.**

Two halves, both essential:

1. **Give it the real source.** Put the actual stuff the agent needs — your pricing, your policies, your product notes, your FAQ, your site copy — into files it can read, and tell it to read them *before* it answers. Now it's quoting your reality, not a two-year-old guess about it.
2. **Give it permission to fail.** This is the part everyone skips. Explicitly tell it: *if the answer isn't in the provided material, say "I don't know" — do not guess.* Without that line, the model defaults to filling the gap with something plausible. With it, "I don't know" becomes an allowed, correct answer — and "I don't know" is infinitely safer than a confident fabrication.

That one rule kills *most* of the made-up answers. Not all — grounding reduces hallucination, it doesn't delete it — but it turns "confidently wrong on the questions you can't check" into "grounded in your real stuff, and honest when it isn't sure."

## How I actually do it

No pipeline. Two habits:

1. **The real stuff my agents need lives in plain files** — Markdown notes, docs, the actual source of truth — right next to the agent. I tell Claude to read those first, so the answer comes from my reality instead of its memory of the internet.
2. **"I don't know" is a legal answer.** I'd rather an agent tell me it can't find something than smoothly invent it. A bluff costs me way more than a blank.

It runs inside my own Claude, on my machine, reading my own files — so the grounding source is *mine*, not locked in someone else's service. Free.

## Try it today

1. Pick an agent that answers questions (support replies, a research helper, a "summarize my docs" bot).
2. Find the real source it *should* be using — your actual doc, notes, pricing, FAQ — and put it in a file the agent can read.
3. Add one line to its instructions: *"Answer only from the provided files. If the answer isn't there, say you don't know — do not guess."*
4. Ask it something that **isn't** in the files. If it now says "I don't know" instead of inventing an answer, grounding is working.
5. Ask it something that **is** in the files. Confirm it quotes your real material, not a generic guess.

Five minutes, no new tool, and your agent stops being a confident stranger and starts being one that reads.

## Gotchas

- **Grounding reduces hallucination — it doesn't eliminate it.** Even with real sources, models can misread or over-extend. It's a big cut, not a force field. Spot-check the important answers.
- **"I don't know" only works if you allow it.** If you don't explicitly permit it, the model fills the gap with something plausible. The permission line is doing real work — don't drop it.
- **Garbage source in, garbage answer out.** Grounding an agent in a stale or wrong file just makes it confidently repeat your stale, wrong file. Keep the source of truth actually true.
- **You don't need a vector database to start.** Plain files the agent reads first will take a solo builder a long way. Reach for embeddings/retrieval infrastructure only when the source is too big to hand it whole.
- **Confidence is not accuracy.** The tone never tells you if it's right. The *source* does. Judge answers by whether they trace back to your real material, not by how sure they sound.

## What tomorrow covers

Day 26 keeps going on building agents that actually hold up — another concrete, plain-English primitive taught the same Claude-Code-first way.

## The series so far

- **Day 15** — MCP: how agents plug into your tools
- **Day 16** — Skills: teaching an agent a repeatable job
- **Day 17** — migrations / upgrading safely
- **Day 18** — the safety check before you let an agent loose
- **Day 19** — scheduling: making an agent run on its own
- **Day 20** — the feedback loop: how your agent gets better every run
- **Day 21** — where your agent actually runs, and who's holding your passwords
- **Day 22** — one agent, one job: chain small agents instead of one giant one
- **Day 23** — give it the work, not the keys: the irreversible-action approval gate
- **Day 24** — trust the runs, not the demo: how to know your agent actually works
- **Day 25** — your AI isn't lying, it's guessing: ground it in your real files *(this one)*

## Resources

- [implexa.ai](https://implexa.ai) — build and run agents inside your own Claude or Codex, free
- [Data grounding: how to build trusted AI agent systems — Ability.ai](https://www.ability.ai/blog/data-grounding-trusted-ai-systems)
- [KPMG Pulls Agentic AI Report After Hallucination Claims (June 13, 2026) — nerova.ai](https://nerova.ai/troubleshooting-fixes/kpmg-pulls-agentic-ai-report-hallucinations-june-13-2026)
- The reel this guide is attached to: @ImplexaAI on Instagram
