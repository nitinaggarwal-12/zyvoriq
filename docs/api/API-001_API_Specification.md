# API-001 — API, SDK & Webhook Specification

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | API-001 |
| **Title** | Zyvoriq REST, WebSocket & Webhook API Specification |
| **Owner** | Platform Engineering Lead |
| **Approvers** | CTO, Lead Architect, Backend Lead |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-API-01 (API Contract Approved) |
| **Assurance Score** | 98/100 |
| **Parent References**| PRD-000, ARC-001, NFR-001 |

---

## 1. API Conventions & Standards

- **Base URL**: `https://api.zyvoriq.com/api/v1` (Production) / `http://localhost:3000/api/v1` (Local Dev)
- **Authentication**: Bearer JWT tokens in `Authorization: Bearer <token>` header or `X-Zyvoriq-API-Key`.
- **Response Standard**: Consistent envelope JSON:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "meta": { "timestamp": "2026-08-23T06:39:00Z", "request_id": "req_8392fa" }
  }
  ```

---

## 2. Core Endpoint Contracts

### 2.1 Director Swarm Synthesis (`POST /api/v1/director/synthesize`)
Initiates an asynchronous multi-agent synthesis session.

#### Request Body:
```json
{
  "workspace_id": "ws_99120",
  "prompt": "Explain distributed consensus in Raft with animated diagrams and code snippets",
  "target_modalities": ["video", "audio", "code", "editorial"],
  "autonomy_mode": "copilot",
  "persona_override_id": "persona_tech_authoritative"
}
```

#### Response (202 Accepted):
```json
{
  "success": true,
  "data": {
    "session_id": "sess_48291a0c",
    "status": "QUEUED",
    "stream_url": "/api/v1/director/stream/sess_48291a0c",
    "estimated_seconds": 28
  }
}
```

---

### 2.2 Live SSE Stream (`GET /api/v1/director/stream/:sessionId`)
Server-Sent Events endpoint streaming live agent thought traces and token chunks.

#### Event Stream Format:
```text
event: agent_step
data: {"agent": "ResearchAgent", "status": "Grounding facts against Raft paper...", "progress": 0.25}

event: token_chunk
data: {"modality": "code", "delta": "type State int\nconst (\n\tFollower State = iota\n\tCandidate\n\tLeader\n)"}

event: veritas_evaluation
data: {"vqs": 94.2, "factuality": 96.0, "status": "PASSED"}

event: complete
data: {"master_asset_id": "ast_9912048", "artifacts_count": 4}
```

---

### 2.3 Veritas Quality Assessment (`POST /api/v1/veritas/evaluate`)
Evaluates an existing draft artifact against the 5-axis Veritas quality matrix.

#### Request:
```json
{
  "artifact_id": "art_88192a",
  "grounding_sources": ["https://raft.github.io/raft.pdf"],
  "evaluators": ["gemini-2.5-pro", "claude-3-5-sonnet"]
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "composite_vqs": 94.6,
    "gate_status": "PASSED",
    "dimension_scores": {
      "factuality": 96.0,
      "brand_tone": 92.5,
      "consensus": 95.0,
      "safety": 100.0,
      "humanization": 91.0
    },
    "veritas_certificate_id": "vqc_9823f4b1a0",
    "auto_repair_required": false
  }
}
```

---

### 2.4 Omnichannel Publish Dispatch (`POST /api/v1/publish/dispatch`)
Deploys verified assets to connected social and developer destinations.

#### Request:
```json
{
  "master_asset_id": "ast_9912048",
  "channels": ["youtube", "linkedin", "x", "substack"],
  "schedule_time": "2026-08-23T14:00:00Z",
  "c2pa_provenance_sign": true
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "dispatch_id": "disp_77189a",
    "scheduled_jobs": [
      { "channel": "youtube", "status": "SCHEDULED", "target_time": "2026-08-23T14:00:00Z" },
      { "channel": "linkedin", "status": "SCHEDULED", "target_time": "2026-08-23T14:00:00Z" }
    ]
  }
}
```

---

## 3. Webhook Events Specification

Workspaces can register HTTPS webhook listeners for lifecycle events.

| Event Name | Trigger Condition |
| :--- | :--- |
| `synthesis.step_completed` | An individual sub-agent completes its generation chunk. |
| `veritas.gate_passed` | Veritas composite score meets or exceeds the required threshold. |
| `veritas.auto_repair_triggered`| Veritas detects a defect and initiates a self-healing iteration. |
| `publish.dispatched` | Asset is successfully deployed to a destination channel. |

---

## 4. Document Sign-off (QG-API-01)

- [x] RESTful API endpoints and WebSocket/SSE streaming contracts documented.
- [x] Request and response payloads validated against PRD requirements.
- [x] Webhook event schemas and authentication protocols defined.

**Exit Status:** `API CONTRACT APPROVED (PASS)`
