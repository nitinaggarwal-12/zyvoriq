# Zyvoriq — AI-Native Idea-to-Impact Platform

Zyvoriq is an enterprise-grade, AI-native platform designed for creating, evaluating, adapting, publishing, and continuously optimizing high-impact humanized multimodal content across all channels.

---

## 🚀 Key Platform Capabilities & Modular Architecture

The frontend is built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**, featuring high-craft dark glassmorphic design and interactive simulations:

- **Director Console (`DirectorConsole.tsx`)**: Interactive prompt director simulation with agent step breakdown, asset synthesis, and confidence metrics.
- **Veritas Quality Matrix (`VeritasQualityMatrix.tsx`)**: Real-time evaluation scoring across Factuality, Tone Alignment, Multi-Engine Consensus, Compliance, and Perceptual Humanization.
- **Multimodal Studio (`MultimodalStudio.tsx`)**: Interactive preview engine covering Video briefs, Neural Audio Dubbing, Code Architecture, and Visual Infographics.
- **Autonomy & Governance Guardrails (`AutonomyPolicyControls.tsx`)**: Dynamic autonomy policy sliders (Supervised, Co-Pilot, Full Autonomous) with cryptographic audit trails and approval triggers.
- **Idea-to-Impact Lifecycle (`LifecycleFlow.tsx`)**: End-to-end visualization of the idea ingestion, synthesis, evaluation, omni-channel distribution, and telemetry feedback loop.
- **Targeted Use Cases (`UseCasesSection.tsx`)**: Tailored workflows for Enterprise Marketing, Developer DevRel, Creator Studios, and Executive Briefings.
- **Waitlist & Access Tier Selection (`WaitlistCTA.tsx`)**: Interactive early-access onboarding with team role and volume tier customization.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Engine**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with obsidian glassmorphic design tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Type Safety**: [TypeScript 5](https://www.typescriptlang.org/)

---

## 🏃 Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

---

## 📚 Product & Engineering Documentation Suite (59 Specifications)

- **[Product & Engineering Documentation Blueprint](docs/product/Zyvoriq_Product_Engineering_Documentation_Blueprint.md)** — Canonical document inventory, dependencies, and QGV-001 quality governance gates.

### Complete Specification Directory

| Lifecycle Domain | Core Specifications & Deep Dives |
| :--- | :--- |
| **Strategy & Market** | [`STR-001 Product Vision`](docs/strategy/STR-001_Product_Vision.md) • [`STR-002 Strategy`](docs/strategy/STR-002_Product_Strategy.md) • [`STR-003 Positioning`](docs/strategy/STR-003_Positioning_Messaging.md) • [`MKT-001 Market & Competitors`](docs/market/MKT-001_Market_Competitive_Analysis.md) • [`BUS-001 BRD`](docs/business/BUS-001_BRD.md) • [`BUS-002 Pricing`](docs/business/BUS-002_Pricing_Packaging.md) • [`GTM-001 Launch Plan`](docs/market/GTM-001_GTM_Launch_Plan.md) |
| **Research & Scope** | [`RES-001 Personas & JTBD`](docs/research/RES-001_Personas_JTBD.md) • [`VOC-001 Voice of Customer`](docs/research/VOC-001_Voice_of_Customer.md) • [`SCP-001 Capability Map`](docs/scope/SCP-001_Capability_Map.md) • [`RDM-001 Product Roadmap`](docs/roadmap/RDM-001_Product_Roadmap.md) • [`GOV-001 RAID Register`](docs/governance/GOV-001_RAID_Register.md) |
| **Product & UX Specs** | [`PRD-000 Master PRD`](docs/product/PRD-000_Master_PRD.md) • [`FRD-001 Functional Requirements`](docs/product/FRD-001_Functional_Requirements.md) • [`UX-001 Information Architecture`](docs/ux/UX-001_Information_Architecture.md) • [`UX-002 User Journeys`](docs/ux/UX-002_User_Journeys.md) • [`UX-003 Design System`](docs/ux/UX-003_Design_System_Spec.md) |
| **Architecture & Data** | [`ARC-001 HLD`](docs/architecture/ARC-001_HLD.md) • [`ARC-002 SDD`](docs/architecture/ARC-002_SDD.md) • [`ARC-003 Domain Model`](docs/architecture/ARC-003_Domain_Model.md) • [`ARC-004 Event Architecture`](docs/architecture/ARC-004_Integration_Event_Architecture.md) • [`NFR-001 Non-Functional Requirements`](docs/architecture/NFR-001_Non_Functional_Requirements.md) • [`SEC-001 Security & STRIDE`](docs/security/SEC-001_Security_Threat_Model.md) • [`DAT-001 Schema & Retention`](docs/data/DAT-001_Data_Retention_Spec.md) • [`API-001 API & Webhook Spec`](docs/api/API-001_API_Specification.md) |
| **AI, Veritas & Trust** | [`AI-001 Swarm Architecture`](docs/ai/AI-001_Agent_Architecture.md) • [`AI-002 Model Routing`](docs/ai/AI-002_Model_Routing_Strategy.md) • [`AI-003 Veritas Framework`](docs/architecture/AI-003_Veritas_Framework.md) • [`AI-004 Golden Evals`](docs/ai/AI-004_Golden_Benchmark_Spec.md) • [`AI-005 Persona Memory`](docs/ai/AI-005_Persona_Memory_Spec.md) • [`TRU-001 C2PA Provenance`](docs/trust/TRU-001_Privacy_Provenance.md) • [`AUT-001 Autonomy Policy`](docs/governance/AUT-001_Autonomy_Policy_Spec.md) • [`CON-001 Connector Matrix`](docs/connectors/CON-001_Connector_Matrix.md) |
| **Feature Deep Dives** | [`PRD-101 Universal Create`](docs/features/PRD-101_TDD-101_Universal_Create.md) • [`PRD-102 Persona Vault`](docs/features/PRD-102_TDD-102_Persona_Memory.md) • [`PRD-103 Opportunity Radar`](docs/features/PRD-103_TDD-103_Opportunity_Radar.md) • [`PRD-104 Technical Text`](docs/features/PRD-104_TDD-104_Text_Technical_Publishing.md) • [`PRD-105 Visuals & Diagrams`](docs/features/PRD-105_TDD-105_Visual_Diagrams.md) • [`PRD-106 Audio & Voice`](docs/features/PRD-106_TDD-106_Audio_Neural_Voice.md) • [`PRD-107 Video & Shorts`](docs/features/PRD-107_TDD-107_Video_Shorts.md) • [`PRD-108 Veritas Auto-Repair`](docs/features/PRD-108_TDD-108_Veritas_Auto_Repair.md) • [`PRD-109 Multi-Channel Adaptation`](docs/features/PRD-109_TDD-109_Channel_Adaptation.md) • [`PRD-110 Analytics Tuning`](docs/features/PRD-110_TDD-110_Analytics_Tuning.md) • [`PRD-111 Autopilot & Kill-Switch`](docs/features/PRD-111_TDD-111_Autopilot_Policies.md) • [`PRD-112 Workspaces & Versioning`](docs/features/PRD-112_TDD-112_Workspaces_Versioning.md) • [`PRD-113 Billing & Quotas`](docs/features/PRD-113_TDD-113_Billing_Cost_Controls.md) • [`PRD-114 Developer SDK`](docs/features/PRD-114_TDD-114_Developer_SDK.md) |
| **Delivery, QA & Ops** | [`ENG-002 Implementation Spec`](docs/engineering/ENG-002_LLD_Implementation.md) • [`DEL-001 Backlog Plan`](docs/delivery/DEL-001_Backlog_Plan.md) • [`DEL-002 DoR & DoD`](docs/delivery/DEL-002_DoR_DoD.md) • [`QAT-001 Master Test Strategy`](docs/qa/QAT-001_Master_Test_Strategy.md) • [`UAT-001 Beta Plan`](docs/qa/UAT-001_Beta_UAT_Plan.md) • [`OBS-001 Observability & SLOs`](docs/operations/OBS-001_Observability_SLO.md) • [`REL-001 CI/CD Strategy`](docs/operations/REL-001_Release_Strategy.md) • [`LCH-001 Launch Scorecard`](docs/operations/LCH-001_Launch_Readiness.md) • [`MET-001 North Star Metrics`](docs/metrics/MET-001_Metrics_North_Star.md) • [`MET-002 Analytics Taxonomy`](docs/metrics/MET-002_Analytics_Taxonomy.md) |

### Lifecycle Traceability Chain
```
VISION → BRD → PRD → IA/UX → FRD/FDD → NFR → HLD/SDD → LLD/TDD → API/DATA/AI SPECS → EPICS/STORIES → TEST/EVALS → BUILD → UAT → RELEASE → OPERATE → MEASURE → LEARN
```
