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

## 6. Genuine Google DeepMind Lyria 3.5 Audio Standard (Zero Synthetic Oscillators)
- Master music soundtracks for music videos, dance reels, and song productions MUST be generated directly via Google DeepMind Lyria (`models/lyria-3.5:generateContent`).
- Never simulate, mock, or placeholder music using synthetic sine-wave oscillators (`sine=frequency=`), noise generators (`anoisesrc=`), or static monotone sweeps.
- Polyphonic multi-stem accompaniment, basslines, percussion, and multi-section arrangements must be verified before cut assembly.

## 7. Mandatory Sequential Tail-Frame Chaining (Rule 13)
- In Google Veo (and image-conditioned video models), Frame 0 ($t=0.0\text{s}$) is pinned to the conditioned input image. Passing the same static poster still to consecutive shots (Shot 1, Shot 2, Shot 3) forces character teleportation back to the opening pose at every cut boundary.
- **Pipeline Requirement**:
  1. Shot 1 ($0-8\text{s}$): Conditioned on Character Anchor Poster.
  2. Extract exact tail frame: `ffmpeg -sseof -0.1 -i shot_01.mp4 -vframes 1 -q:v 2 shot_01_tail.jpg`.
  3. Shot 2 ($8-16\text{s}$): Conditioned on `shot_01_tail.jpg`.
  4. Extract exact tail frame: `ffmpeg -sseof -0.1 -i shot_02.mp4 -vframes 1 -q:v 2 shot_02_tail.jpg`.
  5. Shot 3 ($16-24\text{s}$): Conditioned on `shot_02_tail.jpg`.
- **PSNR Ceiling**: Cross-shot cut-boundary Frame 0 PSNR MUST be $<25.0\text{ dB}$. Any PSNR $\ge 25.0\text{ dB}$ trips the stop quality gate.

## 8. Audio-Visual Vocal Coincidence Mandate (Rule 14 - Zero Phantom Mouthing)
- Before writing video generation prompts, extract the exact timestamp $T_{\text{vocal}}$ where singing vocals begin on the master soundtrack.
- For all instrumental windows ($0.0\text{s} - T_{\text{vocal}}$), prompts must explicitly mandate: `mouth closed, lips together, serene joyful closed-lip smiles, non-vocal dance performance`.
- Prompts directing singing delivery are strictly restricted to timestamps where lead vocals are physically present on the soundtrack ($t \ge T_{\text{vocal}}$).

## 9. Vocal-Gender & Duet Character Binding (Rule 15 - Zero Cross-Gender Mouthing)
- Never permit a character whose visual presentation is female to articulate male vocals, nor a male character to articulate female vocals.
- Multi-artist tracks (e.g. duet or rap + chorus) require Omni Director to cast distinct biometric anchors for each artist, explicitly binding each shot's `onCameraCharacterId` to the performer.

## 10. Full-Spectrum Audio & Bass Retention (Rule 3b - Zero 200Hz Gutting Ban)
- Assemblers must never apply aggressive highpass filters (`highpass=f=200`) to native music video audio. The full sub-bass, kick drum, and synth body (35Hz–20kHz) must remain intact.
- Volume checks assert maximum sub-bass energy below 120Hz must exceed $-60\text{ dB}$.

## 11. Scene-Context Wardrobe Protocol (Rule 17 - Zero Dry Clothes in Water Ban)
- When generating characters in or directly adjacent to swimming pools, jacuzzis, oceans, or water bodies, character prompts and anchor plates must enforce authentic context swimwear (bikinis, swimsuits, monokinis, swim trunks, rashguards).
- Generating dry formal wear (blazers, dinner jackets, silk gowns, suits, tuxedos) in water bodies is strictly prohibited unless annotated with `DRY_CLOTHES_JUSTIFIED` or `SURREAL_FASHION_JUSTIFIED`.

## 12. 5-Axis Ensemble Biometric Differentiation (Rule 18 - Anti-Cloning Standard)
- In any ensemble featuring two or more characters of the same gender ($\ge 2$), prompts and casting sheets must enforce mutual exclusivity across:
  1. **Hairstyle Silhouette**: Non-overlapping haircuts (e.g., blunt bob vs voluminous waves vs braided ponytail vs buzzcut vs turban).
  2. **Facial Features & Grooming**: Distinct bone structure, facial hair, or makeup.
  3. **Complexion Undertone**: Diverse undertones (bronze vs wheatish vs olive).
  4. **Signature Accessories**: Mutually exclusive personal accessories.
  5. **Wardrobe Cut & Color Palette**: High-contrast colors and styles.

## 13. Cast Headcount & Multi-Character Shot-Budgeting (Rule 19 - Zero Group Vocal Bleed)
- Multi-character ensemble wide shots must NEVER direct simultaneous solo singing (`sings these EXACT words`) to the group.
- Singing lines in group shots are strictly permitted only when camera framing isolates a single focal performer (`close-up on [Lead]`), while all background performers are locked to `mouth closed, lips together, non-vocal dance and reaction`.

## 14. Ban on Prompt Contradictions & Oral Action Tokens (Rule 20)
- In diffusion video models, positive dynamic action verbs override negative grammatical constraints.
- Coupling "mouth closed" with oral action tokens (`genuine laughter with mouths closed`, `cheering with lips sealed`) forces open mouths and visible laughing teeth.
- Quarantined tokens during closed-mouth scenes: `laughter`, `laughing`, `giggle`, `giggling`, `cheering`, `shouting`, `yelling`, `screaming`, `talking`, `mouth open`, `jaw drop`.
- Authorized replacement phrasing: `serene joyful closed-lip smiles`, `poised dance expression`, `rhythmic gaze with lips together`.

## 15. Context-Aware Character Anchor Plates (Rule 22)
- **Non-Vocal Dance Reels**: Anchors must enforce sealed lips (`lips firmly sealed together, mouth closed, serene closed-lip expression, no teeth visible`).
- **Vocal Singing Music Videos**: Anchors must depict natural relaxed resting lips (`natural relaxed lips, expressive confident face, neutral resting facial posture, closed-to-neutral resting mouth`), providing a fluid base for Veo mouth articulation.

## 16. True Path B Lip-Sync & Vocal Articulation (Rules 23, 24, 25)
- **Active Singing Articulation (Rule 23)**: When singing vocals play ($t \ge T_{\text{vocal}}$), performers must be directed with active vocal articulation (`sings the lyrics directly to camera: "[Lyrics]", mouth and lips moving actively with natural vocal articulation, visible jaw movement and mouth opening/closing in sync with the song`).
- **Zero Smile Dilution (Rule 24)**: Never combine vocal singing directives with smile tokens (`smiling expressively between vocal phrases`, `smiling while singing`). Phrasing must emphasize dynamic syllable enunciation (`dynamic mouth and jaw movement enunciating words syllable by syllable`).
- **Acoustic Lyric Snapping & Timestamps (Rule 25)**: Prompts must specify second-by-second acoustic phrase markers (`At 0-2s: Sofia sings '...', At 2-5s: Sofia sings '...'`). Lyrics must not cross cut boundaries mid-sentence.
- **Deterministic Cache Invalidation**: When lyrics or prompts change, purge or force-regenerate all affected shots.

## 17. Valid Timing Contracts & Output Preservation
- Stored productions must declare an approved timing contract to be certified and visible in API responses:
  - `"narration-master-clock"`: Standard semantic narration clock.
  - `"native-shot-audio-master"`: Pure native audio master clock.
  - `"full-lyria-vocal-master"`: DeepMind Lyria master vocal soundtrack clock (Path B).
  - `"lyria-master-clock"`: Master Lyria acoustic clock (Path B).
- Uncertified or mismatched outputs are suppressed to prevent delivery of desynchronized media.
