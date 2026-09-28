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
   - `models/gemini-3.8-flash`, `models/gemini-3.1-flash`, `models/gemini-2.5-flash`, & `models/gemini-2.5-flash-lite` (`thinkingConfig: { thinkingBudget: 0 }`)
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

### 3.1 Studio Workflows (`app/swarm-MUI/page.tsx` & `app/personas/page.tsx`)
1. **Workflow 1 — 4-Step Dance Music Video & Generative Cinema Studio (`/swarm-MUI` -> `studio`)**:
   - **Step 1 (Prompt / YouTube URL & Creative Surpass Blueprint)**: Enter any natural language prompt or YouTube URL (`youtube.com/watch?v=...`, `youtu.be/...`, `youtube.com/shorts/...`). Runs the 3-Stage **Deconstruct $\rightarrow$ Elevate $\rightarrow$ Surpass** compiler to generate an original 12-agent production bible and `CreativeElevationDossier` with zero hardcoded presets.
   - **Step 2 (6-Persona Biometric Cast, 5-Tier Act I/II Wardrobe & Acoustic Direction)**: Configure 6-persona culturally-clustered casting, 5-tier Act I $\rightarrow$ Act II couture evolution, 8-count choreography, 6-shot optics/Kelvin schedule, and custom persona biometric anchors (`getDanceMusicVideoAgents({...})`).
   - **Step 3 (6-Turn Storyboard & Shot Inspector)**: Inspect and customize each 10.0s turn (`Act I 0:00–0:30` $\rightarrow$ `Act II 0:30–1:00`), preserving user shot edits via `customShotsRef`.
   - **Step 4 (Live 12-Agent Swarm Execution & Master Playback)**: Launches live `models/gemini-omni-1.1-flash` video turns + `models/lyria-3-pro-preview` 48kHz audio synthesis, stitches the `24/1` CFR `9:16` master `.mp4`, and persists results to `localStorage` (`zyvoriq_reels_repo_v2`).
2. **Workflow 2 — Published Reels & Verified Asset Library (`/swarm-MUI` -> `library`)**:
   - Browse, inspect, play back, download, or reload any physically verified `.mp4` master or turn asset (`size >= 10,000` bytes) directly into the 4-Step Studio.
3. **Workflow 3 — Drafts & Render Jobs Queue (`/swarm-MUI` -> `drafts`)**:
   - Manage saved draft storyboards (`Save Draft`), monitor active/completed/failed render jobs, and resume any draft in the 4-Step Studio in 1 click.
4. **Workflow 4 — Custom Persona & Biometric Anchor Builder (`/personas`)**:
   - Create and persist custom cast members via AI Biometric Prompt Synthesis (`models/gemini-2.5-flash`), local base64 photo upload (`public/assets/avatars/`), or external image URL import.

### 3.2 Canonical `/api/swarm/*` Endpoints
- `POST /api/swarm/synthesize-from-prompt` — 3-Stage (`Deconstruct -> Elevate -> Surpass`) 12-Agent Production Bible & YouTube Reference Compiler (`models/gemini-2.5-flash` / `models/gemini-3.8-flash`).
- `POST & GET /api/swarm/jobs` — Live 6-Turn `models/gemini-omni-1.1-flash` + `models/lyria-3-pro-preview` 24/1 CFR 9:16 Video & 48kHz Audio Render Engine.
- `POST & GET /api/swarm/avatar-builder` — Custom Persona & Biometric Anchor Builder (`prompt`, `upload`, `url`).
- `GET /api/swarm/library` — Physically Verified `.mp4` Master & Turn Asset Library.

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
