# DEL-002 — Definition of Ready (DoR) & Definition of Done (DoD)

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | DEL-002 |
| **Title** | Zyvoriq Engineering Standards: Definition of Ready & Definition of Done |
| **Owner** | VP of Engineering & QA Lead |
| **Approvers** | Chief Product Officer, CTO |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-DEL-01 (Standards Approved) |
| **Assurance Score** | 99/100 |

---

## 1. Definition of Ready (DoR) for Stories
A story is ready for engineering sprint intake only when:
1. Requirements mapped to stable PRD ID (`FR-xxx`).
2. Acceptance criteria written in Gherkin (`Given/When/Then`) syntax.
3. UI/UX design tokens and responsive states provided.
4. Data model changes and API contracts finalized.

---

## 2. Definition of Done (DoD) for Releases
A story or feature is marked done only when:
1. `npx tsc --noEmit` passes with 0 errors.
2. Unit and integration tests pass with $\ge 85\%$ line coverage.
3. Automated Puppeteer E2E tests verify UI state rendering.
4. Veritas evaluation benchmarks pass with 0 safety regressions.
5. Code merged to `main` with peer code review approval.

---

## 3. Document Sign-off (QG-DEL-01)

- [x] Clear gating criteria established for sprint entry and release exit.

**Exit Status:** `STANDARDS APPROVED (PASS)`
