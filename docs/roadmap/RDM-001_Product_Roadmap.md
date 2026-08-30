# RDM-001 — Outcome-Gated Product Roadmap

| Attribute | Value |
| :--- | :--- |
| Document ID | RDM-001 |
| Owner | Product / Engineering Leadership |
| Version | 2.0.0 |
| Status | Active |
| Priority | P0 |
| Parents | STR-001, PRD-000 |

This roadmap is **exit-criteria driven**, not date-promise driven. A later release does not compensate for an incomplete earlier production invariant.

## REL-01 — Production Core

**Outcome:** one brief → real, persisted 30–60 second Reel without manual stitching.

Includes canonical manifest/state, durable jobs/assets, narration master/real timing, shot planning, provider contract, dynamic assembly/audio mix, final render and truthful Studio progress.

**Exit:** real master artifact exists/decodes, requested timeline is valid, status is truthful and restart/retry does not lose completed independent work.

## REL-02 — Continuity

**Outcome:** multi-shot output feels like one production rather than independent model calls.

Includes character/environment/object/action/camera/emotion state, dependency-aware generation and reference conditioning where supported.

**Exit:** continuity evidence is captured at dependent boundaries and no required state is silently discarded between shots.

## REL-03 — Quality & Repair

**Outcome:** Zyvoriq watches/listens to the assembled Reel, identifies blocking defects and repairs the minimum affected scope.

Includes asset QA, whole-Reel QA, boundary audits, cross-modal checks, repair dependency invalidation and re-audit.

**Exit:** blocking defects prevent READY; targeted repair preserves locks/unaffected artifacts.

## REL-04 — Creator Experience

**Outcome:** creators control sophisticated productions without requiring a traditional NLE for common edits.

Includes semantic editing, locks/intent locks, branching, restore points, semantic diffs and clearer quality explanations.

## REL-05 — Creative Intelligence

**Outcome:** Zyvoriq makes better creative decisions, not just better renders.

Includes brief intelligence, diverse concept search, hook/narrative reasoning, contextual taste, feasibility, retention signals, anti-overproduction and anti-homogenization.

## REL-06 — Personalization

**Outcome:** output becomes recognizably specific to the creator/brand/audience while memories remain scoped and correctable.

Includes Creator DNA, Brand DNA, Audience DNA, persona separation, negative preferences, confidence/recency and memory controls.

## REL-07 — Evidence, Rights & Enterprise Trust

**Outcome:** serious organizations can understand claims, rights, provenance, policy decisions and approval state.

Includes evidence/freshness, visual-claim checks, identity/media rights metadata, provenance, policy-as-code, role/approval foundations and tenant controls.

## REL-08 — Distribution

**Outcome:** one semantic production generates platform-native variants and can move into approved publishing workflows.

Includes Instagram/Shorts/TikTok/LinkedIn adaptation, localization foundations, device/platform preflight and distribution connectors.

## REL-09 — Performance Learning

**Outcome:** future content measurably improves from real publish behavior/outcomes.

Includes Content Genome, experiment discipline, causal-confidence controls, portfolio/series intelligence, audience feedback and content inventory/reuse.

## REL-10 — Autonomous Campaign Director

**Outcome:** user supplies a business/creator objective and Zyvoriq plans a coherent content portfolio/campaign subject to autonomy policy and approval gates.

## REL-11 — Platform & Ecosystem

**Outcome:** external teams can build on Zyvoriq's control plane.

Includes stable SDK/API surfaces, semantic recipes, interoperability, marketplace governance and potential Quality/Router/Continuity services.

## Prioritization rule

Do not pull REL-04+ work forward if it hides incomplete REL-01–03 correctness. Homepage polish, extra modalities and marketplace breadth are lower priority than end-to-end production, continuity, quality and repair.

Detailed active epics/stories are in [DEL-001](../delivery/DEL-001_Backlog_Plan.md); machine-readable release mappings are in `docs/governance/traceability.json`.
