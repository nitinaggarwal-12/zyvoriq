# AI-006 — Decision, Taste & Learning Intelligence

| Attribute | Value |
| :--- | :--- |
| Document ID | AI-006 |
| Owner | AI Product & Applied Intelligence |
| Status | Active |
| Priority | P1 after R1 production core |
| Parents | STR-001, PRD-000, ARC-005 |

## 1. Purpose

The durable Zyvoriq moat is the intelligence above interchangeable generation models. This specification defines how Zyvoriq makes, evaluates and learns creative decisions without turning performance optimization into repetitive or manipulative content.

## 2. Decision dimensions

The Decision Arbiter evaluates candidate actions using:

- safety, identity, rights and legal constraints;
- factual/evidence confidence;
- explicit user intent and locked semantics;
- brand fit;
- audience value;
- creative taste and distinctiveness;
- business objective;
- predicted performance;
- feasibility;
- cost and latency.

Hard constraints cannot be traded for predicted engagement.

## 3. Brief intelligence

A brief is normalized into structured fields: objective, audience, desired behavior, platform, content archetype, duration, tone, evidence needs, CTA, references, brand constraints, rights constraints and risk tier. Missing fields may be inferred only with recorded confidence; material ambiguity is surfaced before irreversible/publishing actions.

## 4. Creative search

Zyvoriq should search across genuinely different creative territories rather than produce near-duplicate candidates. Candidate families may include authority, humor, curiosity, conflict, demonstration, transformation, emotional story, documentary, social proof, minimalism and visual spectacle.

Candidates are pruned cheaply before expensive media generation. The system keeps the rejected hypotheses and reasons so it can avoid repeatedly exploring known-bad directions.

## 5. Hook, narrative and taste evaluation

Hook dimensions include relevance, clarity, specificity, novelty, credibility, curiosity, emotional tension, brand fit, promise/payoff consistency and claim risk.

Narrative state tracks what the viewer knows, unresolved questions, evidence introduced, emotional state and remaining payoff.

Taste is contextual. A raw UGC Reel is not failed for lacking cinematic polish; a premium campaign is not passed because it feels casually authentic. Taste modes carry different evaluation weights and include an anti-overproduction check.

## 6. Anti-homogenization

Measure similarity to the creator's recent output and to common system patterns. Detect repeated phrases, generic AI metaphors, identical hook structures, overused transitions, recurring camera grammar and excessive template reuse. Optimization must preserve a configurable exploration budget for novel concepts.

## 7. Creator, Brand and Audience DNA

Memory is scoped and versioned.

- Creator DNA: language, presentation, creative preferences, negative preferences and recurring production choices.
- Brand DNA: positioning, terminology, claims policy, evidence rules, visual grammar, representation rules and CTAs.
- Audience DNA: knowledge, questions, objections, language, format preference, fatigue and observed behavior.

Every inferred memory carries confidence, evidence count, recency and scope. Users can inspect, correct, pin or remove memories. Organization and brand boundaries prevent cross-tenant leakage.

## 8. Content Genome

For each published asset, record structured creative features such as hook archetype, duration, shot count, face presence, average shot length, caption density, music characteristics, narrative structure, CTA, platform and production mode. Join these features to observed outcomes without assuming correlation is causation.

## 9. Learning loop

`Create → Publish → Observe → Diagnose → Experiment → Update scoped memory → Improve future decisions`

Signals include publication/abandonment, accepted/rejected hooks, locked/regenerated assets, micro-edits, watch-time metrics, saves, shares, comments, follows, clicks, conversions and explicit user ratings.

Not publishing a generated asset is a negative product-quality signal even when automated QA passes.

## 10. Causal discipline

The system must not report causal conclusions from simple correlations. Where possible use randomized/controlled variants, repeated observations, confidence intervals, anomaly detection and counterfactual estimates. External events, paid traffic, algorithm changes and bot activity are potential confounders.

## 11. Portfolio intelligence

Optimize a portfolio across reach, authority, trust, community, conversion and experimentation rather than maximizing every individual post for watch time. Track series continuity, semantic repetition, content inventory, asset reuse and content freshness.

## 12. Human calibration

Automated evaluators are calibrated against blind human preference tests and real publish behavior. Generator and evaluator independence is preferred for critical gates. CreativeBench includes hidden rotating scenarios to reduce benchmark overfitting.

## 13. Success measures

Primary system outcome remains Publishable First-Render Rate (PFRR). Decision intelligence should also reduce manual edit time and cost per publishable minute while improving distinctiveness and measured audience/business outcomes.
