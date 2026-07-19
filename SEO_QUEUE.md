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
  auto-merge. Needs a human. **Conflict resolved 2026-07-19** (see below).
- **What:** adds `src/app/blog/sitemap.ts` (a ~5KB, 31-URL `/blog/sitemap.xml`
  with `revalidate = 3600`, advertised in `robots.txt`) and puts a "Blog" link
  in the site-wide footer so every page gives the posts a crawl path. The 3.3MB
  root sitemap is deliberately left untouched so the ~20k already-discovered
  catalog URLs do not regress. Two confirmed causes, one fix each:
  1. The root sitemap is one 3.3MB / ~20,212-entry file (~99% auto-generated
     `/s/` catalog pages). GSC: submitted May 20, **last read Jun 2**, still not
     re-read. 26 of 31 posts were published inside that gap. URL inspection on
     `/blog/claude-code-hooks` returns "URL is unknown to Google" / "No
     referring sitemaps detected" — never crawled.
  2. The blog was orphaned: only `/resources` and `/claude-skills` linked to it,
     so the homepage had no crawl path to any post.
- **Acceptance:** after merge, `curl -s https://implexa.ai/blog/sitemap.xml | grep -c "<loc>"`
  == 31, and `curl -s https://implexa.ai/ | grep -c 'href="/blog"'` >= 1.
  Both fail today (`/blog/sitemap.xml` is 404; the homepage has 0 blog links).
- **Re-verified 2026-07-19** (weekly SEO cron, live GSC + live SERP):
  - `site:implexa.ai/blog` returns **"did not match any documents"**. This is
    stronger than the 2026-07-18 reading of "0 impressions": the posts are not
    ranking-but-unseen, they are **not in the index at all**. Same for
    `site:implexa.ai/guides` and `site:implexa.ai/resources`.
  - The homepage IS indexed and crawled, and `curl https://implexa.ai/ | grep -c 'href="/blog'`
    returns **0**. That closes the causal chain: Google reaches the site, and
    from there has no link to follow into any post.
  - 28d totals: 3.7K impressions, 3 clicks, 0.1% CTR, avg position 6.4. Every
    ranking URL is `/s/clawhub/*`. Only 11 queries clear GSC's anonymity
    threshold (~35 impressions of the 3.7K), and the visible ones are literal
    API strings such as `"/openapi/v2/media/upload/binary" runninghub`. That is
    long-tail string-matching against mirrored SKILL.md text, not demand for
    the product.
- **Why this stayed unmerged for 4 days:** the PR was `mergeable: CONFLICTING`.
  Its `SEO_QUEUE.md` hunk added a row 3 that a later cron run had already
  committed to `main` in different words, so the two collided and GitHub's merge
  button was dead. Nothing was wrong with the code. Resolved 2026-07-19 by
  merging `origin/main` into the branch and folding both descriptions into this
  single row. **The PR is now mergeable and still needs a human merge.**
- **Source:** weekly SEO cron 2026-07-15, re-verified 2026-07-18 and 2026-07-19.
- **Human follow-up AFTER merge (the cron deliberately does not do this):**
  Search Console → Sitemaps → Add a new sitemap → `blog/sitemap.xml`, which
  triggers the first read instead of waiting on the crawler. Then re-check
  `/blog/` impressions in 1-2 weeks. See row 4: this fix is necessary but,
  on current evidence, may not be sufficient on its own.

### 4. READY — Crawl budget is being spent on 8,198 pages Google then rejects
- **Status:** `READY` for a human decision. **Deliberately no PR.** The fix is a
  strategic call with real downside, so the cron is not choosing it unilaterally.
- **What the data says (GSC Page indexing report, pulled 2026-07-19):**
  - **Indexed: 2,830. Not indexed: 8.3K.** The dominant bucket is
    **"Crawled - currently not indexed": 8,198 pages.** Googlebot fetched those
    URLs, evaluated them, and declined to index them. At that volume it is the
    standard signature of thin or near-duplicate templated content.
  - Every indexed URL is a `/s/` catalog page. Homepage aside, no editorial page
    (`/blog`, `/guides`, `/resources`) is indexed.
  - **The counter-example that matters:** `/resources` IS linked from the
    homepage and is STILL not indexed. So a homepage link, which is exactly what
    PR #67 adds for the blog, has already been shown to be insufficient on this
    domain. That is the evidence that crawl budget, not just discovery, is a
    binding constraint, and it is why row 3 alone may not be enough.
- **Why it is not actioned automatically:** the obvious levers all carry risk
  the cron should not take unsupervised. `noindex` on low-value catalog pages
  could drop the 2,830 currently-indexed URLs that produce the site's only 3
  clicks; pruning or consolidating the catalog is a product decision about what
  `/s/` is for, not an SEO edit. Options worth weighing, cheapest first:
  1. Ship row 3, submit the blog sitemap, and measure for 2 weeks first. The
     blog is only 31 URLs; it may well fit inside the leftover budget.
  2. `noindex, follow` the catalog pages with no enrichment and no SkillRank,
     keeping the enriched ones indexed. Preserves link equity, cuts the thin tier.
  3. Gate `/s/` page generation on a quality threshold so the catalog stops
     growing faster than it earns indexation.
- **Acceptance:** whichever option is chosen, "Crawled - currently not indexed"
  trends down from 8,198 while "Indexed" does not fall below 2,830.
- **Source:** `implexa-weekly-seo-aeo` run 2026-07-19, GSC Page indexing report
  plus live `site:` SERP checks.

---

<!--
  Add a new ship row by appending a `### N. READY — <title>` block with: Status,
  What (exact file + change), Acceptance (grep-checkable test), Source (the
  BOARDROOM_LOG round). READY code rows get a human-review PR; they never
  auto-merge.
-->
