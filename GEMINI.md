
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

