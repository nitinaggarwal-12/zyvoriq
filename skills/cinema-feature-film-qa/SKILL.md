---
name: cinema-feature-film-qa
description: Autonomous end-to-end testing, visual DOM verification, and acoustic validation for the 15-minute Cinema Originals player and multi-act film engine.
---

# 🎬 Cinema Feature Film QA Skill

## 1. Overview & Trigger Conditions
Use this skill whenever modifying or verifying:
- The 15-minute Cinema Originals player: [`app/studio/cinema/page.tsx`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/cinema/page.tsx)
- The Cinema Audit & Scoring Hub: [`app/studio/cinema/audit/page.tsx`](file:///Users/nitinagga/Documents/zyvoriq/app/studio/cinema/audit/page.tsx)
- The 118-Shot Edit Decision List (EDL) generator: [`lib/cinema/dharmakshetra15m.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/cinema/dharmakshetra15m.ts)
- Multi-act video switching, speech synthesis synchronization, or acoustic ducking logic.

---

## 2. Core Architectural Contracts & Zero-Assumption Media Protocol
1. **Zero Metadata Assumptions**: Never assume metadata, titles, or taglines reflect physical media payloads. Actual audio/video streams, durations, and pixel frames must be verified directly against criteria.
2. **Absolute Ban on Synthetic `<video loop>`**: The `<video>` element on long-form master feature film players must NEVER have the `loop` attribute. Synthetic looping is an anti-pattern that masks asset shortages.
3. **15-Minute Master Timeline Clock**: The player maintains an independent high-precision playback clock (`timeline15mSec`, 0 to 900 seconds). Playback progression is driven by master clock ticks, not by looping short video clips.
4. **118-Shot Visual Continuity Engine**: Every single shot in the 118-shot EDL (#001 through #118) must have a unique visual representation, optical camera motion, lens simulation, and scene telemetry with zero repetitive cycling.
5. **Temporal Monotonic Progression**: Playback must advance monotonically forward. E2E tests must verify that `currentTime` never drops backward or resets to 0 during continuous playback.
6. **Acoustic Ducking Balance**: Background orchestral audio volume during speech synthesis must duck to exactly `0.50` (50%), returning to `0.90` (90%) when speech completes.
7. **12 Multilingual Dialogue Scenes**: Canonical Sanskrit, Hindi, and English dialogues spread across all 5 acts with interactive scrub capability.
8. **Signed Google Chrome Execution**: Puppeteer MUST run with `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` to prevent macOS Santa security kills.

---

## 3. Mandatory Automated E2E QA Guards (Zero Blindspots)

The automated E2E test suite (`scripts/qa/verify_15min_feature_film.mjs`) must execute the following 4 automated guards in loops until all pass:
- **Guard 1: `assertNoSyntheticLoops`**: Asserts `video.hasAttribute('loop') === false`. Fails if any synthetic loop attribute is found on the master player.
- **Guard 2: `assertTemporalContinuity`**: Samples playback over continuous time; fails if `video.currentTime` rewinds, drops backward, or loops back to zero.
- **Guard 3: `assert118ShotUniqueness`**: Verifies all 118 shots in the Edit Decision List have 100% unique headings, lens data, lighting specifications, and distinct visual camera motion without repetitive duplicates.
- **Guard 4: `assertMediaDurationBudget`**: Directly inspects the physical duration of media files and audits the ratio of unique assets to EDL shots, preventing false assumptions based on metadata.

---

## 4. Verification Protocol

### Step 1: Pre-Flight Check
Ensure the Next.js development server is responsive:
```bash
curl -s http://localhost:3000/api/health | grep '"status":"ok"'
```

### Step 2: Clean Artifact Directory
Purge stale screenshots to avoid duplicate artifact inspection:
```bash
rm -rf scratch/screenshots_feature_film_qa/
```

### Step 3: Execute Headless Verification Suite
Run the 11-test automated suite:
```bash
node scripts/qa/verify_15min_feature_film.mjs
```

### Step 4: Validate Physical Output
Verify that all 11 tests pass with exit code `0`, and inspect the captured visual proofs:
- `01_cinema_desktop_overview.png`
- `02_scrub_dialogue_active.png`
- `03_cinema_audit_dashboard.png`
- `04_cinema_mobile_390x844.png`

---

## 4. Troubleshooting & Self-Healing Matrix

| Symptom | Root Cause | Self-Correction Procedure |
| :--- | :--- | :--- |
| **Static 6-second video loop** | Video `src` is static instead of dynamically computed based on `currentAct.actNumber`. | In `app/studio/cinema/page.tsx`, compute `currentVideoSrc` via `actFootageMap[currentAct?.actNumber || 1]` and pass to `<video src={currentVideoSrc}>`. |
| **No dialogues play after second 6** | `handleTimeUpdate` checks `videoRef.current.currentTime` instead of `timeline15mSec`. | Update `handleTimeUpdate` to check `timeline15mSec` for scheduled dialogue timestamps. |
| **Music inaudible during speech** | Audio ducking multiplier is set too low (`0.2` or lower). | Set `videoRef.current.volume = 0.50` during speech utterance and restore to `0.90` on `onend`. |
| **Mobile viewport test times out (30s)** | Calling `setViewport` on an existing tab with active video streams causes navigation hangs. | In Puppeteer, instantiate a clean tab (`const mobilePage = await browser.newPage()`) before setting mobile viewport and navigating. |
| **macOS Santa terminates Puppeteer** | Puppeteer attempting to launch unnotarized Chromium binary. | Configure `executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'` in launch options. |
