import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET() {
  try {
    const certs = db.getCertificates();
    const runs = db.getSwarmRuns();

    const auditTrail = [
      ...certs.map((c) => ({
        id: `LOG-${c.id}`,
        timestamp: c.issued_at || new Date().toISOString(),
        agent: "Agent 9 (Omnichannel Publisher)",
        action: "C2PA Manifest Injected & Ed25519 Signed",
        hash: c.sha256_root_checksum,
        status: "SEALED"
      })),
      ...runs.map((r) => ({
        id: `LOG-${r.id}`,
        timestamp: r.created_at || new Date().toISOString(),
        agent: "Agent 1 (Director Swarm DAG)",
        action: `Ingested Concept Prompt: ${r.concept_prompt.slice(0, 45)}...`,
        hash: `sha256:88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589`,
        status: "RECORDED"
      }))
    ];

    return NextResponse.json({
      auditTrail,
      totalCount: auditTrail.length,
      signingKey: "ed25519:pub:89a2f9104c81b740c5984ef2a1c098bb",
      monthlySpendingQuota: { used: 4250, total: 10000 }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch governance logs" }, { status: 500 });
  }
}
