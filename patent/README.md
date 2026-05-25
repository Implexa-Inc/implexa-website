# Patent Filing Package, Implexa SkillRank

**DRAFT v0.1, founder review required before filing.** This package is informational and prepared for self-filing. It does not constitute legal advice.

---

## What's in this package

A complete USPTO Pro Se provisional patent application package for Implexa's SkillRank algorithm: a cross-vendor ambient skill recommender that combines five weighted features (semantic match, tool-stack overlap, work-signature similarity, cohort co-occurrence, outcome attribution) and an asymmetric privacy framework (three independent consent toggles with class-specific defaults, rotating-salt anonymization, discard-on-no-match). The package targets the $130 micro-entity provisional fee under 35 U.S.C. § 111(b) and is designed for self-filing through USPTO Patent Center in 30 to 60 minutes once the documents are reviewed and the placeholders are filled.

---

## Files

| file | purpose | voice |
|---|---|---|
| [cover-sheet.md](./cover-sheet.md) | USPTO cover sheet equivalent (PTO/SB/16). Inventor info, entity status, document inventory. Has placeholders to fill in. | formal patent |
| [specification.md](./specification.md) | The technical specification. Field, background, summary, detailed description with reference numerals, industrial applicability, three worked examples. ~4400 words. | formal patent |
| [claims.md](./claims.md) | Three independent claims (method, system, privacy framework) plus 17 dependent claims. Not strictly required for a provisional, included to lock in the scope of the future non-provisional. | formal patent |
| [drawings.md](./drawings.md) | Text blueprints for 7 figures (system architecture, algorithm flow, privacy framework, cross-vendor mechanism, data flywheel, work-signature schema, outcome attribution). Founder converts these to a single PDF using draw.io, Excalidraw, or equivalent. | formal patent |
| [filing-guide.md](./filing-guide.md) | Step-by-step self-filing instructions for USPTO Patent Center. Pre-filing checklist, the actual upload flow, what to do after filing, common pitfalls, cost breakdown, strategic notes. | founder-readable, lowercase, tech-bro X cadence |
| [README.md](./README.md) | This file. | mixed |

---

## What the founder still has to do before filing

In rough order:

1. Verify exact legal name and fill all `(placeholder)` fields in `cover-sheet.md`.
2. Skim the technical specification, confirm nothing overclaims and nothing under-describes. Edit freely.
3. Read the claims, confirm the three independent claims actually cover the moat you care about.
4. Produce `drawings.pdf` from the `drawings.md` blueprints (one PDF, 7 figures, black ink on white, see drawing checklist at the end of `drawings.md`).
5. Download USPTO form PTO/SB/15A (Certification of Micro Entity Status), fill, sign, scan to PDF.
6. Export `cover-sheet.md`, `specification.md`, and `claims.md` to individual PDFs (any markdown-to-pdf tool works; pandoc or `md-to-pdf` are both fine).
7. Set up USPTO.gov account and load USPTO Financial Manager if not done.
8. Follow `filing-guide.md` section B to upload through Patent Center.
9. Pay $130. Submit. Download confirmation receipt.
10. Log the application number below.

---

## Filing record (fill in after filing)

| field | value |
|---|---|
| USPTO application number (63/XXX,XXX) | *(fill in after filing)* |
| Filing date (priority date) | *(fill in after filing)* |
| Confirmation number | *(fill in after filing)* |
| 12-month non-provisional deadline | *(fill in: filing date + 12 months)* |
| Calendar reminder set for month 10 | *(yes / no)* |
| Calendar reminder set for month 11 | *(yes / no)* |
| Receipt PDF location | *(path to local backup and cloud backup)* |

---

## One-paragraph summary of the protected invention

A computer-implemented method and corresponding system for cross-vendor skill recommendation in artificial-intelligence agent runtimes. An ambient client-side hook installed in each of a plurality of agent runtimes (Claude Code, Codex, Cursor, Gemini CLI) observes user prompts and transmits a user-context object to a server-side ranking engine. The ranking engine computes a composite score for each candidate skill in an aggregated cross-source skill index, as a weighted linear combination of five features: semantic match, tool-stack overlap, work-signature similarity, cohort co-occurrence, and outcome attribution. The top-ranked skill is returned to the originating runtime, presented to the user, applied inline without prior installation, and the resulting outcome is captured and fed back into the outcome-attribution feature. Telemetry collection is governed by an asymmetric privacy framework with three independent consent toggles whose default states are aligned to the inherent sensitivity of each telemetry class (tool inventory and outcome tracking default ON, work signature defaults OFF). All telemetry is anonymized through a rotating-salt hash, prompts not producing a recommendation are discarded, and work signatures auto-expire at 90 days unless promoted to a cohort centroid.

---

## Why this is patentable (in brief)

1. **Cross-vendor ambient observation.** Existing skill recommenders are bound to a single agent-runtime vendor. The same hook running in Claude Code, Codex, Cursor, and Gemini CLI is a structural novelty.
2. **Multi-signal weighted ranking for skill discovery.** Distinct from one-shot semantic search (mcp-skillset), pull-based REST agents (Skyll), and collaborative filtering systems (Netflix, Spotify). The specific five-feature composition, including a work-signature feature with five sub-signals, is new.
3. **Asymmetric privacy framework.** No prior art known to the inventor applies class-specific default consent states based on inherent sensitivity. Existing systems are uniform (all-in or all-out).
4. **Outcome-attribution flywheel for skills.** Existing skill marketplaces rank by stars and install counts. None measure whether the applied skill solved the user's task. The applied-skill-events table and Bayesian-smoothed success rate are new.

---

## Open questions for the founder

Listed in `filing-guide.md` and in the agent's hand-off note. Most are placeholders to fill in; one is the legal-name verification; one is the decision about whether to assign to Implexa Inc. now or after filing (recommendation: file individually, assign later).

---

## Disclaimer (repeated)

This package is informational and prepared for self-filing. It does not constitute legal advice. The author of this package is not a registered patent agent or patent attorney. Consult a registered patent practitioner before relying on any of the strategic or legal observations contained herein, particularly before drafting the non-provisional application.
