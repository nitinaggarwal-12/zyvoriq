# Content Studio — Design System (`DESIGN.md`)

> **Phase 2 Deliverable (`content-studio-ux`)**: Single source of truth for design direction, color tokens, typography, spacing, shape, elevation, motion, iconography, and UI voice.
> **Hard Rule**: Components must consume semantic CSS tokens (`var(--color-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--duration-*)`) — never raw hex values, ad-hoc pixel sizes, or banned AI-slop patterns (zero purple-to-blue gradients, zero decorative glassmorphism blobs, zero `transition: all`, zero emojis as icons).

---

## 2.1 Aesthetic Direction

**Calm and precise.**
A quiet, confident workspace where the user's content is the only colorful thing on screen.

- **Chrome Recedes, Content Leads**: Navigation rails, inspection panels, and prompt bars use high-legibility neutral surfaces (`--color-bg`, `--color-surface`, `--color-surface-2`) separated by 1px hairlines (`--color-border`).
- **Single Primary Action**: Exactly one high-contrast primary action button (`Publish` in the workspace top bar; `Generate` in the creation modal/drawer) uses `--color-primary`.
- **Platform Brand Isolation**: Platform brand accents (Instagram, YouTube, TikTok, LinkedIn) appear strictly inside the simulated platform preview header/badges on the canvas — never in the application chrome.

---

## 2.2 Color Tokens (Light & Dark Themes — WCAG 2.2 AA/AAA Verified)

| Token | Light Theme (Default Workspace) | Dark Theme (`[data-theme="dark"]` & Shell) | Role & Contrast Guarantee |
| :--- | :--- | :--- | :--- |
| `--color-bg` | `#F6F7F9` | `#0B0E14` | App canvas background |
| `--color-surface` | `#FFFFFF` | `#121721` | Panels, cards, rails, modals |
| `--color-surface-2` | `#EEF1F5` | `#1A2130` | Raised / hover / selected row surface |
| `--color-border` | `#D8DEE8` | `#263042` | 1px structural hairlines & dividers |
| `--color-text` | `#0F172A` | `#F1F5F9` | Primary text (**15.4:1** on Light bg, **16.1:1** on Dark bg — exceeds 7:1 AAA) |
| `--color-text-muted` | `#475569` | `#94A3B8` | Secondary labels & metadata (**7.2:1** on Light, **6.8:1** on Dark — exceeds 4.5:1 AA) |
| `--color-primary` | `#0F172A` | `#F8FAFC` | Single primary action fill (quiet, authoritative ink/alabaster) |
| `--color-primary-text` | `#FFFFFF` | `#0B0E14` | Text on primary button (**17.8:1** contrast) |
| `--color-focus` | `#0284C7` | `#38BDF8` | Visible keyboard focus ring (**≥ 3.8:1** against adjacent surfaces) |
| `--color-success` | `#15803D` | `#4ADE80` | Passed checks, saved state, ready badge (always paired with check icon + label) |
| `--color-warning` | `#B45309` | `#FBBF24` | Non-blocking warnings (always paired with warning icon + label) |
| `--color-danger` | `#B91C1C` | `#F87171` | Blocking publish errors & destructive actions (always paired with alert icon + label) |
| `--color-info` | `#0369A1` | `#38BDF8` | Informational tips & active scope indicators |
| `--color-ai` | `#0D9488` | `#2DD4BF` | Subtle marker for AI-generated / AI-suggested diff insertions (`--color-ai-subtle` tint background) |

---

## 2.3 Typography

- **Font Families**:
  - `--font-sans`: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` (characterful, high x-height, unmistakable punctuation).
  - `--font-mono`: `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace` with `font-variant-numeric: tabular-nums` enforced on all character counters, timecodes (`0:11.5`), durations (`60.0s`), and audio dB/LUFS readouts.
- **Type Scale (`rem`)**:
  - `--text-xs`: `0.75rem` (`12px`) — Keyboard shortcut kbd badges & uppercase section micro-headers only.
  - `--text-sm`: `0.875rem` (`14px`) — Minimum size for all readable UI controls, checks, and secondary copy.
  - `--text-base`: `1rem` (`16px`) — Default body copy and editable post text (`line-height: 1.5`).
  - `--text-md`: `1.125rem` (`18px`) — Lead hook text in canvas preview.
  - `--text-lg`: `1.25rem` (`20px`) — Panel & dialog titles (`line-height: 1.2`).
  - `--text-xl`: `1.5rem` (`24px`) — Section headers (`line-height: 1.2`).
  - `--text-2xl`: `2rem` (`32px`) — Hero display headings (`line-height: 1.2`).
  - `--text-3xl`: `2.5rem` (`40px`) — Large campaign display titles (`line-height: 1.2`).
- **Allowed Font Weights**: `400` (Regular), `500` (Medium), `600` (SemiBold) only.

---

## 2.4 Space, Layout & Shape

- **Spacing Scale (4px Base)**:
  - `--space-1`: `4px` (`0.25rem`)
  - `--space-2`: `8px` (`0.5rem`)
  - `--space-3`: `12px` (`0.75rem`)
  - `--space-4`: `16px` (`1rem`)
  - `--space-6`: `24px` (`1.5rem`)
  - `--space-8`: `32px` (`2rem`)
  - `--space-12`: `48px` (`3rem`)
  - `--space-16`: `64px` (`4rem`)
- **Border Radius**:
  - `--radius-sm`: `6px` — Inputs, buttons, quick-action chips, kbd tags.
  - `--radius-md`: `10px` — Cards, panels, dialogs, platform preview frames.
  - `--radius-full`: `9999px` — Avatars, status pills, toggle tracks.
- **Elevation (Borders Preferred; Max 2 Shadow Levels)**:
  - `--shadow-sm`: `0 1px 2px 0 rgba(15, 23, 42, 0.06)` (raised controls & floating selection toolbar).
  - `--shadow-md`: `0 8px 24px -4px rgba(15, 23, 42, 0.12)` (dialogs, sheets, command/shortcut modal).
- **Responsive Breakpoints**:
  - `640px` (`sm`) · `768px` (`md`) · `1024px` (`lg`) · `1280px` (`xl`) · `1536px` (`2xl`).

---

## 2.5 Motion

- **Duration Tokens**:
  - `--duration-micro`: `120ms` (button press, chip hover, focus ring).
  - `--duration-ui`: `200ms` (tab switch, diff reveal, toast enter/exit).
  - `--duration-panel`: `320ms` (sheet/drawer open, platform aspect-ratio frame transition).
- **Easing Tokens**:
  - `--ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)` (entering elements).
  - `--ease-in`: `cubic-bezier(0.7, 0, 0.84, 0)` (exiting elements).
- **Strict Animation Property Rule**:
  - Animate **only `transform` and `opacity`** (plus explicit `background-color` / `border-color` micro-states). `transition: all` is strictly banned.
  - `@media (prefers-reduced-motion: reduce)` sets all durations to `0.01ms` and disables translate transforms.

---

## 2.6 Iconography

- **Library**: `lucide-react` exclusively (zero raw Unicode emojis used as UI icons).
- **Stroke Width**: `1.75px` across all icons.
- **Sizes**: `16px` (inline chip/badge icons), `20px` (standard toolbar/rail icons), `24px` (empty-state & dialog header icons).
- **Accessibility**: Decorative icons carry `aria-hidden="true"`; icon-only buttons require both `aria-label` and a visible tooltip.

---

## 2.7 Voice & UI Copy

- **Active, Verb-First Labels**: `Generate`, `Fix`, `Try another`, `Accept`, `Reject`, `Restore`, `Publish`.
- **Actionable Error Copy**: Every error message states (1) **What happened**, (2) **Why**, and (3) **What to do next** with an inline retry/fix button.
- **Banned Copy**: Never say `"Oops"`, `"Uh oh"`, `"Something went wrong"`, or `"Lorem ipsum"`.
