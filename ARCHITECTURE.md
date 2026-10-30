# 🏛️ ZYVORIQ SOVEREIGN ARCHITECTURE SPECIFICATION
**Version**: 2.0.0 (Post-Phase 2 Hygiene & Stabilization)  
**Status**: Canonical Engineering Source of Truth  
**Target Runtimes**: Next.js 15.4 (App Router), React 19.1, Node.js 22 LTS, Dual-Engine DB (SQLite / PostgreSQL)

---

## 1. Executive System Overview

Zyvoriq is an AI-native multi-modal studio and generative publishing platform built on the **Option A (Lean Omni-First + Veo 3.1 Safety-Net)** architecture:
1. **Primary Joint Audio-Video & Lip-Sync Synthesis**: Multi-act native audio-video generation powered by `models/gemini-2.5-flash` (`generateSwarmJob` in [`app/api/swarm/jobs/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/swarm/jobs/route.ts)).
2. **Veo 3.1 Safety-Net & Explicit 4K Tier**: `veo-3.0-generate-preview`, `veo-3.0-generate-preview`, and `veo-3.1-lite-generate-preview` via [`lib/ai/veoService.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/ai/veoService.ts) when the user explicitly selects `veo31_4k` or when Omni 1.1 encounters transient quota/API unavailability, plus silent B-roll in [`scripts/yt_pipeline.mjs`](file:///Users/nitinagga/Documents/zyvoriq/scripts/yt_pipeline.mjs).
3. **48kHz Neural Voice & Harmonic Music**: Expressive speech (`gemini-2.5-flash-preview-tts` / `gemini-2.5-flash-preview-tts` / Vertex Cloud TTS ADC) and sectional orchestral/symphonic composition powered by Google DeepMind Lyria 3.0 Pro (`lyria-realtime-exp`).
4. **Cryptographic Provenance & Safety**: Veritas zk-SNARK proof hashing, C2PA manifest embedding, and SynthID digital watermarking.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (React 19)                              │
│  ┌────────────────────────────────────┐  ┌─────────────────────────────────────┐ │
│  │ Google Stitch Studio (/swarm-MUI)  │  │ Library (/library) & Entity (/entity│ │
│  │ Structured Matrix · 9:16|16:9|2.39 │  │ /[id]) · Personas (/personas)       │ │
│  └─────────────────┬──────────────────┘  └──────────────────┬──────────────────┘ │
└────────────────────┼────────────────────────────────────────┼────────────────────┘
                     │                                        │
┌────────────────────▼────────────────────────────────────────▼────────────────────┐
│                       NEXT.JS 15 APP ROUTER API LAYER                            │
│  /api/swarm/* · /api/entity/[id] · /api/library/* · /api/yt/* · /api/reels/*     │
└────────────────┬───────────────────┬───────────────────┬─────────────────────────┘
                 │                   │                   │
┌────────────────▼─────────┐ ┌───────▼─────────┐ ┌───────▼─────────────────────────┐
│   DEEPMIND AI SERVICES   │ │ DUAL DATABASE   │ │ VERITAS PROVENANCE VAULT        │
│  - Omni 1.1 Flash (Prim) │ │ - SQLite WAL    │ │ - zk-SNARK Proof Generator      │
│  - Veo 3.1 (Safety-Net)  │ │   (All 21 Tbls) │ │ - C2PA Manifest Signer          │
│  - Gemini TTS / CloudTTS │ │ - Cloud PgPool  │ │ - SynthID Digital Watermarking  │
│  - Lyria 3.0 Pro Music   │ │   (All 21 Tbls) │ │                                 │
└──────────────────────────┘ └─────────────────┘ └─────────────────────────────────┘
```

---

## 2. Next.js 15 App Router Topology

All major creation, library, provenance, and administrative flows use **first-class mounted page routes** with deep-linkable query/path parameters. Legacy `/studio/*`, `/director`, and `/governance` UI trees and the standalone `reel_worker_v2.mjs` Studio1 queue daemon were retired under Option A.

### 2.1 Mounted UI Page Routes

| Route | Purpose | Key Files |
| :--- | :--- | :--- |
| [`/`](file:///Users/nitinagga/Documents/zyvoriq/app/page.tsx) | Root Entry Redirect (`→ /swarm-MUI`) | [`app/page.tsx`](file:///Users/nitinagga/Documents/zyvoriq/app/page.tsx) |
| [`/swarm-MUI`](file:///Users/nitinagga/Documents/zyvoriq/app/swarm-MUI/page.tsx) | Primary Google Stitch Daylight Studio (`#F8FAFC`) | [`app/swarm-MUI/page.tsx`](file:///Users/nitinagga/Documents/zyvoriq/app/swarm-MUI/page.tsx), [`components/DeepResearchBiblePanel.tsx`](file:///Users/nitinagga/Documents/zyvoriq/components/DeepResearchBiblePanel.tsx) |
| [`/library`](file:///Users/nitinagga/Documents/zyvoriq/app/library/page.tsx) | Media Assets, Characters, Locations & Saved Reels Vault | [`app/library/page.tsx`](file:///Users/nitinagga/Documents/zyvoriq/app/library/page.tsx) |
| [`/entity/[id]`](file:///Users/nitinagga/Documents/zyvoriq/app/entity/[id]/page.tsx) | Canonical Deep-Linkable Production Entity & Dynamic Provenance Inspector (`Omni 1.1` vs `Veo 3.1`) | [`app/entity/[id]/page.tsx`](file:///Users/nitinagga/Documents/zyvoriq/app/entity/[id]/page.tsx), [`app/api/entity/[id]/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/entity/[id]/route.ts) |
| [`/personas`](file:///Users/nitinagga/Documents/zyvoriq/app/personas/page.tsx) | Biometric Character & Voice Persona Studio | [`app/personas/page.tsx`](file:///Users/nitinagga/Documents/zyvoriq/app/personas/page.tsx) |
| [`/dev/gallery`](file:///Users/nitinagga/Documents/zyvoriq/app/dev/gallery/page.tsx) | Engineering Verification & Render Gallery | [`app/dev/gallery/page.tsx`](file:///Users/nitinagga/Documents/zyvoriq/app/dev/gallery/page.tsx) |
| [`/admin/feedback`](file:///Users/nitinagga/Documents/zyvoriq/app/admin/feedback/page.tsx) | Rule 58 Cross-App Admin Feedback Inbox (`nitinagga@google.com`) | [`app/admin/feedback/page.tsx`](file:///Users/nitinagga/Documents/zyvoriq/app/admin/feedback/page.tsx), [`components/UniversalFeedbackSystem.tsx`](file:///Users/nitinagga/Documents/zyvoriq/components/UniversalFeedbackSystem.tsx) |

### 2.2 Core App Router API Surfaces

| API Namespace | Purpose | Key Routes |
| :--- | :--- | :--- |
| `/api/swarm/*` | Canonical Multi-Act Omni 1.1 + Veo 3.1 Safety-Net Orchestration, Deep-Research Bible & Library | [`app/api/swarm/jobs/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/swarm/jobs/route.ts), [`app/api/swarm/deep-research/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/swarm/deep-research/route.ts), [`app/api/swarm/library/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/swarm/library/route.ts) |
| `/api/entity/[id]` & `/api/artifacts/[id]` | Canonical Entity & Universal Artifact Identity Resolution | [`app/api/entity/[id]/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/entity/[id]/route.ts), [`app/api/artifacts/[id]/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/artifacts/[id]/route.ts) |
| `/api/yt/*` | Autonomous YouTube Pipeline (Veo 3.1 silent B-roll + Gemini TTS + FFmpeg CFR) | [`app/api/yt/productions/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/yt/productions/route.ts), [`scripts/yt_pipeline.mjs`](file:///Users/nitinagga/Documents/zyvoriq/scripts/yt_pipeline.mjs) |
| `/api/reels/*` | Manifest Planning (`planReel` / `planReelAsync`), Read Compatibility & Inspection (`410 STUDIO1_WORKER_PRUNED_OPTION_A` on retired queue actions) | [`app/api/reels/plan/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/reels/plan/route.ts), [`app/api/reels/productions/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/reels/productions/route.ts), [`app/api/reels/capabilities/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/reels/capabilities/route.ts) |
| `/api/audio/*` & `/api/library/*` | Lyria 3.0 Pro Music, Gemini TTS Narration, Character/Location DNA Vault | [`app/api/audio/lyria-music/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/audio/lyria-music/route.ts), [`app/api/audio/narrate/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/audio/narrate/route.ts), [`app/api/library/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/library/route.ts) |
| `/api/feedback/*` & `/api/health` | Rule 58 Feedback Persistence & Runtime Health Telemetry | [`app/api/feedback/submit/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/feedback/submit/route.ts), [`app/api/health/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/health/route.ts) |

### 2.3 Multi-Act Cinema & Timeline Continuity Invariants

1. **Logical Timeline Decoupling**: Dialogue, EDL scene changes, and subtitles synchronize with a dedicated logical master clock (`requestedDurationSec` up to 300s across 30s CFR acts), never synthetic `<video loop>` repetition.
2. **Strict Ban on Synthetic `<video loop>`**: Master `<video>` surfaces never mask asset shortages by looping short stems; multi-act extensions synthesize discrete 30.0s CFR acts (`act1_30s.mp4 .. actN_30s.mp4`) stitched cleanly via FFmpeg.
3. **4-Clock Drift Gate (`±50ms` Ceiling)**: Video stream duration, audio stream duration, container duration, and VTT subtitle envelope stay locked within `±50ms` with EBU R128 `-24.0 LUFS` loudness normalization.
4. **Truthful Engine Provenance**: [`app/api/entity/[id]/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/entity/[id]/route.ts) and [`app/entity/[id]/page.tsx`](file:///Users/nitinagga/Documents/zyvoriq/app/entity/[id]/page.tsx) badge `Veo 3.1` only when live Veo synthesis ran without static seed fallback (`usedVeo31Live && !isFallbackMaster`), defaulting to `Omni 1.1` otherwise.

---

## 3. Generative Multi-Modal Service Contracts

All AI calls execute through encapsulated server-side modules in [`lib/ai/`](file:///Users/nitinagga/Documents/zyvoriq/lib/ai/) with zero client-side credential exposure.

### 3.1 Audio & TTS Engine ([`lib/ai/ttsService.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/ai/ttsService.ts))
- **Primary Model**: `gemini-2.5-flash-preview-tts`
- **Fallback Model**: `gemini-2.5-flash-preview-tts`
- **Audio Output Format**: 48kHz / 24-bit uncompressed WAV / PCM.
- **Emotional Voice Matrix**:
  - `Charon`: Deep, authoritative baritone (Executive briefings, solemn narration).
  - `Aoede`: Resonant, lyrical female (Narrative lore, documentary).
  - `Puck`: Energetic, dynamic male (UGC, high-pace reels).
  - `Fenrir`: Intense, gravelly baritone (Dramatic trailers, action comics).
  - `Kore`: Warm, conversational female (Commercial ads, podcasts).

### 3.2 Harmonic Music Engine ([`lib/ai/lyriaService.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/ai/lyriaService.ts))
- **Primary Model**: `DeepMind Lyria 3.0`
- **Generation Modes**:
  1. **Standard Mode (30s)**: Single prompt-driven audio bed for rapid short-form reels.
  2. **Pro Multi-Section Mode (up to 180s)**: Structured compositional pipeline with independently steered musical sections:
     ```typescript
     interface SongStructurePlan {
       sections: Array<{
         type: "intro" | "verse" | "chorus" | "bridge" | "outro";
         durationSeconds: number; // 15 to 45s
         tempoBpm: number;
         instruments: string[];
         mood: string;
       }>;
       bpm: number;
       keySignature: string;
       genre: string;
     }
     ```

### 3.3 Cinematic Video Diffusion — Option A: Lean Omni-First + Veo 3.1 Safety-Net ([`lib/ai/veoService.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/ai/veoService.ts), [`app/api/swarm/jobs/route.ts`](file:///Users/nitinagga/Documents/zyvoriq/app/api/swarm/jobs/route.ts), [`scripts/yt_pipeline.mjs`](file:///Users/nitinagga/Documents/zyvoriq/scripts/yt_pipeline.mjs))
- **Primary & Safety-Net Models**:
  - `models/gemini-2.5-flash` (`/v1beta/interactions`) — default native 24fps multi-turn AV engine in `/swarm-MUI` (`foundationModel: "omni11_lyria3"`), producing synchronous video + spoken/sung lip-sync audio in a single pass.
  - `veo-3.0-generate-preview` (`quality`), `veo-3.0-generate-preview` (`fast`), `veo-3.1-lite-generate-preview` (`lite`) via `:predictLongRunning` — retained as the lean ~300-LOC safety-net (`lib/ai/veoService.ts` + `scripts/yt_pipeline.mjs`) for: (1) optional `/swarm-MUI` 4K diffusion selector (`foundationModel === "veo31_4k"` -> `synthesize30sActViaVeo31` -> `generateVeoVideoBytes`), (2) automatic live diffusion fallback in `/api/swarm/jobs` & `scripts/yt_pipeline.mjs` when Omni 1.1 blocks or errors prior to cached seed masters, and (3) dynamic `"Omni 1.1"` vs `"Veo 3.1"` provenance badges on `/entity/[id]`.
  - **Retired Legacy Stack**: The unmounted `Studio1` background queue worker (`scripts/reel_worker_v2.mjs`, `scripts/studio1_native.mjs`), `app/api/studio1/*`, `app/api/studio/omni-generate`, and `lib/studio1/*` are permanently retired under Option A; `lib/reel/operationQueue.ts` fails closed with `STUDIO1_WORKER_PRUNED_OPTION_A`.
- **Container Standards**: Strictly `H.264 (avc1)` video codec with `yuv420p` pixel format, `24/1` CFR, faststart `moov` atom enabled, and `4s / 6s / 8s` discrete Veo buckets (`8s` mandatory when `referenceImages` are attached).
- **Recursive Chaining Architecture**:
  - `generateVeoRecursiveChainedVideo(masterPrompt, options)` in [`lib/ai/veoService.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/ai/veoService.ts)
  - Chains consecutive 8s base + 7s/8s extension hops up to 148 seconds of continuous multi-act video.

---

## 4. Dual Database Safeguard Architecture

Zyvoriq utilizes a dual-engine persistence layer to guarantee zero friction in local testing while supporting high-concurrency PostgreSQL in production.

```
┌────────────────────────────────────────────────────────────┐
│                    db (Database Gateway)                   │
└─────────────┬────────────────────────────────┬─────────────┘
              │ Local Dev                      │ Production
┌─────────────▼───────────────┐ ┌──────────────▼─────────────┐
│ SQLite (node:sqlite)        │ │ PostgreSQL (pg.Pool)       │
│ - File: dev.db (WAL Mode)   │ │ - DATABASE_URL             │
│ - Synchronous Queries       │ │ - Asynchronous Pool        │
│ - Kernel Mutex: Atomics.wait│ │ - Full ACID Concurrency    │
│ - Boolean as Integer (0 / 1)│ │ - Native Boolean (true/fal)│
└─────────────────────────────┘ └────────────────────────────┘
```

### 4.1 SQLite Configuration ([`lib/db/client.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/db/client.ts))
- **Driver**: Node.js native `node:sqlite` (`DatabaseSync`).
- **Pragmas Enforced**:
  - `PRAGMA foreign_keys = ON;` (Mirrors strict relational constraints).
  - `PRAGMA journal_mode = WAL;` (Enables concurrent readers while writing).
  - `PRAGMA synchronous = NORMAL;`
  - `PRAGMA busy_timeout = 5000;`
- **Contention Resilience**: Uses kernel-level sleeping via `Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay)` within `withRetry<T>()` to eliminate CPU-spinning lock contention on disk writes.

### 4.2 Schema Synchronization
- **Full 21-Table DDL Schema Parity**: All 21 relational tables (`organizations`, `workspaces`, `users_rbac`, `persona_memories`, `swarm_runs`, `swarm_tasks`, `grounding_claims`, `modality_artifacts`, `veritas_evaluations`, `defect_diff_reports`, `veritas_certificates`, `publish_dispatches`, `studio_series_tracks`, `studio_production_jobs`, `character_library`, `character_wardrobe`, `location_library`, `episode_productions`, `reel_productions`, `reel_production_controls`, and `reel_feedback`) exist in 1:1 DDL parity across `POSTGRES_SCHEMA` and `SQLITE_SCHEMA`.
- **Runtime Dual-Engine Routing**: Active production, reel, episode, and library stores (`reel_productions` with `RevisionConflictError` optimistic `expectedRevision` CAS, `reel_production_controls`, `reel_feedback`, `episode_productions`, `studio_series_tracks`, `studio_production_jobs`, `character_library`, `character_wardrobe`, and `location_library`) dynamically route to PostgreSQL when `DATABASE_URL` is configured and transparently operate on zero-config SQLite WAL (`getDatabase()` + `withRetry()`) otherwise, while synchronous tenant/Veritas audit helpers in `lib/db/client.ts` execute directly against local SQLite WAL.
- **Startup Guarantee**: `ensurePostgresSchema()` (with isolated `pgvector` capability probing so vanilla PostgreSQL instances without `vector` never roll back the 21-table DDL batch) and `getDatabase()` ensure all tables, indexes, and column migrations are applied once at boot without per-query `ALTER TABLE` locks.

---

## 5. Studio Monitor & Export Protocol

### 5.1 Honest Video Mastering
- The studio monitor player mounts [`components/ResolutionDownloadDropdown.tsx`](file:///Users/nitinagga/Documents/zyvoriq/components/ResolutionDownloadDropdown.tsx) directly under the media viewport.
- **Strict Anti-Gimmick Rule**: All simulated client-side resolution downscaling is banned. The export dropdown provides honest, transparent options:
  1. `Master 1080p MP4 (Direct DeepMind Diffusion Render)`
  2. `Raw Asset Container File`
- **Digital Silence Guarantee**: [`components/SpatialAudioMixer.tsx`](file:///Users/nitinagga/Documents/zyvoriq/components/SpatialAudioMixer.tsx) uses pure digital silence blobs (`createSilenceWavBlob()`) rather than synthetic audible sine waves when stems are unrendered.

---

## 6. Verification Quality Gates & BeyondCorp Cloud Run In-Container Self-Test

Every code change and Cloud Run revision must pass:
1. **TypeScript & Standalone Build**: `npm run check` (`canonical:qa` + `next build`) must exit with code `0`.
2. **Legacy Governance & Dual-Engine Audit**: `npm run guard:deterministic` verifies zero banned packages (`SadTalker`, `Wav2Lip`, `D-ID`, `mp4v`), zero retired `Studio1` workers, and live SQLite WAL optimistic-CAS parity.
3. **In-Container BeyondCorp Cloud Run Pre-Traffic Canary & E2E Gate ([`scripts/gate5_self_verify_entrypoint.mjs`](file:///Users/nitinagga/Documents/zyvoriq/scripts/gate5_self_verify_entrypoint.mjs), [`instrumentation.ts`](file:///Users/nitinagga/Documents/zyvoriq/instrumentation.ts), & [`scripts/deploy_zyvoriq_cloudrun.py`](file:///Users/nitinagga/Documents/zyvoriq/scripts/deploy_zyvoriq_cloudrun.py))**: Because `zyvoriq` enforces `run.googleapis.com/ingress: internal-and-cloud-load-balancing` (with request-scoped CPU throttling once TCP port `8080` binds) behind Google's BeyondCorp Global External Application Load Balancer (`https://zyvoriq-248990048888.cr.gclb.goog`), [`scripts/gate5_self_verify_entrypoint.mjs`](file:///Users/nitinagga/Documents/zyvoriq/scripts/gate5_self_verify_entrypoint.mjs) runs a fail-closed loopback HTTP E2E + Dual-Engine CAS suite on `127.0.0.1:18080` under unthrottled startup CPU boost *before* opening `0.0.0.0:8080` and emits `[CLOUDRUN_BOOT_SELFTEST_PASS]` + `CLOUDRUN_LIVE_E2E_VERIFICATION_RESULT:` to Cloud Logging, verified synchronously by Gate 5 of [`scripts/deploy_zyvoriq_cloudrun.py`](file:///Users/nitinagga/Documents/zyvoriq/scripts/deploy_zyvoriq_cloudrun.py).
