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

### 3. IN-REVIEW — Blog is invisible to Google: sitemap never re-read + orphaned (W3)
- **Status:** `IN-REVIEW` — PR https://github.com/Implexa-Inc/implexa-website/pull/67
  opened 2026-07-15 by the weekly SEO cron. Code change, so it does NOT
  auto-merge. Needs a human.
- **What:** The blog has 30 posts and 0 impressions / 0 clicks over 28 days.
  Two confirmed causes, one fix each:
  1. The root sitemap is one 3.3MB / ~20,212-entry file (~99% auto-generated
     `/s/` catalog pages). GSC: submitted May 20, **last read Jun 2**, still
     not re-read as of Jul 15. 26 of 30 posts were published inside that
     43-day gap. URL inspection on `/blog/claude-code-hooks` returns "URL is
     unknown to Google" / "No referring sitemaps detected" — never crawled.
     → Added `src/app/blog/sitemap.ts` (`/blog/sitemap.xml`, 30 URLs, ~5KB,
     revalidate 3600) + advertised it in `robots.txt`. Root sitemap left
     untouched so the ~20k already-discovered catalog URLs don't regress.
  2. The blog was orphaned: only `/resources` and `/claude-skills` linked to
     it, so the homepage had no crawl path to any post ("Referring page: None
     detected"). → Added "Blog" to the site footer (renders on every page).
- **Acceptance:** `curl -s https://implexa.ai/blog/sitemap.xml | grep -c "<loc>"`
  == 30, and `curl -s https://implexa.ai/ | grep -c 'href="/blog"'` >= 1.
- **Source:** weekly SEO cron 2026-07-15, GSC performance + index + URL
  inspection. Supersedes "write another article" for this surface.
- **Human follow-up AFTER merge (the cron cannot do this):** submit the new
  sitemap in Search Console → Sitemaps → Add a new sitemap → `blog/sitemap.xml`.
  Then re-check `/blog/` impressions in 1-2 weeks. Until this is submitted and
  read, publishing more articles has no measurable effect.

---

<!--
  Add a new ship row by appending a `### N. READY — <title>` block with: Status,
  What (exact file + change), Acceptance (grep-checkable test), Source (the
  BOARDROOM_LOG round). READY code rows get a human-review PR; they never
  auto-merge.
-->
