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

## visual-dev fixtures (REMOVED)

the three visual-dev fixtures have been removed now that the backend chip
(`feat/module-verification`) ships the real tools. both fetchers + the skill
page now degrade to `null` / `[]` when `IMPLEXA_PUBLIC_SEARCH_TOKEN` is unset,
so a tokenless local dev renders the 404 / no-rail fallback rather than fake
data. to review against real data, set `IMPLEXA_PUBLIC_SEARCH_TOKEN` (and
optionally `IMPLEXA_API_URL`) in a website `.env.local`.

> **merge ordering:** this branch now hard-depends on the backend tools being
> live on whatever `IMPLEXA_API_URL` resolves to in prod (`core.implexa.ai`).
> merge + deploy `feat/module-verification` first (or together); otherwise
> `/m/*` pages 404 and skill rails stay hidden until the backend is up.

## backend contract (resolved)

answers to the original open questions, against what `feat/module-verification`
actually shipped:

- **tool names / shapes**: `verify_module({ package, ecosystem })` returns a
  nested `{ ok, card: {...} }` envelope (NOT the flat shape this branch first
  assumed). `fetchModuleVerification()` maps it via `mapBackendCard()`. the
  backend has no `version` argument — `version_range` is a per-skill frontmatter
  concept, left null on the standalone `/m` page.
- **paired skills source**: backend ships `list_skills_for_module({ ecosystem,
  package })` (a JSONB containment query under the hood) returning
  `{ ok, count, rows: [{ source, slug, name, description, author,
  display_score }] }`. matches `fetchPairedSkills()` as-is.
- **`modules` on `get_aggregated_skill`**: backend lifts the frontmatter
  `modules:` array to a top-level `modules` field on the response. `trust_tier`
  enum confirmed `signed | declared | unverified`.
- **editorial field**: NOT shipped by the backend in v1 — the `verify_module`
  card carries no editorial copy, so `editorial` stays null and the page hides
  the section. revisit if/when curated copy lands (likely a separate column or a
  `frontmatter.editorial_pick` surfacing).
- **fields the card omits** (page hides each when null): `source_url`,
  `homepage`, `scorecard_url`. `programming_language` is derived client-side via
  `ecosystemLanguage()`; `license_url` from a clean SPDX id only.

## relationship to AEO

`feat/aeo-foundation` (the founder's `e7e9477` commit) bundles this module work
*and* a separate AEO chip (`skill-procedure.ts`, the `howToSchema` JSON-LD,
`llms.txt`, openapi surfaces). this branch carves out **only** the module work:

- module files + the skill-page modules rail
- of the shared `src/lib/jsonld.ts`, only `softwareSourceCodeSchema` (the module
  page's JSON-LD); `howToSchema` stays on `feat/aeo-foundation`
- of the shared skill `page.tsx`, only the modules rail; the HowTo schema
  block stays on `feat/aeo-foundation`

## verify locally

```bash
npm run dev
# module page:  http://localhost:3000/m/npm/@stripe/stripe-node
# skill rail:   http://localhost:3000/s/implexa/stripe-best-practices
```
