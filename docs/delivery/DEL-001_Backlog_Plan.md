# DEL-001 — Engineering Backlog & Dependency Plan

| Attribute | Value |
| :--- | :--- |
| Document ID | DEL-001 |
| Owner | Engineering / Product Delivery |
| Version | 2.0.0 |
| Status | Active |
| Priority | P0 |
| Parents | RDM-001, PRD-000 |
| Registry | `docs/governance/traceability.json` |

The JSON registry is authoritative for IDs/dependencies. This document explains execution order and acceptance intent.

## 1. Critical path

```text
EPIC-001 Manifest/state
   ↓
EPIC-002 Durable jobs/assets
   ├──────────────┐
   ↓              ↓
EPIC-003 Audio   EPIC-004 Shot plan/router
   └──────┬───────┘
          ↓
EPIC-005 Timeline/compiler/master
          ↓
EPIC-006 Real Studio job/progress
          ↓
EPIC-007 Continuity
          ↓
EPIC-008 QA + targeted repair
          ↓
EPIC-009 Semantic editor/locks
          ↓
EPIC-010 Creative intelligence
          ↓
EPIC-011 Creator/Brand/Audience DNA
          ↓
EPIC-012 Distribution + learning
```

## 2. Active epics

| Epic | Outcome | Release | Dependencies |
| :--- | :--- | :--- | :--- |
| EPIC-001 | Canonical manifest and truthful state semantics | REL-01 | — |
| EPIC-002 | Durable orchestration and asset persistence | REL-01 | EPIC-001 |
| EPIC-003 | Narration master and actual timing alignment | REL-01 | EPIC-001, EPIC-002 |
| EPIC-004 | Editorial shot planner and provider contract | REL-01 | EPIC-001 |
| EPIC-005 | Timeline compiler, audio mix and final render | REL-01 | EPIC-003, EPIC-004 |
| EPIC-006 | Studio creates real jobs and reports persisted progress | REL-01 | EPIC-002, EPIC-005 |
| EPIC-007 | Continuity graph and reference chaining | REL-02 | EPIC-004 |
| EPIC-008 | Whole-Reel/boundary QA and targeted repair | REL-03 | EPIC-005, EPIC-007 |
| EPIC-009 | Semantic editor, locks, branching and diffs | REL-04 | EPIC-001, EPIC-008 |
| EPIC-010 | Brief/hook/narrative/taste intelligence | REL-05 | EPIC-006 |
| EPIC-011 | Creator/Brand/Audience DNA | REL-06 | EPIC-010 |
| EPIC-012 | Platform variants and outcome learning | REL-07 in registry until trust/distribution split is expanded | EPIC-011 |

## 3. P0 stories — execute before breadth

### EPIC-001
- STORY-001 Define/version manifest schema with immutable IDs.
- STORY-002 Enforce canonical production state machine and completion semantics.

### EPIC-002
- STORY-003 Persist jobs with idempotency/restart checkpoints.
- STORY-004 Add durable production asset-storage abstraction; local disk is scratch only.

### EPIC-003
- STORY-005 Generate one canonical narration master for speech-led Reel.
- STORY-006 Persist real waveform-derived word/phoneme timing where provider/tooling supports it; otherwise mark timing pending/estimated.

### EPIC-004
- STORY-007 Plan editorial beats independently of fixed provider duration units.
- STORY-008 Introduce stable provider interfaces/routing request contract.

### EPIC-005
- STORY-009 Probe source media and reject impossible trim ranges.
- STORY-010 Compile dynamic trims and intentional transitions; remove hard-coded offsets.
- STORY-011 Mix narration/music/SFX/ambience as production-owned stems.
- STORY-012 Render/persist immutable master artifact.

### EPIC-006
- STORY-013 Wire Reel Studio `Build` action to create a real backend production job.
- STORY-014 Display persisted job/stage/artifact state; remove simulated success semantics.

### EPIC-007
- STORY-015 Persist character/environment/object/camera/action continuity state.
- STORY-016 Chain references for dependent shots when provider supports them while retaining parallel independent B-roll.

### EPIC-008
- STORY-017 Audit generated assets plus assembled master.
- STORY-018 Audit every cut boundary for visual/audio continuity.
- STORY-019 Repair only the smallest affected dependency closure and rerun impacted gates.

## 4. P1 stories

- STORY-020 Add semantic/intent locks.
- STORY-021 Add branching, restore points and semantic diffs.
- STORY-022 Rank genuinely diverse concepts/hooks.
- STORY-023 Add contextual taste/anti-overproduction evaluation.
- STORY-024 Persist scoped memory with confidence, recency and user correction.

## 5. P2 stories

- STORY-025 Generate platform-native derivatives from a semantic source.
- STORY-026 Record outcome telemetry/creative features with confidence and no false causal claims.

## 6. Definition of Ready

A story is Ready only if:

- its requirement and epic IDs exist in traceability;
- dependencies are known;
- acceptance evidence is testable;
- expected state/data changes are defined;
- failure/retry semantics are defined when the story invokes external providers;
- security/privacy implications are identified when it handles user/brand/identity data.

## 7. Definition of Done

A story is Done only if:

- code and relevant tests are merged;
- no known P0/Sev-1 regression is introduced;
- applicable quality gate passes;
- state semantics remain truthful;
- links/traceability validation passes;
- no dangling manifest/dependency references remain;
- user-facing completion claims correspond to evidence.

## 8. Change control

Do not create ad-hoc production scripts as the canonical path. Experiments may exist, but production behavior must converge into the manifest/orchestrator/compiler/audit architecture and be represented in the registry.
