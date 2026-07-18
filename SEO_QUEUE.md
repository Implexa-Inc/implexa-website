# SEO_QUEUE — board → execution drain backlog

This file is the bridge the boardroom kept asking for. The only channel that
fires reliably every day (`implexa-weekly-seo-aeo`) reads this file as **Step 0
of every run** and actions the rows that are READY. That turns a board decision
from an inert prose line in `boardroom/BOARDROOM_LOG.md` into a shipped (or
human-reviewable) artifact, automatically.

## How the cron drains this file

On each run, the cron reads this file first and, **top to bottom**, handles rows
by their status tag:

- `READY` — action it this run. **Code/component edits open a PR for HUMAN
  review and are NOT auto-merged** (only markdown content publishes via the
  auto-merge path). After opening the PR, flip the row to `IN-REVIEW` and write
  the PR URL into the row, then commit this file with that change.
- `HELD` — **do nothing.** A human paused it on purpose. Never action a HELD row,
  even if it looks trivial. Leave it exactly as is.
- `IN-REVIEW` — a PR is already open; do nothing until it merges or is closed.
- `DONE` — already shipped; skip. Kept for provenance.

Convention (the durable rule): a board ship decision is **not done** until it is
a row in this file. A decision that lives only as a prose line in BOARDROOM_LOG
is, by construction, inert.

---

## Rows

### 1. HELD — Hero headline inversion (W1)
- **Status:** `HELD` — founder paused 2026-06-13. Do NOT action.
- **What:** In `src/components/hero-headline.tsx`, `HeadlineA()` (the SSR primary)
  to the locked inversion "Building with AI got easy. Running your business with
  it didn't.", fix the false `:8` comment that already claims this is live, demote
  "Build and run powerful agents", and route the hero CTA to `/built-with-ai`.
- **Acceptance:** `grep -c "Running your business" src/components/hero-headline.tsx`
  ≥ 2 with a real `<span>` (currently 1, comment-only).
- **Source:** STANDING P0-1, BOARDROOM_LOG rounds through 2026-06-13 06:02 PDT.
- **Note:** Left HELD at the founder's explicit instruction. Un-hold by changing
  the status tag to `READY`.

### 2. DONE — funnel_event + intent_id mint at the hero CTA (D2)
- **Status:** `DONE` — shipped by hand 2026-06-13 (in-session, not via cron).
- **What:** `src/components/hero-build-box.tsx` `build()` now mints a stable
  `intent_id` (crypto.randomUUID) at the first funnel step, fires
  `track("funnel_event", { step: "hero_cta_build", intent_id })` via the
  already-mounted Vercel `<Analytics/>`, and carries `&intent_id=` across the
  origin hop to `app.implexa.ai/signup`.
- **Acceptance:** `grep -c "funnel_event" src/components/hero-build-box.tsx` ≥ 1
  (now 1). intent_id present in the signup redirect URL.
- **Source:** SEO_QUEUE row 2 / BOARDROOM_LOG 06:02 PDT CPO2.
- **Follow-up (separate repo, NOT this queue):** the `app.implexa.ai` signup page
  should read `?intent_id=` and use it as the dedup key on the build run-request.

### 3. IN-REVIEW — make the blog discoverable (dedicated sitemap + footer link)
- **Status:** `IN-REVIEW` — PR open and green since 2026-07-15, awaiting a human merge.
  https://github.com/Implexa-Inc/implexa-website/pull/67
- **What:** adds `src/app/blog/sitemap.ts` (a ~5KB, 30-URL `/blog/sitemap.xml` with
  `revalidate = 3600`, advertised in `robots.txt`) and puts a "Blog" link in the
  site-wide footer so the homepage gives the posts a crawl path. The 3.5MB root
  sitemap is deliberately left untouched.
- **Why it is the top row:** re-verified live in Search Console on 2026-07-18.
  The root sitemap was last read by Google on **Jun 2, 2026**, 46 days ago, and
  `/blog/sitemap.xml` still returns 404 in production. The 31 blog URLs do sit in
  the root sitemap, so they are not missing, just never re-read. Over the trailing
  28 days the `Page: /blog/` filter returns **0 rows**: no impressions, no clicks,
  no position, across all 31 posts. Every one of the site's 4.07K impressions lands
  on auto-generated `/s/clawhub/*` catalog pages at 0.1% CTR.
- **Acceptance:** after merge, `curl -so /dev/null -w '%{http_code}' https://implexa.ai/blog/sitemap.xml`
  returns `200` (it returns `404` today).
- **Blocked on a human, two steps:** (1) merge PR #67; (2) in Search Console go to
  Sitemaps and submit `blog/sitemap.xml`, which triggers the first read instead of
  waiting on the crawler. The cron deliberately does not submit sitemaps itself.
- **Source:** `implexa-weekly-seo-aeo` run 2026-07-18, Step 1 GSC pull.
- **Note:** this is a CODE row, so it never auto-merges. Until it lands, publishing
  another article mostly adds to the pile Google cannot see.

---

<!--
  Add a new ship row by appending a `### N. READY — <title>` block with: Status,
  What (exact file + change), Acceptance (grep-checkable test), Source (the
  BOARDROOM_LOG round). READY code rows get a human-review PR; they never
  auto-merge.
-->
