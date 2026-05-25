# implexa-website

the public surface of implexa. google + wikipedia for SKILL.md, cross-vendor.

## stack

- next 16 (app router)
- typescript strict
- tailwind v4 + shadcn-ui
- lucide-react icons
- @vercel/analytics
- deployed to vercel (auto-deploy on push to main)

## routes

| path | what |
|---|---|
| `/` | homepage. search bar + trending + categories + freshly improved |
| `/search?q=...` | search results (placeholder until /api/search is wired) |
| `/s/[source]/[slug]` | canonical skill detail page. SEO workhorse. |
| `/u/[handle]` | contributor profile (P3 stub) |
| `/install` | install instructions for claude code / codex / cursor |
| `/api/search` | server route proxying to backend MCP recommend_skills_for_context |

## local dev

```bash
npm install
npm run dev
# http://localhost:3000
```

## env

set on vercel:

| var | what | default |
|---|---|---|
| `IMPLEXA_API_URL` | backend root | `https://core.implexa.ai` |
| `IMPLEXA_PUBLIC_SEARCH_TOKEN` | bearer token for the public-search MCP role | empty (returns placeholder) |

## phases (per VISION.md website evolution map)

- **phase 1 (this commit)**: foundation, route skeleton, placeholder content, SEO meta.
- **phase 2**: wire /api/search to the live aggregated_skills index. real skill detail pages with SKILL.md body streaming.
- **phase 3**: sitemap.xml, structured data on skill detail pages.
- **phase 4 (post-P3 backend)**: install counts, run counts, last-run timestamps on every skill.
- **phase 5 (post-P3.1+P3.2 backend)**: revision history, contributor profiles, fork counts, "improve this skill" button.

## voice rules

- lowercase, tech-bro X cadence, punchy
- never em-dashes (commas, colons, parens, hyphens)
- never corporate hedging
- "implexa watches you work" not "implexa is a platform that..."

## per-repo git identity

```bash
git config user.name "founder-implexa"
git config user.email "founder@implexa.ai"
```

global git config is the revenoid identity. never touch it.
