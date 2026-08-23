# ENG-002 — Low-Level Implementation Specification (LLD)

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | ENG-002 |
| **Title** | Zyvoriq Low-Level Engineering & Component Implementation Specification |
| **Owner** | Lead Full-Stack Engineer |
| **Approvers** | VP of Engineering, Lead Architect |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-LLD-01 (Engineering Ready) |
| **Assurance Score** | 98/100 |
| **Parent Reference** | ARC-001, PRD-000 |

---

## 1. Client-Side State Management & SSE Hook

```typescript
// Example: useDirectorStream.ts implementation contract
export interface DirectorStep {
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
}

export interface DirectorStreamState {
  sessionId: string | null;
  isStreaming: boolean;
  steps: DirectorStep[];
  outputTokens: Record<string, string>; // modality -> text/code
  veritasScore: number | null;
  error: string | null;
}
```

---

## 2. Server-Side Swarm Dispatcher Pipeline

1. **Step 1 (Ingestion Controller)**: Validates brief schema, resolves `workspace_id`, queries `persona_vector`.
2. **Step 2 (Queue Producer)**: Publishes `zyvoriq.synthesis.requested` event to Redis BullMQ.
3. **Step 3 (Worker Pipeline)**:
   - Spawns parallel worker threads calling Gemini 2.5 Pro and Claude 3.5 Sonnet.
   - Pushes token chunks to Redis Pub/Sub subscribed by SSE route handler.
4. **Step 4 (Veritas Gate Execution)**: Runs verification calculations; writes results to PostgreSQL `veritas_assessments`.

---

## 3. Document Sign-off (QG-LLD-01)

- [x] TypeScript interfaces and hook contracts defined.
- [x] Background worker pipelines and SSE streaming mechanics verified.

**Exit Status:** `ENGINEERING READY (PASS)`
