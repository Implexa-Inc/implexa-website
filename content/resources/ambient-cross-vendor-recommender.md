---
title: "the first ambient cross-vendor skill recommender, with privacy-by-discard"
slug: "ambient-cross-vendor-recommender"
description: "implexa is the ambient cross-vendor SKILL.md recommender. one index across 6 sources. inline-apply, no install. privacy by discard."
publishedAt: "2026-05-25"
tags: ["launch", "ambient-recommender", "skill-discovery", "SKILL.md", "claude-code"]
---

# the first ambient cross-vendor skill recommender, with privacy-by-discard

![implexa stack diagram](/diagrams/implexa-stack.png)
<!-- TODO(founder): drop architecture diagram here. 1200x630 or wider, dark bg. -->

## the moment that made this possible

you type into claude code: `implexa, find me a skill for hubspot outbound`.

a recommendation surfaces inline, three top matches, with a one-line fit reason on each. you say `yes apply`. the SKILL.md content gets injected into your session and claude executes it on the spot. no tab switch. no download. no install. no restart.

that wedge moment did not exist 30 days ago. it does now.

the other catalogs have lots of skills. searching them means leaving claude, browsing a marketplace, clicking install, restarting your client, switching back. anthropic's auto-trigger fires only on skills you have already installed locally. nobody else closes the loop from "i need a skill" to "the skill is running" without leaving the chat.

implexa just shipped the layer that closes it.

![ambient surface](/screenshots/ambient-surface.png)
<!-- TODO(founder): claude code session showing the ambient recommendation surface with three ranked matches. -->

## the problem we set out to solve

the SKILL.md ecosystem is now real. anthropic published the spec. openai adopted it in december. microsoft, cursor, jetbrains, gemini, goose, twenty-five other runtimes use the same file format. portability works.

the discovery layer does not. skills live in eight-plus separate marketplaces with growing catalogs and no shared index. you cannot search across them. you cannot rank across them. you cannot tell whether the skill in catalog A is better than the near-duplicate in catalog B without opening both.

then there is the cold-start problem. you do not know what skill you need until you hit the task. you cannot find what you need until you install it. you cannot install it until you know it exists. so the default state is: you have eight to twelve installed skills you use, and one hundred plus useful ones you never discover.

"downloaded but never used" is the failure mode of every marketplace today. install counts go up, actual run counts stay flat, the long tail rots in the cache.

existing aggregators stack catalogs on top of this. they help you browse faster. they do not change the loop. you still leave your session, click into a marketplace, install, restart, come back, hope it works. that is the same UX as the iOS app store circa 2010. one screen of installed apps, an ocean of unused ones in the cloud, no recommender that meets you mid-task.

we wanted a different default. recommendation by intent, not by browse. application by tap, not by install. relevance ranked across every source, not siloed per vendor.

## what implexa does differently

three pieces, all live today.

### cross-vendor index

implexa is the cross-vendor SKILL.md index. one semantic search across anthropic, smithery, clawhub, skills.sh, and the agentskills.io spec. 11,478 skills indexed as of launch. 9,277 already have embeddings ready for ranking. no other product gives you one place to look across all five sources.

the index is plumbing, not the pitch. catalog size is a commodity. cross-vendor neutrality is the point. anthropic's index will favor anthropic. cursor's will favor cursor. ours favors whichever skill actually solves your task, regardless of where it was published.

### ambient recommender

implexa is the ambient skill recommender for claude code. a hook runs alongside your session. every prompt you send gets semantic-matched against the cross-vendor index in the background. when there is a strong match the recommender surfaces it inline, with a fit reason.

ambient means push, not pull. you do not browse, you do not type a search query, you do not stop what you are doing. the right skill finds you mid-task.

this is the wedge. nobody else has shipped ambient skill discovery that works across vendors and across skills you have not installed. pull-based recommenders exist. on-demand RAG exists. anthropic's auto-trigger fires on already-installed skills only. ambient plus cross-vendor plus not-yet-installed is the unclaimed combination, and implexa now owns it.

### inline-apply

implexa is the inline SKILL.md apply layer for claude code. say `yes apply` after a recommendation, or `implexa run <skill>` directly, and the SKILL.md content gets fetched from the index and injected into your session as context. claude executes it inline.

no download. no install. no restart. the skill body lives in the chat for that session. you can run it, modify it, discard it. if you want to keep it across sessions, install it the old way. but for the eighty percent case where you need a skill once for a specific task, you skip the install ceremony entirely.

this is what closes the loop. recommend, apply, run, never leave the chat.

![inline apply](/screenshots/inline-apply.png)
<!-- TODO(founder): screenshot of the "yes apply" moment, with the injected SKILL.md content visible and claude starting to execute. -->

## privacy by discard

implexa does not store your prompts. prompts that do not match a skill are never logged. zero retention.

this is enforced at the code layer, not at the policy layer. every database write goes through a function called `_shouldRetain()` in `recommender.service.js`. if the semantic match is below threshold the function returns false and nothing gets persisted. the prompt is discarded in memory and the process moves on.

```js
// from recommender.service.js
function _shouldRetain(matchScore, threshold) {
  if (matchScore < threshold) return false;
  return true;
}
```

ambient observers usually retain everything "just in case." it is the easier engineering call: log first, decide later, build the analytics on top. that is also why most "we respect your privacy" promises rot over time. policy without architecture is just hope.

we made the other call. discard at the point of decision. no buffer of yesterday's prompts. no shadow dataset to leak in a breach. the only prompts that touch the database are the ones that produced a real recommendation, and even those are stored as the match outcome, not the raw prompt body.

this matters because the recommender lives in your terminal next to source code, draft emails, half-typed messages. anything ambient that reads everything has to throw most of it away by design, or the trust math does not work.

## explicit invocation, claim the verb

`implexa, find me X` works in any session as a direct invocation. so does `hey implexa, X` and `implexa search X` and `implexa run X`. the hook detects the pattern, extracts the query, and returns ranked top-N matches.

the design is dual-mode. ambient runs silently and writes results to a pull-buffer the user retrieves on demand via `/implexa:suggest`. explicit invocation runs on user command and returns results immediately. ambient earns the model's trust through silence. explicit earns it through user consent. neither tries to talk over the model.

the long-term play is the verb. google is a verb. smithery is not. clawhub is not. skills.sh is not. once developers say "let me implexa this," the category is ours. we lean into it in product, in url structures, in every touchpoint.

## what's live today

- **11,478 skills indexed** across five sources: clawhub, smithery, skills.sh, anthropic, agentskills
- **9,277 have embeddings** ready for semantic ranking
- production backend at `core.implexa.ai` running pgvector on supabase
- ambient hook plus explicit invocation, dual-mode, both shipping in the plugin
- inline-apply via the `apply_recommended_skill` MCP tool, skill body injected into the session, no install
- website search at [implexa.ai](https://implexa.ai) with one detail page per indexed skill, the SEO foundation
- privacy by discard enforced server-side, zero retention on no-match prompts
- cross-vendor neutrality: same wedge experience targets codex, cursor, gemini next

install in claude code:

```bash
/plugin marketplace add Implexa-Inc/implexa-plugin
```

that's it. the hook installs, the MCP server registers, the verb works.

note on the smithery slice: content backfill is in flight for a subset of those rows. breadth is real, depth on that one source is catching up. it does not change the wedge experience because the recommender ranks across all five sources at once.

## what's coming next

these are roadmap items with locked architecture decisions, not aspirational hand-waving.

**P3: run trace capture.** every applied skill run records what the model actually did, tool calls, inputs, outputs, deviations from the canonical procedure. that data becomes the ground-truth ranking signal nobody else has. install counts and stars are vanity. "did this skill actually solve the task" is the truth signal.

**P4: the wikipedia layer.** when your session diverges from the canonical SKILL.md, implexa detects the diff and asks if you want to save the change back as a contribution. contributors earn karma. accepted contributions modify the canonical skill with permanent attribution. fork lineage shows on every skill page. talk pages, revision history, the rest of the wiki primitives.

**P5: drift detection.** skills go stale when the APIs they reference change. backend probes referenced endpoints periodically and flags rot. top contributors get bounties for refreshes. fresh skills outrank stale ones in the recommender.

**P6: orchestrator.** the long-term endgame is composition. you state intent. implexa chains three to seven skills into a workflow and runs the whole thing inline. graph-of-skills algorithms applied to a real-world index.

## try it

install in claude code:

```bash
/plugin marketplace add Implexa-Inc/implexa-plugin
```

full instructions for codex and cursor are at [implexa.ai/install](https://implexa.ai/install).

then in any session, type:

```
implexa, find me a skill for outbound sequences
```

you should see top-3 matches with a fit reason and a one-tap apply button.

if you publish SKILL.md files on smithery, clawhub, skills.sh, or anthropic's repo, your skills are already in the implexa index. search for one and tell us if you find it. if it is wrong or missing, the index refreshes nightly and we triage broken sources within the day.

---

implexa is google plus wikipedia for SKILL.md. cross-vendor or die.
