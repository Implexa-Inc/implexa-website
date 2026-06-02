---
title: "how many claude skills is too many? the real answer"
slug: "how-many-claude-skills-is-too-many"
description: "how many claude skills is too many? it's a context-budget problem, not a number. here's the real cap, why skills stop triggering, and how to fix it for good."
publishedAt: "2026-06-02"
tags: ["claude-skills", "skill-budget", "skill-sprawl", "SKILL.md", "claude-code"]
---

# how many claude skills is too many?

you installed a dozen useful skills, then a dozen more. now claude code takes longer to start, half your skills stop triggering when you obviously need them, and you have no idea which ones are even loaded. so the question hits: how many claude skills is too many?

the honest answer is that "too many" is not a number you cross. it's a budget you blow. this piece gives you the rough cap, explains why your skills quietly stop working before you hit it, and shows the fix that actually scales past 20 skills instead of fighting the same battle every two weeks.

## how many claude skills is too many?

the practical ceiling is roughly 15 to 25 skills on a 200k-token model and about 75 to 125 on a 1m-token model, but that number is the symptom, not the rule. claude code reserves only a small slice of the context window, around 1% by default, to list every installed skill's name and description in the system prompt at startup. once your skill descriptions exceed that slice, the lowest-priority ones get dropped from the list. with typical descriptions near 260 characters, only about 40 skills fit before truncation starts. so "too many" is whatever overflows your listing budget, and that depends entirely on how long your descriptions are, not how many skills you own.

## why "too many" is a budget problem, not a count

the right mental model is that skill descriptions compete for system-prompt space, and counting skills hides that. skills use progressive disclosure: at startup claude loads only each skill's name and description, then reads the full SKILL.md body on demand when a task matches. that design is what lets you keep many skills cheaply. the catch is that the descriptions still have to live in the system prompt so claude knows the skill exists at all. if it can't see the description, it cannot invoke the skill, even if the skill is perfectly written and sitting right there on disk. for the mechanics of what goes in that file, see [what are claude skills](/blog/what-are-claude-skills).

so two builders with the same 30 skills can have completely different experiences. the one with tight 130-character descriptions stays well under budget. the one with 900-character descriptions blows past it and loses skills silently. a 130-character description does the same triggering job as a 900-character one at a fraction of the cost.

## the symptoms you are actually feeling

if skills stop triggering, start slow, or vanish from the list, you have hit the budget, not a bug. the three tells:

- triggering becomes a coin flip. claude picks the wrong skill or no skill on requests that clearly match, because the description it needed got dropped or buried among too many options.
- startup drags. twenty-five skills with 900-character descriptions is over 20,000 characters claude processes before it does anything useful.
- skills go missing quietly. there is no loud error. the lowest-priority descriptions just stop appearing in the listing, and the skills still work only if you invoke them by name.

more options also means more chances for claude to reason wrong. every extra skill is one more candidate it has to weigh before acting, so past a point you are paying in both budget and decision quality.

## the local fixes, and where they run out

the standard advice helps and you should do it, but it caps out fast. in priority order:

1. run `/skills` and disable anything you have not invoked in 90 days. free, no session cost.
2. trim descriptions to 100 to 150 characters with the trigger keywords up front. this is the highest-leverage move, because the budget is spent on description length, not skill count. if your description uses "and" more than once, the skill probably wants splitting.
3. raise the listing budget in settings (`skillListingBudgetFraction`) or via `SLASH_COMMAND_TOOL_CHAR_BUDGET`. this works but costs real tokens on every call, so it only makes sense on 1m-context models or usage-based billing.

here is where it breaks down. pruning and trimming treat the symptom. if you genuinely use 60 skills across different projects, no amount of description-trimming gets you there cleanly, and "disable what you don't use" fails the moment you need that disabled skill next tuesday. you end up re-auditing every two weeks, which is its own kind of tax. this is the deeper version of the [two consolidation problems](/resources/two-consolidation-problems) every claude code user eventually runs into: where prompts live, and how you find the good ones.

## the real fix: stop installing skills you only use sometimes

the durable answer is to stop treating "install" as the only way to use a skill. most of your skill budget is spent on skills you reach for occasionally. those do not need a permanent slot in your system prompt. they need to be findable the moment you want them, and applied on demand without leaving a description sitting in context for the other 29 days of the month.

that flips the question. instead of "how many skills can i install before it breaks," you ask "which handful do i use every day, and how do i pull the rest in only when a task calls for it." the daily drivers stay installed. everything else lives in a searchable index you query in the moment and apply inline, no install, no permanent budget cost. your listing budget stops being a scarce resource you ration and starts being a small, stable set you actually curated.

this is exactly the model [implexa](/) is built on: one ranked index across the major skill sources, searched from inside claude code, applied inline. you keep your system prompt lean and still reach 22,000+ skills when you need them.

## which skills earn a permanent slot

decide by frequency and quality, not by whether the skill looked cool the day you found it. a skill earns a permanent install if you invoke it weekly or more and it reliably does its job. everything else is a candidate for on-demand use.

quality matters as much as frequency, because a vague or bloated skill wastes budget twice: once on its long description, and again when it triggers at the wrong time. this is why ranking exists. [skillrank](/resources/skill-rank) scores skills on relevance and quality so the good ones surface first and the noise stays out of your budget. when you can rank skills, "which 15 deserve a slot" stops being a guess. for the bigger picture of how skills relate, compose, and get measured, see [what is a skill graph](/blog/what-is-a-skill-graph).

## cross-vendor sprawl makes the budget worse

the budget problem is no longer contained to one tool, which is why local pruning feels like it never ends. skills now live across anthropic, cursor, continue, smithery, github, and more, each with its own format and its own directory. builders pull skills from several of these, and the descriptions all land in the same finite listing budget. counting skills "in claude code" misses half the sprawl, because the next skill you install came from somewhere else entirely.

a cross-vendor index fixes the discovery half of this. instead of installing one skill from each vendor just to have it on hand, you search every source at once and apply the right one inline. the budget you protect is the same whether the skill came from anthropic or a github gist, so the answer has to be cross-vendor too.

## faq

### what is the maximum number of claude skills you can install?

there is no hard maximum on installed skills. the real limit is the listing budget: roughly 15 to 25 skills on a 200k model and 75 to 125 on a 1m model at default settings, assuming average-length descriptions. shorter descriptions raise that number, longer ones lower it.

### do unused claude skills slow things down or cost tokens?

yes, if they are installed. every installed skill's name and description sit in the system prompt at startup and count against your context budget on every request, even skills you never invoke. the full skill body only loads on demand, but the description cost is always there. this is why disabling or not installing rarely-used skills helps.

### why do my claude skills stop triggering when i clearly need them?

usually because the description got dropped or because claude has too many similar options to choose from. once your skills exceed the listing budget, the lowest-priority descriptions are removed from the system prompt, so claude no longer knows those skills exist. tightening descriptions and reducing the installed set restores reliable triggering.

### how do i see which skills are actually loaded?

run `/skills` inside claude code. it lists installed skills and lets you disable the ones you are not using, which is the fastest free way to reclaim listing budget.

### what is SLASH_COMMAND_TOOL_CHAR_BUDGET?

it is an environment variable that raises the character budget for skill and command descriptions in the system prompt. bumping it gives more headroom, but it adds tokens to every call, so prefer trimming descriptions and reducing installs first, and only raise the budget on large-context models or usage-based plans.

## bottom line

how many claude skills is too many? the moment your descriptions overflow the listing budget, which is usually well before you feel like you have "a lot." prune and trim to buy headroom, but the fix that lasts is to install only your daily drivers and pull the rest from a ranked, cross-vendor index on demand. that way the answer to "too many" stops being a number you fear and becomes a small set you chose.
