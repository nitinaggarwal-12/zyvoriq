# MET-002 — Analytics Event Taxonomy & Tracking Schema

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | MET-002 |
| **Title** | Zyvoriq Client & Server Analytics Event Tracking Taxonomy |
| **Owner** | Lead Analytics Engineer |
| **Approvers** | Head of Product Analytics, Platform Lead |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-MET-02 (Taxonomy Approved) |
| **Assurance Score** | 98/100 |
| **Parent Reference** | MET-001, PRD-000 |

---

## 1. Core Analytics Event Catalog

| Event Name | Trigger | Payload Properties |
| :--- | :--- | :--- |
| `director_prompt_submitted` | User clicks submit in Director | `workspace_id`, `input_type`, `modalities_count` |
| `swarm_synthesis_completed` | All agents complete generation | `session_id`, `duration_seconds`, `tokens_used` |
| `veritas_score_computed` | Veritas QA calculates VQS | `artifact_id`, `composite_vqs`, `factuality_score` |
| `veritas_auto_repair_applied`| User or system applies repair | `artifact_id`, `iteration`, `delta_score` |
| `asset_published` | Asset deployed to social API | `channel`, `asset_id`, `autonomy_mode`, `vqs` |

---

## 2. Document Sign-off (QG-MET-02)

- [x] Complete event naming convention and payload schemas specified.

**Exit Status:** `ANALYTICS TAXONOMY APPROVED (PASS)`
