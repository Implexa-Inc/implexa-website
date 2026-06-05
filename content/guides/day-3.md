---
title: "Day 3 — Backend, Demystified"
slug: "day-3"
description: "The 5-step Day 3 flow from the @ImplexaAI build-solo series. What backend actually is. Why you rent it in 2026 instead of building it. Supabase + Stripe + Resend = 200 lines of glue. The new gatekeeping skill: knowing what to compose."
publishedAt: "2026-05-26"
day: 3
reelHook: "backend"
tags: ["day-3", "backend", "supabase", "stripe", "auth", "payments", "solo-founder"]
---

# Day 3 — Backend, Demystified (Implexa AI Guide)

*Part of the 7-day "ship a real app this week" series. Day 3 of YOU building a $Bn company, solo.*

---

## TL;DR (the 5 moves — do them in this order)

1. **Understand what backend actually is** (60 seconds — the brain, the part users can't see)
2. **Add Supabase to your Next.js app via Claude** (3 minutes — one prompt, database + auth + storage all wired)
3. **Add Google sign-in via Claude** (2 minutes — the "build your own auth" advice is from 2018)
4. **Add Stripe checkout + customer portal via Claude** (5 minutes — webhook + success page + portal)
5. **Stop renting** (lifelong — know when a managed service ends and a custom server begins)

Total time from "no backend" to "users can sign up, pay, and you can email them": **~15 minutes.**

**The thing nobody tells you:** in 2026, you don't BUILD a backend. You RENT one. Supabase rents you the database + auth. Stripe rents you payments. Resend rents you email. Your backend is ~200 lines of glue code connecting these services. The "rolling your own" advice is a decade out of date.

---

## What backend actually is

Backend is the part of the app users **can't see but rely on.** The database that stores their account. The API that processes their payment. The auth system that knows who's logged in. The job queue that sends them email.

Frontend (Day 2) is the **face** — what users see and tap. Backend is the **brain** — what stores, decides, and remembers.

You need both. They talk over HTTP requests. The frontend calls the backend, the backend reads/writes the database, the backend returns data, the frontend renders it. That whole loop is your app.

### Why backend used to be scary

A year ago, "building a backend" meant:

- Spinning up a Postgres database
- Writing migrations + schema
- Building an auth system (signup, login, password reset, email verification, OAuth, session management)
- Wiring payment processing (Stripe webhooks, subscription state, invoices, customer portals)
- Setting up email infrastructure (SMTP, deliverability, bounces, unsubscribe)
- Securing all of it (rate limiting, CSRF, SQL injection, RLS)

Months of work. Real backend engineers got paid a lot of money because all of it was genuinely hard.

### Why backend isn't scary now

Every one of those problems is a SOLVED problem with a managed service. You don't write auth — you call Supabase's auth SDK. You don't write payments — you call Stripe's checkout SDK. You don't write email infra — you call Resend's send-email endpoint.

The skill shifted from "writing the system" to "wiring up the services." Way easier.

---

## The stack you'll actually use

Pick once and stop researching. The 2026 standard for new solo SaaS backends:

- **Supabase** — Postgres database + auth + storage + edge functions. The standard.
- **Stripe** — payments. Stripe checkout + customer portal handle 99% of solo-founder needs.
- **Resend** — transactional email. Modern, reliable, great DX.
- **Next.js API routes** — the "code" of your backend. Lives in the same Next.js project as your frontend (Day 2).

That's it. Four services. No custom server. Deploys entirely on Vercel.

**What about a custom backend server?** You only need one if you're building a Discord bot, a long-running agent loop, a websocket service, or a Python ML app. For everything else — SaaS, internal tools, marketplaces, content sites — the above stack covers it. *(If you do need a custom server, that's a Week 2 topic — Railway and Fly.io are the standards.)*

---

## Step 2 in detail: spinning up Supabase via Claude

Open Claude Code in your Next.js project (the one you created on Day 2).

**The prompt:**

> *"add Supabase to my Next.js app"*

That's the whole prompt. Claude will:

1. Run `npm install @supabase/supabase-js`
2. Create `lib/supabase.ts` with the client wired up
3. Create `supabase/migrations/0001_init.sql` with a `users` table
4. Tell you what env vars to add to `.env.local`

You then go to [supabase.com](https://supabase.com), create a project, copy two env vars (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) into your `.env.local`, and you're done. Database is live.

**Common gotchas:**

- **RLS (Row Level Security) errors** — Supabase tables have RLS *enabled by default*. New tables won't be readable until you write a policy. If you're seeing empty results from queries that should return data, ask Claude: *"add RLS policies so logged-in users can read their own rows."*
- **Service role key vs anon key** — There are two API keys. The anon (publishable) key goes in `.env.local` with `NEXT_PUBLIC_` prefix (safe to expose). The service role key is admin-level and ONLY belongs in server-side env vars (no `NEXT_PUBLIC_`, never bundled into the frontend). Don't mix them up.
- **Local dev vs production** — Your `.env.local` works on your laptop. For deployment, set the same env vars in Vercel's dashboard. Claude won't remind you to do this.

---

## Step 3 in detail: Google sign-in via Claude

With Supabase already wired up, ask Claude:

> *"add Google sign-in"*

Claude will:

1. Edit `lib/supabase.ts` to wire the OAuth provider
2. Create `app/auth/callback/route.ts` (the redirect endpoint Google calls after login)
3. Edit `app/login/page.tsx` to add the "Sign in with Google" button

You then go to Supabase's auth dashboard → Providers → Google, enable it, and paste your Google Cloud OAuth client ID + secret. Takes about 90 seconds in Supabase's UI.

**Common gotchas:**

- **Redirect URI mismatch** — Google's OAuth setup requires you to list authorized redirect URIs. The Supabase auth dashboard tells you the exact URL to paste. If you skip this, sign-in fails with "redirect_uri_mismatch." This is the most common Supabase auth bug.
- **The user table** — Supabase auth creates `auth.users` automatically. Your app probably needs `public.users` (a separate table you can join on) — ask Claude *"add a trigger that copies auth.users into public.users on signup"* and it'll write the SQL for you.
- **Local dev callback URL** — for local testing, you also need `http://localhost:3000/auth/callback` in Google's authorized URIs. Most people forget this and assume Supabase isn't working when it actually is — they just can't sign in on their laptop.

### Other auth providers worth knowing

- **Magic links** — passwordless, sends a sign-in link to the user's email. Easier than OAuth. Add it with *"add magic link auth via Supabase."*
- **GitHub OAuth** — if your users are devs.
- **Email + password** — if you want classic signup. Supabase handles password reset + email verification for you.

**My take:** Google for consumer apps, GitHub for dev tools, magic links if you want the lowest-friction onboarding. Pick one. Add more only when users ask.

---

## Step 4 in detail: Stripe checkout via Claude

The prompt:

> *"add a Stripe $10/mo plan with checkout and customer portal"*

Claude will:

1. Run `npm install stripe @stripe/stripe-js`
2. Create `app/api/checkout/route.ts` — creates a Stripe Checkout Session when a user clicks "Subscribe"
3. Create `app/api/webhook/route.ts` — handles Stripe events (subscription created, canceled, payment succeeded). **Signature-verified** so random people can't fake events.
4. Create `app/billing/page.tsx` — links to Stripe's hosted customer portal where users manage their subscription

You then go to Stripe's dashboard, create a product + price, copy the price ID into a constant, and set three env vars in `.env.local`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PRICE_ID`.

**Common gotchas:**

- **The webhook secret thing** — when you set up the webhook endpoint in Stripe's dashboard, it gives you a webhook secret (`whsec_...`). This is DIFFERENT from your API secret key. You need both. Most beginners use the API key for webhook verification and wonder why all events fail signature checks.
- **Local webhook testing** — Stripe events go to a public URL. For local dev, install the Stripe CLI (`brew install stripe/stripe-cli/stripe`) and run `stripe listen --forward-to localhost:3000/api/webhook`. The CLI gives you a temp webhook secret. Paste that into `.env.local` while testing.
- **Customer portal config** — by default Stripe's customer portal is locked down. Go to Stripe Dashboard → Settings → Billing → Customer portal, enable the features you want (cancel subscription, update payment method, view invoices). Otherwise the portal is empty and users complain.
- **Subscription state in your database** — the webhook is where you update YOUR database with subscription status. Don't trust the frontend. Ask Claude *"in the webhook handler, update the public.users table with the user's subscription status."*

### Lemon Squeezy alternative

If you're selling to international customers and don't want to deal with VAT/sales tax compliance, **Lemon Squeezy** acts as a "merchant of record" — they collect the tax for you. Same SDK shape as Stripe, slightly different webhooks. Trade-off: higher fees (5% + 50¢ vs Stripe's 2.9% + 30¢). For most solo-founder SaaS launches, the fee diff doesn't matter — pick Lemon Squeezy if you don't want a CPA in your life.

---

## Step 5 in detail: the glue stack

Once Supabase + Stripe are wired, the rest of your "backend code" is just glue connecting them:

- **Resend for email** — `npm install resend`, ask Claude *"add Resend for transactional email, with a 'welcome' template for new signups."*
- **PostHog / Plausible for analytics** — *"add PostHog for product analytics with the events: signup, subscribe, churn."*
- **Cloudflare R2 for file storage** (cheaper than S3) — *"set up R2 for user file uploads, write the presigned URL flow."*

Each is a one-prompt add. The pattern is always: install SDK → wire to Next.js API route → set env vars → done.

### A starter `.env.local` for the full stack

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_ID=

# Resend
RESEND_API_KEY=

# (later) Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
```

Eight env vars. That's your entire backend's secret bundle.

---

## When to stop renting

There's exactly one case where you should stop renting and roll your own: **when the rented service can't do the thing.**

You'd write your own auth if your customers are enterprise and need SAML SSO with custom IdP config. You'd write your own payment system if you're literally a payment processor. You'd write your own email infrastructure if your product IS email (Substack, Mailchimp).

For everything else — including your first paid users, your first $1M ARR, your first 10k MRR — the rented stack scales. Notion, Linear, Cron.com, and a hundred other YC-backed companies are on Supabase. Stripe processes a meaningful fraction of all internet payments. Resend deliverability is excellent.

**The right answer for Day 3:** rent it all. Re-evaluate at $5M+ ARR or when a customer asks for something rented services can't provide. Until then, your time is worth more than your AWS bill is heavy.

---

## The bigger shift (the actual reason this works)

Backend used to be the gatekeeping skill for technical solo founders. You either had it or you didn't, and if you didn't, you either learned for a year or you hired someone for $150k.

The rented stack collapses both options. The skill you need now is *picking the right rented services and wiring them up.* That's a Tuesday afternoon, not a year of CS school.

The mental shift: **stop thinking of your backend as "code you write" and start thinking of it as "services you compose."** The "code" you write is glue — 200 lines connecting API endpoints, transforming data shapes, and handling the rare case the rented service doesn't cover.

If you spent Day 2 learning to describe frontends in plain English, Day 3 is learning to describe backends as plumbing diagrams. *"User clicks → Stripe checkout → webhook fires → update Supabase users table → Resend welcome email."* That's the plumbing. Claude writes the pipes. You direct.

The brain is rented. The face (Day 2) is yours. Spend your taste muscle on the face — that's where the product lives.

---

## What to ship today

By the end of Day 3, you should have:

- A Supabase project connected to your Next.js app
- A `users` table with RLS policies that work
- Google sign-in working at `/login`
- A Stripe checkout page that takes test cards
- A webhook updating your users' subscription status
- A customer portal at `/billing`
- A Resend integration that sends a welcome email on signup

You can sign up, pay, and receive email. You have a backend. You wrote zero auth code.

---

## Day 4 preview

Tomorrow: **git** — the time machine you'll need by Friday. Once your backend has real user data, you cannot afford to lose work. Git is how you don't.

(And yes — a separate Opus 4.8 deep dive is coming later this week. Follow `@implexaai` so you don't miss it.)

---

## Get the rest of the series

- **Day 1** — Get your tools right (Claude Code, Pro, Vercel, GitHub) → `implexa.ai/guides/day-1`
- **Day 2** — Frontend, demystified → `implexa.ai/guides/day-2`
- **Day 3** — Backend, demystified ← *you are here*
- **Day 4** — Git is your time machine → drops tomorrow
- **Day 5** — Deployment, the magic moment
- **Day 6** — Ship day: end-to-end

DM `@implexaai` your live URL on Day 6 — I look at every single one.
