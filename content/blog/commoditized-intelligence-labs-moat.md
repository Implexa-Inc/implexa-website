---
title: "Commoditized intelligence is the labs' moat, not their problem"
slug: "commoditized-intelligence-labs-moat"
description: "The consensus says cheap tokens kill the frontier labs. I think the opposite: commoditized intelligence is the weapon Claude Code and Codex use to win."
publishedAt: "2026-06-03"
tags: ["ai-strategy", "frontier-models", "claude-code", "codex"]
---

The frontier labs are supposedly in trouble. You have heard the case: tokens get cheaper every quarter, open models keep closing the gap, so the labs lose pricing power and the money moves up the stack to whoever sits closest to the user. The wrappers. The routers. OpenRouter, which will happily send your request to whatever model is cheapest today. I hear this from people who are usually right about things, and I think they have it backwards.

Cheap intelligence is the best thing that has happened to OpenAI and Anthropic.

Here is the part the commoditization story skips. When intelligence gets cheap, the binding constraint stops being "can you build it" and becomes "can you afford to give it away." Almost nobody can. The labs can. Anthropic and OpenAI both sell a flat $200-a-month plan with basically unlimited usage, and underneath it they run the big model when your task actually needs it and quietly drop to a smaller model they also own when it does not. They lose money on the heavy users on purpose, because what they are buying is the surface, the place the work happens. OpenRouter cannot do that. It pays retail for tokens and marks them up. You cannot run a market at a loss when you do not own the thing being sold.

So the cheaper-is-better crowd is cheering the exact mechanism that prices them out of their own layer.

Run down the middle and it is grim. The wrapper economy is selling a margin the labs are deliberately taking to zero. "Open models will win" does not rescue anyone here, and if anything it speeds this up, because the lower the floor drops the more the labs make by routing down to it and keeping the customer relationship. Cursor is the one that bugs me, because it is a genuinely good product and I use it, and it is sitting in the precise spot where Anthropic ships Claude Code and OpenAI ships Codex bundled with a model you already pay for. Being the paid app when the platform owner ships your whole category as a feature is not a fun place to be.

The smarter version of the optimism comes from [a16z](https://www.a16z.news/p/from-system-of-record-to-system-of). Their framing is the shift from "system of record" to "system of intelligence": the database stops being the moat, the reasoning layer on top becomes the moat, and that layer is where the next big companies get built. I think the diagnosis is right and the investment thesis does not follow, because that reasoning layer is not an empty field. It is the labs' product roadmap. Memory, agents coordinating other agents, models grading their own output against outcomes, pattern extraction across runs. All shipping as features. Roughly: the "system of intelligence" you want to start a company around this quarter shows up in the patch notes next quarter.

Which leads somewhere uncomfortable. The system of intelligence is not a layer you build on top of the model. It is the model company. And the lock-in, once it lands, is going to make Salesforce look gentle. Picture the real sequence. You sign a seven-figure deal with a lab. Their engineers spend a few months wiring agents into the workflows your business actually runs on. A year later there is no tidy "swap the specialized layer underneath" move left for you to make. You do not tear out the system that now does the work.

The incumbents do not get killed. They get demoted. Salesforce, ServiceNow, Workday still have the things that make them sticky: the data, the compliance posture, a buyer in procurement who is not the person stuck using the tool. That keeps them alive for years. It does not keep them in front of you. The screen you open every morning stops being theirs. The database underneath still matters, but as an endpoint an agent reads and writes through while you never log in. Salesforce is already shipping MCP endpoints, which is a quiet way of agreeing to be the thing the agent calls instead of the thing you open. They go along with it because the alternative is worse for their own book. Every one of these companies is long the AI trade through chip spend, model partnerships, their own copilots. Fighting the consolidation means betting against a position they are all heavily into. Easier to ship a copilot, announce a win, and become plumbing on a delay.

Why does this land on two or three winners instead of a healthy crowd? It is not the iOS versus Android story, there is no hardware moat here. It is narrower. Only a couple of companies can do all three of the things that matter at the same time: train a model at the frontier, eat the cost of giving its output away to hold the surface, and sit on the stream of real work that trains the next model. A wrapper has none of those. The weights were never the moat, they leak. Being able to afford to give the weights' output away for free is the moat.

I should put my cards on the table, because this argument cuts against my own company. I build cross-vendor infrastructure, the neutral layer that lives between these platforms, so the world where lots of players win is the world that is good for me. I do not think that is the world we are getting. I think it is a few, and the one piece they will not own is the ground in between them. That is the bet I am making with my time, so read the rest knowing that.

If this is right, the next couple of years are boring to predict. The routers and wrappers get competed down to nothing. The open-model camp keeps topping benchmarks and keeps losing the customer. The big SaaS names quietly turn into read-write endpoints. Two or three lab-owned platforms end up running most of the digital knowledge-work economy. And the cheap intelligence everyone is celebrating is the thing that got us there.

Tell me where this is wrong.
