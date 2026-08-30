# GOV-002 — Requirements, Architecture & Delivery Traceability Governance

| Attribute | Value |
| :--- | :--- |
| Document ID | GOV-002 |
| Owner | Product Architecture Council |
| Status | Active |
| Priority | P0 |
| Parent | PRD-000 |
| Registry | `docs/governance/traceability.json` |

## 1. Purpose

GOV-002 prevents document drift, orphan requirements, orphan implementation work, broken internal references, and unsupported completion claims. The JSON registry is the machine-readable source of truth; Markdown documents explain intent and design.

## 2. Required traceability chain

Every committed capability follows this chain:

`STR objective → BUS requirement → PRD functional/NFR requirement → architecture component → release → epic → story → quality gate → evidence`

A child may map to multiple parents when appropriate, but it may not have zero valid parents unless its type is explicitly defined as a root.

## 3. Canonical object classes

- `objective` — product/business outcome.
- `business_requirement` — business behavior or constraint.
- `functional_requirement` — testable product behavior.
- `nfr` — reliability, security, privacy, performance, economic or operational requirement.
- `component` — architecture responsibility, not a deployment promise.
- `release` — outcome-based delivery increment.
- `epic` — coherent engineering outcome.
- `story` — independently verifiable engineering work item.
- `quality_gate` — measurable exit condition.
- `document` — canonical artifact that owns one or more objects.

## 4. ID policy

IDs are immutable once merged. New IDs may be added; existing IDs are never silently reused for a different meaning. Superseded objects remain in the registry with `status: deprecated` and a `supersededBy` reference.

Prefixes:

- `OBJ-xxx`
- `BR-xxx`
- `FR-xxx`
- `NFR-xxx`
- `CMP-xxx`
- `REL-xx`
- `EPIC-xxx`
- `STORY-xxx`
- `QG-xxx`
- established document IDs such as `STR-001`, `PRD-000`, `ARC-001`.

## 5. Orphan rules

A registry is invalid when any of the following is true:

1. Duplicate object ID.
2. Parent or dependency references a nonexistent ID.
3. Referenced canonical document does not exist.
4. Epic has no mapped requirement.
5. Story has no parent epic.
6. Quality gate has neither a requirement nor a story mapping.
7. A release has no epics.
8. An active P0 requirement is not mapped to an epic.
9. A relative Markdown link in a canonical document points to a nonexistent file.

## 6. Completion semantics

Status words have strict meanings:

- `PLANNED` — design exists; no production artifact implied.
- `IMPLEMENTING` — engineering work is active.
- `ARTIFACT_READY` — required artifact exists but final QA is incomplete.
- `VERIFIED` — required automated evidence passed.
- `APPROVAL_REQUIRED` — automated gates passed but a required human gate remains.
- `READY` — all mandatory artifacts and gates for the scope passed.
- `FAILED` — at least one blocking gate failed.

No API or UI may synthesize `READY`, `VERIFIED`, or `COMPLETED` merely from planned metadata, estimated timestamps, empty asset URLs, or a successful provider request.

## 7. Change control

Any change to the root vision, P0 requirements, production manifest contract, state machine, or release exit criteria requires updates to the registry in the same change set. When a change invalidates downstream work, dependent items must be explicitly re-opened or marked impacted.

## 8. Regression guard

Run:

```bash
npm run docs:validate
```

The build pipeline runs this validator before `next build`. The validator intentionally checks canonical relative links and the explicit registry rather than attempting to infer semantics from every historical Markdown sentence.

## 9. Evidence policy

A quality gate should eventually point to reproducible evidence: automated test, benchmark run, audit record, artifact inspection, human acceptance sample, or production metric. Aspirational numeric targets remain labeled as targets until observed.
