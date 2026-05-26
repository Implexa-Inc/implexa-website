---
title: "how to create a claude skill (step-by-step)"
slug: "how-to-create-a-claude-skill"
description: "a 7-step walkthrough for creating your first Claude Skill, from install through recording, interview, activation, and sharing with your team."
publishedAt: "2026-05-18"
tags: ["claude-skills", "SKILL.md", "tutorial", "implexa"]
---

# how to create a claude skill (step-by-step)

this tutorial walks you through creating a working Claude Skill end to end: install, demonstrate, answer the interview, activate, run, and share. about 10 minutes of actual work.

by the end, you'll have a skill that triggers automatically when the matching task comes up, produces consistent output, and can be shared with your team via a single link.

> **new to skills?** read [what are claude skills?](/blog/what-are-claude-skills) first for the 5-minute version of the concept. then come back here for the build.

## what you'll need

- **Claude Code** installed (either CLI or Desktop). [Anthropic's install guide](https://docs.anthropic.com/) if you're starting from zero.
- a workflow you do repeatedly. anything 3 to 7 steps that touches one or more tools (CRM, docs, search, internal API). best candidates: things you've copy-pasted prompts for more than twice.
- about 10 minutes.

## step 1: install the implexa plugin

open a terminal and run:

```bash
curl -fsSL https://core.implexa.ai/install.sh | bash
```

the installer:

1. adds Implexa to your Claude Code plugin marketplace
2. installs the plugin into the cache
3. wires up the MCP server (the part that captures tool calls)
4. walks you through linking your install to your account

if you don't have an Implexa account yet, the script opens a browser tab to create one. free tier, no credit card.

restart Claude Code (`Cmd+Q` then relaunch on Mac) so the new plugin loads.

> **already have it installed?** re-run the script anyway if you're below v0.6.0. Claude Code's auto-update refreshes the marketplace but doesn't always repopulate the version cache. the script handles both fresh installs and upgrades.

## step 2: pick a workflow to demonstrate

the skill will only be as good as the workflow you demonstrate. pick something:

- **concrete.** "help me with sales" is too vague. "pull a prospect's recent LinkedIn activity, last touch in our CRM, and any news about their company in the last 30 days" is concrete.
- **repeatable.** if you do it once a month, it's probably not worth a skill. if you do it 3+ times a week, it is.
- **bounded.** skills work best with a clear start (input) and end (output). open-ended exploration is harder to capture.

examples that work well:

- sales call prep for a named account
- weekly stand-up update from this week's commits and tickets
- code review checklist for a PR
- investor pipeline weekly status
- new-hire onboarding research (their LinkedIn, recent role changes, top contacts)

## step 3: start the demonstration

in Claude Code, run:

```
/implexa:record
```

Implexa asks you a few setup questions:

1. **proposed skill name**: short, kebab-case. e.g., `prep-sales-call`, `weekly-standup`, `pr-review-checklist`.
2. **initial intent**: one sentence on what this skill is for. this becomes the seed for the skill's `description` field.

then it tells you to **just do the work**. don't narrate, don't explain. Claude is watching the tool calls and conversation.

## step 4: do the workflow

run the workflow you'd run normally. call the tools you'd call. make the decisions you'd make.

a few things that improve the capture:

**make decisions out loud when they matter.** if you're choosing between two filters, write *why*: "I'm filtering by amount > 50k because we don't need to prep for SMB deals." that rationale gets captured.

**use `record_demo_note` for non-tool actions.** sometimes you do something outside Claude's view. you open a Notion doc, check a Slack thread. tell Claude:

```
record this: I checked Slack #competitive for any mentions of Acme in the past 7 days
```

that note becomes part of the trace.

**don't skip steps because they feel obvious.** the skill is being authored from the trace. if you skip the "pull the last 5 activities" step, the skill won't include it.

## step 5: end the demonstration and answer the interview

when the workflow is done, run:

```
/implexa:record stop
```

Implexa pauses for ~10 seconds while it generates **2 to 4 targeted interview questions**. these aren't generic "tell us more" questions. they're surgical, based on what you actually did:

- *"at step 4 you filtered to only deals over $50k. why that threshold?"* (decision)
- *"what does a good output look like, paragraph summary, structured fields, or a Slack-ready blurb?"* (output contract)
- *"what signals next week that this skill worked? CRM stage change, meeting booked, reply received?"* (outcome signal)
- *"what if zero results come back from the news search?"* (edge case)

each question comes with **3 to 4 clickable options** so you can answer with a click instead of typing. the first option is what your trace evidence suggests is most likely. usually right, sometimes worth picking an alternative.

answer all 2 to 4 questions. about 60 seconds.

## step 6: activate and review

Implexa drafts the `SKILL.md` from your trace + interview answers and writes it to `~/.claude/skills/{your-skill-name}/`.

run:

```
/implexa:activate {your-skill-name}
```

this marks the skill as active so Claude triggers it automatically when matching requests come in.

**test it.** open a fresh conversation and ask the kind of question that should trigger the skill. e.g., if you built `prep-sales-call`, ask:

```
I have a meeting with Acme Corp tomorrow, prep me
```

Claude should load your skill, follow the procedure, and produce the output in the format you specified.

if something looks off (wrong step, missing decision, output format wrong) go to step 7.

## step 7: update the skill (re-record into it)

a skill isn't done at v1. real workflows shift as you learn what's actually useful. two ways to update:

**option A: manual edit.** open `~/.claude/skills/{name}/SKILL.md` in any editor. edit the procedure, add a step, change the output format. save. done.

**option B: re-record into the existing skill.** this is the powerful one:

```
/implexa:update-skill {your-skill-name}
```

you demonstrate the workflow again with whatever changes you've learned. Implexa **merges** the new demonstration into the existing skill. it doesn't hard-replace. existing structure is preserved, new steps get integrated.

this is how skills evolve. the first version is the rough cut. after two or three re-records, the skill knows the edge cases you've actually hit.

## step 8: share with your team

once the skill is working for you, give it to your team:

```
/implexa:share {your-skill-name}
```

pick the scope:

- **org**: only people on your Implexa workspace can run it. good for skills with internal context.
- **universal**: anyone with the link can run it; appears in the public library. good for generic workflows other teams might want.

you get back a link like `https://app.implexa.ai/s/abc123`. drop it in Slack, email, doc, wherever. anyone who clicks it can run the skill in their own Claude Code without copying any files.

**undo public.** if you share publicly and want to roll it back: hit "undo public" on the dashboard. the link stops working, the skill drops out of the universal library, and its scope reverts to whatever it was before (private or org).

## troubleshooting

### the skill isn't triggering automatically

the `description` field in the skill's frontmatter is probably too vague. open `~/.claude/skills/{name}/SKILL.md` and look at the first 5 lines. a trigger like "help with sales" won't fire. Claude can't tell what input matches. rewrite it to name the specific situation: "when the user mentions an upcoming meeting with a named company, pull..."

### the interview gave me "malformed JSON" or no questions

re-run `/implexa:record stop`. if it persists, your plugin may be below v0.6.0. run the install script again to refresh.

### the output format is wrong

re-record with `/implexa:update-skill` and during the interview, when asked about output format, pick the option that matches what you actually want (or type a custom answer in the "other" field). the skill regenerates with the new contract.

### I want to fork someone else's public skill

```
/implexa:fork {their-skill-name}
```

it copies the skill into your own org so you can customize without affecting the original.

## what good looks like

a skill is working when:

- it triggers automatically when you make a matching request (no need to type `/skill-name`)
- the output format is consistent every time
- when the input shifts slightly, the skill branches correctly instead of failing
- your teammates can use it without you walking them through anything
- you can point at outcome data: "this skill ran 14 times this week, 9 of them moved a deal stage"

## next reads

- **[what are claude skills? (and the right way to build them)](/claude-skills)**: the pillar guide with the 6-component contract and how skills run under the hood.
- **[what are claude skills? (5-minute explainer)](/blog/what-are-claude-skills)**: definitional 5-minute version.
- **[what is a skill graph?](/resources/what-is-a-skill-graph)**: the structure that connects many skills.
