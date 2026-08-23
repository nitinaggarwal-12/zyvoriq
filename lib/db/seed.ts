import { db, getDatabase } from "./client";

export function seedDatabase() {
  console.log("🌱 Pre-seeding Zyvoriq Database (dev.db)...");
  
  // 1. Seed Tenant
  const orgId = "org_enterprise_core";
  db.createOrganization({
    id: orgId,
    name: "Zyvoriq Global Technologies",
    plan_tier: "enterprise",
    spending_limit_usd: 10000.0,
  });

  // 2. Seed Workspaces
  const ws1 = "ws_tech_eng";
  db.createWorkspace({
    id: ws1,
    org_id: orgId,
    name: "Engineering-First Authority",
    slug: "engineering-first",
    brand_vector: Array(1536).fill(0.05),
    autonomy_level: "auto",
  });

  const ws2 = "ws_exec_brief";
  db.createWorkspace({
    id: ws2,
    org_id: orgId,
    name: "Executive Briefing Persona",
    slug: "executive-briefing",
    brand_vector: Array(1536).fill(0.08),
    autonomy_level: "copilot",
  });

  // 3. Seed Swarm Runs
  const runId = "run_8492_quantum";
  db.createSwarmRun({
    id: runId,
    workspace_id: ws1,
    concept_prompt: "Synthesize a multimodal technical launch package for Quantum-Resistant PostgreSQL Engine.",
    dag_state: {
      step: 4,
      total_agents: 9,
      completed: ["Director", "Research", "Scripting", "Code"],
      running: ["Video", "Audio", "Veritas"],
    },
  });

  // 4. Seed Task & Modality Artifact
  const taskId = "task_8492_video";
  db.createTask({
    id: taskId,
    swarm_run_id: runId,
    agent_role: "Cinematic Video Agent",
    model_engine: "google-veo-2",
  });

  const artifactId = "art_master_package_8492";
  db.createArtifact({
    id: artifactId,
    task_id: taskId,
    modality: "video",
    storage_s3_url: "s3://zyvoriq-vault/quantum_launch_4k.mp4",
  });

  // 5. Seed Veritas Evaluation & Certificate
  const evalId = "eval_8492_vqs";
  db.recordVeritasEvaluation({
    id: evalId,
    artifact_id: artifactId,
    composite_vqs: 94.6,
    factuality_score: 96.0,
    brand_tone_score: 92.5,
    consensus_score: 95.0,
    safety_policy_passed: true,
    humanization_score: 91.0,
    gate_decision: "pass",
  });

  db.issueCertificate({
    id: "vqc_89f3a12ce94",
    evaluation_id: evalId,
    ed25519_signature: "MEQCIFz9...ed25519...3a89f921",
    c2pa_manifest_hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sha256_root_checksum: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    signer_public_key_id: "ed25519:pub:89a2f9104c81b740c5984ef2a1c098bb",
  });

  console.log("✓ Successfully pre-seeded Organizations, Workspaces, Swarm Runs & Veritas VQC Certificates!");
}

seedDatabase();
