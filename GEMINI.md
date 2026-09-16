
# 🧪 Mandatory Cloudtop Testing & Verification Protocol (100% Remote Execution)
- **Always Use Cloudtop for Testing**: ALL test execution, E2E browser automation, Puppeteer screenshot suites, audio/video encoding analysis (FFmpeg/FFprobe), and quality gate verification MUST execute directly on Cloudtop (`nitinagga.c.googlers.com`). Never attempt local macOS execution for test harnesses or quality gates.
- **Remote Execution & Artifact Sync Pipeline**:
  1. Synchronize changes to Cloudtop workspace: `rsync -avz --exclude 'node_modules' --exclude '.next' . nitinagga.c.googlers.com:~/zyvoriq/`
  2. Execute the test suite remotely via SSH on Cloudtop (`nitinagga.c.googlers.com`).
  3. Automatically SCP captured screenshots, video frames, and test artifacts back to the local `<project_root>/scratch/` directory.
  4. Always present results with clickable `file://` Markdown links pointing to the local workspace copy.

# 🧭 First-Class Page Routing & Zero-Gutter Viewport Protocol
- **Dedicated Page Routes & Unique URLs for Every Feature**: Never confine major creation workflows, generator forms, or multi-step studio editors to floating narrow popup modals that waste screen real estate. Every feature, creator, and input form MUST be a dedicated first-class page with a unique, deep-linkable URL and query ID (e.g., `/studio/create`, `/studio/track/[trackId]`, `/studio/director/[id]`).
- **Reclaim Horizontal Space (Zero Empty Side Margins)**: Always design desktop views to utilize the full width of the screen (`w-full`, `max-w-[1600px]`, or `max-w-8xl mx-auto px-8 md:px-12`). Divide complex forms and discovery hubs into balanced multi-column desktop grids instead of single narrow center columns surrounded by empty black side gutters.

# 🔁 Mandatory Post-Change Cloudtop Verification Loop
- **Execute Headless Cloudtop Verification After Every Code Change**: Immediately after modifying code, creating UI components, or implementing sprint features, trigger background verification directly on Cloudtop (`nitinagga.c.googlers.com`).
- **Physical DOM & Screenshot Validation**: Assert live DOM elements, enforce 800ms settling delays, and save captured screenshots into `<project_root>/scratch/cloudtop_e2e_screenshots/` with clickable `file://` Markdown links. Never declare a change or sprint complete without executing this validation pass on Cloudtop.

# 📱 Universal iOS & Android Mobile Compatibility Protocol (100% Zero-Fail)
- **Dynamic Viewport Height & Safe Area Insets**: Always use dynamic viewport sizing (`min-h-dvh` or `min-h-screen` with `pb-[env(safe-area-inset-bottom)]`) to prevent iOS Safari bottom navigation bar clipping and Android virtual keyboard overlap.
- **Zero Horizontal Overflow (`overflow-x-hidden`)**: Ensure all outer containers and main grids use `w-full max-w-full overflow-x-hidden` and responsive wrapping (`flex-wrap`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) with no fixed pixel widths wider than 320px without container wrapping.
- **iOS Safari Input Auto-Zoom Prevention**: All text inputs, textareas, and select elements must use a minimum `16px` font size on mobile (`text-base md:text-sm` or `text-[16px] md:text-xs`) to prevent iOS WebKit from forcefully zooming in on tap.
- **Touch Target Accessibility (44x44px Standard)**: All interactive buttons, tabs, chips, and touchable elements must have minimum 44px tap targets (`min-h-[44px]` or `py-2.5 px-3` / `p-3`) to guarantee effortless touch interaction on small touchscreens.
- **iOS & Android Native Video Playback Compatibility**: All `<video>` elements MUST explicitly include `playsInline`, `muted`, `autoPlay`, and `preload="auto"` to enable inline autoplay on iOS WebKit without triggering full-screen native player takeovers.
- **Automated Dual-OS Viewport Assertions in QA**: Every E2E Puppeteer test suite must explicitly assert and capture screenshots for both iOS (iPhone 14 @ 390x844) and Android (Pixel 7 @ 412x915), verifying `document.documentElement.scrollWidth <= window.innerWidth`.

# 👁️ Zero-Hidden & Zero-Cropped Assets Protocol (Uncompromised Visibility)
- **No Hidden Links or Actions**: Every navigation link, filter tab, and studio action must remain discoverable across all viewports (via clean horizontal flex wraps or mobile menu drawers). Never use arbitrary responsive `hidden` utility classes that drop critical tools into dead ends.
- **No Hidden or Clipped Headers & Logos**: Logos, brand text, and header controls must always maintain full visibility with no text truncation, no overflow cutoff, and clean z-index hierarchy.
- **No Clipped Dropdowns & Filter Menus**: Dropdowns, select options, and filter menus must render above cards with clear z-index layering (`z-50`) without being clipped by parent `overflow-hidden` containers.
- **No Cropped Images or Videos**: All media canvases, image cards, and video players must maintain true aspect ratios (`aspect-[9/16]`, `aspect-[16/9]`, `aspect-[1/1]`, `aspect-[4/3]`) with proportional framing so heads, subtitles, text overlays, and key action frames are 100% visible and un-cropped.
# ⚡ Autonomous Bug Remediation & Self-Healing Protocol (Zero Approval Pauses)
- **Zero Approval Delays on Fixes**: When fixing any issue (audio-video sync, dialogue bleed, rendering defects, lip sync, test failures), NEVER ask the user for permission or approval to start or continue the fix. Immediately diagnose root cause, execute the fix, evaluate against all quality gates (Guard 1-6), and autonomously iterate until the issue is 100% eliminated.
- **Forensic-First Audio/Visual Sync**: Never dub artificial TTS over characters whose lips are visibly articulating different words. Always inspect and preserve native video-generated speech and ambient foley, aligning all score cues to precise scene cut boundaries (`xfade` / `acrossfade` duration subtraction).

# 🎬 Google Omni Directorial & Quality Gatekeeper Protocol (Start-to-Finish Authority)
- **Sole Director & Quality Gatekeeper**: Google Omni is the sole director and quality gatekeeper for Zyvoriq from start to finish across every single piece of content generated. No content generation may execute without Omni's explicit directorial compilation and pre-flight approval.
- **Unbiased Model Decider**: Omni dynamically assesses creative demands (cinematography, physics, pacing, facial micro-expressions) and delegates to the optimal models available (Gemini multimodal, Veo 3.1, Imagen, procedural audio engines) without arbitrary bias or hardcoded vendor lock-in.
- **Comprehensive Creative Scope**: Omni oversees all creative dimensions: lore research, script, casting, crew, scene planning, dialogue, character emotional beats, optics, acoustic scores, BGM (-24.0 LUFS), songs/lyrics, choreography/dance, high-octane action, combat, romance, family/kids, and all cinematic genres.
- **95% Pre-Flight Preparation (Zero Blindspots & Drift)**: Before physical video/audio generation kicks off, Omni completes 95% of the directorial heavy lifting—grounding historical/thematic lore, locking character biometric DNA, mapping camera motion vectors, and composing acoustic motifs—preventing hallucinations, continuity drift, and creative blindspots.
- **Continuous In-Flight Monitoring & Dynamic Plan Revision**: At each generation milestone, Omni closely inspects intermediate states, actively revising the directorial plan and applying immediate course corrections if drift or defects are detected.
- **Post-Generation 5% Surgical Remediation**: Once generation achieves 95% completion, Omni conducts forensic multimodal vision/audio audits to pinpoint remaining 5% subtle gaps (dialogue bleed, liquid tear traps, rubber limbs, score cut boundaries) and performs surgical, lossless fixes before final cut delivery.
- **Synchronous Full-Stack UI & Asset Coherence**: Omni ensures that all UI controls (aspect ratio, duration toggles, preset starters, custom textareas), deep links, preview posters, timeline scrubbers, and video players operate in 100% lockstep without mismatched durations or orphan states.

# 🚂 Mandatory Cloudtop Railway CLI & Deployment Operations Protocol (100% Remote)
- **Always Use Cloudtop for Railway CLI**: ALL Railway CLI commands (`railway status`, `railway logs`, `railway up`, `railway variables`, `railway link`, `railway deployment`) MUST execute directly on Cloudtop (`nitinagga.c.googlers.com`) inside the remote workspace (`~/zyvoriq`). Never attempt local macOS execution for Railway CLI.
- **Execution Pattern**: Always execute via SSH with the user's bin path exported:
  `ssh nitinagga.c.googlers.com 'export PATH=$HOME/bin:$PATH; cd ~/zyvoriq && railway <subcommand>'`
- **Pre-Flight & Post-Deploy Health Checks**: Use `railway status` and `railway logs --service zyvoriq` on Cloudtop to inspect deployment lifecycle events, container startup, build logs, and runtime warnings before and after pushing code.
- **Zero Unlinked Invocations**: Maintain active project and service linking to `zyvoriq` on Cloudtop (`production` environment, `zyvoriq` web service, `Postgres` database).

# 🛡️ Mandatory Telemetry-First & Queue Concurrency Safeguard Protocol (Zero Silent Starvation)
- **Telemetry-First Root-Cause Discipline**: Whenever generation hangs, infinite waits occur, or a user reports "not generating" / "stuck", NEVER assume a frontend issue, NEVER tweak UI buttons, and NEVER add artificial delays. Step 0 MUST ALWAYS be inspecting live backend telemetry via Cloudtop:
  1. `railway logs --service zyvoriq-reel-worker --lines 50`
  2. `railway logs --service zyvoriq --lines 50`
  3. Query `reel_operations` status and heartbeats directly in Postgres.
- **Strict Dependency State Machine & Zero Busy-Spin Repolls**:
  1. Jobs with unmet upstream dependencies MUST NEVER remain or be re-queued with `status='QUEUED'`. They MUST immediately transition to `status='BLOCKED'`.
  2. The worker claim query MUST ONLY pull jobs that are genuinely ready to execute. Unmet dependent jobs must never be repeatedly claimed.
  3. Promotion from `BLOCKED` to `QUEUED` is strictly event-driven upon verified upstream parent completion (`GENERATED`).
  4. Terminal Parent Cascading: If any upstream dependency fails, is cancelled, or is missing, all downstream dependent jobs must immediately transition to `CANCELLED` with explicit error causality (`PARENT_TERMINAL_FAILURE`).
- **Deadlock & Attempt-Limit Circuit Breakers (Anti-Starvation)**:
  1. Every operation has a strict maximum claim limit (`attempt >= 5`). Any job exceeding this threshold is automatically quarantined to `QUARANTINED` / `DEAD_LETTER` with an urgent log alert so it can never starve younger jobs.
  2. The background worker runs a continuous 30-second watchdog (`runDeadlockAndStarvationWatchdog`) to autonomously self-heal orphaned states, unblock newly ready dependencies, and prune zombie leases.
- **End-to-End Database State Progression in Verification**:
  Never declare an async generation feature working based on HTTP 200 or an optimistic UI toast. Quality gate verification must assert that the database rows physically transitioned (`QUEUED -> RUNNING -> SUCCEEDED`) and that the final video asset was rendered and persisted.

# 🔍 Proactive Telemetry-First Forensic Log Auditing Protocol (Zero-Wait for External Agents)
- **Autonomous Log Forensic Discipline (Never Wait for Claude or User)**: Never sit idle, never wait for Claude or the user to parse logs, do arithmetic on clip durations, or identify pipeline contradictions. Antigravity must proactively inspect, tail, and analyze live Railway logs (`zyvoriq` and `zyvoriq-reel-worker`) on Cloudtop during and immediately after every generation event.
- **Mandatory Retime Clamp & Surplus Discard Auditing**:
  1. For every generated shot, parse the `studio1 render resync` payload and assert `clampFloorBound === false`.
  2. If `clampFloorBound === true`, immediately extract `targetSec`, `sourceSec`, `retimeFactor`, and `surplusSec`.
  3. Calculate the total surplus duration discarded across the reel and the waste percentage (`surplusSec / totalSourceSec`). If surplus exceeds 20% or 3.0s on any shot, immediately flag as an active defect and autonomously diagnose the root cause (word ceiling too low, speech cadence faster than planned, or mismatched generation duration bucket).
- **Mandatory Speech Cadence (WPS) vs. Planner Budget Auditing**:
  1. Directly measure and log the words-per-second (`wps = words / duration`) from `[narration-cadence]`.
  2. Compare measured WPS against `wordsPerSecondForGenre(genre)` in `lib/studio1/planner.ts`.
  3. When measured WPS diverges from the budget by more than ±0.3 wps, autonomously update the planner's genre calibration so generation buckets and word counts stay tightly aligned.
- **Mandatory Audio Strategy & Speech-Sync Verification**:
  1. Inspect the logged `audio strategy (genre: ..., audioStrategy: ...)` for the production.
  2. For `MUSIC_VIDEO`, verify `audioStrategy` aligns with the chosen pipeline:
     - **Pathway A (Native Singing)**: `audioStrategy === "native"` where Veo directly generates live character singing performance.
     - **Pathway B (Lyria Master Soundtrack)**: `audioStrategy === "lyria"` / `"lyria-master-clock"` / `"full-lyria-vocal-master"` where Google DeepMind Lyria 3.5 generates the master soundtrack and character mouth visemes sync to the acoustic master clock.
  3. Verify `renderRough` never dubs synthetic TTS (`narrationPath`) over character speech/singing, never truncates with `-t d`, and preserves musical dynamics.
- **Continuous Telemetry Watchdog Execution**:
  Run `node scripts/telemetry_watchdog.mjs` on Cloudtop to tail live Railway logs and emit immediate diagnostic alerts for any clamp bindings, surplus spikes, audio strategy contradictions, or Veo safety retries.

# 💡 The Art of the Possible & Proactive Eureka Engineering Protocol (Zero Defensiveness)
- **Zero Defensive Mindset & No Surrendering to External Limits**: NEVER answer a technical challenge with defensive excuses, risk-averse disclaimers, or helplessness around external APIs (e.g., "Google Veo is a black box so it's not possible to guarantee", "third-party filters are outside our control"). That is defeatist engineering.
- **The "Art of the Possible" First Principle**: Whenever an external model, service, or API presents volatility, constraints, or unexpected rejections, IMMEDIATELY ask: *"What architectural layer, agentic reflection loop, or proactive verification engine can we engineer to make this deterministic?"*
- **Proactive Eureka & "Aha Moment" Ideation**: Never wait for the user to brainstorm the creative breakthrough or suggest self-healing architectures. Antigravity must proactively originate, propose, and prototype audacious solutions (e.g., 2-phase pre-flight prompt linters, self-repair reflection agents, phonetic lyric synthesizers, neural audiovisual sync locks) that elevate the system beyond ordinary expectations.
- **Self-Healing Over Helplessness**: Every external vulnerability must be wrapped in an autonomous self-correction loop:
  1. Pre-flight verification to catch and auto-heal risks before spending API quota/latency.
  2. In-flight diagnosis with LLM reflection to repair and retry upon rejection without human friction.
  3. Continuous closed-loop learning to prevent the same failure mode from ever impacting the user.

# ⚖️ Absolute Factual Truthfulness & Zero Phantom Models Protocol
- **Strict Model Attribution (Zero Phantom Models)**: NEVER attribute any output, asset, audio, or visual to an AI model (e.g., "DeepMind Lyria", "Google Omni", "Gemini 2.5 Pro") unless that model's API was physically invoked and executed for that specific operation.
- **Plain Mechanical Naming**: If an asset is a static file, an existing MP3, a hardcoded TypeScript template, or an FFmpeg filtergraph, ALWAYS state plainly and immediately that it is a static file, a template, or an FFmpeg filtergraph. Never dress up scripts or templates in aspirational model branding.
- **No Manufactured Authority in Logs**: Never write log entries or audit ledgers claiming approval by an AI entity (e.g., `approvedBy: "Omni-Director-Runtime"`) unless an actual LLM agent physically evaluated the content and issued that verdict.
- **Zero Pretense Under Scrutiny**: When asked how an asset was created or what models were used, provide an immediate, literal, and transparent account of the exact code paths, file sources, and API calls. Never defend an illusion or wait to be questioned before disclosing the truth.

# 🎼 Mandatory Google DeepMind Lyria 3.5 Audio Protocol (Zero-Sine Oscillator Ban)
- **100% Genuine Lyria Execution**: Master music soundtracks for all music videos, dance reels, and song productions MUST be generated directly via Google DeepMind Lyria (`models/lyria-3.5:generateContent`). Never simulate, mockup, or placeholder music using synthetic sine-wave oscillators (`sine=frequency=`), noise generators (`anoisesrc=`), or static monotone sweeps.
- **Pre-Flight Harmonic & Multi-Stem Verification**: Before video assembly or final cut delivery, every master soundtrack in `scratch/` must be verified for true polyphonic instrumentation, drums, basslines, and multi-section arrangement. Monotone humming, single-frequency test tones, and synthetic oscillator loops are strictly forbidden and will be rejected by pre-tool and stop quality gates.
- **Direct API Payload Standard**: All Lyria generation calls must invoke `https://generativelanguage.googleapis.com/v1beta/models/lyria-3.5:generateContent` with rich stylistic, tempo, and lyrical prompt grounding, extracting `inlineData` MP3 audio bytes directly from the response candidates.

# ⛓️ Mandatory Sequential Tail-Frame Chaining Protocol (Zero Anchor Re-use Loop)
- **Frame-0 Reset Trap Ban**: In Google Veo, image conditioning locks Frame 0 of the generated clip to the provided image. Passing the same static poster still to consecutive shots (Shot 1, Shot 2, Shot 3) forces the character to teleport back to the opening pose at every cut boundary ($t=0\text{s}, 8\text{s}, 16\text{s}$), creating an unnatural repeating loop.
- **Sequential Tail-Frame Pipeline**:
  1. Shot 1 ($0-8\text{s}$): Conditioned on the Character Anchor Poster.
  2. At $t=7.9\text{s}$, extract the exact tail frame of Shot 1: `ffmpeg -sseof -0.1 -i shot_01.mp4 -vframes 1 -q:v 2 shot_01_tail.jpg`.
  3. Shot 2 ($8-16\text{s}$): MUST be conditioned on `shot_01_tail.jpg`.
  4. At $t=15.9\text{s}$, extract the exact tail frame of Shot 2: `ffmpeg -sseof -0.1 -i shot_02.mp4 -vframes 1 -q:v 2 shot_02_tail.jpg`.
  5. Shot 3 ($16-24\text{s}$): MUST be conditioned on `shot_02_tail.jpg`.
- **Cut-Boundary Initial Frame PSNR Ceiling**: The PSNR between Frame 0 of consecutive shots (e.g. $t=0.0\text{s}$ vs $t=8.0\text{s}$ vs $t=16.0\text{s}$) MUST be LESS than $25.0\text{ dB}$. Any PSNR $\ge 25.0\text{ dB}$ indicates an illegal visual reset loop and will immediately trip the stop quality gate.

# 🎙️ Audio-Visual Vocal Coincidence Mandate (Zero Phantom Mouthing)
- **Pre-Flight Acoustic Analysis Order**: Before writing or dispatching Veo video prompts, the system MUST run an acoustic analysis on the Lyria soundtrack to extract the exact timestamp $T_{\text{vocal}}$ where singing vocals actually begin.
- **Instrumental Window Mouth-Locking**: For any timeframe ($0.0\text{s} - T_{\text{vocal}}$) where the music is playing an instrumental intro, beat build, or interlude without singing vocals, video prompts MUST explicitly mandate **pure dance choreography, fashion runway modeling, head turns, smiling, and eye contact with mouth closed**. Prompts must explicitly state: `mouth closed, no singing, non-vocal dance performance`.
- **Vocal Drop Synchronization**: Prompts for singing performance are strictly restricted to timestamps where lead singing vocals are physically present and audible in the audio track.
- **Unified Multimodal Audit**: All quality audits and stop gates must inspect the video and audio together as a unified multimodal timeline. If character lips articulate words during an instrumental intro, the production will be rejected with `FAIL: PHANTOM_VOCAL_MOUTHING`.

# 👥 Mandatory Vocal-Gender & Duet Character Binding Protocol (Zero Cross-Gender Mouthing)
- **Zero Cross-Gender Lip-Sync Tolerance**: Never permit a character whose visual appearance is female to articulate male vocals, nor a male character to articulate female vocals. All character anchor plates, prompts, and vocal stems must be biometrically gender-locked.
- **Duet & Multi-Artist Disambiguation**: For any production featuring multiple vocalists (e.g. "Badshah feat. Nikhita Gandhi", male rap + female chorus), Omni Director MUST cast distinct biometric character anchors (`lead_male_artist` and `lead_female_artist`).
- **Strict Shot-Level Vocal Binding**: Every shot's screenplay MUST explicitly bind `onCameraCharacterId` to the specific artist performing that lyric line. Instrumental drops, dance breaks, and ensemble shots must use wide framing (`ESTABLISHING_WIDE`) with non-vocal choreography.
- **Stop Gate Rejection**: Any reel containing cross-gender lip sync or vocal-character mismatch will be immediately rejected with `FAIL: CROSS_GENDER_VOCAL_MISMATCH`.

# 🔊 Mandatory Full-Spectrum Audio & Bass Retention Protocol (Zero 200Hz Gutting Ban)
- **Aggressive Highpass Filter Ban**: Rendering pipelines and rough cut assemblers MUST NEVER apply aggressive highpass filters (`highpass=f=200`) to native music video audio. The full sub-bass, kick drum, and synth groove spectrum (35Hz–20kHz) must remain 100% intact.
- **Genre-Specific Score Matching**: Background accompaniment beds must match the genre's native instrumentation and BPM (e.g. 118 BPM synth-pop beds for modern pop; dhol beds ONLY for authentic Bhangra/Punjabi productions). Never overlay generic fallback loops onto mismatched genres.
- **Gain Staging & Dialogue Ducking Balance**: Video accompaniment beds must maintain balanced gain staging (vocal stems at -16 to -18 LUFS, master beds at -20 to -24 LUFS) with a maximum peak of -1.0 dBFS. Tinny or muffled audio tracks will be rejected with `FAIL: AUDIO_SPECTRUM_GUTTED`.

# 🛡️ In-Flight Worker Quality Gate Execution Protocol
- **Worker-Level Self-Audit**: Quality verification cannot wait until user inspection. The background execution worker (`reel_worker_v2.mjs`) must run automated multimodal assertions directly after assembling the rough cut, verifying:
  1. Sub-bass energy retention below 150Hz (`lowpass=f=150,volumedetect`).
  2. Zero digital silence across all cut boundaries.
  3. Visual anchor-to-shot character identity consistency via Gemini 2.5 Flash.
- **Auto-Healing Before READY**: If any assertion fails, the worker must autonomously heal the render (re-balance audio filtergraph, adjust gain staging, re-align shot boundaries) before marking `status='READY'`.

# 🩱 Mandatory Scene-Context Wardrobe Protocol (Zero Dry Clothes in Water Ban)
- **Strict Environmental Wardrobe Grounding**: When creating productions set in aquatic, pool, beach, or fitness environments, character prompts, anchor plates, and catalog wardrobe variants MUST strictly enforce authentic context attire:
  - In or directly adjacent to swimming pools, jacuzzis, water parks, or oceans: MUST enforce authentic swimwear (e.g. swimsuits, bikinis, monokinis, swim trunks, rashguards).
  - NEVER generate dry formal wear (blazers, dinner jackets, silk gowns, suits, tuxedos, heavy leather jackets) inside water bodies or during swimming scenes unless explicitly mandated as avant-garde high-fashion surrealism.
- **Pre-Tool & Stop Gate Enforcement**: Pre-tool linting and stop quality gates MUST reject any generation where characters are immersed in water while wearing formal/street clothes (`FAIL: SCENE_WARDROBE_MISMATCH`).

# 🎭 Mandatory Ensemble Biometric Differentiation & Anti-Cloning Protocol (The 5-Axis Matrix)
- **Zero-Homogeneity Mandate**: In any production or casting sheet featuring two or more characters of the same gender ($\ge 2$), Omni Director MUST enforce an explicit **Differentiation Matrix** across 5 mutually exclusive axes:
  1. **Hairstyle Silhouette**: Every character must possess a distinct, non-overlapping haircut silhouette (e.g., razor blunt bob vs. voluminous waves with curtain bangs vs. micro-braided ponytail vs. military buzzcut fade vs. Sikh turban/patka vs. tousled shaggy curls).
  2. **Facial Features & Grooming**: Distinct facial hair (clean-shaven vs. trimmed jawline beard vs. full groomed beard & mustache), makeup style (bold winged eyeliner vs. dewy romantic glow vs. street dancer baby hairs), and facial bone structure.
  3. **Complexion Undertone**: Distinct skin undertones and depth (e.g., deep dusky/bronze vs. warm golden wheatish vs. fair olive).
  4. **Signature Accessories**: Mutually exclusive personal accessories (e.g., traditional steel kada, gold Cuban chain, statement hoop earrings & serpent cuff, pearl choker, neon visor sunglasses).
  5. **Wardrobe Cut & Color Palette**: High-contrast color choices and cuts (e.g., solid matte black vs. tropical Hawaiian florals vs. pastel mint stripes vs. metallic copper-bronze vs. fuchsia/coral floral vs. neon-lime/electric-blue athletic).
- **Stop Gate Rejection**: Any group generation where characters of the same gender share identical hairstyles, face shapes, or wardrobe aesthetics will be rejected immediately with `FAIL: ENSEMBLE_HOMOGENEITY_DETECTED`.

# ⏱️ Mandatory Cast Headcount & Multi-Character Shot-Budgeting Protocol (Zero Group Vocal Bleed)
- **Directorial Cast Sizing & Minimum Duration**:
  - Solo Lead: Minimum 15s.
  - Duet / Pair: Minimum 24s.
  - 4-Cast Ensemble: Minimum 30s.
  - 6-Cast Ensemble: Minimum 34s (optimal 60s to grant every character a dedicated solo hero take).
  - If a production script requests $\ge 4$ characters for a reel $<30\text{s}$, it must fail pre-flight compilation with `FAIL: CAST_CAPACITY_EXCEEDED`.
- **Zero Group Vocal Bleed (Single-Vocalist Shot Lock)**:
  - Multi-character ensemble wide shots MUST NEVER assign solo singing lyrics (`sings these EXACT words`) to the group.
  - In any shot with $\ge 2$ characters on camera, singing lines are strictly permitted ONLY when camera framing isolates a single focal performer (e.g., `close-up on [Lead]`), while all other characters are explicitly instructed: `mouth closed, lips together, non-vocal dance and reaction`.
  - Violations will be rejected with `FAIL: MULTI_CHARACTER_VOCAL_BLEED`.

# 🤐 Mandatory Emotional-Token Ban in Closed-Mouth Directives (Zero Open-Mouth Viseme Clash)
- **Prompt Contradiction Ban**: In diffusion video models (Google Veo), positive emotional action verbs consistently override negative grammatical constraints. Coupling "mouth closed" with oral action tokens like `"genuine laughter with mouths closed"` or `"cheering with lips sealed"` forces the model to render wide-open mouths, dropped jaws, and visible laughing teeth, directly causing visual lip-sync desynchronization when external vocal audio is played.
- **Strict Vocabulary Quarantine**:
  - Whenever a prompt directs non-vocal choreography, dance performance, or closed-mouth presence (`mouth closed`, `lips together`, `sealed lips`), the following words are **STRICTLY PROHIBITED**: `laughter`, `laughing`, `giggle`, `giggling`, `cheering`, `shouting`, `yelling`, `screaming`, `talking`, `speaking`, `mouth open`, `jaw drop`.
  - Authorized replacement phrasing: `poised closed-lip smile`, `serene joyful closed-lip smiles`, `dynamic physical dance choreography with sealed lips`, `intense rhythmic gaze`, `confident facial delivery with lips together`.
- **Pre-Tool & Stop Gate Enforcement**: Pre-tool linting and stop quality gates MUST reject any prompt coupling closed mouth directives with oral expression action tokens with `FAIL: PROMPT_CONTRADICTION_OPEN_MOUTH_VISEME`.

# 🔬 Mandatory Forensic Mouth-Aperture & Viseme Stop Quality Gate (Zero Blurred-Proxy Evasion)
- **No Reliance on Low-Resolution Whole-Video Audits**: Automated quality gate audits MUST NEVER rely exclusively on downsampled 360p whole-video proxies. Distributed attention across video frames blurs subtle jaw drops and open-mouth visemes, leading to false-positive PASS verdicts.
- **Forensic Frame-Level Mouth Aperture Audits**:
  - The stop quality gate MUST physically extract high-resolution still frames from the interior of every shot (e.g. shot midpoints $t=0.5 \times \text{duration}$).
  - Gemini multimodal inspection MUST inspect the exact aperture of character mouths: lips must be firmly sealed during non-vocal dance breaks, and lip visemes must precisely match vocal phonemes during singing cuts.
  - Any instance of open-mouth visemes, laughing mouth apertures, or dropped jaws during non-vocal cuts will immediately trip the stop quality gate with `FAIL: OPEN_MOUTH_VISEME_MISMATCH`.

# 🖼️ Mandatory Context-Aware Character Anchor Plates (Zero Frame-0 Viseme Poisoning & Zero Frozen Lips)
- **Frame-0 Viseme Locking Protocol**: In Google Veo (and image-conditioned diffusion models), Frame 0 ($t=0.0\text{s}$) is pinned directly to the character anchor plate. The anchor's mouth state must match the production type:
- **Non-Vocal Dance & Fashion Reels**: Character anchor prompts MUST explicitly mandate sealed lips: `lips firmly sealed together, mouth closed, serene closed-lip expression, no teeth visible, strictly no open mouth`. Unconstrained smile tokens (`warm smile`, `laughing`) are prohibited to prevent open-mouth viseme propagation.
- **Vocal Singing Music Videos**: Character anchors MUST depict natural relaxed resting lips (`natural relaxed lips, expressive confident face, neutral resting facial posture, closed-to-neutral resting mouth`), providing a fluid, un-clamped starting pose for dynamic vocal articulation without gritted teeth or frozen grimaces.
- **Pre-Flight Anchor VLM Certification**:
  - For non-vocal dance reels, anchor stills undergo pre-flight VLM audit (`auditAnchorImageMouthClosed`) asserting `MOUTH_SEALED: YES, TEETH_VISIBLE: NO`.
  - For singing reels, anchor stills undergo pre-flight verification asserting natural facial identity, zero extreme distortion, and context-appropriate wardrobe.
- **Stop Quality Gate Assertion 4d**: Stop quality gate asserts closed lips on anchors ONLY for non-vocal productions. For vocal productions, natural relaxed facial anchors are certified.

# 🎤 Mandatory True Path B Lip-Sync & Vocal Articulation Protocol (Zero Frozen-Lips Ban)
- **Acoustic-Visual Dynamic Timeline Locking**:
  - **Instrumental Passages ($0.0\text{s} - T_{\text{vocal}}$)**: Performers MUST be locked to non-vocal choreography: `mouth closed, non-vocal dance performance, smiling with closed lips`.
  - **Active Vocal Sections ($t \ge T_{\text{vocal}}$)**: When lead singing vocals are playing on the master soundtrack, performers on camera MUST be actively singing the lyrics with dynamic mouth opening, jaw movement, and phonetic lip articulation. Video prompts MUST explicitly state: `sings the lyrics directly to camera: "[Lyrics]", mouth and lips moving actively with natural vocal articulation, visible jaw movement and mouth opening/closing in sync with the song, expressive vocal delivery`.
- **Singing Negative Prompt Mandate**: All Veo generation for singing shots MUST inject `negativePrompt: "closed mouth, lips sealed, motionless lips, muted, silent, closed-lip smile, frozen mouth, captions, subtitles, on-screen text, watermark, blur"` to prevent Veo from rendering motionless, frozen lips.
- **Zero Smile-Dilution in Singing Prompts (Anti-Frozen-Smile Rule)**:
  - When directing singing performances in diffusion video models, NEVER combine vocal singing directives with resting smile tokens (`smiling expressively between vocal phrases`, `smiling while singing`, `lounging with smile`).
  - Diffusion models strongly bias toward static smiles over phoneme shaping, resulting in a frozen open-mouthed grin with zero syllable articulation.
  - Authorized phrasing for singing: `performing passionate vocal delivery, dynamic mouth and jaw movement enunciating words syllable by syllable, distinct phonetic visemes opening and closing with each phrase`.
- **Path B Acoustic Lyric Transcription & Phrase-Snapping Mandate**:
  - Before writing video generation prompts for Path B productions, the system MUST transcribe the master vocal soundtrack with exact second-by-second timestamps ($t_{\text{start}}, t_{\text{end}}$).
  - Every shot prompt MUST contain explicit second-by-second phrase markers (e.g., `At 0-2s: Sofia sings '...', At 2-5s: Sofia sings '...'`).
  - Lyric phrases MUST NEVER cross shot cut boundaries mid-sentence. Shot cuts MUST snap cleanly to acoustic phrase pauses or instrumental breath windows.
- **Deterministic Shot Cache Invalidation**:
  - When prompts, lyrics, or lip-sync configurations are updated, or when an audit fails lip-sync verification, production scripts MUST NEVER silently reuse stale shot video files. All affected shot files (`shot_*.mp4`) MUST be purged or forcibly regenerated.
- **Unified Multimodal Lip-Sync Quality Gate**: Automated stop audits MUST evaluate live video and audio together across multiple timeframes, asserting:
  1. `LIPS_MOVING: YES` (Lips actively animate and articulate words during vocal sections).
  2. `LIPS_MATCH_AUDIO: YES` (Mouth movement aligns with vocal presence and cadence).
  3. `PHONETIC_VARIANCE: YES` (Mouth aperture dynamically fluctuates between open vowels and closed consonants, rather than freezing into a static open smile).
  - Any singing video where characters have frozen, closed, or motionless lips during vocal delivery will be rejected immediately with `FAIL: FROZEN_LIPS_DURING_VOCALS`.

# ⏱️ Mandatory Acoustic-Neural Latency Alignment Protocol (Zero Audio-Lead Ban)
- **Diffusion Visual Articulation Latency Compensation**:
  - Diffusion video models (Google Veo) exhibit an inherent ~60ms–90ms neural visual articulation latency between nominal prompt timestamps and visible physical mouth aperture opening.
  - When assembling master video conditioned on an external master acoustic clock (Lyria 3.5 master vocal song), muxing audio at $t=0$ without delay causes the sound to arrive ~70ms before character lips physically open, creating the perception that the audio is "faster than the lips."
  - **The 70ms Neural Latency Lock**: Master assembly commands MUST apply calibrated audio delay filtergraph (`-filter_complex "[1:a]adelay=70|70[aout]" -map 0:v:0 -map "[aout]"`) to lock acoustic phoneme onsets to physical mouth aperture visemes down to the exact frame (10/10 multimodal sync score).
  - Any master video assembly lacking calibrated neural adelay or justification (`ADELAY_ZERO_OFFSET_JUSTIFIED`) will be rejected with `FAIL: UNCALIBRATED_NEURAL_AUDIO_LATENCY`.

# 🧭 Mandatory 4-Clock Drift Ceiling, Environmental Cast Sanitization & Asset Proxy Parity Protocol (v5.1.6)
- **Rule 1 — Environmental & Screenplay Alias Cast ID Sanitization (`environmental_shot_character_id_sanitization`)**:
  - Pre-flight planners (`lib/reel/planner.ts`) and background workers (`scripts/reel_worker_v2.mjs`) MUST sanitize non-human environmental shot tokens (`"scene"`, `"none"`, `"zero"`, `"environment"`, `"atmospheric"`, `"b_roll"`) to `undefined` so atmospheric establishing shots never trip `PRECONDITION_FAILED: Canonical character reference image missing for character scene`.
  - When screenplay treatment uses role aliases (e.g., `"breaker_kai"`, `"popper_maya"`), the worker MUST deterministically resolve them against the locked Curated Library biometric cast (`m.characters`) by index or name match rather than crashing.
- **Rule 2 — 4-Clock Drift Ceiling & Native-Audio Editorial Trimming (`multi_component_4_clock_drift_gate`)**:
  - Every production maintains 4 distinct clocks: `T_audio` (master Lyria song duration), `T_editorial` (sum of planned `editorialDurationSec` cuts), `T_raw_veo` (sum of un-trimmed 8.0s Veo generation buckets), and `T_rendered` (final stitched MP4 duration).
  - Both the silent and **native-audio (`hasNativeAudio`)** paths in `renderRough` MUST apply frame-accurate FFmpeg editorial trimming (`trim=duration=${editorialDurationSec},setpts=PTS-STARTPTS` and `atrim=duration=${editorialDurationSec},asetpts=PTS-STARTPTS`) and lock master audio mix length (`amix=inputs=2:duration=first`).
  - Maximum allowable drift between `T_rendered` and `T_editorial` / `T_audio` is **`±50ms` (`0.05s`)**. Any production where raw 8.0s Veo buckets are concatenated un-trimmed (e.g., 128.12s video vs. 34.52s song) will be flagged and auto-healed by `scripts/audit_and_heal_drift.mjs`.
- **Rule 3 — Cross-Environment Proxied Asset Verification Parity (`cross_environment_asset_verification_parity`)**:
  - Asset verification endpoints (`/api/reels/verify-assets`) MUST inspect both local filesystem paths (`fs.existsSync`) AND `readAsset()` / proxied Railway storage routes (`/api/reels/assets/reels/studio1_*`, `ep_*`, `yt_*`).
  - Local development (`localhost:3000/my-reels`) and Railway production MUST maintain 100% badge parity (`✓ VALID MEDIA`, `4K MASTER READY`) without false-negative `NO MEDIA` states on cloud-generated reels.

