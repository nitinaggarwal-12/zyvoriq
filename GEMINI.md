
# E2E Testing & Browser Automation Rule
- **Always execute E2E tests, Puppeteer automation, and browser screenshot suites on Cloudtop (`nitinagga.c.googlers.com`)**. Local macOS execution is blocked by corporate Santa endpoint security.

# 🧭 First-Class Page Routing & Zero-Gutter Viewport Protocol
- **Dedicated Page Routes & Unique URLs for Every Feature**: Never confine major creation workflows, generator forms, or multi-step studio editors to floating narrow popup modals that waste screen real estate. Every feature, creator, and input form MUST be a dedicated first-class page with a unique, deep-linkable URL and query ID (e.g., `/studio/create`, `/studio/track/[trackId]`, `/studio/director/[id]`).
- **Reclaim Horizontal Space (Zero Empty Side Margins)**: Always design desktop views to utilize the full width of the screen (`w-full`, `max-w-[1600px]`, or `max-w-8xl mx-auto px-8 md:px-12`). Divide complex forms and discovery hubs into balanced multi-column desktop grids instead of single narrow center columns surrounded by empty black side gutters.

# 🔁 Mandatory Post-Change Background Puppeteer Verification Loop (with Cloudtop Fallback)
- **Execute Headless Verification After Every Code Change**: Immediately after modifying code, creating UI components, or implementing sprint features, launch a headless Puppeteer verification session (`headless: 'new'`) running asynchronously in the background.
- **Automatic Cloudtop Fallback**: If local browser launch fails due to macOS Santa endpoint security (`Code: null`), immediately route execution to Cloudtop (`nitinagga.c.googlers.com`) via background remote execution (`scripts/cloudtop_pair_programming_e2e.js`) to capture live physical screenshots and DOM tree assertions.
- **Physical DOM & Screenshot Validation**: Assert live DOM elements, enforce 800ms settling delays, and save captured screenshots into `<project_root>/scratch/cloudtop_e2e_screenshots/` with clickable `file://` Markdown links. Never declare a change or sprint complete without executing this validation pass.


