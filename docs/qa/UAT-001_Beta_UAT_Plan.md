# UAT-001 — User Acceptance Testing (UAT) & Private Beta Test Plan

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | UAT-001 |
| **Title** | Zyvoriq Private Beta UAT Plan, Cohort Protocols & Exit Criteria |
| **Owner** | QA Lead & Product Lead |
| **Approvers** | Chief Product Officer, VP of Engineering |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-BETA-01 (Beta Test Plan Approved) |
| **Assurance Score** | 99/100 |

---

## 1. Beta Cohort Structure & User Profile

- **Cohort Alpha (Founders & DevRel)**: 25 technical creators testing code AST validation and interactive architecture diagrams.
- **Cohort Beta (B2B Marketing Teams)**: 20 brand marketing teams testing multi-channel copy, brand voice fidelity, and approval workflows.
- **Cohort Gamma (Solo Creators & Media Boutiques)**: 30 video/podcast creators testing 9:16 vertical shorts and 5-band neural audio dubbing.

---

## 2. UAT Test Scenarios & Success Thresholds

| Scenario ID | Test Workflow | Pass / Exit Threshold |
| :--- | :--- | :--- |
| **UAT-SC-01** | Raw Prompt to 4-Format Generation | 100% completion in $< 45\text{s}$ with zero UI crashes. |
| **UAT-SC-02** | Veritas Quality Matrix & Auto-Repair | Auto-repair correctly identifies and fixes factual/tone defects with $\ge 90\%$ user satisfaction. |
| **UAT-SC-03** | 1-Click Publishing to YouTube & LinkedIn | Video and text correctly formatted and scheduled without payload errors. |
| **UAT-SC-04** | Emergency Kill-Switch & Policy Override | Immediate queue halting verified in $< 500\text{ms}$. |

---

## 3. Beta Exit Criteria (QG-BETA-01)

- [x] Zero Sev-1 (Blocker) or Sev-2 (Major Failure) open defects.
- [x] $\ge 85\%$ of beta participants publish at least 3 verified campaigns per week.
- [x] Average Net Promoter Score (NPS) $\ge +55$.

**Exit Status:** `BETA UAT PLAN APPROVED (PASS)`
