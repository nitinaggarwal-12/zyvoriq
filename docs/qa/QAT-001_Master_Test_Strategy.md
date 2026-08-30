# QAT-001 — Master Test Strategy & Quality Gates

| Attribute | Value |
| :--- | :--- |
| Document ID | QAT-001 |
| Owner | Quality Engineering / Product Quality |
| Version | 2.0.0 |
| Status | Active |
| Priority | P0 |
| Parents | PRD-000, NFR-001, ARC-005 |

## 1. Quality philosophy

An MP4 existing is not proof of a good Reel. A provider returning success is not proof of continuity. An estimated timestamp is not verified sync. A self-assigned AI score is not human publishability.

Testing therefore combines deterministic engineering checks, media inspection, multimodal evaluation, human calibration and observed user behavior.

## 2. Test layers

### Static/governance

- TypeScript/build checks.
- Legacy-technology guard.
- `npm run docs:validate` for canonical IDs, parents, dependencies, canonical relative links and orphan prevention.

### Unit

- manifest validation;
- state-transition rules;
- duration/trim math;
- dependency invalidation;
- lock semantics;
- routing scoring/policy;
- quality-gate reducers.

### Integration

- provider contract adapters;
- object storage;
- job persistence/restart/idempotency;
- media probing;
- compiler commands;
- narration/timing ingest;
- API status semantics.

### Production-pipeline E2E

`brief → job → narration → timing → shots → assets → render → QA → repair → READY`

The test must restart/interrupt stages to prove resume behavior and must fail if READY is returned without a valid master artifact.

### Media/creative evals

- asset technical integrity;
- identity/continuity;
- motion/action boundary quality;
- audio continuity/loudness;
- A/V and caption sync;
- semantic visual ↔ narration fit;
- whole-story coherence;
- platform safe-zone/encoding;
- contextual taste/human preference once those systems ship.

## 3. Boundary testing

For every cut, inspect a configurable window around the boundary (for example, the final/first ~0.75 seconds) for:

- identity/face/hair;
- wardrobe;
- environment/lighting;
- object state;
- body pose/action/motion direction;
- camera/screen direction;
- speech/music/ambience continuity;
- caption boundary behavior.

A passing individual Shot N and Shot N+1 do not imply the boundary passes.

## 4. Required P0 gates

- **QG-001 Manifest/state integrity:** IDs, graph and state transitions valid.
- **QG-002 Durability:** restart/retry preserves completed independent work and durable assets.
- **QG-003 Timing truth:** actual alignment evidence exists or timing remains explicitly estimated/pending.
- **QG-004 Timeline/source fit:** every trim is satisfiable by real source media and final planned duration is coherent.
- **QG-005 Final artifact:** master exists, is non-empty and decodes.
- **QG-006 Whole-production/boundary quality:** no unresolved blocking audit failures.
- **QG-007 Repair integrity:** repair preserves locked and unaffected work.
- **QG-008 Status truth:** UI/API status matches persisted state/artifact evidence.
- **QG-009 PFRR evidence:** publishability benchmark records human acceptance protocol/sample.
- **QG-010 Traceability:** canonical documentation validator passes.

The authoritative mappings are in `docs/governance/traceability.json`.

## 5. Completion assertions

Tests must explicitly reject:

- `READY` with no master artifact;
- `COMPLETED` provider stages whose required output URL/artifact is missing;
- editorial trim outside actual media duration;
- unresolved blocking QA failure;
- repair changing a locked field;
- dangling manifest/dependency references;
- fake sync claims based only on elapsed playback or heuristic word timing;
- blanket success messages unsupported by the assertions actually run.

## 6. CreativeBench

Build a private evolving benchmark containing diverse scenarios: presenter, product, UGC, two-speaker, technical explainer, emotional story, multi-location, heavy B-roll, music-driven, multilingual, regulated/fact-sensitive and longer-form cases.

Each release can be compared blind against previous Zyvoriq output, relevant competitor outputs where legally/operationally feasible, and strong human-created references. Hidden/rotating cases reduce benchmark gaming.

## 7. Human calibration

Automated scores must be calibrated against humans. PFRR requires an acceptance rubric and sample metadata. Quality evaluators should be independent from generators for important judgments when practical.

## 8. Regression release policy

A release is blocked by:

- failing P0 tests/gates;
- any known critical corruption/data-isolation/status-truth bug;
- a material PFRR regression outside agreed statistical tolerance;
- broken canonical traceability/build validation;
- unrecoverable production-state migration.

New features do not justify regressing production correctness.
