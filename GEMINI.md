
# 🧪 Mandatory Cloudtop Testing & Verification Protocol (100% Remote Execution)
- **Always Use Cloudtop for Testing**: ALL test execution, E2E browser automation, Puppeteer screenshot suites, audio/video encoding analysis (FFmpeg/FFprobe), and quality gate verification MUST execute directly on Cloudtop (`nitinagga.c.googlers.com`). Never attempt local macOS execution for test harnesses or quality gates.
- **Remote Execution & Artifact Sync Pipeline**:
  1. Synchronize changes to Cloudtop workspace: `rsync -avz --exclude 'node_modules' --exclude '.next' . nitinagga.c.googlers.com:~/zyvoriq_remote/`
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
- **Always Use Cloudtop for Railway CLI**: ALL Railway CLI commands (`railway status`, `railway logs`, `railway up`, `railway variables`, `railway link`, `railway deployment`) MUST execute directly on Cloudtop (`nitinagga.c.googlers.com`) inside the remote workspace (`~/zyvoriq_remote`). Never attempt local macOS execution for Railway CLI.
- **Execution Pattern**: Always execute via SSH with the user's bin path exported:
  `ssh nitinagga.c.googlers.com 'export PATH=$HOME/bin:$PATH; cd ~/zyvoriq_remote && railway <subcommand>'`
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
  2. For genres requiring native performance (e.g. `MUSIC_VIDEO` with singing and lip sync), verify `audioStrategy === "native"`.
  3. Verify `renderRough` never dubs synthetic TTS (`narrationPath`) over native character speech/singing, never truncates with `-t d`, and preserves native audio at volume 1.00 (-24 LUFS).
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


