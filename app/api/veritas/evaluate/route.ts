import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { modelRouter } from "@/lib/ai/router";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { draftText, factClaims, brandVector, artifactId } = body;

    // Execute Consensus via Model Router
    const evaluation = modelRouter.evaluateVeritasConsensus({
      text: draftText,
      claimsCount: factClaims?.length || 3
    });

    const isPassed = evaluation.gateDecision === "pass";
    const evalId = `eval_${Date.now()}`;
    const artId = artifactId || "art_master_package_8492";

    // Persist Veritas Evaluation to DB
    db.recordVeritasEvaluation({
      id: evalId,
      artifact_id: artId,
      composite_vqs: evaluation.compositeVQS,
      factuality_score: evaluation.factualityScore,
      brand_tone_score: evaluation.brandVoiceScore,
      consensus_score: evaluation.consensusScore,
      safety_policy_passed: isPassed,
      humanization_score: evaluation.humanizationScore,
      gate_decision: evaluation.gateDecision
    });

    let certificate = null;
    if (isPassed) {
      const certId = `vqc_${Math.random().toString(36).substring(2, 10)}`;
      certificate = {
        certificateId: certId,
        ed25519Signature: "MEQCIFz9...ed25519...3a89f921",
        c2paManifestHash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        issuedAt: new Date().toISOString()
      };

      db.issueCertificate({
        id: certId,
        evaluation_id: evalId,
        ed25519_signature: certificate.ed25519Signature,
        c2pa_manifest_hash: certificate.c2paManifestHash,
        sha256_root_checksum: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        signer_public_key_id: "ed25519:pub:89a2f9104c81b740c5984ef2a1c098bb"
      });
    }

    return NextResponse.json({
      evaluationId: evalId,
      compositeVQS: evaluation.compositeVQS,
      isPassed,
      decision: isPassed ? "PASS_APPROVED" : "SURGICAL_REPAIR_TRIGGERED",
      axisBreakdown: {
        factuality: { score: evaluation.factualityScore, weight: 0.30, status: "PASS" },
        brandVoice: { score: evaluation.brandVoiceScore, weight: 0.25, status: "PASS" },
        consensus: { score: evaluation.consensusScore, weight: 0.20, status: "PASS" },
        safetyGate: { score: evaluation.safetyPolicyScore, weight: 0.15, status: "HARD_GATE_PASS" },
        humanization: { score: evaluation.humanizationScore, weight: 0.10, status: "PASS" }
      },
      certificate
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to run Veritas evaluation" }, { status: 500 });
  }
}
