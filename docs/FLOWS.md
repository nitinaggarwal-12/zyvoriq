# Content Studio — User Flows Specification (`docs/FLOWS.md`)

> **Phase 1 Deliverable (`content-studio-ux`)**: Defines all 8 core user jobs before any screen or component code is written.
> **Core Flow Invariants**:
> 1. **≤ 3 interactions** from landing to first generated post.
> 2. **First-run working example post** loaded immediately (`The Cursed Hunter — 35mm Live-Action 60s Reel & Campaign`) — never a blank or empty state.
> 3. **Smart inference**: Platform inferred from URL/format, tone from active brand profile, duration/character limit from selected platform tab.
> 4. **Continuous autosave & reversible AI**: Every user and AI change pushes an immutable snapshot to the undo/version history stack (`Cmd/Ctrl+Z`, `Shift+Cmd/Ctrl+Z`, or named checkpoint restore).

---

## 1. Create (Brief In → Multi-Platform Content Out)

- **Entry Point**:
  - Top-left rail `Create` tab or bottom scoped prompt bar (`/` keyboard shortcut).
  - First-run users start with a complete, playable 60.0s live-action post already loaded in the canvas so they can immediately test editing, platform switching, or generating a fresh brief in **1 click**.
- **Steps (≤ 3 Interactions)**:
  1. User types or pastes a one-line brief or reference URL into the single required `Brief` field (or clicks one of the 1-click starter briefs).
  2. *(Optional)* User expands `Options` to override inferred defaults (Platform: `Reels 9:16` / `YouTube 16:9` / `Instagram 4:5` / `LinkedIn 1:1`, Audio Engine: `Omni 1.1 Native Spoken Dialogue + Score` vs `Lyria 3 Pro Symphonic`, Brand profile, Audience).
  3. User clicks **`Generate`** (or presses `G` / `Cmd+Enter`).
- **Decisions the User Makes**:
  - Only **1 required decision**: *"What is this post about?"*
- **What the System Does**:
  - Displays estimated credits and duration (`~2 credits · est. 4s text/storyboard · ~3.5m full 60s MP4`) before execution.
  - Streams output directly into the hero Canvas through **4 visible real stages** (`1. Writing hook → 2. Drafting body & 6-shot storyboard → 3. Composing media & audio score → 4. Running 6-category platform checks`) with an active **`Cancel`** button.
  - Marks newly generated AI text and segments with the subtle `--color-ai` badge until the user edits or accepts them.
- **Success State**:
  - Canvas updates in place without layout shift (skeleton matches final dimensions); automatic Checks run and display the status pill (`All good` or `N issues`) in the top bar and right panel.
- **Failure States**:
  - **Mid-stream Cancel**: User clicks `Cancel` (`Esc`); partial streamed hook/body is preserved in the canvas and saved as a draft checkpoint.
  - **API / Network Error**: Inline error banner states *what happened* (`Generation request timed out`), *why* (`Upstream model latency exceeded 15s`), and *what to do next* (`Retry generation` button + user's original brief preserved intact in the input field).
  - **Conversational / Non-Mutation Input (`"Hi"`, `"who are you"`, `"thanks"`, `"fast"`)**: Intercepted by the 4-Category Conversational Guard; responds helpfully in the assistant status feed with **zero canvas mutation** and **zero version bump**.

---

## 2. Preview (True-to-Platform Aspect Ratio, Truncation & Safe Zones)

- **Entry Point**:
  - Platform Switcher tabs directly above the Hero Canvas (`P` shortcut cycles platforms: `Reels / TikTok 9:16`, `YouTube Cinema 16:9`, `Instagram Carousel 4:5`, `LinkedIn / X 1:1`).
- **Steps**:
  1. User clicks a platform tab or presses `P`.
  2. Optional: User toggles `Show safe zones` overlay to inspect platform UI chrome masks (TikTok/Reels right-rail action icons and bottom caption zone).
- **Decisions the User Makes**:
  - Which target platform layout to inspect.
- **What the System Does**:
  - Morphs the Hero Canvas container to the exact native aspect ratio (`9:16` vertical, `16:9` widescreen cinema, `4:5` portrait carousel, `1:1` square card) using token-driven transitions (`200ms ease-out`).
  - Recomputes character limit counters (`tabular-nums`, e.g. `142 / 2,200 chars` for Reels vs `280 chars` for X) and shows the exact `"…more"` fold truncation line inline.
  - Re-runs Platform Fit checks immediately for the active platform.
- **Success State**:
  - Creator sees the exact post geometry, playable `<video>` / carousel slides, safe-zone boundaries, and character fold before publishing.
- **Failure States**:
  - **Aspect / Caption Overflow**: If switching to a stricter platform causes caption truncation or aspect mismatch, the `Checks` badge updates immediately (`1 error`) and highlights the exact overflowing line with a 1-click **`Fix`** (`Trim to platform limit`).

---

## 3. Edit in Place (Selection-Scoped Direct, Quick-Chip & AI Diff Editing)

- **Entry Point**:
  - Clicking any element directly inside the Hero Canvas:
    - `Hook line`
    - `Body copy paragraph`
    - `Hashtag & CTA block`
    - `Carousel slide 1..N`
    - `Image region (Subject / Background / Framing)`
    - `Video timeline segment 1..6 (0:00–0:10 .. 0:50–1:00) & spoken dialogue line`
- **Steps**:
  1. User clicks a target element in the Canvas.
  2. System highlights the element with `--color-focus`, updates the contextual `SelectionToolbar` above it, scopes the bottom Prompt Bar (`Scope: Video Segment 2 (0:10–0:20)`), and opens the `Edit` inspector in the Right Panel.
  3. User chooses one of **three simultaneous edit pathways**:
     - **Direct**: Types directly into the selected headline, caption, or spoken dialogue line.
     - **Quick Actions**: Clicks a contextual chip (`Shorter`, `Punchier`, `Fix grammar`, `Change tone`, `Translate`, `Regenerate this`).
     - **Ask**: Types a custom instruction in the bottom Prompt Bar (`"Lock Lyra as 100% unarmed and keep cold blue-grey twilight"`).
  4. When AI proposes a change, it renders as an **inline accessible DiffView** (`Removed` text struck through with assistive label, `Added` text highlighted in `--color-ai` with assistive label).
  5. User clicks **`Accept`** (`Cmd+Enter`), **`Reject`** (`Esc`), **`Try again`**, or **`Accept all`**.
- **Decisions the User Makes**:
  - Whether to type directly or accept/reject an AI diff suggestion.
- **What the System Does**:
  - Protects user-typed text: never overwrites text silently without an explicit diff confirmation or Undo snapshot.
  - Keeps video scrubbing (`<video currentTime>`) synchronized with the selected 10-second timeline segment (`0:00–1:00`).
- **Success State**:
  - Accepted edit updates the canvas, increments the version history checkpoint, and re-evaluates all 6 quality checks.
- **Failure States**:
  - **Unwanted Edit**: User presses `Cmd/Ctrl+Z` or clicks `Undo` in the top bar to restore the exact prior text/segment state in `0ms`.

---

## 4. Check & Fix (6-Category Automated In-Place Testing & 1-Click Remediation)

- **Entry Point**:
  - Runs automatically (debounced `200ms`) on every edit or platform switch; accessible via the top-bar status chip (`All good` / `N issues`) or Right Panel `Checks` tab (`C` shortcut).
- **Steps**:
  1. User reviews the status chip or clicks `Checks` (`C`).
  2. Each detected issue displays its **Category** (`Platform fit`, `Brand`, `Quality`, `Accessibility`, `Safety & compliance`, `Links`), **Severity** (`Error` blocks publish, `Warning` flagged, `Tip` optional), **Plain-English "Why" explanation**, and inline highlight target.
  3. Clicking an issue scrolls/focuses the exact offending element on the Hero Canvas.
  4. Clicking **`Fix`** applies a deterministic remediation immediately (and records an Undo checkpoint), or clicking **`Ignore`** dismisses non-blocking warnings/tips.
- **Decisions the User Makes**:
  - Click **`Fix`** to resolve automatically, edit manually, or **`Ignore`** a non-blocking warning.
- **What the System Does**:
  - Audits all 6 mandatory check domains:
    1. **Platform fit**: Character/hashtag/mention limits, aspect ratio, duration (`60.0s`), safe zones, `"…more"` truncation point.
    2. **Brand**: Brand voice match, banned words (`"guaranteed"`, `"100% miracle"`, `"cheap"`), required brand disclaimers.
    3. **Quality**: Grammar/spelling, readability, first-line hook clarity, explicit CTA presence.
    4. **Accessibility of content**: Alt text on every image/slide, closed captions/transcript on video (`spoken_dialogue_transcript.json`), `camelCase` hashtags (`#LiveActionCinema` instead of `#liveactioncinema`) for screen readers, zero emoji overuse.
    5. **Safety & compliance**: Sensitive/unverified claims, AI-generated media disclosure badge (`Made with AI` metadata toggle), COPPA child-safety guard when audience includes general/youth viewers.
    6. **Links**: Valid URL format, HTTPS check, and UTM tracking parameters (`?utm_source=...`).
- **Success State**:
  - Status chip turns `All good` (`0 blocking errors`), and the top-bar **`Publish`** button enables cleanly.
- **Failure States**:
  - **Blocking Error Present**: Top-bar primary button displays `Publish · N errors` and clicking it focuses the blocking error in the `Checks` panel with its 1-click **`Fix`** button highlighted.

---

## 5. Variations (Side-by-Side Comparison, Pick & Mix)

- **Entry Point**:
  - Right Panel `Variations` tab (`V` shortcut) or `Try another` action on any selected element.
- **Steps**:
  1. User presses `V` or clicks `Generate 3 variations`.
  2. System generates 3 distinct variations (`Variation A — Dramatic Hook & Native Dialogue`, `Variation B — Symphonic Trailer Cut`, `Variation C — Concise Question Hook`) shown side-by-side with real aspect-ratio previews.
  3. User clicks **`Use this`** on any variation, OR uses **`Mix`** (`Take Hook from Variation A` + `Take Video/Visual from Variation B`), OR clicks **`More like this`**.
- **Decisions the User Makes**:
  - Pick a full variation or mix specific components across variations.
- **What the System Does**:
  - Saves current canvas state to History before applying any variation or mix so the user can Undo (`Cmd+Z`) at any time.
- **Success State**:
  - Canvas updates with the chosen or mixed variation and re-runs Checks.
- **Failure States**:
  - **User prefers original**: 1-click `Keep original` / `Undo` restores the pre-variation state.

---

## 6. Publish / Schedule / Export (Final Checklist & Per-Platform Delivery)

- **Entry Point**:
  - The single primary action button in the Top Bar: **`Publish`**.
- **Steps**:
  1. User clicks **`Publish`**.
  2. Dialog opens showing the **Pre-Publish Verification Checklist**:
     - Blocking errors check (`0 errors`)
     - Target platform(s) & aspect ratios (`9:16 Reels`, `16:9 YouTube`)
     - Accessibility verification (`Alt text + 48kHz Captions + camelCase hashtags verified`)
     - Mandatory **AI-Generated Media Disclosure** toggle (matching TikTok, Instagram, and YouTube synthetic media policies)
     - Audience & COPPA safety confirmation (`General / 13+ verified`)
  3. User chooses **`Publish now`**, **`Schedule`** (date/time picker), or **`Export MP4 & FCPXML`**.
- **Decisions the User Makes**:
  - Confirm disclosure & timing (`Publish now`, `Schedule`, or `Export`).
- **What the System Does**:
  - Guards against double-click submission (button enters `Loading` state with idempotency lock), executes publish/export, and logs analytics funnel completion (`time_to_first_post`).
- **Success State**:
  - Confirmation state with direct playable `.mp4` download links, platform permalink preview, and `Duplicate for another platform` action.
- **Failure States**:
  - **Blocking Check Unresolved**: Dialog highlights the blocking check with an inline **`Fix now`** button right inside the modal.

---

## 7. Library (Find, Reuse, Duplicate & Remix Past Productions)

- **Entry Point**:
  - Left Rail `Library` tab.
- **Steps**:
  1. User searches by keyword or filters by format (`All`, `35mm Live-Action Cinema`, `Music Video`, `Carousel`).
  2. User clicks **`Load in canvas`**, **`Duplicate & remix`**, or **`Download MP4`** on any production (including *The Cursed Hunter — 60s Live-Action (Option 2 Native + Score)*, *The Cursed Hunter — 60s Symphonic (Option 1)*, *Crimson Echoes — 60s Speakeasy*, *Ghoom Ghoom*, etc.).
- **Decisions the User Makes**:
  - Which past asset or production to load or remix.
- **What the System Does**:
  - Loads all shots, captions, video stream URLs, and audio tracks into the Hero Canvas and saves a checkpoint.
- **Success State**:
  - Asset is immediately editable and playable in the Hero Canvas.
- **Failure States**:
  - **No search matches**: Empty search state displays *"No productions match your filter"* with a 1-click **`Clear filter`** button.

---

## 8. Brand Setup (Learned Once, Applied Everywhere)

- **Entry Point**:
  - Left Rail `Brands` tab or Top Bar brand selector pill.
- **Steps**:
  1. User selects an existing brand profile (`Zyvoriq Cinema Studio`, `Arcturus Outdoor Gear`, `Nova Clinical Wellness`) or edits brand rules:
     - **Brand Voice**: e.g., *"Cinematic, grounded, direct, zero hype"*
     - **Do Words**: e.g., *"35mm, tactile, authentic, stereo"*
     - **Don't / Banned Words**: e.g., *"miracle, guaranteed, cheap, AI slop"*
     - **Required Disclaimer**: e.g., *"#MadeWithAI"*
     - **Audience Safety Mode**: `Standard (13+)` vs `COPPA Strict (Under-13 Safe)`
- **Decisions the User Makes**:
  - Set voice, banned words, and compliance rules once.
- **What the System Does**:
  - Persists brand settings to `localStorage` and immediately re-evaluates the active post against the updated banned words, voice, and disclaimer rules in the `Checks` engine.
- **Success State**:
  - Brand rules automatically govern all future generations and live Checks without asking the user again.
- **Failure States**:
  - **Draft violates new brand rule**: Inline `Brand` warning appears in `Checks` with a 1-click **`Fix`** (`Remove banned word` / `Append required disclaimer`).
