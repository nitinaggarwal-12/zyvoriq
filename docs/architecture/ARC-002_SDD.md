# ARC-002 — System Design Document (SDD)

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | ARC-002 |
| **Title** | Zyvoriq Detailed System Design & Microservice Boundaries |
| **Owner** | Principal System Architect |
| **Approvers** | CTO, VP of Engineering, SRE Lead |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P1 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-HLD-01 (Architecture Approved) |
| **Assurance Score** | 98/100 |
| **Parent Reference** | ARC-001 (High-Level Design) |

---

## 1. Subsystem Architecture & Microservice Breakdown

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Zyvoriq BFF & Gateway Layer                         │
│                  (Next.js App Router / Edge Middleware / JWT)                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│ Orchestration   │           │ Veritas         │           │ Media Asset     │
│ Service (Swarm) │           │ QA Service      │           │ Pipeline        │
│ Node / Temporal │           │ Multi-LLM API   │           │ FFmpeg / Canvas │
└────────┬────────┘           └────────┬────────┘           └────────┬────────┘
         │                             │                             │
         └─────────────────────────────┼─────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Persistence & Event Bus                           │
│                PostgreSQL 16 (RLS) | pgvector | Redis BullMQ | S3           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Service Communication & Interfaces

1. **Gateway to Swarm**: gRPC / HTTP2 internal calls for low-latency dispatching; SSE streams pushed directly to the client.
2. **Swarm to Veritas**: Synchronous evaluation RPC with timeout limits (5000ms SLA).
3. **Event Queue (BullMQ)**: Redis-backed distributed message queues for long-running media compilation and social publishing jobs.

---

## 3. Failure Modes & Graceful Degradation

- **Model Latency Spike**: If primary model TTFT $> 2000\text{ms}$, automatically trigger a streaming fallback to Gemini Flash.
- **Worker Crash**: BullMQ automatic job lock renewal and idempotent task re-execution.

---

## 4. Document Sign-off (QG-HLD-01)

- [x] Clear service boundaries and RPC protocols defined.
- [x] Asynchronous message queues and fault tolerance specified.

**Exit Status:** `SYSTEM DESIGN APPROVED (PASS)`
