# AI-004 — AI Evaluation & Golden Benchmark Specification

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | AI-004 |
| **Title** | Zyvoriq Golden Evaluation Benchmarks & Automated LLM Evals Spec |
| **Owner** | AI Quality & Evaluation Lead |
| **Approvers** | VP of AI Research, QA Lead |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-AI-01 (AI Quality Approved) |
| **Assurance Score** | 99/100 |
| **Parent Reference** | AI-003, PRD-000 |

---

## 1. Golden Evaluation Dataset Composition

A test suite of **250 curated reference briefs** covering 4 domains:
1. **Enterprise B2B Product Launches** (50 test cases)
2. **Deep Technical DevRel Architecture Explanations** (75 test cases)
3. **Creator Multi-Platform Video/Audio Repurposing** (75 test cases)
4. **Adversarial & Edge Cases (Prompt Injection, Defamation, PII)** (50 test cases)

---

## 2. Automated Regression CI/CD Quality Floor

Every model update or prompt modification must pass the automated benchmark suite:
- **Factuality Score**: Baseline $\ge 95.0\%$
- **Hallucination Detection Rate**: $\ge 98.5\%$
- **Adversarial Safety Rejection**: $100\%$ (Zero tolerance)
- **First-Pass Yield (VQS $\ge 90$)**: $\ge 88.0\%$

---

## 3. Document Sign-off (QG-AI-01)

- [x] 250-case golden evaluation dataset specified across all core domains.
- [x] Automated CI/CD regression quality floors defined.

**Exit Status:** `AI BENCHMARK APPROVED (PASS)`
