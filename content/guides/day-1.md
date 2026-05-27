---
title: "Day 1 — The Live URL First"
slug: "day-1"
description: "The 5-step Day 1 flow from the @ImplexaAI build-solo series — Claude Code, Claude Pro, the one-sentence prompt, push + deploy, optional design mode. Get a live URL on the internet in 10 minutes without writing code."
publishedAt: "2026-05-24"
day: 1
reelHook: "Claude"
tags: ["day-1", "claude-code", "vercel", "github", "solo-founder", "no-code"]
---

# Day 1 — The Live URL First (Implexa AI Guide)

*Part of the 7-day "ship a real app this week" series. Day 1 of YOU building a $Bn company, solo.*

---

## TL;DR (the 5 moves — do them in this order)

1. **Open Claude Code** (90 seconds — download the desktop app)
2. **Get Claude Pro — $20/mo** (2 minutes)
3. **Type ONE sentence about what you want to build** (3 minutes — Claude makes the folder, files, framework)
4. **Tell Claude to push to GitHub + deploy to Vercel** (5 minutes — Claude does it; you just hit Enter once)
5. **Optional: sketch UI in Lovable or Claude design mode** (10 minutes — skip if you're not a visual thinker)

Total time: **~10 minutes from "no app" to a live URL on the internet.**

**The thing nobody tells you:** you don't need to know how to use a terminal to do Day 1. Claude Code is a chat box. The one terminal moment is in Step 4, and Claude tells you exactly what to type.

---

## Why this order matters

Most "start with Claude Code" tutorials front-load 30 minutes of planning — what stack to pick, how to architect the app, which framework is "best." That's the trap.

**The chain matters more than the idea.** When the chain exists (your local files → GitHub → Vercel → live URL), every prompt has a destination. When the chain doesn't exist, every prompt dies in your editor as untested code.

So: chain first, idea later. Day 1 ships a real page with "hello" on it. Day 2 we make it do something. Day 6 it has real users.

**The thing that's true but nobody emphasizes:** Claude Code handles 95% of the terminal work for you. You won't type `mkdir`. You won't write `cd`. You'll open the chat window, write a sentence, and Claude makes the folder + the files. The terminal only shows up at deploy time, and even then Claude tells you exactly what to type.

### The bigger shift (the actual reason this works)

Building used to be a process — plan, design, document, code, test, then ship. Months before anyone saw anything real. The result was a product that matched the plan you wrote on Day 0, not the product you actually wanted on Day 30.

With Claude, the game is **improvisation**. You build it, you see it, you change it. That's where the magic lives. The product takes its final shape as you taste it — not as you specified it.

That's why Day 1 is "make a landing page that says hello" instead of "spec out the full architecture." The spec emerges from the iteration, not the other way around. By Day 6, the product looks nothing like your Day 1 sentence — and that's the point.

---

## Step 1 · Open Claude Code (90 seconds)

Go to [claude.ai](https://claude.ai) and download the **Claude Code desktop app**. (On macOS, you can also install it via `brew install claude-code` if you're already comfortable with Homebrew — but you don't need to.)

When you open it for the first time:
- It'll ask you to sign in with your Anthropic account
- After sign-in, you'll see a chat window with a folder selector
- Click "Open Folder" and pick anywhere — Documents is fine, or Desktop. Claude will create a subfolder for your project on its own when you ask it to.

That's it. You're in. **No `mkdir`, no `cd`, no terminal commands yet.**

**Gotcha:** if you only see the web version at claude.ai (chat interface), you don't have Claude Code yet — you have Claude.ai chat. Look for the "Claude Code" download in the upper-right menu, or visit [claude.ai/download](https://claude.ai/download) directly. Claude Code is the version that can read your files and write new ones.

---

## Step 2 · Get Claude Pro (2 minutes, $20/month)

Go to [claude.ai/upgrade](https://claude.ai/upgrade) and pick **Pro**.

**Why Pro and not the free tier:**
- Free tier rate-limits you at roughly **30-40 messages every 5 hours**. That sounds like a lot — it isn't. One real Claude Code session burns through it in ~2 hours.
- When you hit the cap mid-flow, you'll wait. Or worse, switch back to ChatGPT and lose all context.
- $20 buys you ~5x the usage AND access to Claude Code on the desktop app.

**Why not Max ($100-200/mo) on Day 1:**
- Max is for daily power users. Day 1 you don't know if you'll stick with it. Start at Pro.
- Upgrade to Max around Day 30 if you're using Claude Code 3+ hours/day. Until then, Pro is plenty.

**Common objection — "$20 feels like a lot for something I'm not sure I'll use":**
You'll spend more than $20 in the next month on coffee, food delivery, or app subscriptions you don't open. The Pro plan is the lowest-friction way to find out if you're a builder or not. Buy 1 month. Try Day 1 through Day 6. Decide on Day 7.

---

## Step 3 · Type ONE sentence about what you want to build (3 minutes)

In the Claude Code chat box, write one sentence about what you want. Not a spec. Not a PRD. One sentence.

A real example — my Day 1 prompt for the Implexa landing page:

> *"Make me a landing page for my AI startup called Implexa. It records your work on Claude and turns it into reusable skills your team can run. The page should have a hero, a 3-feature section, and an email signup."*

That's the whole prompt. Hit enter. Claude will:
1. Decide on a framework (usually Next.js for landing pages, sometimes Astro or just static HTML)
2. Create a folder for the project
3. Create the necessary files (`package.json`, `app/page.tsx`, `components/Hero.tsx`, etc.)
4. Ask permission before writing each one ("Should I create `app/page.tsx`?")
5. Try to run the dev server so you can preview it locally

Say **yes** to each "may I write this file" prompt. Don't customize yet — see the whole thing first, then iterate.

**What "I'm directing, not coding" actually feels like:** you're reading Claude's plan ("I'll use Next.js, add Tailwind for styling..."), saying "yes," reading the next plan, saying "yes" again. The closest analogy is being a movie director — you set the vision, Claude does the camera work.

**Common gotchas:**
- **Claude asks "should I install Node.js?"** → say yes. Node is the runtime for most modern web projects. You only install it once.
- **Claude asks before any destructive operation (like deleting files)** → **always read what it's about to do.** Type `yes` only when you understand the change. You can usually say "wait, show me first" instead.
- **First session takes ~30 seconds before anything happens** → that's Claude reading your folder. Don't ctrl+C. Wait.
- **"Claude is being slow / I'm getting rate-limited"** → you're on the free tier. See Step 2.

---

## Step 4 · Tell Claude to push to GitHub + deploy to Vercel (5 minutes)

This is where your local files become a real website on the internet. And it's the one moment you'll touch a terminal on Day 1 — but Claude tells you exactly what to type.

In the same Claude Code chat (don't open a new session — you want it to know the context of what you just built), type:

> *"Now push this project to GitHub and deploy it to Vercel."*

Claude will walk you through it. Two paths, depending on what's already set up:

### Path A — Claude does it all (if you've used GitHub + Vercel CLI before)

Claude runs the commands itself: `git init`, `git add`, `git commit`, `gh repo create`, `vercel`. You watch each step. At deploy time, Vercel prints a URL like `my-project-abc123.vercel.app`. That's your live site.

### Path B — Claude tells you the one or two commands to run yourself (if it's your first time)

Claude will say something like:

> *"You'll need to log into GitHub and Vercel first. Run these two commands in your terminal and follow the prompts:"*

```bash
gh auth login        # asks you to authenticate GitHub via browser
vercel login         # asks you to authenticate Vercel via browser
```

Then Claude does the rest. The total "terminal moment" is ~30 seconds of clicking enter on Claude's instructions.

### What you see at the end

A live URL like `your-project-name-abc123.vercel.app`. Click it. Your landing page is on the internet. Send it to a friend. Take a screenshot. That's Day 1 done.

**That's the unlock.** Every change Claude makes after Day 1 — adding a feature, changing the design, fixing a bug — pushes to GitHub automatically, which auto-deploys to that URL via Vercel. You don't manage servers. You don't run deploy scripts. You ask Claude for changes, the URL updates.

**Common gotchas:**
- **"gh: command not found"** → install GitHub CLI: `brew install gh` on Mac, or download from [cli.github.com](https://cli.github.com). Or skip the CLI and let Claude do it via Personal Access Token instead — just tell it "I don't have gh installed."
- **"vercel: command not found"** → `npm install -g vercel` (Claude will tell you this exact command if needed).
- **Vercel deploy fails with "build error"** → tell Claude: *"Vercel build failed with this error: [paste error]"*. Claude will fix the code and try again.
- **First deploy takes 2-3 minutes** → subsequent deploys take 30-60 seconds.

---

## Step 5 · Optional · Sketch UI in Lovable or Claude design mode (10 minutes)

If you can't picture what your app should look like, mock the layout first. Two options:

- **[Lovable](https://lovable.dev)** — describe what you want, get a generated UI mock. Good if you have a vague visual idea.
- **Claude's design mode** (artifacts in claude.ai) — describe + iterate in chat. Good if you want tighter control.

Then bring the mock back to Claude Code as a reference: "build me a landing page that matches this screenshot." Claude Code will write the components.

**Skip this step entirely if:**
- You don't think visually (most engineers don't — that's fine)
- You're building something where design doesn't matter on Day 1 (most things)
- You already have a reference site you want to match (just paste the URL into Claude Code)

---

## Common Day 1 gotchas (the real ones nobody warns you about)

1. **The "where's my code" panic** — Claude Code writes files in your project folder. You can see them in Finder/Explorer (Mac) or File Explorer (Windows). They're not "in Claude" anywhere. You own them. If you ever want to leave Claude entirely, you can — your files come with you.

2. **The "Claude is mid" trap** — If Claude Code feels stuck, slow, or "dumb," you're probably on free tier. Get Pro. If it still feels stuck on Pro, you might be giving it too much at once. Smaller, more specific prompts work better than novels.

3. **The "Vercel auto-deploys broken code" surprise** — every push deploys. If Claude introduces a bug and Vercel's build fails, the previous (working) deploy stays live. So your URL won't break randomly. Worst case, the new deploy fails, you tell Claude to fix it, and the next deploy succeeds.

4. **The "I broke my files" fear** — Claude Code asks permission before every write. If you genuinely break something, you can tell Claude "undo the last change" and it'll revert. Or use git (Claude can do this for you): "show me what changed in the last commit" and "revert that change."

5. **The "I have to know all this Git stuff" worry** — you don't. Claude knows git. When you need it, you ask Claude in plain English ("create a branch called feature-X", "push this change", "undo my last commit"). The few terminal commands you might run are dictated by Claude — you copy-paste.

6. **The "free tier hit me already" surprise** — Vercel's free tier has a soft limit on serverless function invocations. For Day 1 you won't hit it. For Day 30 with real users, you might. Vercel Pro is $20/mo when that day comes — and you'll be making money by then.

---

## What Day 2 covers

Tomorrow we add the **frontend** — the part users actually see. Not the CSS-and-HTML-from-scratch version. The "describe it in plain English, Claude writes the React + Tailwind" version.

Day 2 hook: *"day 2 of building a $Bn company. you don't write CSS in 2026. you describe it and Claude writes it. your real job is taste."*

Action item preview: spin up a Next.js + Tailwind app, replace the default landing page with a hero + 3 feature cards + footer, iterate by talking ("make the button bigger, add a hover lift") until it stops feeling generic.

---

## Day-by-day series map

| day | topic |  |
|---|---|---|
| **Day 1** | The live URL first (Claude Code + Pro + Vercel) | ← you are here |
| Day 2 | Frontend, demystified (Next.js + Tailwind + taste) | tomorrow |
| Day 3 | Backend, demystified (Supabase: db + auth + storage) |  |
| Day 4 | Git is your time machine (branches, commits, undo) |  |
| Day 5 | Deployment, the magic moment (custom domain + analytics) |  |
| Day 6 | Ship day: end-to-end, real users, real URL |  |

---

## Resources

- Claude Code download: [claude.ai/download](https://claude.ai/download) (desktop app)
- Claude Code docs: [claude.com/claude-code](https://claude.com/claude-code)
- Vercel docs: [vercel.com/docs](https://vercel.com/docs) — you almost certainly won't need them. Vercel is the most beginner-friendly hosting on the internet.
- GitHub signup: [github.com/signup](https://github.com/signup) — free, takes 1 min
- Supabase quick start (for Day 2): [supabase.com/docs/guides/getting-started](https://supabase.com/docs/guides/getting-started)
- A real example from me: I built [implexa.ai](https://implexa.ai) using exactly this flow on Day 1. Whatever you build will look different — that's the point.
- Want help mid-week? DM me on Instagram. I'll look at every Day 1 deploy URL people send me.

---

**Get the next one in your DMs tomorrow:** follow [@ImplexaAI](https://instagram.com/implexaai) — Day 2 drops at 9am PT.

[implexa.ai](https://implexa.ai)
