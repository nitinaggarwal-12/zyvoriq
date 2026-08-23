# UX-003 — Design System, Component Tokens & Screen Inventory

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | UX-003 |
| **Title** | Zyvoriq Design System Tokens, UI Components & Screen Inventory |
| **Owner** | Lead UI/UX Designer |
| **Approvers** | Frontend Engineering Lead, Product Lead |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P1 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-UX-03 (Design System Approved) |
| **Assurance Score** | 98/100 |
| **Parent Reference** | UX-001, UX-002 |

---

## 1. Dark Mode Obsidian Design Tokens

```css
/* Color Tokens */
--color-obsidian-950: #07090E;  /* Root Page Background */
--color-obsidian-900: #0D121F;  /* Elevated Card Surface */
--color-obsidian-800: #151D2F;  /* Modal / Popover Surface */
--color-teal-500:     #14B8A6;  /* Primary Interactive Accent */
--color-cyan-400:     #22D3EE;  /* Secondary Glowing Metrics */
--color-indigo-500:   #6366F1;  /* Swarm State Accents */

/* Glassmorphism Classes */
.glass-panel {
  background: rgba(13, 18, 31, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

---

## 2. Core UI Component Library

1. **`DirectorTerminal`**: Interactive prompt box with mode switcher, token counter, and pulsing submit button.
2. **`VeritasRadar`**: 5-axis SVG dynamic radar chart showing real-time quality dimension scores.
3. **`AgentStepProgress`**: Linear and tree-view agent execution tracker with step status badges (`Pending`, `Active`, `Done`, `Failed`).
4. **`AutonomySlider`**: 3-position toggle switch (`Supervised` | `Co-Pilot` | `Autonomous`) with safety status indicators.
5. **`DiffViewer`**: Side-by-side green/red comparison card showing auto-repair corrections.

---

## 3. Screen Inventory Matrix

| Screen Name | Route Path | Core Interactive Elements |
| :--- | :--- | :--- |
| **Executive Dashboard** | `/app/dashboard` | Project cards, HCAP counter, activity stream, quick-create modal. |
| **Director Studio** | `/app/director` | Split-view terminal, live SSE token stream, agent dependency graph. |
| **Veritas QA Center** | `/app/veritas` | Interactive radar chart, factuality diff inspector, golden benchmark manager. |
| **Multimodal Canvas** | `/app/studio` | Video storyboard player, audio waveform editor, Monaco code validator. |
| **Governance & Logs** | `/app/governance` | Autonomy policy controls, C2PA certificate viewer, emergency kill-switch. |

---

## 4. Document Sign-off (QG-UX-03)

- [x] Obsidian glassmorphic design tokens specified.
- [x] Complete UI component library and screen inventory mapped to routes.

**Exit Status:** `DESIGN SYSTEM APPROVED (PASS)`
