# AI-001 — AI & Agent Swarm Architecture

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | AI-001 |
| **Title** | Zyvoriq Multi-Agent Swarm Orchestration & Agentic Graph Architecture |
| **Owner** | Lead AI Architect |
| **Approvers** | CTO, VP of AI Research |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-AI-01 (AI Architecture Approved) |
| **Assurance Score** | 99/100 |
| **Parent Reference** | STR-001, PRD-000, ARC-001 |

---

## 1. Agent Swarm Decomposition & Dependency Graph

```mermaid
flowchart TD
    UserBrief["User Brief / Raw Concept (Text, URL, File)"]
    Director["Director Orchestrator (Decomposes Task Graph)"]
    
    subgraph SwarmPhase1["Parallel Research & Copy Swarm"]
        Research["Research & Grounding Agent (Google Search / Docs)"]
        Scripting["Scripting & Narrative Agent (Channel Copywriting)"]
        CodeAgent["Code & Diagram Compiler (AST / Draw.io)"]
    end
    
    subgraph SwarmPhase2["Multimodal Media Swarm"]
        Visual["Visual & Storyboard Agent (Veo 2 Prompts)"]
        Voice["Neural Speech Agent (DeepMind TTS SSML)"]
    end
    
    subgraph AssurancePhase["Automated Quality Firewall"]
        Veritas["Veritas Consensus Evaluator (5-Axis VQS Matrix)"]
    end

    UserBrief --> Director
    Director --> Research
    Director --> Scripting
    Director --> CodeAgent
    
    Research --> Visual
    Scripting --> Visual
    Scripting --> Voice
    
    Visual --> Veritas
    Voice --> Veritas
    CodeAgent --> Veritas
```

---

## 2. Multi-Agent Inter-Service Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Creator
    participant BFF as Next.js BFF
    participant Swarm as Swarm Orchestrator
    participant Model as Model Router (Gemini/Claude)
    participant Veritas as Veritas QA Engine
    participant Channel as Social Connector

    User->>BFF: Submit Brief (Cmd+Enter)
    BFF->>Swarm: Initialize Agent Graph (POST /director/synthesize)
    Swarm-->>BFF: SSE Token Stream Started
    BFF-->>User: Live Progress Updates (SSE)
    
    par Parallel Synthesis
        Swarm->>Model: Research & Claims Extraction
        Swarm->>Model: Narrative & Code AST Generation
        Swarm->>Model: Storyboard & Neural Voice Dub
    end

    Model-->>Swarm: Modality Artifact Drafts
    Swarm->>Veritas: Evaluate Drafts (POST /veritas/evaluate)
    
    alt VQS >= 90 (Pass)
        Veritas-->>Swarm: Signed Quality Certificate (VQC)
        Swarm->>Channel: Dispatch / Schedule Posts
        Channel-->>User: Published Confirmation
    else VQS < 90 (Repair Required)
        Veritas->>Swarm: Surgical Diff Patch & Re-prompt
        Swarm->>Model: Regenerate Flawed Passages
        Model-->>Veritas: Re-evaluate Patch
    end
```

---

## 2. Specialized Agent Roles & System Prompts

1. **Research & Grounding Agent**: Extracts structured claims, dates, statistics, and citations from provided URLs and documents.
2. **Narrative & Editorial Agent**: Drafts long-form copy, social hooks, and scripts conforming to active persona tone vectors.
3. **Storyboard & Visual Agent**: Generates structured video scene prompts, camera angles, color grading tokens, and on-screen captions.
4. **Neural Speech Agent**: Produces SSML markup with pitch, cadence, and breath markers for 5-band neural voice generation.
5. **Code & Architecture Agent**: Writes validated executable code and generates standard Draw.io/SVG XML architecture topology graphs.

---

## 3. Document Sign-off (QG-AI-01)

- [x] Multi-agent roles and state machine graph formally specified.
- [x] Inter-agent message protocols and telemetry streaming verified.

**Exit Status:** `AI ARCHITECTURE APPROVED (PASS)`
