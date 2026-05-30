# AEO foundation (feat/aeo-foundation)

answer engine optimization surfaces so AI engines (claude.ai, chatgpt search,
perplexity, brave, google ai overviews) can discover implexa, reason about its
skills, and find + use the MCP server. five surfaces, all on this branch.

all voice is lowercase, no em-dashes, to match the existing site.

## what shipped

### 1. `/llms.txt` (text/plain, root)
`src/app/llms.txt/route.ts` — route handler following the llmstxt.org
convention. one-paragraph intro, then curated link sections (key pages, api
entry point, mcp server, skill detail page format, featured articles + blog,
how to cite). featured/blog lists are generated from the live content index so
they stay in sync. served as `text/plain; charset=utf-8`, edge-cached 1h.

### 2. HowTo JSON-LD on skill detail pages (`/s/[source]/[slug]`)
- `src/lib/skill-procedure.ts` — best-effort parser that pulls a procedure out
  of a SKILL.md body. finds a `## Procedure` / `## Steps` / `## Usage` (etc.)
  heading and its ordered/bulleted list, splits `name: description` steps, and
  also extracts MCP tool references (frontmatter `tools:`, a `## Tools`
  section, inline snake_case backticks) and a best-effort `totalTime`. returns
  `null` when no procedure is identifiable, so we never emit invalid markup.
- `howToSchema()` in `src/lib/jsonld.ts` — builds the schema.org HowTo node.
  requires name + >=2 valid steps (each step gets `name` + `text`), else
  returns null. MCP tools become `HowToTool` entries, each linked to its
  operation in the OpenAPI descriptor (`/developers/openapi.json#/paths/~1<tool>`).
- wired into the page's `@graph` alongside SoftwareApplication + BreadcrumbList
  (+ Review/AggregateRating when scored). prefers the Tier-B enriched body when
  present.

### 3. SoftwareSourceCode JSON-LD helper (+ module pages)
- `softwareSourceCodeSchema()` in `src/lib/jsonld.ts` — fields: name, version
  (optional, omitted when absent), programmingLanguage, license (SPDX id
  resolved to `spdx.org/licenses/<id>`, raw string fallback), codeRepository,
  author, registryUrl (mapped to `sameAs`), dateModified.
- `src/app/m/[ecosystem]/[...package]/page.tsx` consumes the helper (module
  pages were built out on this branch, so the helper is wired in, not just
  parked). catch-all package segment handles npm scoped names. ISR 24h.

### 4. `/.well-known/mcp.json` (application/json)
`src/app/.well-known/mcp.json/route.ts` — MCP discovery doc. no ratified spec
exists yet, so it carries both shapes: a registry-style `remotes` array
(modelcontextprotocol/registry server.json) and a flatter
`server`/`authentication`/`tools` block (claude.ai + Smithery connector
metadata). includes server url (`core.implexa.ai/api/v2/mcp`), transport
(streamable-http), bearer auth (`rvk_live_*`, with the no-auth read tools called
out), a tools summary (count + link to the openapi catalog + the 8 public read
tools inline), client compatibility, and contact. static (`force-static`).

### 5. `/developers/openapi.json` (application/json, OpenAPI 3.1)
- `scripts/generate-openapi.js` — generates the descriptor from the backend MCP
  registry (`implexa-backend/src/mcp/tools/index.js`), 60 tools. one POST
  operation per tool keyed at `/<tool_name>`, with the tool's zod input schema
  converted to JSON Schema as the requestBody. bearer security scheme,
  streamable-http server entry, mcp-tools tag.
- `src/lib/openapi-spec.json` — the committed generated artifact.
- `src/app/developers/openapi.json/route.ts` — serves it static
  (`force-static`, 24h revalidate), `application/json`.

## decisions

- **openapi is a committed artifact, not built live.** the website and backend
  are separate repos/deploys; the website can't import the backend registry at
  build time. so `scripts/generate-openapi.js` produces a static
  `src/lib/openapi-spec.json` that the route serves. re-run after tool changes:
  ```
  node scripts/generate-openapi.js        # reads ../implexa-backend
  ```
  the script lives in this repo (so the whole AEO surface is on one branch) but
  resolves the backend's OWN zod + zod-to-json-schema via `createRequire` — the
  tool schemas were authored against zod v3, and the website runs zod v4 whose
  internal shapes differ. set `IMPLEXA_BACKEND_DIR` if the checkout layout
  differs. (a draft of this generator briefly lived in the backend repo during
  development; it was removed so the unrelated `feat/module-verification` branch
  stays clean.)

- **MCP tools modeled as POST-per-tool.** MCP is one streamable-http JSON-RPC
  endpoint, which OpenAPI can't model natively. one operation per tool keyed at
  `/<tool_name>` gives agents a real machine-readable catalog. the doc text is
  explicit that these are MCP tools, called via a client, not raw HTTP routes.

- **openapi summaries/descriptions are verbatim from the backend.** they're
  machine data from the source of truth and some contain em-dashes; the
  no-em-dash rule applies to authored site copy (llms.txt, mcp.json, the openapi
  `info` block), which is clean. the public mcp.json tool descriptions are
  hand-written for humans rather than reusing the internal registry summaries
  (which leak roadmap jargon like "P2 wedge").

- **`softwareSourceCodeSchema()` version made optional.** real package data can
  lack a version; the helper omits it rather than emitting an empty field. the
  module page now uses the helper instead of an inline object so every package
  surface emits one canonical node shape, and license resolves from `license_spdx`
  to a canonical spdx.org url.

- **segment config must be a literal.** the module page had
  `export const revalidate = PAGE_REVALIDATE` (a referenced const); Next 16 /
  Turbopack rejects non-literal segment config. inlined to `86400`.

## verification

- `npx tsc --noEmit` clean, `eslint` clean on changed files, `next build`
  green. `/.well-known/mcp.json` and `/developers/openapi.json` both prerender
  as static routes.
- served output checked via `next start`: correct content-types
  (`text/plain` for llms.txt, `application/json` for the two json surfaces),
  mcp.json well-formed (60 tools, 8 public, remotes array), openapi 3.1 with 60
  paths.
- JSON-LD validated on https://validator.schema.org/ (the dev fixtures
  `/s/implexa/stripe-best-practices` and `/m/npm/@stripe/stripe-node` exercise
  the HowTo + SoftwareSourceCode paths since local has no backend token):
  - skill page graph: 4 objects (SoftwareApplication, BreadcrumbList, HowTo +
    CreativeWork), **0 errors, 0 warnings**.
  - module page graph: SoftwareSourceCode + BreadcrumbList, **0 errors, 0
    warnings**.
  re-run validator.schema.org against the real deployed URLs before launch as a
  final confirmation.

## not done / out of scope

- not deployed, not pushed. branch only.
- skill detail + module pages stay dynamic (ƒ) because they fetch backend data;
  the static AEO surfaces (llms.txt, mcp.json, openapi.json) prerender.
- `content/guides/day-3.md` is untracked on this branch but unrelated to AEO.
