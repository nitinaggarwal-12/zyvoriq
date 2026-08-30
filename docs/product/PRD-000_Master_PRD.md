# PRD-000 — Master Product Requirements Document

| Attribute | Value |
| :--- | :--- |
| Document ID | PRD-000 |
| Owner | Principal Product Manager |
| Version | 2.0.0 |
| Status | Active |
| Priority | P0 |
| Parents | STR-001, BUS-001 |
| Governance | GOV-002 |

## 1. Product definition

Zyvoriq is an **Autonomous Creative Operating System** with a short-form social-video wedge. The initial product must turn one brief into a real, persisted, publishable Reel/Short production. It must own the semantic production plan, timeline, continuity, final mix, quality state and repair behavior while using replaceable upstream generation providers.

The Master PRD is intentionally outcome-oriented. Detailed subsystem behavior lives in ARC-005 and AI-006; machine-readable mappings live in `docs/governance/traceability.json`.

## 2. Primary R1 journey

```text
Idea / brief
→ structured brief
→ script
→ narration master
→ actual audio timing
→ editorial beats
→ shot plan
→ continuity graph
→ provider routing
→ source generation
→ asset inspection
→ rough cut
→ music/SFX/ambience
→ captions/graphics
→ audio mix
→ master render
→ whole-Reel QA
→ boundary QA
→ targeted repair
→ final QA
→ READY
```

A planning response, storyboard, simulated preview or collection of generated clips does not satisfy this journey.

## 3. Functional requirements

### Production core — P0

- **FR-001 Brief normalization:** Normalize topic/brief into objective, audience, platform, target duration, tone and constraints while recording material assumptions.
- **FR-002 Production Manifest:** Create/version the canonical semantic Production Manifest with immutable IDs and a dependency graph.
- **FR-003 Audio master clock:** Generate narration and use actual waveform-derived timing for speech-led productions when available. Estimated timing must remain labeled estimated/pending.
- **FR-004 Shot decomposition:** Convert requested duration into editorial shots independent of provider source-generation duration; source footage may be trimmed but not silently stretched beyond usable media.
- **FR-005 Continuity state:** Persist `continuityIn`/`continuityOut` for identity, wardrobe, environment, objects, action, camera and emotional state across dependent shots.
- **FR-006 Provider abstraction:** Generate through provider interfaces so the Production Manifest does not change when video/voice/music providers change.
- **FR-007 Master timeline/compiler:** Compile selected/trimmed video, narration/dialogue, music, SFX, ambience, captions and graphics into a coherent master.
- **FR-008 Multimodal QA:** Audit individual assets, each cut boundary and the complete assembled production.
- **FR-009 Targeted repair:** Regenerate/recompute only the smallest invalid dependency closure while preserving locked/unaffected work.
- **FR-010 Truthful state:** API and UI status must reflect persisted backend state and artifact evidence. Empty URLs, estimated timings or completed provider calls cannot imply a completed Reel.

### Creator control and intelligence — P1

- **FR-011 Semantic editing and locks:** Support natural-language edits, explicit locks, intent protection, versioning, branching and semantic diffs.
- **FR-012 Intelligent provider selection:** Rank provider/model choices by task quality, reference/continuity support, reliability, cost, latency, privacy, rights, residency, rate limits and customer policy.
- **FR-013 Creative intelligence:** Apply brief quality, diverse concept search, hook/narrative evaluation, contextual taste, feasibility and anti-homogenization reasoning.
- **FR-014 Scoped memory:** Maintain inspectable, correctable Creator DNA, Brand DNA and Audience DNA with scope, confidence, evidence and recency.
- **FR-015 Evidence/rights:** Represent factual/visual claims, evidence quality/freshness, provenance and identity/media rights without overstating clearance.

### Distribution and learning — P2

- **FR-016 Cross-format/platform adaptation:** Derive platform-native variants from shared semantic content, not simple resizing/transcription.
- **FR-017 Outcome learning:** Join production features to publishing/behavioral outcomes through a Content Genome, experimentation and confidence-aware learning.

## 4. Long-form continuity requirements

A long production is one timeline, not `8s + 8s + 8s` independent blocks.

Required behaviors:

1. Master narration/dialogue and music/ambience are continuous production-level tracks where appropriate.
2. Generated clip audio has explicit ownership: accept, mute, replace or mix; it never wins implicitly.
3. Each shot has editorial in/out and source in/out.
4. Continuity-sensitive shots form dependencies; independent B-roll may run in parallel.
5. Provider reference frames/images are used when supported but are not the only continuity mechanism.
6. A dedicated boundary audit inspects the end/start region around every cut.
7. Transition type is intentional—hard cut, cut-on-action, match cut, J/L cut, whip, dip, dissolve, graphic transition or none—not a universal dissolve rule.

## 5. Quality semantics

Quality is multidimensional. Required P0 dimensions include:

- asset existence/decodability;
- requested vs rendered duration;
- identity/wardrobe/environment/object/action continuity;
- motion/camera boundary quality;
- speech intelligibility and A/V sync;
- caption timing/readability;
- music/ambience continuity and loudness;
- visual ↔ narration semantic alignment;
- whole-story coherence;
- platform technical compliance.

A single aggregate score may summarize results but may not hide a blocking dimension.

## 6. Production state machine

`PLANNING → SCRIPT_READY → AUDIO_GENERATING → AUDIO_READY → SHOTS_PLANNED → VIDEO_GENERATING → ROUGH_CUT_READY → MIXING → MASTER_RENDERING → AUDITING → REPAIRING → APPROVAL_REQUIRED → READY`

`FAILED` may occur at any executable stage. Recovery resumes from durable checkpoints.

## 7. User experience

### Entry

A simple prompt/brief surface optimized for:

- Create a Reel from an idea.
- Turn source material into a short-form story.
- Create platform variants from an approved production.

### Studio

Five primary areas:

1. **Brief** — goal, audience, platform, duration, tone, references, brand.
2. **Story** — concept, hook, script, claims, CTA.
3. **Storyboard** — shots, continuity, references, camera intent.
4. **Timeline** — video, voice, music, SFX, captions, graphics.
5. **Quality** — failures, warnings, repairs, evidence and approval.

Progressive complexity keeps model/provider internals hidden unless advanced users opt in.

## 8. Autonomy

Autonomy is risk-aware rather than a single global switch:

- **Suggest** — recommend only.
- **Co-create** — user and Zyvoriq make decisions together.
- **Direct** — Zyvoriq executes but major gates require approval.
- **Autopilot** — safe, high-confidence decisions execute within explicit workspace policy.

Hard rights/safety/policy gates cannot be bypassed by a high creative score.

## 9. Non-functional dependencies

R1 depends on NFR-001 for durable jobs, persistent assets, retry/idempotency, provider failure isolation and truthful observability. Local application disk may not be the sole production asset store.

## 10. Product exit criteria

R1 is not complete until a real user path can create a 30–60 second Reel end-to-end without manual stitching and the system can prove:

- final artifact exists and decodes;
- timeline fits source assets;
- statuses are truthful;
- applicable QA runs against the assembled master;
- blocking failures prevent `READY`;
- repair preserves unaffected/locked work;
- results are measured through PFRR rather than internal self-scoring alone.

Targets and benchmark methodology are owned by MET-001 and QAT-001.

## 11. Traceability

The complete requirement → component → release → epic → story → gate mapping is machine-enforced by [GOV-002](../governance/GOV-002_Traceability_Model.md) and `npm run docs:validate`.
