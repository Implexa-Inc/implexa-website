---
title: "How to edit videos using agents in Codex and Claude Code"
slug: "edit-videos-with-agents-codex-claude-code"
description: "A step-by-step way to turn a raw talking-head recording into a finished YouTube video with Codex or Claude Code, ffmpeg, faster-whisper and Remotion."
publishedAt: "2026-10-23"
tags: ["codex", "claude-code", "remotion", "video", "ai-agents"]
---

The first time we let an agent edit one of our recordings, one evening in June, it took an 11 minute 51 second talking-head video and handed back 9 minutes 15 seconds. It removed 156.6 seconds in 26 cuts.

Fourteen of those cuts were long pauses, the kind any silence remover finds. The other twelve were things you'd expect a person to catch. One sentence was recorded three times in a row while the speaker hunted for the right phrasing. A word came out wrong and was said again. There was a false start, and a second self-introduction a minute after the first. A silence detector sees none of that, because there's no silence in any of it. The agent caught them because it was reading the transcript.

That's the core idea of this post. Most of editing a talking-head video is judgement about words, and Codex and Claude Code are good at judgement about words. Rendering is the easy part; ffmpeg and Remotion have handled it for years. What follows is the pipeline we've settled on, with the commands, file formats and rules you need to build it yourself. It works the same in Codex and in Claude Code, and you can have the first stage running in an afternoon.

## The shape: three stages, three checkpoints

Video editing goes wrong in three different places. Cutting goes wrong on judgement: is that pause a beat or a stall? Planning goes wrong on taste. Rendering goes wrong on files, codecs and assets that never arrived. If one long prompt does all three, a bad cut gets planned around, animated over and rendered into the final file, and you find it at the end.

So split the job into three stages and run each one as its own agent session:

1. **Clean cut.** The raw recording becomes a tight one.
2. **Plan.** Decide what goes on screen at every moment, and write it down as files.
3. **Compose.** Render those files into the finished video.

Each stage writes files the next one reads, so a stage can be rerun on its own without redoing the others. And each stage ends by stopping for your approval at the point where a mistake would start costing real time or money. We've run this mostly in Codex, but nothing below depends on which one you use.

A project folder that keeps the stages apart looks like this:

```text
my-video/
  raw.mp4          the original recording, never modified
  cut/             transcript, cut list, clean.mp4
  plan/            beat map, style lock, shot specs
  remotion/        the Remotion project that renders the final video
```

## Setup in Codex and Claude Code

Both need the same three local tools:

```bash
brew install ffmpeg node
pip install faster-whisper "av<16"
```

The `av<16` pin matters as of October 2026: a plain `pip install faster-whisper` pulls in the newest PyAV, which faster-whisper 1.2.1 can't open audio with yet, and every transcription fails with an `unexpected keyword argument 'metadata_errors'` error.

ffmpeg does the cutting and encoding. faster-whisper is a quicker reimplementation of OpenAI's Whisper that runs locally, and it gives you a start and end time for every word, which is what makes transcript-based cutting possible. Node runs Remotion, the open-source framework that renders video from React code. An agent is much better at writing React than at dragging clips around a timeline, so Remotion is what lets it make motion graphics at all.

Then install Remotion's agent skills, which teach the agent to write Remotion code that renders on the first try:

```shell
npx skills add remotion-dev/skills
```

That command works in both tools. If you aren't sure which skill to reach for, Remotion's docs suggest starting with `/remotion-best-practices`.

Codex has a shorter route too. Remotion publishes a Codex plugin: open the ChatGPT desktop app, go to the Plugins tab and search for Remotion. Then start a new project and type `$remotion` in the prompt. The plugin bundles the same skills. Nearly every Remotion tutorial we found covers Claude Code only, which is odd given that this is the easier install.

In Claude Code, installed skills load on their own when you start a session in the project. If skills are new to you, we've written about [how Claude Code skills work](/blog/claude-code-skills) and [using the same skills across Codex, Cursor and Gemini](/blog/use-claude-skills-in-cursor-codex-gemini).

## Stage 1: the clean cut

This stage needs only the agent and two free local tools, and it's the one most worth having even if you never build the other two.

**Transcribe with word timestamps.** Pull the audio out as 16 kHz mono, which is what Whisper expects, then transcribe it:

```bash
ffmpeg -i raw.mp4 -vn -ac 1 -ar 16000 cut/audio16k.wav
```

```python
from faster_whisper import WhisperModel
import json

model = WhisperModel("distil-large-v3", device="auto", compute_type="int8")
segments, info = model.transcribe("cut/audio16k.wav", word_timestamps=True)
words = [{"start": w.start, "end": w.end, "word": w.word}
         for s in segments for w in s.words]
json.dump({"duration": info.duration, "words": words},
          open("cut/transcript.json", "w"), indent=1)
```

The distil model is fast and accurate enough for English. It has one habit to know about: it tends to leave filler words like "um" out of the transcript entirely, so you can't rely on the transcript alone to find them. Run ffmpeg's silence detection over the same audio and give the agent both:

```bash
ffmpeg -i cut/audio16k.wav -af silencedetect=noise=-35dB:d=0.5 -f null - 2> cut/silence.log
```

**Ask the agent for a cut list first.** This is the prompt that does the real work. The rules below are the ones we arrived at after a lot of runs, and most exist because breaking them produced a bad cut:

> Read cut/transcript.json and cut/silence.log. Write cut/cutlist.md: a table of every span to remove, with start, end, duration and a one-line reason. Remove filler words, stutters, false starts and retakes. When a phrase is repeated, cut it only if the earlier take was abandoned or wrong; a speaker restating a point on purpose stays. For back-to-back repeats, extend the cut slightly past the earlier take's last word, because Whisper's word end times run short. Measure dead air as the gap between words, not only from silence detection. Trim any gap over 3 seconds down to about 0.6 seconds, keeping 0.3 seconds on each side. Keep the 0.3 seconds before the first word and 0.6 seconds after the last. Do not render anything.

Here are five rows from that first run in June:

```text
#   source in → out      dur      removed
2   00:41.06 → 00:47.82   6.76s   dead air, 7.4s trimmed to ~0.6s
14  06:26.13 → 06:36.60  10.47s   same sentence said three times, plus dead air
16  07:49.92 → 07:53.70   3.78s   wrong word, then said again correctly
21  10:21.98 → 10:25.46   3.48s   false start
25  11:39.72 → 11:41.40   1.68s   repeated name at the sign-off
```

**Read it before anything renders.** This is the first checkpoint. Reading a table for thirty seconds is cheaper than watching a nine-minute render to find out a word got clipped. Delete any row you disagree with, or tell the agent to loosen the rules and redo the list.

**Render the kept segments.** Once the cut list is approved, ask the agent to turn it into a list of kept segments and render them with ffmpeg's `trim` and `concat` filters. For each kept segment it writes one video and one audio trim, then joins them all:

```text
[0:v]trim=start=19.9:end=41.06,setpts=PTS-STARTPTS[v0];
[0:a]atrim=start=19.9:end=41.06,asetpts=PTS-STARTPTS[a0];
[0:v]trim=start=47.82:end=83.54,setpts=PTS-STARTPTS[v1];
[0:a]atrim=start=47.82:end=83.54,asetpts=PTS-STARTPTS[a1];
[v0][a0][v1][a1]concat=n=2:v=1:a=1[outv][outa]
```

```bash
ffmpeg -i raw.mp4 -/filter_complex cut/filter.txt \
  -map "[outv]" -map "[outa]" -c:v h264_videotoolbox -b:v 12M -c:a aac cut/clean.mp4
```

`h264_videotoolbox` uses the Mac's hardware encoder; on other machines use `libx264`. The `-/filter_complex` form needs ffmpeg 7 or newer, which is what Homebrew installs; older versions use `-filter_complex_script`. Have the agent start each kept segment about 0.06 seconds before its first word, so word onsets don't get clipped, and drop any kept segment shorter than about 0.12 seconds, which is almost always a stray fragment.

**Check the output by transcribing it again.** Run faster-whisper on `clean.mp4` and ask the agent to compare: are the removed fillers and retakes really gone, is every word at a seam intact, and is the audio still in sync? One more lesson from experience: when transcribing a short fragment to check for a doubled phrase, Whisper sometimes invents words. If the agent suspects a doubling, have it count the speech runs with silence detection rather than trusting the fragment's transcript.

## Stage 2: the plan

The plan is a set of files. Keeping it separate means you can change the look, or change your mind about a shot, without spending anything on rendering or generation.

Start a new agent session in `plan/`, give it the clean video and its transcript, and ask for these, in order.

**A beat map.** Split the whole runtime into narrative beats that cover every second exactly once, with no gaps and no overlaps. That one rule catches a surprising number of planning mistakes.

**One lane per beat.** Each beat gets exactly one treatment:

- `presenter_only`: just the speaker, no overlay
- `remotion_scene`: text, a chart or a diagram drawn in Remotion
- `sourced_video` or `sourced_image`: real footage or screenshots you supply
- `generated_video` or `generated_image`: made by an AI model

Two rules matter here. Keep generated video sparing, because it's the expensive lane and the one most likely to look generic. And never send a factual claim to a generated lane: if the speaker cites a number or shows a product, the visual must be real.

**A style lock.** One short file that fixes fonts, colours, safe areas and motion style, so scenes made in different sessions still look like one video.

**A density target.** How much of what's said should have something on screen supporting it. We aim for at least 65%. Less than that and a talking-head video feels bare; much more and it gets busy.

**Variety rules for animation.** Ask for at least eight distinct kinds of animation across the video, never the same kind twice in a row, and no kind repeated more than once in any six consecutive beats. Without explicit rules like these, agents settle into one pattern and repeat it for ten minutes.

**Shot specifications for anything generated.** For each generated beat, the exact prompt, negative prompt, duration, camera and lens notes, and a fallback if generation fails. Write them, but don't send them.

A single beat in the beat map can be as simple as this:

```json
{
  "id": "b07",
  "start": 128.4,
  "end": 136.9,
  "lane": "remotion_scene",
  "animation": "counter",
  "overlay_text": "3 hours a week saved",
  "why": "speaker states a number; show it, don't generate it"
}
```

Finish the session by asking the agent to review its own plan three ways: as a domain expert, as a hard skeptic and as a viewer. In particular, have it check the coverage, lane and variety rules mechanically. Then read the plan yourself. This is the second checkpoint, and it's where you approve or rewrite the generated-shot prompts before any money is spent. We generate with Kling 3.0 through Higgsfield; whichever model you use, run only the shots you approved and save the results into the Remotion project's `public/` folder.

## Stage 3: compose

A new session again, this time in `remotion/`, with the plan and the clean video. Copy `cut/clean.mp4` into the Remotion project's `public/` folder and `plan/beats.json` into `src/`. The structure that works is one composition: the presenter as the base layer for the full runtime, and every non-presenter beat as a `Sequence` on top, timed from the beat map:

```tsx
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import beats from "./beats.json";
import { Scene } from "./Scene";

export const Edit = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile("clean.mp4")} />
      {beats
        .filter((b) => b.lane !== "presenter_only")
        .map((b) => (
          <Sequence key={b.id} from={Math.round(b.start * fps)}
            durationInFrames={Math.round((b.end - b.start) * fps)}>
            <Scene beat={b} />
          </Sequence>
        ))}
    </AbsoluteFill>
  );
};
```

The agent writes `Scene` and one small component per animation kind, following the style lock. Keep the timing in the beat map rather than in the components: if a beat moves, you change one number and everything follows.

**Render a preview first**, at half resolution, which is much faster:

```bash
npx remotion render src/index.ts Edit out/preview.mp4 --scale=0.5
```

Watch all of it. This is the third checkpoint. Note every fix against a beat id, give the list back to the agent, and re-render the preview until it's right. Only then render the master at full resolution, and check it before you call it done:

```bash
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate \
  -of compact out/master.mp4
```

The duration should match the clean cut's, there should be one video and one audio stream, and the resolution and frame rate should be what you intended. Then watch the master once at full speed. A file can pass every automated check and still have a caption that flickers or a scene that cuts on the wrong word.

## Where you stay in the loop

Three approvals: the cut list, the plan with its generated-shot prompts, and the preview. Between those points the agent can run without you, and each approval comes before the most expensive thing that follows it.

The tools are free, and the agent runs inside your own Codex or Claude Code plan. The only real spend is generated video, and you've read every prompt before it's sent.

## What still breaks

A few things that still catch us:

- **Long recordings.** On long files, a single agent session can stall or time out partway through transcription or cutting. Split the audio into chunks, or rerun from the files already written.
- **Meaningful repeats.** The rule about only cutting abandoned takes works most of the time. A speaker who repeats a line for emphasis will occasionally lose it, which is one more reason to read the cut list.
- **Fonts in Remotion.** If the style lock names a font that isn't installed or loaded in the project, the render quietly falls back to a default. Ask the agent to load fonts explicitly, and check the preview for it.
- **Generated shots that miss.** Budget for regenerating one or two. The fallback you wrote in the plan is what keeps a failed shot from holding up the whole video.

Get the clean cut working first. It needs nothing but ffmpeg, faster-whisper and an agent, and on a typical talking-head recording it removes more than you'd expect. The plan and compose stages build on its output, and you can add them when you want more than a tighter cut.
