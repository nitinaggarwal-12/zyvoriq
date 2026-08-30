# BUS-001 — Business Requirements Document

| Attribute | Value |
| :--- | :--- |
| Document ID | BUS-001 |
| Owner | Product / Business Operations |
| Version | 2.1.0 |
| Status | Active |
| Priority | P0 |
| Parent | STR-001 |
| Governance | GOV-002 |

## 1. Business problem

Generative media is increasingly easy to produce but difficult to make consistently **publishable**. Users still coordinate idea selection, scripting, voice, short video clips, continuity, editing, music, captions, quality review, regeneration, platform adaptation and performance analysis across disconnected tools. Upstream models improve quickly, creating vendor-dependency risk for products that merely wrap a single provider.

Zyvoriq solves the orchestration and decision problem: turn a creative/business objective into coherent, verified and repairable media while keeping the underlying generation providers replaceable.

## 2. Initial market wedge

The first product must excel at **short-form social video** for creators, brands, social teams and experts/educators. Instagram Reels is the primary initial experience, with YouTube Shorts and TikTok-style variants following the same semantic production source.

Long-form video, multi-format campaigns and autonomous campaign management are expansions of the same control plane, not separate architectures.

## 3. Business requirements

- **BR-001 — Publishable production:** One brief must be able to produce a complete short-form video, not merely a storyboard or disconnected clips.
- **BR-002 — Provider independence:** Production semantics must be owned by Zyvoriq and survive provider/model substitution.
- **BR-003 — Continuity:** Character, environment, object, action, camera, narration, music, ambience, captions and story continuity must be managed across source clips.
- **BR-004 — Evidence-based quality:** Product completion must be based on artifact evidence and applicable quality gates, with publishability measured independently of provider claims.
- **BR-005 — Repairability:** Failed sections must be repairable without unnecessary regeneration of accepted or locked work; long-running jobs must be resumable.
- **BR-006 — Sustainable economics:** The system must optimize quality, provider cost, retries and latency together and expose attributable production cost.
- **BR-007 — Personalized intelligence:** Creator, brand and audience context must improve decisions while remaining scoped, inspectable and tenant-isolated.
- **BR-008 — Outcome loop:** Platform-native derivatives, distribution and measured outcomes must eventually feed future creative decisions.
- **BR-009 — Autonomous campaigns:** Zyvoriq must eventually plan governed multi-asset campaigns from a creator/business objective while respecting autonomy, evidence, rights and approval policy.
- **BR-010 — Platform ecosystem:** Stable APIs, SDKs, interoperability and semantic recipes must expose Zyvoriq capabilities without coupling customers to internal provider choices.

Canonical mappings are maintained in `docs/governance/traceability.json`.

## 4. Required user outcomes

### R1 — Production Core

A user enters a topic/brief and receives a real production job with persisted status and, when successful, an assembled 30–60 second vertical master containing video, narration, captions and owned audio treatment. No manual stitching is required.

### R2–R3 — Continuity, Quality & Repair

The production behaves like one directed piece rather than independent AI clips. Whole-Reel and cut-boundary audits identify blocking failures, and repair regenerates the minimum affected dependency closure.

### R4–R6 — Control, Intelligence & Personalization

Users edit semantically, lock what must not change, branch variants, and receive creative decisions informed by brief quality, hook/narrative reasoning, contextual taste and scoped creator/brand/audience memory.

### R7–R9 — Trust, Distribution & Learning

Claims/rights/provenance, platform-native variants, publishing and outcome telemetry close the learning loop with explicit uncertainty and tenant controls.

### R10–R11 — Autonomous Campaigns & Ecosystem

Zyvoriq evolves from single-asset execution to governed objective-to-portfolio planning, then exposes stable platform capabilities and semantic recipes for partners/developers.

## 5. Business success measures

The primary measure is **Publishable First-Render Rate (PFRR)**, not the number of generated assets.

Supporting measures:

- time to first publishable output;
- manual edit minutes per published asset;
- cost per publishable minute;
- regeneration and wasted-inference rate;
- targeted repair success;
- publish conversion (completed project → actually published);
- creator/team retention;
- objective-specific downstream outcomes.

Numeric goals are hypotheses/targets until observed; they must not be represented as achieved guarantees.

## 6. Economic principles

1. Budget expensive generation where it contributes most to perceived outcome.
2. Reuse approved assets and references when allowed.
3. Stop repeated failing strategies and escalate to another provider, simpler shot or alternate representation.
4. Attribute cost by provider, shot, retry, QA, render, localization and variant.
5. Prefer cost per **publishable** output over cost per generation call.

## 7. Trust and business constraints

- Do not claim factual verification, rights clearance, C2PA/provenance support, lip sync or synchronization unless implementation and evidence support the claim.
- Identity/voice/likeness usage must support consent, scope and revocation as relevant capabilities mature.
- Customer memories, unpublished content and brand intelligence may not leak across tenants/brands.
- A model router must consider privacy, residency, rights and policy—not quality/cost alone.
- High-risk content/workflows may require human approval even when automated creative quality is high.

## 8. Non-goals for the initial wedge

- Building proprietary frontier foundation models.
- Being a generic prompt/chat application.
- Replacing every professional video-editing feature before semantic production control is reliable.
- Promising guaranteed virality, factuality, copyright safety or engagement.
- Building ad bidding/buying as a core R1 capability.

## 9. Business acceptance

BUS-001 is satisfied through traceable PRD requirements, architecture components, release epics, stories and quality gates. [GOV-002](../governance/GOV-002_Traceability_Model.md) defines the no-orphan/no-fake-completion policy.
