# module surfaces (v1)

website half of the procedure + verified module pairing. ships dedicated module
detail pages plus a module rail on existing skill pages. backend half (the
verification service + frontmatter extension) is built in parallel on
`feat/module-verification` in implexa-backend.

branch: `feat/module-pages` (carved out of `feat/aeo-foundation`, which also
carries the separate AEO foundation chip — see "relationship to AEO" below).

## what was built

- **`/m/[ecosystem]/[...package]`** — `src/app/m/[ecosystem]/[...package]/page.tsx`
  - server component, ISR `revalidate: 86400` (24h)
  - catch-all on the package segment so npm scoped packages keep their slash
    (`/m/npm/@stripe/stripe-node`); single-segment ecosystems (pypi, crates,
    rubygems) arrive as a one-element array and join cleanly
  - header (ecosystem chip + trust tier + version range), verification card
    (SPDX license, sigstore tier, deps.dev downloads + OpenSSF scorecard, OSV
    vuln count + top advisories), wirecutter-shaped editorial (hidden when the
    backend carries no curated text), paired-skills rail, footer with
    `verified_at` + report-an-issue link
  - JSON-LD `SoftwareSourceCode` + `BreadcrumbList` via `softwareSourceCodeSchema()`,
    open graph + twitter card

- **skill page modules rail** — `src/app/s/[source]/[slug]/page.tsx`
  - renders a "verified modules" section under the SKILL.md body when the
    skill's frontmatter declares a `modules:` array; renders nothing when
    absent (no empty state)
  - each module is a `ModuleCard` (name, version range, license, trust tier
    badge) linking to `/m/[ecosystem]/[package]`

- **`src/lib/module-verification.ts`** — server-only fetchers
  - `fetchModuleVerification()` → calls the backend `verify_module` MCP tool
  - `fetchPairedSkills()` → calls `list_skills_for_module`
  - display helpers: `trustTierStyle()`, `ecosystemLanguage()`,
    `ecosystemRegistryUrl()`
  - both fetchers degrade gracefully (null / `[]`) on missing token, network
    error, or unmerged backend tool

- **`src/components/module-card.tsx`** — shared card, mirrors `SkillCard`

### trust tier → badge color
- `signed` → emerald (matches SkillRank tier-1)
- `declared` → green-600 (tier-2)
- `unverified` → amber (tier-3)

## visual-dev fixtures (REMOVE when backend lands)

local dev has no `IMPLEXA_PUBLIC_SEARCH_TOKEN`, so every backend MCP call 401s.
to keep the surfaces reviewable end-to-end before `feat/module-verification`
merges, three fixtures stand in. each is gated so production is never affected:

1. `VISUAL_DEV_FIXTURES` in `module-verification.ts` — hand-shaped
   `verify_module` response for `npm/@stripe/stripe-node`, returned only when
   the real tool returns nothing.
2. paired-skills fallback in `fetchPairedSkills()` — two plausible callers for
   the same module, same condition.
3. `devSkillFixture()` in the skill page — a minimal skill body (+ a declared
   `@stripe/stripe-node` module) for `implexa/stripe-best-practices` and
   `implexa/stripe-projects`, **gated on `NODE_ENV !== "production"`** so a real
   prod backend outage can never serve a fake skill. `withModulesFixture()`
   attaches the module declaration to a real skill row when the backend hasn't
   surfaced `modules:` yet.

to verify against real data instead: set `IMPLEXA_PUBLIC_SEARCH_TOKEN` (and
optionally `IMPLEXA_API_URL`) in a website `.env.local`, then drop all three
fixtures once `verify_module`, `list_skills_for_module`, and the `modules`
field on `get_aggregated_skill` are live.

## open questions for the backend chip

- **tool names / shapes** assumed here: `verify_module(ecosystem, package,
  version?)` and `list_skills_for_module(ecosystem, package)`. confirm names +
  response envelope match what `feat/module-verification` ships.
- **paired skills source**: the website calls `list_skills_for_module`. the
  task floated an alternative (JSONB containment query on `aggregated_skills`).
  whichever the backend exposes, only `fetchPairedSkills()` needs to change.
- **`modules` on `get_aggregated_skill`**: the rail expects the frontmatter
  `modules:` array surfaced verbatim on the aggregated skill row. confirm the
  field name and that `trust_tier` is one of `signed | declared | unverified`.
- **editorial field**: editorial copy is read from `verification.editorial`
  (pick_summary / why / caveats / curated_by). the plan calls it
  `frontmatter.editorial_pick` — confirm where curated copy actually lives.

## relationship to AEO

`feat/aeo-foundation` (the founder's `e7e9477` commit) bundles this module work
*and* a separate AEO chip (`skill-procedure.ts`, the `howToSchema` JSON-LD,
`llms.txt`, openapi surfaces). this branch carves out **only** the module work:

- module files + the skill-page modules rail
- of the shared `src/lib/jsonld.ts`, only `softwareSourceCodeSchema` (the module
  page's JSON-LD); `howToSchema` stays on `feat/aeo-foundation`
- of the shared skill `page.tsx`, only the rail + module fixtures; the HowTo
  schema block stays on `feat/aeo-foundation`

## verify locally

```bash
npm run dev
# module page:  http://localhost:3000/m/npm/@stripe/stripe-node
# skill rail:   http://localhost:3000/s/implexa/stripe-best-practices
```
