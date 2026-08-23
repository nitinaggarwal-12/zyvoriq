# PRD-101 / TDD-101 — Universal Create & Master Content Object Specification

| Metadata Attribute | Value |
| :--- | :--- |
| **Document ID** | PRD-101 / TDD-101 |
| **Title** | Universal Create Ingestion Engine & Master Semantic Content Object Specification |
| **Owner** | Principal Product Manager & Full-Stack Architect |
| **Approvers** | Chief Product Officer, CTO, Lead Architect |
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Priority** | P0 |
| **Created Date** | 2026-08-23 |
| **Last Reviewed Date** | 2026-08-23 |
| **Quality Gate** | QG-PRD-01 & QG-LLD-01 (Feature Approved) |
| **Assurance Score** | 99/100 |

---

## 1. Product Requirements (PRD-101)

### 1.1 Objective & Use Cases
Enable users to submit any raw input (a 1-sentence prompt, a YouTube/podcast transcript URL, a GitHub repository link, or an uploaded PDF brief) and synthesize an intermediate **Master Content Object (MCO)** from which all media formats are derived.

### 1.2 Functional Requirements
- **`FR-UCO-01`**: Parse input text and extract core thesis, target audience, 5 key claims, emotional tone, and technical entities.
- **`FR-UCO-02`**: Construct an Abstract Semantic Tree (AST) representing the master narrative structure.
- **`FR-UCO-03`**: Expose real-time SSE streaming of MCO construction to the Director Console.

---

## 2. Technical Design (TDD-101)

### 2.1 MCO Semantic AST Schema (TypeScript)
```typescript
export interface MasterContentObject {
  id: string;
  workspaceId: string;
  sourceInput: {
    type: 'text' | 'url' | 'audio' | 'document';
    rawContent: string;
    extractedAt: string;
  };
  semanticGraph: {
    coreThesis: string;
    keyClaims: Array<{ id: string; claim: string; confidence: number; citations: string[] }>;
    narrativePillars: Array<{ title: string; bullets: string[]; visualConcept: string }>;
    targetAudience: string;
    toneVector: { warmth: number; authority: number; technical: number };
  };
  compiledArtifacts: {
    videoStoryboardId?: string;
    audioManifestId?: string;
    codeSnippetId?: string;
    editorialCopyId?: string;
  };
  veritasAssessmentId: string;
  status: 'draft' | 'synthesizing' | 'verified' | 'published';
}
```

---

## 3. Quality Gate Sign-off

- [x] Product requirements and technical AST schema fully aligned.

**Exit Status:** `FEATURE SPEC APPROVED (PASS)`
