---
title: "SkillRank: how implexa scores 22,000+ skills across vendors"
slug: "skill-rank"
description: "SkillRank is implexa's quality + relevance score for every AI skill in the cross-vendor graph. four signals, one number, ranked + searchable inside Claude Code and Codex."
publishedAt: "2026-05-27"
tags: ["skillrank", "ranking", "search", "skill-quality", "implexa"]
---

# SkillRank: how implexa scores 22,000+ skills

every skill in implexa's cross-vendor index gets a number between 0 and 10. that number, **SkillRank**, controls which skill bubbles to the top when you ask "implexa, find me a skill for cold outreach" — and which skills get demoted to page 12.

PageRank organized the web by ranking documents on inbound link signals. SkillRank does the same thing for AI skills, ranking them on signals that actually predict whether a skill produces good work.

## four signals, one number

SkillRank combines four feature classes:

### 1. structural quality (tier 1)

every indexed skill is graded against the six-component rubric the agentskills.io spec lays out:

- **intent**: does the skill clearly state what it does + when to use it?
- **inputs**: are the required inputs explicit + typed?
- **procedure**: is the step-by-step ordered + complete?
- **decision points**: does it handle the branches a real user hits?
- **output contract**: is the expected output shape defined?
- **outcome signal**: does it say when it's done + how to verify?

each component scores 1-10. the overall is the geometric mean (so a missing component drags the whole score down — you can't compensate for missing inputs with verbose procedure). a Haiku-class model does the grading; we run it on every indexed skill and re-run when content changes.

### 2. semantic match

when a user types "i need to draft a cold email to a prospect," SkillRank doesn't just look for "cold email" in the skill name. it computes the cosine similarity between an embedding of the user's intent and an embedding of each candidate skill's content. high-quality matches with 0.5+ similarity surface above weak matches at 0.7+ that happen to share keywords.

we embed via `text-embedding-3-small` and store the vectors in pgvector. similarity is computed at query time across all 22,000+ rows in under 80ms.

### 3. tool-stack overlap (in development)

a skill that uses tools the user already has installed (Slack MCP, HubSpot connector, your IDE's filesystem tools) is dramatically more likely to run successfully than one that requires fresh installs.

the plugin captures the user's available tool inventory at session start. SkillRank computes the overlap ratio between (skill's required tools) and (user's available tools). a skill that needs 3 tools you already have ranks above one that needs 5 tools you don't.

future versions will surface this explicitly: *"skill X uses 4 of 4 tools you have"* / *"skill Y uses 2 of 5 — install hint: HubSpot connector"*. usable-now beats hypothetically-useful.

### 4. outcome + feedback signals

every time a user applies a skill via `/implexa:run`, the system records the apply event. every time they hit `like` / `dislike` / `improve` on a result, SkillRank weights the skill accordingly.

aggregate signals:
- net rating (likes minus dislikes), weighted by unique-rater count to prevent brigading
- run-to-completion rate (how many applies finished the procedure vs. abandoned mid-flow)
- recency decay (a skill that was rated 8 months ago counts less than one rated last week)

## how the score is computed

```
SkillRank = w_quality * structural_quality
          + w_match   * semantic_similarity
          + w_tools   * tool_overlap_ratio
          + w_outcome * outcome_signal

(weights tunable per query context — explicit search vs. ambient
 recommendation, browse vs. apply intent)
```

the weights are configured per surface:

- **explicit search** (`implexa, find me X`): emphasizes semantic match + structural quality. user knows what they want.
- **ambient recommendation** (the silent UserPromptSubmit hook): emphasizes outcome signal + tool overlap. high precision, low false-positive rate.
- **leaderboard** (`/scores`): emphasizes structural quality + outcome signal only. shows the durable winners, not query-specific matches.

## what makes SkillRank different from existing ranking systems

most marketplaces (Smithery, ClawHub, etc.) rank by install count + age. that creates a feedback loop where the first skill in a category dominates forever because everyone installs the one at the top.

SkillRank breaks the loop because:

- **structural quality is content-derived, not popularity-derived.** a new skill with all six components present beats a 1-year-old skill missing two of them.
- **semantic match is query-specific.** the top-ranked skill for "cold email" is different from the top-ranked skill for "warm follow-up" even though they share keywords.
- **outcome signals require real human engagement, not just clicks.** liking a skill after running it is a much harder signal to game than starring a github repo.

## the privacy promise

SkillRank's outcome + feedback signals are aggregated across users — *no individual user's ratings are exposed*. the ambient recommender that produces some of those signals never logs prompts that don't match a skill. that's how Implexa's privacy-by-discard model maintains the signal stream without retaining sensitive workflow data.

## ranked + runnable

SkillRank scores are visible everywhere implexa surfaces skills:

- the [/scores leaderboard](/scores) ranks all 22,000+ indexed skills by SkillRank
- `/implexa:suggest` and `/implexa:run` show SkillRank-ordered matches inline in your Claude Code or Codex session
- every skill detail page (`implexa.ai/s/<source>/<slug>`) shows the SkillRank breakdown by component

we update SkillRank weekly on the full index. when feedback or content changes a skill's score significantly, the ranking surfaces it within ~24 hours.

---

**try it now.** type `implexa, find me a skill for <whatever you're working on>` inside Claude Code or Codex, and watch SkillRank surface the best fit across vendors. or browse the leaderboard at [/scores](/scores).

if you'd like the technical depth (the five-feature recommender details, the patent provisional we filed), email founder@implexa.ai. happy to share more.
