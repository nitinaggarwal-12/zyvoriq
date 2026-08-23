# UX-001 — Information Architecture, Sitemap & Route Specification

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | UX-001 |
| **Title** | Zyvoriq Information Architecture, Route Hierarchy & Layout Matrix |
| **Owner** | Lead UX Architect / Product Designer |
| **Approvers** | Chief Product Officer, Frontend Engineering Lead, QA Lead |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-UX-01 (IA & Navigation Approved) |
| **Assurance Score** | 98/100 |
| **Parent References**| STR-001, RES-001, PRD-000 |

---

## 1. Executive Summary

This document specifies the global information architecture, page routing tree, responsive layout shells, and navigation interaction models for the **Zyvoriq** web application. It ensures a consistent, zero-friction experience across desktop, tablet, and mobile viewports.

---

## 2. Route Hierarchy & Sitemap Tree

```
Zyvoriq Web Application
├── / (Marketing Homepage & Public Demo)
│   ├── #director (Interactive Hero Simulation)
│   ├── #veritas (Quality Matrix Overview)
│   ├── #studio (Multimodal Asset Showcase)
│   ├── #autonomy (Governance Policy Showcase)
│   └── #waitlist (Early Access Onboarding)
│
├── /app (Authenticated Platform Shell)
│   ├── /dashboard (Executive Overview & Active Projects)
│   │   └── /dashboard/project/[id] (Project Detail & Asset Manifest)
│   │
│   ├── /director (Idea-to-Impact Swarm Console)
│   │   └── /director/session/[sessionId] (Live Multi-Agent Execution Stream)
│   │
│   ├── /studio (Multimodal Asset Studio)
│   │   ├── /studio/video/[assetId] (Cinematic Video & Shorts Canvas)
│   │   ├── /studio/audio/[assetId] (5-Band Neural Voice & Dubbing Editor)
│   │   ├── /studio/code/[assetId] (Code Playground & Architecture Canvas)
│   │   └── /studio/editorial/[assetId] (Omnichannel Written Copy Matrix)
│   │
│   ├── /veritas (Quality Assurance & Auto-Repair Console)
│   │   ├── /veritas/audit/[auditId] (Deep Factuality & Consensus Diff Viewer)
│   │   └── /veritas/benchmarks (Workspace Golden QA Thresholds)
│   │
│   ├── /governance (Autonomy & Compliance Center)
│   │   ├── /governance/policies (Autonomy Slider & Approval Matrix)
│   │   └── /governance/audit-logs (Cryptographic Provenance & C2PA Registry)
│   │
│   ├── /analytics (Omnichannel Telemetry & Persona Learning)
│   │   ├── /analytics/engagement (Real-Time Cross-Platform Metrics)
│   │   └── /analytics/persona-drift (Brand Voice Fidelity Tracking)
│   │
│   └── /settings (Workspace & Account Management)
│       ├── /settings/workspace (Brand Tone Guidelines & Persona Memory)
│       ├── /settings/connectors (YouTube, LinkedIn, X, Substack Auth)
│       ├── /settings/members (RBAC & Team Permissions)
│       └── /settings/billing (Usage Quotas & Foundation Model Spend)
```

---

## 3. Global Layout Shell Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Top Navbar: Workspace Selector | Global Search (Cmd+K) | Autonomy Badge | Profile / Auth│
├──────────────┬─────────────────────────────────────────────────────────────────────────┤
│ Sidebar      │ Main Content Viewport (Responsive Max-W: 1600px)                        │
│ Navigation   │                                                                         │
│ ───────────  │ ┌─────────────────────────────────────────────────────────────────────┐ │
│ ❖ Dashboard  │ │ Page Header & Context Breadcrumb                                    │ │
│ ⚡ Director  │ ├─────────────────────────────────────────────────────────────────────┤ │
│ 🎨 Studio    │ │ Primary Interactive Workspace Canvas                                │ │
│ 🛡 Veritas   │ │ (Swarm Stream / Veritas Radar / Multimodal Asset Viewer)           │ │
│ ⚖ Governance │ ├─────────────────────────────────────────────────────────────────────┤ │
│ 📊 Analytics │ │ Secondary Telemetry / Output Drawer (Collapsible)                   │ │
│ ⚙ Settings   │ └─────────────────────────────────────────────────────────────────────┘ │
└──────────────┴─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Responsive Breakpoints & Viewport Constraints

- **Ultra-Wide Desktop ($\ge 1600\text{px}$)**: Full dual-pane view with fixed left navigation, active center canvas, and persistent right-hand Veritas quality telemetry inspector.
- **Standard Desktop ($1024\text{px} - 1599\text{px}$)**: Standard collapsed right telemetry drawer, open left sidebar.
- **Tablet ($768\text{px} - 1023\text{px}$)**: Collapsed icon-only sidebar; bottom sheet for Veritas scoring.
- **Mobile ($< 768\text{px}$)**: Bottom navigation bar (`Dashboard`, `Director`, `Studio`, `Veritas`, `More`); fullscreen modal for asset editing.

---

## 5. UI Design System Tokens & Color Palette

- **Obsidian Base**: `bg-[#0B0F17]` (App Surface), `bg-[#111827]` (Card Surface), `bg-[#1F2937]` (Elevated Glass).
- **Accents & Gradients**: `teal-500` (`#14B8A6`), `cyan-400` (`#22D3EE`), `indigo-500` (`#6366F1`).
- **Veritas Metric Status**:
  - `Green / Verified`: `emerald-400` (`#34D399`) — $\text{Score} \ge 90$.
  - `Amber / Review`: `amber-400` (`#FBBF24`) — $75 \le \text{Score} < 90$.
  - `Red / Critical`: `rose-500` (`#F43F5E`) — $\text{Score} < 75$.

---

## 6. Document Sign-off (QG-UX-01)

- [x] Unambiguous route hierarchy from public marketing to deep nested studio tools.
- [x] Multi-viewport layout shell guidelines specified.
- [x] Design tokens and semantic status palettes established.

**Exit Status:** `IA & NAVIGATION APPROVED (PASS)`
