
# 🧪 Universal E2E Testing & Browser Automation Rule (macOS & Cloudtop)
- **macOS Signed Google Chrome Execution**: For all E2E testing, Puppeteer automation, and browser screenshot suites on macOS, ALWAYS configure Puppeteer to use the official enterprise-signed system Google Chrome executable (`executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`) with `--headless=new`, `--no-sandbox`, and `--disable-gpu`. Never rely on unnotarized downloaded Chromium binaries that get blocked by Santa endpoint security.
- **Optional Remote Fallback (Cloudtop)**: If headless execution is required in a Linux/container environment without local macOS GUI/Chrome availability, route execution to Cloudtop (`nitinagga.c.googlers.com`).

# 🧭 First-Class Page Routing & Zero-Gutter Viewport Protocol
- **Dedicated Page Routes & Unique URLs for Every Feature**: Never confine major creation workflows, generator forms, or multi-step studio editors to floating narrow popup modals that waste screen real estate. Every feature, creator, and input form MUST be a dedicated first-class page with a unique, deep-linkable URL and query ID (e.g., `/studio/create`, `/studio/track/[trackId]`, `/studio/director/[id]`).
- **Reclaim Horizontal Space (Zero Empty Side Margins)**: Always design desktop views to utilize the full width of the screen (`w-full`, `max-w-[1600px]`, or `max-w-8xl mx-auto px-8 md:px-12`). Divide complex forms and discovery hubs into balanced multi-column desktop grids instead of single narrow center columns surrounded by empty black side gutters.

# 🔁 Mandatory Post-Change Background Puppeteer Verification Loop (with Cloudtop Fallback)
- **Execute Headless Verification After Every Code Change**: Immediately after modifying code, creating UI components, or implementing sprint features, launch a headless Puppeteer verification session (`headless: 'new'`) running asynchronously in the background using the signed Google Chrome binary.
- **Automatic Cloudtop Fallback**: If local browser launch is unavailable or blocked, route execution to Cloudtop (`nitinagga.c.googlers.com`) via background remote execution (`scripts/cloudtop_pair_programming_e2e.js`) to capture live physical screenshots and DOM tree assertions.
- **Physical DOM & Screenshot Validation**: Assert live DOM elements, enforce 800ms settling delays, and save captured screenshots into `<project_root>/scratch/screenshots_live_macos/` (or `<project_root>/scratch/cloudtop_e2e_screenshots/`) with clickable `file://` Markdown links. Never declare a change or sprint complete without executing this validation pass.

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




