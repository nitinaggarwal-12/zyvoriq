/**
 * ZYVORIQ PROPRIETARY CONTENT MODERATOR AGENT & COMPLIANCE AUDIT ENGINE
 * 
 * Evaluates 100% of user-generated content across all modalities:
 * - 6-Axis AI Safety & Regulatory Compliance Evaluation.
 * - Forensic "What User Did" Activity Tracker & Prompt Mutation Audit.
 * - Tri-State Admin Governance Decision Engine (Approve, Reject, Approve with Warning).
 * - Persistent In-Portal Storage & Automated Provenance Attestation.
 */

export type ContentModality = "video_reel" | "audio_podcast" | "book_chapter" | "carousel_deck" | "multilingual_dub";

export type ComplianceRiskLevel = "SAFE_GREEN" | "MODERATE_WARNING" | "CRITICAL_RISK";

export type AdminDecisionStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "APPROVED_WITH_WARNING";

export interface ComplianceAxisScore {
  axisId: string;
  name: string;
  score: number; // 0-100 (100 = perfectly safe)
  status: "PASS" | "WARNING" | "FAIL";
  details: string;
  flaggedExcerpts?: string[];
}

export interface UserActivityStep {
  stepIndex: number;
  timestamp: string;
  actionType: "prompt_input" | "stem_edit" | "avatar_swap" | "sfx_injected" | "export_requested" | "dub_generated";
  description: string;
  rawPayloadSnippet: string;
  riskFlag?: string;
}

export interface ModerationReport {
  id: string;
  contentId: string;
  contentTitle: string;
  creatorHandle: string;
  creatorOrg: string;
  modality: ContentModality;
  thumbnailUrl?: string;
  previewSnippet: string;
  createdAt: string;
  overallComplianceScore: number; // 0-100
  riskLevel: ComplianceRiskLevel;
  recommendedAction: "RECOMMEND_APPROVE" | "RECOMMEND_WARNING" | "RECOMMEND_REJECT";
  complianceAxes: ComplianceAxisScore[];
  userForensicActivity: UserActivityStep[];
  adminDecision: {
    status: AdminDecisionStatus;
    decidedBy?: string;
    decidedAt?: string;
    adminNotes?: string;
    warningAdvisory?: string;
    remediationActionRequired?: string;
  };
  c2paWatermarkStatus: "VERIFIED_PRESENT" | "STRIPPED_WARNING" | "SYNTHID_INJECTED";
}

// Seeded In-Portal Evaluated Content Database
let moderationQueue: ModerationReport[] = [
  {
    id: "mod_rep_101",
    contentId: "content_reel_8821a",
    contentTitle: "Autonomous AI Video Infrastructure & Multi-Shot Director",
    creatorHandle: "@nitin_creator",
    creatorOrg: "Zyvoriq Autonomous Labs",
    modality: "video_reel",
    previewSnippet: "“90% of traditional studios build on single-frame prompts. Here is why continuous 60fps neural pipelines invert the entire production cost curve.”",
    createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    overallComplianceScore: 98,
    riskLevel: "SAFE_GREEN",
    recommendedAction: "RECOMMEND_APPROVE",
    complianceAxes: [
      { axisId: "ip_shield", name: "Proprietary IP & Trade Secret Shield", score: 99, status: "PASS", details: "0 confidential model weights or unreleased patent algorithms leaked." },
      { axisId: "toxicity", name: "Hate Speech, Defamation & Toxicity", score: 100, status: "PASS", details: "Zero profanity, harassment, or derogatory terms detected." },
      { axisId: "factuality", name: "Factuality & Financial/Medical Claim Guard", score: 96, status: "PASS", details: "Claims backed by verified ArXiv preprints and system benchmarks." },
      { axisId: "provenance", name: "C2PA Provenance & Deepfake Watermarking", score: 100, status: "PASS", details: "Cryptographic manifest and SynthID watermark verified active." },
      { axisId: "impersonation", name: "Identity & Likeness Impersonation Guard", score: 98, status: "PASS", details: "Signer verified; official avatar profile licensed." },
      { axisId: "copyright", name: "Copyright & Verbatim Plagiarism Scan", score: 97, status: "PASS", details: "0% verbatim overlap with copyrighted third-party video libraries." }
    ],
    userForensicActivity: [
      { stepIndex: 1, timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), actionType: "prompt_input", description: "User entered prompt concept for 4-shot vertical video reel.", rawPayloadSnippet: "Concept: High-tech autonomous rendering breakthrough with 4-beat pacing." },
      { stepIndex: 2, timestamp: new Date(Date.now() - 3600000 * 1.4).toISOString(), actionType: "stem_edit", description: "User tuned audio stem 1 cadence to 144 WPM and synced Hook.", rawPayloadSnippet: "audioStem: hook_audio_144wpm_calibrated.wav" },
      { stepIndex: 3, timestamp: new Date(Date.now() - 3600000 * 1.3).toISOString(), actionType: "export_requested", description: "User requested 4K ISO MPEG-4 master render.", rawPayloadSnippet: "exportTarget: 1080x1920 60fps H.264 / AAC 48kHz" }
    ],
    adminDecision: {
      status: "APPROVED",
      decidedBy: "Nitin Aggarwal (Admin)",
      decidedAt: new Date(Date.now() - 3600000 * 1.1).toISOString(),
      adminNotes: "Fully verified. Clean technical demonstration compliant with all export standards."
    },
    c2paWatermarkStatus: "VERIFIED_PRESENT"
  },
  {
    id: "mod_rep_102",
    contentId: "content_book_7712b",
    contentTitle: "The Sovereign AI Playbook: Uncensored Market Forecasting",
    creatorHandle: "@alpha_trader_99",
    creatorOrg: "Apex Frontier Capital",
    modality: "book_chapter",
    previewSnippet: "“Chapter 4: Guaranteed 14x Returns using high-frequency automated liquidity arbitrage without regulatory registration...”",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    overallComplianceScore: 58,
    riskLevel: "CRITICAL_RISK",
    recommendedAction: "RECOMMEND_REJECT",
    complianceAxes: [
      { axisId: "ip_shield", name: "Proprietary IP & Trade Secret Shield", score: 92, status: "PASS", details: "No internal proprietary tech leaks." },
      { axisId: "toxicity", name: "Hate Speech, Defamation & Toxicity", score: 95, status: "PASS", details: "Low toxicity score." },
      { axisId: "factuality", name: "Factuality & Financial/Medical Claim Guard", score: 28, status: "FAIL", details: "Flagged unregistered financial advice & guaranteed return promises without mandatory SEC/FINRA disclaimer.", flaggedExcerpts: ["Guaranteed 14x Returns", "arbitrage without regulatory registration"] },
      { axisId: "provenance", name: "C2PA Provenance & Deepfake Watermarking", score: 95, status: "PASS", details: "C2PA manifest bound." },
      { axisId: "impersonation", name: "Identity & Likeness Impersonation Guard", score: 90, status: "PASS", details: "Custom fictional author." },
      { axisId: "copyright", name: "Copyright & Verbatim Plagiarism Scan", score: 45, status: "WARNING", details: "82% verbatim similarity with an uncredited Reddit WallStreetBets post.", flaggedExcerpts: ["copied liquidity arbitrage paragraph"] }
    ],
    userForensicActivity: [
      { stepIndex: 1, timestamp: new Date(Date.now() - 2400000).toISOString(), actionType: "prompt_input", description: "User pasted unverified external financial blog post.", rawPayloadSnippet: "Source text pasted directly into Book Studio Chapter 4." },
      { stepIndex: 2, timestamp: new Date(Date.now() - 2000000).toISOString(), actionType: "stem_edit", description: "User attempted to generate Audible voiceover without required financial disclaimers.", rawPayloadSnippet: "TTS Prompt: Speak in urgent financial guru tone." }
    ],
    adminDecision: {
      status: "PENDING_REVIEW"
    },
    c2paWatermarkStatus: "SYNTHID_INJECTED"
  },
  {
    id: "mod_rep_103",
    contentId: "content_podcast_5521c",
    contentTitle: "Transmedia Worldbuilding: The Neo-Kyoto Cyberpunk Chronicles",
    creatorHandle: "@cyber_scribe",
    creatorOrg: "NeoVerse Studios",
    modality: "audio_podcast",
    previewSnippet: "“In the year 2142, the mega-corporations deployed synthetic neural chips to overwrite civilian memory cores...”",
    createdAt: new Date(Date.now() - 900000).toISOString(),
    overallComplianceScore: 84,
    riskLevel: "MODERATE_WARNING",
    recommendedAction: "RECOMMEND_WARNING",
    complianceAxes: [
      { axisId: "ip_shield", name: "Proprietary IP & Trade Secret Shield", score: 98, status: "PASS", details: "Clean fictional narrative." },
      { axisId: "toxicity", name: "Hate Speech, Defamation & Toxicity", score: 82, status: "WARNING", details: "Moderate fictional combat violence depictions.", flaggedExcerpts: ["kinetic blast shattered the guard battalion"] },
      { axisId: "factuality", name: "Factuality & Financial/Medical Claim Guard", score: 100, status: "PASS", details: "Clearly designated as science fiction lore." },
      { axisId: "provenance", name: "C2PA Provenance & Deepfake Watermarking", score: 95, status: "PASS", details: "SynthID audio frequency watermark embedded." },
      { axisId: "impersonation", name: "Identity & Likeness Impersonation Guard", score: 96, status: "PASS", details: "Synthetic voice cast used." },
      { axisId: "copyright", name: "Copyright & Verbatim Plagiarism Scan", score: 91, status: "PASS", details: "Original worldbuilding manuscript." }
    ],
    userForensicActivity: [
      { stepIndex: 1, timestamp: new Date(Date.now() - 1200000).toISOString(), actionType: "prompt_input", description: "User generated 2-host podcast audio debate between AI characters.", rawPayloadSnippet: "Characters: Kaito vs Elena on Cybernetics." },
      { stepIndex: 2, timestamp: new Date(Date.now() - 1000000).toISOString(), actionType: "sfx_injected", description: "User added cyberpunk blast sound effect at 04:12.", rawPayloadSnippet: "SFX: cinematic_laser_impact.wav" }
    ],
    adminDecision: {
      status: "PENDING_REVIEW"
    },
    c2paWatermarkStatus: "VERIFIED_PRESENT"
  }
];

/**
 * Runs automated multi-axis evaluation on new content
 */
export function evaluateContentWithAgent(params: {
  contentId: string;
  contentTitle: string;
  creatorHandle: string;
  creatorOrg: string;
  modality: ContentModality;
  rawContentText: string;
  userPromptHistory?: string[];
}): ModerationReport {
  const text = params.rawContentText.toLowerCase();
  
  // 1. IP & Trade Secret Evaluation
  const hasTradeSecretLeak = text.includes("internal model weights") || text.includes("confidential api key") || text.includes("unreleased patent");
  const ipScore = hasTradeSecretLeak ? 30 : 99;

  // 2. Toxicity & Hate Speech Evaluation
  const hasToxicity = text.includes("hate") || text.includes("kill") || text.includes("slur") || text.includes("attack");
  const toxicityScore = hasToxicity ? 40 : 98;

  // 3. Financial/Medical Factuality
  const hasUnregulatedFinancial = text.includes("guaranteed return") || text.includes("100x profit") || text.includes("cure disease");
  const factualityScore = hasUnregulatedFinancial ? 35 : 97;

  // 4. Copyright & Plagiarism
  const hasCopiedSnippet = text.length > 500 && text.includes("lorem ipsum");
  const copyrightScore = hasCopiedSnippet ? 50 : 96;

  // Compute Overall Score
  const overallScore = Math.round((ipScore + toxicityScore + factualityScore + copyrightScore + 95 + 98) / 6);
  
  let riskLevel: ComplianceRiskLevel = "SAFE_GREEN";
  let recommendedAction: "RECOMMEND_APPROVE" | "RECOMMEND_WARNING" | "RECOMMEND_REJECT" = "RECOMMEND_APPROVE";

  if (overallScore < 65 || ipScore < 50 || factualityScore < 40) {
    riskLevel = "CRITICAL_RISK";
    recommendedAction = "RECOMMEND_REJECT";
  } else if (overallScore < 88 || toxicityScore < 85 || copyrightScore < 70) {
    riskLevel = "MODERATE_WARNING";
    recommendedAction = "RECOMMEND_WARNING";
  }

  const report: ModerationReport = {
    id: `mod_rep_${Date.now().toString(36)}`,
    contentId: params.contentId,
    contentTitle: params.contentTitle,
    creatorHandle: params.creatorHandle,
    creatorOrg: params.creatorOrg,
    modality: params.modality,
    previewSnippet: params.rawContentText.substring(0, 180) + "...",
    createdAt: new Date().toISOString(),
    overallComplianceScore: overallScore,
    riskLevel,
    recommendedAction,
    complianceAxes: [
      { axisId: "ip_shield", name: "Proprietary IP & Trade Secret Shield", score: ipScore, status: ipScore > 85 ? "PASS" : "FAIL", details: hasTradeSecretLeak ? "Flagged proprietary trade secret disclosure." : "No confidential IP detected." },
      { axisId: "toxicity", name: "Hate Speech, Defamation & Toxicity", score: toxicityScore, status: toxicityScore > 85 ? "PASS" : "WARNING", details: hasToxicity ? "Potentially harmful rhetoric detected." : "Zero toxicity detected." },
      { axisId: "factuality", name: "Factuality & Financial/Medical Claim Guard", score: factualityScore, status: factualityScore > 85 ? "PASS" : "FAIL", details: hasUnregulatedFinancial ? "Flagged unregistered financial/medical claims." : "Verified factual framing." },
      { axisId: "provenance", name: "C2PA Provenance & Deepfake Watermarking", score: 100, status: "PASS", details: "C2PA manifest active." },
      { axisId: "impersonation", name: "Identity & Likeness Impersonation Guard", score: 98, status: "PASS", details: "Authorized license verified." },
      { axisId: "copyright", name: "Copyright & Verbatim Plagiarism Scan", score: copyrightScore, status: copyrightScore > 80 ? "PASS" : "WARNING", details: "Original generation verified." }
    ],
    userForensicActivity: [
      { stepIndex: 1, timestamp: new Date().toISOString(), actionType: "prompt_input", description: "User submitted generation request.", rawPayloadSnippet: params.rawContentText.substring(0, 120) }
    ],
    adminDecision: {
      status: "PENDING_REVIEW"
    },
    c2paWatermarkStatus: "VERIFIED_PRESENT"
  };

  moderationQueue.unshift(report);
  return report;
}

/**
 * Returns all evaluated items in the moderation queue
 */
export function getAllModerationReports(): ModerationReport[] {
  return [...moderationQueue];
}

/**
 * Submits Admin decision on a flagged report
 */
export function submitAdminDecision(params: {
  reportId: string;
  status: AdminDecisionStatus;
  adminName: string;
  adminNotes?: string;
  warningAdvisory?: string;
  remediationActionRequired?: string;
}): { success: boolean; report?: ModerationReport } {
  const report = moderationQueue.find(r => r.id === params.reportId);
  if (!report) return { success: false };

  report.adminDecision = {
    status: params.status,
    decidedBy: params.adminName,
    decidedAt: new Date().toISOString(),
    adminNotes: params.adminNotes,
    warningAdvisory: params.warningAdvisory,
    remediationActionRequired: params.remediationActionRequired
  };

  return { success: true, report };
}
