# 🛡️ ZYVORIQ SOVEREIGN SECURITY & COMPLIANCE POLICY
**Version**: 2.0.0  
**Status**: Canonical Engineering Source of Truth  
**Target Runtimes**: Next.js 15.4 (App Router), Node.js 22 LTS, Dual-Engine DB (SQLite / PostgreSQL)

---

## 1. Zero-Trust API Key & Secret Management

### 1.1 Client Storage Isolation
- **Strict Cookie Ban**: Plaintext Gemini API keys or credentials must **NEVER** be stored in HTTP cookies (`document.cookie`).
- **Safe Cookie Flag**: The application may only store an opaque configuration boolean in cookies:
  ```typescript
  // Canonical Safe Pattern (lib/ai/apiKeyPool.ts)
  document.cookie = `zyvoriq_key_configured=true; path=/; max-age=31536000; SameSite=Strict`;
  ```
- **Local Key Vault**: User-provided API keys are isolated within client-side localStorage under the protected key `zyvoriq_gemini_api_key_pool` using [`lib/utils/storageGuard.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/utils/storageGuard.ts).
- **Masking Standard**: When rendered in UI components ([`components/ApiKeyModal.tsx`](file:///Users/nitinagga/Documents/zyvoriq/components/ApiKeyModal.tsx)), keys must always be masked using `maskKey()`:
  - Format: `AIzaSy••••••••••••••••3xZ1`
  - Raw keys are never emitted in client DOM logs or error traces.

### 1.2 Server-Side Key Resolution
- API routes ([`app/api/audio/*`](file:///Users/nitinagga/Documents/zyvoriq/app/api/audio/), [`app/api/video/*`](file:///Users/nitinagga/Documents/zyvoriq/app/api/video/)) prioritize server-managed environment variables (`GEMINI_API_KEY`, `GOOGLE_GENAI_API_KEY`).
- When client-provided keys are validated via [`/api/health/api-key`](file:///Users/nitinagga/Documents/zyvoriq/app/api/health/api-key/route.ts), keys are tested ephemerally in memory without disk persistence or telemetry logging.

---

## 2. Zero Third-Party Cloud Egress Policy

Zyvoriq operates under a sovereign zero-egress architecture. All generative workloads must strictly route to native Google DeepMind foundation models:

| Modality | Approved Native Model Endpoints | Banned Third-Party Services |
| :--- | :--- | :--- |
| **Neural TTS** | `gemini-3.1-flash-tts-preview`, `gemini-2.5-flash-preview-tts` | ❌ ElevenLabs, PlayHT, Azure Speech, OpenAI Audio |
| **Music Composition** | `DeepMind Lyria 3.0` | ❌ Suno, Udio, Soundraw |
| **Video Diffusion** | `veo-2.0-generate-001`, `veo-3.1-diffusion-preview` | ❌ Runway, Luma Dream Machine, Kling, Pika, Haiper |
| **Visual Diffusion** | `imagen-3.0-generate-002` | ❌ Midjourney, Stable Diffusion, DALL-E |

*Any PR or commit attempting to integrate unvetted third-party cloud egress is blocked at Turn-0 by automated static code scans (`npm run guard:legacy`).*

---

## 3. Database Injection Defenses & RLS

Zyvoriq uses a dual-engine database architecture (SQLite for local development, PostgreSQL for cloud deployments). Both engines enforce strict injection barriers:

### 3.1 SQLite Defense ([`lib/db/client.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/db/client.ts))
- **Prepared Statements Only**: String concatenation in queries is strictly prohibited. All queries must use `database.prepare("...").run(...)` with positional parameter binding (`?` placeholders).
- **Relational Integrity**: Connections must immediately execute `PRAGMA foreign_keys = ON;` upon initialization.

### 3.2 PostgreSQL Defense
- **Parameterized Queries**: All queries via `pg.Pool` must use parameterized placeholders (`$1, $2, ...`).
- **Row-Level Security (RLS)**: Production multi-tenant tables (`organizations`, `workspaces`, `swarm_runs`) enforce RLS policies keyed to `workspace_id` and verified via JWT claims.

---

## 4. Cryptographic Provenance & Veritas Certification

Every media asset synthesized by Zyvoriq must carry an immutable audit trail:

### 4.1 zk-SNARK & Ed25519 Certification ([`lib/db/types.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/db/types.ts))
- All completed production jobs generate a `VeritasCertificate`:
  - `ed25519_signature`: Digital signature of the asset payload hash.
  - `c2pa_manifest_hash`: Cryptographic Coalition for Content Provenance and Authenticity (C2PA) hash.
  - `sha256_root_checksum`: Immutable bitstream checksum of the final MP4 / WAV output.

### 4.2 SynthID Watermarking
- All visual diffusion and video renders embed imperceptible DeepMind SynthID watermarks to ensure compliance with global synthetic media disclosure laws (EU AI Act, US Executive Order 14110).

---

## 5. Input Sanitization & XSS Prevention

- **SVG & Canvas Export Sanitization**: Any user-provided SVG assets or canvas overlays must be sanitized against script injection (`<script>`, `onload=`, `javascript:`) prior to rendering.
- **Prompt Sanitization**: User prompt payloads undergo input length clamping and automated prompt injection moderation via [`app/api/admin/moderation/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/admin/moderation/route.ts) before execution.

---

## 6. Concurrency & GPU Denial-of-Service (DoS) Mitigation

To protect foundation model quotas and avoid unexpected cloud cost surges, generation concurrency is strictly locked by plan tier:
- **Free / Community**: Maximum 1 concurrent render job.
- **Creator Studio**: Maximum 1 concurrent render job.
- **Pro Studio**: Maximum 2 concurrent render jobs.
- **Enterprise Agency**: Maximum 5 concurrent render jobs (priority queue allocation).

Requests exceeding tier concurrency limits are placed in an atomic queue table (`status: 'queued'`) rather than dispatched upstream in parallel.

---

## 7. Biometric & Synthetic Voice Privacy (GDPR / Illinois BIPA Compliance)

Custom voice cloning and persona models are governed by strict biometric privacy policies:
- **Zero Secret Exfiltration**: Raw vocal audio samples are isolated in private object storage with time-limited signed URLs.
- **Downgrade & Churn Retention**: Upon tier downgrade or account cancellation, custom voice vector representations enter a compliance freeze for 90 days.
- **Right to Erasure (1-Click Purge)**: Users can initiate an immediate, permanent cryptographic purge of all voice embeddings and training audio with 1-click under GDPR Article 17 and Illinois BIPA Section 15.

---

## 8. Anti-Fraud & Chargeback Velocity Governors

To prevent "render & chargeback" fraud (where bad actors consume GPU quotas and initiate credit card disputes):
- **3D Secure (SCA) Enforcement**: All Pro Studio and Enterprise checkouts require Strong Customer Authentication (SCA / 3DS).
- **Graduated Day-1 Provisioning**: Newly created accounts receive an initial velocity cap of 10 renders on Day 1, unlocking full monthly quota allocations upon verified payment settlement.
- **Dispute Auto-Revocation**: Any active chargeback freezes the offending organization's workspace and revokes pending generation jobs.

---

## 9. Irrevocable Provenance & Commercial Licensing Continuity

- **Perpetual Commercial Rights**: Any asset synthesized and certified with a Veritas C2PA certificate during an active paid subscription retains **irrevocable, perpetual commercial rights**, even if the user subsequently downgrades to Free.
- **Grandfathering Invariant**: Completed projects, master MP4 containers, and timeline edits created on higher tiers are never retroactively deleted or cropped upon downgrade.

