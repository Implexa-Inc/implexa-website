---
title: "Day 2 — Frontend, Demystified"
slug: "day-2"
description: "The 5-step Day 2 flow from the @ImplexaAI build-solo series. What frontend actually is. Next.js as the standard. Describing UI in plain English. Iterating by talking, not editing CSS. And the new gatekeeping skill: taste."
publishedAt: "2026-05-25"
day: 2
reelHook: "frontend"
tags: ["day-2", "frontend", "nextjs", "tailwind", "taste", "solo-founder"]
---

# Day 2 — Frontend, Demystified (Implexa AI Guide)

*Part of the 7-day "ship a real app this week" series. Day 2 of YOU building a $Bn company, solo.*

---

## TL;DR (the 5 moves — do them in this order)

1. **Understand what frontend actually is** (60 seconds — the part of the app users see and click)
2. **Spin up a Next.js app via Claude** (2 minutes — one prompt, one command, one app skeleton)
3. **Describe the UI you want in plain English** (5 minutes — Claude writes the React + layout + styles)
4. **Iterate by talking, not by editing CSS** (ongoing — say what's wrong, Claude fixes it)
5. **Build your taste muscle** (lifelong — look at sites you love, name what they did right)

Total time from "no frontend" to a working landing page on `localhost:3000`: **~10 minutes.**

**The thing nobody tells you:** in 2026, frontend is the easiest part of the stack. Claude writes 95% of a beautiful frontend on the first try. The 5% that's still your job is *taste* — knowing the button is too crowded, the color is off, the padding is wrong. That's the new gatekeeping skill, and it's not learnable from a tutorial.

---

## What frontend actually is

Frontend is the part of the app users **see and interact with.** Headers. Buttons. Forms. Cards. Pages. Everything that lives in the browser window.

Backend is the part users **don't see** — the database that stores their data, the API that processes payments, the auth that knows who's logged in. We cover that on Day 3.

For Day 2, all you need to know: when you say "frontend," you mean the UI. The face of the thing.

### Why this matters

A year ago, learning frontend meant:

- HTML to structure the page
- CSS to style it
- JavaScript to make it interactive
- React (or Vue, or Svelte) to manage components
- Routing, bundling, deployment to make it real
- Months of practice before any of it looked good

In 2026, you don't learn any of that *as syntax*. You learn it *as taste*. Claude writes the syntax. You judge the result. The skill shifted one layer up.

---

## The stack you'll actually use

Pick once and stop researching. The 2026 standard for new frontend projects:

- **Next.js** — the React framework. Handles routing, bundling, server rendering, deployment. The standard.
- **TypeScript** — typed JavaScript. Catches bugs Claude would otherwise miss.
- **Tailwind CSS** — utility classes for styling. Lets Claude style without inventing class names or fighting CSS specificity.
- **App Router** — Next.js 15's modern routing model. Use this, not `pages/`.

Don't pick a different stack unless you have a specific reason. The boring choice is correct here.

---

## Step 2 in detail: spinning up a Next.js app via Claude

Open Claude Code in an empty folder (or just open it and let Claude create the folder).

**The prompt:**

> *"build me a Next.js app with tailwind"*

That's the whole prompt. Claude will:

1. Run `npx create-next-app@latest my-app --ts --tw --app` (or similar — flags may vary by Next.js version)
2. Walk through the defaults (TypeScript ✅, Tailwind ✅, App Router ✅, ESLint ✅)
3. Wait for the install
4. Show you the file tree

You'll get a project structure that looks like:

```
my-app/
├── app/
│   ├── layout.tsx       ← the shell every page wraps in
│   ├── page.tsx         ← your home page (the one Claude will edit)
│   └── globals.css      ← Tailwind base styles
├── components/          ← where you'll keep reusable UI bits
├── public/              ← static assets (images, favicons)
├── package.json
├── next.config.ts
└── tailwind.config.ts
```

To preview it, tell Claude:

> *"now run the dev server"*

Claude will run `npm run dev` and tell you to open `http://localhost:3000`. You'll see the default Next.js welcome page. That's your frontend. You haven't written a single line of code.

### Common gotchas

- **Port already in use** — if `localhost:3000` is taken, Next.js auto-picks 3001. Watch the terminal output.
- **Node version too old** — Next.js 15 needs Node 18.17+. If `npm install` fails, ask Claude: *"check my node version and tell me how to upgrade if needed."*
- **Slow first compile** — first time you open `localhost:3000`, the page takes ~5 seconds. That's Next.js compiling. Subsequent loads are instant.

---

## Step 3 in detail: describing the UI you want

Once the dev server is running, you start describing the UI you want.

**The prompt template:**

> *"Replace the home page with:*
> - *A hero section with a headline, a sub-headline, and a sign-up button*
> - *Three feature cards below the hero*
> - *A footer with social links (twitter, linkedin, github)"*

Claude will:

- Edit `app/page.tsx` to render the new structure
- Create `components/Hero.tsx` and `components/FeatureGrid.tsx` if it decides to split things up
- Style everything with Tailwind utility classes
- Save the files

The dev server auto-reloads. Your browser shows the new layout in under a second.

### Prompts that work

| What you want | Prompt to use |
|---|---|
| A simple landing page | *"build me a landing page for [your idea] with a hero, three feature cards, and a sign-up CTA"* |
| Two-column layout | *"split the hero into two columns — headline + CTA on the left, screenshot placeholder on the right"* |
| A pricing section | *"add a pricing section with three plans (Free, Pro, Team). Pro is highlighted as recommended."* |
| A FAQ block | *"add a FAQ accordion below the features. Five questions, expandable on click."* |
| Dark mode | *"add a dark mode toggle in the header. Use Tailwind's dark: variants."* |

### Prompts that don't work

- *"make it look professional"* (too vague — Claude doesn't know your taste yet)
- *"copy stripe.com"* (Claude can't see stripe.com — describe the parts you like)
- *"make it pop"* (no signal — what does "pop" mean in your head?)

The pattern: **describe the structure, not the vibe.** Vibe comes from iteration in Step 4.

---

## Step 4 in detail: iterating by talking

Once the structure is in place, you iterate by *describing what's wrong.*

**Example iteration session:**

> *"Make the headline bigger and bolder."*
>
> *"The button is too small. Make it bigger and add some padding."*
>
> *"Change the button color to a deep purple."*
>
> *"Add a hover state that lifts the button slightly and increases the shadow."*
>
> *"The hero feels cramped. Add more top and bottom padding."*
>
> *"The feature cards are too uniform. Add a subtle accent border to the middle one."*

Each one of those is a one-liner. Claude knows where to look (it remembers the file structure). It runs `Edit` tool calls on the right files. The browser refreshes. You see the change.

**You never type CSS. You never search Stack Overflow.** You describe the problem in plain English.

### Iteration prompts that work

- *"make the button bigger / smaller / wider / rounder"*
- *"add hover lift / glow / underline animation"*
- *"more padding / less padding / more whitespace between sections"*
- *"the headline should be the focal point — make everything else recede"*
- *"add a subtle gradient background to the hero"*
- *"the spacing feels inconsistent — audit and standardize"*

### When to push back on Claude

Sometimes Claude makes a choice you didn't ask for — extra animations, an unrequested color, a layout shift. Push back: *"I didn't ask for animations. Remove them."* Claude undoes the change. You stay in control.

If Claude keeps making the same kind of unrequested choice, add a constraint to your `CLAUDE.md` (project memory file):

> *"Style preferences: no animations unless explicitly requested. Buttons should be rectangular with subtle rounded corners (8px). Color palette is warm cream + vermilion (#FF5722) for accents."*

Now Claude reads that constraint before every edit.

---

## Step 5 in detail: the taste muscle

This is the part that takes the longest, and it's not technical.

**Taste is the ability to look at a page and know what's wrong** — not why, just *that* something is wrong, and which thing. Color, padding, type hierarchy, button proportions, whitespace rhythm.

Claude will write you a frontend that's 95% there. Your job is the last 5%. That's where good products separate from generic ones.

### How to build it

1. **Pick 10 sites you love.** Not "good" sites — sites you'd be proud to ship. Examples to start: linear.app, stripe.com, vercel.com, framer.com, attio.com, raycast.com, anthropic.com.

2. **For each one, write down 3 specific things they did right.** Not "it looks clean." Specific: *"hero headline is 96px, sub-headline is 24px, the gap between them is exactly the height of the sub-headline."*

3. **When you're building, reference those choices.** *"Make the hero like Linear's homepage — big headline, smaller sub, lots of vertical space."*

4. **Notice when something feels off in your own work.** Don't ignore the feeling. Pause. Open the site you compared to. Find the difference. Tell Claude to match it.

### A starter taste checklist

When you look at a hero you just generated, ask:

- **Type hierarchy:** is there one obvious focal point? (Headline > sub > body > caption)
- **Whitespace:** does the eye have room to rest, or is everything packed?
- **Color:** are you using more than 2-3 colors? (You shouldn't be, in most cases.)
- **Button proportions:** is the CTA the right size relative to the headline? (Too small = ignored. Too big = desperate.)
- **Alignment:** is everything on a grid, or is something slightly off?
- **Consistency:** do similar elements look similar? (All buttons same shape, all cards same padding.)

If any of those answers is "no," that's a Step 4 prompt waiting to happen.

---

## The bigger shift (the actual reason this works)

Frontend used to be a craft skill. You learned CSS by reading specs. You learned React by building todo apps for six months. You learned design by squinting at sites you wished you'd built. The barrier was real and it was high.

Now Claude collapses the syntax layer. You don't learn CSS — you learn what good CSS looks like. You don't learn React — you learn what good UX feels like. The bar moved one level up: from *how to write it* to *how to recognize it*.

That's why taste is the new muscle. Anyone with taste plus Claude can ship a beautiful frontend in an afternoon. Anyone without taste will keep generating slop no matter how good the model gets.

The good news: **taste is teachable.** It's pattern recognition. Look at enough good work, notice enough patterns, and you start seeing them everywhere — including in your own work. That's the loop to optimize for.

---

## What to ship today

By the end of Day 2, you should have:

- A Next.js app running on `localhost:3000`
- A home page with a hero, features, and a footer
- Working styling (Tailwind, no broken layouts)
- 3+ iteration prompts you wrote yourself ("make this bigger," "change this color," etc.)
- A list of 3-5 sites you want to steal taste from

You don't need it to look perfect. You need it to *exist.*

---

## Day 3 preview

Tomorrow: backend. The brain. The part that stores users, processes payments, talks to the database. We use Supabase + Next.js together — full stack in 15 minutes.

The reel drops at 9am ET. Follow [@ImplexaAI](https://instagram.com/implexaai) so you don't miss it.

---

## Get the rest of the series

- **Day 1** — Get your tools right (Claude Code, Pro, Vercel, GitHub) → [implexa.ai/guides/day-1](https://implexa.ai/guides/day-1)
- **Day 2** — Frontend, demystified ← *you are here*
- **Day 3** — Backend, demystified → drops tomorrow
- **Day 4** — Git is your time machine
- **Day 5** — Deployment, the magic moment
- **Day 6** — Ship day: end-to-end

DM [@ImplexaAI](https://instagram.com/implexaai) your live URL on Day 6 and I'll look at every single one.
