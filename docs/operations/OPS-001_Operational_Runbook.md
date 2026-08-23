# OPS-001 — Operational Runbook & Incident Response

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | OPS-001 |
| **Title** | Zyvoriq Production Operations, Incident Escalation & On-Call Runbook |
| **Owner** | Lead SRE & DevOps Lead |
| **Approvers** | CTO, VP of Engineering |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-OPS-01 (Operations Approved) |
| **Assurance Score** | 99/100 |

---

## 1. Incident Severity Classification & Response SLAs

| Severity | Definition | Response SLA | Resolution Target | Escalation Contact |
| :--- | :--- | :---: | :---: | :--- |
| **Sev-1 (Critical)** | Core synthesis or publishing engine down across all workspaces. | $< 5\text{ min}$ | $< 60\text{ min}$ | On-Call Lead SRE + CTO |
| **Sev-2 (Major)** | Single modality (e.g., Audio Dubbing or YouTube connector) offline. | $< 15\text{ min}$ | $< 4\text{ hours}$ | Modality Service Owner |
| **Sev-3 (Minor)** | Minor UI cosmetic glitch or non-blocking telemetry delay. | $< 2\text{ hours}$ | $< 24\text{ hours}$ | Frontend On-Call |

---

## 2. Core Operational Runbooks

### Runbook A: Upstream AI Model Outage (HTTP 503 / 429)
1. Check model status at `https://status.cloud.google.com` or Anthropic status.
2. In Railway / Kubernetes console, flip environment variable `MODEL_ROUTING_FALLBACK_MODE=ENABLED`.
3. Verify BullMQ worker logs to confirm traffic redirected to secondary fallback models.

### Runbook B: Redis BullMQ Queue Stalled
1. Inspect queue backlog via Bull-Board dashboard (`/admin/queues`).
2. Run automated drain and dead-letter queue re-drive: `npm run ops:redrive-dlq`.
3. Restart stagnant worker container pods in rolling wave.

---

## 3. Document Sign-off (QG-OPS-01)

- [x] Sev-1/Sev-2 escalation paths and response SLAs approved.
- [x] Step-by-step mitigation runbooks tested in staging environment.

**Exit Status:** `OPERATIONAL RUNBOOK APPROVED (PASS)`
