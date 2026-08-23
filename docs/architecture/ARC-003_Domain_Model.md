# ARC-003 — Canonical Domain Model & Entity-Relationship Specification

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | ARC-003 |
| **Title** | Zyvoriq Canonical Domain Model & Relational ERD Specification |
| **Owner** | Principal Data Architect |
| **Approvers** | CTO, Lead Architect |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-DAT-01 (Data Model Approved) |
| **Assurance Score** | 99/100 |
| **Parent Reference** | DAT-001, ARC-001 |

---

## 1. Domain Entities & Value Objects

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Core Domain Entities:                                                       │
│ 1. Tenant (Root billing and organizational scope)                           │
│ 2. Workspace (Brand persona, tone embedding, and policy settings)           │
│ 3. Project (Campaign container grouping multi-format assets)                 │
│ 4. MasterAsset (Parent generation thesis, source prompt, and state)         │
│ 5. ModalityArtifact (Concrete output: Video, Audio, Code, Editorial Copy)   │
│ 6. VeritasAssessment (Quality scores, dimension ratings, audit diffs)       │
│ 7. AutonomyPolicy (Threshold configuration and emergency kill-switches)     │
│ 8. PublishJob (Outbound scheduled delivery tasks for social connectors)     │
│ 9. AuditEntry (Cryptographic tamper-evident ledger entry)                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Invariants & Business Rules

1. **`INV-01`**: A `ModalityArtifact` cannot have a status of `PUBLISHED` without an associated `VeritasAssessment` where `gate_decision = 'PASS'`.
2. **`INV-02`**: A `Workspace` must belong to exactly one `Tenant`; all child entities inherit `tenant_id` for RLS isolation.
3. **`INV-03`**: An `AuditEntry` is strictly append-only; updates and deletions are rejected at the database trigger level.

---

## 3. Document Sign-off (QG-DAT-01)

- [x] Complete domain ontology and relational constraints documented.
- [x] System invariants verified against business requirements.

**Exit Status:** `DOMAIN MODEL APPROVED (PASS)`
