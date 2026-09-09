# 🧰 Zyvoriq Workspace Skills & Engineering Protocols

This document defines the specialized autonomous engineering skills, forensic telemetry procedures, and quality protocols enforced across the Zyvoriq codebase.

---

## 1. 🔍 `proactive-telemetry-forensics` (Zero-Wait Autonomous Log Auditing)

### Purpose & Trigger Conditions
Trigger this skill immediately during and after any video/audio generation event, queue transition, or worker execution.
**CRITICAL RULE**: Never wait for Claude, external tools, or the user to inspect logs, extract error messages, or perform forensic math on clip durations. Antigravity must autonomously pull, parse, and diagnose Railway container logs directly on Cloudtop.

### Core Protocol & Verification Steps
1. **Live Log Tailing on Cloudtop**:
   Stream or query live JSON logs from both services:
   ```bash
   ssh nitinagga.c.googlers.com 'export PATH=$HOME/bin:$PATH; cd ~/zyvoriq_remote && railway logs --service zyvoriq-reel-worker --lines 100 --json'
   ssh nitinagga.c.googlers.com 'export PATH=$HOME/bin:$PATH; cd ~/zyvoriq_remote && railway logs --service zyvoriq --lines 100 --json'
   ```
   Or execute the dedicated live watchdog:
   ```bash
   ssh nitinagga.c.googlers.com 'export PATH=$HOME/bin:$PATH; cd ~/zyvoriq_remote && node scripts/telemetry_watchdog.mjs --once --lines 150'
   ```

2. **Automated Retime Clamp & Surplus Duration Math**:
   - Parse `studio1 render resync` telemetry payloads.
   - Audit every shot for `clampFloorBound === true`.
   - Compute exact surplus seconds trimmed: `surplusSec = sourceSec - (usableSec || targetSec)`.
   - Compute total clip discard percentage: `totalSurplus / totalGenerated`.
   - **Action Threshold**: If surplus exceeds 3.0s on any shot or total waste exceeds 20%, immediately diagnose root cause:
     - Is the word ceiling too low (e.g. 10 words yielding only 3s audio)?
     - Is TTS speaking faster than planned (e.g. 2.1 wps vs 1.4 wps)?
     - Is Veo locked to an 8s bucket due to image attachments?
   - Autonomously iterate and correct the planner or prompts without waiting for user instruction.

3. **Speech Cadence (WPS) Calibration**:
   - Track `[narration-cadence]`: `words / duration = wps`.
   - Compare against `wordsPerSecondForGenre(genre)` in `lib/studio1/planner.ts`.
   - Maintain historical measurements (e.g. 2026-09-09 telemetry: `44 words / 20.64s = 2.13 wps`).

4. **Audio Strategy & Speech-Sync Integrity**:
   - Assert `audio strategy` explicitly matches the requested genre.
   - For `MUSIC_VIDEO`, strictly verify `audioStrategy === "native"`.
   - Enforce that `renderRough` never blends synthetic TTS (`narrationPath`) over native character singing/speaking.
   - Enforce that native audio is kept at `volume=1.00` normalized to `-24 LUFS` with zero `-t d` truncation.

---

## 2. 🎬 `cinema-feature-film-qa` (15-Minute Feature Film Player & EDL QA)

### Purpose & Trigger Conditions
Trigger when modifying:
- 15-minute Cinema Originals player: `app/studio/cinema/page.tsx`
- Cinema Audit & Scoring Hub: `app/studio/cinema/audit/page.tsx`
- 118-Shot EDL generator: `lib/cinema/dharmakshetra15m.ts`

### Core Rules
1. **Absolute Ban on Synthetic `<video loop>`**: Long-form master players must never loop clips to mask asset shortages.
2. **15-Minute Master Timeline Clock**: Playback progression is governed by `timeline15mSec` (0 to 900s), advancing monotonically forward.
3. **118-Shot Visual Continuity**: Every shot in the EDL (#001 through #118) must possess unique optics, camera motions, and lighting without repetitive cycling.
4. **Automated Guard Suite**: Run `node scripts/qa/verify_15min_feature_film.mjs` until all 4 guards pass.

---

## 3. 📱 `cross-viewport-auditor` (Dual-OS Mobile & Ultra-Wide Compatibility)

### Purpose & Trigger Conditions
Trigger when modifying UI components, responsive grids, media cards, or navigation bars.

### Core Rules
1. **Zero Horizontal Overflow (`overflow-x-hidden`)**: All containers must satisfy `document.documentElement.scrollWidth <= window.innerWidth`.
2. **Automated Dual-OS Viewport Assertions**: Every QA run must test:
   - iOS Safari: iPhone 14 @ `390x844`
   - Android Chrome: Pixel 7 @ `412x915`
   - Ultra-Wide Desktop: `1600x950`
3. **iOS Auto-Zoom Prevention**: Inputs must use `font-size >= 16px` on mobile (`text-base md:text-sm`).
4. **Touch Target Accessibility**: Minimum `44x44px` clickable/tap area for all buttons and interactive controls.
5. **Native Inline Video**: All `<video>` tags must specify `playsInline`, `muted`, `autoPlay`, and `preload="auto"`.

---

## 4. 🗄️ `database-schema-guard` (Dual SQLite & PostgreSQL Safety)

### Purpose & Trigger Conditions
Trigger when modifying SQL schemas, migrations, or database queries.

### Core Rules
1. **Dual-Engine Type Compatibility**: SQLite integer booleans (`0` / `1`) must map cleanly to PostgreSQL booleans (`true` / `false`).
2. **Foreign Key Enforcement**: Always execute `PRAGMA foreign_keys = ON;` in SQLite connections to mirror PostgreSQL.
3. **Migration Safety**: Always use `ADD COLUMN IF NOT EXISTS` syntax when modifying database columns.

---

## 5. ⚡ `performance-and-telemetry` (Client Vitals & Server Health)

### Purpose & Trigger Conditions
Trigger when benchmarking page speed, server container memory, or API latency.

### Core Rules
1. **Client Core Web Vitals Budget**:
   - LCP ≤ 2.5s
   - CLS ≤ 0.1
   - TTFB ≤ 800ms
2. **Container Telemetry Budget**:
   - Worker volume disk free > 1000MB.
   - Claim attempt circuit breaker: `attempt < 5` (quarantine at >= 5).
   - Zero deadlock starvation: 30-second background watchdog active.
