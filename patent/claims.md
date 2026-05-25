# Claims

**DRAFT v0.1, founder review required before filing.** This package is informational and prepared for self-filing. It does not constitute legal advice.

Claims are not strictly required in a provisional application under 35 U.S.C. § 111(b). They are included here to define the scope of the protection intended in the subsequent non-provisional filing and to crystallize the inventive subject matter as of the priority date.

---

## Independent Claims

### Claim 1 (Method)

A computer-implemented method for cross-vendor skill recommendation in artificial-intelligence agent runtimes, the method comprising:

(a) observing, via an ambient client-side hook installed in each of a plurality of artificial-intelligence agent runtimes including but not limited to Claude Code, Codex, Cursor, and Gemini CLI, user prompt submissions originating from a single end user across said plurality of artificial-intelligence agent runtimes;

(b) on submission of a user prompt within any of said plurality of artificial-intelligence agent runtimes, extracting, by the ambient client-side hook, a user-context object comprising at least the prompt text, a manifest of currently installed external tools associated with the user, and an anonymized user identifier;

(c) transmitting the user-context object over an authenticated network channel to a server-side ranking subsystem;

(d) computing, by the server-side ranking subsystem, for each of a plurality of candidate skills indexed in an aggregated skill index that aggregates skills from a plurality of independent skill source registries, a composite recommendation score equal to a weighted linear combination of at least five features comprising:
  - a semantic-match feature measuring similarity between the prompt text and a textual description of the candidate skill,
  - a tool-stack-overlap feature measuring overlap between the manifest of currently installed external tools and a manifest of tools required by the candidate skill,
  - a work-signature-similarity feature measuring similarity between a work-signature representation of the user and a work-signature representation associated with the candidate skill,
  - a cohort-co-occurrence feature measuring empirical co-occurrence of the candidate skill with skills recently applied by the user, and
  - an outcome-attribution feature measuring a smoothed estimate of the success rate of prior applications of the candidate skill;

(e) selecting a top-ranked subset of the candidate skills based on the composite recommendation score and returning the top-ranked subset to the originating artificial-intelligence agent runtime;

(f) presenting at least one of the top-ranked subset to the user via a recommendation surface within the originating artificial-intelligence agent runtime;

(g) on user acceptance of a recommended skill, retrieving content of the recommended skill from the aggregated skill index and executing the content inline within the originating artificial-intelligence agent runtime without prior installation of the recommended skill from any external skill source registry; and

(h) recording an applied-skill-event record corresponding to the user acceptance for use in future computations of the outcome-attribution feature.

### Claim 2 (System)

A system for cross-vendor skill recommendation, comprising:

(a) an ambient client-side hook component packaged for installation in each of a plurality of artificial-intelligence agent runtimes, the ambient client-side hook component configured to subscribe to prompt-submission events and post-tool-use events within each of said plurality of artificial-intelligence agent runtimes;

(b) an aggregated skill index comprising a normalized representation of skills aggregated from a plurality of independent skill source registries, each skill in the aggregated skill index being associated with at least a textual description, a vector embedding of the textual description, and a manifest of required tools;

(c) a server-side ranking subsystem configured to compute, for each of a plurality of candidate skills in the aggregated skill index, a composite recommendation score equal to a weighted linear combination of at least five features comprising a semantic-match feature, a tool-stack-overlap feature, a work-signature-similarity feature, a cohort-co-occurrence feature, and an outcome-attribution feature, and further configured to return a top-ranked subset of the candidate skills to a requesting one of said plurality of artificial-intelligence agent runtimes;

(d) an inline-application component configured, upon user acceptance of a recommended skill within the requesting artificial-intelligence agent runtime, to retrieve content of the recommended skill from the aggregated skill index and inject said content into an active session of the requesting artificial-intelligence agent runtime; and

(e) an outcome-capture component configured to record an applied-skill-event record on user acceptance of a recommended skill and to record an outcome label associated with the applied-skill-event record, said outcome label being supplied as input to future computations of the outcome-attribution feature.

### Claim 3 (Asymmetric Privacy Framework)

A computer-implemented method for collecting user-behavior telemetry to improve a skill recommendation system, the method comprising:

(a) defining a plurality of telemetry classes comprising at least a tool-inventory class, an outcome-tracking class, and a work-signature class, wherein the work-signature class is associated with telemetry of higher inherent sensitivity than telemetry of the tool-inventory class and telemetry of the outcome-tracking class;

(b) exposing to a user three independent consent toggles respectively governing the tool-inventory class, the outcome-tracking class, and the work-signature class;

(c) assigning to each of the three independent consent toggles a class-specific default state, wherein the default state assigned to the consent toggles governing the tool-inventory class and the outcome-tracking class is a consenting state, and the default state assigned to the consent toggle governing the work-signature class is a non-consenting state, the asymmetric assignment of default states corresponding to the differing inherent sensitivity of each telemetry class;

(d) collecting telemetry of any given class only when the corresponding consent toggle is in the consenting state;

(e) anonymizing each transmitted telemetry record by keying it on an anonymized user identifier computed as a cryptographic hash of a canonical user identifier concatenated with a periodically rotated salt value, and destroying salt values older than a configured retention period such that telemetry older than approximately two rotation periods cannot be re-linked to the canonical user identifier; and

(f) discarding, without persistence to durable storage, any contextual prompt that does not produce a recommendation scoring above a configured score threshold.

---

## Dependent Claims

### Claim 4

The method of Claim 1, wherein the semantic-match feature is computed as a cosine similarity between a vector embedding of the prompt text and a precomputed vector embedding of the textual description of the candidate skill, optionally rescaled by a monotonic transformation onto a bounded interval.

### Claim 5

The method of Claim 1, wherein the tool-stack-overlap feature is computed as a Jaccard similarity between the set of currently installed external tools and the set of tools required by the candidate skill, with the convention that the similarity is unity if both sets are empty and zero if exactly one set is empty.

### Claim 6

The method of Claim 5, wherein the tool-stack-overlap feature is a weighted Jaccard similarity in which tool identifiers are weighted by an inverse-document-frequency factor reflecting rarity of each tool across an aggregated user population.

### Claim 7

The method of Claim 1, wherein the work-signature-similarity feature is computed as a similarity between a work-signature vector representing the user and a centroid work-signature vector associated with the candidate skill, the centroid being computed over the work-signature vectors of users who have previously applied the candidate skill.

### Claim 8

The method of Claim 7, wherein the work-signature vector representing the user comprises at least five sub-signals, the five sub-signals comprising:
- an inventory of installed external tools and model-context-protocol servers;
- an inventory of actually-invoked external tools over a configurable lookback window;
- a vector representation of inferred prompt categories over the lookback window;
- a set of skills applied over the lookback window; and
- an aggregate measure of outcome success across applied skills over the lookback window.

### Claim 9

The method of Claim 7, wherein the similarity between the work-signature vector and the centroid work-signature vector is computed by approximate-nearest-neighbor search over a precomputed index of skill-associated centroid vectors.

### Claim 10

The method of Claim 1, wherein the cohort-co-occurrence feature is computed as a recency-decayed sum of empirical conditional probabilities, each empirical conditional probability representing the probability that a user who applied a given recently-applied skill of the user also applied the candidate skill within a comparable observation window.

### Claim 11

The method of Claim 1, wherein the outcome-attribution feature is computed as a Bayesian-smoothed estimate of the success rate of the candidate skill, the smoothing being parameterized by pseudo-count parameters of a Beta prior distribution selected to bound estimates when an apply count for the candidate skill is small.

### Claim 12

The method of Claim 1, wherein the weights of the weighted linear combination are initially assigned heuristically and are subsequently revised by supervised training of a model on labeled apply-and-success outcome data, the model comprising one of a logistic-regression model and a gradient-boosted decision-tree model, and the revised weights being derived from normalized coefficients of said model.

### Claim 13

The method of Claim 12, wherein the supervised training is partitioned along a cohort axis such that distinct weights of the weighted linear combination are assigned to distinct user cohorts.

### Claim 14

The method of Claim 1, wherein the anonymized user identifier transmitted from the ambient client-side hook to the server-side ranking subsystem is computed as a cryptographic hash of a canonical user identifier concatenated with a periodically rotated salt value, the salt being rotated on a periodic basis selected from the group consisting of weekly, monthly, and configurable per-data-class.

### Claim 15

The method of Claim 1, wherein on submission of a user prompt that does not produce a recommendation scoring above a configured score threshold, the user-context object is discarded immediately upon completion of the ranking computation and is not persisted to durable storage.

### Claim 16

The method of Claim 1, wherein the plurality of artificial-intelligence agent runtimes in step (a) explicitly includes each of Anthropic's Claude Code, OpenAI's Codex, Cursor's integrated agent, and Google's Gemini command-line interface, and wherein the ambient client-side hook is packaged in a respective vendor-specific delivery format for each of said artificial-intelligence agent runtimes while implementing a substantially uniform observation and transmission logic across all of said delivery formats.

### Claim 17

The method of Claim 1, further comprising, after step (h), inferring an outcome label associated with the applied-skill-event record by observing user activity within a configurable observation window following the user acceptance, wherein a successful outcome is inferred at least in part based on absence of re-submission of a substantially similar prompt within the observation window.

### Claim 18

The method of Claim 17, wherein the outcome label is determined at least in part by analysis of a captured run-trace of the executed content, the captured run-trace recording at least success or failure of each external-tool invocation occurring during execution and a summary of resulting artifacts.

### Claim 19

The system of Claim 2, further comprising a consent-management component configured to expose to the user three independent consent toggles respectively governing collection of tool-inventory telemetry, outcome-tracking telemetry, and work-signature telemetry, the consent-management component being configured to assign default consenting state to the tool-inventory and outcome-tracking toggles and default non-consenting state to the work-signature toggle.

### Claim 20

The method of Claim 3, further comprising auto-expiring work-signature telemetry records after a configurable retention window unless promoted to a long-lived cohort-centroid record, the promotion process stripping the originating anonymized user identifier and retaining only an aggregated centroid representation.

---

## Notes on Claim Strategy

The independent claims (1, 2, 3) are deliberately broad: Claim 1 covers the method of cross-vendor multi-signal ranking, Claim 2 covers the system instantiating the method, and Claim 3 covers the asymmetric-privacy framework as a stand-alone invention. This structure protects against a competitor implementing only the privacy framework, or only the cross-vendor observation, without the full SkillRank algorithm.

The dependent claims narrow on (a) each of the five features individually (Claims 4 through 11), so that a competitor cannot evade by replacing exactly one feature with a near-equivalent; (b) the ML weight-learning step (Claims 12 and 13); (c) the rotating-salt anonymization and discard-on-no-match policies (Claims 14 and 15); (d) the explicit cross-vendor list (Claim 16); and (e) the outcome-attribution mechanisms (Claims 17 and 18). The non-provisional filing should consider adding further dependent claims directed to specific embedding models, specific recency-decay functions, specific ANN index data structures, and specific consent-interface user-interface elements, each of which may carry independent prior-art exposure.

The word "comprising" is used throughout in its broadest claim-drafting sense, signaling an open-ended list to which further unrecited elements may be added without escaping infringement. The phrase "including but not limited to" is used in Claim 1 to anticipate future agent runtimes not yet on the market at the priority date.
