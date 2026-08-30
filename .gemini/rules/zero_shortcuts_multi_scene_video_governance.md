# 🔒 ZERO SHORTCUTS & PERMANENT QUALITY GOVERNANCE PROTOCOL

## 1. Absolute Prohibition on Rushing & Looping Shortcuts
- **NO CLIP REPETITION**: Never loop a single video clip or reuse identical visual frames across different narrative acts or dialogue segments. Every scene must have distinct visual generation unless an editor explicitly reuses a shot for a deliberate narrative callback.
- **NO ACCIDENTAL DISCONTINUITY**: Hard cuts are valid and often preferred for short-form media. Every scene boundary must intentionally choose the transition that best preserves narrative, action, motion, eyeline, audio and pacing. Allowed transition families include hard cut, cut-on-action, match cut, intentional jump cut, whip, dip, dissolve and graphic transition. Never apply one transition type globally by default.
- **GENERATION DURATION ≠ EDITORIAL DURATION**: Veo source clips may be generated in supported 4/6/8 second units, but the final timeline may trim and combine arbitrary editorial durations. Never force story beats to align to generator boundaries.
- **NO FAKE/UNCONDITIONED LIP-SYNC**: Never claim lip-sync quality from heuristic word timing or playback progression. Lip-sync must be measured against the actual synthesized/recorded audio and the visible mouth motion, or remain explicitly `PENDING`/`UNVERIFIED`.
- **AUDIO MASTER CLOCK FOR SPEECH-LED CONTENT**: Generate or ingest the master narration first, obtain timestamps from the actual waveform/alignment pipeline, and derive shot timing/captions from those timestamps. Do not distribute text mathematically over a guessed duration and call it synchronization.

## 2. Continuity Requirements
- **CONTINUITY IN/OUT CONTRACT**: Every shot must declare continuity-in and continuity-out state for identity, wardrobe, environment, lighting, props, action, camera and eyeline where applicable.
- **DEPENDENCY-AWARE GENERATION**: Shots that depend on a previous visual state must not be generated as independent parallel jobs. Independent b-roll may generate concurrently.
- **REFERENCE HANDOFF**: Where the model supports it, pass an approved reference frame or equivalent identity/style reference from the upstream shot rather than relying on text alone.
- **TARGETED REPAIR**: A failed shot or boundary should regenerate the smallest dependent unit possible. Do not restart an entire production when an isolated repair is sufficient.

## 3. Hard Quality Gates Before Declaring Completion
- **NO PHANTOM COMPLETION**: A stage may be `COMPLETED` only when its expected immutable artifact actually exists. Empty URLs, guessed durations, placeholder media, or planned work are never completion evidence.
- **MASTER-FIRST QA**: Audit individual clips, every shot boundary, and the final assembled master. Cross-scene continuity failures can only be declared passed after master assembly.
- **BOUNDARY INSPECTION**: Sample densely around every edit boundary, not only at evenly spaced timestamps.
- **AUDIO QA**: Check real A/V synchronization, voice identity/prosody continuity, silence/gaps, clipping, loudness, music continuity, ducking and caption timing.
- **VISUAL QA**: Check identity, wardrobe, props, environment, lighting, anatomy, motion, camera direction, duplicated/frozen frames and semantic relevance to the spoken beat.
- **EXPLICIT FAILURE ASSERTIONS**: Static pixels, frozen limbs, unintended repeated footage, material A/V drift, broken identity continuity or missing artifacts must produce a failing quality gate.

## 4. Canonical Production State
Every long-form short-form production must be represented by a versioned Reel Production Manifest containing the master script, creative/continuity bible, master-clock choice, shot dependency graph, source assets, editorial trims, transitions, QA results and final master artifact.

The canonical state machine is:

`PLANNING → SCRIPT_READY → AUDIO_GENERATING → AUDIO_READY → SHOTS_PLANNED → VIDEO_GENERATING → ROUGH_CUT_READY → MIXING → MASTER_RENDERING → AUDITING → (REPAIRING ↔ AUDITING) → APPROVAL_REQUIRED/READY`

Any unrecoverable error transitions to `FAILED` with a persisted reason.

## 5. Technology Policy
- Prefer current high-quality generative video/audio models and standards-based media assembly.
- FFmpeg is an assembly/rendering tool, not a continuity engine; offsets and transition choices must come from the production manifest rather than hard-coded per-demo scripts.
- Never advertise a specific model, resolution, provenance method or audio sample rate unless the executed production path actually used and verified it.
