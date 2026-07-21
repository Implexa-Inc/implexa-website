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
- **Status:** `IN-REVIEW` — PR open since 2026-07-15. **Six days waiting on a human
  merge as of 2026-07-21.** `/blog/sitemap.xml` still returns 404 in production.
  https://github.com/Implexa-Inc/implexa-website/pull/67
- **2026-07-21 re-verify:** blog filter is *still* 0 clicks / 0 impressions / position 0
  over the trailing 28 days. Third consecutive week dark. But see row 4 — this run found
  that the unread sitemap is a **symptom**, not the root cause, and merging #67 alone
  will probably not switch the blog back on.
- **What:** adds `src/app/blog/sitemap.ts` (a ~5KB, 30-URL `/blog/sitemap.xml` with
  `revalidate = 3600`, advertised in `robots.txt`) and puts a "Blog" link in the
  site-wide footer so the homepage gives the posts a crawl path. The 3.4MB root
  sitemap is deliberately left untouched.
- **Why it is the top row — re-verified 2026-07-20, and it got worse:**
  - Root sitemap last read by Google **Jun 2, 2026 — 48 days ago**. Still the only
    submitted sitemap; `/blog/sitemap.xml` still 404s in production.
  - That sitemap is **3.4MB / 20,216 URLs, of which 20,000 (98.9%) are
    auto-generated `/s/*` catalog pages.** The 32 blog posts are 0.16% of the file
    and the 5 `/resources/` pages are 0.02%. Editorial content is a rounding error
    inside a document Google re-reads about every seven weeks.
  - Trailing 28 days, `Page: contains implexa.ai/blog/` → **0 clicks, 0 impressions,
    position 0.** The `/resources/` filter returns **0/0 as well**. Both editorial
    sections are completely dark, not merely low.
  - Trailing 3 months, the same blog filter returns 1 click / 349 impressions at
    **average position 38.7**, and the daily chart shows every one of those
    impressions clustered in late May, flatlining to zero from roughly Jun 10 on.
    The blog did not decline; it switched off, and it switched off right after the
    last sitemap read.
  - Site-wide 28d is 3 clicks / 3.36K impressions / 0.1% CTR. Effectively all of it
    lands on `/s/clawhub/*` catalog pages.
- **Acceptance:** after merge, `curl -so /dev/null -w '%{http_code}' https://implexa.ai/blog/sitemap.xml`
  returns `200` (it returns `404` today).
- **Blocked on a human, two steps:** (1) merge PR #67 — it is green and mergeable,
  nothing is wrong with it; (2) in Search Console go to Sitemaps and submit
  `blog/sitemap.xml`, which triggers the first read instead of waiting on a crawler
  that has not returned in 48 days. The cron deliberately does not submit sitemaps.
- **Source:** `implexa-weekly-seo-aeo` runs 2026-07-18 and 2026-07-20, Step 1 GSC pull.
- **Note:** this is a CODE row, so it never auto-merges. The 2026-07-20 run declined
  to publish an article for the second week running, on the grounds that a 33rd post
  would enter the same 20,216-URL file that has not been read since Jun 2. Content
  work on this site is gated behind this merge, and the queue will keep declining to
  ship articles until it lands.

### 4. HELD — `/s/*` catalog pages are being rejected at scale (needs a founder call)

- **Status:** `HELD` — **not paused, awaiting a founder decision.** The fix is a code
  change that reverses an apparent product bet (the bulk catalog seed), so the cron
  deliberately did not write it unilaterally. Pick option (a) or (b) below and flip
  this row to `READY`; the next run will then open the PR for human review.
- **What the 2026-07-21 GSC pull found.** Page indexing report, sc-domain:implexa.ai:
  - **Indexed: 2,830. Not indexed: 8,300.** Of those, **8,198 are
    "Crawled - currently not indexed"** — Google fetched the page and decided it was
    not worth indexing. That is the classic thin/duplicate-content verdict.
  - **Every example URL in that bucket is `/s/clawhub/*`.** Sampled: ai-prompt-optimization-expert,
    outlook, zoho-support-claw, seo-blog-planner, how-to-use-agent, fl-dental-assistant,
    video-cli. All last crawled **Jul 11, 2026**.
  - First detected **May 25, 2026**; the bucket ramped from ~0 to 8.2K through early June
    and is still climbing. The blog went dark from roughly **Jun 10**. The two curves line up.
  - Meanwhile the root sitemap has not been read since **Jun 2 (49 days)**. So Google is
    actively crawling the mirror pages every week while ignoring the sitemap that
    carries the editorial content.
- **Why this outranks row 3 as the real problem.** The catalog pages are served
  `<meta name="robots" content="index, follow">` with a **self-referencing canonical**,
  while their `<meta name="description">` is the **upstream skill description copied
  verbatim** — including raw non-English text. Example, `/s/clawhub/meego-skill`:
  title `meego-skill: Claude skill | implexa`, description is the full Chinese Feishu/Meego
  blurb. The site is telling Google that 20,000 mirrored pages are original, index-worthy
  documents. Google has crawled ~11K of them and rejected 8,198.
  That is a **site-level quality signal**, and the 32 genuine articles inherit it. Merging
  PR #67 gives the blog a crawl path but does not fix the reason the crawler stopped valuing
  the domain.
- **Corroborating performance data (28d):** 3 clicks / 3.09K impressions / 0.1% CTR /
  position 6.5, and effectively **all of it is `/s/clawhub/*`**. The traffic that does land
  is junk-intent: top queries are raw API strings like `"/openapi/v2/media/upload/binary" runninghub`
  (17 impressions) and `"query_transfer_history" moviepilot`, i.e. developers hunting the
  upstream repo, not buyers. `/s/clawhub/meego-skill` holds **position 3.0 on 139 impressions
  with 0 clicks** — ranking well for searches where a mirror is not what the searcher wanted.
  The brand query `implexa` drew **1 impression at position 82** in the same window.
- **The founder call — two options, real tradeoff:**
  - **(a) `noindex, follow` the `/s/*` pages.** Formalizes what Google already decided for
    8,198 of them, drops the thin-page mass off the domain, keeps the pages live for users
    and keeps link flow. **Cost:** gives up the 2,830 currently indexed and the 3 clicks/28d.
  - **(b) Point the canonical at the upstream source.** Keeps the pages crawlable and honest
    about where the original lives. **Cost:** cedes the ranking to the source; slower to take
    effect than (a).
  - A hybrid is possible (index only catalog entries carrying original implexa content such
    as a real SkillRank score or run data; noindex the pure mirrors), but that needs a rule
    for "original enough" that only the founder can set.
- **Acceptance (once a direction is chosen):** for option (a),
  `curl -s https://implexa.ai/s/clawhub/meego-skill | grep -c 'noindex'` returns ≥ 1, and the
  "Crawled - currently not indexed" bucket trends down from 8,198 over the following weeks.
- **Source:** `implexa-weekly-seo-aeo` run 2026-07-21, Step 1 GSC pull (Performance +
  Page indexing reports, live via Chrome).
- **Note:** this is a CODE row, so it never auto-merges. The cron also declined to publish an
  article this run — the **third** week running. Shipping post #33 into a domain where Google
  is rejecting 8,198 pages as not-worth-indexing would not get read either.

---

<!--
  Add a new ship row by appending a `### N. READY — <title>` block with: Status,
  What (exact file + change), Acceptance (grep-checkable test), Source (the
  BOARDROOM_LOG round). READY code rows get a human-review PR; they never
  auto-merge.
-->
