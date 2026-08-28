import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { SQLITE_SCHEMA } from "./schema";
import { CANONICAL_SERIES_TRACKS } from "@/lib/tier6/default_tracks";
import type { 
  Organization, 
  Workspace, 
  UserRBAC, 
  PersonaMemory, 
  SwarmRun, 
  SwarmTask, 
  GroundingClaim, 
  ModalityArtifact, 
  VeritasEvaluation, 
  VeritasCertificate,
  PublishDispatch
} from "./types";

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    try {
      const dbPath = path.resolve(process.cwd(), "dev.db");
      dbInstance = new DatabaseSync(dbPath);
      dbInstance.exec("PRAGMA foreign_keys = ON;");
      dbInstance.exec("PRAGMA journal_mode = WAL;");
      dbInstance.exec(SQLITE_SCHEMA);
    } catch (err) {
      try {
        const tmpPath = path.resolve("/tmp", "zyvoriq.db");
        dbInstance = new DatabaseSync(tmpPath);
        dbInstance.exec("PRAGMA foreign_keys = ON;");
        dbInstance.exec("PRAGMA journal_mode = WAL;");
        dbInstance.exec(SQLITE_SCHEMA);
      } catch (e2) {
        dbInstance = new DatabaseSync(":memory:");
        dbInstance.exec("PRAGMA foreign_keys = ON;");
        dbInstance.exec(SQLITE_SCHEMA);
      }
    }
  }
  return dbInstance;
}

// Cosine Distance Helper for 1536-dim embeddings
export function cosineDistance(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 1.0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 1.0;
  return 1 - (dot / (Math.sqrt(normA) * Math.sqrt(normB)));
}

// Repository Methods
export const db = {
  // Organizations
  createOrganization(org: { id: string; name: string; plan_tier?: string; spending_limit_usd?: number }): void {
    const database = getDatabase();
    const stmt = database.prepare(`
      INSERT INTO organizations (id, name, plan_tier, spending_limit_usd)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name = excluded.name;
    `);
    stmt.run(org.id, org.name, org.plan_tier || "pro", org.spending_limit_usd || 1000.0);
  },

  getOrganizations(): Organization[] {
    const database = getDatabase();
    const stmt = database.prepare("SELECT * FROM organizations ORDER BY created_at DESC");
    return stmt.all() as unknown as Organization[];
  },

  // Workspaces
  createWorkspace(ws: { id: string; org_id: string; name: string; slug: string; brand_vector?: number[]; autonomy_level?: string }): void {
    const database = getDatabase();
    const stmt = database.prepare(`
      INSERT INTO workspaces (id, org_id, name, slug, brand_vector, autonomy_level)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name = excluded.name;
    `);
    stmt.run(
      ws.id, 
      ws.org_id, 
      ws.name, 
      ws.slug, 
      JSON.stringify(ws.brand_vector || []), 
      ws.autonomy_level || "auto"
    );
  },

  getWorkspaces(orgId?: string): Workspace[] {
    const database = getDatabase();
    const stmt = orgId 
      ? database.prepare("SELECT * FROM workspaces WHERE org_id = ? ORDER BY created_at DESC")
      : database.prepare("SELECT * FROM workspaces ORDER BY created_at DESC");
    
    const rows = (orgId ? stmt.all(orgId) : stmt.all()) as any[];
    return rows.map((r) => ({
      ...r,
      brand_vector: JSON.parse(r.brand_vector || "[]"),
      cliche_blacklist: JSON.parse(r.cliche_blacklist || "[]"),
    }));
  },

  // Swarm Runs
  createSwarmRun(run: { id: string; workspace_id: string; concept_prompt: string; dag_state?: any }): void {
    const database = getDatabase();
    const stmt = database.prepare(`
      INSERT INTO swarm_runs (id, workspace_id, concept_prompt, dag_state, status, total_cost_usd)
      VALUES (?, ?, ?, ?, 'queued', 0.0)
      ON CONFLICT(id) DO UPDATE SET concept_prompt = excluded.concept_prompt;
    `);
    stmt.run(run.id, run.workspace_id, run.concept_prompt, JSON.stringify(run.dag_state || {}));
  },

  getSwarmRuns(workspaceId?: string): SwarmRun[] {
    const database = getDatabase();
    const stmt = workspaceId
      ? database.prepare("SELECT * FROM swarm_runs WHERE workspace_id = ? ORDER BY created_at DESC")
      : database.prepare("SELECT * FROM swarm_runs ORDER BY created_at DESC LIMIT 50");
    
    const rows = (workspaceId ? stmt.all(workspaceId) : stmt.all()) as any[];
    return rows.map((r) => ({
      ...r,
      dag_state: JSON.parse(r.dag_state || "{}"),
    }));
  },

  // Swarm Tasks & Modality Artifacts
  createTask(task: { id: string; swarm_run_id: string; agent_role: string; model_engine?: string; input_context?: any }): void {
    const database = getDatabase();
    const stmt = database.prepare(`
      INSERT INTO swarm_tasks (id, swarm_run_id, agent_role, model_engine, input_context, status)
      VALUES (?, ?, ?, ?, ?, 'completed')
      ON CONFLICT(id) DO UPDATE SET agent_role = excluded.agent_role;
    `);
    stmt.run(task.id, task.swarm_run_id, task.agent_role, task.model_engine || "gemini-2.5-pro", JSON.stringify(task.input_context || {}));
  },

  createArtifact(art: { id: string; task_id: string; modality: string; storage_s3_url?: string; payload?: any }): void {
    const database = getDatabase();
    const stmt = database.prepare(`
      INSERT INTO modality_artifacts (id, task_id, modality, storage_s3_url, payload, ast_syntax_valid)
      VALUES (?, ?, ?, ?, ?, 1)
      ON CONFLICT(id) DO UPDATE SET modality = excluded.modality;
    `);
    stmt.run(art.id, art.task_id, art.modality, art.storage_s3_url || "s3://zyvoriq-vault/test.mp4", JSON.stringify(art.payload || {}));
  },

  // Veritas Evaluations & Certificates
  recordVeritasEvaluation(evalData: {
    id: string;
    artifact_id: string;
    composite_vqs: number;
    factuality_score: number;
    brand_tone_score: number;
    consensus_score: number;
    safety_policy_passed: boolean;
    humanization_score: number;
    gate_decision: string;
  }): void {
    const database = getDatabase();
    const stmt = database.prepare(`
      INSERT INTO veritas_evaluations (
        id, artifact_id, composite_vqs, factuality_score, brand_tone_score,
        consensus_score, safety_policy_passed, humanization_score, gate_decision
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET composite_vqs = excluded.composite_vqs;
    `);
    stmt.run(
      evalData.id,
      evalData.artifact_id,
      evalData.composite_vqs,
      evalData.factuality_score,
      evalData.brand_tone_score,
      evalData.consensus_score,
      evalData.safety_policy_passed ? 1 : 0,
      evalData.humanization_score,
      evalData.gate_decision
    );
  },

  issueCertificate(cert: {
    id: string;
    evaluation_id: string;
    ed25519_signature: string;
    c2pa_manifest_hash: string;
    sha256_root_checksum: string;
    signer_public_key_id: string;
  }): void {
    const database = getDatabase();
    const stmt = database.prepare(`
      INSERT INTO veritas_certificates (
        id, evaluation_id, ed25519_signature, c2pa_manifest_hash, sha256_root_checksum, signer_public_key_id
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET ed25519_signature = excluded.ed25519_signature;
    `);
    stmt.run(
      cert.id,
      cert.evaluation_id,
      cert.ed25519_signature,
      cert.c2pa_manifest_hash,
      cert.sha256_root_checksum,
      cert.signer_public_key_id
    );
  },

  getCertificates(): VeritasCertificate[] {
    const database = getDatabase();
    const stmt = database.prepare("SELECT * FROM veritas_certificates ORDER BY issued_at DESC LIMIT 50");
    return stmt.all() as unknown as VeritasCertificate[];
  },

  // 13. studio_series_tracks (Saved Series & Clips Library)
  getStudioTracks(): any[] {
    try {
      const database = getDatabase();
      const stmt = database.prepare("SELECT * FROM studio_series_tracks ORDER BY created_at DESC");
      let rows = stmt.all() as any[];
      if (rows.length === 0) {
        this.seedDefaultStudioTracks();
        rows = database.prepare("SELECT * FROM studio_series_tracks ORDER BY created_at DESC").all() as any[];
      }
      if (rows.length === 0) {
        return CANONICAL_SERIES_TRACKS;
      }
      return rows.map(r => {
        let videoSrc = r.video_src || "/assets/video/priya_4k_10act_master.mp4";
        if (videoSrc.startsWith("/videos/")) {
          videoSrc = videoSrc.replace("/videos/", "/assets/video/");
        }
        return {
          id: r.id,
          title: r.title,
          subtitle: r.subtitle,
          category: r.category,
          character: r.character,
          videoSrc,
          duration: r.duration,
          acts: JSON.parse(r.acts_json || "[]"),
          veritas: {
            status: r.veritas_status || "CERTIFIED_VALID",
            snarkProofHash: r.snark_proof_hash || "0x8f2d...4a19"
          },
          createdAt: r.created_at,
          updatedAt: r.updated_at
        };
      });
    } catch (e) {
      console.error("Failed to query SQLite studio tracks:", e);
      return CANONICAL_SERIES_TRACKS;
    }
  },

  saveStudioTrack(track: any): void {
    const database = getDatabase();
    let videoSrc = track.videoSrc || track.video_src || "/assets/video/priya_4k_10act_master.mp4";
    if (videoSrc.startsWith("/videos/")) {
      videoSrc = videoSrc.replace("/videos/", "/assets/video/");
    }

    const stmt = database.prepare(`
      INSERT INTO studio_series_tracks (
        id, title, subtitle, category, character, video_src, duration, acts_json, veritas_status, snark_proof_hash, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        subtitle = excluded.subtitle,
        category = excluded.category,
        character = excluded.character,
        video_src = excluded.video_src,
        duration = excluded.duration,
        acts_json = excluded.acts_json,
        veritas_status = excluded.veritas_status,
        snark_proof_hash = excluded.snark_proof_hash,
        updated_at = datetime('now');
    `);
    stmt.run(
      track.id,
      track.title,
      track.subtitle || "",
      track.category || "custom",
      track.character || "AI Broadcaster",
      videoSrc,
      track.duration || 24,
      typeof track.acts === "string" ? track.acts : JSON.stringify(track.acts || []),
      track.veritas?.status || track.veritas_status || "CERTIFIED_VALID",
      track.veritas?.snarkProofHash || track.snark_proof_hash || "0x8f2d...4a19"
    );
  },

  deleteStudioTrack(id: string): void {
    const database = getDatabase();
    const stmt = database.prepare("DELETE FROM studio_series_tracks WHERE id = ?");
    stmt.run(id);
  },

  seedDefaultStudioTracks(): void {
    for (const t of CANONICAL_SERIES_TRACKS) {
      this.saveStudioTrack({
        id: t.id,
        title: t.title,
        subtitle: t.subtitle,
        category: t.category,
        character: t.character,
        video_src: t.videoSrc,
        duration: t.duration,
        acts: t.acts,
        veritas_status: t.veritas?.status || "CERTIFIED_VALID",
        snark_proof_hash: t.veritas?.snarkProofHash || "0x8f2d...4a19"
      });
    }
  }
};
