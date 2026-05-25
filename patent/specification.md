# Specification

**Title:** Method for Cross-Vendor Ambient Skill Recommendation Using Multi-Vendor Work Signatures with Asymmetric Privacy Framework

**Inventor:** Rabi Gupta

**DRAFT v0.1, founder review required before filing.** This package is informational and prepared for self-filing. It does not constitute legal advice.

---

## Field of the Invention

The present invention relates generally to the field of machine-assisted software engineering, and more particularly to systems and methods for automated discovery, ranking, and recommendation of executable instructional artifacts (commonly referred to as "skills") that are consumed by large-language-model-driven agent runtimes. The invention concerns recommendation systems that operate ambiently across a plurality of independent agent runtime environments and that rank candidate skills using a weighted combination of semantic, behavioral, cohort, and outcome-derived signals.

The invention further relates to privacy-preserving telemetry architectures suitable for the collection of multi-vendor user behavior signatures, and to data governance frameworks that distinguish between low-sensitivity and high-sensitivity classes of telemetry, applying default opt-in or default opt-out treatment to each class respectively.

## Background of the Invention

Large-language-model-driven agent runtimes have emerged as a dominant interface through which knowledge workers, software developers, and other end users invoke computational assistance. Such runtimes include, by way of non-limiting example, Anthropic's Claude Code, OpenAI's Codex command-line interface, Cursor's IDE-embedded agent, Google's Gemini command-line interface, and numerous other compatible runtimes that adhere to publicly published interoperability standards for executable instructional artifacts (hereinafter "skills"). A skill is typically expressed as a structured document (for example, a SKILL.md file in the agentskills.io public format) containing a natural-language description of a task, a procedural recipe for accomplishing that task, and a manifest of external tools, application programming interfaces, or model-context-protocol ("MCP") servers required for execution.

The skill ecosystem is presently fragmented across a plurality of competing marketplaces, registries, and code repositories, each typically affiliated with a single agent runtime vendor or single distribution surface. Existing systems for skill discovery suffer from several deficiencies, including but not limited to: (i) confinement to a single vendor's runtime, such that a skill discovered in one runtime is not surfaced to a user working in a different runtime; (ii) reliance on a single signal, typically a one-shot semantic match between the user's most recent textual prompt and the textual description of a candidate skill, without taking into account the user's installed tooling, prior workflow history, peer-cohort behavior, or measured success of previous skill applications; (iii) absence of any outcome-attribution mechanism by which the recommendation system can learn whether a recommended skill actually solved the user's underlying problem; and (iv) reliance on user-initiated pull-based discovery, requiring the user to interrupt the active session, navigate to a marketplace, and identify candidate skills before any recommendation can occur. These deficiencies contribute to a widely observed phenomenon hereinafter referred to as the "downloaded but never used" problem, in which a user installs a skill in anticipation of future need but never invokes it because the skill is not surfaced to the user at the moment that the corresponding need arises.

Prior art ambient observation systems for collecting user behavior data are well documented in adjacent domains (for example, browser-based recommendation systems and operating-system telemetry). Such prior art systems uniformly treat all classes of behavioral telemetry with substantially identical privacy treatment, typically either an all-or-nothing opt-in or an opaque default-collect posture. No prior art system known to the inventor has applied an asymmetric privacy framework in which distinct classes of telemetry are governed by independent consent toggles with class-specific default states selected on the basis of the inherent sensitivity of each class. Further, no prior art system known to the inventor has combined cross-vendor ambient observation of agent-runtime user behavior with a multi-signal weighted ranking algorithm for skill discovery, nor has any prior art system applied outcome-attribution post-application telemetry to refine such a ranking over time.

## Summary of the Invention

The present invention provides a computer-implemented method, and corresponding system, for ambiently observing user activity across a plurality of independent agent runtimes and surfacing, at the moment of need, a ranked list of executable skills selected from a centralized skill index that aggregates skills from a plurality of independent skill registries. The recommendation is produced by a multi-signal ranking algorithm hereinafter referred to as "SkillRank," which combines a weighted sum of at least five distinct features: (1) a semantic similarity feature comparing the user's current contextual prompt against the textual description of each candidate skill; (2) a tool-stack overlap feature comparing the user's installed external tooling inventory against the tooling required by each candidate skill; (3) a work-signature similarity feature comparing a compact representation of the user's recent agent-runtime activity against the corresponding representation of users who have previously applied each candidate skill; (4) a cohort co-occurrence feature comparing the candidate skill against skills recently applied by the user, with a recency-decayed weight; and (5) an outcome-attribution feature derived from post-application telemetry indicating whether the candidate skill, when previously recommended and applied, resolved the user's underlying task.

The invention further provides an asymmetric privacy framework comprising three independent consent toggles governing three distinct classes of telemetry, with class-specific default states. A tool-inventory class and an outcome-tracking class default to the consenting state; a work-signature class defaults to the non-consenting state and requires affirmative explicit user action to enable. Telemetry collected under any class is anonymized through a rotating-salt hashing function such that data older than a periodic salt rotation interval cannot be re-linked to the originating user. Contextual prompts that do not produce a recommendation above a configurable score threshold are discarded and are never persisted to durable storage.

The invention further provides a data flywheel architecture in which the act of consuming the recommendation system produces telemetry that improves the recommendation system, such that recommendation quality monotonically improves with aggregate usage, in a manner analogous to the way in which a citation graph or click-through graph improves the quality of a general-purpose search engine.

## Detailed Description of the Preferred Embodiment

### Overview of System Architecture

In a preferred embodiment, the invention is realized as a distributed system comprising four cooperating subsystems, depicted in Figure 1 and described as follows.

A first subsystem, the **ambient client-side hook (110)**, is a software component installed within each of a plurality of agent runtimes (105a, 105b, 105c, 105n) under control of a single end user. The plurality of agent runtimes includes, in preferred embodiments, Claude Code, Codex, Cursor, Gemini CLI, and any further agent runtime that supports a hook-based extension mechanism analogous to the UserPromptSubmit and PostToolUse lifecycle events. The ambient client-side hook is configured to register for each of (i) a prompt-submission event, fired when the user submits a new contextual prompt to the agent runtime, and (ii) a post-tool-use event, fired after the agent runtime invokes an external tool or applies a skill.

A second subsystem, the **aggregated skill index (120)**, is a centralized data store that contains a normalized representation of skills aggregated from a plurality of independent skill source repositories, including but not limited to public version-control repositories, vendor-operated skill marketplaces, model-context-protocol server registries, and skill metadata aggregators. Each skill record in the aggregated skill index comprises at least: a unique identifier, a source identifier, a textual description, a vector embedding of the textual description, a manifest of required tools, and a manifest of applicable categories or tags.

A third subsystem, the **SkillRank ranking engine (130)**, is a server-side computational component that accepts as input a context object representing the requesting user's current activity and signature state, and that produces as output a ranked list of candidate skills drawn from the aggregated skill index, each annotated with a composite score and a per-feature score breakdown. The composite score is computed as a weighted linear combination of at least five features, the weights being either heuristically assigned in an initial embodiment or learned by supervised regression in a subsequent embodiment.

A fourth subsystem, the **recommendation surface (135)** and associated **inline application mechanism (140)**, returns the top-N candidate skills to the originating agent runtime, where they are presented to the user either passively (deposited into a local pull-buffer for the user to retrieve via an explicit command) or actively (rendered in response to a user-typed invocation pattern). Upon user acceptance, the content of the selected skill is fetched from the aggregated skill index, injected into the active agent runtime session, and executed inline without any prior installation, download, or marketplace navigation. Following application, an **outcome capture component (145)** records telemetry concerning the application event and any subsequent activity within a configurable observation window, for use in future iterations of the outcome-attribution feature.

### Cross-Vendor Observation Mechanism

A novel and significant aspect of the invention is the use of a single substantially-uniform client-side hook implementation that is packaged in vendor-specific delivery formats for installation into each of the plurality of agent runtimes. Each agent runtime exposes a lifecycle event interface; the hook implementation is configured to subscribe to the substantially equivalent set of events in each runtime. In a preferred embodiment, the hook is delivered as a Claude Code plugin, a Codex configuration block, a Cursor extension, and a Gemini CLI plugin, with each package wrapping the same core observation logic.

On firing of a prompt-submission event, the ambient client-side hook (110) extracts: (i) the user's current prompt text; (ii) a manifest of currently installed external tools and MCP servers, obtained from the runtime's tool-registration application programming interface; (iii) a window of recent prompts from the active session, subject to a configurable retention window; and (iv) a session identifier and an anonymized user identifier. The extracted data is transmitted over an authenticated network channel to the aggregated skill index server (120), where it is provided as input to the SkillRank ranking engine (130).

On firing of a post-tool-use event, and specifically on a tool-use event corresponding to the application of a recommended skill, the ambient client-side hook records an applied-skill-event tuple containing at least the recommendation identifier, the applied skill identifier, the user-anonymized identifier, and a timestamp. The applied-skill event is transmitted to the aggregated skill index server and inserted into an applied-skill-events table that constitutes the substrate for the outcome-attribution feature.

### Aggregated Skill Index

The aggregated skill index (120) is constructed by a plurality of source-specific crawlers (122a, 122b, 122n), each configured to ingest skills from a distinct source registry. Each crawler normalizes source-specific metadata into a uniform schema and dispatches each ingested skill to an embedding service (124) that computes a dense vector representation of the skill's textual description using a sentence-embedding model. The dense vector representation is stored alongside the normalized metadata in a vector-capable persistent data store (126), enabling approximate-nearest-neighbor lookup over the embedding space.

### The Five Ranking Features

The SkillRank composite score for a given (user-context, candidate-skill) pair is computed as:

```
score(u, s) = α · semantic_match(u, s)
            + β · tool_stack_overlap(u, s)
            + γ · work_signature_similarity(u, s)
            + δ · cohort_co_occurrence(u, s)
            + ε · outcome_attribution(s)
```

where u denotes a user-context object and s denotes a candidate-skill record, and where α, β, γ, δ, and ε are non-negative real-valued weights summing to a constant (preferably 1.0). Each feature is described in detail below.

**Feature 1: semantic_match(u, s).** Given the user's current prompt text p and the candidate skill's textual description d, the feature returns a value in [0, 1] obtained by computing the cosine similarity of the vector embedding of p and the precomputed vector embedding of d, optionally rescaled by a monotonic transformation (such as a sigmoid or piecewise-linear function) to map raw cosine similarity onto a bounded interval. In a preferred embodiment, embeddings are produced by a transformer-based sentence-embedding model with output dimension on the order of one thousand.

**Feature 2: tool_stack_overlap(u, s).** Given the user's installed tool manifest T_u (a set of tool identifiers) and the candidate skill's required tool manifest T_s, the feature returns the Jaccard similarity:

```
tool_stack_overlap(u, s) = |T_u ∩ T_s| / |T_u ∪ T_s|
```

with the convention that the value is 1.0 if both sets are empty and 0.0 if exactly one set is empty. In an alternative embodiment, a weighted Jaccard similarity is used in which tool identifiers are weighted by an inverse-document-frequency factor reflecting the rarity of each tool across the aggregated user population.

**Feature 3: work_signature_similarity(u, s).** A work signature is defined herein as a compact vector representation of a user's recent agent-runtime activity, comprising at least the following five sub-signals: (a) the inventory of installed tools and MCP servers; (b) the inventory of actually-invoked tools over a configurable lookback window; (c) a histogram or vector representation of inferred prompt categories over the lookback window; (d) the set of skills applied over the lookback window; and (e) an aggregate measure of outcome success across applied skills over the lookback window. The work signature is computed client-side under the conditions specified in the privacy framework described below, and transmitted to the aggregated skill index server only if the user has affirmatively opted into work-signature collection.

The work_signature_similarity feature compares the requesting user's work signature against the centroid of work signatures associated with users who have previously applied the candidate skill. In a preferred embodiment, similarity is measured by cosine similarity in the work-signature vector space, and the lookup is performed using approximate-nearest-neighbor search over a precomputed index of skill-associated centroids. In an alternative embodiment, the comparison is performed using earth-mover's-distance or other vector-divergence measures.

**Feature 4: cohort_co_occurrence(u, s).** Given the set of skills recently applied by the user, S_u = {s_1, s_2, ..., s_k}, with respective recency-weighted relevance values r_1, r_2, ..., r_k, the feature returns:

```
cohort_co_occurrence(u, s) = Σ_i r_i · P(s | s_i)
```

where P(s | s_i) denotes the empirical probability that, among all users who have applied skill s_i within a recent observation window, the same user also applied skill s within a comparable observation window. The recency weight r_i is preferably an exponential decay function of the elapsed time since application of s_i. The feature thereby captures the intuition that skills which empirically cluster together in user workflows are mutually predictive.

**Feature 5: outcome_attribution(s).** Given the set of applied-skill-event records for the candidate skill, the feature returns a Bayesian-smoothed estimate of the success rate:

```
outcome_attribution(s) = (success_count(s) + α_prior)
                      / (apply_count(s) + α_prior + β_prior)
```

where α_prior and β_prior are constants representing pseudo-counts of a Beta prior distribution, selected to avoid extreme estimates when the apply count for a skill is small. Success is determined by an outcome-inference component described separately below.

### Weight Optimization

In an initial embodiment ("SkillRank v0"), the feature weights α, β, γ, δ, ε are heuristically assigned, with a preferred initial assignment placing the largest weight on semantic_match and tool_stack_overlap, lower weight on cohort_co_occurrence and outcome_attribution, and lowest weight on work_signature_similarity (whose data substrate accumulates over time and is initially sparse). The heuristic assignment is published in a server-side configuration store and may be revised without redeployment.

In a subsequent embodiment ("SkillRank v1"), the weights are learned through supervised training over labeled apply-and-success outcomes derived from the applied-skill-events table. In one such embodiment, a logistic-regression model is trained to predict the probability that a recommended-and-applied skill resulted in a successful outcome, with the five features serving as inputs and the success label serving as the target. The learned model coefficients are normalized and adopted as the weights α, β, γ, δ, ε. In an alternative embodiment, a gradient-boosted decision-tree model (for example, XGBoost) is used instead of logistic regression, with the model's per-feature attribution scores serving as the basis for weight assignment.

In yet a further embodiment, the weights are personalized per user or per cohort of similar users, by partitioning the training data along cohort axes and fitting an independent model per partition.

### Asymmetric Privacy Framework

A distinguishing aspect of the invention is the asymmetric privacy framework governing telemetry collection. Three independent consent toggles are exposed to the user, each governing a distinct class of telemetry:

- **Tool-inventory consent.** Default state: ON. Governs the collection of the user's installed-tool manifest. Justified as low-sensitivity because the tool manifest reveals only configuration choices already exposed to the agent runtime vendor and contains no contents of user work product.
- **Outcome-tracking consent.** Default state: ON. Governs the collection of applied-skill-event records and the inferred success-or-failure label associated with each. Justified as low-sensitivity because outcome records contain only the identifier of an applied skill and an inferred boolean label, and do not contain any contents of user work product or any user identifier other than an anonymized hash.
- **Work-signature consent.** Default state: OFF. Governs the collection of the work-signature vector described above. Categorized as higher-sensitivity because the work-signature includes inferred categories of recent prompts and a representation of recent workflow activity, which information, although already anonymized and compressed, may be considered by some users as more revealing than the tool inventory alone.

The asymmetric default-state assignment reflects an explicit design decision to align default behavior with the inherent sensitivity of each class of telemetry, rather than applying a uniform opt-in or opt-out posture to all classes. The user is presented with the three toggles in a visible consent interface at first installation and may revise the toggles at any time through a settings interface.

**Rotating-salt anonymization.** All telemetry transmitted to the aggregated skill index server is keyed on an anonymized user identifier computed as:

```
anon_id = SHA256(user_id || MONTHLY_SALT)
```

where user_id is the canonical user identifier and MONTHLY_SALT is a cryptographically random value rotated on a periodic basis, preferably monthly. The current and immediately preceding salts are retained server-side to permit short-window aggregation; salts older than the immediately preceding period are securely destroyed, with the consequence that telemetry records older than approximately two rotation periods cannot be re-linked to the originating user identifier. In an alternative embodiment, the rotation interval is configurable per data class, with higher-sensitivity classes (such as work-signature) subject to shorter rotation intervals.

**Discard-on-no-match policy.** A prompt that does not produce a recommendation scoring above a configurable threshold is discarded immediately upon completion of the ranking pass and is never persisted to durable storage. This policy ensures that the act of typing a prompt that fails to match any skill does not contribute any telemetry to the centralized data store.

**Auto-expiration of work signatures.** Work signature records auto-expire after a configurable retention window (preferably ninety days) unless promoted to a long-lived "confirmed cohort" record. Promotion occurs when the work signature contributes to a stable cohort cluster that is referenced by ongoing recommendations; the promotion process strips the originating user identifier entirely and retains only the cohort centroid.

### Outcome Attribution Mechanism

The outcome label associated with an applied-skill event is determined by an outcome-inference component. In an initial embodiment, the outcome is inferred heuristically by observing user activity within a configurable observation window (preferably five minutes) following the apply event: a successful outcome is inferred if the user does not re-issue a substantially similar prompt and does not apply a substantially similar skill within the observation window, on the theory that absence of corrective activity indicates that the applied skill resolved the user's task. In a subsequent embodiment, the outcome is inferred by analysis of a captured run-trace of the applied skill's execution, including the success or failure of each tool invocation and a summary of the resulting artifacts.

In yet a further embodiment, the user is invited to provide an explicit outcome label by presenting a non-blocking prompt at the conclusion of each applied-skill event. The explicit label, when provided, supersedes the heuristic or trace-based inference.

### Data Flywheel

A further aspect of the invention is the self-reinforcing nature of the system. Each additional user contributes additional work signatures (under the conditions of the privacy framework), additional applied-skill events, and additional outcome data. The accumulation of these data classes improves: (i) the cohort centroids referenced by feature 3, increasing the discriminative power of work_signature_similarity; (ii) the empirical co-occurrence probabilities referenced by feature 4, increasing the predictive power of cohort_co_occurrence; and (iii) the success-rate estimates referenced by feature 5, decreasing the Bayesian smoothing-induced bias of outcome_attribution. Improved feature quality produces improved rankings, which in turn produces improved apply rates, which in turn produces a larger and richer corpus of applied-skill events, completing the flywheel. The data flywheel is enabled in significant part by the cross-vendor observation mechanism, since a single user's activity across multiple agent runtimes is unified at the aggregated skill index server and contributes to the same set of signatures and events.

## Industrial Applicability

The invention is industrially applicable in any context in which large-language-model-driven agent runtimes are deployed and in which the ecosystem of available executable instructional artifacts is sufficiently large that ranked discovery is necessary. Such contexts include, by way of non-limiting example: software-development tooling for individual engineers and engineering teams; automated workflow systems for sales, marketing, customer-success, and other non-engineering knowledge-work disciplines; embedded agent runtimes within enterprise productivity suites; and any further context in which a heterogeneous corpus of executable instructions is consumed by an agent runtime on behalf of a human user.

The invention is further applicable as a substrate for downstream applications including, by way of non-limiting example: recommendation analytics dashboards exposing per-skill apply-and-success metrics to skill authors; quality and freshness monitoring of public skill corpora; and orchestration systems that compose multiple skills into multi-step workflows on behalf of a user.

## Examples and Embodiments

### Example 1: End-to-End Recommendation and Inline Application

A user is engaged in an active session within Claude Code and submits the prompt: "help me build a HubSpot integration in Next.js." The ambient client-side hook (110) fires on the prompt-submission event, extracts the prompt text, the user's installed tool manifest (which includes a Vercel deployment tool and a generic HTTP client tool, but does not include a HubSpot-specific MCP server), the user's recent applied-skill set (which includes two recently-applied Next.js scaffolding skills), and an anonymized user identifier.

The aggregated skill index (120) is queried; the SkillRank ranking engine (130) scores approximately eleven thousand candidate skills using the five-feature weighted sum described above. The top match is a skill titled "hubspot-outbound-sync-via-mcp" by a contributor "@rabgpt" with a composite score of 0.91, driven principally by a high semantic_match value and a high cohort_co_occurrence value (because users who recently applied Next.js scaffolding skills frequently also apply HubSpot integration skills). The second match is "salesforce-to-hubspot-sequence-import" (score 0.84) and the third is "outbound-flow-attribution" (score 0.78). The top match is surfaced inline within the active agent runtime, accompanied by a fifteen-word fit-reason rendering generated by an auxiliary language model.

The user accepts the recommendation. The content of the selected skill is fetched from the aggregated skill index, injected into the active session, and executed inline. The outcome capture component (145) observes that the user does not re-issue a substantially similar prompt within the next five minutes and infers a successful outcome, which inference is recorded in the applied-skill-events table and contributes to the outcome_attribution feature for future recommendations of the same skill.

### Example 2: Tool-Stack-Conditioned Differential Ranking

Two distinct users submit substantially identical prompts: "build me a prospect list of fintech companies in Berlin." User A's installed tool manifest includes a customer-relationship-management MCP server, a sales-engagement-platform MCP server, and a contact-enrichment MCP server. User B's installed tool manifest includes a Postgres database MCP server, a unit-test runner, and a code-formatting tool.

The semantic_match feature returns substantially identical scores for both users for any given candidate skill, since the prompt is identical. The tool_stack_overlap feature, however, returns markedly different scores: for a candidate skill titled "prospect-discovery-via-sales-stack," tool_stack_overlap is high for User A and effectively zero for User B; for a candidate skill titled "scrape-and-load-prospect-data-into-postgres," tool_stack_overlap is high for User B and effectively zero for User A. The composite SkillRank score therefore differs materially between the two users, and the top-ranked skill surfaced to each user is the skill best matched to that user's actually-installed tooling. The "downloaded but never used" problem is thereby avoided, since the recommendation reflects the tools the user can in fact invoke.

### Example 3: Asymmetric Privacy in Operation

Two distinct users complete the consent interface at first installation. User A leaves all three toggles in their default state (tool-inventory ON, outcome-tracking ON, work-signature OFF). User B affirmatively enables the work-signature toggle in addition.

For User A, recommendations are produced by the SkillRank ranking engine using only the four features supported by the consented telemetry: semantic_match, tool_stack_overlap, cohort_co_occurrence (which depends only on the user's recently applied skills, a class governed by outcome-tracking consent), and outcome_attribution. The work_signature_similarity feature is omitted, and its weight γ is redistributed across the remaining four features in proportion to their nominal weights.

For User B, all five features are computed and combined. The work_signature_similarity feature contributes to a measurably higher recommendation install rate, particularly for skills whose canonical descriptions do not closely match the user's prompt but whose application history correlates strongly with the work-signature cohort of which User B is a member. The system thereby implements the asymmetric trade described above: a user who elects to share the higher-sensitivity work signature receives recommendations of measurably higher utility, while a user who declines to share the higher-sensitivity work signature continues to receive recommendations derived from the lower-sensitivity feature subset.

In both cases, contextual prompts that fail to produce a recommendation above the configured score threshold are discarded immediately and are never persisted, and all telemetry transmitted to the aggregated skill index server is keyed on a rotating-salt anonymized identifier.

---

## Closing Note

The foregoing description sets forth a preferred embodiment and several alternative embodiments of the invention. The invention is not limited to the embodiments described and is intended to encompass all variations, modifications, and equivalents that fall within the scope of the appended claims. References to specific agent runtimes, embedding models, regression techniques, hash functions, retention windows, threshold values, and weight assignments are illustrative and not limiting; any substantially equivalent component, algorithm, or parameter value may be substituted without departing from the scope of the invention.
