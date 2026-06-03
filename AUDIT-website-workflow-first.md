# Implexa website audit: re-centering on workflows

**Date:** 2026-06-03
**Branch:** `audit/workflow-first-redo`
**Lens:** The product shifted from a skill catalog ("access 40,000+ verified AI skills") to a workflow engine ("Let AI run your business"). Workflows are now the hero: a workflow is a whole job, an ordered chain of skill/tool/decision steps with a verify gate, that runs on a schedule, delivers a result (email + dashboard), watches for misses (watchdog), and learns from outcomes. Skills are the ingredients workflows are built from, still 40k cross-vendor and ranked by SkillRank, but no longer the headline.

This audit asks of every surface: does it lead with workflows, or does it still lead with the skill catalog?

---

## TL;DR

The **homepage hero and the entire `/workflows` surface are already workflow-first and genuinely good.** Everything downstream of the hero still tells the old story. The pattern is consistent: the pitch (why you need Implexa) says "let AI run your business," but the product experience (what you actually browse, search, and read) is a skill marketplace. The site sells workflows and ships a skill catalog.

The single most damaging artifacts are the ones that define what Implexa *is* to both humans and machines:

- `src/lib/site.ts`: `SITE_TITLE = "implexa, google + wikipedia for SKILL.md"` (the global default title, OG alt text, and twitter card)
- `src/app/llms.txt/route.ts` and `.well-known/mcp.json`: the AEO surfaces tell every answer engine and MCP connector that Implexa is "google + wikipedia for SKILL.md ... agents call implexa for skill discovery"
- Homepage section 2: `"skills are the new web pages."` is the load-bearing narrative directly under the workflow-first hero, and it contradicts it.

None of the workflow loop's trust layer (verify gate, scheduled delivery, watchdog/miss-detection, remote-safety) is messaged anywhere outside the individual workflow detail pages. That loop is the one story no competitor can tell, and it is almost invisible.

---

## Section-by-section table

Legend: **KEEP** = already workflow-first. **REFRAME** = skill-first copy/IA that should lead with workflows. **NET-NEW** = a workflow-first thing that is missing.

### Global / chrome

| Surface | File | Current copy (quoted) | Leads with | Label | Note |
|---|---|---|---|---|---|
| Site title/desc constants | `src/lib/site.ts:18-20` | `"implexa, google + wikipedia for SKILL.md"` / `"cross-vendor skill graph for AI work. implexa watches you work and hands you the right skill at the right time."` | Skills | **REFRAME** | The global default title + OG alt. Propagates to every page that doesn't override. Top priority. |
| Header nav | `src/components/site-header.tsx:21-33` | order: `workflows`, `top skills`, `pricing`, `resources`, `install` | Mixed | **KEEP** (minor) | `workflows` is first, good. `top skills` is second and frames skills as a co-equal headline. Fine for now. |
| Footer | `src/components/site-footer.tsx:7-15` | `"implexa · skills ranked by SkillRank"` and footer nav: `top skills, resources, install, developers, github, llms.txt, x/twitter, privacy` | Skills | **REFRAME** | Footer tagline is skill-first and the footer nav has **no `workflows` link at all.** IA gap. |
| Root OG card | `src/app/opengraph-image.tsx` | inherits `SITE_TITLE` / `SITE_DESCRIPTION` | Skills | **REFRAME** | Fixed automatically once `site.ts` is reframed. |

### Homepage (`src/app/page.tsx`)

| Section | Lines | Current copy (quoted) | Leads with | Label |
|---|---|---|---|---|
| Hero | `219-236` | `"Let AI run your business."` / `"Implexa watches your AI work and turns your routines into agentic workflows."` / `"Launch with one command. Run on a schedule. Track outcomes."` / `"Available for Claude Code and Codex."` | Workflows | **KEEP** |
| Hero sub-pitch | `270-277` | `"Install ONE plugin. It watches what you repeat, stitches the right skills and tools into a workflow, and runs it unattended..."` | Workflows | **KEEP** |
| "how it works" loop strip | `296-320` | `watches what you repeat → stitches the right skills + tools → schedules it to run on its own → delivers the result to your inbox → improves with every run` | Workflows | **KEEP** (but incomplete: no verify gate, no watchdog/miss-detection, no learning-ranks-workflows) |
| Section 2 narrative | `342-376` | `"skills are the new web pages."` / `"Implexa is the search, the score, and the runtime for that graph. Skills are AI's web pages, and this is where you find the best ones."` | **Skills** | **REFRAME** (highest-impact single REFRAME on the site) |
| Section 2 catalog | `378-490` | `"40,000 skills indexed across 6 sources"`, `"trending this week"`, `"by category"`, `"recently indexed"` | Skills | **REFRAME** (it's a browse-the-catalog block; should be framed as the ingredient shelf, or lead with a workflow rail) |
| Section 3 features | `498-625` | `"what the implexa plugin gives you"` / four cards: `"ask mid-task, get a skill"`, `"ranked by quality + your workflow"`, `"turn your workflow into a reusable skill"`, `"run a skill without installing it"` | Skills | **REFRAME** (every card is a single-skill verb; none shows compose → schedule → deliver) |
| Section 4 wedge | `633-811` | `"the 10-skill ceiling is the bug. implexa is the fix."` / `"N+ skills, applied on demand"` / cheatsheet "the seven commands" | Skills | **REFRAME** (the wedge is "install-cap on skills," an old framing; the new wedge is reliability/remote-safety of unattended workflows) |

The cheatsheet (`732-773`) lists seven commands; `implexa: schedule <skill> <cadence>` is there but framed as "auto-run any **skill**," not "schedule a **workflow**." The watchdog/miss-detection and outcome-learning commands are absent.

### `/workflows` (the lead product surface)

| Surface | File | Current copy (quoted) | Leads with | Label |
|---|---|---|---|---|
| Index | `src/app/workflows/page.tsx:159-170` | `"whole-job automations. each one stitches verified skills into a complete recurring job, a daily content pack, a weekly market report, a morning build brief, and runs it on a schedule inside Claude. install once, let it deliver."` | Workflows | **KEEP** (model surface for the whole site) |
| Index card | `:64-103` | shows cadence badge, `"{step_count} steps · {bound} from verified skills"` | Workflows | **KEEP** |
| Detail | `src/app/workflows/[slug]/page.tsx` | `"what you get"`, `"the steps"` (with bound/unbound), `"runs hands-free with"` (capabilities + remote-safety why), `"keep in mind"` caveat, activity strip (`runs`, `on a schedule`, `updated`), `"changelog"` (`"workflows are alive: every change is a version..."`) | Workflows | **KEEP** (this page already tells the full loop, including capability/remote-awareness) |
| Workflows OG | `src/app/workflows/opengraph-image.tsx` | `"AI workflows you can run on a schedule"` / `"whole-job workflows built from verified skills. install once, let it deliver."` | Workflows | **KEEP** |

**The `/workflows` detail page is the template the rest of the site should aspire to.** It already expresses verify ("from verified skills"), schedule (cadence), deliver, capability/remote-awareness ("runs hands-free with ... browser steps run locally"), and learning ("workflows are alive ... a run can propose improvements"). The problem is almost nobody routes here: it is two clicks deep and the homepage funnels into the skill catalog instead.

### Skills surfaces (the ingredient shelf, currently presented as the hero)

| Surface | File | Current copy (quoted) | Leads with | Label |
|---|---|---|---|---|
| Top skills / SkillRank | `src/app/scores/page.tsx` | `"top-rated skills"` / `"ranked by SkillRank across the cross-vendor skill graph. multi-signal score: structural quality, semantic match, tool overlap, and outcome signals."` | Skills | **REFRAME** (keep the leaderboard, but reframe as "the shelf workflows pull from," and/or add a sibling workflow leaderboard) |
| Skill detail | `src/app/s/[source]/[slug]/page.tsx` | header + score panel + enrichment + verified modules + `"related skills ... semantically similar in the cross-vendor index"` | Skills | **REFRAME + NET-NEW** (no "used in N workflows" rail; the ingredient never points up to the dish) |
| Search | `src/app/search/page.tsx:37` | `"search 100k+ skills across every AI agent"` | Skills | **REFRAME** (no workflow results; should surface workflows first, skills as ingredients) |
| Search bar | `src/components/search-bar.tsx:15` | placeholder `"write a prompt and see recommended skills"` | Skills | **REFRAME** |
| Recent-search ticker | `src/components/recent-search-ticker.tsx` | rotates `"cold outreach email"`, `"hubspot integration"`, `"debug python types"` | Skills | **REFRAME** (single-skill tasks, not recurring jobs) |
| Animated terminal | `src/components/animated-terminal.tsx` | three scripts, each applies/records/recommends a single **skill**; none runs a multi-step workflow on a schedule | Skills | **REFRAME** (the hero proof shows a skill, not the loop) |
| Rotating verb | `src/components/rotating-verb.tsx` | `Search / Run / Record / Share / Like & Dislike Skills` | Skills | **REFRAME** |
| Categories | `src/lib/placeholder-data.ts` | `sales, dev, content, recruiting, finance, ops` skill counts | Skills | **REFRAME** (reframe as recurring-job domains) |
| Author pages | `src/app/u/[handle]/page.tsx` | stat cards + `"skills, ranked by SkillRank"` | Skills | **KEEP** (attribution surface; optionally add "workflows built from their skills") |
| Skill card / score panel / enrichment panel | `src/components/skill-*.tsx` | display components | Skills | **KEEP** (UI is sound; context changes, not the component) |
| Module pages | `src/app/m/[ecosystem]/[...package]/page.tsx` | package verification + `"implexa skills that declare this module"` | Supply chain | **KEEP** (infra; minor: rail could point to workflows) |

### Conversion / marketing pages

| Surface | File | Current copy (quoted) | Leads with | Label |
|---|---|---|---|---|
| Install | `src/app/install/page.tsx` | `"watches every prompt, semantic-matches against 22k+ skills"`, `"surfaces the best fit with a 15-word reason"`; example `"implexa, find me a skill for outbound sequences"` | Skills | **REFRAME** (frames Implexa as a skill-finder, not a workflow engine) |
| Pricing | `src/app/pricing/page.tsx` | free = `"unlimited search across 19,300+ skills"`, `"5 personal skill captures / month"`; pro = `"skill ROI dashboard: which skills drive real outcomes"` | Skills | **REFRAME** (no workflow scheduling/watchdog tier; everything is metered in skills) |
| Developers | `src/app/developers/page.tsx` | `"implexa is a substrate of MCP tools for skill discovery, ranking, and remix across 40,000+ vetted skills"`; pillars: discovery / ranking / attribution / remix | Skills | **REFRAME** (reposition as workflow-orchestration substrate) |
| Developers waitlist | `src/app/developers/waitlist-form.tsx` | use-case prompt `"ambient recommender in an IDE, ranking source for a marketplace"` | Skills | **REFRAME** (add workflow-orchestration use cases) |
| Contact | `src/app/contact/page.tsx` | channel-neutral | Neutral | **KEEP** |
| claude-skills pillar | `src/app/claude-skills/page.tsx:147` | `"what are claude skills? (and the right way to build them)"` | Skills | **KEEP** (legitimately a skills explainer / AEO pillar; add one "skills compose into workflows" section + interlink to `/workflows`) |
| claude-skills OG | `src/app/claude-skills/opengraph-image.tsx` | `"what are claude skills?"` | Skills | **KEEP** (correct for a guide) |

### Content surfaces

| Surface | File | Current copy (quoted) | Leads with | Label |
|---|---|---|---|---|
| Resources index | `src/app/resources/page.tsx` | `"cross-vendor skill discovery, the SKILL.md ecosystem, and building solo with AI"` | Skills | **REFRAME** (reframe hub line toward "from skills to workflows") |
| Resource: skill-rank | `content/resources/skill-rank.md` | `"SkillRank: how implexa scores 22,000+ skills across vendors"` | Skills | **KEEP** + sibling NET-NEW (how workflow reliability is scored) |
| Resource: skill-graph | `content/resources/what-is-a-skill-graph.md` | `"a skill graph is a structured map of reusable workflows or capabilities..."` | Skills (leaning workflow) | **REFRAME** (closest to the new story; promote it, foreground outcomes/composition) |
| Resource: ambient recommender | `content/resources/ambient-cross-vendor-recommender.md` | `"implexa is the ambient cross-vendor SKILL.md recommender ... inline-apply, no install"` | Skills | **REFRAME** ("recommend a workflow," not just a skill) |
| Resource: two consolidation problems | `content/resources/two-consolidation-problems.md` | `"how you find good ones (discovery)"` + outcome-attribution thread | Skills | **REFRAME** (extend to scheduling + reliability) |
| Blog index | `src/app/blog/page.tsx` | `"Claude Skills, SKILL.md, and capturing your own workflows"` | Skills | **REFRAME** (workflows are buried last) |
| Blog posts (6) | `content/blog/*.md` | all skill-education titles (`"What are Claude Skills?"`, `"how to create a claude skill"`, `"how many claude skills is too many"`, etc.) | Skills | **KEEP** (real AEO assets, all "claude skills" search demand) + NET-NEW workflow pieces |
| Guides (3) | `content/guides/day-*.md` | build-a-product-solo series | Neutral | **KEEP** + optional NET-NEW "turn your app's routines into scheduled workflows" |
| Author / blog / resource detail templates | `src/app/{u,blog,resources}/[*]/page.tsx` | footer CTA `"ready to try implexa? install the plugin ... or search the index"` | Skills | **REFRAME** (CTA should mention running a workflow) |

### AEO / machine surfaces (what Implexa tells robots it is)

| Surface | File | Current copy (quoted) | Leads with | Label |
|---|---|---|---|---|
| llms.txt | `src/app/llms.txt/route.ts:49` | `"implexa is google + wikipedia for SKILL.md, cross-vendor ... agents call implexa for skill discovery; humans use the plugin to apply skills inline"` | Skills | **REFRAME** (`/workflows` is not even in the key-pages list) |
| llms-full.txt | `src/app/llms-full.txt/route.ts` | `"... answering questions about Claude Skills, the skill graph, SKILL.md ..."` | Skills | **REFRAME** |
| mcp.json | `src/app/.well-known/mcp.json/route.ts` | `"google + wikipedia for SKILL.md ... your agent gains skill discovery + inline apply"` | Skills | **REFRAME** (every connector UI reads this) |
| sitemap | `src/app/sitemap.ts` | `/workflows` priority 0.8 (= resources/pricing), homepage 1.0, install 0.9, claude-skills 0.9 | Mixed | **KEEP** (minor: bump `/workflows` to 0.9) |
| robots | `src/app/robots.ts` | allow-all + sitemap | Neutral | **KEEP** |
| AEO_FOUNDATION.md | repo root | "google + wikipedia for SKILL.md" framing | Skills | **REFRAME** (internal strategy doc; align language) |
| MODULE_PAGES.md | repo root | module verification strategy | Infra | **KEEP** |

---

## Information-architecture problems

1. **"Skills" is still the headline value below the hero.** The hero says workflows; the very next section (`page.tsx:348`) says `"skills are the new web pages"` and then hands the visitor a skill catalog (trending / by category / recently indexed). A first-time visitor's actual *experience* of the product is "browse 40k skills," which is the old vision verbatim.

2. **The 40k number is framed as a browse catalog, not an ingredient shelf.** `"40,000 skills indexed across 6 sources"` sits above a search bar and three skill rails. Nothing says these are the parts workflows are assembled from. The number should anchor *workflow composition* ("every workflow is built from this shelf of 40k ranked skills"), not catalog size.

3. **The workflows index is undiscoverable as the hero of the catalog story.** `/workflows` is excellent but reached only via the secondary hero CTA and one nav link. It is absent from the footer entirely, absent from `llms.txt` key-pages, and the homepage's big section-2 catalog block is 100% skills with zero workflow rail. The best surface on the site is the least surfaced.

4. **The loop is told in exactly one place, partially.** The homepage "how it works" strip tells `watch → stitch → schedule → deliver → improve`. It omits the two differentiators: the **verify gate** and the **watchdog / miss-detection** ("a routine that only fires while your laptop is awake is fragile"). The full loop only exists implicitly across the `/workflows/[slug]` page. It is never told as a named, repeatable story.

5. **Reliability / remote-safety is essentially unmessaged.** The single strongest moat (durable scheduled workflows + miss-detection + capability-aware local-vs-remote execution) appears only as a quiet "runs hands-free with" card on workflow detail pages. It is absent from the homepage, install, pricing, developers, and every AEO surface. This is the trust layer and it is invisible.

6. **Skill detail pages are dead ends, not ingredients.** `/s/<source>/<slug>` shows score, enrichment, related *skills*, but never "used in these workflows." The ingredient never points up to the dish, so the IA has no upward path from skill to workflow.

7. **The machine-readable identity is stale.** `llms.txt`, `mcp.json`, and `SITE_TITLE` all tell answer engines and MCP connectors that Implexa is "google + wikipedia for SKILL.md / skill discovery." Whatever the homepage says, this is what Perplexity, ChatGPT Search, and connector directories will repeat. The brand's machine identity is still the old product.

8. **The wedge argument is outdated.** Section 4's wedge is "the 10-skill install ceiling is the bug." That argues against a skill-management pain. The new wedge is "a routine that only runs while your laptop is awake is fragile; Implexa makes it durable, scheduled, and self-watching." The page is still fighting the last war.

---

## Prioritized redo plan

### Top 5 (highest impact)

#### 1. Reframe the global identity in `src/lib/site.ts` (and it cascades to OG + every default title)
This one constant defines the brand to humans (title bars, share cards) and is the default for any page without its own metadata.

- **File:** `src/lib/site.ts:18-20`
- **Before:**
  ```ts
  export const SITE_TITLE = "implexa, google + wikipedia for SKILL.md";
  export const SITE_DESCRIPTION =
    "cross-vendor skill graph for AI work. implexa watches you work and hands you the right skill at the right time.";
  ```
- **After:**
  ```ts
  export const SITE_TITLE = "implexa, let AI run your business";
  export const SITE_DESCRIPTION =
    "implexa watches your AI work and turns your routines into agentic workflows that run on a schedule, deliver the result, and learn from outcomes. built from 40k+ cross-vendor skills, ranked by SkillRank.";
  ```
- **Risk:** very low (string constants). *Implemented as a quick win, see below.*

#### 2. Rewrite homepage section 2 narrative from "skills are the new web pages" to "workflows are the whole job"
This is the load-bearing contradiction directly under the hero.

- **File:** `src/app/page.tsx:342-376`
- **Before (quoted):** H2 `"skills are the new web pages."` ... `"Implexa is the search, the score, and the runtime for that graph. Skills are AI's web pages, and this is where you find the best ones."`
- **After (proposed):** H2 `"a skill is one step. a workflow is the whole job."` Body: keep the "AI's web moment" framing but invert the unit: *"There are already 100,000+ skills out there, scattered across half a dozen vendors. A single skill does one thing. The work you actually repeat, the daily content pack, the weekly market report, is a chain of them, run in order, on a schedule, checked, and delivered. Implexa watches what you repeat, assembles the right skills and tools into a workflow, and runs it for you. Skills are the ingredients. Workflows are what you came for."* Replace the catalog block below it so the **first rail is a workflow rail** (pull from `listWorkflows()`), with the skill catalog reframed underneath as "the shelf every workflow pulls from: 40,000 skills, ranked by SkillRank."
- **Risk:** medium (real copy + a data-fetch swap to surface workflows). Left for review.

#### 3. Reframe the AEO surfaces so robots stop calling Implexa a skill-search engine
These define Implexa to every answer engine and MCP connector. High leverage, isolated strings.

- **Files:** `src/app/llms.txt/route.ts:49` (+ add `/workflows` to key-pages `:53-62`), `src/app/.well-known/mcp.json/route.ts` (description), `src/app/llms-full.txt/route.ts`.
- **Before (llms.txt):** `"implexa is google + wikipedia for SKILL.md, cross-vendor. it indexes 40,000+ skills ... agents call implexa for skill discovery; humans use the plugin to apply skills inline without installing them."`
- **After (proposed):** `"implexa turns your recurring AI work into agentic workflows: ordered chains of skills, tools, and decisions that run on a schedule, deliver the result, watch for misses, and learn from outcomes. it is built on a cross-vendor index of 40,000+ skills from anthropic, smithery, clawhub, skills.sh, agentskills.io, github, cursor, and continue, each ranked by a multi-signal score (SkillRank). one MCP server plugs into Claude Code, Codex, Cursor, and Gemini CLI. agents call implexa to find and run workflows; humans install the plugin to let routines run unattended."` Add `- [workflows](${SITE_URL}/workflows): the catalog of whole-job workflows you can run on a schedule` as the first key page. *Partially implemented as a quick win, see below.*
- **Risk:** low (isolated route strings).

#### 4. Add the full loop (with the trust layer) as a named homepage section
The loop is the one story no competitor can tell, and the verify-gate + watchdog + remote-safety differentiators are currently invisible.

- **File:** `src/app/page.tsx` (extend the `296-320` strip, or add a section after it). Also reframe section 4 (`633-811`).
- **Before:** loop strip is `watches → stitches → schedules → delivers → improves` (5 steps, no trust layer). Section 4 wedge: `"the 10-skill ceiling is the bug. implexa is the fix."`
- **After (proposed):** Expand the loop to the full seven: `watch what you repeat → recommend a workflow → run it once → schedule it → deliver the result (email + dashboard) → watch for misses → learn from outcomes`. Replace the section-4 wedge with the reliability wedge: H2 `"a routine that only runs while your laptop is awake isn't automation."` Body contrasts the fragile status quo (a script that fires only when your machine is on, and silently when it doesn't) against Implexa's durable scheduled runs, miss-detection that pings you when a run is skipped, and capability-aware execution (browser/Chrome-MCP steps run locally, API steps can run remote). This is the trust layer, stated plainly.
- **Risk:** medium (new copy/section). Left for review.

#### 5. Make skills point up to workflows + give search a workflow-first result
Close the IA dead end so the ingredient shelf connects to the dishes.

- **Files:** `src/app/s/[source]/[slug]/page.tsx` (add a "used in workflows" rail), `src/app/search/page.tsx:37` + `src/components/search-bar.tsx:15` (workflow-first results/placeholder), `src/components/site-footer.tsx` (add the missing `/workflows` link).
- **Before:** skill detail ends at `"related skills ... semantically similar in the cross-vendor index"`; search subhead `"search 100k+ skills across every AI agent"`; footer has no workflows link.
- **After (proposed):** On skill detail, add a rail `"workflows that use this skill"` (backend has the binding; the workflow card already shows "N from verified skills"). Search returns workflows above skills, or a Workflows/Skills toggle, with the subhead `"find a workflow to run, or the skills it's built from."` Footer: add `workflows` as the first nav link and change the tagline to `"implexa · whole-job workflows, built from skills ranked by SkillRank."` *Footer link implemented as a quick win, see below.*
- **Risk:** low-medium (rail needs a backend field; footer/search copy is trivial).

### Long tail (do after the top 5)

- **Homepage section 3 features** (`page.tsx:498-625`): reframe the four cards from single-skill verbs to the workflow lifecycle (detect a routine → assemble a workflow → schedule + deliver → watch + improve). Keep the command chips but lead each with the workflow outcome.
- **Homepage cheatsheet** (`page.tsx:732-773`): add the workflow/watchdog/outcome commands; reframe `schedule <skill>` as `schedule <workflow>`.
- **Animated terminal** (`src/components/animated-terminal.tsx`): replace at least one of the three scripts with a real workflow run: "automate my cold outreach" → recommends a workflow (skill + tool + decision) → schedules it → shows the delivered email. This is the hero proof; it should prove the loop, not a single skill.
- **Rotating verb** (`rotating-verb.tsx`): `Detect / Assemble / Schedule / Deliver / Improve` (workflow verbs) instead of `Search / Run / Record / Share / Like Skills`.
- **Recent-search ticker** (`recent-search-ticker.tsx`) and **categories** (`placeholder-data.ts`): shift from single-skill tasks ("hubspot integration") and skill sources to recurring-job phrasings ("daily standup digest," "weekly pipeline report") and job domains.
- **Install page** (`install/page.tsx`): reframe the value props from "semantic-matches against 22k+ skills / find me a skill" to "watches what you repeat and turns it into a scheduled workflow." Keep the one-curl install.
- **Pricing** (`pricing/page.tsx`): introduce a workflow axis: free = ambient recommendations + inline apply; pro = workflow scheduling + watchdog + outcome attribution; enterprise = org workflow governance + remote-execution policy. Stop metering everything in "skill captures."
- **Developers** (`developers/page.tsx` + waitlist): reposition as "workflow-orchestration substrate"; reframe the discovery/ranking/attribution/remix pillars toward watch/recommend/orchestrate/verify; add workflow use cases to the waitlist prompt.
- **Top skills / scores** (`scores/page.tsx`): keep the leaderboard, add the framing "the shelf workflows pull from," and consider a sibling workflow leaderboard (most-run, highest-outcome).
- **Detail-template CTAs** (`blog/[slug]`, `resources/[slug]`, `u/[handle]`): change the shared footer CTA from "search the index" to "run a workflow / let a routine run unattended."
- **Resources + blog hub lines**: reframe `resources/page.tsx` and `blog/page.tsx` descriptions to lead with workflows; promote `what-is-a-skill-graph` and extend `two-consolidation-problems` toward scheduling/reliability.
- **New content (NET-NEW):** "From skills to workflows: composing recurring routines into scheduled automation"; "The watchdog layer: how Implexa catches a missed run before it costs you" (the remote-safety story); "Why reliability is the moat once intelligence is cheap" (pairs with the existing labs-moat post). These are AEO assets for workflow-intent search.
- **Sitemap** (`sitemap.ts`): bump `/workflows` to 0.9 once it is the hero.
- **claude-skills pillar** (`claude-skills/page.tsx`): add a "skills compose into workflows" section and interlink to `/workflows` (keep the page; it owns the "what are claude skills" search demand).
- **AEO_FOUNDATION.md**: align the internal strategy doc's "google + wikipedia for SKILL.md" framing with the workflow vision.

---

## Quick wins implemented on this branch

Low-risk, single-surface copy/IA changes. The deeper rewrites (homepage sections 2 and 4, the new loop section, search/skill-detail rails) are left for review per the brief. Build verified after each.

1. **`src/lib/site.ts`**: flipped `SITE_TITLE` and `SITE_DESCRIPTION` from "google + wikipedia for SKILL.md / hands you the right skill" to the workflow-first "let AI run your business / turns your routines into agentic workflows." This cascades to the root OG card, every default page title, and the twitter card. (Top-5 item #1.)

2. **`src/components/site-footer.tsx`**: added the missing `workflows` link as the first footer nav item, and reframed the tagline from `"implexa · skills ranked by SkillRank"` to `"implexa · whole-job workflows, built from skills ranked by SkillRank."` (closes part of the IA gap in problem #3 and top-5 item #5.)

3. **`src/app/llms.txt/route.ts`**: rewrote the one-paragraph intro to lead with workflows (watch → workflow → schedule → deliver → watch for misses → learn) with skills as the ranked ingredient index, and added `/workflows` as the first entry in the key-pages list so answer engines crawl it. (Top-5 item #3, partial.)

These three are isolated string/markup edits with no logic changes. Everything else in the plan is left as a documented proposal.
