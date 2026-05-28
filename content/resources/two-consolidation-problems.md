---
title: "the two consolidation problems in claude code"
slug: "two-consolidation-problems"
description: "the HN debate on claude code consolidation surfaced a real pain point. but it's actually two distinct problems wearing the same trenchcoat: where prompts live (architecture, which anthropic is solving) and how you find good ones (discovery, which they aren't). this is about the second one."
publishedAt: "2026-05-28"
tags: ["claude-code", "skills", "discovery", "consolidation", "SKILL.md", "ecosystem"]
---

# the two consolidation problems in claude code

a post hit the front page of HN this week titled "claude code as a daily driver: claude.md, skills, subagents, plugins, and mcps". 415 points, 246 comments at last check. it's a good walkthrough. but the conversation underneath it is doing more than rating the tutorial; it's surfacing a structural problem the claude code ecosystem has been quietly accumulating for the last twelve months.

the comment that crystallized it, from [`mil22`](https://news.ycombinator.com/item?id=48289950), 23 hours ago:

> We really need some consolidation around commands, skills, subagents, and plugins. For example, if you want to, say, review code, you have five options now:
>
> - Write a .claude/commands/review.md. Simple but deprecated.
> - Use a /code-review skill, either one you install or one you just write yourself (it's just Markdown, after all).
> - Use the /pr-review subagent. Also just Markdown, but it runs "in the background" and "in parallel", so it must be better, I guess.
> - Install the /code-review plugin. This just installs the skills and subagents above.
> - Simply ask Claude to review the code.
>
> They are all just variations of "insert a canned prompt", varying only along the dimensions of (a) how and where the prompt is installed and from where it is sourced, and (b) which context or contexts the prompt runs in. There's not much advice here about which option is best, and no clear best practices seem to have emerged yet either.

and then `bcherny` (boris cherny, anthropic, claude code team) replied:

> Hey, Boris from the CC team here. I agree, we're working on consolidating these. Going forward it will just be the built-in /code-review skill.

mil22 is right that there's a problem. bcherny is right that anthropic is going to fix it. but the comment is actually two distinct problems wearing the same trenchcoat, and only one of them is in anthropic's scope. the half that bcherny is solving is the easier half. the half nobody's really addressing gets worse, not better, as the first one gets fixed.

## problem A: where the prompt lives

this is the one mil22 frames cleanly. there are too many places to put a canned prompt. each surface (commands, skills, subagents, plugins) was added at a different point in claude code's evolution, and they overlap in scope. you can't tell whether to write a slash command or a skill for the same job. the runtime ergonomics differ, but the user value is roughly identical. five doors, one room.

this is an architecture problem, and architecture problems are tractable. bcherny's reply settles the direction: skills become the canonical unit, the rest collapse into it. that's the right call. within a few releases the noise fades. you write a SKILL.md, drop it in your repo or `~/.claude/skills/`, and that's the whole story.

prediction: within 6-12 months, problem A is a non-issue for anyone starting fresh in claude code. legacy `.claude/commands/` content keeps working, plugins get absorbed into skill bundles, the mental model simplifies to "skills, full stop." anthropic is well positioned to solve this because they own the runtime. they just have to ship the consolidation.

## problem B: how you find a good one

this is the half of mil22's comment that's framed like an architecture issue but isn't.

> there's not much advice here about which option is best, and no clear best practices seem to have emerged yet either.

even after problem A is solved, even when the only file format on disk is SKILL.md, you still don't know which skill to use. say you want to review code tomorrow. anthropic ships its built-in /code-review skill. fine. you've also got:

- the [anthropic skills repo](https://github.com/anthropics/skills) with several review-flavored entries (browse them at [/u/anthropics](/u/anthropics))
- claudelog.com, with a hand-curated review example
- claudemarketplaces.com, listing more than a dozen plugins that include some flavor of review skill
- a fistful of `awesome-claude-code` repos on github, each with its own "review" entry
- smithery, clawhub, skills.sh, each indexing their own
- whatever's already sitting in your `~/.claude/skills/`, half of which you forgot you installed

the architecture is clean now. one concept: skill. and yet there are forty of them with the word "review" in the name, and none of them tells you which is best. you can't tell from filename. you can't tell from frontmatter. you can't tell from stars without conflating "first to ship" with "best authored".

this is a discovery problem. and it gets worse as problem A gets better.

## why solving A makes B harder

the easier it is to author a skill, the more skills exist. that's been the dynamic for every consolidation moment in software. wordpress made publishing easier, then content discovery became the bottleneck. npm made package authoring trivial, then trust and quality across 2.5M packages became the work. SKILL.md is now nearly boilerplate-free; you can write one in five minutes; the resulting catalog is going to grow fast.

the cross-vendor index implexa runs already counts 40,000+ SKILL.md files across the public sources. that's after eighteen months of the format existing. if anthropic ships the consolidation bcherny described and skill authoring becomes the canonical pattern, that number roughly doubles by year end. multiply across runtimes (codex, cursor, gemini, the long tail) and the skill ecosystem in 2027 is a thousand times the size of the 30 skills anthropic shipped in their original release.

flat lists don't scale to that. and the existing discovery solutions are all flat lists.

## what discovery looks like today

honest inventory of what's available right now:

- **awesome-claude-code** on github. curated by humans, no quality signal, no install path. you read the readme, copy-paste a snippet, hope it works.
- **claudelog.com**. nice editorial, hand-picked examples. depth on a few, no breadth.
- **claudemarketplaces.com**. plugin index, sorted mostly by recency. tells you what exists, not what's good.
- **github search** for `language:markdown filename:SKILL.md`. raw firehose. ranked by github's repo signals, which weren't designed for matching skills to your task.

all of these are bookmarks. they help you browse. none of them rank by quality. none span vendors. none let you try a skill before committing to install. and the closest thing to a quality signal is github stars, which we know is a vanity metric: stars accumulate to whoever was first in a category, not whoever wrote the best skill.

if you're a claude code daily driver who has installed and uninstalled a few plugins this month (which is most people reading this), you've already lived this. you grab five "review" skills, run two, they trip over your repo's quirks, you uninstall everything and go back to a hand-rolled prompt. the architecture cleanup doesn't fix that loop.

## what real discovery requires

the ask isn't a better awesome-list. it's a stack that handles five things at once:

**cross-vendor index.** every source unified into one searchable surface. it should not matter to you whether the best review skill was published in anthropic's repo, smithery, clawhub, or some random github gist. the index has to ignore origin and rank on fit.

**multi-signal ranking.** not stars. stars are pre-trial popularity, not post-trial quality. real ranking combines structural quality (does the SKILL.md follow a coherent rubric?), semantic match (does it actually fit the user's intent, not just keyword-match the title?), tool-stack overlap (does it use tools the user already has installed?), and outcome signal (do real applies produce shipped work?). that's the thinking behind something like [SkillRank](/resources/skill-rank).

**intent matching.** semantic, not keyword. "i want to review a PR for security regressions" should not surface the same three results as "review a junior dev's first commit for style." embeddings over full-text.

**inline run.** install-and-restart is friction that filters out the long tail. if you have to install a candidate to evaluate it, you'll evaluate maybe two before bailing. if you can pull the SKILL.md body into the current session and try it on the spot, you'll evaluate ten. the marketplace's job is to make trying easy.

**outcome attribution.** skills that move work forward should rank higher next month than skills that mostly get clicked and abandoned. that requires watching real work happen (with the right privacy framework), not just counting installs.

none of these is trivial. all of them are needed.

## the open-standard problem

here's why this is genuinely hard. SKILL.md frontmatter doesn't include quality metadata, and you can't trust author self-report. every skill description claims it's great. ranking has to come from observation: who ran this, did the procedure complete, did the user keep it, did the resulting work ship.

that observation requires infrastructure that sits next to claude code while the user works. which raises the privacy bar immediately: you can't justify watching every prompt unless you have a discard model that throws away everything that doesn't match a candidate skill. (the implexa stack does this server-side. the relevant function is fifteen lines, and the architectural call is to discard at the point of decision rather than log first and decide later.)

it also requires cross-vendor reach. an anthropic-only ranker can't honestly rank skills published on smithery or clawhub; a smithery-native ranker can't honestly rank anthropic's. you need a neutral indexer that pulls from every source. that's a substrate role, not a product role.

## one paragraph on implexa, then back to the argument

since i'm writing this and someone will ask: implexa is one attempt at problem B specifically. cross-vendor index of 40,000+ skills, four-signal ranking via [SkillRank](/resources/skill-rank), one plugin, inline run without install. proof of what's indexed and how it ranks is at [/scores](/scores). there are other reasonable shapes for solving discovery, and i'd be genuinely surprised if ours is the only one that exists in twelve months. the point of this post isn't the pitch; it's that the problem is real, distinct from the architecture consolidation, and underclaimed by the existing tooling.

## closing thought

bcherny's reply is going to get clipped and screenshotted across twitter for the next month, and rightly so. "going forward it will just be the built-in /code-review skill" is a clean answer to a messy question, and the work to unify the surfaces is exactly what anthropic should be doing. (anthropic's own [plugin docs](https://docs.claude.com/en/docs/claude-code/plugins) already nudge in this direction.)

but the skill ecosystem is heading into a phase where the file format is settled, the runtime is settled, and the bottleneck moves up one layer. the question stops being "what file goes where" and starts being "which of the forty skills with this name is the one i actually want, and how do i know without trying all of them."

claude code consolidation is the headline anthropic is shipping. the discovery problem is the headline a year from now. it's the less glamorous half of mil22's comment, but it's the half that determines whether the SKILL.md ecosystem matures into something developers compound on, or stays a flea market everyone abandons after their third install.

the better the architecture gets, the more the discovery problem dominates the user experience. that's the part of consolidation that nobody owns yet.

---

*the original HN thread is [here](https://news.ycombinator.com/item?id=48289950); the post being discussed is [here](https://arps18.github.io/posts/claude-code-mastery/). both are worth reading end-to-end, even if the meta-debate in the comments is where the most interesting argument actually lives.*
