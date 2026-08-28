import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { SQLITE_SCHEMA } from "./schema";
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
    const dbPath = path.resolve(process.cwd(), "dev.db");
    dbInstance = new DatabaseSync(dbPath);
    // Initialize Schema & Pragmas
    dbInstance.exec("PRAGMA foreign_keys = ON;");
    dbInstance.exec("PRAGMA journal_mode = WAL;");
    dbInstance.exec(SQLITE_SCHEMA);
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
    const database = getDatabase();
    const stmt = database.prepare("SELECT * FROM studio_series_tracks ORDER BY created_at DESC");
    let rows = stmt.all() as any[];
    if (rows.length === 0) {
      this.seedDefaultStudioTracks();
      rows = database.prepare("SELECT * FROM studio_series_tracks ORDER BY created_at DESC").all() as any[];
    }
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      category: r.category,
      character: r.character,
      videoSrc: r.video_src,
      duration: r.duration,
      acts: JSON.parse(r.acts_json || "[]"),
      veritas: {
        status: r.veritas_status || "CERTIFIED_VALID",
        snarkProofHash: r.snark_proof_hash || "0x8f2d...4a19"
      },
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  },

  saveStudioTrack(track: any): void {
    const database = getDatabase();
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
      track.videoSrc || track.video_src || "/videos/veo_priya_24s_master.mp4",
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
    const defaultTracks = [
      {
        id: "track_kaizen",
        title: "The Master & The Apprentice: Path to Kaizen",
        subtitle: "7-Act Cinematic Anime Series · Sensei Ren & Apprentice Aoi",
        category: "anime",
        character: "Sensei Ren & Apprentice Aoi",
        video_src: "/assets/video/master_apprentice_1min.mp4",
        duration: 56.0,
        acts: [
          {
            id: "act_1",
            startTime: 0.25,
            endTime: 7.5,
            speaker: "Aoi",
            speakerRole: "Apprentice",
            actName: "Act 1: Apprentice Doubt",
            philosophy: "Shoshin (初心) — Beginner's Mind",
            text: {
              ja: "🥋 AOI: 「先生、毎朝稽古を重ねていますが、なぜ心がまだ迷うのでしょうか？」",
              en: "🥋 AOI: \"Sensei Ren... I train every sunrise, yet why do I still feel so uncertain?\"",
              es: "🥋 AOI: \"Sensei Ren... Entreno cada amanecer, pero ¿por qué aún me siento tan inseguro?\"",
              fr: "🥋 AOI: « Sensei Ren... Je m'entraîne chaque matin, mais pourquoi ai-je encore tant de doutes ? »",
              de: "🥋 AOI: „Sensei Ren... Ich trainiere jeden Sonnenaufgang, aber warum fühle ich mich noch so unsicher?“",
              hi: "🥋 आओई: \"सेंसेई रेन... मैं हर सुबह अभ्यास करता हूँ, फिर भी मेरे मन में यह संशय क्यों है?\""
            }
          },
          {
            id: "act_2",
            startTime: 8.0,
            endTime: 15.5,
            speaker: "Ren",
            speakerRole: "Master",
            actName: "Act 2: The Bloom of Oubaitori",
            philosophy: "Oubaitori (桜梅桃李) — Never compare your spring to another's summer",
            text: {
              ja: "⛩️ SENSEI REN: 「庭の桜と梅を見よ。桜は梅になろうと焦らぬ。己の時を知るのだ。」",
              en: "⛩️ SENSEI REN: \"Look at the garden, Aoi. The cherry never envies the plum. Each blooms in its own season.\"",
              es: "⛩️ SENSEI REN: \"Mira el jardín, Aoi. El cerezo nunca envidia al ciruelo. Cada uno florece en su propia estación.\"",
              fr: "⛩️ SENSEI REN: « Regarde le jardin, Aoi. Le cerisier n'envie jamais le prunier. Chacun fleurit à sa saison. »",
              de: "⛩️ SENSEI REN: „Sieh dir den Garten an, Aoi. Die Kirsche beneidet nie die Pflaume. Jede blüht zu ihrer Zeit.“",
              hi: "⛩️ सेंसेई रेन: \"बगीचे को देखो, आओई। चेरी कभी बेर से ईर्ष्या नहीं करती। प्रत्येक अपने समय पर खिलता है।\""
            }
          }
        ],
        veritas_status: "CERTIFIED_VALID",
        snark_proof_hash: "0x8f2d...kaizen_master"
      },
      {
        id: "track_sovereign_ai",
        title: "Executive Sovereign AI Keynote",
        subtitle: "Enterprise Deterministic Media & Cryptographic Provenance",
        category: "executive",
        character: "Priya Sharma (Chief AI Officer)",
        video_src: "/videos/veo_priya_24s_master.mp4",
        duration: 24.0,
        acts: [
          {
            id: "exec_act_1",
            startTime: 0.25,
            endTime: 11.5,
            speaker: "Priya",
            speakerRole: "Chief AI Officer",
            actName: "Act 1: Frontier Autonomous AI",
            philosophy: "Sovereign Intelligence Architecture",
            text: {
              ja: "🌐 PRIYA: 「企業の意思決定を加速する自律型AIインテリジェンスの新時代へようこそ。」",
              en: "🌐 PRIYA: \"Welcome to the frontier of sovereign autonomous enterprise intelligence.\"",
              es: "🌐 PRIYA: \"Bienvenidos a la frontera de la inteligencia empresarial autónoma y soberana.\"",
              fr: "🌐 PRIYA: « Bienvenue à la frontière de l'intelligence d'entreprise souveraine et autonome. »",
              de: "🌐 PRIYA: „Willkommen an der Grenze souveräner autonomer Unternehmensintelligenz.“",
              hi: "🌐 प्रिया: \"स्वायत्त उद्यम बुद्धिमत्ता के नए युग में आपका स्वागत है।\""
            }
          }
        ],
        veritas_status: "CERTIFIED_VALID",
        snark_proof_hash: "0x4e9a...priya_keynote"
      },
      {
        id: "track_zurich_neural",
        title: "Zurich Neural Systems & Quantum Protocol",
        subtitle: "Distributed Micro-Inference & Sovereign Model Topologies",
        category: "executive",
        character: "David Kim (Lead Infrastructure)",
        video_src: "/assets/video/david_master.mp4",
        duration: 16.0,
        acts: [
          {
            id: "zurich_act_1",
            startTime: 0.25,
            endTime: 15.0,
            speaker: "David",
            speakerRole: "Lead Infrastructure",
            actName: "Act 1: Distributed Core Topologies",
            philosophy: "Zero-Latency Edge Inference",
            text: {
              ja: "⚡ DAVID: 「分散マイクロ推論により、エッジでのミリ秒単位の応答を実現します。」",
              en: "⚡ DAVID: \"Distributed micro-inference enables sub-millisecond deterministic edge response.\"",
              es: "⚡ DAVID: \"La microinferencia distribuida permite respuestas deterministas en submilisegundos.\"",
              fr: "⚡ DAVID: « La micro-inférence distribuée permet une réponse déterministe en moins d'une milliseconde. »",
              de: "⚡ DAVID: „Verteilte Mikro-Inferenz ermöglicht deterministische Reaktionszeiten unter einer Millisekunde.“",
              hi: "⚡ डेविड: \"वितरित माइक्रो-इनफेरेंस मिलीसेकंड प्रतिक्रिया समय सक्षम करता है।\""
            }
          }
        ],
        veritas_status: "CERTIFIED_VALID",
        snark_proof_hash: "0x9c31...david_zurich"
      }
    ];

    for (const t of defaultTracks) {
      this.saveStudioTrack(t);
    }
  }
};
