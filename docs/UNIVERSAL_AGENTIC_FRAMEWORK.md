# 🌐 The Universal Project-Agnostic Agentic Coding Framework
**Version**: 1.0.0  
**Status**: Canonical Standard for High-Autonomy AI Software Engineering  
**Scope**: Project-Agnostic (Next.js, React, Node.js, Python/FastAPI, Go, Rust, Distributed Microservices)

---

## 1. Executive Summary

As AI coding agents transition from code auto-completion to autonomous end-to-end feature delivery, traditional "code-and-hope" workflows fail catastrophically. Common failure modes include:
1. **Context Drift**: Agents overwrite existing contracts or violate architectural principles because boundaries are undocumented or scattered.
2. **Looping / Surface Hallucinations**: Code looks visually plausible in static code analysis, but loops infinitely, freezes, or fails at runtime.
3. **Premature Completion**: Declaring a feature complete based solely on compilation exit code `0` without verifying live physical runtime behavior (DOM elements, media playback, network synchronization, acoustic balance).

The **Universal Project-Agnostic Agentic Coding Framework** solves this through a **4-Layer Agent Cognition Stack** and a **5-Step Standard Operating Procedure (SOP)**. This framework enables any autonomous agent to operate with deterministic self-correction, rigorous verification, and zero regression.

---

## 2. The Universal 4-Layer Agent Cognition Stack

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      UNIVERSAL AGENT COGNITION STACK                             │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Layer 1: Agent Rules & System Prompts (Local Laws)                              │
│  • Platform constraints, security boundaries, style tokens, immutable guardrails │
│  • Files: GEMINI.md, .cursorrules, CLAUDE.md, .windsurfrules                     │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Layer 2: Architecture & Operational Runbooks (The Map)                          │
│  • Canonical system topology, service contracts, routing, and operational steps  │
│  • Files: ARCHITECTURE.md, RUNBOOK.md                                            │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Layer 3: Executable Project Skills (The Specialized Tools)                      │
│  • Reusable procedural knowledge, inputs, expected outputs, self-healing rules   │
│  • Files: skills/<skill-name>/SKILL.md, automated helper scripts                 │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Layer 4: Self-Healing Autonomous Test Harnesses (The Closed Feedback Loop)      │
│  • Automated headless browser/API harnesses with DOM & acoustic state assertions │
│  • Files: scripts/qa/verify_*.mjs, visual regression diffs, telemetry profilers   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Layer 1: Agent Rules & System Prompts (Local Laws)
- **Purpose**: Defines immutable operating boundaries and platform-level constraints.
- **Project-Agnostic Principle**: Any rule that prevents catastrophic environment damage (e.g., Santa endpoint security blocks on macOS, API key leaks, unnotarized binaries, zero-gutter layouts) lives in Layer 1.
- **Key Artifacts**:
  - `GEMINI.md`, `.cursorrules`, `CLAUDE.md`: System-level prompts declaring runtime guidelines, viewport requirements, and signed browser paths.

### Layer 2: Architecture & Operational Runbooks (The Map)
- **Purpose**: Establishes the authoritative architectural source of truth and operational runbook.
- **Project-Agnostic Principle**: An agent should never guess system topology, data structures, or build procedures. Layer 2 defines what exists, where it lives, and how to operate it.
- **Key Artifacts**:
  - `ARCHITECTURE.md`: Module topologies, service boundaries, data schemas, and API contracts.
  - `RUNBOOK.md`: Reproducible dev server startup, port conflict remediation, database lock handling, and standard QA command matrices.

### Layer 3: Executable Project Skills (The Specialized Tools)
- **Purpose**: Encapsulates repeatable domain procedures into modular, executable skill specifications.
- **Project-Agnostic Principle**: Complex tasks (e.g. database schema migrations, video multi-act switching, audio formant convolution, visual regression testing) should not be re-invented each prompt. They should be codified as standalone skills with pre-flight checks, execution steps, and post-flight validation.
- **Key Artifacts**:
  - `skills/<domain>/SKILL.md`: Structured skills containing metadata, prerequisite environment checks, and diagnostic workflows.

### Layer 4: Self-Healing Autonomous Test Harnesses (The Closed Feedback Loop)
- **Purpose**: Provides ground-truth verification through headless runtime inspection and automated assertions.
- **Project-Agnostic Principle**: Never trust exit code `0` alone. Layer 4 launches headless browser instances, executes DOM evaluations, inspects media states, and validates physical mutations before declaring success.
- **The Media Ground-Truth Protocol (Zero-Assumption Media Verification)**:
  1. **Never Infer Payload from Metadata**: File paths, taglines, or UI titles must never be accepted as proof of physical media content or duration. Direct media properties (`duration`, frame count, audio sample rate) must be asserted.
  2. **Prohibition of Synthetic Loops**: The HTML `<video loop>` attribute masks asset shortages by infinitely replaying short clips. Long-form player harnesses must assert `video.hasAttribute('loop') === false`.
  3. **Temporal Progression Sentinel**: Harnesses must monitor continuous playback over time and fail if `currentTime` resets, rewinds, or stutters without user interaction.
  4. **EDL-to-Asset Coverage Audit**: Automated test suites must calculate and assert the ratio of unique assets to scene/shot entries before passing.
- **Key Artifacts**:
  - End-to-end headless scripts (e.g., `scripts/qa/verify_*.mjs`), DOM assertion runners, temporal loop sentinels, and visual artifact captures in `scratch/screenshots_<task>/`.

---

## 3. The Universal 5-Step Agent SOP (Standard Operating Procedure)

Every engineering task assigned to an autonomous agent must follow this 5-step sequence:

```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │ 1. Discover  │ ──> │ 2. Align     │ ──> │ 3. Implement │
  │ Pre-Flight   │     │ Architecture │     │ Surgically   │
  └──────────────┘     └──────────────┘     └──────────────┘
                                                    │
                                                    ▼
                       ┌──────────────┐     ┌──────────────┐
                       │ 5. Validate  │ <── │ 4. Verify    │
                       │ & Walkthrough│     │ Closed-Loop  │
                       └──────────────┘     └──────────────┘
```

### Step 1: Pre-Flight Context Discovery (Look Before Leaping)
1. Read existing codebase files and test suites before writing code.
2. Inspect environment health (running processes, database lock states, port bindings).
3. Identify active constraints (OS security policies, framework deprecations).

### Step 2: Architecture Alignment & Single Source of Truth
1. Locate or create the architectural contract in Layer 2 (`ARCHITECTURE.md`).
2. Verify data contracts, state variables, and service interfaces.
3. If new services or routes are introduced, update the architecture specification before implementing code.

### Step 3: Surgical Incremental Implementation
1. Apply focused, single-purpose edits. Avoid sprawling refactors that touch unrelated files.
2. Preserve existing comments, docstrings, and non-conflicting types.
3. Validate type correctness immediately via compiler check (`npx tsc --noEmit` or language equivalent).

### Step 4: Closed-Loop Automated Verification (Zero Blind Trust)
1. Run dedicated verification scripts that physically launch the runtime and inspect physical states.
2. Enforce settling delays (e.g. 800ms) for CSS transitions and React state renders.
3. If a test fails, trigger self-correction: analyze the failure autonomously, adjust the implementation, and re-test without human prompting.

### Step 5: Transparent Validation Walkthrough & Traceable Artifacts
1. Output verifiable evidence (clickable file links, test assertion tables, execution timings).
2. Store test screenshots and logs in project-local workspace directories (`scratch/`).
3. Accurately report what passed, what was verified, and how the user can inspect the live result.

---

## 4. Case Study: Eliminating 15-Minute Cinema Regressions in Zyvoriq

### The Failure Mode
During testing of the 15-minute generative feature film (*Dharmakshetra: The Quantum Horizon*), human inspection identified three critical defects:
1. **Looping 6-Second Footage**: A single 6-second video asset played on repeat for 15 minutes.
2. **Speech Inaudibility via Extreme Audio Ducking**: The speech synthesis ducked background music to 20% volume, making the grand Vedic orchestral score inaudible.
3. **Speech Synchronization Mismatch**: Speech triggers were evaluated against `videoRef.current.currentTime` (which looped from 0 to 6s) instead of the 15-minute global playback timeline (`timeline15mSec`). Dialogue after second 6 never played.

### The 4-Layer Resolution
1. **Layer 1 (Guardrails Enforced)**:
   - Configured official macOS signed Chrome binary (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) with `--headless=new`, eliminating Santa endpoint security kills.
2. **Layer 2 (Architecture Alignment)**:
   - Codified the 15-minute 5-Act structure and 118-shot EDL generator in [`lib/cinema/dharmakshetra15m.ts`](file:///Users/nitinagga/Documents/zyvoriq/lib/cinema/dharmakshetra15m.ts).
   - Documented the dual-engine persistence and media topology in [`ARCHITECTURE.md`](file:///Users/nitinagga/Documents/zyvoriq/ARCHITECTURE.md).
3. **Layer 3 (Executable Skill Creation)**:
   - Encapsulated feature film quality assurance in [`skills/cinema-feature-film-qa/SKILL.md`](file:///Users/nitinagga/Documents/zyvoriq/skills/cinema-feature-film-qa/SKILL.md).
4. **Layer 4 (Automated Closed-Loop Test Suite)**:
   - Developed [`scripts/qa/verify_15min_feature_film.mjs`](file:///Users/nitinagga/Documents/zyvoriq/scripts/qa/verify_15min_feature_film.mjs) asserting 11 critical runtime criteria:
     - 5-Act progressive video switching across different source files.
     - Global 15-minute logical timeline scrubbing.
     - 12-scene multilingual speech schedule execution with 50% acoustic ducking balance.
     - Dynamic Ken Burns optical camera motion classes.
     - Full DOM node and interactive dialogue scrub accessibility.

### Result
All 11 tests passed with 100% success rate, validated across desktop and mobile viewports with zero regressions.

---

## 5. Portability Guide: Applying to Any Tech Stack

| Tech Stack | Layer 1 (Rules) | Layer 2 (Architecture) | Layer 3 (Skills) | Layer 4 (Harness) |
| :--- | :--- | :--- | :--- | :--- |
| **Next.js / React** | `GEMINI.md`, `.cursorrules` | `ARCHITECTURE.md`, `RUNBOOK.md` | `skills/*/SKILL.md` | Puppeteer / Playwright + Chrome |
| **Python / FastAPI** | `pyproject.toml`, `.cursorrules` | `ARCHITECTURE.md`, `openapi.yaml` | `skills/*/SKILL.md` | `pytest`, `httpx`, headless Playwright |
| **Go / Microservices** | `golangci.yml`, `.cursorrules` | `ARCHITECTURE.md`, `RUNBOOK.md` | `skills/*/SKILL.md` | `go test -v -race`, testcontainers |
| **Rust / Systems** | `clippy.toml`, `.cursorrules` | `ARCHITECTURE.md`, `RUNBOOK.md` | `skills/*/SKILL.md` | `cargo test`, headless integration suites |

---

## 6. Verification Checklist for Autonomous Agents

Before closing any engineering task, the agent must check:
- [ ] **Typecheck Passed**: Compiler reports 0 errors (`tsc`, `mypy`, `cargo check`).
- [ ] **Physical Execution Passed**: Headless runner executed live code in a real browser or container.
- [ ] **DOM & State Inspected**: Target elements, text nodes, and media sources verified via physical assertions.
- [ ] **Settling Delays Observed**: 800ms+ delays injected to allow async transitions to settle.
- [ ] **Artifacts Captured**: Visual screenshots and execution logs stored in project workspace (`scratch/`).
- [ ] **Documentation Kept In Sync**: `ARCHITECTURE.md`, `RUNBOOK.md`, and relevant skills updated.
