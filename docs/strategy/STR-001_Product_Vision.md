# STR-001 — Product Vision & Strategic North Star

| Attribute | Value |
| :--- | :--- |
| Document ID | STR-001 |
| Owner | Founder / Chief Product Officer |
| Version | 2.0.0 |
| Status | Active |
| Priority | P0 |
| Last Reviewed | 2026-08-30 |
| Governance | GOV-002 |

## 1. Vision

**Zyvoriq is an Autonomous Creative Operating System.**

It turns an objective into successful media by deciding what should be created, orchestrating the best available models and tools, maintaining semantic/visual/audio continuity, editing the production, verifying quality and evidence, repairing defects, adapting for distribution, and learning from real outcomes.

The near-term wedge is **excellent short-form social video**: one brief → one genuinely publishable 30–60 second Reel/Short without manual stitching. The architecture must remain extensible to longer video, campaigns and additional content formats.

## 2. Category promise

> Give Zyvoriq the outcome you want. Zyvoriq determines the strongest creative path, produces it with interchangeable providers, preserves your identity and intent, verifies the assembled result, repairs what is wrong, and learns what works.

Zyvoriq is not defined by whichever video, voice, music or language model is strongest in a given quarter. The durable product is the intelligence and production control plane above those models.

## 3. Governing objective

Maximize **successful creative outcomes** while minimizing user effort, creative sameness, risk, cost, latency and loss of creator identity.

This means the system may recommend not generating, shortening a piece, changing format, reusing an existing asset, qualifying an unsupported claim, or seeking approval rather than blindly producing more media.

## 4. Strategic objectives

- **OBJ-001 — Publishability:** Move from objective/brief to publishable media with minimal substantive human repair.
- **OBJ-002 — Model independence:** Upstream model improvements should improve Zyvoriq rather than obsolete it.
- **OBJ-003 — Identity and intent:** Preserve creator identity, brand intent, audience value and locked semantics across generation and repair.
- **OBJ-004 — Evidence-based quality:** Verify the assembled production and repair the smallest affected unit; never equate provider success with product completion.
- **OBJ-005 — Outcome learning:** Improve future creative decisions from real behavior and performance without optimizing only vanity engagement.

## 5. Zyvoriq Constitution

Every subsystem follows these principles:

1. Preserve explicit user intent.
2. Protect identity, rights, privacy and safety.
3. Never fabricate evidence, provenance, synchronization or verification.
4. Never mutate locked semantics/assets silently.
5. Prefer authenticity over synthetic perfection.
6. Optimize long-term outcomes, not engagement alone.
7. Preserve creator distinctiveness; resist AI homogenization.
8. Repair the smallest affected dependency closure.
9. Minimize unnecessary generation and retries.
10. Explain material decisions and repairs.
11. Quantify uncertainty where it matters.
12. Escalate low-confidence/high-risk decisions.
13. Do not mark work `READY`, `VERIFIED` or `COMPLETED` without required artifacts and gates.
14. Know when not to generate.

## 6. Decision priority when objectives conflict

1. Safety / identity / legal / rights.
2. Factual integrity.
3. Explicit user intent.
4. Locked project constraints.
5. Brand requirements.
6. Audience value.
7. Creative quality and taste.
8. Business objective.
9. Performance optimization.
10. Cost and latency.

Lower priorities may not override hard constraints above them.

## 7. Core defensible moats

1. **Production Manifest** — semantic source code for media.
2. **Decision Engine** — chooses what should happen next.
3. **Provider Router** — task-level model independence backed by telemetry.
4. **Continuity Graph** — persistent character, environment, object, action, camera and cross-modal state.
5. **Taste / Distinctiveness Engine** — contextual creative judgment rather than generic polish.
6. **Quality Engine** — independent multimodal and boundary evaluation.
7. **Repair Engine** — dependency-aware smallest-unit self-healing.
8. **Creator DNA** — scoped, inspectable creator memory.
9. **Brand DNA** — machine-enforceable brand and policy memory.
10. **Audience DNA** — audience questions, fatigue, language and behavior.
11. **Content Genome** — structured creative features joined to outcomes.
12. **Evidence / Rights Engine** — claim, source, identity and usage traceability.
13. **Economic Engine** — quality × cost × latency optimization.
14. **Distribution Intelligence** — platform-native packaging and sequencing.
15. **Outcome Learning Loop** — improvement from publish behavior and downstream results.

## 8. Near-term focus and non-goals

### P0 focus

`Brief → Script → Narration → Real Timing → Shot Plan → Continuity → Generation → Assembly → Audio Mix → Captions → Master Render → Whole-Reel QA → Boundary QA → Targeted Repair → READY`

### Deliberate non-goals for the current core

- Building proprietary foundation video, voice, music, image or general-purpose language models.
- Becoming a frame-by-frame replacement for every professional NLE before semantic editing is excellent.
- Claiming guaranteed factuality, copyright safety, quality or synchronization without evidence.
- Optimizing solely for watch time or viral reach.

## 9. North-star measures

Primary: **Publishable First-Render Rate (PFRR)** — percentage of completed productions a user would publish without substantive manual correction.

Strategic companion measures:

- cost per publishable minute;
- human creative effort saved;
- time to first publishable output;
- targeted repair success;
- regeneration/waste rate;
- creator retention and publishing frequency;
- objective-specific audience/business outcomes.

Targets are defined in MET-001 and remain targets until measured with reproducible evidence.

## 10. Source-of-truth chain

Canonical documentation starts at [docs/INDEX.md](../INDEX.md). Machine-readable requirement, architecture and delivery traceability is governed by [GOV-002](../governance/GOV-002_Traceability_Model.md).
