# Zyvoriq Workspace Skills & Engineering Protocols

Specialized autonomous engineering skills enforced across the Zyvoriq codebase.
Every skill here maps to code that actually runs. If a skill references a check,
that check is wired into the worker pipeline and/or CI.

---

## 1. `omni-plan-authority` (Omni 1.1 supremacy)

**Trigger:** any production, any model call, any regeneration.

- No model runs without an Omni Execution Plan (`lib/reel/omniExecutionPlan.ts`).
  The plan is a signed DAG with an `omni_plan_token` on `reel_production_controls`.
- Every operation carries `omniPlanToken` + `omniNodeId`. The worker's
  `controlFor()` calls `assertAuthorizedByOmniPlan()`; a mismatch refuses the op
  with `OPERATION_CANCELLED` (drains, no cascade).
- Model calling order is Omni's, not the worker's: Lyria (5-min music) → Nano
  Banana (`gemini-2.5-flash-image`) anchors with continuity → Veo per shot →
  lip/face mapping → audit.
- `regen_reel` mints a new plan token, de-authorizing all in-flight ops.

---

## 2. `deterministic-quality-gates` (Omni's sensors)

**Trigger:** every reel/shot render, in-pipeline and in CI.

- The deterministic suite in `scripts/guards/` is the sensor layer:
  `gate_viseme_phoneme_lipsync_presence`, `gate_speech_visual_onset_sync`,
  `gate_video_optical_flow`, `gate_scene_boundary_audio_bleed`,
  `gate_asr_script_semantic_match`, `gate_motion_velocity_cadence`,
  `gate_audio_semantic_ground_truth`, `gate_platform_capabilities`.
- Run in CI: `npm run guard:deterministic`. Run in the worker post-render for the
  active production. **A gate not wired into the pipeline is not a gate.**
- Sensors flag frames; **Omni adjudicates only flagged frames** and returns
  `surgical_fix | regen_clip | regen_reel`. Omni is never the per-frame scanner.

---

## 3. `proactive-telemetry-forensics` (Zero-Wait log auditing)

**Trigger:** during/after any generation event, queue transition, worker run.

- Pull live logs on Cloudtop:
  `railway logs --service zyvoriq-reel-worker --lines 100`
  and `--service zyvoriq`.
- Audit `studio1 render resync`: flag `clampFloorBound === true`; compute
  discarded surplus. **Do not compress shots** — target per-shot duration is
  aligned to the ~8 s Veo delivers, so `retimeFactor` should stay ≈ 1.0. Surplus
  > 3.0 s on any shot or > 20% total is a planner-calibration defect.
- Audit `[narration-cadence]` WPS vs `wordsPerSecondForGenre(genre)` in
  `lib/studio1/planner.ts`; if it diverges by > ±0.3 wps, recalibrate the planner.
- For `MUSIC_VIDEO`, assert `audioStrategy === "native"`; `renderRough` must not
  dub synthetic TTS over native singing, must not truncate with `-t d`, and keeps
  native audio at `volume=1.00` / −24 LUFS.

---

## 4. `cinema-feature-film-qa` (15-min feature player & EDL QA)

**Trigger:** editing `app/studio/cinema/page.tsx`,
`lib/cinema/dharmakshetra15m.ts` (118-shot EDL), or the cinema audit surface.
(Verify these paths exist before wiring a trigger; do not reference a page that
was removed.)

- Ban synthetic `<video loop>` in long-form players.
- 15-minute master clock `timeline15mSec` (0–900 s), monotonic forward.
- 118 shots, each unique optics/motion/lighting, no cycling.
- Run `node scripts/qa/verify_15min_feature_film.mjs` until all guards pass.

---

## 5. `cross-viewport-auditor` (Dual-OS mobile & ultra-wide)

**Trigger:** editing UI components, responsive grids, media cards, nav.

- Zero horizontal overflow: `document.documentElement.scrollWidth <= window.innerWidth`.
- Assert + screenshot iOS Safari (390×844), Android Chrome (412×915), ultra-wide (1600×950).
- iOS inputs ≥ 16px font. Touch targets ≥ 44×44px. `<video>` uses
  `playsInline muted autoPlay preload="auto"`.

---

## 6. `database-schema-guard` (Dual SQLite & Postgres)

**Trigger:** editing SQL schemas, migrations, queries.

- SQLite `0/1` booleans must map cleanly to Postgres `true/false`.
- SQLite connections run `PRAGMA foreign_keys = ON;`.
- **Migrations run through a versioned runner** (`migrations/*.sql`, ordered,
  awaited, transactional). Schema changes use `ADD COLUMN IF NOT EXISTS` — note
  that re-running a `CREATE TABLE IF NOT EXISTS` block does NOT add new columns to
  an existing table, which is why column changes must be explicit migrations.

---

## 7. `performance-and-telemetry` (Vitals & server health)

**Trigger:** benchmarking page speed, worker memory, API latency.

- Client budget: LCP ≤ 2.5 s, CLS ≤ 0.1, TTFB ≤ 800 ms.
- Worker: volume free > 1000 MB; claim attempt circuit breaker `< 5` (quarantine
  at ≥ 5); 30-second watchdog active.
