# Zyvoriq — AI-Native Generative Cinema & 12-Agent Dance Music Video Swarm Platform (`v3.5.0`)

- **Governance Epoch**: `3.5.0` (synchronized across `AGENTS.md`, `hooks.json`, `skills.json`, `plugin.json`, `skills.md`, and `README.md`)
- **Failure Mode**: `FAIL_CLOSED` (`unmatched_fallback.unknown_mutation_tool = "REJECT"`)
- **Single Universal Governance Source (`~/.gemini/config/`)**:
  1. **Tier 1 — Normative Constitution (`AGENTS.md`)**: `/Users/nitinagga/.gemini/config/AGENTS.md` (symlinked at `${ZYVORIQ_ROOT}/AGENTS.md`, `${ZYVORIQ_ROOT}/GEMINI.md`, `${ZYVORIQ_ROOT}/CLAUDE.md`, & `${ZYVORIQ_ROOT}/.agents/AGENTS.md`)
  2. **Tier 2 — Executable Runtime Control Plane (`hooks.json`)**: `/Users/nitinagga/.gemini/config/hooks.json` (symlinked at `${ZYVORIQ_ROOT}/hooks.json`, `${ZYVORIQ_ROOT}/.agents/hooks.json`, & `${ZYVORIQ_ROOT}/plugins/zyvoriq_guard/hooks.json`)
  3. **Tier 3 — Skills Manifest & Registry (`skills.json` & `skills.md`)**: `/Users/nitinagga/.gemini/config/skills.json` & `/Users/nitinagga/.gemini/config/skills.md` (symlinked at `${ZYVORIQ_ROOT}/skills.json`, `${ZYVORIQ_ROOT}/skills.md`, `${ZYVORIQ_ROOT}/skills`, & `${ZYVORIQ_ROOT}/.agents/skills`)
  4. **Tier 4 — Host Plugin Manifest (`plugin.json`)**: `/Users/nitinagga/.gemini/config/plugins/zyvoriq_guard/plugin.json` (symlinked at `${ZYVORIQ_ROOT}/plugins/zyvoriq_guard/plugin.json`)

---

## 1. Canonical 5-Tier Google / Gemini / DeepMind Model Stack (`v3.5.0`)

1. **Tier 1 — Omni 1.1 Master Orchestrator, Multi-Turn Video Synthesis & Multimodal Forensic Judge**:
   - `google-omni-1.1` / `models/gemini-omni-1.1-flash` (`POST /v1beta/interactions`)
2. **Tier 2 — Deep Architectural Reasoning, Creative Surpass Direction & Multimodal Vision**:
   - `models/gemini-3.1-pro-preview` & `models/gemini-2.5-pro`
3. **Tier 3 — High-Throughput Sub-Second Structured JSON Compiler, YouTube Reference Deconstruction & Biometric Synthesis**:
   - `models/gemini-3.8-flash`, `models/gemini-3.1-flash`, `models/gemini-2.5-flash`, & `models/gemini-2.5-flash-lite` (`thinkingConfig: { thinkingLevel: "LOW" | "MEDIUM" | "HIGH" }`)
4. **Tier 4 — Real-Time Bidirectional & Sub-Second Interactive Streaming**:
   - `models/gemini-3.1-flash-live-preview`
5. **Tier 5 — Native DeepMind Multimodal Media, Audio, Image & Embeddings**:
   - **Video Synthesis**: `models/veo-3.1-generate-preview` & `models/gemini-omni-1.1-flash`
   - **Studio Music & Vocal Synthesis**: `models/lyria-3-pro-preview` & `models/lyria-3.5` (`48,000 Hz` stereo, `-14.0 LUFS`)
   - **Neural Speech & TTS**: `models/gemini-3.1-flash-tts-preview`
   - **8K Character & Keyframe Portraits**: `models/imagen-3.0-generate-002` & `models/gemini-3.1-flash-image-preview`
   - **Vector Embeddings**: `models/gemini-embedding-001` & `models/text-embedding-005`

---

## 2. 12-Agent Dance Music Video Swarm & Three-Stage Forensic Enforcer Chain

All studio workflows, pre-render blueprints, and rendered `.mp4` masters are governed by the runtime `FAIL_CLOSED` hook pipeline:
- **Stage 0.5 — Pre-Render 12-Agent Blueprint & 10 Cross-Agent Invariant Auditor (`audit12AgentBlueprintConsistency` & `stop_quality_gate.mjs`)**:
  - Verifies all 12 agents (`Script`, `Casting`, `Wardrobe`, `Location`, `Prop`, `Choreography`, `Acting & Facial`, `Lighting & Camera`, `Narration & Lyric`, `Music & Acoustic`, `Cinematography & Assembly`, `Forensic QA Judge`) pass all 10 Cross-Agent Invariants (`10.0 / 10`):
    1. Clean 2-Act narrative logline (zero raw URL echo) + 3 reference-specific scene limitations (zero parroted boilerplate).
    2. All 6 personas (`female_lead`, `female_harmony`, `male_lead`, `supporting`, `background`, `audience`) locked with 6 unique culturally-clustered biometric portraits.
    3. All 5 cast tiers evolve from `Act I (0:00–0:30)` $\rightarrow$ `Act II (0:30–1:00)` + Figure-Ground HSV Contrast Lock ($\ge 35\%$ separation).
    4. Dual-Act spatial metamorphosis (`Act I Venue -> Act II Venue`) anchored to reference geography.
    5. Per-tier footwear, statement jewelry, hair physics, live musician instruments & Act II kinetic props.
    6. 6-shot kinetic choreography progression with distinct lead vs. 8-dancer geometric formations.
    7. Dual-Mode Active Vocalist Viseme (`r >= 0.72` mouth-aperture-to-audio envelope correlation on singing leads) + Non-Singing Ensemble Closed-Lips (`RMS <= 0.015`, Nayan-Abhinaya eye emotion).
    8. 6-shot focal length (`mm`), T-stop, rig movement & Kelvin/CRI lighting schedule.
    9. 60s lyric sheet with `[Female Lead]`, `[Male Lead]`, and `[Female Co-Lead]` harmony hooks + locked BPM & musical key across `models/lyria-3-pro-preview`.
    10. Truthful `PRE_FLIGHT_LOCKED` status pre-render (`COMPLETED` only after physical `.mp4` render) and zero hardcoded `"9.8 / 10"` rubber-stamping.
- **Stage 1 — Deterministic Signal & Frame Prober**: `${ZYVORIQ_ROOT:-/Users/nitinagga/Documents/zyvoriq}/scripts/guards/universal_deterministic_output_auditor.mjs` performs deterministic `ffprobe`, `24/1` CFR, STFT spectrogram, optical flow, pixel-domain luma step velocity, cross-turn boundary PSNR (`[26.0, 42.0] dB`), and mouth-onset viseme sync (`r >= 0.72`) checks.
- **Stage 2 — Binding Final Multimodal Judge**: `Google Omni 1.1` (`models/gemini-omni-1.1-flash`) & `Gemini 3.1 Pro` (`models/gemini-3.1-pro-preview`) (`authority: BINDING_VETO`) evaluate Stage 1 telemetry and sign the cryptographic PASS/FAIL verdict receipt via `scripts/stop_quality_gate.mjs`.

---

## 3. Core Studio Workflows & Canonical API Endpoints (`Next.js 15` / `React 19` / `TypeScript 5`)

### 3.1 Unified 4-Platform Generative Cinema Studio (`app/swarm-MUI/page.tsx`, `app/entity/[id]/page.tsx` & `app/personas/page.tsx`)
1. **Workflow 1 — 4-Platform Generative Cinema & Multi-Act Director Studio (`/swarm-MUI`)**:
   - **InVideo AI Director Workflow**: Prominent `+ New Reel` Director Wizard Modal (`data-testid="header-new-reel-btn"` / `data-testid="new-reel-director-modal"`), 1-Prompt / YouTube URL Script & 12-Agent Production Bible compiler, explicit **Duration Selector (`15s`, `30s`, `60s`, `120s`, `180s`, `300s / 5 Min` — 10 Parallel Acts)**, and **6 Kinetic Subtitle Style Presets**.
   - **Higgsfield AI Video Rig & Optics (`left-rail-tab-camera_vfx`)**: **12 Cinema Camera Rig Presets** (`Crash Zoom`, `Bullet Time 360°`, `FPV Drone Dive`, `Dolly Zoom / Vertigo`, `SnorriCam Chest-Rig`, `Crane Up Reveal`, `Dutch Angle Thriller`, `Whip Pan Transition`, `Hyper-Lapse Orbit`, `Macro Eye-In`, `Handheld Docu-Grit`, `Overhead God's Eye`), **6 Optical Lens & Film Stock Emulations** (`ARRI Alexa 65 + Panavision Anamorphic`, `IMAX 70mm Kodak 2383`, `Cooke S4 Prime`, `Vintage 16mm Bolex`, `Cyberpunk Cyan/Amber Halation`, `Noir Silver Gelatin`), and **8 VFX Atmospheric Modifiers** (`Anamorphic Blue Lens Flare`, `Celestial Golden Particle Aura`, `Volumetric Blizzard Fog`, `Pyro Sparks`, `Chromatic Halation`, `35mm Film Grain`, `Rain Streak Reflections`, `Clean Digital Master`).
   - **Runway Gen-4.5 Director Mode & Motion Brush**: **5-Layer Multi-Motion Brush** (`Subject`, `Foreground`, `Midground`, `Background`, `Ambient Particles`) with live `X`/`Y`/`Z` velocity vectors, **6-Axis Camera Vector Rig** (`Pan X`, `Tilt Y`, `Zoom Z`, `Roll`, `Speed`), and **Keyframe Continuity Lock** (`Start/Mid/End`, `Act-One Character Lock`, `Optical Flow`).
   - **Canva AI Video Generator Multi-Track Timeline & Themes**: **4 Daylight Studio Theme Presets** (`Canva Daylight Clean`, `InVideo Studio Slate`, `Runway Director Crisp`, `Higgsfield Warm Ivory` — all compliant with `Rule 54` Executive Light Theme), **5-Track Synchronized Multi-Layer Timeline** (`Track 1: Video Acts`, `Track 2: Camera & VFX`, `Track 3: Dialogue & VO`, `Track 4: Lyria 3 Pro 124 BPM Score`, `Track 5: Kinetic Subtitles`), and **Uncropped Fullscreen & Fit Controls** (`object-fit: contain` in both stage and `:fullscreen` / `:-webkit-full-screen` so top and bottom are never chopped off).
2. **Workflow 2 — Canonical Object Store, Verified Library & Entity Inspector (`/swarm-MUI?reel=<id>&act=<actId>` & `/entity/[id]`)**:
   - Every generated or curated reel (`ZYV-REEL-MI10-300S`, `ZYV-REEL-KAILASH-60S`, `ZYV-REEL-HUNTER-60S`, `ZYV-REEL-SPEAKEASY-60S`, `ZYV-REEL-BARCELONA-60S`, `ZYV-REEL-NEOTOKYO-60S`) and every individual act (`ZYV-ACT-MI10-300S-01`..`10`) has a deterministic **Canonical ID** and permanent deep-linkable URL (`/entity/ZYV-REEL-MI10-300S` and `/swarm-MUI?reel=ZYV-REEL-MI10-300S&act=ZYV-ACT-MI10-300S-01`).
   - Includes the verified **5-Minute (`300.0s`, 10-Act, 7,200-frame, `24/1` CFR, `720x1280`) Master Reel** for *Mission: Impossible 10 — The Multiverse Protocol* (`public/assets/swarm/generated/job_1793105000_mission_impossible_10_multiverse_300s/combined_300s.mp4`).
3. **Workflow 3 — Parallel Multi-Act Swarm Render Engine (`app/api/swarm/jobs/route.ts`)**:
   - Executes all `N` acts (`6` acts for `60s` or `10` acts for `300s / 5m`) in parallel via `Promise.all` across 12 concurrent Swarm workers with `AbortSignal.timeout(10000)` anti-stall protection (`0` stuck jobs at `32%`) and automatic persistence into `lib/swarm/libraryStore.ts` (`public/assets/swarm/library_manifest.json`).
4. **Workflow 4 — Custom Persona & Biometric Anchor Builder (`/personas`)**:
   - Create and persist custom cast members via AI Biometric Prompt Synthesis (`models/gemini-2.5-flash`), local base64 photo upload (`public/assets/avatars/`), or external image URL import.
5. **Workflow 5 — Deep Research Pre-Production & 7-Department Bible Engine (`lib/swarm/deepResearchBible.ts` & `components/DeepResearchBiblePanel.tsx`)**:
   - Synthesizes and audits all 7 pre-production departments (**WGA Screenplay**, **Characters & Principal Leads**, **Production Crew**, **Visual Effects [VFX] & Physics Simulation**, **Lighting & Kelvin Plot**, **4-Stem Sound Effects [SFX] & Sync Foley**, and **Deep Research Domain Corpus**) with a quantitative **5-Dimension Audit Scorecard** (`Accuracy`, `Relevancy`, `Continuity`, `Completeness`, `Faithfulness` — `99.2% VERIFIED` on `ZYV-BIBLE-MI10-300S`).

### 3.2 Canonical `/api/*` Endpoints
- `GET /api/library` & `GET /api/swarm/library` — Unified Canonical Object & Physically Verified `.mp4` Master Library (`ZYV-REEL-MI10-300S` first).
- `GET /api/entity/[id]` — Canonical Object & Act Resolver returning metadata, uncropped stream URL, parallel worker telemetry, 10-Act manifest, and `deepResearchBible` for any `ZYV-REEL-*` or `ZYV-ACT-*` ID.
- `GET & POST /api/swarm/deep-research` — Deep Research Pre-Production & 7-Department Bible Synthesizer & 5-Dimension Auditor (`Accuracy`, `Relevancy`, `Continuity`, `Completeness`, `Faithfulness`).
- `POST /api/swarm/synthesize-from-prompt` — 3-Stage (`Deconstruct -> Elevate -> Surpass`) 12-Agent Production Bible, 7-Department Deep Research Bible & Multi-Act (`15s`–`300s / 10-Act`) Storyboard Compiler.
- `POST & GET /api/swarm/jobs` — Parallel Multi-Act (`Promise.all` + `10s` timeout guard) `24/1` CFR `9:16` Video & `48kHz` Audio Render Engine.
- `POST & GET /api/swarm/avatar-builder` — Custom Persona & Biometric Anchor Builder (`prompt`, `upload`, `url`).

---

## 4. Local & Dual-Machine Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Verify TypeScript compilation
./node_modules/.bin/tsc --noEmit

# Enforce single-source trinity across hooks.json, skills.json, skills.md, and AGENTS.md
node scripts/guards/enforce_universal_single_source_trinity.mjs --auto-heal

# Run stop quality gate & deterministic forensic verification
echo '{"workspacePaths":["/Users/nitinagga/Documents/zyvoriq"],"terminationReason":"model_stop"}' | node scripts/stop_quality_gate.mjs
```

---

## 5. Cloud Run Production Deployment & Forensic Audit Certification (`e2et`)

- **Cloud Run BeyondCorp URL (`Rule 56`)**: `https://zyvoriq-248990048888.cr.gclb.goog` (Service: `zyvoriq` in `ramp-portal-dev`, `us-west1`, `Ready=True`, `Traffic=100%`).
- **Canonical Permalinks**:
  - Studio Workspace: `https://zyvoriq-248990048888.cr.gclb.goog/swarm-MUI`
  - 5-Min Mission: Impossible 10 Master Permalink: `https://zyvoriq-248990048888.cr.gclb.goog/entity/ZYV-REEL-MI10-300S`
  - Studio Deep-Link for Act 1: `https://zyvoriq-248990048888.cr.gclb.goog/swarm-MUI?reel=ZYV-REEL-MI10-300S&act=ZYV-ACT-MI10-300S-01`
- **Database & SQL Injection Resilience (`RCA-ZYV-01`, `RCA-ZYV-14` — `lib/db/client.ts`, `app/api/health/route.ts`, `app/api/swarm/jobs/route.ts`)**: Automatically detects and bypasses dead/decommissioned `.rlwy.net` / `railway.internal` Postgres URLs and falls back to local SQLite (`dev.db`) with `{"engine":"sqlite","connected":true}`, and sanitizes all `sqlite3` `studio_entities` inserts via `escSql()`.
- **API-Key Header Security, Rule 55 `thinkingLevel`, SSRF & Path-Traversal Hardening (`RCA-ZYV-02`, `RCA-ZYV-12`..`17`)**:
  - `GET /api/health/api-key` reads `.env.local` / `.env` and verifies configured studio tokens (`ok: true, configured: true`).
  - Migrated Gemini API authentication from `?key=` URL query strings to `"x-goog-api-key"` HTTP request headers and replaced numeric `thinkingBudget: 0` with `Rule 55` discrete `thinkingConfig: { thinkingLevel: "LOW" | "HIGH" }`.
  - Enforced `isSafePublicHttpUrl()` (`redirect: "manual"`) on YouTube oEmbed fetches to block SSRF and `sanitizeJobId()` (`/job_[a-zA-Z0-9_-]{1,80}/`) on `GET /api/swarm/jobs?id=...` to block path traversal.
- **Uncropped 9:16/16:9 Cinema Stage, 5-Minute (`300.0s`, 10-Act) Parallel Synthesis & Canonical Entity Vault**:
  - Fullscreen and stage video players enforce `object-fit: contain !important` (`:fullscreen` / `:-webkit-full-screen` in `app/globals.css`) so top and bottom frames are never chopped off.
  - Parallel 10-Act synthesis (`Promise.all` with `AbortSignal.timeout(10000)` per upstream call) eliminates the `32%` sequential stall and auto-registers every completed master in `lib/swarm/libraryStore.ts` with a permanent `ZYV-REEL-*` ID.
- **Executive Light Theme Default & Zero Broken Portrait Guarantee (`Rule 54` & `RCA-ZYV-07` — `app/swarm-MUI/page.tsx`, `app/entity/[id]/page.tsx`, `app/personas/page.tsx`, `lib/studioCatalog.ts`)**: All routes render in Executive Light Theme (`#f8fafc` canvas, `#ffffff` cards, `#0f172a` ink) with all 36 `PERSONAS_CATALOG` entries mapped to verified `/assets/characters/*.jpg` portraits (`0` broken `<img>` icons).
- **Option A — Lean Omni-First + Veo 3.1 Safety-Net & Retired Studio1 Worker (`lib/ai/veoService.ts`, `scripts/yt_pipeline.mjs`, `app/api/swarm/jobs/route.ts`, `app/entity/[id]/page.tsx`)**: `models/gemini-omni-1.1-flash` (`omni11_lyria3`) serves as the primary native AV engine, backed by the lean Veo 3.1 safety-net (`veo-3.1-fast-generate-preview` live fallback + optional `veo31_4k` 4K diffusion) and dynamic `"Omni 1.1"` vs `"Veo 3.1"` entity provenance; legacy `Studio1` queue workers and unmounted `/api/studio1/*` routes are permanently pruned.



