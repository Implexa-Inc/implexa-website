---
title: "Day 4 — Git Is Your Time Machine"
slug: "day-4"
description: "The 5-step Day 4 flow from the @ImplexaAI build-solo series. What Git actually is. Why it's a time machine, not a chore. Commits, branches, and undo — all in plain English, with Claude running the commands. The safety net that lets you build fearlessly."
publishedAt: "2026-06-02"
day: 4
reelHook: "git"
tags: ["day-4", "git", "github", "version-control", "claude-code", "solo-founder"]
---

# Day 4 — Git Is Your Time Machine (Implexa AI Guide)

*Part of the 7-day "ship a real app this week" series. Day 4 of YOU building a $Bn company, solo.*

---

## TL;DR (the 5 moves — do them in this order)

1. **Understand what Git actually is** (60 seconds — a save button for your whole project, with infinite undo)
2. **Make your first commit via Claude** (2 minutes — "save my work with a message describing what changed")
3. **Branch before anything risky** (2 minutes — "make a branch called redesign so I can experiment safely")
4. **Undo without fear** (2 minutes — "this broke something, take me back to the last working version")
5. **Push so it's backed up + deployed** (1 minute — "push this to GitHub" — Vercel redeploys automatically)

Total time from "I'm scared to change anything" to "I can try anything and never lose work": **~10 minutes.**

**The thing nobody tells you:** Git is not a chore you do for other engineers. It's a *time machine for one person*. Every commit is a save point you can teleport back to. Once you have it, you stop being precious about your code — you experiment, because undo is free.

---

## Why this order matters

By Day 3 you have an app that does real things — a frontend, a backend, auth, payments. Which means you now have something to *lose*. The fear creeps in: "what if I change this and break the thing that works?"

That fear is what kills momentum. Git removes it.

**The chain you built on Day 1 (files → GitHub → Vercel → live URL) runs on Git.** Every "push" is a Git operation. You've been using Git already without naming it. Day 4 is just learning to drive it on purpose — so you can branch, undo, and rewind at will.

So: save points first, fearless building after. Once you trust the undo button, you build twice as fast because you stop second-guessing every change.

### The bigger shift (the actual reason this works)

Old-world Git was a gauntlet: `git rebase -i`, merge conflicts, detached HEAD states, Stack Overflow at midnight. Whole careers were spent being the person on the team who "knew Git."

With Claude, Git becomes a conversation. You say "save this", "branch this", "undo that" in English, and Claude runs the right command. You don't memorize `git reflog`. You describe the outcome you want — go back, try again, keep this, drop that — and Claude maps it to the plumbing.

That's the unlock: the *concepts* of Git (save points, parallel timelines, undo) are simple and worth knowing. The *commands* are a 2008 problem Claude now solves for you.

---

## Step 1 · Understand what Git actually is (60 seconds)

Forget the engineering definition. Here's the only mental model you need:

**Git is a save button for your entire project — and unlike a normal save, it never overwrites the old version.** Every time you "commit," you create a labeled snapshot of every file. You can jump back to any snapshot, any time, forever.

Three words cover 95% of what you'll ever do:

- **Commit** — "save a snapshot of everything right now, with a note saying what changed."
- **Branch** — "make a parallel copy of the timeline so I can experiment without touching the working version."
- **Push** — "upload my snapshots to GitHub so they're backed up (and on Vercel, deployed)."

That's it. Not "merge strategies." Not "interactive rebase." Save, parallel-universe, upload.

**Gotcha:** people conflate Git and GitHub. **Git** is the time machine running on your laptop. **GitHub** is the cloud backup of it. You can use Git with zero GitHub. But you'll want GitHub, because it's also what auto-deploys your site.

---

## Step 2 · Make your first commit via Claude (2 minutes)

In your Claude Code chat — the same project from Days 1–3 — type:

> *"Commit everything I've built so far. Write a clear commit message describing what's in the project."*

Claude will run `git add` + `git commit` for you and write a message like `feat: landing page, Supabase auth, Stripe checkout`. You'll see it confirm the snapshot was saved.

Now make a habit of it. After any chunk of work that *currently works*, tell Claude:

> *"Commit this — message: 'working login flow'."*

**The rule that matters:** commit when things *work*, not when they're "done." A commit is a checkpoint you'd be happy to fall back to. Five small commits ("added the form", "wired the API", "fixed the spacing") beat one giant commit at the end of the day — because each one is a separate place you can rewind to.

**Common gotchas:**
- **"nothing to commit, working tree clean"** → you already saved everything; there are no new changes. That's fine.
- **Claude commits a secret (an API key) by accident** → tell it *"add a .gitignore that excludes .env and remove the committed secret from history."* Do this *before* you push anything public.
- **Huge commit with 200 files the first time** → normal. That's your whole project entering the time machine for the first time. After that, commits are small.

---

## Step 3 · Branch before anything risky (2 minutes)

A branch is a parallel timeline. Your working app stays safe on `main` while you go wild on a copy.

Before any big or scary change — a redesign, a risky refactor, "let me try a totally different homepage" — tell Claude:

> *"Make a branch called redesign and switch to it. I want to experiment without touching the working version."*

Now build whatever you want. If it's great, tell Claude *"merge redesign back into main."* If it's a disaster, tell Claude *"throw away the redesign branch, take me back to main"* — and it's like the experiment never happened. The working version never moved.

**Why this is a superpower for solo builders:** you can keep three half-finished ideas on three branches and pick the one that actually feels right — instead of committing to one path and praying. Improvisation needs a cheap undo. Branches are it.

**Gotcha:** if Claude says "you have uncommitted changes, can't switch branches," just tell it *"commit what I have first, then make the branch."* Commit, then branch. Always in that order.

---

## Step 4 · Undo without fear (2 minutes)

This is the step that changes how you build. Three kinds of undo, all in plain English:

- **"Undo my last change"** — Claude reverts the most recent edit. For "I just made it worse."
- **"Take me back to the last commit — throw away everything since."** — Claude resets to your last save point. For "this whole session went sideways."
- **"Show me what changed since my last working version, then revert just the part that broke X."** — Claude diffs and surgically undoes. For "90% is good, one thing broke."

The magic line to memorize:

> *"This broke something. Take me back to the last version that worked."*

Say that, and Claude finds your last good commit and rewinds to it. Your live URL (still serving the last *successful* deploy) never even noticed.

**Common gotchas:**
- **"I committed the broken version too"** → still fine. Tell Claude *"revert to the commit before this one"* — it'll name them and let you pick.
- **Scared you'll lose good work by undoing** → commit the good work *first* (Step 2), then undo freely. Committed work is never lost; Git keeps it even after a "reset."
- **`git rebase -i` / merge conflict appears** → don't touch it. Tell Claude *"resolve this for me, keep my version of the changes."* Never hand-edit conflict markers in 2026.

---

## Step 5 · Push so it's backed up + deployed (1 minute)

A commit lives only on your laptop until you push it. Push does two jobs at once:

> *"Push this to GitHub."*

1. **Backup** — your entire history is now safe in the cloud. Laptop dies? Your project doesn't.
2. **Deploy** — because you connected GitHub to Vercel on Day 1, every push to `main` auto-deploys. Your live URL updates within ~60 seconds.

That's the whole loop you'll run for the rest of the week: **work → commit → push → it's live.** No deploy scripts. No servers. A push *is* a deploy.

**Gotcha:** if you pushed a broken build, Vercel keeps the last *working* deploy live and just marks the new one failed. Your site doesn't break — you fix the code, push again, and the next deploy goes green. (More on this on Day 5.)

---

## Common Day 4 gotchas (the real ones nobody warns you about)

1. **The "Git is too hard for me" myth** — the *commands* were hard. The *concepts* (save, branch, undo) are kindergarten-simple, and Claude runs the commands. You already used Git on Day 1. You just didn't know its name.

2. **The "I'll commit at the end" trap** — don't. Commit every time something works. The whole value of a time machine is having lots of points to travel to. One commit a day gives you one place to rewind; ten gives you ten.

3. **The "I committed my API keys to a public repo" oh-no** — happens to everyone once. Tell Claude immediately: *"rotate this key, add .gitignore for .env, and scrub the secret from Git history."* Then regenerate the key in the provider's dashboard. Do it before you tell anyone your repo URL.

4. **The "merge conflict" panic** — a conflict just means two versions of the same line disagree. It's not an error, it's a question. Tell Claude which version to keep, in English. Never edit the `<<<<<<<` markers by hand.

5. **The "main vs master" confusion** — new repos default to `main`. Old tutorials say `master`. They're the same thing (the default branch). If a command fails because of the name, tell Claude and it'll use the right one.

6. **The "do I need to understand the staging area" worry** — no. "Staging" (`git add` before `git commit`) is plumbing Claude handles. You think in snapshots; Claude thinks in `add`/`commit`/`push`.

---

## What Day 5 covers

Tomorrow is **the magic moment: deployment**. The deploy itself is one click and sixty seconds — you already do it every time you push. The part nobody warns beginners about is the *backend* going live too (your app works on your laptop, then loads-but-does-nothing in production, because `localhost` is a place only you can visit). We fix that, add a custom domain (optional — don't buy one yet), turn on analytics, and hit send.

Day 5 hook: *"day 5 of building a $Bn company. putting your app on the internet is one click. the part that actually trips people up is sneakier."*

Action item preview: deploy your app to a real URL, fix the localhost-backend trap, and text the live link to one real person.

---

## Day-by-day series map

| day | topic |  |
|---|---|---|
| Day 1 | The live URL first (Claude Code + Pro + Vercel) | done |
| Day 2 | Frontend, demystified (Next.js + Tailwind + taste) | done |
| Day 3 | Backend, demystified (Supabase: db + auth + storage) | done |
| **Day 4** | Git is your time machine (branches, commits, undo) | ← you are here |
| Day 5 | Deployment, the magic moment (custom domain + analytics) | tomorrow |
| Day 6 | Ship day: end-to-end, real users, real URL |  |

---

## Resources

- GitHub signup: [github.com/signup](https://github.com/signup) — free, 1 minute
- GitHub CLI (so Claude can create repos for you): [cli.github.com](https://cli.github.com)
- The only Git concepts that matter, visually: [learngitbranching.js.org](https://learngitbranching.js.org) — optional, fun, you don't need it
- Claude Code docs: [claude.com/claude-code](https://claude.com/claude-code)
- A real example from me: every change to [implexa.ai](https://implexa.ai) is a commit + a push. That's the whole workflow — nothing fancier.
- Want help mid-week? DM me on Instagram — I'll look at every Day 4 repo people send me.

---

**Get the next one in your DMs tomorrow:** follow [@ImplexaAI](https://instagram.com/implexaai) — Day 5 drops at 9am PT.

[implexa.ai](https://implexa.ai)
