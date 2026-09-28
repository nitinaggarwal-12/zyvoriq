# ZYVORIQ — Complete Consolidated Governance & Runtime Configuration (v3.1.0 — Unified 5-Tier Google Omni 1.1 / Gemini 3.1 Pro / 2.5 Pro / 3.8 Flash / 2.5 Flash / DeepMind Veo 3.1, Lyria 3 Pro & Imagen 3 Edition)

> **Generated**: 2026-09-28T03:55:27.698Z
> **Designated Chief Forensic Auditor & Final Judge**: **`Google Omni 1.1 (models/gemini-omni-1.1-flash) & Gemini 3.1 Pro (models/gemini-3.1-pro-preview)`** (`authority: BINDING_VETO`)
> **Scope**: 100% Verbatim Contents of Active Zyvoriq Config, Constitution, Plugin, Skills & Guard Files (`v3.1.0`)

## Table of Contents & File Inventory

| # | File | Canonical Path | Symlink Mirror(s) | Size (Bytes) | Lines | SHA-256 |
| :- | :--- | :--- | :--- | ---: | ---: | :--- |
| 1 | **hooks.json** | `/Users/nitinagga/.gemini/config/hooks.json` | `/Users/nitinagga/Documents/zyvoriq/.agents/hooks.json` | 26264 | 434 | `c7f9ac419c38a664` |
| 2 | **AGENTS.md** | `/Users/nitinagga/.gemini/config/AGENTS.md` | `/Users/nitinagga/Documents/zyvoriq/AGENTS.md` | 80854 | 593 | `74743c7e59852357` |
| 3 | **skills.md** | `/Users/nitinagga/.gemini/config/skills.md` | `/Users/nitinagga/Documents/zyvoriq/skills.md` | 11790 | 127 | `a93ee4a5dade7148` |
| 4 | **plugin.json** | `/Users/nitinagga/.gemini/config/plugins/zyvoriq_guard/plugin.json` | `*(none)*` | 346 | 8 | `333d24ae13c5174f` |
| 5 | **README.md** | `/Users/nitinagga/Documents/zyvoriq/README.md` | `*(none)*` | 6734 | 85 | `fd9b52ef72bbfb65` |
| 6 | **rules_engine.mjs** | `/Users/nitinagga/Documents/zyvoriq/lib/rules_engine.mjs` | `/Users/nitinagga/.gemini/config/plugins/zyvoriq_guard/lib/rules_engine.mjs` | 6600 | 188 | `2458cd36e46a81a8` |

---

## 1. Global Runtime Hooks Configuration (`hooks.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "name": "omni_guard",
  "version": "3.1.0",
  "amendment_log": [
    "v3.1.0 (2026-09-28): Upgraded Zyvoriq & Global Google/Gemini/DeepMind Model Inventory with complete live API identifiers (models/gemini-omni-1.1-flash, models/gemini-3.1-pro-preview, models/gemini-2.5-pro, models/gemini-3.8-flash, models/gemini-2.5-flash with thinkingBudget:0, models/gemini-3.1-flash-live-preview, models/lyria-3-pro-preview, lyria-3.5, models/veo-3.1-generate-preview, models/imagen-3.0-generate-002, models/gemini-3.1-flash-image-preview, models/gemini-3.1-flash-tts-preview) and enforced Zyvoriq Zero-Hardcoding 4-Route / 3-Workflow Studio Contract.",
    "v3.0.0 (2026-09-27): Consolidated ScoreX onto the 3 Canonical Assessment Engines (Dynamic Assessment Blueprints, GE Value Realization, EU AI Act Statutory Compliance), upgraded ScoreX 5-Stage Model Orchestration DAG (Google Omni 1.1, Gemini 3.1 Pro, Gemini 3.8 Flash, Gemini Flash Live, Gemini Embedding 001 / text-embedding-005, DeepMind Veo 3.1, Imagen 3, Lyria 3.5, Gemini 3.1 Flash TTS, BigQuery Property Graphs ISO GQL, Google ADK Sidecar & Model Armor), and blocked non-existent gemini-3.7-* / legacy gpt-4* model strings.",
    "v2.9.0 (2026-09-27): Added customer-tracker / gantry-pulse 6-Dimension Forensic & 4-Tier Hierarchy Governance project profile, expanded Google Omni 1.1 / Gemini 3.1 Pro / Gemini 3.8 Flash / Gemini Flash Live / gemini-embedding-001 / text-embedding-005 / DeepMind Neural Audio, Veo 3.1, Imagen 3, Lyria 3.5, AI Co-Scientist, Agent Designer 2.0, NotebookLM Enterprise, BigQuery Property Graph (GQL), Google ADK 4-Agent Sidecar & Model Armor inventory, and enforced 11-Rule Pre-Flight Guardrail Checklist.",
    "v2.8.0 (2026-09-27): Unified 5-Tier Google Omni 1.1 / Gemini 3.1 Pro / Gemini 3.8 Flash / Gemini Flash Live / DeepMind Veo 3.1 & Lyria 3.5 Model Stack (src/lib/geminiConfig.ts), Universal Route Guard & 4-Category Conversational Non-Mutation Gate across all 13 Gemini-backed API routes, Single-Studio Consolidation (/workspace, /studio1, /gcp -> /studio), and upgraded PostToolUse static invariant verifier (scripts/post_tool_verifier.mjs).",
    "v2.7.0 (2026-09-27): Rule 43 Infographic Blueprint (#52-#66) 1:1 Native Pixel Canvas, Hybrid Inline Vector SVG + Editable mxCell Architecture, Single-Escape cleanSvg() Invariant, and 50/50 Side-by-Side Zero-Inset Parity Law.",
    "v2.6.0 (2026-09-18): Rule 42 Mandatory 6-Dimension Deep Domain Research Pre-Flight Law (src/lib/research/deepDomainResearcher.ts & POST /api/research-infographic), eliminating generic string interpolation across all dynamic diagram topics and enforcing live Gemini 3.1 Pro 6-Dimension Architectural Research Dossiers.",
    "v2.5.0 (2026-09-17): Rule 41 Anti-Static-Spoofing Law, Layout Archetype vs. Subject Domain Separation, Universal Dynamic Tiered Infographic Engine (dynamicTieredInfographic.ts), and 5-way SHA-256 Markdown/Skill Lockstep Synchronization across AGENTS.md, GEMINI.md, .agents/AGENTS.md, CLAUDE.md, ~/.gemini/config/AGENTS.md, skills.md, and SKILL.md files."
  ],
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "write_to_file|replace_file_content|multi_replace_file_content",
        "hooks": [
          {
            "type": "command",
            "command": "node /Users/nitinagga/Documents/customer-tracker/scripts/pre_tool_lineage_guard.mjs",
            "description": "Block confidential customer leaks to git-tracked files, block compId=2120237 Detectr bot bugs, and block $1,000M ARR inflation"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "node /Users/nitinagga/Documents/customer-tracker/scripts/stop_forensic_gate.mjs",
            "description": "Verify 6-Dimension forensic integrity (0 duplicate IDs, 0 Detectr bots, 100% 4-tier taxonomy, grounded ARR) and 0 confidential git leaks"
          }
        ]
      }
    ]
  },
  "omni-governance-guard": {
    "PreToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/pre_tool_guard.mjs"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/post_tool_verifier.mjs"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/stop_quality_gate.mjs"
          }
        ]
      }
    ]
  },
  "description": "Google Omni 1.1 Universal Multi-Project Quality, Model Selection & Multi-Agent Orchestration Engine",
  "global_governance": {
    "sme_director": "Google Omni 1.1 (End-to-End Subject Matter Expert Director & Chief Orchestrator)",
    "chief_auditor": "Google Omni 1.1 (Chief Forensic Quality Auditor & Autonomous Remediation Gatekeeper)",
    "universal_post_fix_governance_doc_sync": {
      "enabled": true,
      "scope": "ALL_PROJECTS_UNIVERSAL",
      "enforce_on_every_root_cause_fix": true,
      "canonical_files": [
        "~/.gemini/config/hooks.json",
        ".agents/hooks.json",
        "AGENTS.md",
        "GEMINI.md",
        ".agents/AGENTS.md",
        "CLAUDE.md",
        "~/.gemini/config/AGENTS.md",
        "skills.md",
        "docs/INTENT_ROUTER.md",
        ".agents/skills/universal-document-cloud-hub/SKILL.md",
        "~/.gemini/config/skills/universal-document-cloud-hub/SKILL.md",
        ".agents/skills/diagram-generation-engine/SKILL.md",
        "~/.gemini/config/skills/diagram-generation-engine/SKILL.md",
        ".agents/skills/customer-lineage-forensic-guard/SKILL.md",
        "README.md"
      ],
      "detector": "scripts/guards/gate_governance_doc_sync.mjs",
      "policy": "UNIVERSAL MULTI-PROJECT LAW: Across every project and workspace, whenever any bug fix, root-cause remediation, or new invariant is implemented, the agent MUST immediately update all relevant .md files (AGENTS.md, GEMINI.md, .agents/AGENTS.md, CLAUDE.md, docs/INTENT_ROUTER.md), SKILL.md files, and hooks.json files in lockstep within the same turn so the defect can never recur in any project."
    },
    "dynamic_model_orchestration": {
      "orchestrator": "Google Omni 1.1",
      "authority": "Google Omni 1.1 autonomously decides which additional models to invoke, the precise execution order (sequential/parallel/cyclical), and the coordination protocol among all models and agents.",
      "model_inventory": {
        "orchestrator_and_judge": "Google Omni 1.1 (google-omni-1.1 / models/gemini-omni-1.1-flash)",
        "deep_reasoning_and_pedagogy": "Gemini 3.1 Pro & Gemini 2.5 Pro with thinkingConfig + responseSchema (models/gemini-3.1-pro-preview / models/gemini-2.5-pro)",
        "vision_extraction": "Gemini 3.1 Pro Vision & Gemini 2.5 Flash Multimodal (models/gemini-3.1-pro-preview / models/gemini-2.5-flash)",
        "ast_graph_synthesis": "Gemini 3.8 Flash & Gemini 2.5 Flash with Function Calling / Sub-Second Structured JSON (models/gemini-3.8-flash / models/gemini-2.5-flash)",
        "live_streaming_and_blueprint": "Gemini Flash Live (models/gemini-3.1-flash-live-preview)",
        "audio_composition": "DeepMind Lyria 3 Pro Preview & Lyria 3.5 (models/lyria-3-pro-preview / lyria-3.5) & Google DeepMind Neural Audio (models/gemini-3.1-flash-tts-preview)",
        "video_generation": "Google DeepMind Veo 3.1 & Gemini Omni 1.1 Flash Video (models/veo-3.1-generate-preview / models/gemini-omni-1.1-flash)",
        "image_generation": "Google DeepMind Imagen 3 & Nano Banana Visual DNA (models/imagen-3.0-generate-002 / models/gemini-3.1-flash-image-preview)",
        "scoring_and_rubrics": "Multi-Dimensional Weighted Evaluator",
        "protocol_mesh": "A2A Protocol & MCP Governance Engine",
        "semantic_vector_embedding": "Gemini Embedding 001 & Text Embedding 005 (gemini-embedding-001 / text-embedding-005)",
        "scientific_discovery_agents": "Google DeepMind AI Co-Scientist (cloud-ai-for-science / compId:2192707)",
        "enterprise_agent_platform": "Gemini Agent Designer 2.0, NotebookLM Enterprise & A2A Gateway",
        "graph_database_engine": "BigQuery Property Graphs (ISO GQL)",
        "multi_agent_sidecar": "Google ADK (Agent Development Kit) 4-Agent Scheduled Sidecar",
        "conversational_bi_analytics": "Gemini Data Analytics API (gemini-data-analytics-api)",
        "prompt_security_shield": "Google Cloud Model Armor",
        "deprecated_blocked_models": [
          "gemini-1.0-pro",
          "gemini-1.5-pro",
          "gemini-1.5-flash",
          "gemini-2.0-flash",
          "gemini-2.5-flash-preview-tts",
          "gemini-3.7-flash",
          "gemini-3.7-pro",
          "textembedding-gecko",
          "palm-2",
          "chat-bison",
          "gpt-4",
          "gpt-4o",
          "gpt-4o-mini",
          "claude-opus-5"
        ]
      },
      "coordination_rules": [
        "1. Omni 1.1 analyzes the user request, domain context, and asset modalities to formulate an execution DAG.",
        "2. Omni 1.1 selects the minimal, most capable set of auxiliary models and assigns strict roles.",
        "3. Omni 1.1 enforces structured JSON/AST schema handoffs between models to prevent context drift.",
        "4. Omni 1.1 monitors intermediate outputs and dynamically invokes remediation models if quality falls below threshold.",
        "5. Final sign-off is reserved strictly for Google Omni 1.1 multimodal forensic audit."
      ]
    },
    "enforcement": "Strict Zero-Bypass Across All 6 Projects"
  },
  "projects": {
    "PromptCanvas": {
      "tag": "PromptCanvas",
      "path_matchers": [
        "PromptCanvas"
      ],
      "domain": "architecture_blueprints_and_canvas",
      "omni_sme_director": {
        "model": "Google Omni 1.1",
        "role": "Chief Architecture SME Director & Model Orchestrator (Visual Blueprints, Canvas Layouts, Draw.io AST Standards & Topology Planning)"
      },
      "omni_sme_auditor": {
        "model": "Google Omni 1.1",
        "role": "Chief Forensic Quality Auditor (Multimodal Visual Overlap, AST Validation & 100% Zero-Collision Gate)"
      },
      "model_orchestration": {
        "decided_by": "Google Omni 1.1",
        "execution_order": [
          "Stage 1: Google Omni 1.1 - Blueprint & Topology Planning (Spatial decomposition, master blueprint matching)",
          "Stage 2: Gemini 3.1 Pro - Deep Domain Research & Exhaustive Vision Extraction (OCR, node inventories, 15-archetype domain synthesis)",
          "Stage 3: Gemini 3.8 Flash & Gemini Flash Live - Fast Intent Classification (<2.5s), Sub-Second Live Blueprinting & Draw.io AST Graph Construction",
          "Stage 4: Google Omni 1.1 - Multimodal Forensic Audit & Autonomous Healing (Collision resolution, Rule 41/42/43 zero-defect certification)"
        ],
        "agent_coordination": "Omni 1.1 passes structured SpatialLayoutContract to Gemini 3.1 Pro / 3.8 Flash, validates entity count, feeds AST specification to the Draw.io XML builder, and performs closed-loop visual QA on rendered SVG."
      },
      "rules": {
        "card_anatomy": "2-column flexbox with left icon rail (display:flex; gap:8px)",
        "min_icon_density": 0.25,
        "min_connector_density": 0.15,
        "aspect_ratio_range": [
          1.25,
          2.2
        ],
        "mandatory_widescreen_16_9": true,
        "bus_routing_required": true,
        "ban_global_dark": true,
        "ban_external_http_icons": true,
        "mandatory_screenshots": true,
        "require_export_slides_parity_gate": true,
        "require_style_image_base64_svg_extraction": true,
        "require_cloud_bridge_head_content_length": true,
        "ban_obsolete_workspace_route": true,
        "require_single_studio_consolidation": true,
        "require_google_docs_editable_decomposed_diagram": true,
        "require_viewer_open_with_google_slides_and_docs_buttons": true,
        "require_guided_launch_assistant_and_docs_html_only_clipboard": true,
        "require_viewer_default_google_engine_and_cache_buster": true,
        "require_native_word_4layer_drawingml_no_corrupted_boxes": true,
        "require_cloud_bridge_schema_version_bump": true,
        "ban_static_template_spoofing_on_new_topics": true,
        "require_prompt_to_canvas_semantic_subject_parity": true,
        "require_library_persisted_xml_uniqueness_and_payload_parity": true,
        "require_5_tier_model_stack_and_universal_route_guard": true
      }
    },
    "scorex": {
      "tag": "scorex",
      "path_matchers": [
        "scorex",
        "usecase-scoring",
        "usecase_scoring",
        "all_assessment",
        "assessments"
      ],
      "domain": "enterprise_ai_maturity_and_scoring",
      "omni_sme_director": {
        "model": "Google Omni 1.1",
        "role": "Chief AI Maturity SME Director & Model Orchestrator (3 Canonical Assessment Engines: Dynamic Assessment Blueprints, GE Value Realization, EU AI Act Statutory Compliance)"
      },
      "omni_sme_auditor": {
        "model": "Google Omni 1.1",
        "role": "Chief Forensic Quality Auditor (Score Boundary Verification [1.0, 5.0], Deterministic Recalculation, Dual-DB Safety & Zero Confidential Git Leak Gate)"
      },
      "model_orchestration": {
        "decided_by": "Google Omni 1.1",
        "execution_order": [
          "Stage 1: Google Omni 1.1 (google-omni-1.1 / gemini-omni-1.1-flash) - Chief AI Maturity SME Director & 3-Engine Rubric Orchestrator (Dynamic Assessment Blueprints, GE Value Realization, EU AI Act Statutory Compliance)",
          "Stage 2: Gemini 3.1 Pro (thinkingConfig + responseSchema, gemini-3.1-pro-preview) & Gemini 3.1 Pro Vision - Deep Architectural Synthesis, 5-Column CFO Value Realization Bridge, EU AI Act Annex IV Conformity Dossiers & Architecture Diagram Decompilation",
          "Stage 3: Gemini 3.8 Flash (Function Calling, gemini-3.8-flash), Gemini Flash Live (gemini-3.1-flash-live-preview) & Gemini Embedding 001 / text-embedding-005 - Sub-2.5s AI Framework Compiler, Evidence Ingestion, Live Copilot Streaming & Semantic Rubric Matching",
          "Stage 4: DeepMind Multimodal Media & Enterprise Platform (Veo 3.1 veo-3.1-generate-preview, Imagen 3 gemini-3.1-flash-image-preview, Lyria 3.5, Gemini 3.1 Flash TTS gemini-3.1-flash-tts-preview, BigQuery Property Graphs ISO GQL, Google ADK Sidecar, Gemini Data Analytics API & Google Cloud Model Armor) - Executive Video/Audio Readouts, Target State Blueprint Rendering & Prompt Security Shield",
          "Stage 5: Google Omni 1.1 - Multimodal Forensic Audit, Deterministic Score Boundary Verification [1.0, 5.0], Dual-DB Integrity & Zero Confidential Git Leak Gate"
        ],
        "agent_coordination": "Omni 1.1 coordinates Gemini 3.1 Pro deep executive reasoning, Gemini 3.8 Flash rapid blueprint synthesis, Gemini Flash Live real-time copilot streaming, and DeepMind Veo 3.1 / Imagen 3 / Lyria 3.5 multimodal briefing assets while enforcing deterministic [1.0, 5.0] score rollups."
      },
      "rules": {
        "strict_score_bounds": [
          1.0,
          5.0
        ],
        "require_deterministic_recalculation": true,
        "dual_engine_db_safety": true,
        "ban_ungrounded_capability_scores": true,
        "require_3_canonical_assessment_engines": true,
        "zero_confidential_git_leaks_and_fictitious_personas_only": true,
        "require_5_tier_google_gemini_deepmind_model_stack": true
      }
    },
    "vidoxis": {
      "tag": "vidoxis",
      "path_matchers": [
        "vidoxis",
        "trainex",
        "enablement",
        "workshop"
      ],
      "domain": "enterprise_video_enablement_and_training",
      "omni_sme_director": {
        "model": "Google Omni 1.1",
        "role": "Chief Enablement SME Director & Model Orchestrator (Persona Pedagogies, Multi-Modal Learning Modules & Lab Architecture)"
      },
      "omni_sme_auditor": {
        "model": "Google Omni 1.1",
        "role": "Chief Forensic Quality Auditor (Sandbox Lab Reproducibility, Broken Link Scanner & Persona Coverage QC)"
      },
      "model_orchestration": {
        "decided_by": "Google Omni 1.1",
        "execution_order": [
          "Stage 1: Google Omni 1.1 - Pedagogical Strategy & Curriculum DAG (Define learning milestones for Executive, Architect, Developer, Operator)",
          "Stage 2: Gemini 3.1 Pro - Deep Technical Script & Lab Module Authoring (Exhaustive step-by-step documentation and code walkthroughs)",
          "Stage 3: Sandbox Lab Provisioning Agent - Reproducible Command Verification (Execute and validate shell commands in isolated sandboxes)",
          "Stage 4: Google Omni 1.1 - Forensic Enablement Audit (Verify zero broken links, 100% command pass rate, and full persona coverage)"
        ],
        "agent_coordination": "Omni 1.1 dispatches specialized authoring agents per persona, enforces shared glossary standards, and coordinates with sandbox test runners."
      },
      "rules": {
        "ban_broken_curriculum_links": true,
        "require_reproducible_commands": true,
        "require_persona_coverage": true
      }
    },
    "a2a-enterprise-strategy": {
      "tag": "a2a-enterprise-strategy",
      "path_matchers": [
        "a2a-enterprise-gateway",
        "a2a-enterprise-strategy",
        "a2a_sdk",
        "adk"
      ],
      "domain": "agent_to_agent_enterprise_gateway_and_mesh",
      "omni_sme_director": {
        "model": "Google Omni 1.1",
        "role": "Chief Multi-Agent Systems SME Director & Mesh Orchestrator (A2A Protocol Standards, MCP Tool Governance & Gateway Topology)"
      },
      "omni_sme_auditor": {
        "model": "Google Omni 1.1",
        "role": "Chief Forensic Quality Auditor (JSON Schema Contract Verification, Security Armor & Circuit Breaker QC)"
      },
      "model_orchestration": {
        "decided_by": "Google Omni 1.1",
        "execution_order": [
          "Stage 1: Google Omni 1.1 - Multi-Agent Interaction Topology (Define agent identities, communication contracts, and JSON-RPC envelopes)",
          "Stage 2: Model Context Protocol (MCP) Governance Engine - Schema Validation (Validate JSON Schema contracts for tools and resources)",
          "Stage 3: Security & Token Armor Agent - Policy & Quota Enforcement (Token rate-limiting, circuit breaker policies, mTLS & IAM propagation)",
          "Stage 4: Google Omni 1.1 - Multi-Agent Mesh Forensic Audit (Fuzzing agent boundaries, asserting zero secret leaks, validating resilience)"
        ],
        "agent_coordination": "Omni 1.1 acts as the Mesh Controller, regulating message routing between client agents and service agents, preventing cascade failures and unauthorized hops."
      },
      "rules": {
        "require_valid_json_schema_mcp": true,
        "ban_unauthenticated_agent_hops": true,
        "enforce_circuit_breakers": true,
        "enforce_rate_limiting": true
      }
    },
    "zyvoriq": {
      "tag": "zyvoriq",
      "path_matchers": [
        "zyvoriq",
        "genmedia",
        "genmedia2.0",
        "genmedia3.0",
        "genmedia6.0"
      ],
      "domain": "generative_cinema_and_music_video",
      "omni_sme_director": {
        "model": "Google Omni 1.1 (models/gemini-omni-1.1-flash)",
        "role": "Chief Cinematic & Production SME Director & Audio-Visual Orchestrator (3-Stage Deconstruct->Elevate->Surpass Compiler, 8-Dimension Storyboard, 5-Tier Character Biometric Anchors & Lyric Rhythm)"
      },
      "omni_sme_auditor": {
        "model": "Google Omni 1.1 (models/gemini-omni-1.1-flash & models/gemini-3.1-pro-preview)",
        "role": "Chief Forensic Quality Auditor (Zero-Hardcoding Gate, Zero-Loop Ban, -14.0 LUFS EBU R128 Audio Mastering, Physical MP4 Verification & Biometric Anchor Continuity QC)"
      },
      "model_orchestration": {
        "decided_by": "Google Omni 1.1",
        "execution_order": [
          "Stage 1: Gemini 2.5 Flash (models/gemini-2.5-flash, thinkingBudget: 0) & Gemini 3.8 Flash (models/gemini-3.8-flash) - 3-Stage Creative Surpass Compiler (Deconstruct -> Elevate -> Surpass), Live YouTube Reference Deconstruction, 8-Dimension Production Bible & Biometric Persona Synthesis (/api/swarm/synthesize-from-prompt & /api/swarm/avatar-builder)",
          "Stage 2: DeepMind Imagen 3 (models/imagen-3.0-generate-002) & Nano Banana Visual DNA (models/gemini-3.1-flash-image-preview) - 5-Tier Character Biometric Lock & Act I -> Act II Wardrobe Continuity Anchors (/personas)",
          "Stage 3: DeepMind Lyria 3 Pro Preview (models/lyria-3-pro-preview) & Lyria 3.5 (lyria-3.5) - Continuous 60.0s 48,000 Hz Stereo Studio Song Master (-14.0 LUFS EBU R128) & Acoustic Viseme Lock",
          "Stage 4: Google Omni 1.1 Flash (models/gemini-omni-1.1-flash via POST /v1beta/interactions) & Google DeepMind Veo 3.1 (models/veo-3.1-generate-preview) - 6-Turn Multi-Turn 24/1 CFR 9:16 Video Synthesis with Sequential Tail-Frame Chaining & Closed-Lips Nayan-Abhinaya / Lip-Sync Precision (/api/swarm/jobs)",
          "Stage 5: Google Omni 1.1 (models/gemini-omni-1.1-flash) & Gemini 3.1 Pro (models/gemini-3.1-pro-preview) - Multimodal Forensic Screening (Biometric facial delta check <= 5%, -14.0 LUFS audio spectral audit, physical MP4 verification in /api/swarm/library, zero hardcoding & zero silence)"
        ],
        "agent_coordination": "Omni 1.1 coordinates the 10-Agent Dance Music Video Swarm across Gemini 2.5 Flash / 3.8 Flash (8-Dimension Prompt & Biometric Compiler), DeepMind Lyria 3 Pro Preview (48kHz Studio Song), and Gemini Omni 1.1 Flash / Veo 3.1 (6-Turn 24fps CFR 9:16 Video)."
      },
      "rules": {
        "ban_stream_loop": true,
        "max_vocal_bed_volume": 0.2,
        "biometric_anchor_threshold": 0.05,
        "zero_silence_required": true,
        "zero_hardcoded_presets": true,
        "require_deconstruct_elevate_surpass_compiler": true,
        "require_physical_mp4_library_verification": true,
        "forensic_auditor_and_judge_model": "Google Omni 1.1 (models/gemini-omni-1.1-flash & models/gemini-3.1-pro-preview)",
        "active_swarm_api_routes": [
          "/api/swarm/synthesize-from-prompt",
          "/api/swarm/jobs",
          "/api/swarm/avatar-builder",
          "/api/swarm/library"
        ],
        "active_studio_workflows": [
          "create",
          "published",
          "wip",
          "/personas"
        ]
      }
    },
    "customer-tracker": {
      "tag": "customer-tracker",
      "path_matchers": [
        "customer-tracker",
        "gantry-pulse"
      ],
      "domain": "enterprise_customer_lineage_and_forensic_sot",
      "omni_sme_director": {
        "model": "Google Omni 1.1",
        "role": "Chief Customer Lineage SME Director & Model Orchestrator (Buganizer compId Classification, Any-1-Pillar OR Gate, 4-Tier L4->L1 Hierarchy & Multi-System Reconciliation)"
      },
      "omni_sme_auditor": {
        "model": "Google Omni 1.1",
        "role": "Chief 6-Dimension Forensic Quality Auditor (11-Rule SoT Checklist, Cross-Column Parity, Detectr 2120237 Blocklist & Zero Confidential Git Leak Gate)"
      },
      "model_orchestration": {
        "decided_by": "Google Omni 1.1",
        "execution_order": [
          "Stage 1: Google Omni 1.1 - 6-Dimension SoT Planning & 3-Tier Customer Grounding DAG",
          "Stage 2: Gemini 3.1 Pro (thinkingConfig + responseSchema) & Gemini 3.1 Pro Vision - Deep Buganizer Thread ETA/Blocker Extraction & Error Screenshot Decompilation",
          "Stage 3: Gemini 3.8 Flash (Function Calling), Gemini Flash Live & Gemini Embedding 001 / text-embedding-005 - <2.5s Conversational Guard, Natural-Language 4-Tier Slicing & Orphan CR->CB Cosine Matching",
          "Stage 4: BigQuery Property Graph (GQL), Google ADK 4-Agent Sidecar, DeepMind Neural Audio (gemini-3.1-flash-tts-preview / Lyria 3.5 / Veo 3.1 / Imagen 3), AI Co-Scientist & Model Armor - Graph Persistence, Scheduled Sync & Executive War Room Briefings",
          "Stage 5: Google Omni 1.1 - 11-Rule Multimodal Forensic Audit & Git Confidentiality Gate"
        ],
        "agent_coordination": "Omni 1.1 coordinates the 4-Agent Google ADK pipeline (CRM Vector Agent, Gantry Intake Agent, Buganizer Graph Agent, Forensic Guardrail Agent) with BigQuery Property Graphs and Gemini 3.1 Pro / 3.8 Flash."
      },
      "rules": {
        "require_unique_primary_key": true,
        "require_primary_id_in_active_pillars": true,
        "require_scalar_to_array_parity": true,
        "require_untruncated_unique_titles": true,
        "require_live_gantry_api_join": true,
        "require_workload_gap_100_coverage": true,
        "require_grounded_arr_and_parent_account": true,
        "strip_other_customer_brackets": true,
        "blocklist_detectr_bot_2120237": true,
        "zero_confidential_git_leaks": true,
        "require_canonical_model_stack": true
      }
    }
  },
  "lifecycle_hooks": {
    "PreInvocation": {
      "enabled": true,
      "script": "scripts/pre_invocation_memory.mjs",
      "timeout": 10
    },
    "PreToolUse": {
      "enabled": true,
      "matcher": "run_command|write_to_file|replace_file_content|notebook_edit|call_mcp_tool",
      "script": "scripts/pre_tool_guard.mjs",
      "timeout": 15
    },
    "PostToolUse": {
      "enabled": true,
      "matcher": "run_command|write_to_file|replace_file_content",
      "script": "scripts/post_tool_verifier.mjs",
      "timeout": 20
    },
    "Stop": {
      "enabled": true,
      "script": "scripts/stop_quality_gate.mjs",
      "timeout": 120,
      "_timeout_rationale": "Layered stall defence (Blindspot 14). Per-child execSync timeouts (10s git / 15s default / 30s local gate) are the primary guard and work even while the event loop is blocked. The script's 90s soft-deadline watchdog is secondary. This 120s host timeout is the last resort only, replacing the old 180s value that let a locked child hang the agent for a full 3 minutes. Ordering must hold: child timeouts < 90s soft deadline < 120s host timeout."
    }
  }
}

```

---

## 2. Multi-Project Workspace Skills & Engineering Protocols (`skills.md`)

```markdown
# 🧰 Multi-Project Workspace Skills & Engineering Protocols (`v3.1.0`)

This document defines the specialized autonomous engineering skills, forensic verification procedures, and 5-Tier Google / Gemini / DeepMind model governance enforced across the Zyvoriq, PromptCanvas, ScoreX, and enterprise AI workspaces.

---

## 1. 🛡️ `anti-static-spoofing-and-subject-parity` (Rule 41 Verification Protocol)

### Purpose & Trigger Conditions
Triggered whenever modifying prompt routing (`src/app/api/generate/route.ts`, `src/lib/unifiedDiagramEngine.ts`, `src/app/studio/page.tsx`), adding diagram templates, or handling layout-style keywords (`"infographic"`, `"tiered infographic"`, `"swimlane"`, `"sequence diagram"`).

### Core Invariant (Zero Static Spoofing)
- **Layout Archetype vs. Subject Domain Separation**:
  - Never confuse a **Visual Layout Archetype** (`4-Tier Architectural Infographic`) with a **Static Content Template** (`Template #52: Context + Harness + Loop + Graph — Charlie Hills` or `NOVACURA Biopharma`).
  - When a user prompt requests a layout style for a **new or arbitrary topic** (e.g., `"Open Knowledge format Infographic"`, `"Healthcare FHIR Infographic"`, `"Zero-Trust Security Infographic"`), the system MUST NEVER spoof or return hardcoded text from an unrelated static template.
  - Generic `"infographic"` requests must route to `generateDynamicTieredInfographicXml(prompt)` (`src/lib/canonical/dynamicTieredInfographic.ts`), which dynamically synthesizes the 4-tier infographic structure (`01 Ingestion` • `02 Harness` • `03 Validation` • `04 Graph`) populated 100% with the user's requested subject domain.

### Operational Verification Command
Run the automated Anti-Static-Spoofing & Subject Domain Parity Quality Gate:
```bash
npx tsx scripts/verify_export_slides_quality_gate.ts
```
This gate executes live synthesis against multiple arbitrary prompts (`"Healthcare FHIR Interoperability Infographic"`, `"Zero-Trust Kubernetes Security Infographic"`) and asserts:
1. Valid 4-tier structure (`TIER 01` through `TIER 04`).
2. 100% semantic subject noun parity in the rendered XML header and tier cards.
3. Zero leaked strings (`charlie hills`, `claude.md`, `novacura`).

---

## 2. 🔄 `governance-doc-lockstep-sync` (Universal Multi-Project Lockstep Gate)

### Purpose & Trigger Conditions
Triggered automatically on every `git commit` (`.git/hooks/pre-commit`) and every Jetski `Stop` lifecycle hook (`scripts/stop_quality_gate.mjs` / `scripts/runQualityGate.ts`).

### Core Protocol & Verification Command
Execute the SHA-256 single-source trinity verification script:
```bash
node scripts/guards/enforce_universal_single_source_trinity.mjs --auto-heal
```
Asserts 100% symlink & byte-for-byte SHA-256 identity across:
- `AGENTS.md` === `GEMINI.md` === `.agents/AGENTS.md` === `CLAUDE.md` === `~/.gemini/config/AGENTS.md`
- `skills.md` === `~/.gemini/config/skills.md`
- `.agents/hooks.json` === `~/.gemini/config/hooks.json`

---

## 3. 📊 `export-slides-and-docs-vector-parity` (Native OpenXML DrawingML & PPTX Engine)

### Purpose & Trigger Conditions
Triggered whenever modifying `editablePptxCompiler.ts`, `editableDocxCompiler.ts`, or `/api/export/cloud-bridge`.

### Core Protocol
- **PowerPoint / Google Slides (`editablePptxCompiler.ts`)**: 3-slide master deck (Slide 1: 1:1 Master Visual Twin, Slide 2: Decomposed Editable Vector Topology, Slide 3: Component Inventory Matrix).
- **Word / Google Docs (`editableDocxCompiler.ts`)**: 1-page widescreen landscape native OpenXML DrawingML (`<wpg:wgp>`) vector diagram with strict 4-layer back-to-front Z-ordering, `<a:noFill/>` transparent labels, pure vector service badges (`getServiceBadgeInfo`), and neighbor-clamped bottom labels (`minNeighborDist - 4`).

---

## 4. 🖼️ `infographic-1to1-vector-twin-and-sbs-parity` (Rule 43 Verification Protocol — `v2.7.0`)

### Purpose & Trigger Conditions
Triggered whenever creating, modifying, or auditing any canonical Infographic Blueprint (`#52` through `#66` in `src/lib/canonical/infographicBlueprints52to66.ts`, `src/lib/canonical/template52ContextHarnessLoopGraph.ts`), the 50/50 Side-by-Side Comparison view (`src/app/canonical/[id]/page.tsx`), `src/components/DiagramViewerRenderSafe.tsx`, or `src/lib/deepmindVisionDecompiler.ts`.

### Core 5-Step Engineering Protocol
1. **Native Pixel Canvas Lock**: Inspect the Reference PNG (`public/templates/52.png`..`66.png`) and set `dx`, `dy`, `pageWidth`, `pageHeight`, and `id="poster_bg"` `<mxGeometry>` to the exact native pixel dimensions (`1216x1504` for `#52`, `1075x1310` for `#53`, `886x1024` for `#54`, `855x1024` for `#55`, and `765x1024` for `#56`–`#66`).
2. **Hybrid Inline Vector `<svg>` + Editable `<mxCell vertex="1">` Architecture**: Render complex non-rectangular geometry (3D funnel trapezoids in `#57`, central triangle pyramid with overlapping icon badges in `#65`, 4-quadrant gradient torus ring with curved `<textPath>` arcs in `#66`, L-bracket pointers in `#61`, and cream grid paper `#FAF8F2`) as inline vector `<svg>` layers while keeping every card, title, pill badge, and table cell as a 100% editable `<mxCell vertex="1">`.
3. **Single-Escape `cleanSvg()` Invariant**: `cleanSvg()` already wraps its output in `esc()`. Never wrap `esc(cleanSvg(...))` a second time (`&amp;lt;div` / `&amp;lt;svg` is strictly banned).
4. **Zero-Inset Container & ViewBox Parity**: Ensure both `/canonical/[id]?sbs=1` panes share identical `inset-3` (`w-[calc(100%-24px)] h-[calc(100%-24px)]`) wrappers and `DiagramViewerRenderSafe.tsx` locks `pad = 0` on `id="poster_bg"`.
5. **One-by-One Side-by-Side Visual Verification & Quality Gate**:
   ```bash
   node scratch/capture_infographic_sbs.mjs && npm run quality-gate
   ```

---

## 5. 🧠 `5-tier-model-stack-and-universal-route-guard` (Unified 5-Tier AI Architecture — `v3.1.0`)

### Purpose & Trigger Conditions
Triggered whenever modifying `src/lib/geminiConfig.ts`, `server/services/geminiService.js`, `app/api/swarm/*`, `src/lib/geminiRouteGuard.ts`, or any AI generation/mutation API route.

### Canonical 5-Tier Google / Gemini / DeepMind Model Stack
1. **Tier 1: Omni 1.1 Master Orchestrator, Multi-Turn Video Synthesis & Multimodal Forensic Judge (`google-omni-1.1` / `models/gemini-omni-1.1-flash`)**
2. **Tier 2: Deep Architectural Reasoning, Creative Surpass Direction & Multimodal Vision (`models/gemini-3.1-pro-preview` / `models/gemini-2.5-pro`)**
3. **Tier 3: High-Throughput Sub-Second Structured JSON Compiler, YouTube Reference Deconstruction & Biometric Synthesis (`models/gemini-3.8-flash` / `models/gemini-2.5-flash` with `thinkingConfig: { thinkingBudget: 0 }`)**
4. **Tier 4: Real-Time Bidirectional & Sub-Second Interactive Streaming (`models/gemini-3.1-flash-live-preview`)**
5. **Tier 5: Native DeepMind Multimodal Media, Embeddings & Enterprise Mesh (`models/veo-3.1-generate-preview` • `models/lyria-3-pro-preview` • `models/lyria-3.5` • `models/imagen-3.0-generate-002` • `models/gemini-3.1-flash-image-preview` • `models/gemini-3.1-flash-tts-preview` • `gemini-embedding-001` • `text-embedding-005` • `BigQuery Property Graphs ISO GQL` • `Google ADK Sidecar` • `Gemini Data Analytics API` • `Google Cloud Model Armor`)**

### Core Invariants
- **Banned Legacy Models**: Zero hardcoded legacy or non-existent model strings (`gemini-3.7-flash`, `gemini-3.7-pro`, `gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.5-flash-preview-tts`, `gpt-4`, `gpt-4o`, `gpt-4o-mini`, `claude-opus-5`) in application route handlers or domain services.
- Every prompt-accepting endpoint must enforce the 4-category non-mutation conversational gate (`checkConversationalOrNonMutationIntent`).

---

## 6. 🏛️ `scorex-3-engine-maturity-and-forensic-governance` (ScoreX Enterprise Architecture — `v3.1.0`)

### Purpose & Trigger Conditions
Triggered whenever modifying ScoreX assessment routes, navigation (`client/src/components/GlobalNav.js`, `client/src/App.js`), backend assessment engines (`server/routes/dynamicAssessments.js`, `server/routes/valueRealization.js`, `server/routes/euAiAct.js`), or seed datasets (`server/index.js`, `db-sync/export-data.json`).

### Core 3-Engine Architecture Invariant
ScoreX consolidates all technical maturity, business value, and regulatory compliance workflows onto **3 Canonical Assessment Engines**:
1. **Engine 1: Dynamic Assessment Blueprints Engine** (`/assessments/custom-hub`, `/assessments/run/:typeId`, `/assessments/results/:id`) — Powers all 6 production maturity frameworks (`enterprise_data_ai_maturity`, `genai_rag_readiness`, `finops_cost_governance`, `cloud_migration_modernization`, `zero_trust_cyber_resilience`, `mlops_agentic_ai_governance`) plus infinite AI-generated custom blueprints via `Gemini 3.8 Flash` (`models/gemini-3.8-flash`) & `Gemini 3.1 Pro` (`models/gemini-3.1-pro-preview`).
2. **Engine 2: GE Value Realization Engine** (`/value-realization`) — 5-Column CFO Value Realization Matrix, 3-Horizon Roadmap, and ROI/TCO Value Bridge powered by `Gemini 3.1 Pro` (`models/gemini-3.1-pro-preview`).
3. **Engine 3: EU AI Act Statutory Compliance Engine** (`/eu-ai-act`) — Statutory Risk Pyramid (Art. 5, Art. 6/Annex III, Art. 50, Art. 51–55 GPAI) and Annex IV Technical Documentation generator powered by `Gemini 3.1 Pro` (`models/gemini-3.1-pro-preview`) and audited by `Google Omni 1.1` (`google-omni-1.1`).

---

## 7. 🎬 `zyvoriq-generative-cinema-and-music-video-swarm` (Zyvoriq 10-Agent Studio Architecture — `v3.1.0`)

### Purpose & Trigger Conditions
Triggered whenever modifying Zyvoriq studio workflows (`app/swarm-MUI/page.tsx`, `app/personas/page.tsx`, `components/LeftIconRail.tsx`), backend swarm routes (`app/api/swarm/*`), or multi-turn video/audio synthesis pipelines (`lib/swarm/*`).

### Core Zero-Hardcoding & Creative Surpass Architecture
1. **3-Stage Creative Surpass Compiler (`Deconstruct -> Elevate -> Surpass`)**:
   - Powered by `POST /api/swarm/synthesize-from-prompt` (`models/gemini-2.5-flash` with `thinkingBudget: 0` & `models/gemini-3.8-flash`).
   - Automatically detects YouTube URLs (`youtube.com/watch?v=...`, `youtu.be/...`, `youtube.com/shorts/...`), scrapes real title/channel/keywords/thumbnail, deconstructs the emotional hook, diagnoses 3 reference limitations, and synthesizes an original 8-dimension production bible + `CreativeElevationDossier` that surpasses the reference.
2. **4 Canonical Active API Routes (Zero Dead/Orphaned Routes)**:
   - `POST /api/swarm/synthesize-from-prompt`: 3-Stage Deconstruct $\rightarrow$ Elevate $\rightarrow$ Surpass 8-Dimension Prompt & YouTube Compiler.
   - `POST & GET /api/swarm/jobs`: Live 6-Turn `models/gemini-omni-1.1-flash` (`POST /v1beta/interactions`) + `models/lyria-3-pro-preview` (`POST /v1beta/models/lyria-3-pro-preview:generateContent`) 24/1 CFR 9:16 video & `-14.0 LUFS` 48kHz audio render pipeline.
   - `POST & GET /api/swarm/avatar-builder`: Custom Persona & Biometric Anchor Builder (`prompt` via `models/gemini-2.5-flash`, `upload` base64 to `public/assets/avatars/`, `url` download).
   - `GET /api/swarm/library`: Physically verified `.mp4` Master & Turn Asset Library (`fs.existsSync` + `size >= 10,000` bytes).
3. **3 Core Studio Workflows + `/personas` Biometric Hub**:
   - `create`: 4-Step Studio (`01. Story & Audio` $\rightarrow$ `02. Cast & Wardrobe` $\rightarrow$ `03. Storyboard (6)` $\rightarrow$ `04. Render & Export`).
   - `published`: Persistent Published Reels Library (`Play in Monitor`, `Load & Edit Shots`, `Export MP4`).
   - `wip`: Persistent Saved Drafts & Active Render Jobs (`zyvoriq_reels_repo_v2`).
   - `/personas`: 5-Tier Biometric Cast & Act I/II Wardrobe Continuity Hub (`zyvoriq_cast_matrix_v1` & `zyvoriq_dynamic_catalog_v1`).



```

---

## 3. Host Plugin Manifest (`plugin.json`)

```json
{
  "name": "zyvoriq_guard",
  "version": "3.1.0",
  "governance_epoch": "3.1.0",
  "description": "Zyvoriq Governance Plugin (v3.1.0 — Unified 5-Tier Google Omni 1.1 Flash, Gemini 3.1 Pro / 2.5 Pro / 3.8 Flash / 2.5 Flash / 3.1 Flash Live, DeepMind Veo 3.1, Lyria 3 Pro / 3.5, Imagen 3 & Neural TTS Architecture)",
  "hooks": "./hooks.json"
}

```

---

## 4. Zyvoriq Workspace Overview (`README.md`)

```markdown
# Zyvoriq — AI-Native Generative Cinema & Dance Music Video Swarm Platform (`v3.1.0`)

- **Governance Epoch**: `3.1.0` (synchronized across `AGENTS.md`, `hooks.json`, `plugin.json`, `skills.md`, and `README.md`)
- **Failure Mode**: `FAIL_CLOSED` (`unmatched_fallback.unknown_mutation_tool = "REJECT"`)
- **4-Tier Single Source of Truth (SSOT) Graph**:
  1. **Tier 1 — Normative Constitution (`AGENTS.md`)**: `/Users/nitinagga/.gemini/config/AGENTS.md` (mirrored at `${ZYVORIQ_ROOT}/AGENTS.md`, `${ZYVORIQ_ROOT}/GEMINI.md`, `${ZYVORIQ_ROOT}/CLAUDE.md`, & `${ZYVORIQ_ROOT}/.agents/AGENTS.md`)
  2. **Tier 2 — Executable Runtime Control Plane (`hooks.json`)**: `/Users/nitinagga/.gemini/config/hooks.json` (mirrored at `/Users/nitinagga/.gemini/config/plugins/zyvoriq_guard/hooks.json` & `${ZYVORIQ_ROOT}/.agents/hooks.json`)
  3. **Tier 3 — Host Plugin Manifest (`plugin.json`)**: `/Users/nitinagga/.gemini/config/plugins/zyvoriq_guard/plugin.json`
  4. **Tier 4 — Skills Registry (`skills.md`)**: `/Users/nitinagga/.gemini/config/skills.md` (mirrored at `${ZYVORIQ_ROOT}/skills.md`)

---

## 1. Canonical 5-Tier Google / Gemini / DeepMind Model Stack (`v3.1.0`)

1. **Tier 1 — Omni 1.1 Master Orchestrator, Multi-Turn Video Synthesis & Multimodal Forensic Judge**:
   - `google-omni-1.1` / `models/gemini-omni-1.1-flash` (`POST /v1beta/interactions`)
2. **Tier 2 — Deep Architectural Reasoning, Creative Surpass Direction & Multimodal Vision**:
   - `models/gemini-3.1-pro-preview` & `models/gemini-2.5-pro`
3. **Tier 3 — High-Throughput Sub-Second Structured JSON Compiler, YouTube Reference Deconstruction & Biometric Synthesis**:
   - `models/gemini-3.8-flash` & `models/gemini-2.5-flash` (`thinkingConfig: { thinkingBudget: 0 }`)
4. **Tier 4 — Real-Time Bidirectional & Sub-Second Interactive Streaming**:
   - `models/gemini-3.1-flash-live-preview`
5. **Tier 5 — Native DeepMind Multimodal Media, Audio, Image & Embeddings**:
   - **Video Synthesis**: `models/veo-3.1-generate-preview` & `models/gemini-omni-1.1-flash`
   - **Studio Music & Vocal Synthesis**: `models/lyria-3-pro-preview` & `models/lyria-3.5` (`48,000 Hz` stereo, `-14.0 LUFS`)
   - **Neural Speech & TTS**: `models/gemini-3.1-flash-tts-preview`
   - **8K Character & Keyframe Portraits**: `models/imagen-3.0-generate-002` & `models/gemini-3.1-flash-image-preview`
   - **Vector Embeddings**: `models/gemini-embedding-001` & `models/text-embedding-005`

---

## 2. Runtime Governance & Two-Stage Forensic Enforcer Chain

All studio workflows and render outputs are governed by the runtime `FAIL_CLOSED` hook pipeline:
- **Stage 1 — Deterministic Signal & Frame Prober**: `${ZYVORIQ_ROOT:-/Users/nitinagga/Documents/zyvoriq}/scripts/guards/universal_deterministic_output_auditor.mjs` performs deterministic `ffprobe`, `24/1` CFR, STFT spectrogram, optical flow, pixel-domain luma step velocity, cross-turn boundary PSNR (`[26.0, 42.0] dB`), and mouth-onset viseme sync (`r >= 0.72`) checks.
- **Stage 2 — Binding Final Multimodal Judge**: `Google Omni 1.1` (`models/gemini-omni-1.1-flash`) & `Gemini 3.1 Pro` (`models/gemini-3.1-pro-preview`) (`authority: BINDING_VETO`) evaluate Stage 1 telemetry and sign the cryptographic PASS/FAIL verdict receipt via `scripts/stop_quality_gate.mjs`.

---

## 3. Core Studio Workflows & Canonical API Endpoints (`Next.js 15` / `React 19` / `TypeScript 5`)

### 3.1 Studio Workflows (`app/swarm-MUI/page.tsx` & `app/personas/page.tsx`)
1. **Workflow 1 — 4-Step Dance Music Video & Generative Cinema Studio (`/swarm-MUI` -> `studio`)**:
   - **Step 1 (Prompt / YouTube URL & Creative Surpass Blueprint)**: Enter any natural language prompt or YouTube URL (`youtube.com/watch?v=...`, `youtu.be/...`, `youtube.com/shorts/...`). Runs the 3-Stage **Deconstruct $\rightarrow$ Elevate $\rightarrow$ Surpass** compiler to generate an original 8-dimension production bible and `CreativeElevationDossier` with zero hardcoded presets.
   - **Step 2 (Biometric Cast, Choreography & Acoustic Direction)**: Configure 5-tier ensemble casting, 8-count choreography, camera movement, and custom persona biometric anchors (`getDanceMusicVideoAgents({...})`).
   - **Step 3 (6-Turn Storyboard & Shot Inspector)**: Inspect and customize each 10.0s turn (`Act I 0:00–0:30` $\rightarrow$ `Act II 0:30–1:00`), preserving user shot edits via `customShotsRef`.
   - **Step 4 (Live 10-Agent Swarm Execution & Master Playback)**: Launches live `models/gemini-omni-1.1-flash` video turns + `models/lyria-3-pro-preview` 48kHz audio synthesis, stitches the `24/1` CFR `9:16` master `.mp4`, and persists results to `localStorage` (`zyvoriq_reels_repo_v2`).
2. **Workflow 2 — Published Reels & Verified Asset Library (`/swarm-MUI` -> `library`)**:
   - Browse, inspect, play back, download, or reload any physically verified `.mp4` master or turn asset (`size >= 10,000` bytes) directly into the 4-Step Studio.
3. **Workflow 3 — Drafts & Render Jobs Queue (`/swarm-MUI` -> `drafts`)**:
   - Manage saved draft storyboards (`Save Draft`), monitor active/completed/failed render jobs, and resume any draft in the 4-Step Studio in 1 click.
4. **Workflow 4 — Custom Persona & Biometric Anchor Builder (`/personas`)**:
   - Create and persist custom cast members via AI Biometric Prompt Synthesis (`models/gemini-2.5-flash`), local base64 photo upload (`public/assets/avatars/`), or external image URL import.

### 3.2 Canonical `/api/swarm/*` Endpoints
- `POST /api/swarm/synthesize-from-prompt` — 3-Stage (`Deconstruct -> Elevate -> Surpass`) 8-Dimension Prompt & YouTube Reference Compiler (`models/gemini-2.5-flash` / `models/gemini-3.8-flash`).
- `POST & GET /api/swarm/jobs` — Live 6-Turn `models/gemini-omni-1.1-flash` + `models/lyria-3-pro-preview` 24/1 CFR 9:16 Video & 48kHz Audio Render Engine.
- `POST & GET /api/swarm/avatar-builder` — Custom Persona & Biometric Anchor Builder (`prompt`, `upload`, `url`).
- `GET /api/swarm/library` — Physically Verified `.mp4` Master & Turn Asset Library.

---

## 4. Local & Dual-Machine Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Verify TypeScript compilation
./node_modules/.bin/tsc --noEmit

# Enforce single-source trinity across hooks.json, skills.md, and AGENTS.md
node scripts/guards/enforce_universal_single_source_trinity.mjs --auto-heal

# Run stop quality gate & deterministic forensic verification
echo '{"workspacePaths":["/Users/nitinagga/Documents/zyvoriq"],"terminationReason":"model_stop"}' | node scripts/stop_quality_gate.mjs
```

- **Portable Workspace Roots**:
  - Local Mac: `/Users/nitinagga/Documents/zyvoriq`
  - Cloudtop Linux (`nitinagga.c.googlers.com`): `/home/nitinagga/zyvoriq`

```

---

## 5. Rules Engine (`lib/rules_engine.mjs`)

```javascript
#!/usr/bin/env node
/**
 * ZYVORIQ RULES ENGINE (v6.1.0 - Single Canonical Source)
 * =======================================================
 * Loads and resolves active governance rules directly from:
 *   ~/.gemini/config/hooks.json (override: ZYVORIQ_HOOKS_PATH)
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export const CANONICAL_HOOKS_PATH =
  process.env.ZYVORIQ_HOOKS_PATH ||
  path.join(os.homedir(), ".gemini", "config", "hooks.json");

export const LEGACY_HOOKS_LOCATIONS = [
  ".gemini/hooks.json",
  ".agents/hooks.json",
  "hooks.json",
  "_agents/hooks.json",
  "plugins/zyvoriq_guard/hooks.json"
];

export class UngovernedProjectError extends Error {
  constructor(cwd) {
    super(
      `UNGOVERNED_PROJECT: no path_matcher in ${CANONICAL_HOOKS_PATH} binds "${cwd}". ` +
        `global_governance.unmatched_fallback.action=REJECT -> refusing to run ungoverned.`
    );
    this.name = "UngovernedProjectError";
    this.code = "UNGOVERNED_PROJECT";
  }
}

const DEFAULTS = {
  ban_stream_loop: true,
  ban_identical_shot_image_conditioning: true,
  require_sequential_tail_frame_chaining: true,
  require_preflight_audio_vocal_timestamp_extraction: true,
  ban_singing_prompts_during_instrumental_intros: true,
  ban_native_audio_stripping_on_singing_shots: true,
  ban_detached_still_frame_lipsync_audits: true,
  require_multimodal_audio_visual_lipsync_gate: true,
  max_cross_shot_initial_frame_psnr: 25.0,
  max_vocal_bed_volume: 0.20,
  biometric_anchor_threshold: 0.05,
  zero_silence_required: true,
  require_lyria_master_soundtrack: true,
  enforce_vocal_gender_alignment: true,
  require_faststart_and_yuv420p: true,
  ban_cross_gender_conditioning_morph: true,
  ban_inappropriate_water_scene_wardrobe: true,
  enforce_ensemble_biometric_differentiation: true,
  ban_ensemble_group_vocal_bleed: true,
  require_active_vocal_lip_sync_on_singing_shots: true,
  ban_frozen_lips_during_vocal_sections: true,
  require_acoustic_viseme_timeline_alignment: true,
  ban_forced_mouth_sealing_on_vocal_anchors: true,
  ban_prompt_contradictions_and_open_mouth_tokens: true,
  ban_open_mouth_visemes_in_non_vocal_scenes: true,
  ban_smile_dilution_in_singing_prompts: true,
  require_path_b_acoustic_lyric_snapping: true,
  ban_stale_shot_cache_reuse_on_prompt_update: true,
  ban_open_mouth_tokens_in_character_anchors: true,
  require_acoustic_neural_latency_adelay_calibration: true,
  ban_certification_tampering: true,
  ban_arbitrary_fixed_duration_mv_assembly: true,
  ban_unvalidated_cached_take_reuse: true,
  require_in_take_viseme_cadence_audit: true,
  ban_concat_source_take_deduplication: true,
  require_preflight_audio_groundtruth_transcription: true,
  require_model_execution_order: true,
  require_strict_1x_playback_speed_no_setpts_distortion: true,
  forensic_auditor_and_judge_model: "Google Omni 1.1 (models/gemini-omni-1.1-flash & models/gemini-3.1-pro-preview)",
  require_omni_1_1_forensic_judge_verdict: true
};

function applyAliases(rules) {
  const out = { ...rules };

  if (out.isolated_vocal_bed_mix_volume !== undefined && out.max_vocal_bed_volume === undefined) {
    out.max_vocal_bed_volume = out.isolated_vocal_bed_mix_volume;
  }

  const p = out.psnr_quality_gate;
  if (p && typeof p === "object") {
    if (p.min_sequential_tail_frame_psnr !== undefined) out.min_sequential_tail_frame_psnr = p.min_sequential_tail_frame_psnr;
    if (p.max_sequential_tail_frame_psnr !== undefined) out.max_sequential_tail_frame_psnr = p.max_sequential_tail_frame_psnr;
    if (p.min_hard_scene_cut_psnr_difference !== undefined) out.min_hard_scene_cut_psnr_difference = p.min_hard_scene_cut_psnr_difference;
  }

  // Never disable ban_prompt_contradictions_and_open_mouth_tokens when dynamic visemes are allowed;
  // Rule 20 specifically prevents coupling "mouth closed" with "laughing/cheering" in the same prompt.
  if (out.viseme_token_isolation_scope === "append_to_dynamic_motion_prompt_only") {
    out.ban_open_mouth_tokens_in_character_anchors = true;
  }

  if (out.suppress_omni_native_video_audio === true) {
    out.ban_native_audio_stripping_on_singing_shots = true;
  }

  return out;
}

function pathCandidates(absDir) {
  const norm = path.resolve(absDir).replace(/\\/g, "/").toLowerCase();
  const segs = norm.split("/").filter(Boolean);
  const out = new Set([norm, norm.replace(/^\//, "")]);
  for (let i = 0; i < segs.length; i++) out.add(segs.slice(i).join("/"));
  return [...out];
}

function matcherHits(matcher, candidates) {
  const m = String(matcher);
  if (!/[\^\$\(\)\[\]\*\+\?\\|]/.test(m)) {
    const lower = m.toLowerCase();
    return candidates.some((c) => c.includes(lower));
  }
  let re;
  try {
    re = new RegExp(m, "i");
  } catch {
    return false;
  }
  return candidates.some((c) => re.test(c));
}

export function findHooksConfig() {
  return fs.existsSync(CANONICAL_HOOKS_PATH) ? CANONICAL_HOOKS_PATH : null;
}

export function detectShadowConfigs(startDir = process.cwd()) {
  const shadows = [];
  let dir = path.resolve(startDir);
  for (let i = 0; i < 8; i++) {
    for (const rel of LEGACY_HOOKS_LOCATIONS) {
      const p = path.join(dir, rel);
      try {
        const st = fs.lstatSync(p);
        if (st.isFile()) shadows.push(p);
      } catch {}
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return shadows;
}

export function resolveProject(startDir = process.cwd(), cfg = null) {
  const configPath = findHooksConfig();
  if (!configPath) return null;
  if (!cfg) {
    try {
      cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch {
      return null;
    }
  }
  const candidates = pathCandidates(startDir);
  const entries = Object.entries(cfg.projects || {}).sort(
    (a, b) => (a[1].priority ?? 99) - (b[1].priority ?? 99)
  );

  for (const [name, proj] of entries) {
    const matchers = [...(proj.path_matchers || []), ...(proj.path_matchers_regex || [])];
    if (matchers.some((m) => matcherHits(m, candidates))) return { name, proj };
  }
  if (cfg.projects?.zyvoriq) {
    return { name: "zyvoriq", proj: cfg.projects.zyvoriq };
  }
  return null;
}

export { DEFAULTS };

export function loadRules(startDir = process.cwd()) {
  const configPath = findHooksConfig();
  if (!configPath) return applyAliases({ ...DEFAULTS });
  const cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const hit = resolveProject(startDir, cfg);
  if (!hit) {
    return applyAliases({ ...DEFAULTS });
  }
  return applyAliases({ ...DEFAULTS, ...(hit.proj.rules || {}) });
}


```
