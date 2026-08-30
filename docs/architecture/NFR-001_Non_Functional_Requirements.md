# NFR-001 — Non-Functional Requirements

| Attribute | Value |
| :--- | :--- |
| Document ID | NFR-001 |
| Owner | Architecture / SRE / Security |
| Version | 2.0.0 |
| Status | Active |
| Priority | P0 |
| Parents | PRD-000, ARC-001 |

## 1. P0 production invariants

- **NFR-001A — Durable execution:** Long-running production jobs must persist state, support idempotent retries and resume from checkpoints after process/provider failure.
- **NFR-001B — Durable assets:** Generated inputs/intermediates/final masters required for recovery or lineage must be stored durably; application-local disk may not be the sole production copy.
- **NFR-001C — Failure isolation:** A failed provider call or failed shot must not corrupt/restart completed independent work.
- **NFR-001D — Tenant/memory isolation:** Creator, brand, audience, unpublished-content and learned-preference data must remain scoped to authorized tenant/workspace/persona contexts.
- **NFR-001E — Economic observability:** Cost must be attributable to provider, model, shot, retry, QA, rendering and variant where measurable.

## 2. Reliability

Required behaviors:

1. Persist every externally meaningful production state transition.
2. Use stable production/run/asset IDs.
3. Use idempotency for operations that may be retried.
4. Detect stalled jobs via lease/heartbeat or equivalent mechanism.
5. Separate retryable provider failures from permanent validation/policy failures.
6. Preserve successful independent branches when one dependency fails.
7. Never advance to an artifact-dependent state before the artifact is durably addressable.
8. Keep provider request/result metadata sufficient for debugging and provenance.

Availability/throughput SLOs must be established from measured workload and business tier. They are not declared achieved in this document before infrastructure evidence exists.

## 3. Performance and progressive latency

The experience should progressively surface useful intermediate results (brief → hook/script → storyboard → narration → shots → rough cut → QA) rather than blocking behind one long request.

Track at minimum:

- time to accepted job;
- time to script/storyboard;
- time to first generated media;
- time to rough cut;
- time to first publishable output;
- per-provider latency and queue time.

Provider routing may trade latency against quality/cost only within user/workspace policy.

## 4. Media integrity

- Probe actual source media properties before assembly.
- Normalize frame rate, resolution/aspect handling and audio parameters explicitly.
- Reject impossible trim ranges.
- Detect missing/zero-byte/undecodable assets.
- Keep final render and source lineage immutable once approved; edits produce a new manifest/version.

## 5. Security and privacy

- Enforce authorization at service/data boundaries, not only in UI.
- Store secrets through deployment secret management, never repository source.
- Encrypt data in transit and at rest using supported platform controls.
- Treat user uploads, URLs, metadata and third-party tool outputs as untrusted.
- Track external-provider privacy/residency/training policies as routing constraints where required.
- Support deletion/retention controls for user/project/memory data as product tiers require.
- Do not state a compliance certification or cryptographic guarantee unless independently established.

## 6. Economic safeguards

- Predict expected generation complexity/cost before expensive execution when possible.
- Cap retries per failure strategy; repeated failures escalate to another provider, simplified shot or alternate representation.
- Cache/reuse approved assets/references where rights and intent allow.
- Measure wasted-inference rate.
- Optimize **cost per publishable minute**, not merely API price per call.

## 7. Observability

Every production should make it possible to answer:

- What state is it in?
- What is blocking progress?
- Which provider/model generated each asset?
- Which attempts failed and why?
- Which quality gate rejected it?
- What repair was performed?
- What did the run cost?
- Which artifacts are canonical?

## 8. Build/regression governance

`npm run docs:validate` is a required build precheck for canonical traceability. Runtime implementation must add unit/integration/E2E coverage as described in QAT-001; documentation validation does not substitute for runtime tests.
