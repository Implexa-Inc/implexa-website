---
title: "Day 6 — Ship Day: End-to-End"
slug: "day-6"
description: "The Day 6 capstone from the @ImplexaAI build-solo series. Ship one real full-stack app — a to-do list with login + database, deployed — and build the whole thing by prompting an AI. Next.js + Supabase + Vercel, three pieces, one live app. The day you stop learning to build and just ship."
publishedAt: "2026-06-05"
day: 6
reelHook: "ship"
tags: ["day-6", "ship", "fullstack", "nextjs", "supabase", "vercel", "claude-code", "codex", "solo-founder"]
---

# Day 6 — Ship Day: End-to-End (Implexa AI Guide)

*Part of the 7-day "ship a real app this week" series. Day 6 of YOU building a $Bn company, solo.*

---

## TL;DR (the 5 moves — do them in this order)

1. **Pick the most boring app on earth** (60 seconds — a to-do list, on purpose)
2. **Describe it to Claude Code or Codex in one paragraph** (3 minutes — you prompt it, the AI writes it)
3. **Let the AI wire the three pieces** (10 minutes — Next.js app + Supabase login & database + Vercel deploy)
4. **Push, and it's live with real users** (2 minutes — the laptop project becomes an internet product)
5. **Send the link and tag it** (1 minute — DM me your live URL; I open every one)

Total time from "blank folder" to "a real full-stack app, on the internet, that a stranger can sign into": **~20 minutes.**

**The thing nobody tells you:** you don't hand-write any of this. You open Claude Code — or Codex — tell it in plain English what you want, and it writes the app, wires the backend, and pushes it live. You built it with a sentence. The boring app is the point: a to-do list that logs you in, saves your data, and runs on a real URL *is* a full-stack app.

---

## Why this order matters

It's Day 6 and you've learned each piece separately — frontend, backend, git, deploy. Today you put them together into one complete thing, end to end, so the skills stop being trivia and become a *capability*.

**The boring app is deliberate.** A to-do list is the "hello world" of full-stack — but a to-do list with a real login, persistent data, and a public URL exercises every part of the stack. If you can ship that, you can ship anything. Clever comes later; *complete* comes today.

And you build it by prompting, not typing. That's not a shortcut — it's the actual job now. Your value is describing what should exist and having taste about the result, not memorizing syntax.

### The bigger shift (the actual reason this works)

The whole week has been one idea: in 2026, you build software by *asking for it*. You don't write the auth flow — you say "add Google sign-in," and Claude wires it. You don't hand-roll a database schema — you say "let users save todos that persist," and Supabase appears. You don't configure a deploy — you push, and Vercel ships it.

So "ship day" isn't a grind. It's a 20-minute conversation where you describe an app and three rented services do the heavy lifting. The thing that used to take a team a month, you do solo before lunch — because you stopped being the one typing and became the one deciding.

---

## Step 1 · Pick the most boring app on earth (60 seconds)

Build a **to-do list**. Resist the urge to be clever. You want a project where the *idea* is trivial so the *stack* is the lesson:

- a screen that lists your todos
- a way to add and check them off
- a **login**, so they're *your* todos
- **persistence**, so they're still there tomorrow
- a **live URL**, so it works on any device, for anyone

That's a real full-stack app. Boring on the outside, complete on the inside. The point isn't the to-do list — it's proving to yourself you can take an idea all the way to the internet.

**Gotcha:** if you must personalize it, swap the noun, not the shape. A reading list, a workout log, a client tracker — same five bullets, different word. Keep the scope tiny so you actually finish today.

---

## Step 2 · Describe it to Claude Code or Codex in one paragraph (3 minutes)

Open **Claude Code** (or **Codex** — same idea). In a fresh project folder, describe the whole thing in plain English. One paragraph, not a spec:

> *"Build me a to-do app with Next.js. Use Supabase for auth (Google sign-in) and to store each user's todos in a database. A logged-out visitor sees a sign-in button; a logged-in user sees their own list, can add a todo, check it off, and delete it. Keep it clean and minimal. Then set it up to deploy on Vercel."*

Hit enter. Read Claude's plan ("I'll scaffold Next.js, add the Supabase client, create a `todos` table, wire Google OAuth…"), and say **yes** to each step. You're directing; the AI is doing the camera work.

**Gotcha:** when Claude asks for your Supabase URL + anon key, or to enable Google as an auth provider, it'll tell you exactly where to click in the Supabase dashboard. Follow it literally — it's two minutes of pasting values, not configuration you have to understand.

---

## Step 3 · Let the AI wire the three pieces (10 minutes)

Three pieces do all the work — and you touch none of them directly, you just ask:

- **Next.js** is your **app** — the part people see and click. Claude writes the pages and components.
- **Supabase** is your **backend** — it handles the login and remembers every todo in a real Postgres database. Claude writes the queries; Supabase runs them in the cloud.
- **Vercel** puts it **on the internet** — every push goes live, exactly like Day 5.

As Claude builds, keep it tight with plain-English nudges: *"make the todo list update instantly when I check a box,"* *"only show me my own todos,"* *"add a sign-out button."* Each sentence is a feature. When something works, commit it (Day 4): *"commit this — 'working login + persistent todos'."*

**Common gotchas:**
- **Todos show for everyone, not just you** → tell Claude *"add a row-level security policy in Supabase so each user only sees their own todos."* This is the one backend concept worth saying out loud; Claude writes the policy.
- **Login works locally, not in production** → the Day 5 trap. Set the Supabase URL + anon key in Vercel's Environment Variables, and add your live domain to Supabase's allowed redirect URLs. Then redeploy.
- **"It got complicated"** → you're adding cleverness. Cut back to the five bullets in Step 1. Ship the boring version first; embellish after it's live.

---

## Step 4 · Push, and it's live with real users (2 minutes)

Tell Claude: *"commit everything and push to GitHub."* Vercel auto-deploys. In ~60 seconds, the thing that only ran on your laptop is a real app on the internet — one a stranger can open, sign into with Google, and use.

Open the live URL on your phone. Sign in. Add a todo. Watch it save. That loop — *type a sentence → an app with users exists* — is the entire week in one motion.

**Gotcha:** test the full path on a device that *isn't* your dev machine (your phone on cellular, not wifi). That's the truest check that the backend really left your laptop and your app works for "everyone," not just "you."

---

## Step 5 · Send the link and tag it (1 minute)

Two sends, both today:

1. **Text the live URL to one real person.** Watch them sign in and add a todo. That's the moment it becomes real.
2. **DM me your live URL** (or drop it in the Day 6 reel comments) and tag [@ImplexaAI](https://instagram.com/implexaai). I open every single one.

That's Week 1. You took an idea from a blank folder to a full-stack app on the internet, with login and a database, built by prompting an AI — and you did it solo, in a week. You stopped learning to build. **You're a builder now.**

---

## Common Day 6 gotchas (the real ones nobody warns you about)

1. **The "a to-do list is too basic to count" doubt** — a to-do list with auth + persistence + a live URL is a complete full-stack app. The simplicity is the feature: it proves the *stack*, not the idea.

2. **The "I should hand-code it to really learn" instinct** — outdated. The skill in 2026 is describing what should exist and judging the result. Let Claude type; you decide.

3. **The "everyone can see everyone's todos" leak** — the row-level-security gotcha. Always tell Claude to scope data to the logged-in user. It's one sentence and it's the difference between a demo and an app.

4. **The "works locally, dead in production" repeat** — same as Day 5: env vars in Vercel + the live domain in Supabase's redirect allow-list. If login breaks live, it's almost always this.

5. **The "let me add five more features first" stall** — ship the boring five-bullet version *today*, live, then add. A shipped boring app beats an unshipped clever one every time.

6. **The "what's Week 2" question** — Week 2 is **agentic apps**: putting an actual AI brain *inside* the things you build — APIs, the Anthropic API, tool use, RAG, and your first real agent. Same builder, bigger toys.

---

## Day-by-day series map

| day | topic |  |
|---|---|---|
| Day 1 | The live URL first (Claude Code + Pro + Vercel) | done |
| Day 2 | Frontend, demystified (Next.js + Tailwind + taste) | done |
| Day 3 | Backend, demystified (Supabase: db + auth + storage) | done |
| Day 4 | Git is your time machine (branches, commits, undo) | done |
| Day 5 | Deployment, the magic moment (custom domain + analytics) | done |
| **Day 6** | Ship day: end-to-end, real users, real URL | ← you are here · Week 1 shipped 🎉 |

---

## Resources

- Claude Code: [claude.com/claude-code](https://claude.com/claude-code) · Codex: [openai.com/codex](https://openai.com/codex)
- Next.js: [nextjs.org](https://nextjs.org) — the app framework Claude will reach for
- Supabase (auth + Postgres + storage): [supabase.com](https://supabase.com) — your rented backend
- Supabase Row Level Security: [supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security) — the "only my own data" concept
- Vercel: [vercel.com](https://vercel.com) — push to deploy
- A real example from me: [implexa.ai](https://implexa.ai) and its dashboard are Next.js + Supabase + Vercel — the exact stack in this guide.
- DM me your Week-1 app on Instagram. Tag [@ImplexaAI](https://instagram.com/implexaai) — I open every link.

---

**Week 1 is done — Week 2 (agentic apps) starts tomorrow:** follow [@ImplexaAI](https://instagram.com/implexaai), Day 7 drops at 9am PT.

[implexa.ai](https://implexa.ai)
