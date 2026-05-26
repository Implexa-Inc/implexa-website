# SEO + AEO Setup

Operator runbook for the SEO/AEO infrastructure landed in `feat/seo-aeo-infrastructure`. Do these steps once, after the branch merges, to light up indexing across Google + Bing + AI assistants.

## Required env vars (Vercel project settings)

| var | value | scope |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://implexa.ai` | Production only. Preview deploys can leave it unset; the code falls back to the prod URL so canonical tags + sitemap stay correct (and preview deploys aren't supposed to be indexed). |
| `GSC_VERIFICATION_CODE` | The `content=` value from Google Search Console's HTML-tag verification flow. | Production only. |
| `BING_VERIFICATION_CODE` | The `content=` value from Bing Webmaster Tools' HTML-tag verification flow. | Production only. |
| `IMPLEXA_API_URL` | `https://core.implexa.ai` | All. Already set. |
| `IMPLEXA_PUBLIC_SEARCH_TOKEN` | The public read-only token. | All. Already set. Required for the sitemap + related-skills rail to populate. |

After setting the verification vars, redeploy so the meta tags render, then verify in the GSC/Bing dashboards.

## Backend dependency

This branch's sitemap and related-skills rail call two new MCP tools on the backend:

- `list_aggregated_skills`: paginated catalog list for the sitemap
- `get_related_skills`: semantic neighbors for the rail

Both ship on backend branch `feat/seo-aeo-mcp-tools`. Merge + deploy that branch before merging this one, or the sitemap will degrade to 5 static entries and the related-skills rail will render empty. The website still builds and serves correctly without the backend tools, just with reduced SEO coverage.

## Google Search Console setup

1. Open https://search.google.com/search-console.
2. Add property → `implexa.ai` (URL prefix, NOT domain, since domain mode requires DNS).
3. Pick "HTML tag" verification.
4. Copy the `content=` value from the suggested meta tag.
5. Set `GSC_VERIFICATION_CODE=<that value>` in Vercel env (production).
6. Redeploy. Hit the homepage, view source, confirm the `<meta name="google-site-verification" content="...">` tag is present.
7. Back in Search Console, click "Verify".
8. Submit the sitemap: Sidebar → Sitemaps → enter `sitemap.xml` → Submit. Should report "Success" within a few minutes.
9. (Optional, recommended) Request indexing on the homepage + `/resources/ambient-cross-vendor-recommender` via URL Inspection → "Request Indexing". Speeds up initial crawl by hours/days.

## Bing Webmaster Tools setup

1. Open https://www.bing.com/webmasters.
2. Add site → `https://implexa.ai`.
3. Pick "HTML meta tag" verification.
4. Copy the `content=` value.
5. Set `BING_VERIFICATION_CODE=<that value>` in Vercel env.
6. Redeploy, view source, confirm `<meta name="msvalidate.01" content="...">` is present.
7. Hit "Verify" in Bing Webmaster.
8. Submit sitemap: Sitemaps → Submit `https://implexa.ai/sitemap.xml`.

**Why Bing matters for AEO:** Perplexity, ChatGPT Search, and several other AI assistants source their crawl index from Bing. Indexing on Bing is a prerequisite for being citable by those assistants.

## Validation checklist

After deploy:

```bash
# Sitemap reachable and well-formed
curl -sS https://implexa.ai/sitemap.xml | head -20
# Should show <?xml...> + <urlset> + many <url> entries (~11k once backend MCP tools land)

# llms.txt + llms-full.txt resolve
curl -sS https://implexa.ai/llms.txt | head -30
curl -sS https://implexa.ai/llms-full.txt | head -30

# RSS feed
curl -sS https://implexa.ai/resources/feed.xml | head -30

# robots.txt references sitemap
curl -sS https://implexa.ai/robots.txt
# Expect: User-agent: * / Allow: / / Sitemap: https://implexa.ai/sitemap.xml

# JSON-LD on a detail page
curl -sS https://implexa.ai/s/anthropic/skills-claude-api | grep -o 'application/ld+json' | head
# Should print at least 2 hits: one site-wide, one page-specific
```

### Rich Results Test

For each of the three classes of page, paste the URL into Google's tester (https://search.google.com/test/rich-results):

1. **Homepage**: https://implexa.ai. Expect `Organization`, `WebSite`, `SearchAction`.
2. **Skill detail**: https://implexa.ai/s/anthropic/skills-claude-api. Expect `SoftwareApplication`, `BreadcrumbList`. (After SkillScore chip merges, also `Review` + `AggregateRating`.)
3. **Resource post**: https://implexa.ai/resources/ambient-cross-vendor-recommender. Expect `Article`, `BreadcrumbList`.

Each should report "Page is eligible for rich results" with zero errors.

### Sitemap XML validation

```bash
curl -sS https://implexa.ai/sitemap.xml | xmllint --noout - && echo VALID
```

Or paste the URL into https://www.xml-sitemaps.com/validate-xml-sitemap.html.

## Ongoing operations

- New cornerstone post → list automatically appears in `/llms.txt`, `/llms-full.txt`, `/resources/feed.xml`, and `/sitemap.xml` on the next revalidation pass (~1 hour). No manual action needed.
- Backend crawls a new batch of skills → those URLs appear in `/sitemap.xml` after the next daily revalidation. Google re-crawls the sitemap on its own schedule from there.
- If you want to force a re-index of a specific page → URL Inspection in GSC → "Request Indexing". Use sparingly (rate-limited).

## Why each piece exists

| file | what it does |
|---|---|
| `src/lib/site.ts` | Centralizes `SITE_URL` + brand constants. Single point of edit if we rebrand or change domain. |
| `src/lib/jsonld.ts` | Composable schema.org builders. Returns raw objects so pages can graph them with whatever else exists (notably the SkillScore chip's Review schemas). |
| `src/lib/skill-catalog.ts` | Server-only helpers that call backend MCP tools for sitemap walk + related-skills rail. Degrades to empty on failure. |
| `src/app/sitemap.ts` | Dynamic sitemap: static pages + resources + every active skill detail. Cached daily. |
| `src/app/robots.ts` | Dynamic robots, points at SITE_URL/sitemap.xml. |
| `src/app/llms.txt/route.ts` | llmstxt.org-spec AEO surface for AI crawlers. |
| `src/app/llms-full.txt/route.ts` | Full-text companion: every cornerstone inlined for deep crawling. |
| `src/app/resources/feed.xml/route.ts` | RSS 2.0 feed for /resources. |
| `src/app/s/[source]/[slug]/opengraph-image.tsx` | Dynamic 1200×630 PNG per skill, branded implexa-dark. |
| `src/app/scores/page.tsx` | Stub leaderboard page so the route exists for sitemap day 1. SkillScore chip replaces the body. |

## Known gaps + future work

- **Author profiles** (`/u/<handle>`) are currently `robots: { index: false }` because the wiki layer (P3.2) isn't live yet. Flip back to indexed once real karma + authored-skills data populates.
- **Scores leaderboard** (`/scores`) is a stub. SkillScore chip will replace the body with a real top-N list; the JSON-LD ItemList will populate at that point.
- **Image sitemap** entries (separate `<image:loc>` tags) not emitted yet. Could add once we have meaningful per-skill images beyond the OG cards.
- **OG image fonts** use system fallback. Add a custom font (Inter or Geist) once we want pixel-perfect rendering across platforms.

## Coordinate with SkillScore chip

When `feat/skillscore-tier-1-2` (the SkillScore chip) merges, the detail page JSON-LD graph needs the SkillScore chip's `Review` + `AggregateRating` schemas spread into the same `jsonLdGraph(...)` call in `src/app/s/[source]/[slug]/page.tsx`. The helper is variadic so this is a one-line merge.
