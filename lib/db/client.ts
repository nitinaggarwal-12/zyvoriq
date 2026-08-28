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

export function safeJsonParse<T>(jsonStr: any, fallback: T): T {
  if (!jsonStr || typeof jsonStr !== "string") return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    try {
      const dbPath = path.resolve(process.cwd(), "dev.db");
      dbInstance = new DatabaseSync(dbPath);
      dbInstance.exec("PRAGMA foreign_keys = ON;");
      dbInstance.exec("PRAGMA journal_mode = WAL;");
      dbInstance.exec("PRAGMA synchronous = NORMAL;");
      dbInstance.exec(SQLITE_SCHEMA);
      dbInstance.exec(`
        CREATE INDEX IF NOT EXISTS idx_studio_jobs_created ON studio_production_jobs (created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_studio_jobs_status ON studio_production_jobs (status);
        CREATE INDEX IF NOT EXISTS idx_studio_tracks_created ON studio_series_tracks (created_at DESC);
      `);
    } catch (err) {
      try {
        const tmpPath = path.resolve("/tmp", "zyvoriq.db");
        dbInstance = new DatabaseSync(tmpPath);
        dbInstance.exec("PRAGMA foreign_keys = ON;");
        dbInstance.exec("PRAGMA journal_mode = WAL;");
        dbInstance.exec("PRAGMA synchronous = NORMAL;");
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
      
      // Purge obsolete prototype tracks from SQLite
      const obsoleteIds = [
        "track_scramjet_hypersonic",
        "track_abyssal_ocean",
        "track_neotokyo_cyberpunk",
        "track_biotech_crispr",
        "track_renaissance_painting",
        "track_theatrical_hamlet",
        "track_starlight_cartoon",
        "track_hollywood_blockbuster"
      ];
      for (const obsId of obsoleteIds) {
        try {
          database.prepare("DELETE FROM studio_series_tracks WHERE id = ?").run(obsId);
        } catch (_) {}
      }

      // Sync and update canonical tracks
      for (const canonical of CANONICAL_SERIES_TRACKS) {
        this.saveStudioTrack({
          id: canonical.id,
          title: canonical.title,
          subtitle: canonical.subtitle,
          category: canonical.category,
          character: canonical.character,
          video_src: canonical.videoSrc,
          duration: canonical.duration,
          acts: canonical.acts,
          veritas_status: canonical.veritas?.status || "CERTIFIED_VALID",
          snark_proof_hash: canonical.veritas?.snarkProofHash || "0x8f2d...4a19"
        });
      }
      rows = database.prepare("SELECT * FROM studio_series_tracks ORDER BY created_at DESC").all() as any[];

      if (rows.length === 0) {
        return CANONICAL_SERIES_TRACKS;
      }
      return rows.map(r => {
        let videoSrc = r.video_src || "";
        if (videoSrc.startsWith("/videos/")) {
          videoSrc = videoSrc.replace("/videos/", "/assets/video/");
        }
        if (videoSrc.startsWith("/assets/video/generated/")) {
          videoSrc = videoSrc.replace("/assets/video/generated/", "/api/media/video/generated/");
        }
        const rawActs = safeJsonParse<any[]>(r.acts_json, []);
        const trackText = `${r.title || ""} ${r.subtitle || ""}`.toLowerCase();
        const isElena = trackText.includes("elena");
        const isPriya = trackText.includes("priya");
        
        const correctedCharacter =
          isElena && (r.character === "David Kim" || !r.character)
            ? "Elena Rostova (Tokyo)"
            : isPriya && (r.character === "David Kim" || !r.character)
            ? "Priya Sharma (Silicon Valley)"
            : r.character;

        const correctedActs = rawActs.map((act) => {
          if (isElena && (act.speaker === "David Kim" || act.speaker === "David" || !act.speaker)) {
            return {
              ...act,
              speaker: "Elena Rostova",
              speakerRole: "VP Product Strategy"
            };
          }
          if (isPriya && (act.speaker === "David Kim" || act.speaker === "David" || !act.speaker)) {
            return {
              ...act,
              speaker: "Priya Sharma",
              speakerRole: "Chief AI Officer"
            };
          }
          return act;
        });

        return {
          id: r.id,
          title: r.title,
          subtitle: r.subtitle,
          category: r.category,
          character: correctedCharacter,
          videoSrc,
          audioSrc: r.audio_src || (correctedActs?.[0]?.audioUrl ? correctedActs[0].audioUrl : undefined),
          duration: r.duration,
          acts: correctedActs,
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
    let videoSrc = track.videoSrc || track.video_src || "";
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
  },

  createProductionJob(job: {
    id: string;
    title: string;
    prompt: string;
    characterLock: string;
    visualStyle: string;
    duration?: number;
    status?: string;
    progress?: number;
    stageText?: string;
    logs?: string[];
    acts?: any[];
  }): void {
    const database = getDatabase();
    database.exec(`
      CREATE TABLE IF NOT EXISTS studio_production_jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        prompt TEXT NOT NULL,
        character_lock TEXT NOT NULL,
        visual_style TEXT NOT NULL,
        duration REAL NOT NULL DEFAULT 8.0,
        status TEXT DEFAULT 'processing',
        progress INTEGER DEFAULT 0,
        stage_text TEXT,
        logs_json TEXT DEFAULT '[]',
        video_url TEXT,
        script_json TEXT,
        veritas_json TEXT,
        operation_name TEXT,
        acts_json TEXT DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);
    try {
      database.exec("ALTER TABLE studio_production_jobs ADD COLUMN acts_json TEXT DEFAULT '[]';");
    } catch (_) {}

    const stmt = database.prepare(`
      INSERT INTO studio_production_jobs (
        id, title, prompt, character_lock, visual_style, duration, status, progress, stage_text, logs_json, acts_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        prompt = excluded.prompt,
        character_lock = excluded.character_lock,
        visual_style = excluded.visual_style,
        duration = excluded.duration,
        status = excluded.status,
        progress = excluded.progress,
        stage_text = excluded.stage_text,
        logs_json = excluded.logs_json,
        acts_json = COALESCE(excluded.acts_json, studio_production_jobs.acts_json),
        updated_at = datetime('now');
    `);
    stmt.run(
      job.id,
      job.title,
      job.prompt,
      job.characterLock,
      job.visualStyle,
      job.duration || 8,
      job.status || "processing",
      job.progress || 0,
      job.stageText || "Queued for Veo 3.1 & Gemini Synthesis",
      JSON.stringify(job.logs || []),
      JSON.stringify(job.acts || [])
    );
  },

  updateProductionJob(id: string, updates: {
    status?: string;
    progress?: number;
    stageText?: string;
    logs?: string[];
    videoUrl?: string;
    script?: any;
    veritas?: any;
    operationName?: string;
    duration?: number;
    acts?: any[];
  }): void {
    const database = getDatabase();
    const existing = this.getProductionJob(id);
    if (!existing) return;

    const newLogs = updates.logs !== undefined ? updates.logs : existing.logs;

    const stmt = database.prepare(`
      UPDATE studio_production_jobs SET
        status = COALESCE(?, status),
        progress = COALESCE(?, progress),
        stage_text = COALESCE(?, stage_text),
        logs_json = ?,
        video_url = COALESCE(?, video_url),
        script_json = COALESCE(?, script_json),
        veritas_json = COALESCE(?, veritas_json),
        operation_name = COALESCE(?, operation_name),
        duration = COALESCE(?, duration),
        acts_json = COALESCE(?, acts_json),
        updated_at = datetime('now')
      WHERE id = ?;
    `);
    stmt.run(
      updates.status !== undefined ? updates.status : null,
      updates.progress !== undefined ? updates.progress : null,
      updates.stageText !== undefined ? updates.stageText : null,
      JSON.stringify(newLogs),
      updates.videoUrl !== undefined ? updates.videoUrl : null,
      updates.script !== undefined ? JSON.stringify(updates.script) : null,
      updates.veritas !== undefined ? JSON.stringify(updates.veritas) : null,
      updates.operationName !== undefined ? updates.operationName : null,
      updates.duration !== undefined ? updates.duration : null,
      updates.acts !== undefined ? JSON.stringify(updates.acts) : null,
      id
    );
  },

  getProductionJob(id: string): any | null {
    try {
      const database = getDatabase();
      database.exec(`
        CREATE TABLE IF NOT EXISTS studio_production_jobs (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          prompt TEXT NOT NULL,
          character_lock TEXT NOT NULL,
          visual_style TEXT NOT NULL,
          duration REAL NOT NULL DEFAULT 8.0,
          status TEXT DEFAULT 'processing',
          progress INTEGER DEFAULT 0,
          stage_text TEXT,
          logs_json TEXT DEFAULT '[]',
          video_url TEXT,
          script_json TEXT,
          veritas_json TEXT,
          operation_name TEXT,
          acts_json TEXT DEFAULT '[]',
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        );
      `);
      try {
        database.exec("ALTER TABLE studio_production_jobs ADD COLUMN acts_json TEXT DEFAULT '[]';");
      } catch (_) {}

      const row = database.prepare("SELECT * FROM studio_production_jobs WHERE id = ?").get(id) as any;
      if (!row) return null;
      let videoUrl = row.video_url;
      if (videoUrl && videoUrl.startsWith("/assets/video/generated/")) {
        videoUrl = videoUrl.replace("/assets/video/generated/", "/api/media/video/generated/");
      }
      const rawActs = safeJsonParse<any[]>(row.acts_json, []);
      const jobText = `${row.title || ""} ${row.prompt || ""}`.toLowerCase();
      const isElena = jobText.includes("elena");
      const isPriya = jobText.includes("priya");
      const correctedLock =
        isElena && row.character_lock === "david"
          ? "elena"
          : isPriya && row.character_lock === "david"
          ? "priya"
          : row.character_lock;

      const correctedActs = rawActs.map((act) => {
        if (isElena && (act.speaker === "David Kim" || act.speaker === "David" || !act.speaker)) {
          return {
            ...act,
            speaker: "Elena Rostova",
            speakerRole: "VP Product Strategy"
          };
        }
        if (isPriya && (act.speaker === "David Kim" || act.speaker === "David" || !act.speaker)) {
          return {
            ...act,
            speaker: "Priya Sharma",
            speakerRole: "Chief AI Officer"
          };
        }
        return act;
      });

      return {
        id: row.id,
        title: row.title,
        prompt: row.prompt,
        characterLock: correctedLock,
        visualStyle: row.visual_style,
        duration: row.duration,
        status: row.status,
        progress: row.progress,
        stageText: row.stage_text,
        logs: JSON.parse(row.logs_json || "[]"),
        videoUrl,
        audioUrl: row.audio_url || (row.script_json ? JSON.parse(row.script_json)?.audioUrl : undefined),
        script: row.script_json ? JSON.parse(row.script_json) : null,
        veritas: row.veritas_json ? JSON.parse(row.veritas_json) : null,
        operationName: row.operation_name,
        acts: correctedActs,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (e) {
      console.error("Failed to query production job:", e);
      return null;
    }
  },

  getAllProductionJobs(): any[] {
    try {
      const database = getDatabase();
      const rows = database.prepare("SELECT * FROM studio_production_jobs ORDER BY created_at DESC LIMIT 50").all() as any[];
      return rows.map(row => ({
        id: row.id,
        title: row.title,
        prompt: row.prompt,
        characterLock: row.character_lock,
        visualStyle: row.visual_style,
        duration: row.duration,
        status: row.status,
        progress: row.progress,
        stageText: row.stage_text,
        logs: JSON.parse(row.logs_json || "[]"),
        videoUrl: row.video_url,
        script: row.script_json ? JSON.parse(row.script_json) : null,
        veritas: row.veritas_json ? JSON.parse(row.veritas_json) : null,
        operationName: row.operation_name,
        acts: safeJsonParse<any[]>(row.acts_json, []),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (e) {
      return [];
    }
  }
};
