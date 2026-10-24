---
title: "How to edit videos using agents in Codex and Claude Code"
slug: "edit-videos-with-agents-codex-claude-code"
description: "How we edit raw recordings into finished YouTube videos with agents in Codex and Claude Code: a clean-cut agent, a planner and a Remotion compositor."
publishedAt: "2026-10-23"
tags: ["codex", "claude-code", "remotion", "video", "ai-agents"]
---

The first time we ran our clean-cut agent, one evening in June, it took an 11 minute 51 second talking-head recording and handed back 9 minutes 15 seconds. It removed 156.6 seconds in 26 cuts.

Fourteen of those cuts were long pauses, the kind any silence remover finds. The other twelve were things you'd expect a person to catch. One sentence was recorded three times in a row while the speaker hunted for the right phrasing. A word came out wrong and was said again. There was a false start, and a second self-introduction a minute after the first. A silence detector sees none of that, because there's no silence in any of it. The agent caught them because it was reading the transcript.

That run is a fair summary of this whole post. Most of editing a talking-head video is judgement about words, and Codex and Claude Code are good at judgement about words. Rendering is the easy part; ffmpeg and Remotion have handled it for years. The new piece is an agent sitting between the two that decides what should happen, writes it down, and waits for you to agree before anything expensive runs.

Below are the three agents we use to go from a raw recording to a finished YouTube video, how they hand work to each other, and how to set up the same tools in Codex or Claude Code.

## Why three agents instead of one prompt

You can open Codex, point it at a video file and ask it to edit it. You'll get something back, and most Remotion tutorials stop at that point.

The trouble shows up when the edit is wrong, because video editing goes wrong in three different places. Cutting goes wrong on judgement: is that pause a beat or a stall? Planning goes wrong on taste. Rendering goes wrong on files, codecs and assets that never arrived. If a single prompt does all three, a bad cut gets planned around, animated over and rendered into the final file, and you find it at the end, which is the most expensive place to find anything in video.

So we split the job into three agents that run in order:

1. **Clean cut** turns the raw recording into a tight one.
2. **The planner** decides what goes on screen and writes it up as a project.
3. **The compositor** renders that project into the finished video.

Each one writes files the next one reads, and each one stops at the point where a mistake would start costing real time or money. We run all three in Codex, which is where they have the most hours on them. Between them they've finished and passed their own checks 62 times there. The setup below works in Claude Code too, with one caveat that we'll get to in step 3.

## Setting up Codex and Claude Code

Both need the same three local tools:

```bash
brew install ffmpeg node
pip install faster-whisper
```

ffmpeg does the cutting and encoding. faster-whisper is a quicker reimplementation of OpenAI's Whisper that runs locally, and it gives you a timestamp for every word, which is what makes transcript-based cutting possible. Node runs Remotion, the open-source framework that renders video from React code. An agent is far better at writing React than at pushing pixels around a timeline, so Remotion is what lets it make motion graphics at all.

Next, install Remotion's agent skills. They teach the agent how to write Remotion code that renders on the first try:

```shell
npx skills add remotion-dev/skills
```

That command works for both tools. If you aren't sure which skill to reach for, Remotion's docs suggest starting with `/remotion-best-practices`, which covers the rest.

Codex also has a shorter route. Remotion publishes a Codex plugin: open the ChatGPT desktop app, go to the Plugins tab and search for Remotion. Then start a new project and type `$remotion` in the prompt. The plugin bundles the same skills. Nearly every Remotion tutorial we found covers Claude Code only, which is odd given that this is the easier install.

In Claude Code, installed skills load on their own when you start a session in the project. If skills are new to you, we've written about [how Claude Code skills work](/blog/claude-code-skills) and [using the same skills across Codex, Cursor and Gemini](/blog/use-claude-skills-in-cursor-codex-gemini).

Our three agents run on your own machine, in whichever of the two you already pay for, as you. They're free to run on your plan.

## Step 1: the clean cut

You give the [clean-cut agent](/workflows/raw-recording-clean-cut-claude-remotion) a raw recording, either a local file or a shared Google Drive link.

It transcribes the audio with faster-whisper's distil-large-v3 model, so every word has a start and end time, and runs ffmpeg's silence detection alongside it. Its default style keeps natural pauses up to two seconds and removes filler words, fumbles, retakes and non-speech sounds. You can loosen or tighten that, or hand it a reference video whose cuts you liked and let it match them.

What comes out is a cut list: every span it wants to remove, with a timestamp and a reason. Here are five rows from that first June run:

```text
#   source in → out      dur      removed
2   00:41.06 → 00:47.82   6.76s   dead air, 7.4s trimmed to ~0.6s
14  06:26.13 → 06:36.60  10.47s   same sentence said three times, plus dead air
16  07:49.92 → 07:53.70   3.78s   wrong word, then said again correctly
21  10:21.98 → 10:25.46   3.48s   false start
25  11:39.72 → 11:41.40   1.68s   repeated name at the sign-off
```

Then it stops. Nothing renders until you've read the list and approved it. Reading a table for thirty seconds is cheaper than watching a nine-minute render to find out a word got clipped.

Once you approve, it trims and joins the kept segments with ffmpeg. Then it transcribes its own output a second time and compares, looking for clipped words, fillers it missed and audio drifting out of sync. The agent is built on four public skills, including `video-use`, `video-cut` and `ffmpeg`, plus our own review and quality steps.

## Step 2: the planner

The [planner](/workflows/visual-treatment-planner-runway-remotion) takes the clean recording and produces a project, not a video. (Its name still mentions Runway from an earlier version. It plans for Higgsfield's Kling 3.0 model now.)

Over 13 steps it rebuilds the transcript with word timings and splits the talk into narrative beats. It then writes a few short files that pin the video down. A style lock fixes the fonts, colours and motion. A density target says how much of what's said should have something on screen to support it; the default is at least 65%. An animation plan says what moves and when. Finally it writes the Remotion source code that will render all of it, as a project you can open and edit.

It also writes eight shot requests for Kling 3.0, and doesn't send them. Generation is the only step in the whole pipeline that costs money every time it runs, so the planner gets it ready and stops. You read eight prompts, change the ones you don't like and approve them. If you want a different look, you change the style and re-plan without spending anything.

Everything is packaged as a portable ZIP, so the compositor, or a person, can pick it up on any machine.

## Step 3: the compositor

The [compositor](/workflows/visual-evidence-remotion-compositor) takes the planner's ZIP and the presenter recording and turns them into the finished video in eight steps.

It checks the inputs against what the planner promised, gathers the approved Kling shots, builds the scenes and renders a preview. Then it stops again and waits for you to approve the preview. Only after that does it render the full-quality master, check it with ffprobe and its own quality gates, and deliver it together with the editable Remotion project. If you want to nudge a caption by half a second afterwards, the code is right there.

If a shot fails to generate, or you decline one, you get a preview that's labelled as a preview. The compositor won't call an incomplete video final.

Now the caveat. Almost all of our compositor runs have been in Codex, where it has finished and passed its checks 28 times. In Claude Code it hasn't completed a run yet. The planner has run successfully in Claude Code four times, so the gap is specific to the rendering step. If you're on Claude Code today, start with the first two agents.

## Optional extras

A few more agents slot in around these three when a video needs them:

- the [B-roll generator](/workflows/cinematic-b-roll-generator), which makes B-roll clips from a source video and a list of shots;
- the [B-roll placer](/workflows/cinematic-b-roll-placer-prompt-writer), which decides where B-roll goes in the talk;
- the [overlay animator](/workflows/youtube-remotion-overlay-animator), which builds captions and callouts tied to the transcript;
- [markdown brief to Remotion text animations](/workflows/markdown-brief-to-remotion-text-animations), which turns a written brief into animated text.

## Where you stay in the loop

You approve three things: the cut list, the eight generation requests and the preview. Everything between those points runs on its own.

The agents are free on your own Codex or Claude Code plan. The real spend is Kling credits for the generated shots, and you see all eight requests before any are sent.

## What still breaks

A few things we hit regularly:

- On long recordings, the clean cut can run into a silence timeout and stop early. Keep an eye on it and run it again if that happens.
- By default, delivery is capped at 10 MB. Bigger files need a drag-and-drop or a tool like rclone.
- When the generation provider has an outage, you get a labelled preview instead of a master. That's deliberate, though it's still annoying when it happens.

One more thing, since you'll see it on the agent pages: their run counts include every attempt, failures and all, from the months we spent building these agents. The numbers in this post count only runs that finished and passed their checks.

## Try it

All three agents run in Codex or Claude Code, and you can start with the [clean cut](/workflows/raw-recording-clean-cut-claude-remotion) on a recording you already have. It's the most useful of the three on its own, and the cut list will tell you within a few minutes whether its judgement matches yours. The [planner](/workflows/visual-treatment-planner-runway-remotion) and [compositor](/workflows/visual-evidence-remotion-compositor) pick up from there.
