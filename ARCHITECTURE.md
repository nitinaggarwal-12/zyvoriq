# 🏛️ ZYVORIQ SOVEREIGN ARCHITECTURE SPECIFICATION
**Version**: 2.0.0 (Post-Phase 2 Hygiene & Stabilization)  
**Status**: Canonical Engineering Source of Truth  
**Target Runtimes**: Next.js 15.4 (App Router), React 19.1, Node.js 22 LTS, Dual-Engine DB (SQLite / PostgreSQL)

---

## 1. Executive System Overview

Zyvoriq is an AI-native multi-modal studio and generative publishing platform. The architecture coordinates four foundational generative media modalities:
1. **Cinematic Video Diffusion**: Multi-act high-definition video synthesis powered by Google DeepMind Veo 3.1 / 2.0.
2. **48kHz Neural Voice & Emotional Dubbing**: Low-latency expressive speech powered by `gemini-3.1-flash-tts-preview` and `gemini-2.5-flash-preview-tts`.
3. **Harmonic Music & Multi-Section Audio**: Sectional song composition (up to 180s) powered by Google DeepMind Lyria 3.0 Pro.
4. **Cryptographic Provenance & Safety**: Veritas zk-SNARK proof hashing, C2PA manifest embedding, and SynthID digital watermarking.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (React 19)                              │
│  ┌───────────────────────────┐  ┌──────────────────────────────────────────────┐ │
│  │ Studio Monitor / Scrubber │  │ Dedicated Creation Hubs (/studio/create/*)   │ │
│  │ ResolutionDownloadDropdown│  │ Aspect Ratio Frame: 9:16 | 16:9 | 1:1        │ │
│  └─────────────┬─────────────┘  └──────────────────────┬───────────────────────┘ │
└────────────────┼───────────────────────────────────────┼─────────────────────────┘
                 │                                       │
┌────────────────▼───────────────────────────────────────▼─────────────────────────┐
│                       NEXT.JS 15 APP ROUTER API LAYER                            │
│  /api/audio/*  ·  /api/video/*  ·  /api/studio/*  ·  /api/tier6/*  ·  /api/health│
└────────────────┬───────────────────┬───────────────────┬─────────────────────────┘
                 │                   │                   │
┌────────────────▼─────────┐ ┌───────▼─────────┐ ┌───────▼─────────────────────────┐
│   DEEPMIND AI SERVICES   │ │ DUAL DATABASE   │ │ VERITAS PROVENANCE VAULT        │
│  - Veo 3.1 Recursive     │ │ - Local: SQLite │ │ - zk-SNARK Proof Generator      │
│  - Gemini 3.1 Flash TTS  │ │   (dev.db, WAL) │ │ - C2PA Manifest Signer          │
│  - Lyria 3.0 Pro Music   │ │ - Cloud: PgPool │ │ - SynthID Digital Watermarking  │
│  - Imagen 3 / Director   │ │   (PostgreSQL)  │ │                                 │
└──────────────────────────┘ └─────────────────┘ └─────────────────────────────────┘
```

---

## 2. Next.js 15 App Router Topology

All major creation flows use **first-class page routes** with deep-linkable query parameters. Modals are reserved exclusively for short transactional overlays (e.g. API key configuration).

### 2.1 Studio Core & Creation Hubs

| Route | Purpose | Key Components |
| :--- | :--- | :--- |
| [`/studio`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/page.tsx) | Master Studio Workspace | [`app/studio/ReelStudio.tsx`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/ReelStudio.tsx), [`components/ResolutionDownloadDropdown.tsx`](file:///Users/nitinagga/Documents/zyvoriq/components/ResolutionDownloadDropdown.tsx) |
| [`/studio/create`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/create/page.tsx) | Universal Persona Creation Hub | Deep links with `?persona=heritage\|ugc\|anime\|corporate`, dynamic tab switching wrapped in `<Suspense>` |
| [`/studio/create/reel`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/create/reel/page.tsx) | Cinematic Veo 3.1 Reel Creator | Aspect ratio frame morphing (`9:16`, `16:9`, `1:1`), multi-act scene prompts |
| [`/studio/create/comics`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/create/comics/page.tsx) | Visual Manga & Comic Strip Studio | Multi-panel grid storyboarder, speech balloon overlay generator |
| [`/studio/create/animation`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/create/animation/page.tsx) | 2D/3D Keyframe Animation Studio | Canvas motion interpolation, character rig alignment |
| [`/studio/create/ugc`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/create/ugc/page.tsx) | UGC Performance Ad Creator | Hook matrix generator, viral pacing controller |
| [`/studio/create/music`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/create/music/page.tsx) | Lyria 3.0 Pro Songwriter | Sectional stem sequencer (`intro`, `verse`, `chorus`, `bridge`, `outro`) |
| [`/studio/create/podcast`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/create/podcast/page.tsx) | Multi-Speaker Neural Podcast Studio | Multi-track dialogue casting (`Charon`, `Aoede`, `Puck`, `Fenrir`, `Kore`) |
| [`/studio/create/story`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/create/story/page.tsx) | Narrative & Lore Engine | Long-form story tree branching, multimodal scene compilation |
| [`/studio/library`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/library/page.tsx) | Media Assets & Tracks Vault | Canonical tracks catalog, stem downloads, SNARK proof inspection |
| [`/studio/trend-radar`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/trend-radar/page.tsx) | Viral Trend & Narrative Discovery | Real-time topic clustering, cultural hook synthesis |

### 2.2 Global Management & Platform Routes

| Route | Purpose | Key Components |
| :--- | :--- | :--- |
| [`/director`](file:///Users/nitinagga/Documents/zyvoriq/app/director/page.tsx) | Autonomous Executive Director | Multi-agent scene orchestration, script compilation |
| [`/governance`](file:///Users/nitinagga/Documents/zyvoriq/app/governance/page.tsx) | Enterprise Governance & Audit Logs | Veritas certification verification, kill-switch policy sliders |
| [`/creator/analytics`](file:///Users/nitinagga/Documents/zyvoriq/app/creator/analytics/page.tsx) | Creator Intelligence & Telemetry | Multi-channel attribution, viral lift, engagement forecasting |
| [`/admin/moderation`](file:///Users/nitinagga/Documents/zyvoriq/app/admin/moderation/page.tsx) | Safety & Moderation Console | Prompt violation auditing, content quarantine |

---

## 3. Generative Multi-Modal Service Contracts

All AI calls execute through encapsulated server-side modules in [`lib/ai/`](file:///Users/nitinagga/Documents/zyvoriq/lib/ai/) with zero client-side credential exposure.

### 3.1 Audio & TTS Engine ([`lib/ai/ttsService.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/ai/ttsService.ts))
- **Primary Model**: `gemini-3.1-flash-tts-preview`
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

### 3.3 Cinematic Video Diffusion ([`lib/ai/veoService.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/ai/veoService.ts))
- **Primary Model**: `veo-2.0-generate-001` / `veo-3.1-diffusion-preview`
- **Container Standards**: Strictly `H.264 (avc1)` video codec with `yuv420p` pixel format, 24fps/30fps, faststart `moov` atom enabled.
- **Recursive Chaining Architecture**:
  - `generateVeoRecursiveChainedVideo(acts: SceneAct[], maxCycles = 20)`
  - Chains consecutive 8-second video generations with latent continuity conditioning, scaling up to 168 seconds of continuous multi-act video.

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
- Dual-engine tables: `organizations`, `workspaces`, `swarm_runs`, `swarm_tasks`, `modality_artifacts`, `veritas_evaluations`, `veritas_certificates`, `studio_series_tracks`, `studio_production_jobs`.
- Startup guarantee: `ensurePostgresSchema()` ensures all tables, indexes, and column migrations are applied before processing web traffic.

---

## 5. Studio Monitor & Export Protocol

### 5.1 Honest Video Mastering
- The studio monitor player mounts [`components/ResolutionDownloadDropdown.tsx`](file:///Users/nitinagga/Documents/zyvoriq/components/ResolutionDownloadDropdown.tsx) directly under the media viewport.
- **Strict Anti-Gimmick Rule**: All simulated client-side resolution downscaling is banned. The export dropdown provides honest, transparent options:
  1. `Master 1080p MP4 (Direct DeepMind Diffusion Render)`
  2. `Raw Asset Container File`
- **Digital Silence Guarantee**: [`components/SpatialAudioMixer.tsx`](file:///Users/nitinagga/Documents/zyvoriq/components/SpatialAudioMixer.tsx) uses pure digital silence blobs (`createSilenceWavBlob()`) rather than synthetic audible sine waves when stems are unrendered.

---

## 6. Verification Quality Gates

Every code change must pass:
1. **TypeScript Typecheck**: `npx tsc --noEmit` must exit with code `0`.
2. **Legacy Governance Audit**: `npm run guard:legacy` must confirm zero banned packages (`SadTalker`, `Wav2Lip`, `D-ID`, `mp4v`).
3. **Automated E2E Headless Suite**: Headless macOS Chrome verification capturing visual proofs in `scratch/screenshots_<task_id>/`.
