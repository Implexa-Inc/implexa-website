---
title: "How Many Claude Skills Is Too Many? The Real Answer"
slug: "how-many-claude-skills-is-too-many"
description: "How many Claude skills is too many? It's a context-budget problem, not a number. Here's the real cap, why skills stop triggering, and how to fix it for good."
publishedAt: "2026-06-02"
tags: ["claude-skills", "skill-budget", "skill-sprawl", "SKILL.md", "claude-code"]
---

# How many Claude skills is too many?

You installed a dozen useful skills, then a dozen more. Now Claude Code takes longer to start, half your skills stop triggering when you obviously need them, and you have no idea which ones are even loaded. So the question hits: how many Claude skills is too many?

The honest answer is that "too many" is not a number you cross. It's a budget you blow. This piece gives you the rough cap, explains why your skills quietly stop working before you hit it, and shows the fix that actually scales past 20 skills instead of fighting the same battle every two weeks.

## How many Claude skills is too many?

The practical ceiling is roughly 15 to 25 skills on a 200k-token model and about 75 to 125 on a 1m-token model, but that number is the symptom, not the rule. Claude Code reserves only a small slice of the context window, around 1% by default, to list every installed skill's name and description in the system prompt at startup. Once your skill descriptions exceed that slice, the lowest-priority ones get dropped from the list. With typical descriptions near 260 characters, only about 40 skills fit before truncation starts. So "too many" is whatever overflows your listing budget, and that depends entirely on how long your descriptions are, not how many skills you own.

## Why "too many" is a budget problem, not a count

The right mental model is that skill descriptions compete for system-prompt space, and counting skills hides that. Skills use progressive disclosure: at startup Claude loads only each skill's name and description, then reads the full SKILL.md body on demand when a task matches. That design is what lets you keep many skills cheaply. The catch is that the descriptions still have to live in the system prompt so Claude knows the skill exists at all. If it can't see the description, it cannot invoke the skill, even if the skill is perfectly written and sitting right there on disk. For the mechanics of what goes in that file, see [what are Claude skills](/blog/what-are-claude-skills).

So two builders with the same 30 skills can have completely different experiences. The one with tight 130-character descriptions stays well under budget. The one with 900-character descriptions blows past it and loses skills silently. A 130-character description does the same triggering job as a 900-character one at a fraction of the cost.

## The symptoms you are actually feeling

If skills stop triggering, start slow, or vanish from the list, you have hit the budget, not a bug. The three tells:

- Triggering becomes a coin flip. Claude picks the wrong skill or no skill on requests that clearly match, because the description it needed got dropped or buried among too many options.
- Startup drags. Twenty-five skills with 900-character descriptions is over 20,000 characters Claude processes before it does anything useful.
- Skills go missing quietly. There is no loud error. The lowest-priority descriptions just stop appearing in the listing, and the skills still work only if you invoke them by name.

More options also means more chances for Claude to reason wrong. Every extra skill is one more candidate it has to weigh before acting, so past a point you are paying in both budget and decision quality.

## The local fixes, and where they run out

The standard advice helps and you should do it, but it caps out fast. In priority order:

1. Run `/skills` and disable anything you have not invoked in 90 days. Free, no session cost.
2. Trim descriptions to 100 to 150 characters with the trigger keywords up front. This is the highest-leverage move, because the budget is spent on description length, not skill count. If your description uses "and" more than once, the skill probably wants splitting.
3. Raise the listing budget in settings (`skillListingBudgetFraction`) or via `SLASH_COMMAND_TOOL_CHAR_BUDGET`. This works but costs real tokens on every call, so it only makes sense on 1m-context models or usage-based billing.

Here is where it breaks down. Pruning and trimming treat the symptom. If you genuinely use 60 skills across different projects, no amount of description-trimming gets you there cleanly, and "disable what you don't use" fails the moment you need that disabled skill next Tuesday. You end up re-auditing every two weeks, which is its own kind of tax. This is the deeper version of the [two consolidation problems](/resources/two-consolidation-problems) every Claude Code user eventually runs into: where prompts live, and how you find the good ones.

## The real fix: stop installing skills you only use sometimes

The durable answer is to stop treating "install" as the only way to use a skill. Most of your skill budget is spent on skills you reach for occasionally. Those do not need a permanent slot in your system prompt. They need to be findable the moment you want them, and applied on demand without leaving a description sitting in context for the other 29 days of the month.

That flips the question. Instead of "how many skills can I install before it breaks," you ask "which handful do I use every day, and how do I pull the rest in only when a task calls for it." The daily drivers stay installed. Everything else lives in a searchable index you query in the moment and apply inline, no install, no permanent budget cost. Your listing budget stops being a scarce resource you ration and starts being a small, stable set you actually curated.

This is exactly the model [implexa](/) is built on: one ranked index across the major skill sources, searched from inside Claude Code, applied inline. You keep your system prompt lean and still reach 22,000+ skills when you need them.

## Which skills earn a permanent slot

Decide by frequency and quality, not by whether the skill looked cool the day you found it. A skill earns a permanent install if you invoke it weekly or more and it reliably does its job. Everything else is a candidate for on-demand use.

Quality matters as much as frequency, because a vague or bloated skill wastes budget twice: once on its long description, and again when it triggers at the wrong time. This is why ranking exists. [SkillRank](/resources/skill-rank) scores skills on relevance and quality so the good ones surface first and the noise stays out of your budget. When you can rank skills, "which 15 deserve a slot" stops being a guess. For the bigger picture of how skills relate, compose, and get measured, see [what is a skill graph](/resources/what-is-a-skill-graph).

## Cross-vendor sprawl makes the budget worse

The budget problem is no longer contained to one tool, which is why local pruning feels like it never ends. Skills now live across Anthropic, Cursor, Continue, Smithery, GitHub, and more, each with its own format and its own directory. Builders pull skills from several of these, and the descriptions all land in the same finite listing budget. Counting skills "in Claude Code" misses half the sprawl, because the next skill you install came from somewhere else entirely.

A cross-vendor index fixes the discovery half of this. Instead of installing one skill from each vendor just to have it on hand, you search every source at once and apply the right one inline. The budget you protect is the same whether the skill came from Anthropic or a GitHub gist, so the answer has to be cross-vendor too.

## FAQ

### What is the maximum number of Claude skills you can install?

There is no hard maximum on installed skills. The real limit is the listing budget: roughly 15 to 25 skills on a 200k model and 75 to 125 on a 1m model at default settings, assuming average-length descriptions. Shorter descriptions raise that number, longer ones lower it.

### Do unused Claude skills slow things down or cost tokens?

Yes, if they are installed. Every installed skill's name and description sit in the system prompt at startup and count against your context budget on every request, even skills you never invoke. The full skill body only loads on demand, but the description cost is always there. This is why disabling or not installing rarely-used skills helps.

### Why do my Claude skills stop triggering when I clearly need them?

Usually because the description got dropped or because Claude has too many similar options to choose from. Once your skills exceed the listing budget, the lowest-priority descriptions are removed from the system prompt, so Claude no longer knows those skills exist. Tightening descriptions and reducing the installed set restores reliable triggering.

### How do I see which skills are actually loaded?

Run `/skills` inside Claude Code. It lists installed skills and lets you disable the ones you are not using, which is the fastest free way to reclaim listing budget.

### What is SLASH_COMMAND_TOOL_CHAR_BUDGET?

It is an environment variable that raises the character budget for skill and command descriptions in the system prompt. Bumping it gives more headroom, but it adds tokens to every call, so prefer trimming descriptions and reducing installs first, and only raise the budget on large-context models or usage-based plans.

## Bottom line

How many Claude skills is too many? The moment your descriptions overflow the listing budget, which is usually well before you feel like you have "a lot." Prune and trim to buy headroom, but the fix that lasts is to install only your daily drivers and pull the rest from a ranked, cross-vendor index on demand. That way the answer to "too many" stops being a number you fear and becomes a small set you chose.
