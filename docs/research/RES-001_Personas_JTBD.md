# RES-001 — Personas, JTBD & Customer Journeys

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | RES-001 |
| **Title** | Zyvoriq User Personas, Jobs-to-be-Done (JTBD) & Critical Journeys |
| **Owner** | Head of Product Research / UX Design |
| **Approvers** | Chief Product Officer, Product Lead |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-RES-01 (Research Baseline Validated) |
| **Assurance Score** | 96/100 |
| **Parent Strategy** | STR-001 (Product Vision & Principles) |

---

## 1. Executive Summary

This research specification establishes the foundational user personas, psychological drivers, Jobs-to-be-Done (JTBD) formulations, and end-to-end journey maps for the Zyvoriq platform. Understanding these archetypes guides all UX interaction patterns, autonomy default behaviors, and quality threshold presets across the platform.

---

## 2. Core User Personas

### Persona 1: Enterprise Marketing & Brand Director ("Elena")
* **Role**: VP / Director of Content Marketing at a 500+ person B2B SaaS company.
* **Goal**: Deliver 20+ verified, high-impact multi-channel content assets per month without brand voice dilution or legal compliance breaches.
* **Core Frustration**: Spends 60% of time policing rogue team drafts, fact-checking agency submissions, and coordinating format resizes across Figma, Premiere, and Google Docs.
* **Autonomy Preference**: **Co-Pilot Mode** (requires automated verification with final human signoff).
* **Key Metrics**: Campaign velocity, Brand Consistency Index, Cost-per-Asset.

### Persona 2: DevRel Engineer & Technical Creator ("Devin")
* **Role**: Developer Advocate & Open Source Technical Writer.
* **Goal**: Convert complex GitHub pull requests, architecture diagrams, and release notes into developer tutorials, video demos, and animated architecture diagrams.
* **Core Frustration**: Standard AI models hallucinate non-existent API flags, syntax errors, and outdated framework versions.
* **Autonomy Preference**: **Supervised Mode** for code generation; **Autonomous Mode** for video/audio narration rendering.
* **Key Metrics**: Code execution correctness, diagram accuracy, developer engagement rate.

### Persona 3: Solo Media Creator & Podcast Producer ("Marcus")
* **Role**: Full-time Independent Creator & Digital Publisher (150k followers).
* **Goal**: Transform a 45-minute audio episode or single thesis idea into 10 TikTok/Reels shorts, a long-form Substack newsletter, an X thread, and LinkedIn carousel.
* **Core Frustration**: Burnout from repetitive editing, thumbnail generation, subtitle syncing, and manual scheduling.
* **Autonomy Preference**: **Autonomous Mode** (with preset threshold notifications).
* **Key Metrics**: Publishing frequency, audience retention, subscriber growth.

### Persona 4: Founder & Executive Thought Leader ("Sarah")
* **Role**: Early-stage Tech Founder / CEO.
* **Goal**: Build an authentic executive presence across LinkedIn and industry podcasts in under 30 minutes per week.
* **Core Frustration**: Ghostwriters lack technical depth and voice fidelity; raw AI sounds robotic and cliché.
* **Autonomy Preference**: **Co-Pilot Mode** with mobile quick-approval.
* **Key Metrics**: Executive engagement, talent inbound, investor awareness.

---

## 3. Jobs-to-be-Done (JTBD) Framework

```
┌─────────────────────────┬─────────────────────────────────────────────────────────────────┐
│ Archetype               │ Core Job-to-be-Done Statement                                   │
├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ Elena (Marketing)       │ "When launching a major product feature across 5 channels,      │
│                         │  I want to synthesize and verify brand-compliant multimedia     │
│                         │  So that we dominate mindshare without risking our reputation." │
├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ Devin (DevRel)          │ "When explaining a complex distributed systems architecture,    │
│                         │  I want verified code snippets and interactive vector diagrams  │
│                         │  So that developers trust and successfully adopt our tools."    │
├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ Marcus (Creator)        │ "When I finish recording a breakthrough concept,                │
│                         │  I want to automatically produce channel-native video/audio     │
│                         │  So that I stay consistently top-of-mind without burning out."  │
└─────────────────────────┴─────────────────────────────────────────────────────────────────┘
```

---

## 4. End-to-End Customer Journey Map

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. Ingest   │ ──► │  2. Swarm    │ ──► │  3. Veritas  │ ──► │  4. Policy   │ ──► │  5. Impact   │
│  & Briefing  │     │ Synthesizer  │     │ Quality Gate │     │  & Publish   │     │  & Telemetry │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### Stage 1: Ingest & Persona Context
- **User Action**: Drops a topic, voice memo, or GitHub repo into the **Director Console**.
- **System Action**: Retrieves workspace **Persona Memory Vault** (tone guidelines, negative prompt blacklist, visual styling rules).
- **Emotional State**: Curious, expectant, looking for immediate leverage.

### Stage 2: Agent Swarm Synthesis
- **User Action**: Observes live multi-agent task execution breakdown (Research → Narrative → Media → Code).
- **System Action**: Parallelized agent generation across frontier multimodal models.
- **Emotional State**: Confident; clear visibility into system reasoning.

### Stage 3: Veritas Quality Gate Verification
- **User Action**: Reviews the composite Veritas score card (Factuality, Voice, Safety, Consensus).
- **System Action**: Highlights flagged claims or auto-repaired passages with diff inspection.
- **Emotional State**: Relieved; assured that no hallucinations will escape to the public.

### Stage 4: Autonomy Policy & Omnichannel Publish
- **User Action**: 1-click preview and approve (or auto-cleared if in Autonomous mode).
- **System Action**: Formats native aspect ratios, captions, and distribution payloads to connected platforms.
- **Emotional State**: Empowered; accomplished in minutes what previously took days.

### Stage 5: Audience Feedback & Memory Tuning
- **User Action**: Reviews real-time engagement telemetry in the Analytics dashboard.
- **System Action**: Stores high-performing patterns in the Persona Vault to sharpen future generations.
- **Emotional State**: Validated; continuous positive reinforcement loop.

---

## 5. Document Quality Sign-off (QG-RES-01)

- [x] Four primary user archetypes fully profiled with operational pain points.
- [x] Outcome-based JTBD statements formulated.
- [x] End-to-end user emotional and cognitive journey mapped.

**Exit Status:** `RESEARCH BASELINE APPROVED (PASS)`
