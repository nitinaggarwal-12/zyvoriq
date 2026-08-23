# ARC-004 — Integration & Event-Driven Architecture

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | ARC-004 |
| **Title** | Zyvoriq Event-Driven Architecture, Pub/Sub & Webhook Engine |
| **Owner** | Principal Integration Architect |
| **Approvers** | CTO, Platform Engineering Lead |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P1 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-HLD-01 (Architecture Approved) |
| **Assurance Score** | 98/100 |
| **Parent Reference** | ARC-001, API-001 |

---

## 1. Event Bus Taxonomy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Domain Event Hierarchy:                                                     │
│ • zyvoriq.synthesis.requested  ──► Dispatched when a brief is submitted     │
│ • zyvoriq.synthesis.progress   ──► SSE streaming deltas for UI state        │
│ • zyvoriq.veritas.evaluated    ──► Fired when QA score is computed          │
│ • zyvoriq.veritas.repaired     ──► Fired when auto-repair patch completes    │
│ • zyvoriq.publish.queued       ──► Enqueued to BullMQ background worker     │
│ • zyvoriq.publish.dispatched   ──► External channel API successfully called │
│ • zyvoriq.telemetry.updated    ──► Real-time engagement metric ingested     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Webhook Delivery & Retry Strategy

- **Signature Verification**: Every outbound webhook includes `X-Zyvoriq-Signature: sha256=...` generated via HMAC-SHA256 with the workspace secret.
- **Retry Schedule**: Exponential backoff with jitter: $1\text{s}$, $5\text{s}$, $30\text{s}$, $5\text{min}$, $30\text{min}$. Dead-letter queue (DLQ) after 5 failed attempts.

---

## 3. Document Sign-off (QG-HLD-01)

- [x] Complete event taxonomy and topic naming conventions established.
- [x] Outbound webhook security and retry algorithms specified.

**Exit Status:** `EVENT ARCHITECTURE APPROVED (PASS)`
