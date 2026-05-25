# Drawings

**DRAFT v0.1, founder review required before filing.** This package is informational and prepared for self-filing. It does not constitute legal advice.

USPTO formal drawing rules in summary (37 C.F.R. § 1.84):
- Black ink on white background, no shading except where necessary to convey structure.
- Margins: top 2.5 cm, left 2.5 cm, right 1.5 cm, bottom 1.0 cm minimum.
- All figures numbered consecutively (Fig. 1, Fig. 2, ...) and each reference numeral consistent across figures.
- Either letter size (8.5 x 11 in) or A4. One figure per page is acceptable and often preferred for clarity.
- Submit as a single PDF separate from the specification PDF.

The text below is the narrative blueprint for each figure. The founder should reproduce each figure in draw.io, Excalidraw, OmniGraffle, or any equivalent tool, then export the combined drawing set to a single PDF.

Reference numerals introduced in `specification.md` are reused below. New reference numerals introduced exclusively in the drawings are noted with their first appearance.

---

## Fig. 1, System Architecture Overview

**Purpose.** Show the four cooperating subsystems and the data flow among them.

**Suggested layout.** Top to bottom, left to right.

```
+-------------------+
|  USER (100)       |
+-------------------+
        |
        | submits prompt
        v
+-------------------------------------------------------------+
|  PLURALITY OF AI AGENT RUNTIMES                             |
|                                                             |
|  [Claude Code (105a)] [Codex (105b)] [Cursor (105c)]        |
|  [Gemini CLI (105n)]                                        |
|                                                             |
|  +-----------------------------------------+                |
|  | Ambient Client-Side Hook (110)          |                |
|  | - subscribes to UserPromptSubmit        |                |
|  | - subscribes to PostToolUse             |                |
|  +-----------------------------------------+                |
+-------------------------------------------------------------+
        |
        | authenticated network channel (115)
        v
+-------------------------------------------------------------+
|  BACKEND / SERVER-SIDE                                      |
|                                                             |
|  +-----------------------------------------+                |
|  | Aggregated Skill Index (120)            |                |
|  | - normalized skill records              |                |
|  | - vector embeddings                     |                |
|  | - tool manifests                        |                |
|  +-----------------------------------------+                |
|        ^                                                    |
|        | populated by                                       |
|        |                                                    |
|  +-----------------------------------------+                |
|  | Source-Specific Crawlers (122a..122n)   |                |
|  |   ingest from public repos,             |                |
|  |   marketplaces, MCP registries          |                |
|  +-----------------------------------------+                |
|                                                             |
|  +-----------------------------------------+                |
|  | SkillRank Ranking Engine (130)          |                |
|  | - 5-feature weighted sum                |                |
|  | - returns top-N with breakdown          |                |
|  +-----------------------------------------+                |
+-------------------------------------------------------------+
        |
        | top-N recommendation
        v
+-------------------------------------------------------------+
|  Recommendation Surface (135)                               |
|  - inline display or pull-buffer                            |
+-------------------------------------------------------------+
        |
        | user accepts
        v
+-------------------------------------------------------------+
|  Inline Application Component (140)                         |
|  - fetches skill content                                    |
|  - injects into active session                              |
|  - no installation step                                     |
+-------------------------------------------------------------+
        |
        v
+-------------------------------------------------------------+
|  Outcome Capture Component (145)                            |
|  - records applied-skill-event                              |
|  - infers outcome label                                     |
|  - feeds outcome_attribution feature                        |
+-------------------------------------------------------------+
```

**Reference numerals to caption beneath the figure.** 100 user; 105a/b/c/n agent runtimes; 110 ambient hook; 115 authenticated network channel; 120 aggregated skill index; 122a/n source crawlers; 130 SkillRank ranking engine; 135 recommendation surface; 140 inline-application component; 145 outcome capture component.

---

## Fig. 2, SkillRank Algorithm Flow

**Purpose.** Show the five features fanning out from a single user-context input, the weighting step, and the top-N selection.

**Suggested layout.** Single column flow.

```
                +-----------------------------+
                | User-Context Object (200)   |
                | - prompt text               |
                | - installed tools           |
                | - work signature (if opted) |
                | - recent skills             |
                | - anon_id                   |
                +-----------------------------+
                              |
        +---------+-----------+-----------+----------+
        |         |           |           |          |
        v         v           v           v          v
+-----------+ +---------+ +---------+ +---------+ +---------+
| semantic  | | tool-   | | work-   | | cohort  | | outcome |
| _match    | | stack   | | sig.    | | co-     | | attrib  |
| (210)     | | overlap | | similar | | occur   | | (250)   |
| α weight  | | (220)   | | (230)   | | (240)   | | ε weight|
|           | | β weight| | γ weight| | δ weight|           |
+-----------+ +---------+ +---------+ +---------+ +---------+
        \         |           |           |          /
         \        |           |           |         /
          v       v           v           v        v
                +-----------------------------+
                | Weighted Sum (260)          |
                | score = αf1 + βf2 + γf3     |
                |       + δf4 + εf5           |
                +-----------------------------+
                              |
                              v
                +-----------------------------+
                | Top-N Selection (270)       |
                | + per-feature breakdown     |
                +-----------------------------+
                              |
                              v
                +-----------------------------+
                | Return to runtime (280)     |
                +-----------------------------+
```

**Note.** The dashed line from "user-context object" to "work-signature similarity" should be drawn DASHED in the final figure, with a callout "computed only if user has opted into work-signature collection."

---

## Fig. 3, Asymmetric Privacy Framework

**Purpose.** Show the three independent consent toggles, their default states, and the resulting data flows.

**Suggested layout.** Three parallel rails.

```
+-------------------------------------------------------------+
|  Consent Interface (300), shown at first install           |
+-------------------------------------------------------------+
        |                  |                  |
        v                  v                  v
+----------------+ +----------------+ +----------------+
| Tool-Inventory | | Outcome-       | | Work-Signature |
| Toggle (310)   | | Tracking       | | Toggle (330)   |
|                | | Toggle (320)   | |                |
| Default: ON    | | Default: ON    | | Default: OFF   |
+----------------+ +----------------+ +----------------+
        |                  |                  |
        | if ON            | if ON            | if ON
        v                  v                  v
+----------------+ +----------------+ +----------------+
| Tool manifest  | | Applied-skill  | | Work-signature |
| transmitted    | | event +        | | vector         |
|                | | outcome label  | | transmitted    |
+----------------+ +----------------+ +----------------+
        \              |                /
         \             |               /
          v            v              v
        +---------------------------------+
        | Rotating-Salt Anonymizer (340)  |
        | anon_id = SHA256(uid || SALT_M) |
        | SALT_M rotated monthly          |
        +---------------------------------+
                       |
                       v
        +---------------------------------+
        | Aggregated Skill Index (120)    |
        | with discard-on-no-match (350)  |
        | with 90d auto-expiry (360)      |
        +---------------------------------+
```

**Callouts beneath the figure.**
- 310 default ON: low-sensitivity, reveals only configuration.
- 320 default ON: low-sensitivity, contains only skill identifier + boolean.
- 330 default OFF: higher-sensitivity, encodes recent activity vectors.
- 340 rotating salt: telemetry > 2 rotation periods cannot be re-linked.
- 350 discard policy: prompts not producing a recommendation are never persisted.
- 360 auto-expiry: work signatures expire at 90 days unless promoted to cohort centroid.

---

## Fig. 4, Cross-Vendor Observation Mechanism

**Purpose.** Show that a single ambient hook implementation is packaged for delivery into each of a plurality of agent runtimes and that all instances feed a unified backend.

**Suggested layout.** Fan-in.

```
+----------------+   +----------------+   +----------------+   +----------------+
| Claude Code    |   | Codex          |   | Cursor         |   | Gemini CLI     |
| Plugin Package | | Config Package |   | Extension Pkg  |   | Plugin Package |
| (410a)         |   | (410b)         |   | (410c)         |   | (410n)         |
+----------------+   +----------------+   +----------------+   +----------------+
        |                    |                    |                    |
        | wraps              | wraps              | wraps              | wraps
        v                    v                    v                    v
+-------------------------------------------------------------------------+
| Shared Core Observation Logic (420)                                     |
| - prompt-submission subscriber                                          |
| - post-tool-use subscriber                                              |
| - tool-manifest extractor                                               |
| - work-signature builder (subject to consent)                           |
| - transmitter                                                           |
+-------------------------------------------------------------------------+
                                       |
                                       v
                +---------------------------------------+
                | Unified Backend (120 / 130 / 145)     |
                | - aggregated skill index              |
                | - SkillRank ranking engine            |
                | - outcome capture component           |
                +---------------------------------------+
```

**Callouts.**
- 410a..410n vendor-specific delivery packages, substantially uniform internal logic.
- 420 shared core: identical observation, extraction, and transmission code across packages.
- Unified backend: data from all runtimes contributes to the same user signature, same cohort, same outcome history.

---

## Fig. 5, Data Flywheel

**Purpose.** Show the self-reinforcing loop between usage and recommendation quality.

**Suggested layout.** Closed circular loop, six nodes.

```
                  +----------------------+
                  | More users (500)     |
                  +----------------------+
                            |
                            v
                  +----------------------+
                  | More work signatures |
                  | + tool inventories   |
                  | (510)                |
                  +----------------------+
                            |
                            v
                  +----------------------+
                  | Better cohort        |
                  | centroids +          |
                  | co-occurrence stats  |
                  | (520)                |
                  +----------------------+
                            |
                            v
                  +----------------------+
                  | Higher SkillRank     |
                  | accuracy (530)       |
                  +----------------------+
                            |
                            v
                  +----------------------+
                  | More applied-skill   |
                  | events + outcomes    |
                  | (540)                |
                  +----------------------+
                            |
                            v
                  +----------------------+
                  | Tighter outcome      |
                  | attribution + better |
                  | weight learning      |
                  | (550)                |
                  +----------------------+
                            |
                            +----- loops back to (500)
```

**Caption.** The flywheel completes itself: each turn produces more usage, more usage produces more signatures and outcomes, more signatures and outcomes produce better ranks, better ranks produce more applies, and so on. Cross-vendor observation is what allows a single user's contribution to feed all five features simultaneously.

---

## Fig. 6, Work Signature Schema

**Purpose.** Show the database/structural schema of a single work-signature record.

**Suggested layout.** Table representation.

```
+--------------------------------------------------------------+
| WORK_SIGNATURE_RECORD (600)                                  |
+--------------------------------------------------------------+
| Field              | Type        | Notes                     |
+--------------------+-------------+---------------------------+
| anon_id            | string(64)  | SHA256(user_id || SALT_M) |
| created_at         | timestamp   | UTC                       |
| expires_at         | timestamp   | created_at + 90d default  |
| sub_signal_1       | string[]    | installed_tools (610)     |
| sub_signal_2       | string[]    | invoked_tools (620)       |
| sub_signal_3       | vector(N)   | prompt_categories (630)   |
| sub_signal_4       | string[]    | applied_skills (640)      |
| sub_signal_5       | float       | aggregate_outcome (650)   |
| signature_vector   | vector(D)   | derived from sub_signals  |
| promoted_to_cohort | bool        | default false             |
| cohort_centroid_id | string?     | set if promoted           |
+--------------------+-------------+---------------------------+
```

**Callouts.**
- 600 work-signature record, one per user per observation window.
- 610..650 the five sub-signals composing the work signature.
- signature_vector: the compressed embedding used for ANN similarity in feature 3.
- promoted_to_cohort + cohort_centroid_id: the auto-expiration override pathway described in the spec.

---

## Fig. 7, Outcome Attribution Flow

**Purpose.** Show how an outcome label is inferred and fed back into the SkillRank ranking engine.

**Suggested layout.** Linear sequence with feedback arrow.

```
+----------------------+
| User accepts and     |
| applies recommended  |
| skill (700)          |
+----------------------+
        |
        v
+----------------------+
| Applied-skill-event  |
| recorded (710)       |
| - rec_id, skill_id   |
| - anon_id, timestamp |
+----------------------+
        |
        v
+----------------------+
| Observation window   |
| begins (720)         |
| - default 5 min      |
+----------------------+
        |
        v
+----------------------+----------------------+
| Branch on attribution mode (730)            |
+----------------------+----------------------+
        |                |                |
        v                v                v
+--------------+ +--------------+ +--------------+
| Heuristic    | | Run-trace    | | Explicit     |
| inference    | | analysis     | | user label   |
| (740)        | | (750)        | | (760)        |
| - no resub   | | - tool-call  | | - prompt     |
|   within     | |   success    | |   surfaced   |
|   window     | | - artifacts  | |   to user    |
+--------------+ +--------------+ +--------------+
        \              |              /
         \             |             /
          v            v            v
        +-------------------------------+
        | Outcome label assigned (770)  |
        | { success | failure | null }  |
        +-------------------------------+
                       |
                       v
        +-------------------------------+
        | applied_skill_events.outcome  |
        | column written (780)          |
        +-------------------------------+
                       |
                       | feeds
                       v
        +-------------------------------+
        | outcome_attribution feature   |
        | of SkillRank (250)            |
        | Bayesian-smoothed success     |
        | rate                          |
        +-------------------------------+
                       |
                       | feeds
                       v
        +-------------------------------+
        | Future recommendations to     |
        | other users (790)             |
        +-------------------------------+
```

**Caption.** The outcome attribution loop closes within minutes of an applied-skill event (heuristic inference) or within the duration of a captured run-trace (trace inference) or upon explicit user response (explicit inference). The resulting label updates the Bayesian smoothed success rate for the skill, which is consumed by all future SkillRank computations on behalf of all users.

---

## Drawing-Preparation Checklist for the Founder

- [ ] Recreate each of Figures 1 through 7 in a vector drawing tool (draw.io recommended; Excalidraw acceptable).
- [ ] Use only black line on white background. No color, no grayscale fills.
- [ ] Use sans-serif typeface, font size 10 to 12 point in the figure.
- [ ] Place all reference numerals adjacent to their referent, in the same orientation as the body text on the page.
- [ ] One figure per page is acceptable and preferred.
- [ ] Margins: 2.5 cm top, 2.5 cm left, 1.5 cm right, 1.0 cm bottom.
- [ ] Combine all seven pages into a single PDF, named `drawings.pdf`, for upload to Patent Center as a separate document from the specification PDF.
- [ ] Verify every numeral introduced in the figures (100, 105a, 110, 115, 120, 122a, 130, 135, 140, 145, 200, 210, 220, 230, 240, 250, 260, 270, 280, 300, 310, 320, 330, 340, 350, 360, 410a..n, 420, 500..550, 600, 610..650, 700..790) appears at least once in either the figures or the specification body.
