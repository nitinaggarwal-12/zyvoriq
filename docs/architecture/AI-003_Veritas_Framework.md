# AI-003 — Veritas Content Quality & Assurance Framework

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | AI-003 |
| **Title** | Veritas Multi-Engine Content Quality, Consensus & Auto-Repair Framework |
| **Owner** | AI Quality & Evaluation Lead |
| **Approvers** | Chief Product Officer, VP of AI Research, Lead Architect |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-AI-01 (AI Quality & Safety Approved) |
| **Assurance Score** | 99/100 |
| **Parent References**| STR-001, PRD-000, ARC-001 |

---

## 1. Executive Summary

The **Veritas Framework** is Zyvoriq's proprietary content assurance engine. It eliminates the existential risk of generative AI in enterprise and creator publishing—namely hallucinations, brand voice drift, safety violations, and bland robotic prose.

Veritas evaluates all synthesized assets before they are stored or published, computing a deterministic **Veritas Quality Score (VQS)** through multi-engine semantic consensus and initiating automated self-repair loops for any sub-threshold artifact.

---

## 2. The 5 Veritas Evaluation Dimensions

```
                                  ┌─────────────────────────────┐
                                  │    Veritas Quality Matrix   │
                                  └──────────────┬──────────────┘
                                                 │
                  ┌──────────────────────────────┼──────────────────────────────┐
                  ▼                              ▼                              ▼
    ┌───────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐
    │  Factuality & Grounding   │  │   Brand Voice Alignment   │  │  Multi-Engine Consensus   │
    │      Weight: 30%          │  │        Weight: 25%        │  │        Weight: 20%        │
    └───────────────────────────┘  └───────────────────────────┘  └───────────────────────────┘
                  │                                                             │
                  └──────────────────────────────┬──────────────────────────────┘
                                                 ▼
                  ┌──────────────────────────────┴──────────────────────────────┐
                  ▼                                                             ▼
    ┌───────────────────────────┐                                 ┌───────────────────────────┐
    │ Safety & Policy Compliance│                                 │ Perceptual Humanization   │
    │        Weight: 15%        │                                 │        Weight: 10%        │
    └───────────────────────────┘                                 └───────────────────────────┘
```

### 2.1 Dimension Definitions & Scoring Formulas

1. **Factuality & Grounding ($S_{\text{fact}}$, Weight: $30\%$)**:
   - Assesses whether every factual assertion in the generated content is verifiable against trusted source documents or live Google Search ground-truth.
   - Penalty: $-25$ points for unverified minor claims; $-100$ (immediate veto) for catastrophic factual inaccuracies.

2. **Persona & Brand Tone Alignment ($S_{\text{tone}}$, Weight: $25\%$)**:
   - Evaluates adherence to the workspace's tone vector (e.g., *Authoritative, Pragmatic, Witty, Technical*), sentence length variance, and absence of blacklisted vocabulary clichés (e.g., *"delve", "tapestry", "game-changer"*).

3. **Multi-Engine Semantic Consensus ($S_{\text{cons}}$, Weight: $20\%$)**:
   - Dispatches the generated draft to two independent model families (Evaluator A: **Gemini 2.5 Pro**, Evaluator B: **Claude 3.5 Sonnet**).
   - Computes the cosine similarity of their independent claim extraction and semantic critiques. High disagreement triggers deeper inspection.

4. **Safety, Policy & IP Compliance ($S_{\text{safe}}$, Weight: $15\%$)**:
   - Scans for PII leakage, copyright violations, defamatory content, toxic speech, and regulatory non-compliance.
   - **Hard Gate**: Must score $100/100$. Any safety violation immediately blocks asset publishing.

5. **Perceptual Humanization & Flow ($S_{\text{hum}}$, Weight: $10\%$)**:
   - Evaluates burstiness, syntactic variety, emotional resonance, and natural conversational cadence across written and spoken scripts.

---

## 3. Mathematical Formula for Composite VQS

$$\text{VQS} = (0.30 \times S_{\text{fact}}) + (0.25 \times S_{\text{tone}}) + (0.20 \times S_{\text{cons}}) + (0.15 \times S_{\text{safe}}) + (0.10 \times S_{\text{hum}})$$

### Hard Gate Thresholds:
- **Publish Ready**: $\text{VQS} \ge 90$ (and $S_{\text{safe}} = 100$, $S_{\text{fact}} \ge 85$).
- **Co-Pilot Review Required**: $75 \le \text{VQS} < 90$.
- **Auto-Repair Trigger**: $\text{VQS} < 75$ or any single dimension $< 70$.

---

## 4. Closed-Loop Auto-Repair Architecture

```
[Draft Generated] ──► [Veritas Evaluator] ──► Score Check
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
    [VQS >= 90 (Pass)]                [VQS < 90 (Fail)]
            │                                 │
            ▼                                 ▼
   [Publish / Deploy]             [Auto-Repair Prompt Engine]
                                              │ (Injects specific error diffs)
                                              ▼
                                   [Targeted Regenerator]
                                              │ (Max 3 iterations)
                                              └──► [Re-evaluate in Veritas]
```

1. **Error Diagnosis**: The Veritas engine generates an exact structured defect report highlighting failing sentences, missing citations, or tone mismatches.
2. **Targeted Patching**: The Auto-Repair engine issues a surgical regeneration prompt to the synthesis agent, instructing it to fix only the defective passages while preserving validated portions.
3. **Re-Evaluation**: The repaired artifact is re-scored. If it satisfies the threshold, it advances to publishing; if it fails after 3 iterations, it escalates to human review.

---

## 5. Cryptographic Veritas Quality Certificate (VQC)

Every asset that passes the Veritas gate receives an immutable, signed JSON metadata payload:

```json
{
  "veritas_certificate_id": "vqc_9823f4b1a0",
  "timestamp": "2026-08-23T06:35:00Z",
  "composite_vqs": 94.6,
  "dimension_breakdown": {
    "factuality": 96.0,
    "brand_tone": 92.5,
    "consensus": 95.0,
    "safety": 100.0,
    "humanization": 91.0
  },
  "evaluators": ["gemini-2.5-pro", "claude-3-5-sonnet"],
  "auto_repair_iterations": 1,
  "c2pa_signature": "0x4b7e8912d...ff"
}
```

---

## 6. AI Quality Gate Sign-off (QG-AI-01)

- [x] Multi-engine consensus architecture defined with concrete weighting.
- [x] Hard safety and factuality firewalls established.
- [x] Closed-loop auto-repair feedback loop specified.
- [x] Cryptographic verification certificate schema verified.

**Exit Status:** `AI QUALITY & SAFETY APPROVED (PASS)`
