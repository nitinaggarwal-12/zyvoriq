# Zyvoriq Canonical Documentation Index

This index defines the authoritative document chain for Zyvoriq. Existing feature specifications remain valid unless superseded by a higher-level canonical document listed here.

## Source-of-truth hierarchy

1. [STR-001 — Product Vision](strategy/STR-001_Product_Vision.md)
2. [BUS-001 — Business Requirements](business/BUS-001_BRD.md)
3. [PRD-000 — Master Product Requirements](product/PRD-000_Master_PRD.md)
4. [NFR-001 — Non-Functional Requirements](architecture/NFR-001_Non_Functional_Requirements.md)
5. [ARC-001 — High-Level Architecture](architecture/ARC-001_HLD.md)
6. [ARC-005 — Creative OS Control Plane & Production Architecture](architecture/ARC-005_Creative_OS_Control_Plane.md)
7. [AI-006 — Decision, Taste & Learning Intelligence](ai/AI-006_Decision_Taste_Learning.md)
8. [RDM-001 — Product Roadmap](roadmap/RDM-001_Product_Roadmap.md)
9. [DEL-001 — Engineering Backlog & Dependency Plan](delivery/DEL-001_Backlog_Plan.md)
10. [QAT-001 — Master Test Strategy](qa/QAT-001_Master_Test_Strategy.md)
11. [MET-001 — North-Star Metrics](metrics/MET-001_Metrics_North_Star.md)
12. [GOV-002 — Traceability Governance](governance/GOV-002_Traceability_Model.md)

## Machine-readable governance

- [Traceability registry](governance/traceability.json) — canonical IDs, parents, dependencies, document ownership, release mapping, stories, and quality gates.
- `npm run docs:validate` — fails on duplicate IDs, missing parents, missing dependencies, missing referenced documents, orphan epics/stories/quality gates, or broken relative Markdown links in canonical documents.

## Existing detailed specifications

Detailed feature, API, security, data, UX, connector, operations, market, research, and feature PRD/TDD documents under `docs/` remain implementation references. They must trace upward to PRD-000 or a canonical subsystem document before being treated as committed scope.

## Governance rules

- Do not renumber an established document or requirement merely because strategy evolves.
- Do not declare a capability `READY`, `VERIFIED`, `COMPLETED`, or equivalent unless its required artifact exists and its applicable quality gate has passed.
- Targets are targets until measured in production; do not represent them as achieved facts.
- Generated media is a compiled artifact of the Production Manifest. Provider-specific assets are replaceable implementation outputs, not the system of record.
- Any new epic must map to at least one requirement; every story must have an epic; every quality gate must map to at least one requirement or story.
- Any removed or superseded object must be explicitly deprecated in the traceability registry rather than silently deleted.
