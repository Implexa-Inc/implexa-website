---
title: "the two consolidation problems in claude code"
slug: "two-consolidation-problems"
description: "The HN debate on Claude Code consolidation surfaced a real pain point. But it's actually two distinct problems wearing the same trenchcoat: where prompts live (architecture, which Anthropic is solving) and how you find good ones (discovery, which they aren't). This is about the second one."
publishedAt: "2026-05-28"
tags: ["claude-code", "skills", "discovery", "consolidation", "SKILL.md", "ecosystem"]
---

# the two consolidation problems in claude code

A post hit the front page of HN this week titled "Claude Code as a Daily Driver: Claude.md, Skills, Subagents, Plugins, and MCPs". 415 points, 246 comments at last check. It's a good walkthrough. But the conversation underneath it is doing more than rating the tutorial; it's surfacing a structural problem the Claude Code ecosystem has been quietly accumulating for the last twelve months.

The comment that crystallized it, from [`mil22`](https://news.ycombinator.com/item?id=48289950), 23 hours ago:

> We really need some consolidation around commands, skills, subagents, and plugins. For example, if you want to, say, review code, you have five options now:
>
> - Write a .claude/commands/review.md. Simple but deprecated.
> - Use a /code-review skill, either one you install or one you just write yourself (it's just Markdown, after all).
> - Use the /pr-review subagent. Also just Markdown, but it runs "in the background" and "in parallel", so it must be better, I guess.
> - Install the /code-review plugin. This just installs the skills and subagents above.
> - Simply ask Claude to review the code.
>
> They are all just variations of "insert a canned prompt", varying only along the dimensions of (a) how and where the prompt is installed and from where it is sourced, and (b) which context or contexts the prompt runs in. There's not much advice here about which option is best, and no clear best practices seem to have emerged yet either.

And then `bcherny` (Boris Cherny, Anthropic, Claude Code team) replied:

> Hey, Boris from the CC team here. I agree, we're working on consolidating these. Going forward it will just be the built-in /code-review skill.

mil22 is right that there's a problem. bcherny is right that Anthropic is going to fix it. But the comment is actually two distinct problems wearing the same trenchcoat, and only one of them is in Anthropic's scope. The half that bcherny is solving is the easier half. The half nobody's really addressing gets worse, not better, as the first one gets fixed.

## problem A: where the prompt lives

This is the one mil22 frames cleanly. There are too many places to put a canned prompt. Each surface (commands, skills, subagents, plugins) was added at a different point in Claude Code's evolution, and they overlap in scope. You can't tell whether to write a slash command or a skill for the same job. The runtime ergonomics differ, but the user value is roughly identical. Five doors, one room.

This is an architecture problem, and architecture problems are tractable. bcherny's reply settles the direction: skills become the canonical unit, the rest collapse into it. That's the right call. Within a few releases the noise fades. You write a SKILL.md, drop it in your repo or `~/.claude/skills/`, and that's the whole story.

Prediction: within 6-12 months, problem A is a non-issue for anyone starting fresh in Claude Code. Legacy `.claude/commands/` content keeps working, plugins get absorbed into skill bundles, the mental model simplifies to "skills, full stop." Anthropic is well positioned to solve this because they own the runtime. They just have to ship the consolidation.

## problem B: how you find a good one

This is the half of mil22's comment that's framed like an architecture issue but isn't.

> there's not much advice here about which option is best, and no clear best practices seem to have emerged yet either.

Even after problem A is solved, even when the only file format on disk is SKILL.md, you still don't know which skill to use. Say you want to review code tomorrow. Anthropic ships its built-in /code-review skill. Fine. You've also got:

- The [Anthropic skills repo](https://github.com/anthropics/skills) with several review-flavored entries (browse them at [/u/anthropics](/u/anthropics))
- claudelog.com, with a hand-curated review example
- claudemarketplaces.com, listing more than a dozen plugins that include some flavor of review skill
- A fistful of `awesome-claude-code` repos on GitHub, each with its own "review" entry
- Smithery, ClawHub, skills.sh, each indexing their own
- Whatever's already sitting in your `~/.claude/skills/`, half of which you forgot you installed

The architecture is clean now. One concept: skill. And yet there are forty of them with the word "review" in the name, and none of them tells you which is best. You can't tell from filename. You can't tell from frontmatter. You can't tell from stars without conflating "first to ship" with "best authored".

This is a discovery problem. And it gets worse as problem A gets better.

## why solving A makes B harder

The easier it is to author a skill, the more skills exist. That's been the dynamic for every consolidation moment in software. WordPress made publishing easier, then content discovery became the bottleneck. npm made package authoring trivial, then trust and quality across 2.5M packages became the work. SKILL.md is now nearly boilerplate-free; you can write one in five minutes; the resulting catalog is going to grow fast.

The cross-vendor index implexa runs already counts 40,000+ SKILL.md files across the public sources. That's after eighteen months of the format existing. If Anthropic ships the consolidation bcherny described and skill authoring becomes the canonical pattern, that number roughly doubles by year end. Multiply across runtimes (Codex, Cursor, Gemini, the long tail) and the skill ecosystem in 2027 is a thousand times the size of the 30 skills Anthropic shipped in their original release.

Flat lists don't scale to that. And the existing discovery solutions are all flat lists.

## what discovery looks like today

Honest inventory of what's available right now:

- **awesome-claude-code** on GitHub. Curated by humans, no quality signal, no install path. You read the readme, copy-paste a snippet, hope it works.
- **claudelog.com**. Nice editorial, hand-picked examples. Depth on a few, no breadth.
- **claudemarketplaces.com**. Plugin index, sorted mostly by recency. Tells you what exists, not what's good.
- **GitHub search** for `language:markdown filename:SKILL.md`. Raw firehose. Ranked by GitHub's repo signals, which weren't designed for matching skills to your task.

All of these are bookmarks. They help you browse. None of them rank by quality. None span vendors. None let you try a skill before committing to install. And the closest thing to a quality signal is GitHub stars, which we know is a vanity metric: stars accumulate to whoever was first in a category, not whoever wrote the best skill.

If you're a Claude Code daily driver who has installed and uninstalled a few plugins this month (which is most people reading this), you've already lived this. You grab five "review" skills, run two, they trip over your repo's quirks, you uninstall everything and go back to a hand-rolled prompt. The architecture cleanup doesn't fix that loop.

## what real discovery requires

The ask isn't a better awesome-list. It's a stack that handles five things at once:

**Cross-vendor index.** Every source unified into one searchable surface. It should not matter to you whether the best review skill was published in Anthropic's repo, Smithery, ClawHub, or some random GitHub gist. The index has to ignore origin and rank on fit.

**Multi-signal ranking.** Not stars. Stars are pre-trial popularity, not post-trial quality. Real ranking combines structural quality (does the SKILL.md follow a coherent rubric?), semantic match (does it actually fit the user's intent, not just keyword-match the title?), tool-stack overlap (does it use tools the user already has installed?), and outcome signal (do real applies produce shipped work?). That's the thinking behind something like [SkillRank](/resources/skill-rank).

**Intent matching.** Semantic, not keyword. "I want to review a PR for security regressions" should not surface the same three results as "review a junior dev's first commit for style." Embeddings over full-text.

**Inline run.** Install-and-restart is friction that filters out the long tail. If you have to install a candidate to evaluate it, you'll evaluate maybe two before bailing. If you can pull the SKILL.md body into the current session and try it on the spot, you'll evaluate ten. The marketplace's job is to make trying easy.

**Outcome attribution.** Skills that move work forward should rank higher next month than skills that mostly get clicked and abandoned. That requires watching real work happen (with the right privacy framework), not just counting installs.

None of these is trivial. All of them are needed.

## the open-standard problem

Here's why this is genuinely hard. SKILL.md frontmatter doesn't include quality metadata, and you can't trust author self-report. Every skill description claims it's great. Ranking has to come from observation: who ran this, did the procedure complete, did the user keep it, did the resulting work ship.

That observation requires infrastructure that sits next to Claude Code while the user works. Which raises the privacy bar immediately: you can't justify watching every prompt unless you have a discard model that throws away everything that doesn't match a candidate skill. (The implexa stack does this server-side. The relevant function is fifteen lines, and the architectural call is to discard at the point of decision rather than log first and decide later.)

It also requires cross-vendor reach. An Anthropic-only ranker can't honestly rank skills published on Smithery or ClawHub; a Smithery-native ranker can't honestly rank Anthropic's. You need a neutral indexer that pulls from every source. That's a substrate role, not a product role.

## one paragraph on implexa, then back to the argument

Since I'm writing this and someone will ask: implexa is one attempt at problem B specifically. Cross-vendor index of 40,000+ skills, four-signal ranking via [SkillRank](/resources/skill-rank), one plugin, inline run without install. Proof of what's indexed and how it ranks is at [/scores](/scores). There are other reasonable shapes for solving discovery, and I'd be genuinely surprised if ours is the only one that exists in twelve months. The point of this post isn't the pitch; it's that the problem is real, distinct from the architecture consolidation, and underclaimed by the existing tooling.

## closing thought

bcherny's reply is going to get clipped and screenshotted across Twitter for the next month, and rightly so. "Going forward it will just be the built-in /code-review skill" is a clean answer to a messy question, and the work to unify the surfaces is exactly what Anthropic should be doing. (Anthropic's own [plugin docs](https://docs.claude.com/en/docs/claude-code/plugins) already nudge in this direction.)

But the skill ecosystem is heading into a phase where the file format is settled, the runtime is settled, and the bottleneck moves up one layer. The question stops being "what file goes where" and starts being "which of the forty skills with this name is the one I actually want, and how do I know without trying all of them."

Claude Code consolidation is the headline Anthropic is shipping. The discovery problem is the headline a year from now. It's the less glamorous half of mil22's comment, but it's the half that determines whether the SKILL.md ecosystem matures into something developers compound on, or stays a flea market everyone abandons after their third install.

The better the architecture gets, the more the discovery problem dominates the user experience. That's the part of consolidation that nobody owns yet.

---

*The original HN thread is [here](https://news.ycombinator.com/item?id=48289950); the post being discussed is [here](https://arps18.github.io/posts/claude-code-mastery/). Both are worth reading end-to-end, even if the meta-debate in the comments is where the most interesting argument actually lives.*
