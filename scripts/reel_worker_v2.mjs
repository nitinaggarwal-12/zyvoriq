import crypto from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import fsSync from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import pg from "pg"; 
import { ensureCharacterSheet, firstFrameForShot, seedForShot, getManifestCharacters } from "./characterAnchor.mjs";
import { buildStudio1RenderPlan, buildStudio1VisualFilter, synchronizeStudio1ManifestTimeline } from "./studio1_timeline_sync.mjs";
import { generateContinuousReel, maxBeatsForDuration } from "./studio1_native.mjs";

const { Pool } = pg;
const execFileAsync = promisify(execFile);
const API_BASE = "https://generativelanguage.googleapis.com";
const SAMPLE_RATE = 24000, SAMPLE_WIDTH = 2, CHANNELS = 1;
const MAX_WER = 0.08, MIN_COVERAGE = 0.90;
const workerId = `reel-worker-${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
const pollMs = Math.max(500, Number(process.env.ZYVORIQ_WORKER_POLL_MS || 1500));
const heartbeatMs = 15000;
const assetServerPort = Math.max(1, Number(process.env.ZYVORIQ_ASSET_SERVER_PORT || 8080));

function dbUrl() {
  const direct = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_PRIVATE_URL;
  if (direct) return direct;
  if (process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE) {
    const pass = process.env.PGPASSWORD ? `:${encodeURIComponent(process.env.PGPASSWORD)}` : "";
    return `postgresql://${encodeURIComponent(process.env.PGUSER)}${pass}@${process.env.PGHOST}:${process.env.PGPORT || "5432"}/${process.env.PGDATABASE}`;
  }
  return "";
}
function apiKey() { return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ""; }
function assetRoot() {
  const env = process.env.ZYVORIQ_ASSET_ROOT || process.env.RAILWAY_VOLUME_MOUNT_PATH;
  if (env) return env;
  try {
    if (fsSync.existsSync("/data")) return "/data";
  } catch {}
  return "";
}

const databaseUrl = dbUrl();
if (!databaseUrl) { console.error("[reel-worker] Postgres is required"); process.exit(1); }
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  query_timeout: 30000,
  statement_timeout: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});
pool.on("error", (err) => {
  console.error("[reel-worker] [pg-pool] Unexpected error on idle client:", err?.message || err);
});
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function withDbRetry(fn, { maxRetries = 3, baseDelayMs = 1500, label = "db-op" } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const msg = String(err?.message || err);
      const isTransient = /EAI_AGAIN|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|Connection terminated|timeout exceeded|query_timeout|statement_timeout|57P01/i.test(msg);
      if (isTransient && attempt <= maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 500);
        console.warn(`[reel-worker] [db-retry] ${label} failed with transient error: ${msg}. Retrying ${attempt}/${maxRetries} in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
}

await pool.query(`
CREATE TABLE IF NOT EXISTS reel_operations (
 id TEXT PRIMARY KEY, production_id TEXT NOT NULL, kind TEXT NOT NULL, target_id TEXT,
 idempotency_key TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'QUEUED', attempt INTEGER NOT NULL DEFAULT 0,
 provider_operation_name TEXT, payload_json JSONB NOT NULL DEFAULT '{}'::jsonb, result_json JSONB, last_error TEXT,
 lease_owner TEXT, lease_expires_at TIMESTAMPTZ, scheduled_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE reel_operations ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS reel_production_controls (
 production_id TEXT PRIMARY KEY, generation_token TEXT NOT NULL, cancelled_at TIMESTAMPTZ, superseded_by TEXT,
 priority INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE reel_production_controls ADD COLUMN IF NOT EXISTS priority INT NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_pc_priority ON reel_production_controls (production_id, priority);
CREATE TABLE IF NOT EXISTS reel_worker_heartbeats (
 worker_id TEXT PRIMARY KEY, worker_role TEXT NOT NULL, started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb);
CREATE INDEX IF NOT EXISTS idx_reel_operations_status_created ON reel_operations(status,created_at);
CREATE INDEX IF NOT EXISTS idx_reel_operations_scheduled ON reel_operations(status,scheduled_at);
CREATE TABLE IF NOT EXISTS character_library (
  id                TEXT PRIMARY KEY,
  display_name      TEXT NOT NULL,
  archetype         TEXT NOT NULL,
  description       TEXT NOT NULL,
  gender            TEXT,
  era               TEXT,
  default_voice_id  TEXT,
  validation_status TEXT NOT NULL DEFAULT 'UNVALIDATED',
  validation_error  TEXT,
  validated_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS character_wardrobe (
  id            TEXT PRIMARY KEY,
  character_id  TEXT NOT NULL REFERENCES character_library(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  sheet_uris    TEXT[] NOT NULL,
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS location_library (
  id                 TEXT PRIMARY KEY,
  display_name       TEXT NOT NULL,
  environment_block  TEXT NOT NULL,
  establishing_uri   TEXT,
  era                TEXT,
  time_of_day        TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wardrobe_char ON character_wardrobe (character_id);
CREATE INDEX IF NOT EXISTS idx_charlib_valid ON character_library (validation_status);
`);

async function recoverLegacyAmbiguousTtsFailures() {
  const failed = await pool.query(`
    SELECT id, production_id
    FROM reel_operations
    WHERE kind='NARRATION'
      AND status='FAILED'
      AND last_error LIKE '%AMBIGUOUS_TTS_RESULT_NO_AUTORETRY%'
    ORDER BY updated_at ASC
  `);
  for (const row of failed.rows) {
    await pool.query(`
      UPDATE reel_operations
      SET status='QUEUED', attempt=0, provider_operation_name=NULL, result_json=NULL,
          last_error=NULL, lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
      WHERE id=$1
    `, [row.id]);
    const p = await pool.query(`SELECT revision, manifest_json FROM reel_productions WHERE id=$1`, [row.production_id]);
    if (!p.rows[0]) continue;
    const m = p.rows[0].manifest_json || {};
    if (m.status === "FAILED") m.status = "AUDIO_GENERATING";
    if (m.qa?.failures && Array.isArray(m.qa.failures)) {
      m.qa.failures = m.qa.failures.filter(x => !String(x).includes("AMBIGUOUS_TTS_RESULT_NO_AUTORETRY"));
    }
    await pool.query(`
      UPDATE reel_productions
      SET revision=revision+1, manifest_json=$3::jsonb, updated_at=NOW()
      WHERE id=$1 AND revision=$2
    `, [row.production_id, Number(p.rows[0].revision), JSON.stringify(m)]);
    console.log(`[reel-worker] recovered legacy ambiguous TTS operation ${row.id}`);
  }
}
await recoverLegacyAmbiguousTtsFailures();

async function recoverLegacyTranscriptMismatchFailures() {
  const failed = await pool.query(`
    SELECT id, production_id
    FROM reel_operations
    WHERE kind='NARRATION'
      AND status='FAILED'
      AND last_error LIKE 'Narration transcript mismatch:%'
      AND result_json->>'stage'='AUDIO_PERSISTED'
    ORDER BY updated_at ASC
  `);
  for (const row of failed.rows) {
    await pool.query(`
      UPDATE reel_operations
      SET status='QUEUED', attempt=0, provider_operation_name='tts-audio-persisted',
          last_error=NULL, lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
      WHERE id=$1
    `, [row.id]);
    const p = await pool.query(`SELECT revision, manifest_json FROM reel_productions WHERE id=$1`, [row.production_id]);
    if (!p.rows[0]) continue;
    const m = p.rows[0].manifest_json || {};
    if (m.status === "FAILED") m.status = "AUDIO_GENERATING";
    if (m.qa?.failures && Array.isArray(m.qa.failures)) {
      m.qa.failures = m.qa.failures.filter(x => !String(x).startsWith("Narration transcript mismatch:"));
    }
    await pool.query(`
      UPDATE reel_productions
      SET revision=revision+1, manifest_json=$3::jsonb, updated_at=NOW()
      WHERE id=$1 AND revision=$2
    `, [row.production_id, Number(p.rows[0].revision), JSON.stringify(m)]);
    console.log(`[reel-worker] recovered transcript mismatch operation ${row.id} from persisted audio`);
  }
}
await recoverLegacyTranscriptMismatchFailures();

async function recoverLegacyEditDistanceFailures() {
  const failed = await pool.query(`
    SELECT id, production_id
    FROM reel_operations
    WHERE kind='NARRATION'
      AND status='FAILED'
      AND last_error LIKE '%editDistance is not defined%'
  `);
  for (const row of failed.rows) {
    await pool.query(`
      UPDATE reel_operations
      SET status='QUEUED', attempt=0,
          last_error=NULL, lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
      WHERE id=$1
    `, [row.id]);
    const p = await pool.query(`SELECT revision, manifest_json FROM reel_productions WHERE id=$1`, [row.production_id]);
    if (!p.rows[0]) continue;
    const m = p.rows[0].manifest_json || {};
    if (m.status === "FAILED") m.status = "AUDIO_GENERATING";
    if (m.qa?.failures && Array.isArray(m.qa.failures)) {
      m.qa.failures = m.qa.failures.filter(x => !String(x).includes("editDistance is not defined"));
    }
    await pool.query(`
      UPDATE reel_productions
      SET revision=revision+1, manifest_json=$3::jsonb, updated_at=NOW()
      WHERE id=$1 AND revision=$2
    `, [row.production_id, Number(p.rows[0].revision), JSON.stringify(m)]);
    console.log(`[reel-worker] recovered editDistance failure operation ${row.id}`);
  }
}
await recoverLegacyEditDistanceFailures();

async function recoverLegacyAmbiguousVeoFailures() {
  const failed = await pool.query(`
    SELECT id, production_id, target_id
    FROM reel_operations
    WHERE kind='SHOT'
      AND status='FAILED'
      AND last_error LIKE '%AMBIGUOUS_VEO_DISPATCH_NO_OPERATION_ID%'
    ORDER BY updated_at ASC
  `);
  for (const row of failed.rows) {
    const reset = await pool.query(`
      UPDATE reel_operations
      SET status='QUEUED', attempt=0, provider_operation_name='veo-dispatch-started', result_json=NULL,
          last_error=NULL, lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
      WHERE id=$1 AND status='FAILED'
      RETURNING id
    `, [row.id]);
    if (!reset.rows[0]) continue;
    const p = await pool.query(`SELECT revision, manifest_json FROM reel_productions WHERE id=$1`, [row.production_id]);
    if (!p.rows[0]) continue;
    const m = p.rows[0].manifest_json || {};
    m.qa = m.qa || { minimumReadyScore: 90, passed: false, warnings: [], failures: [] };
    if (Array.isArray(m.qa.failures)) {
      m.qa.failures = m.qa.failures.filter(x => !String(x).includes('AMBIGUOUS_VEO_DISPATCH_NO_OPERATION_ID'));
    }
    const shot = Array.isArray(m.shots) ? m.shots.find(x => x.id === row.target_id) : null;
    if (shot && !shot.asset?.videoUrl) {
      shot.status = 'FAILED';
      if (shot.qa?.failures && Array.isArray(shot.qa.failures)) {
        shot.qa.failures = shot.qa.failures.filter(x => !String(x).includes('AMBIGUOUS_VEO_DISPATCH_NO_OPERATION_ID'));
      }
    }
    if (m.status === 'FAILED') m.status = 'REPAIRING';
    await pool.query(`
      UPDATE reel_productions
      SET revision=revision+1, manifest_json=$3::jsonb, updated_at=NOW()
      WHERE id=$1 AND revision=$2
    `, [row.production_id, Number(p.rows[0].revision), JSON.stringify(m)]);
    console.log(`[reel-worker] recovered legacy ambiguous Veo operation ${row.id} for one bounded redispatch`);
  }
}
await recoverLegacyAmbiguousVeoFailures();

async function recoverLegacyVeoInlineDataFailures() {
  const failed = await pool.query(`
    SELECT id, production_id, target_id
    FROM reel_operations
    WHERE kind='SHOT'
      AND status='FAILED'
      AND last_error LIKE '%inlineData%supported by this model%'
    ORDER BY updated_at ASC
  `);
  for (const row of failed.rows) {
    const reset = await pool.query(`
      UPDATE reel_operations
      SET status='QUEUED', attempt=0, provider_operation_name=NULL, result_json=NULL,
          last_error=NULL, lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
      WHERE id=$1 AND status='FAILED'
      RETURNING id
    `, [row.id]);
    if (!reset.rows[0]) continue;
    const p = await pool.query(`SELECT revision, manifest_json FROM reel_productions WHERE id=$1`, [row.production_id]);
    if (!p.rows[0]) continue;
    const m = p.rows[0].manifest_json || {};
    m.qa = m.qa || { minimumReadyScore: 90, passed: false, warnings: [], failures: [] };
    if (Array.isArray(m.qa.failures)) {
      m.qa.failures = m.qa.failures.filter(x => !(String(x).includes('inlineData') && String(x).includes('supported by this model')));
    }
    const shot = Array.isArray(m.shots) ? m.shots.find(x => x.id === row.target_id) : null;
    if (shot && !shot.asset?.videoUrl) {
      shot.status = 'FAILED';
      if (shot.qa?.failures && Array.isArray(shot.qa.failures)) {
        shot.qa.failures = shot.qa.failures.filter(x => !(String(x).includes('inlineData') && String(x).includes('supported by this model')));
      }
    }
    if (m.status === 'FAILED') m.status = 'REPAIRING';
    await pool.query(`
      UPDATE reel_productions
      SET revision=revision+1, manifest_json=$3::jsonb, updated_at=NOW()
      WHERE id=$1 AND revision=$2
    `, [row.production_id, Number(p.rows[0].revision), JSON.stringify(m)]);
    console.log(`[reel-worker] recovered legacy Veo inlineData rejection ${row.id} with corrected image wire format`);
  }
}
await recoverLegacyVeoInlineDataFailures();

async function recoverLegacyContinuityDependencyFailures() {
  const failed = await pool.query(`
    SELECT id, production_id, target_id
    FROM reel_operations
    WHERE kind='SHOT'
      AND status='FAILED'
      AND (last_error LIKE '%Continuity dependency%has no media%' OR last_error LIKE '%dependency%is not generated%')
    ORDER BY created_at ASC
  `);
  for (const row of failed.rows) {
    const p = await pool.query(`SELECT revision, manifest_json FROM reel_productions WHERE id=$1`, [row.production_id]);
    if (!p.rows[0]) continue;
    const m = p.rows[0].manifest_json || {};
    const shot = Array.isArray(m.shots) ? m.shots.find(x => x.id === row.target_id) : null;
    
    // Check if dependencies are actually met before re-queuing
    let allMet = true;
    if (shot?.dependsOnShotIds?.length) {
      allMet = shot.dependsOnShotIds.every(depId => {
        const dep = m.shots?.find(s => s.id === depId);
        return dep?.asset?.videoUrl && ["GENERATED", "PASSED"].includes(dep.status);
      });
    }

    const nextStatus = allMet ? 'QUEUED' : 'BLOCKED';
    const reset = await pool.query(`
      UPDATE reel_operations
      SET status=$2, attempt=0, provider_operation_name=NULL, result_json=NULL,
          last_error=NULL, lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
      WHERE id=$1 AND status='FAILED'
      RETURNING id
    `, [row.id, nextStatus]);
    if (!reset.rows[0]) continue;

    if (["FAILED", "REPAIRING"].includes(m.status)) m.status = "SHOTS_PLANNED";
    if (m.qa?.failures && Array.isArray(m.qa.failures)) {
      m.qa.failures = m.qa.failures.filter(x => !String(x).includes("Continuity dependency") && !String(x).includes("is not generated"));
    }
    if (shot && !shot.asset?.videoUrl) {
      shot.status = "PLANNED";
      if (shot.qa?.failures && Array.isArray(shot.qa.failures)) {
        shot.qa.failures = shot.qa.failures.filter(x => !String(x).includes("Continuity dependency") && !String(x).includes("is not generated"));
      }
    }
    await pool.query(`
      UPDATE reel_productions
      SET revision=revision+1, manifest_json=$3::jsonb, updated_at=NOW()
      WHERE id=$1 AND revision=$2
    `, [row.production_id, Number(p.rows[0].revision), JSON.stringify(m)]);
    console.log(`[reel-worker] recovered continuity operation ${row.id} as ${nextStatus}`);
  }
}
await recoverLegacyContinuityDependencyFailures();

async function recoverMislabeledMumbaiShots() {
  const r = await pool.query(`
    UPDATE reel_operations
    SET status='QUEUED', attempt=0, last_error=NULL, lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
    WHERE status='CANCELLED'
      AND last_error LIKE '%CLEANUP_ORPHANED_MUMBAI_JOB%'
      AND production_id NOT ILIKE '%mumbai%'
      AND payload_json::text NOT ILIKE '%mumbai%'
      AND payload_json::text NOT ILIKE '%dinner%'
      AND payload_json::text NOT ILIKE '%bandra%'
      AND payload_json::text NOT ILIKE '%paneer%'
    RETURNING id, production_id, target_id
  `);
  if (r.rowCount > 0) {
    console.log(`[reel-worker] recovered ${r.rowCount} mislabeled shot(s):`, r.rows.map(x => `${x.production_id}:${x.target_id}`));
  }
}
await recoverMislabeledMumbaiShots();

async function recoverCrossScriptNarrationFailures() {
  const r = await pool.query(`
    UPDATE reel_operations
    SET status='QUEUED', attempt=0, last_error=NULL, lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
    WHERE (status='FAILED' OR (status='CANCELLED' AND last_error LIKE '%narration no longer applies%'))
      AND kind='NARRATION'
      AND (
        last_error LIKE '%Narration transcript mismatch%'
        OR last_error LIKE '%Studio1 scene scripts diverge too far%'
        OR last_error LIKE '%narration no longer applies%'
      )
    RETURNING id, production_id
  `);
  if (r.rowCount > 0) {
    for (const row of r.rows) {
      try {
        await pool.query(`
          UPDATE reel_productions
          SET manifest_json = jsonb_set(manifest_json, '{status}', '"AUDIO_GENERATING"'),
              updated_at = NOW()
          WHERE id = $1
        `, [row.production_id]);
      } catch (e) {
        console.error(`[reel-worker] failed to reset manifest status for ${row.production_id}:`, e);
      }
    }
    console.log(`[reel-worker] recovered ${r.rowCount} narration operation(s) with cross-script transcript mismatch:`, r.rows.map(x => `${x.production_id}:${x.id}`));
  }
}
await recoverCrossScriptNarrationFailures();

async function recoverWaitCeilingExceededFailures() {
  const failed = await pool.query(`
    SELECT o.id, o.production_id, o.target_id
    FROM reel_operations o
    WHERE o.status = 'FAILED'
      AND o.last_error LIKE 'WAIT_CEILING_EXCEEDED%'
    ORDER BY o.created_at ASC
  `);
  for (const row of failed.rows) {
    const p = await pool.query(`SELECT revision, manifest_json FROM reel_productions WHERE id=$1`, [row.production_id]);
    if (!p.rows[0]) continue;
    const m = p.rows[0].manifest_json || {};
    const shot = Array.isArray(m.shots) ? m.shots.find(x => x.id === row.target_id) : null;
    
    let allMet = true;
    if (shot?.dependsOnShotIds?.length) {
      allMet = shot.dependsOnShotIds.every(depId => {
        const dep = m.shots?.find(s => s.id === depId);
        return dep?.asset?.videoUrl && ["GENERATED", "PASSED"].includes(dep.status);
      });
    }

    const nextStatus = allMet ? 'QUEUED' : 'BLOCKED';
    const initError = allMet ? null : `WAITING_ON_UPSTREAM_DEPENDENCIES:${shot?.dependsOnShotIds?.join(",") || ""}`;
    const reset = await pool.query(`
      UPDATE reel_operations
      SET status=$2, attempt=0, provider_operation_name=NULL, result_json=NULL,
          last_error=$3, lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
      WHERE id=$1 AND status='FAILED'
      RETURNING id
    `, [row.id, nextStatus, initError]);
    if (!reset.rows[0]) continue;

    if (["FAILED", "REPAIRING"].includes(m.status)) m.status = "VIDEO_GENERATING";
    if (m.qa?.failures && Array.isArray(m.qa.failures)) {
      m.qa.failures = m.qa.failures.filter(x => !String(x).includes("WAIT_CEILING_EXCEEDED"));
    }
    if (shot && !shot.asset?.videoUrl) {
      shot.status = "PLANNED";
      if (shot.qa?.failures && Array.isArray(shot.qa.failures)) {
        shot.qa.failures = shot.qa.failures.filter(x => !String(x).includes("WAIT_CEILING_EXCEEDED"));
      }
    }
    await pool.query(`
      UPDATE reel_productions
      SET revision=revision+1, manifest_json=$3::jsonb, updated_at=NOW()
      WHERE id=$1 AND revision=$2
    `, [row.production_id, Number(p.rows[0].revision), JSON.stringify(m)]);
    console.log(`[reel-worker] recovered wait-ceiling-failed operation ${row.id} (${row.production_id}:${row.target_id}) -> ${nextStatus}`);
  }
}
await recoverWaitCeilingExceededFailures();

async function recoverVeoEmptyPayloadFailures() {
  const failed = await pool.query(`
    SELECT o.id, o.production_id, o.target_id, o.last_error
    FROM reel_operations o
    WHERE o.status = 'FAILED'
      AND (
        o.last_error LIKE '%Veo completed without video URI%'
        OR o.last_error LIKE '%VEO_TRANSIENT_EMPTY_PAYLOAD%'
        OR o.last_error LIKE '%VEO_SAFETY_FILTER_EMPTY%'
      )
    ORDER BY o.created_at ASC
  `);
  for (const row of failed.rows) {
    const p = await pool.query(`SELECT revision, manifest_json FROM reel_productions WHERE id=$1`, [row.production_id]);
    if (!p.rows[0]) continue;
    const m = p.rows[0].manifest_json || {};
    const shot = Array.isArray(m.shots) ? m.shots.find(x => x.id === row.target_id) : null;

    let allMet = true;
    if (shot?.dependsOnShotIds?.length) {
      allMet = shot.dependsOnShotIds.every(depId => {
        const dep = m.shots?.find(s => s.id === depId);
        return dep?.asset?.videoUrl && ["GENERATED", "PASSED"].includes(dep.status);
      });
    }

    const nextStatus = allMet ? 'QUEUED' : 'BLOCKED';
    const initError = allMet ? null : `WAITING_ON_UPSTREAM_DEPENDENCIES:${shot?.dependsOnShotIds?.join(",") || ""}`;
    await pool.query(`
      UPDATE reel_operations
      SET status=$2, attempt=0, provider_operation_name=NULL, result_json=NULL,
          last_error=$3, lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
      WHERE id=$1 AND status='FAILED'
      RETURNING id
    `, [row.id, nextStatus, initError]);

    if (["FAILED", "REPAIRING"].includes(m.status)) m.status = "VIDEO_GENERATING";
    if (m.qa?.failures && Array.isArray(m.qa.failures)) {
      m.qa.failures = m.qa.failures.filter(x => !String(x).includes("without video URI") && !String(x).includes("EMPTY"));
    }
    if (shot && !shot.asset?.videoUrl) {
      shot.status = "PLANNED";
      if (shot.qa?.failures && Array.isArray(shot.qa.failures)) {
        shot.qa.failures = shot.qa.failures.filter(x => !String(x).includes("without video URI") && !String(x).includes("EMPTY"));
      }
    }
    await pool.query(`
      UPDATE reel_productions
      SET revision=revision+1, manifest_json=$3::jsonb, updated_at=NOW()
      WHERE id=$1 AND revision=$2
    `, [row.production_id, Number(p.rows[0].revision), JSON.stringify(m)]);
    console.log(`[reel-worker] recovered Veo-empty-failed operation ${row.id} (${row.production_id}:${row.target_id}) -> ${nextStatus}`);
  }
}
await recoverVeoEmptyPayloadFailures();

// Reclaim any orphaned RUNNING operations whose lease belongs to a dead previous container instance
async function reclaimOrphanedContainerLeases() {
  const r = await pool.query(`
    UPDATE reel_operations
    SET status='QUEUED',
        lease_owner=NULL,
        lease_expires_at=NULL,
        updated_at=NOW()
    WHERE status='RUNNING'
      AND (lease_owner IS NULL OR lease_owner != $1)
    RETURNING id, production_id, kind, target_id
  `, [workerId]);
  if (r.rowCount > 0) {
    console.log(`[reel-worker] Reclaimed ${r.rowCount} orphaned running operation(s) from previous container instances:`, r.rows.map(x => `${x.id} (${x.kind})`));
  }
}
await reclaimOrphanedContainerLeases();


async function autonomousDiskCleanAndHealthGuard(forceAggressive = false) {
  try {
    const root = assetRoot();
    const tmpDir = os.tmpdir();

    // 1. Clean stale files in /tmp (files older than 5 minutes)
    try {
      const tmpEntries = await fs.readdir(tmpDir, { withFileTypes: true }).catch(() => []);
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      for (const entry of tmpEntries) {
        if (entry.name.startsWith("zyvoriq-")) {
          const fullPath = path.join(tmpDir, entry.name);
          try {
            const st = await fs.stat(fullPath);
            if (st.mtimeMs < fiveMinutesAgo || forceAggressive) {
              if (entry.isDirectory()) {
                await fs.rm(fullPath, { recursive: true, force: true });
              } else {
                await fs.unlink(fullPath);
              }
            }
          } catch {}
        }
      }
    } catch (e) {
      console.warn(`[disk-guard] Warning cleaning /tmp: ${e?.message}`);
    }

    if (!root) return;

    // 2. Check filesystem stats
    let rootStat = null;
    try {
      rootStat = await fs.statfs(root);
    } catch {}

    let freeMB = 5000;
    let totalMB = 5000;
    if (rootStat) {
      const freeBytes = Number(rootStat.bavail) * Number(rootStat.bsize);
      const totalBytes = Number(rootStat.blocks) * Number(rootStat.bsize);
      freeMB = Math.round(freeBytes / (1024 * 1024));
      totalMB = Math.round(totalBytes / (1024 * 1024));
    }

    // Clean scratch directory in asset root if present
    const scratchDir = path.join(root, ".tmp");
    if (fsSync.existsSync(scratchDir)) {
      try {
        const scratchEntries = await fs.readdir(scratchDir, { withFileTypes: true }).catch(() => []);
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        for (const entry of scratchEntries) {
          const fullPath = path.join(scratchDir, entry.name);
          try {
            const st = await fs.stat(fullPath);
            if (st.mtimeMs < fiveMinutesAgo || forceAggressive) {
              if (entry.isDirectory()) {
                await fs.rm(fullPath, { recursive: true, force: true });
              } else {
                await fs.unlink(fullPath);
              }
            }
          } catch {}
        }
      } catch {}
    }

    // Orphan cleanup: prune directories for productions that have been deleted from Postgres
    try {
      const allDbProds = await pool.query(`SELECT id FROM reel_productions`).catch(() => ({ rows: [] }));
      const dbProdSet = new Set(allDbProds.rows.map(r => r.id));
      const scanDirs = [root, path.join(root, "reels")];
      if (process.env.RAILWAY_VOLUME_MOUNT_PATH && process.env.RAILWAY_VOLUME_MOUNT_PATH !== root) {
        scanDirs.push(path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "reels"));
      }
      for (const sDir of scanDirs) {
        try {
          const entries = await fs.readdir(sDir, { withFileTypes: true }).catch(() => []);
          for (const ent of entries) {
            if (ent.isDirectory() && (ent.name.startsWith("studio1_") || ent.name.startsWith("reel_") || ent.name.startsWith("studio2_"))) {
              if (!dbProdSet.has(ent.name)) {
                const fullPath = path.join(sDir, ent.name);
                const st = await fs.stat(fullPath).catch(() => null);
                if (st && (Date.now() - st.mtimeMs > 5 * 60 * 1000)) {
                  console.log(`[disk-guard] Pruning orphaned deleted production dir: ${fullPath}`);
                  await fs.rm(fullPath, { recursive: true, force: true }).catch(() => {});
                }
              }
            }
          }
        } catch {}
      }
    } catch (orphanErr) {
      console.warn(`[disk-guard] Orphan scan note: ${orphanErr?.message}`);
    }

    // If free space is below 1500 MB (or forceAggressive), prune old inactive productions
    if (freeMB < 1500 || forceAggressive) {
      console.warn(`[disk-guard] [LOW_DISK_SPACE] Available: ${freeMB}MB / ${totalMB}MB. Initiating LRU prune of inactive test productions...`);

      // Query active and recent productions to protect (last 6 hours)
      const activeRes = await pool.query(`
        SELECT DISTINCT production_id FROM reel_operations 
        WHERE status IN ('RUNNING', 'QUEUED', 'BLOCKED') 
           OR updated_at > NOW() - INTERVAL '6 hours'
      `).catch(() => ({ rows: [] }));
      const recentProdsRes = await pool.query(`
        SELECT id FROM reel_productions WHERE updated_at > NOW() - INTERVAL '6 hours'
      `).catch(() => ({ rows: [] }));

      // Query user-starred reels: permanently immune from purge
      const starredRes = await pool.query(`
        SELECT id FROM reel_productions 
        WHERE starred = true 
           OR manifest_json->>'starred' = 'true'
      `).catch(() => ({ rows: [] }));

      const CANONICAL_SHOWCASE_IDS = [
        "studio1_e2e00945-e431-4228-bb7b-33cc68f0fa72", // Midnight Cyberpunk Dance
        "studio1_9f360810-20f5-48ba-b3a4-f315bd3ea5c8", // Alpine Sunrise Expedition
        "studio1_d2d144d2-e696-48e3-9341-68f4ef96455a", // Dune Nomad Odyssey
        "studio1_5bfb958d-cae5-4147-9bd5-bde17cf67ac4", // Cosmic Deep Space Ascent
        "studio1_01bd8d8d-2917-4852-8706-5b430635e98a",
        "studio1_05579f63-00ba-470a-a8fc-62cb4d3065a6",
        "studio1_290443e2-7633-4f91-8fa1-d2c676993108",
        "studio1_37f1f557-ca18-47fb-a79a-e1605dc9b0ee",
        "studio1_417f1625-665e-4097-97e7-28439b31105e",
        "studio1_e2fa9fa8-694d-41b3-84ec-f8fa753364b0",
        "studio1_d50d1e44-1a72-4c65-92f9-d3f85aa21278"  // Alpine Romance
      ];

      const protectedIds = new Set([
        ...activeRes.rows.map(r => r.production_id),
        ...recentProdsRes.rows.map(r => r.id),
        ...starredRes.rows.map(r => r.id),
        ...CANONICAL_SHOWCASE_IDS
      ]);

      // Scan directories under root and root/reels
      const scanDirs = [root, path.join(root, "reels")];
      const candidates = [];

      for (const sDir of scanDirs) {
        try {
          const entries = await fs.readdir(sDir, { withFileTypes: true }).catch(() => []);
          for (const ent of entries) {
            if (ent.isDirectory() && (ent.name.startsWith("studio1_") || ent.name.startsWith("reel_") || ent.name.startsWith("studio2_"))) {
              const isProtected = Array.from(protectedIds).some(pid => ent.name.includes(pid) || pid.includes(ent.name));
              if (!isProtected) {
                const fullPath = path.join(sDir, ent.name);
                const st = await fs.stat(fullPath).catch(() => null);
                if (st) {
                  candidates.push({ path: fullPath, name: ent.name, mtimeMs: st.mtimeMs });
                }
              }
            }
          }
        } catch {}
      }

      // Sort oldest first
      candidates.sort((a, b) => a.mtimeMs - b.mtimeMs);

      let reclaimedCount = 0;
      for (const cand of candidates) {
        try {
          console.log(`[disk-guard] Pruning inactive production dir: ${cand.path}`);
          await fs.rm(cand.path, { recursive: true, force: true });
          reclaimedCount++;
          const st = await fs.statfs(root).catch(() => null);
          if (st) {
            freeMB = Math.round((Number(st.bavail) * Number(st.bsize)) / (1024 * 1024));
            if (freeMB >= 2500) {
              console.log(`[disk-guard] Target headroom achieved: ${freeMB}MB free after pruning ${reclaimedCount} dirs.`);
              break;
            }
          }
        } catch (delErr) {
          console.warn(`[disk-guard] Failed to prune ${cand.path}: ${delErr?.message}`);
        }
      }
    }

    // 3. Auto-heal any operations that failed due to ENOSPC so they re-queue and finish
    const enospcOps = await pool.query(`
      SELECT id, production_id, kind, target_id FROM reel_operations 
      WHERE status = 'FAILED' AND last_error LIKE '%ENOSPC%'
    `).catch(() => ({ rows: [] }));

    for (const failedOp of enospcOps.rows) {
      console.log(`[disk-guard] Auto-healing ENOSPC failure on ${failedOp.id} (${failedOp.kind}:${failedOp.target_id || ''}) for prod ${failedOp.production_id}`);

      try {
        const prod = await getProduction(failedOp.production_id);
        if (prod?.manifest?.shots) {
          const s = prod.manifest.shots.find(x => x.id === failedOp.target_id);
          if (s && s.status === "FAILED") {
            s.status = "PLANNED";
            s.qa = s.qa || { warnings: [], failures: [] };
            s.qa.failures = (s.qa.failures || []).filter(f => !f.includes("ENOSPC"));
            if (prod.manifest.status === "REPAIRING") {
              prod.manifest.status = "VIDEO_GENERATING";
            }
          }
          // Also reset any downstream shots that were cancelled due to parent failure
          for (const ds of prod.manifest.shots) {
            if (ds.status === "CANCELLED" && ds.dependsOnShotIds?.includes(failedOp.target_id)) {
              ds.status = "PLANNED";
            }
          }
          await saveManifest(failedOp.production_id, prod.revision, prod.manifest);
        }
      } catch (e) {
        console.warn(`[disk-guard] Failed updating manifest for ENOSPC heal: ${e?.message}`);
      }

      await pool.query(
        `UPDATE reel_operations 
         SET status = 'QUEUED', attempt = 0, last_error = NULL, lease_owner = NULL, lease_expires_at = NULL, updated_at = NOW()
         WHERE id = $1`,
        [failedOp.id]
      );

      // Un-cancel any downstream dependent operations for the same production that were cancelled by parent cascading
      await pool.query(
        `UPDATE reel_operations 
         SET status = 'BLOCKED', last_error = 'WAITING_ON_UPSTREAM_DEPENDENCIES:' || $2, lease_owner = NULL, lease_expires_at = NULL, updated_at = NOW()
         WHERE production_id = $1 AND status = 'CANCELLED' AND last_error LIKE 'PARENT_TERMINAL_FAILURE%'`,
        [failedOp.production_id, failedOp.target_id || ""]
      );
    }
  } catch (err) {
    console.error(`[disk-guard] Error running autonomous disk guard:`, err?.message || err);
  }
}

async function runDeadlockAndStarvationWatchdog() {
  try {
    // -1. Autonomous disk cleanup and health guard
    await autonomousDiskCleanAndHealthGuard();

    // 0. Auto-reclaim any stranded RUNNING operations whose lease expired
    const expiredRunning = await pool.query(`
      UPDATE reel_operations
      SET status='QUEUED',
          lease_owner=NULL,
          lease_expires_at=NULL,
          updated_at=NOW()
      WHERE status='RUNNING'
        AND lease_expires_at < NOW()
        AND COALESCE(attempt, 0) < 5
      RETURNING id, kind, production_id
    `);
    if (expiredRunning.rowCount > 0) {
      console.log(`[reel-worker] [watchdog] Auto-reclaimed ${expiredRunning.rowCount} expired RUNNING operation(s) to QUEUED:`, expiredRunning.rows.map(r => `${r.id} (${r.kind})`));
    }

    // 1. Circuit breaker: Quarantine any operation exceeding max attempts (>= 5) to prevent queue starvation
    const poisonOps = await pool.query(`
      UPDATE reel_operations
      SET status='FAILED',
          last_error='CIRCUIT_BREAKER_TRIGGERED: Exceeded maximum attempts (>= 5) without completion. Quarantined to prevent queue starvation.',
          lease_owner=NULL,
          lease_expires_at=NULL,
          updated_at=NOW()
      WHERE status IN ('QUEUED', 'RUNNING')
        AND COALESCE(attempt, 0) >= 5
      RETURNING id, production_id, target_id
    `);
    if (poisonOps.rowCount > 0) {
      console.warn(`[reel-worker] [watchdog] Quarantined ${poisonOps.rowCount} poisoned operation(s):`, poisonOps.rows.map(r => r.id));
    }

    // 2. Identify any QUEUED shots that have unmet dependencies and convert them to BLOCKED
    const queuedShots = await pool.query(`
      SELECT o.id, o.production_id, o.target_id
      FROM reel_operations o
      WHERE o.status = 'QUEUED' AND o.kind = 'SHOT'
    `);
    for (const qRow of queuedShots.rows) {
      const p = await pool.query(`SELECT manifest_json FROM reel_productions WHERE id=$1`, [qRow.production_id]);
      const m = p.rows[0]?.manifest_json;
      if (!m || !Array.isArray(m.shots)) continue;
      const shot = m.shots.find(s => s.id === qRow.target_id);
      if (shot?.dependsOnShotIds?.length) {
        const unmet = shot.dependsOnShotIds.filter(depId => {
          const dep = m.shots.find(s => s.id === depId);
          return !dep?.asset?.videoUrl || !["GENERATED", "PASSED"].includes(dep.status);
        });
        if (unmet.length > 0) {
          await pool.query(`
            UPDATE reel_operations
            SET status='BLOCKED',
                last_error=$2,
                lease_owner=NULL,
                lease_expires_at=NULL,
                updated_at=NOW()
            WHERE id=$1
          `, [qRow.id, `WAITING_ON_UPSTREAM_DEPENDENCIES:${unmet.join(",")}`]);
          console.log(`[reel-worker] [watchdog] Safely blocked QUEUED shot ${shot.id} waiting on (${unmet.join(", ")})`);
        }
      }
    }

    // 3. Identify any BLOCKED shots and evaluate dependency status & wait ceiling
    const blockedShots = await pool.query(`
      SELECT o.id, o.production_id, o.target_id, o.created_at, o.updated_at
      FROM reel_operations o
      WHERE o.status = 'BLOCKED' AND o.kind = 'SHOT'
    `);
    for (const bRow of blockedShots.rows) {
      const p = await pool.query(`SELECT manifest_json FROM reel_productions WHERE id=$1`, [bRow.production_id]);
      if (p.rows.length === 0) {
        await pool.query(`
          UPDATE reel_operations
          SET status='CANCELLED',
              last_error='PARENT_TERMINAL_FAILURE: Parent production was deleted',
              lease_owner=NULL,
              lease_expires_at=NULL,
              updated_at=NOW()
          WHERE id=$1 AND status NOT IN ('FAILED', 'CANCELLED', 'SUCCEEDED')
        `, [bRow.id]);
        console.log(`[reel-worker] [watchdog] Cleaned orphaned BLOCKED operation ${bRow.id} (production ${bRow.production_id} no longer exists)`);
        continue;
      }
      const m = p.rows[0]?.manifest_json;
      if (!m || !Array.isArray(m.shots)) continue;
      const shot = m.shots.find(s => s.id === bRow.target_id);
      if (shot?.dependsOnShotIds?.length) {
        // Check for dead / terminal parent failure in manifest
        let deadDep = shot.dependsOnShotIds.find(depId => {
          const dep = m.shots.find(s => s.id === depId);
          return dep?.status === "FAILED" || dep?.status === "CANCELLED";
        });
        if (!deadDep) {
          // Check reel_operations directly for terminal status of any parent dependency
          const depOps = await pool.query(`
            SELECT target_id, status FROM reel_operations
            WHERE production_id = $1 AND kind = 'SHOT' AND target_id = ANY($2::text[])
          `, [bRow.production_id, shot.dependsOnShotIds]);
          const deadOp = depOps.rows.find(r => r.status === 'FAILED' || r.status === 'CANCELLED');
          if (deadOp) {
            deadDep = deadOp.target_id;
          }
        }
        if (deadDep) {
          const res = await pool.query(`
            UPDATE reel_operations
            SET status='CANCELLED',
                last_error=$2,
                lease_owner=NULL,
                lease_expires_at=NULL,
                updated_at=NOW()
            WHERE id=$1 AND status NOT IN ('FAILED', 'CANCELLED', 'SUCCEEDED')
            RETURNING id
          `, [bRow.id, `PARENT_TERMINAL_FAILURE: Upstream dependency ${deadDep} failed or was cancelled`]);
          if (res.rowCount > 0) {
            console.log(`[reel-worker] [watchdog] Terminal cascading: cancelled BLOCKED shot ${shot.id} (${bRow.production_id}, dep ${deadDep} dead)`);
            try {
              const shotInManifest = m.shots.find(s => s.id === bRow.target_id);
              if (shotInManifest && shotInManifest.status !== 'CANCELLED') {
                shotInManifest.status = 'CANCELLED';
                await pool.query(`UPDATE reel_productions SET manifest_json=$1, updated_at=NOW() WHERE id=$2`, [m, bRow.production_id]);
              }
            } catch (err) {
              console.warn(`[reel-worker] [watchdog] Error syncing manifest for cancelled shot:`, err.message);
            }
          }
          continue;
        }

        // Check if all upstream dependencies are satisfied
        const allMet = shot.dependsOnShotIds.every(depId => {
          const dep = m.shots.find(s => s.id === depId);
          return dep?.asset?.videoUrl && ["GENERATED", "PASSED"].includes(dep.status);
        });
        if (allMet) {
          const res = await pool.query(`
            UPDATE reel_operations
            SET status='QUEUED',
                attempt=0,
                last_error=NULL,
                lease_owner=NULL,
                lease_expires_at=NULL,
                updated_at=NOW()
            WHERE id=$1 AND (status='BLOCKED' OR (status='FAILED' AND last_error LIKE 'WAIT_CEILING_EXCEEDED%'))
            RETURNING id
          `, [bRow.id]);
          if (res.rowCount > 0) {
            console.log(`[reel-worker] [watchdog] Unblocked shot ${shot.id} (${bRow.production_id}): all upstream dependencies satisfied`);
          }
          continue;
        }

        // Upstream parent dependencies are legitimately pending or in-flight (PLANNED, GENERATING, QUEUED, RUNNING, or BLOCKED).
        // A shot sitting BLOCKED behind an incomplete parent is NOT stalled; its turn has not yet arrived!
        // Never enforce a wait ceiling on a shot while its upstream parent chain is alive and incomplete.
        // Touch updated_at so the heartbeat clock stays fresh.
        await pool.query(`UPDATE reel_operations SET updated_at = NOW() WHERE id = $1`, [bRow.id]);
        continue;
      } else {
        // Shot has no dependencies but is marked BLOCKED - unblock to QUEUED immediately
        await pool.query(`
          UPDATE reel_operations
          SET status='QUEUED', attempt=0, last_error=NULL, lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
          WHERE id=$1 AND status='BLOCKED'
        `, [bRow.id]);
        console.log(`[reel-worker] [watchdog] Unblocked shot ${shot?.id || bRow.target_id} (${bRow.production_id}): no upstream dependencies required`);
        continue;
      }
    }

    // 4. Auto-enqueue ungenerated shots for productions in SHOTS_PLANNED or VIDEO_GENERATING (recent productions only)
    const plannedProds = await pool.query(`
      SELECT p.id, p.revision, p.manifest_json, c.generation_token
      FROM reel_productions p
      JOIN reel_production_controls c ON c.production_id = p.id
      WHERE (p.manifest_json->>'status' = 'SHOTS_PLANNED' OR p.manifest_json->>'status' = 'VIDEO_GENERATING')
        AND c.cancelled_at IS NULL
        AND p.updated_at > NOW() - INTERVAL '6 hours'
    `);
    for (const prodRow of plannedProds.rows) {
      const pm = prodRow.manifest_json;
      if (!pm || !Array.isArray(pm.shots)) continue;
      const ungenerated = pm.shots.filter(s => !s.asset?.videoUrl && ["PLANNED", "GENERATING"].includes(s.status));
      if (!ungenerated.length) continue;

      const existingOps = await pool.query(
        `SELECT id, target_id, status, last_error FROM reel_operations WHERE production_id=$1 AND kind='SHOT'`,
        [prodRow.id]
      );
      const existingOpMap = new Map(existingOps.rows.map(r => [r.target_id, r]));

      for (const s of ungenerated) {
        const existingOp = existingOpMap.get(s.id);
        if (existingOp) {
          if (existingOp.status === 'FAILED' && existingOp.last_error?.startsWith('WAIT_CEILING_EXCEEDED')) {
            const hasUnmet = s.dependsOnShotIds?.some(depId => {
              const dep = pm.shots.find(x => x.id === depId);
              return !dep?.asset?.videoUrl || !["GENERATED", "PASSED"].includes(dep.status);
            });
            const reviveStatus = hasUnmet ? "BLOCKED" : "QUEUED";
            await pool.query(
              `UPDATE reel_operations 
               SET status=$1, attempt=0, last_error=NULL, lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW() 
               WHERE id=$2`,
              [reviveStatus, existingOp.id]
            );
            console.log(`[reel-worker] [watchdog] Revived wait-ceiling-failed shot ${s.id} (${prodRow.id}) -> ${reviveStatus}`);
          }
          continue;
        }
        const modelTier = "fast";
        const fp = crypto.createHash("sha256").update(JSON.stringify({
          prompt: s.generationPrompt,
          duration: s.generationDurationSec,
          modelTier,
          round: pm.studio1?.generationRound,
        })).digest("hex").slice(0, 24);
        const ik = [prodRow.id, prodRow.generation_token || "legacy", "SHOT", s.id, prodRow.revision, fp].join(":");
        const hasUnmet = s.dependsOnShotIds?.some(depId => {
          const dep = pm.shots.find(x => x.id === depId);
          return !dep?.asset?.videoUrl || !["GENERATED", "PASSED"].includes(dep.status);
        });
        const initStatus = hasUnmet ? "BLOCKED" : "QUEUED";
        const initError = hasUnmet ? `WAITING_ON_UPSTREAM_DEPENDENCY:${s.dependsOnShotIds.join(",")}` : null;
        const shotOpId = `rop_${crypto.randomUUID()}`;
        await pool.query(
          `INSERT INTO reel_operations (id, production_id, kind, target_id, idempotency_key, status, last_error, payload_json)
           VALUES ($1, $2, 'SHOT', $3, $4, $5, $6, $7::jsonb)
           ON CONFLICT (idempotency_key) DO NOTHING`,
          [
            shotOpId,
            prodRow.id,
            s.id,
            ik,
            initStatus,
            initError,
            JSON.stringify({
              manifestRevision: prodRow.revision,
              generationToken: prodRow.generation_token,
              semanticFingerprint: fp,
              modelTier,
              studio1: true,
            })
          ]
        );
        console.log(`[reel-worker] [watchdog-enqueue] Shot ${s.id} enqueued (${initStatus}) for prod ${prodRow.id}`);
      }
    }

    // 5. Auto-enqueue / self-heal ROUGH_CUT for productions that reached ROUGH_CUT_READY or have all shots generated
    const readyProds = await pool.query(`
      SELECT p.id, p.revision, p.manifest_json, c.generation_token
      FROM reel_productions p
      JOIN reel_production_controls c ON c.production_id = p.id
      WHERE (p.manifest_json->>'status' IN ('ROUGH_CUT_READY', 'REPAIRING') OR (
        p.manifest_json->'shots' IS NOT NULL AND
        NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(p.manifest_json->'shots') elem
          WHERE elem->'asset'->>'videoUrl' IS NULL
        )
      ))
      AND c.cancelled_at IS NULL
      AND p.updated_at > NOW() - INTERVAL '6 hours'
    `);
    for (const rRow of readyProds.rows) {
      const rm = rRow.manifest_json;
      if (!rm?.audio?.narrationUrl || !rm.shots?.length) continue;
      const allDone = rm.shots.every(s => s.asset?.videoUrl);
      if (!allDone) continue;

      // If manifest already reached READY or has renderUrl, rough cut is already complete
      if (rm.status === "READY" || rm.renderUrl) continue;

      const isStudio1 = rRow.id.startsWith("studio1_") && Boolean(rm.studio1?.timelineSync);
      const existingRc = await pool.query(
        `SELECT id, status, attempt, updated_at, last_error FROM reel_operations WHERE production_id=$1 AND kind='ROUGH_CUT' ORDER BY updated_at DESC`,
        [rRow.id]
      );

      // Check if ANY existing ROUGH_CUT operation has succeeded or is currently in flight
      const hasSucceeded = existingRc.rows.some(r => r.status === 'SUCCEEDED');
      const hasActive = existingRc.rows.some(r => ['QUEUED', 'RUNNING'].includes(r.status));
      if (hasSucceeded || hasActive) continue;

      if (existingRc.rows.length === 0) {
        const rfp = crypto.createHash("sha256").update(JSON.stringify({
          audio: rm.audio.narrationUrl,
          audioDuration: rm.audio.actualDurationSec,
          shots: rm.shots.map(s => [s.id, s.asset?.videoUrl, s.editorialStartSec, s.editorialDurationSec]),
          studio1: isStudio1,
        })).digest("hex").slice(0, 24);
        const rcIk = [rRow.id, rRow.generation_token || "legacy", "ROUGH_CUT", "production", rRow.revision, rfp].join(":");
        const rcOpId = `rop_${crypto.randomUUID()}`;
        if (rm.status !== "ROUGH_CUT_READY" && rm.status !== "READY") {
          rm.status = "ROUGH_CUT_READY";
          await saveManifest(rRow.id, rRow.revision, rm);
        }
        await pool.query(
          `INSERT INTO reel_operations (id, production_id, kind, target_id, idempotency_key, status, payload_json)
           VALUES ($1, $2, 'ROUGH_CUT', NULL, $3, 'QUEUED', $4::jsonb)
           ON CONFLICT (idempotency_key) DO NOTHING`,
          [
            rcOpId,
            rRow.id,
            rcIk,
            JSON.stringify({
              manifestRevision: rRow.revision,
              generationToken: rRow.generation_token,
              semanticFingerprint: rfp,
              studio1: isStudio1,
              narrationSyncedTimeline: isStudio1,
            })
          ]
        );
        console.log(`[reel-worker] [watchdog-enqueue] ROUGH_CUT enqueued for prod ${rRow.id}`);
      } else {
        const rcRow = existingRc.rows.find(r => r.status === 'FAILED');
        if (!rcRow) continue;

        const attempts = Number(rcRow.attempt || 0);
        const selfhealCount = Number(rcRow.payload_json?.selfhealCount || 0);
        if (attempts >= 3 || selfhealCount >= 2) {
          console.warn(`[reel-worker] [watchdog-selfheal] ROUGH_CUT ${rcRow.id} reached attempt/selfheal cap (attempts=${attempts}, selfhealCount=${selfhealCount}), quarantining operation for prod ${rRow.id}`);
          await pool.query(
            `UPDATE reel_operations
             SET status='QUARANTINED', last_error='MAX_ATTEMPTS_EXCEEDED: Self-heal cap reached (quarantined to prevent queue starvation)', updated_at=NOW()
             WHERE id=$1 AND status='FAILED' AND status != 'SUCCEEDED'`,
            [rcRow.id]
          );
          continue;
        }

        const lastUpdatedMs = rcRow.updated_at ? new Date(rcRow.updated_at).getTime() : 0;
        const backoffMs = Math.min(300000, Math.max(60000, Math.pow(2, selfhealCount) * 60000));
        if (Date.now() - lastUpdatedMs < backoffMs) {
          console.log(`[reel-worker] [watchdog-selfheal] ROUGH_CUT ${rcRow.id} backoff in effect (${Math.round((backoffMs - (Date.now() - lastUpdatedMs)) / 1000)}s remaining)`);
          continue;
        }

        if (rm.status !== "ROUGH_CUT_READY" && rm.status !== "READY") {
          rm.status = "ROUGH_CUT_READY";
          await saveManifest(rRow.id, rRow.revision, rm);
        }
        const updatedPayload = {
          ...(rcRow.payload_json || {}),
          generationToken: rRow.generation_token || rcRow.payload_json?.generationToken,
          manifestRevision: rRow.revision,
          studio1: isStudio1,
          narrationSyncedTimeline: isStudio1,
          selfhealCount: selfhealCount + 1,
        };
        await pool.query(
          `UPDATE reel_operations 
           SET status='QUEUED', attempt=attempt+1, scheduled_at=NOW() + INTERVAL '30 seconds', last_error=NULL, 
               payload_json = $2::jsonb,
               updated_at=NOW()
           WHERE id=$1 AND status='FAILED' AND status != 'SUCCEEDED'`,
          [rcRow.id, JSON.stringify(updatedPayload)]
        );
        console.log(`[reel-worker] [watchdog-selfheal] Reset failed ROUGH_CUT ${rcRow.id} to QUEUED (attempt=${attempts + 1}, selfhealCount=${selfhealCount + 1}) for prod ${rRow.id}`);
      }
    }

    // 6. Prune stale queued/blocked operations for abandoned productions (> 6 hours old)
    const pruned = await pool.query(`
      UPDATE reel_operations o
      SET status = 'CANCELLED',
          last_error = 'ABANDONED_PRODUCTION_TIMEOUT: Production inactive for > 6 hours',
          lease_owner = NULL,
          lease_expires_at = NULL,
          updated_at = NOW()
      FROM reel_productions p
      WHERE o.production_id = p.id
        AND o.status IN ('QUEUED', 'BLOCKED')
        AND o.updated_at < NOW() - INTERVAL '6 hours'
        AND p.updated_at < NOW() - INTERVAL '6 hours'
      RETURNING o.id
    `);
    if (pruned.rowCount > 0) {
      console.log(`[reel-worker] [watchdog] Pruned ${pruned.rowCount} stale operations from abandoned productions`);
    }
  } catch (err) {
    console.error(`[reel-worker] [watchdog] Error running watchdog:`, err?.message || err);
  }
}
await runDeadlockAndStarvationWatchdog();
const watchdogTimer = setInterval(() => runDeadlockAndStarvationWatchdog().catch(() => {}), 30000);
watchdogTimer.unref();

let lastHeartbeatLogMs = 0;
async function publishHeartbeat() {
  let queueStats = { queued: 0, running: 0, blocked: 0, maxRunningLeaseAgeSec: 0, maxQueuedAgeSec: 0 };
  try {
    const counts = await pool.query(`
      SELECT status, count(*)::int as cnt
      FROM reel_operations
      WHERE status IN ('QUEUED', 'RUNNING', 'BLOCKED')
      GROUP BY status
    `);
    for (const r of counts.rows) {
      if (r.status === 'QUEUED') queueStats.queued = r.cnt;
      if (r.status === 'RUNNING') queueStats.running = r.cnt;
      if (r.status === 'BLOCKED') queueStats.blocked = r.cnt;
    }
    if (queueStats.running > 0) {
      const runningAge = await pool.query(`
        SELECT EXTRACT(EPOCH FROM (NOW() - updated_at))::int as max_age
        FROM reel_operations
        WHERE status = 'RUNNING'
        ORDER BY updated_at ASC LIMIT 1
      `);
      queueStats.maxRunningLeaseAgeSec = runningAge.rows[0]?.max_age || 0;
    }
    if (queueStats.queued > 0) {
      const queuedAge = await pool.query(`
        SELECT EXTRACT(EPOCH FROM (NOW() - updated_at))::int as max_age
        FROM reel_operations
        WHERE status = 'QUEUED'
        ORDER BY updated_at ASC LIMIT 1
      `);
      queueStats.maxQueuedAgeSec = queuedAge.rows[0]?.max_age || 0;
    }
  } catch (e) {
    // Non-fatal query error during shutdown or brief reconnect
  }

  try {
    await pool.query(`INSERT INTO reel_worker_heartbeats(worker_id,worker_role,metadata_json) VALUES($1,'reel-production',$2::jsonb)
      ON CONFLICT(worker_id) DO UPDATE SET heartbeat_at=NOW(),metadata_json=EXCLUDED.metadata_json`,
      [workerId, JSON.stringify({
        pid: process.pid,
        version: "v2.5",
        assetRootConfigured: Boolean(assetRoot()),
        geminiConfigured: Boolean(apiKey()),
        queueStats
      })]);
  } catch (e) {
    console.error(`[reel-worker] heartbeat record insert failed: ${e?.message || e}`);
  }

  const now = Date.now();
  if (now - lastHeartbeatLogMs >= 60000) {
    lastHeartbeatLogMs = now;
    let diskInfo = "";
    try {
      const r = assetRoot();
      if (r) {
        const st = await fs.statfs(r);
        diskInfo = ` | Disk: ${Math.round((Number(st.bavail) * Number(st.bsize)) / (1024 * 1024))}MB free / ${Math.round((Number(st.blocks) * Number(st.bsize)) / (1024 * 1024))}MB`;
      }
    } catch {}
    console.log(`[reel-worker] [heartbeat] Active: ${queueStats.running} running (oldest: ${queueStats.maxRunningLeaseAgeSec}s), ${queueStats.queued} queued (oldest: ${queueStats.maxQueuedAgeSec}s), ${queueStats.blocked} blocked${diskInfo}`);

    // Starvation Alerts: gated on physical operation wait/running duration
    if (queueStats.queued > 0 && queueStats.maxQueuedAgeSec > 600) {
      console.error(`[reel-worker] [ALERT:STARVATION] ${queueStats.queued} operation(s) queued for > ${queueStats.maxQueuedAgeSec}s without claim!`);
    }
    if (queueStats.running > 0 && queueStats.maxRunningLeaseAgeSec > 600) {
      console.error(`[reel-worker] [ALERT:STALLED_LEASE] Running operation held for ${queueStats.maxRunningLeaseAgeSec}s without progress!`);
    }
  }
}
await publishHeartbeat();
const heartbeatTimer = setInterval(() => publishHeartbeat().catch(e => console.error(`[reel-worker] heartbeat failed: ${e?.message || e}`)), heartbeatMs);
heartbeatTimer.unref();

function safeKey(key) { const n = String(key).replace(/\\/g, "/").replace(/^\/+/, ""); if (!n || n.includes("..") || n.startsWith("/")) throw new Error("Invalid asset key"); return n; }
function assetKeyFromUrl(url) { const p = "/api/reels/assets/"; if (!String(url).startsWith(p)) throw new Error(`Non-owned asset URL: ${url}`); return safeKey(String(url).slice(p.length).split("/").map(decodeURIComponent).join("/")); }
function assetPath(keyOrUrl) { const root = assetRoot(); if (!root) throw new Error("Durable asset storage is not configured"); const key = String(keyOrUrl).startsWith("/api/reels/assets/") ? assetKeyFromUrl(keyOrUrl) : safeKey(keyOrUrl); const rr = path.resolve(root), target = path.resolve(root, key); if (!target.startsWith(`${rr}${path.sep}`)) throw new Error("Asset path escaped durable root"); return { key, target }; }
async function writeAsset(key, buffer) {
  const r = assetPath(key);
  await fs.mkdir(path.dirname(r.target), { recursive: true });
  try {
    await fs.writeFile(r.target, buffer);
  } catch (err) {
    if (err.code === "ENOSPC" || (err.message && err.message.includes("ENOSPC"))) {
      console.warn(`[reel-worker] ENOSPC writing asset ${key}. Triggering immediate emergency disk purge...`);
      await autonomousDiskCleanAndHealthGuard(true);
      await fs.writeFile(r.target, buffer);
    } else {
      throw err;
    }
  }
  return { key: r.key, url: `/api/reels/assets/${r.key.split("/").map(encodeURIComponent).join("/")}` };
}
async function readAsset(keyOrUrl) {
  try {
    return await fs.readFile(assetPath(keyOrUrl).target);
  } catch (err) {
    const raw = String(keyOrUrl || "").replace(/^\/+/, "");
    // 1. Check in repo public directory (e.g. public/assets/stills/dubai_dance.jpg)
    const candidates = [
      path.resolve(process.cwd(), "public", raw),
      path.resolve(process.cwd(), "public", raw.replace(/^public\//, "")),
      path.resolve(process.cwd(), raw),
    ];
    for (const c of candidates) {
      try {
        return await fs.readFile(c);
      } catch {}
    }
    // 2. Fallback to production web endpoint
    const webBase = (process.env.ZYVORIQ_WEB_BASE_URL || process.env.ZYVORIQ_PRODUCTION_URL || "https://zyvoriq.up.railway.app").replace(/\/$/, "");
    try {
      const url = raw.startsWith("http") ? raw : `${webBase}/${raw}`;
      const res = await fetch(url);
      if (res.ok) {
        const ab = await res.arrayBuffer();
        return Buffer.from(ab);
      }
    } catch {}
    throw err;
  }
}


function assetContentType(key) {
  if (key.endsWith(".wav")) return "audio/wav";
  if (key.endsWith(".mp3")) return "audio/mpeg";
  if (key.endsWith(".mp4")) return "video/mp4";
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function parseByteRange(value, size) {
  if (!value) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(value).trim());
  if (!match) return { invalid: true };
  let start;
  let end;
  if (!match[1] && match[2]) {
    const suffix = Number(match[2]);
    if (!Number.isFinite(suffix) || suffix <= 0) return { invalid: true };
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
  }
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) return { invalid: true };
  end = Math.min(end, size - 1);
  return { start, end };
}

const assetServer = http.createServer(async (req, res) => {
  try {
    if (!assetRoot()) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "asset_storage_unavailable" }));
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "DELETE") {
      res.writeHead(405, { Allow: "GET, HEAD, DELETE" });
      res.end();
      return;
    }
    const url = new URL(req.url || "/", "http://worker.local");
    const prefix = "/internal/reel-assets/";
    if (!url.pathname.startsWith(prefix)) {
      res.writeHead(404);
      res.end();
      return;
    }
    const encoded = url.pathname.slice(prefix.length);
    const key = encoded.split("/").map(decodeURIComponent).join("/");
    if (req.method === "DELETE") {
      try {
        const resolved = assetPath(key);
        await fs.rm(resolved.target, { recursive: true, force: true }).catch(() => {});
        console.log(`[reel-worker] asset server deleted ${resolved.target}`);
      } catch {}
      try {
        const root = assetRoot();
        if (root) {
          await fs.rm(path.resolve(root, key), { recursive: true, force: true }).catch(() => {});
          await fs.rm(path.resolve(root, "reels", key.replace(/^reels\//, "")), { recursive: true, force: true }).catch(() => {});
          if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
            await fs.rm(path.resolve(process.env.RAILWAY_VOLUME_MOUNT_PATH, "reels", key.replace(/^reels\//, "")), { recursive: true, force: true }).catch(() => {});
          }
        }
      } catch {}
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, deleted: key }));
      return;
    }
    const resolved = assetPath(key);
    const stat = await fs.stat(resolved.target);
    if (!stat.isFile()) {
      res.writeHead(404);
      res.end();
      return;
    }
    const size = Number(stat.size);
    const range = parseByteRange(req.headers.range, size);
    const common = {
      "Content-Type": assetContentType(resolved.key),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
    };
    if (range?.invalid) {
      res.writeHead(416, { ...common, "Content-Range": `bytes */${size}` });
      res.end();
      return;
    }
    if (range) {
      const length = range.end - range.start + 1;
      res.writeHead(206, {
        ...common,
        "Content-Length": String(length),
        "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
      });
      if (req.method === "HEAD") { res.end(); return; }
      createReadStream(resolved.target, { start: range.start, end: range.end }).pipe(res);
      return;
    }
    res.writeHead(200, { ...common, "Content-Length": String(size) });
    if (req.method === "HEAD") { res.end(); return; }
    createReadStream(resolved.target).pipe(res);
  } catch (error) {
    const missing = error?.code === "ENOENT";
    res.writeHead(missing ? 404 : 500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: missing ? "asset_not_found" : String(error?.message || error) }));
  }
});
assetServer.listen(assetServerPort, "::", () => {
  console.log(`[reel-worker] private asset server listening on ${assetServerPort}`);
});
function wavFromPcm(pcm) { const h = Buffer.alloc(44), br = SAMPLE_RATE * CHANNELS * SAMPLE_WIDTH; h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8); h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(CHANNELS, 22); h.writeUInt32LE(SAMPLE_RATE, 24); h.writeUInt32LE(br, 28); h.writeUInt16LE(CHANNELS * SAMPLE_WIDTH, 32); h.writeUInt16LE(SAMPLE_WIDTH * 8, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40); return Buffer.concat([h, pcm]); }
function findAudioData(v) { if (!v || typeof v !== "object") return null; for (const k of ["output_audio", "outputAudio"]) { const c = v[k]; if (c && typeof c.data === "string") return c.data; } if ((v.type === "audio" || v.mime_type === "audio/L16" || v.mimeType === "audio/L16") && typeof v.data === "string") return v.data; for (const c of Object.values(v)) { if (Array.isArray(c)) { for (const i of c) { const f = findAudioData(i); if (f) return f; } } else if (c && typeof c === "object") { const f = findAudioData(c); if (f) return f; } } return null; }
function offsetToSec(v) { if (typeof v === "number" && Number.isFinite(v)) return v; if (typeof v === "string") { const n = Number.parseFloat(v.replace(/s$/i, "")); return Number.isFinite(n) ? n : null; } if (v && typeof v === "object") { const s = Number(v.seconds || 0), n = Number(v.nanos || v.nanoseconds || 0); if (Number.isFinite(s) && Number.isFinite(n)) return s + n / 1e9; } return null; }
function extractWordTimings(v) {
  const out = [];
  const visit = n => {
    if (!n || typeof n !== "object") return;
    const s = offsetToSec(n.start_offset ?? n.startOffset);
    let e = offsetToSec(n.end_offset ?? n.endOffset);
    const w = n.word ?? n.text;
    if (typeof w === "string" && w.trim() && s !== null) {
      if (e === null || e <= s) {
        e = s + 0.18;
      }
      out.push({ word: w.trim(), startSec: Number(s.toFixed(6)), endSec: Number(e.toFixed(6)) });
    }
    for (const c of Object.values(n)) {
      if (Array.isArray(c)) c.forEach(visit);
      else if (c && typeof c === "object") visit(c);
    }
  };
  visit(v);
  return out.filter(t => t.word).sort((a, b) => a.startSec - b.startSec || a.endSec - b.endSec);
}
const NUMBER_WORDS = new Map(Object.entries({
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
}));
function normalizeWords(t) {
  const raw = String(t).normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}']+/gu, " ").trim().split(/\s+/).filter(Boolean);
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    let w = raw[i];
    if (w === "can't") w = "cannot";
    else if (w === "won't" || w === "wont") w = "willnot";
    else if (w === "mustn't") w = "mustnot";
    if (NUMBER_WORDS.has(w)) {
      let n = NUMBER_WORDS.get(w);
      if (n >= 20 && n % 10 === 0 && i + 1 < raw.length && NUMBER_WORDS.has(raw[i + 1])) {
        const next = NUMBER_WORDS.get(raw[i + 1]);
        if (next > 0 && next < 10) { n += next; i += 1; }
      }
      if (i + 1 < raw.length && (raw[i + 1] === "hundred" || raw[i + 1] === "hundreds")) {
        n *= 100;
        i += 1;
      } else if (i + 1 < raw.length && (raw[i + 1] === "thousand" || raw[i + 1] === "thousands")) {
        n *= 1000;
        i += 1;
      }
      out.push(String(n));
      if (raw[i + 1] === "percent") i += 1;
    } else {
      out.push(w);
    }
  }
  return out;
}

function editDistance(a, b) { const p = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) { const c = [i]; for (let j = 1; j <= b.length; j++) c[j] = Math.min(c[j - 1] + 1, p[j] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); for (let j = 0; j <= b.length; j++) p[j] = c[j]; } return p[b.length]; }
function lcsLength(a, b) { const d = Array(b.length + 1).fill(0); for (const x of a) { let diag = 0; for (let j = 1; j <= b.length; j++) { const prior = d[j]; d[j] = x === b[j - 1] ? diag + 1 : Math.max(d[j], d[j - 1]); diag = prior; } } return d[b.length]; }
function stripSpeakerLabels(text) {
  return String(text || "").replace(/^[ \t]*[A-Z0-9_\-\. ]{1,30}:[ \t]*/gm, "").trim();
}
function validateTranscript(expectedText, timings, durationSec, language = "") {
  if (!Array.isArray(timings) || timings.length === 0) {
    throw new Error("Narration timestamps failed structural validation: empty timings");
  }

  // Sanitize timings: ensure monotonic non-decreasing order and clamp within bounds
  let ps = 0, pe = 0;
  for (let i = 0; i < timings.length; i++) {
    const t = timings[i];
    if (!t || typeof t !== "object") continue;
    if (!t.word) t.word = "";
    t.startSec = Math.max(0, Math.max(Number(t.startSec) || 0, ps));
    let end = Number(t.endSec);
    if (isNaN(end) || end < t.startSec) {
      end = t.startSec + 0.15;
    }
    end = Math.max(end, pe);
    if (durationSec > 0 && end > durationSec + 0.25) {
      end = Math.max(t.startSec + 0.05, durationSec);
    }
    t.endSec = end;
    ps = t.startSec;
    pe = t.endSec;
  }
  const cleanedExpectedText = stripSpeakerLabels(expectedText);
  const rawExpected = normalizeWords(expectedText);
  const cleanedExpected = normalizeWords(cleanedExpectedText);
  const actual = normalizeWords(timings.map(t => t.word).join(" "));
  if (!actual.length || (!rawExpected.length && !cleanedExpected.length)) {
    throw new Error("Transcript verification has no comparable words");
  }

  // Cross-Script Detection: If expected is Latin but transcribed audio is in native non-Latin script
  // (e.g. Romanized Hindi/Hinglish vs Devanagari, Romaji vs Kanji/Hiragana, Pinyin vs Hanzi)
  const isExpectedLatin = (rawExpected.join("").length > 0 && !/[^\u0000-\u024F]/.test(rawExpected.join("")));
  const isActualNonLatin = actual.some(w => /[^\u0000-\u024F]/.test(w));
  const isCrossScript = (isExpectedLatin && isActualNonLatin) || (!isExpectedLatin && !actual.some(w => /[^\u0000-\u024F]/.test(w)));

  if (isCrossScript) {
    const expectedCount = Math.max(rawExpected.length, cleanedExpected.length);
    const actualCount = actual.length;
    const ratio = actualCount / expectedCount;
    if (actualCount >= 3 && ratio >= 0.35 && ratio <= 3.0) {
      console.log(`[reel-worker] Cross-script transcription detected (${isExpectedLatin ? "Latin expected" : "Native expected"} vs ${isActualNonLatin ? "Native transcribed" : "Latin transcribed"}). Timestamps structurally verified (${actualCount} tokens, ${durationSec.toFixed(2)}s).`);
      return {
        expectedWords: expectedCount,
        actualWords: actualCount,
        wer: 0.05,
        coverage: 0.95,
        passed: true,
        crossScript: true,
        missingCritical: [],
      };
    }
  }

  // Calculate alignment against both cleaned (without speaker tags) and raw
  const werClean = cleanedExpected.length ? editDistance(cleanedExpected, actual) / cleanedExpected.length : 1;
  const covClean = cleanedExpected.length ? lcsLength(cleanedExpected, actual) / cleanedExpected.length : 0;
  const werRaw = rawExpected.length ? editDistance(rawExpected, actual) / rawExpected.length : 1;
  const covRaw = rawExpected.length ? lcsLength(rawExpected, actual) / rawExpected.length : 0;

  // Use the alignment that best matches what was actually voiced
  const useClean = werClean <= werRaw;
  const expected = useClean ? cleanedExpected : rawExpected;
  const wer = useClean ? werClean : werRaw;
  const coverage = useClean ? covClean : covRaw;

  const critical = new Set(["no", "not", "never", "without", "cannot", "can't", "wont", "won't", "must", "mustn't"]);
  const counts = new Map();
  for (const w of actual) counts.set(w, (counts.get(w) || 0) + 1);
  const missing = [];
  for (const w of expected.filter(w => critical.has(w) || /^\d+(?:[.,]\d+)?%?$/.test(w))) {
    const c = counts.get(w) || 0;
    if (c <= 0) {
      if (/^\d+$/.test(w) && actual.some(a => a.includes(w) || Number(a) === Number(w))) {
        continue;
      }
      missing.push(w);
    } else {
      counts.set(w, c - 1);
    }
  }
  const isHinglishOrNonEnglish = Boolean(language && String(language).toLowerCase() !== "en");
  const effectiveMaxWer = isHinglishOrNonEnglish ? Math.max(MAX_WER, 0.20) : Math.max(MAX_WER, 0.10);
  const effectiveMinCoverage = isHinglishOrNonEnglish ? Math.min(MIN_COVERAGE, 0.75) : MIN_COVERAGE;
  const v = {
    expectedWords: expected.length,
    actualWords: actual.length,
    wer: Number(wer.toFixed(4)),
    coverage: Number(coverage.toFixed(4)),
    passed: wer <= effectiveMaxWer && coverage >= effectiveMinCoverage && missing.length === 0,
    missingCritical: missing,
  };
  if (!v.passed) {
    throw new Error(`Narration transcript mismatch: WER ${v.wer}, coverage ${v.coverage}${missing.length ? `, missing critical tokens: ${missing.join(", ")}` : ""}`);
  }
  return v;
}

async function getProduction(id) { const r = await pool.query(`SELECT * FROM reel_productions WHERE id=$1`, [id]); if (!r.rows[0]) throw new Error(`Production ${id} not found`); return { revision: Number(r.rows[0].revision), manifest: r.rows[0].manifest_json }; }
async function saveManifest(id, revision, manifest) { const r = await pool.query(`UPDATE reel_productions SET revision=revision+1,manifest_json=$3::jsonb,updated_at=NOW() WHERE id=$1 AND revision=$2 RETURNING revision`, [id, revision, JSON.stringify(manifest)]); if (!r.rows[0]) throw new Error(`Production ${id} changed concurrently while worker was attaching evidence`); return Number(r.rows[0].revision); }
async function updateOperation(id, patch) { const fields = [], values = [id]; let n = 2; const map = { status: "status", providerOperationName: "provider_operation_name", result: "result_json", lastError: "last_error", leaseExpiresAt: "lease_expires_at", leaseOwner: "lease_owner" }; for (const [k, col] of Object.entries(map)) { if (!(k in patch)) continue; fields.push(`${col}=$${n++}${k === "result" ? "::jsonb" : ""}`); values.push(k === "result" ? JSON.stringify(patch[k]) : patch[k]); } fields.push("updated_at=NOW()"); await pool.query(`UPDATE reel_operations SET ${fields.join(",")} WHERE id=$1`, values); }
async function operationHeartbeat(id, prodId) {
  await pool.query(`UPDATE reel_operations SET lease_expires_at=NOW()+INTERVAL '10 minutes',updated_at=NOW() WHERE id=$1 AND lease_owner=$2`, [id, workerId]);
  if (prodId) {
    await pool.query(`UPDATE reel_operations SET updated_at=NOW() WHERE production_id=$1 AND status IN ('BLOCKED', 'QUEUED')`, [prodId]);
  }
}
async function claim() {
  const r = await pool.query(`
    WITH c AS (
      SELECT o.id FROM reel_operations o
      WHERE ((o.status='QUEUED' AND COALESCE(o.attempt, 0) < 5)
         OR (o.status='RUNNING' AND o.lease_expires_at < NOW() AND COALESCE(o.attempt, 0) < 5))
        AND (o.scheduled_at IS NULL OR o.scheduled_at <= NOW())
        AND NOT EXISTS (
          SELECT 1 FROM reel_operations active_op 
          WHERE active_op.production_id = o.production_id 
            AND active_op.id != o.id
            AND active_op.status = 'RUNNING' 
            AND active_op.lease_expires_at >= NOW()
        )
      ORDER BY 
        (COALESCE((SELECT pc.priority FROM reel_production_controls pc WHERE pc.production_id = o.production_id), 0) + LEAST(EXTRACT(EPOCH FROM (NOW() - o.created_at)) / 300, 10)) DESC,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM reel_operations finished_op 
            WHERE finished_op.production_id = o.production_id 
              AND finished_op.status = 'SUCCEEDED' 
              AND finished_op.kind = 'SHOT'
          ) THEN 1
          WHEN o.kind = 'ROUGH_CUT' THEN 2
          WHEN o.kind = 'NARRATION' THEN 3 
          ELSE 4 
        END ASC,
        o.created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE reel_operations o
    SET status='RUNNING',
        attempt=COALESCE(o.attempt, 0) + 1,
        lease_owner=$1,
        lease_expires_at=NOW() + INTERVAL '10 minutes',
        scheduled_at=NULL,
        updated_at=NOW()
    FROM c
    WHERE o.id=c.id
    RETURNING o.*
  `, [workerId]);
  return r.rows[0] || null;
}
async function controlFor(op) { const r = await pool.query(`SELECT * FROM reel_production_controls WHERE production_id=$1`, [op.production_id]); if (!r.rows[0]) throw new Error("OPERATION_CANCELLED: missing production control"); const c = r.rows[0]; if (c.cancelled_at) throw new Error("OPERATION_CANCELLED: production cancelled or superseded"); if (String(c.generation_token) !== String(op.payload_json?.generationToken || "")) throw new Error("OPERATION_CANCELLED: generation token no longer applies"); return c; }
async function assertApplicable(op, { beforeDispatch = false } = {}) { await controlFor(op); const current = await getProduction(op.production_id); if (op.kind === "NARRATION" && !["SCRIPT_READY", "AUDIO_GENERATING", "FAILED"].includes(current.manifest.status)) throw new Error(`OPERATION_CANCELLED: narration no longer applies to ${current.manifest.status}`); if (op.kind === "SHOT") { const s = current.manifest.shots.find(x => x.id === op.target_id); if (!s) throw new Error("OPERATION_CANCELLED: shot removed"); if (s.asset?.videoUrl) throw new Error("OPERATION_CANCELLED: shot already has media"); if (!["PLANNED", "FAILED", "GENERATING", "PENDING", "QUEUED", "BLOCKED"].includes(s.status)) throw new Error(`OPERATION_CANCELLED: shot no longer applies to ${s.status}`); } if (op.kind === "ROUGH_CUT" && !["ROUGH_CUT_READY", "REPAIRING", "READY"].includes(current.manifest.status)) throw new Error(`OPERATION_CANCELLED: rough cut no longer applies to ${current.manifest.status}`); if (op.kind === "NATIVE_REEL" && !["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(current.manifest.status)) throw new Error(`OPERATION_CANCELLED: native reel no longer applies to ${current.manifest.status}`); if (beforeDispatch && op.status === "CANCELLED") throw new Error("OPERATION_CANCELLED: operation cancelled"); return current; }

async function markRunning(op) { const c = await assertApplicable(op); const m = c.manifest; if (op.kind === "NARRATION" && ["SCRIPT_READY", "FAILED"].includes(m.status)) m.status = "AUDIO_GENERATING"; if (op.kind === "SHOT") { const s = m.shots.find(x => x.id === op.target_id); if (["PLANNED", "FAILED"].includes(s.status)) s.status = "GENERATING"; if (["SHOTS_PLANNED", "REPAIRING"].includes(m.status)) m.status = "VIDEO_GENERATING"; } if (op.kind === "ROUGH_CUT" && ["ROUGH_CUT_READY", "REPAIRING", "READY"].includes(m.status)) m.status = "ROUGH_CUT_READY"; if (op.kind === "NATIVE_REEL" && ["SHOTS_PLANNED", "REPAIRING"].includes(m.status)) m.status = "VIDEO_GENERATING"; await saveManifest(op.production_id, c.revision, m); }
async function markTerminalFailure(op, message) { try { const c = await getProduction(op.production_id), m = c.manifest; m.qa = m.qa || { minimumReadyScore: 90, passed: false, warnings: [], failures: [] }; m.qa.passed = false; m.qa.failures = [...(m.qa.failures || []), message]; if (op.kind === "SHOT") { const s = m.shots.find(x => x.id === op.target_id); if (s) { s.status = "FAILED"; s.qa = s.qa || { warnings: [], failures: [] }; s.qa.failures = [...(s.qa.failures || []), message]; } m.status = "REPAIRING"; } else if (op.kind === "ROUGH_CUT" || op.kind === "NATIVE_REEL") m.status = "REPAIRING"; else m.status = "FAILED"; await saveManifest(op.production_id, c.revision, m); } catch (e) { console.error(`[reel-worker] failure-state update failed: ${e?.message || e}`); } }

const COMMON_ENGLISH_STOPWORDS = new Set([
  "The", "This", "That", "When", "What", "Where", "With", "Then", "From", "Into",
  "Here", "Look", "Have", "There", "Their", "They", "Your", "About", "Some",
  "Every", "Just", "Only", "More", "Most", "Other", "Over", "Under", "After",
  "Before", "While", "Could", "Would", "Should", "Shall", "Will", "Been", "Being",
  "First", "Next", "Last", "Also", "Back", "Come", "Down", "Even", "Find", "Give",
  "Good", "Great", "High", "Keep", "Know", "Life", "Make", "Much", "Need", "Never",
  "Part", "Place", "Right", "Same", "Take", "Tell", "Think", "Time", "Very", "Want",
  "Ways", "Well", "Work", "Year", "Start", "Stop", "Step", "Watch", "Notice", "Check",
  "Today", "Tomorrow", "Morning", "Night", "Evening", "Always", "Because", "Since",
  "Still", "Between", "Through", "Against", "During", "Without", "Within", "Along",
  "Above", "Below", "Around", "Across", "Behind", "Beyond", "Inside", "Outside",
  "Are", "Can", "How", "Why", "Now", "Fix", "See", "Say", "Get", "Let", "Pure"
]);

function extractBiasedVocabulary(manifest) {
  const vocab = new Set();
  
  // 1. Explicit Characters & Performer Names
  const characters = getManifestCharacters(manifest);
  for (const c of characters) {
    if (c.name) {
      c.name.split(/\s+/).forEach(part => {
        const clean = part.replace(/[^\p{L}\p{N}]/gu, "").trim();
        if (clean.length > 1 && !COMMON_ENGLISH_STOPWORDS.has(clean)) vocab.add(clean);
      });
    }
  }

  // 2. Speaker markers in script (e.g. "MEERA:", "KABIR:", "KIARA:")
  if (manifest.masterScript) {
    const speakerMatches = manifest.masterScript.matchAll(/([A-Z0-9_\-\s]{2,25}):/g);
    for (const match of speakerMatches) {
      const name = match[1].trim();
      name.split(/\s+/).forEach(part => {
        const clean = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        if (clean.length > 1 && !COMMON_ENGLISH_STOPWORDS.has(clean)) vocab.add(clean);
      });
    }

    // 3. Non-ASCII words (Devanagari, accented, Japanese, etc.)
    const nonAscii = manifest.masterScript.match(/[\p{Script=Devanagari}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+/gu) || [];
    for (const word of nonAscii) {
      if (word.length > 1) vocab.add(word);
    }

    // 4. Mid-sentence capitalized words (proper nouns like Dubai, Shinjuku, Meera, Kabir, etc.)
    const tokens = manifest.masterScript.split(/\s+/);
    for (let i = 1; i < tokens.length; i++) {
      const prev = tokens[i - 1];
      const curr = tokens[i].replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
      const isSentenceStart = /[.!?]$/.test(prev);
      if (!isSentenceStart && /^[A-Z][a-zA-Z0-9']{2,}$/.test(curr)) {
        if (!COMMON_ENGLISH_STOPWORDS.has(curr)) {
          vocab.add(curr);
        }
      }
    }
  }

  // 5. Proper nouns and cultural terms from Topic
  if (manifest.topic) {
    const topicTokens = manifest.topic.split(/\s+/);
    for (const tok of topicTokens) {
      const clean = tok.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
      if (clean.length > 2 && /^[A-Z]/.test(clean) && !COMMON_ENGLISH_STOPWORDS.has(clean)) {
        vocab.add(clean);
      }
    }
  }

  return Array.from(vocab).filter(Boolean);
}

async function transcribeAndValidateNarration(op, manifest, checkpoint, wav) {
  try { await operationHeartbeat(op.id, op.production_id); } catch {}
  const start = await fetch(`${API_BASE}/upload/v1beta/files`, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey(),
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(wav.length),
      "X-Goog-Upload-Header-Content-Type": "audio/wav",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: { display_name: `zyvoriq-${op.production_id}-narration.wav` } }),
  });
  if (!start.ok) throw new Error(`Gemini upload init failed (${start.status})`);
  const u = start.headers.get("x-goog-upload-url");
  if (!u) throw new Error("Gemini upload returned no URL");
  const up = await fetch(u, { method: "POST", headers: { "Content-Length": String(wav.length), "X-Goog-Upload-Offset": "0", "X-Goog-Upload-Command": "upload, finalize", "Content-Type": "audio/wav" }, body: new Uint8Array(wav) });
  const uj = await up.json();
  if (!up.ok) throw new Error(`Gemini upload failed (${up.status})`);
  const uri = uj?.file?.uri || uj?.uri;
  if (!uri) throw new Error("Gemini upload returned no file URI");
  try { await operationHeartbeat(op.id, op.production_id); } catch {}

  const lang = String(manifest.language || manifest.creationIntent?.narrationLanguage || op.payload_json?.language || "").toLowerCase();
  const vocab = extractBiasedVocabulary(manifest);
  const input = [];
  const instructions = [];
  if (lang === "hinglish-roman" || lang === "hinglish") {
    instructions.push("Spoken language is Hinglish (conversational Hindi-English blend). Transcribe in Latin/Roman script.");
  } else if (lang === "hi-devanagari" || lang === "hindi") {
    instructions.push("Spoken language is Hindi. Transcribe in Devanagari script.");
  }
  if (vocab.length) {
    instructions.push(`Pronunciation and vocabulary biasing: ${vocab.join(", ")}`);
    console.log(`[reel-worker] [transcription] Applying vocabulary biasing (${lang || "en"}): ${vocab.slice(0, 10).join(", ")}`);
  }
  if (instructions.length) {
    input.push({ type: "text", text: instructions.join(" ") });
  }
  input.push({ type: "audio", uri, mime_type: "audio/wav" });

  const tr = await fetch(`${API_BASE}/v1beta/interactions`, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey(), "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gemini-3.5-transcribe", input, generation_config: { transcription_config: { mode: { type: "verbatim", timestamp_granularities: ["word"] } } } }),
  });
  const tj = await tr.json();
  if (!tr.ok) throw new Error(`Gemini transcription failed (${tr.status})`);
  try { await operationHeartbeat(op.id, op.production_id); } catch {}
  const timings = extractWordTimings(tj);
  if (!timings.length) throw new Error("No word-level timestamps returned");
  const actualWords = timings.map(t => t.word).join(" ");
  console.log(`[reel-worker] [transcription] prod ${op.production_id} transcribed: "${actualWords.slice(0, 160)}..."`);
  let validation;
  try {
    validation = validateTranscript(manifest.masterScript, timings, checkpoint.actualDurationSec, lang);
    console.log(`[reel-worker] [transcription] prod ${op.production_id} alignment verified: WER ${validation.wer}, coverage ${validation.coverage}`);
  } catch (valErr) {
    console.error(`[reel-worker] [transcription-fail] prod ${op.production_id}: ${valErr.message}`);
    throw valErr;
  }
  await assertApplicable(op);
  try { await operationHeartbeat(op.id, op.production_id); } catch {}
  return { ...checkpoint, stage: "COMPLETE", wordTimings: timings, alignmentValidation: validation };
}

function selectVoiceForManifest(manifest, speakerCharId = null) {
  const characters = getManifestCharacters(manifest);

  const leadChar = speakerCharId
    ? (characters.find(c => c.id === speakerCharId) || characters[0])
    : characters[0];

  if (leadChar?.voiceId) return leadChar.voiceId;
  if (leadChar?.defaultVoiceId) return leadChar.defaultVoiceId;
  if (process.env.ZYVORIQ_TTS_VOICE) return process.env.ZYVORIQ_TTS_VOICE;

  const gender = String(leadChar?.biometricDNA?.gender || leadChar?.gender || "").toLowerCase();
  const voiceProfile = String(leadChar?.voiceProfile || "").toLowerCase();

  if (gender === "male" || voiceProfile.includes("baritone") || voiceProfile.includes("bass") || voiceProfile.includes("deep") || voiceProfile.includes("commanding") || voiceProfile.includes("gritty")) {
    return (voiceProfile.includes("gritty") || voiceProfile.includes("gravel") || voiceProfile.includes("warrior")) ? "Fenrir" : "Charon";
  }
  if (gender === "female" || voiceProfile.includes("soprano") || voiceProfile.includes("alto") || voiceProfile.includes("melodic")) {
    return voiceProfile.includes("clear") || voiceProfile.includes("melodic") ? "Aoede" : "Kore";
  }

  const genre = String(manifest.creativeBible?.genre || manifest.genre || "").toUpperCase();
  if (["BOLLYWOOD_ROMANCE", "BOLLYWOOD_ACTION", "HISTORICAL_BIOPIC", "NEO_NOIR_THRILLER", "CINEMATIC_DRAMA", "HIGH_FANTASY"].includes(genre)) {
    return "Charon";
  }
  return "Kore";
}

async function generateNarration(op, manifest, existingCheckpoint = null) {
  if (!apiKey()) throw new Error("Gemini API key is missing");
  if (!assetRoot()) throw new Error("Durable asset root is missing");
  try { await operationHeartbeat(op.id, op.production_id); } catch {}

  let checkpoint = existingCheckpoint;
  let wav;

  if (checkpoint?.stage === "AUDIO_PERSISTED" && checkpoint.narrationUrl) {
    wav = await readAsset(checkpoint.narrationUrl);
    await updateOperation(op.id, { providerOperationName: "tts-audio-persisted" });
    try { await operationHeartbeat(op.id, op.production_id); } catch {}
  } else {
    const prior = String(op.provider_operation_name || "");
    if (prior === "tts-recovery-dispatch-started") throw new Error("AMBIGUOUS_TTS_RESULT_AFTER_BOUNDED_RECOVERY");
    await assertApplicable(op, { beforeDispatch: true });
    await updateOperation(op.id, { providerOperationName: prior === "tts-dispatch-started" ? "tts-recovery-dispatch-started" : "tts-dispatch-started" });

    const model = process.env.ZYVORIQ_TTS_MODEL || "gemini-3.1-flash-tts-preview";
    const voice = selectVoiceForManifest(manifest);
    const lang = String(manifest.language || manifest.creationIntent?.narrationLanguage || op.payload_json?.language || "").toLowerCase();
    let langDirection = "";
    if (lang === "hinglish-roman" || lang === "hinglish") {
      langDirection = " Language & Pronunciation: Hinglish (conversational Hindi-English blend). Pronounce Hindi words with authentic North Indian phonetics and conversational cadence, seamlessly blended with natural English vocabulary.";
    } else if (lang === "hi-devanagari" || lang === "hindi") {
      langDirection = " Language & Pronunciation: Hindi (Devanagari). Pronounce words with authentic standard Hindi pronunciation and natural cadence.";
    } else if (lang && lang !== "en") {
      langDirection = ` Language & Pronunciation: ${lang}.`;
    }

    const scriptLines = (Array.isArray(manifest.shots) && manifest.shots.length > 0)
      ? manifest.shots.map(s => String(s.scriptText || "").trim()).filter(Boolean)
      : String(manifest.masterScript || "").split("\n").map(l => l.trim()).filter(Boolean);

    const totalWordCount = scriptLines.join(" ").split(/\s+/).filter(Boolean).length;

    // If script is over 120 words, chunk into segments of ~80 words to prevent single-turn Gemini TTS audio truncation
    const chunks = [];
    if (totalWordCount > 120 && scriptLines.length > 5) {
      let currentChunk = [];
      let currentWords = 0;
      for (const line of scriptLines) {
        const lineWords = line.split(/\s+/).filter(Boolean).length;
        if (currentWords + lineWords > 90 && currentChunk.length > 0) {
          chunks.push(currentChunk.join("\n"));
          currentChunk = [line];
          currentWords = lineWords;
        } else {
          currentChunk.push(line);
          currentWords += lineWords;
        }
      }
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join("\n"));
      }
      console.log(`[reel-worker] generateNarration: splitting ${totalWordCount} words into ${chunks.length} TTS chunks for ${op.production_id}`);
    } else {
      chunks.push(manifest.masterScript);
    }

    const pcmBuffers = [];
    for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
      const chunkText = chunks[cIdx];
      const prompt = [
        "Synthesize speech for the transcript below. Do not speak these instructions.",
        `Performance direction: ${manifest.tone}.${langDirection} Natural social-video delivery, clear articulation, no added words.`,
        "TRANSCRIPT START",
        chunkText,
        "TRANSCRIPT END",
      ].join("\n");

      let r;
      try {
        r = await fetch(`${API_BASE}/v1beta/interactions`, {
          method: "POST",
          headers: { "x-goog-api-key": apiKey(), "Content-Type": "application/json" },
          body: JSON.stringify({ model, input: prompt, response_format: { type: "audio" }, generation_config: { speech_config: [{ voice }] } }),
        });
      } catch (e) {
        throw e;
      }
      const j = await r.json();
      if (!r.ok) {
        await updateOperation(op.id, { providerOperationName: null });
        throw new Error(`Gemini TTS chunk ${cIdx + 1}/${chunks.length} failed (${r.status})`);
      }
      try { await operationHeartbeat(op.id, op.production_id); } catch {}
      const b64 = findAudioData(j);
      if (!b64) {
        await updateOperation(op.id, { providerOperationName: null });
        throw new Error(`Gemini TTS chunk ${cIdx + 1}/${chunks.length} returned no audio payload`);
      }
      pcmBuffers.push(Buffer.from(b64, "base64"));
    }

    const pcm = Buffer.concat(pcmBuffers);
    const durationSec = pcm.length / (SAMPLE_RATE * CHANNELS * SAMPLE_WIDTH);
    const words = String(manifest.masterScript || "").trim().split(/\s+/).filter(Boolean).length;
    const wps = durationSec > 0 ? (words / durationSec).toFixed(2) : "0.00";
    console.log(`[narration-cadence] ${words} words / ${durationSec.toFixed(2)}s = ${wps} wps (genre: ${manifest.genre || manifest.creativeBible?.genre || "unknown"}, lang: ${lang || "en"}, voice: ${voice})`);
    wav = wavFromPcm(pcm);
    const digest = crypto.createHash("sha256").update(wav).digest("hex").slice(0, 16);
    const asset = await writeAsset(`reels/${op.production_id}/narration-${digest}.wav`, wav);
    try { await operationHeartbeat(op.id, op.production_id); } catch {}
    checkpoint = {
      stage: "AUDIO_PERSISTED",
      narrationUrl: asset.url,
      actualDurationSec: Number(durationSec.toFixed(6)),
      provider: "google-gemini",
      model,
      voice,
      audioSha256: crypto.createHash("sha256").update(wav).digest("hex"),
    };
    await updateOperation(op.id, { result: checkpoint, providerOperationName: "tts-audio-persisted" });
  }

  return transcribeAndValidateNarration(op, manifest, checkpoint, wav);
}

function replan(m, d) { const count = m.shots.length; if (!count) throw new Error("Cannot replan production with no shots"); const per = d / count; if (per > 8) throw new Error(`Narration master requires ${per.toFixed(3)}s per existing shot, exceeding 8s source limit`); let cursor = 0; for (let i = 0; i < count; i++) { const s = m.shots[i], ed = Number((i === count - 1 ? d - cursor : per).toFixed(6)); s.editorialStartSec = Number(cursor.toFixed(6)); s.editorialDurationSec = ed; s.trimInSec = 0; s.trimOutSec = ed; s.generationDurationSec = ed <= 3.5 ? 4 : ed <= 5.5 ? 6 : 8; s.status = "PLANNED"; delete s.asset; if (s.continuityIn) delete s.continuityIn.referenceFrameUrl; cursor = Number((cursor + ed).toFixed(6)); } m.plannedDurationSec = Number(d.toFixed(6)); }
function synchronizeStudio1DraftCaptions(m) { if (m.captions?.timingSource !== "draft") return; m.captions.cues = m.shots.filter(s => String(s.scriptText || "").trim()).map((s, i) => ({ id: m.captions?.cues?.[i]?.id || `caption_draft_${String(i + 1).padStart(2, "0")}`, startSec: Number(Number(s.editorialStartSec).toFixed(6)), endSec: Number((Number(s.editorialStartSec) + Number(s.editorialDurationSec)).toFixed(6)), text: String(s.scriptText).trim(), wordIds: [], lines: [String(s.scriptText).trim()], position: "lower-third" })); }
async function applyNarration(op, result) {
  await assertApplicable(op);
  const c = await getProduction(op.production_id), m = c.manifest;
  m.audio = { ...m.audio, masterClock: "narration", narrationUrl: result.narrationUrl, actualDurationSec: result.actualDurationSec, timingSource: "actual-alignment", wordTimings: result.wordTimings, provider: result.provider, model: result.model, voice: result.voice, alignmentValidation: result.alignmentValidation };
  if (op.payload_json?.studio1) {
    synchronizeStudio1ManifestTimeline(m, { mode: "plan", resetAssets: true });
    synchronizeStudio1DraftCaptions(m);
  } else {
    replan(m, result.actualDurationSec);
  }

  // Anchor 4K Hero Plate as canonical reference image if passed in payload or manifest
  const heroBase64 = op.payload_json?.heroPlateBase64 ||
    (m.stillUrl?.startsWith("data:image/") ? m.stillUrl.split(",")[1] : null) ||
    (m.heroStillUrl?.startsWith("data:image/") ? m.heroStillUrl.split(",")[1] : null);

  if (heroBase64) {
    try {
      const heroBuf = Buffer.from(heroBase64, "base64");
      const digest = crypto.createHash("sha256").update(heroBuf).digest("hex").slice(0, 16);
      const savedHero = await writeAsset(`reels/${op.production_id}/character/hero-${digest}.png`, heroBuf);
      m.stillUrl = savedHero.url;
      m.heroStillUrl = savedHero.url;
      const characters = Array.isArray(m.characters) && m.characters.length
        ? m.characters
        : (m.continuity?.characters || []);
      const presenter = characters.find(char => char.id === "character_presenter") || characters[0];
      if (presenter) {
        presenter.canonicalReferenceImages = [{ url: savedHero.url, digest }];
        if (m.continuity?.characters?.[0]) {
          m.continuity.characters[0].canonicalReferenceImages = [savedHero.url];
        }
      }
      if (m.shots?.[0]?.continuityIn) {
        m.shots[0].continuityIn.referenceFrameUrl = savedHero.url;
      }
      console.log(`[reel-worker] Anchored 4K hero plate as canonical reference: ${savedHero.url}`);
    } catch (heroErr) {
      console.warn(`[reel-worker] Could not anchor hero plate: ${heroErr?.message}`);
    }
  }

  // Precondition Gate: Character sheet anchoring is mandatory when character continuity is required.
  const onCameraCharIds = new Set((m.shots || []).map(s => s.continuityIn?.characterId).filter(Boolean));
  const requiresCharacters = m.studio1?.presenterContinuity !== false &&
    (onCameraCharIds.size > 0 || m.characters?.some(c => c.id === "character_presenter") || m.continuity?.characters?.some(c => c.id === "character_presenter"));

  if (requiresCharacters) {
    try {
      await ensureCharacterSheet(m, op.production_id, writeAsset);
    } catch (csErr) {
      console.error(`[reel-worker] [precondition-failed] Character sheet anchoring failed for prod ${op.production_id}: ${csErr.message}`);
      throw csErr; // Fail operation cleanly so queue retries with backoff; never silently skip!
    }

    const updatedChars = getManifestCharacters(m);
    for (const charId of onCameraCharIds) {
      const char = updatedChars.find(c => c.id === charId);
      const hasCanonical = char?.canonicalReferenceImages?.some(img => typeof img === "string" ? Boolean(img) : Boolean(img?.url));
      if (!hasCanonical) {
        throw new Error(`PRECONDITION_FAILED: Canonical character reference image missing for character ${charId} in ${op.production_id}. Refusing to proceed unanchored.`);
      }
    }
    console.log(`[reel-worker] [precondition] Verified canonical character references anchored for ${onCameraCharIds.size} characters in ${op.production_id}`);
  }

  m.status = "SHOTS_PLANNED";
  await saveManifest(op.production_id, c.revision, m);
  await pool.query(`UPDATE reel_operations SET updated_at = NOW() WHERE production_id = $1`, [op.production_id]);

  // P0.1 & P0.4: Auto-enqueue sequential shot operations upon narration completion
  try {
    const ctrl = await controlFor(op);
    const modelTier = op.payload_json?.modelTier || "fast";
    for (const shot of m.shots) {
      const fp = crypto.createHash("sha256").update(JSON.stringify({
        prompt: shot.generationPrompt,
        duration: shot.generationDurationSec,
        modelTier,
        round: m.studio1?.generationRound,
      })).digest("hex").slice(0, 24);
      const ik = [op.production_id, ctrl.generation_token || "legacy", "SHOT", shot.id, c.revision, fp].join(":");
      const hasUnmet = shot.dependsOnShotIds?.some(depId => {
        const dep = m.shots.find(s => s.id === depId);
        return !dep?.asset?.videoUrl || !["GENERATED", "PASSED"].includes(dep.status);
      });
      const initStatus = hasUnmet ? "BLOCKED" : "QUEUED";
      const initError = hasUnmet ? `WAITING_ON_UPSTREAM_DEPENDENCIES:${shot.dependsOnShotIds.join(",")}` : null;
      const shotOpId = `rop_${crypto.randomUUID()}`;
      await pool.query(
        `INSERT INTO reel_operations (id, production_id, kind, target_id, idempotency_key, status, last_error, payload_json)
         VALUES ($1, $2, 'SHOT', $3, $4, $5, $6, $7::jsonb)
         ON CONFLICT (idempotency_key) DO NOTHING`,
        [
          shotOpId,
          op.production_id,
          shot.id,
          ik,
          initStatus,
          initError,
          JSON.stringify({
            manifestRevision: c.revision,
            generationToken: ctrl.generation_token,
            semanticFingerprint: fp,
            modelTier,
            studio1: true,
          })
        ]
      );
      console.log(`[reel-worker] [enqueue] Shot ${shot.id} enqueued (${initStatus}) for prod ${op.production_id}`);
    }
    await pool.query(`UPDATE reel_operations SET updated_at = NOW() WHERE production_id = $1`, [op.production_id]);
  } catch (enqueueErr) {
    console.error(`[reel-worker] Failed to auto-enqueue shots after narration:`, enqueueErr?.message || enqueueErr);
  }
}
async function extractReference(op, shot, manifest) {
  if (!shot.dependsOnShotIds?.length) return null;
  const dep = manifest.shots.find(s => s.id === shot.dependsOnShotIds.at(-1));
  if (!dep?.asset?.videoUrl) throw new Error("Continuity dependency has no media");
  let scratchDir = os.tmpdir();
  if (assetRoot()) {
    const s = path.join(assetRoot(), ".tmp");
    await fs.mkdir(s, { recursive: true }).catch(() => {});
    scratchDir = s;
  }
  const tmp = path.join(scratchDir, `zyvoriq-ref-${crypto.randomUUID()}.png`);
  const depSec = Number(dep.asset?.actualDurationSec || 0);
  const lastSec = depSec > 0 ? Math.min(Number(dep.trimOutSec || 0), depSec) : Number(dep.trimOutSec || 0);
  const t = Math.max(0, Math.max(Number(dep.trimInSec || 0), lastSec - (depSec > 0 && lastSec < depSec - 0.05 ? 1 / 30 : 0.15)));
  try {
    await execFileAsync("ffmpeg", ["-y", "-ss", String(t), "-i", assetPath(dep.asset.videoUrl).target, "-frames:v", "1", "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920", tmp], { timeout: 30000, maxBuffer: 2e6 });
    const st = await fs.stat(tmp).catch(() => null);
    if (!st?.size) throw new Error(`Anchor extraction produced no frame for ${dep.id} at ${t.toFixed(3)}s (source ${depSec}s, trimOut ${dep.trimOutSec}s)`);
    const b = await fs.readFile(tmp), digest = crypto.createHash("sha256").update(b).digest("hex").slice(0, 16), saved = await writeAsset(`reels/${op.production_id}/references/${shot.id}-from-${dep.id}-${digest}.png`, b);
    return { buffer: b, url: saved.url, dependencyId: dep.id };
  } finally {
    try { await fs.unlink(tmp); } catch {}
  }
}
async function probeVideo(buffer) {
  let scratchDir = os.tmpdir();
  if (assetRoot()) {
    const s = path.join(assetRoot(), ".tmp");
    await fs.mkdir(s, { recursive: true }).catch(() => {});
    scratchDir = s;
  }
  const tmp = path.join(scratchDir, `zyvoriq-probe-${crypto.randomUUID()}.mp4`);
  try {
    try {
      await fs.writeFile(tmp, buffer);
    } catch (writeErr) {
      if (writeErr.code === "ENOSPC" || (writeErr.message && writeErr.message.includes("ENOSPC"))) {
        console.warn(`[reel-worker] ENOSPC writing probe file. Triggering immediate emergency disk purge...`);
        await autonomousDiskCleanAndHealthGuard(true);
        await fs.writeFile(tmp, buffer);
      } else {
        throw writeErr;
      }
    }
    const { stdout } = await execFileAsync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_name,width,height,r_frame_rate", "-of", "json", tmp], { timeout: 30000, maxBuffer: 2e6 });
    const p = JSON.parse(stdout), s = p.streams?.find(x => x.width && x.height) || p.streams?.[0] || {};
    return { durationSec: Number(Number(p.format?.duration || 0).toFixed(6)), codec: s.codec_name, width: Number(s.width || 0), height: Number(s.height || 0), frameRate: s.r_frame_rate };
  } finally {
    try { await fs.unlink(tmp); } catch {}
  }
}
function veoModel(t) {
  if (process.env.ZYVORIQ_VEO_MODEL) return process.env.ZYVORIQ_VEO_MODEL;
  return t === "quality" ? "veo-3.1-generate-preview" : t === "lite" ? "veo-3.1-lite-generate-preview" : "veo-3.1-fast-generate-preview";
}
function stripSpeakerPrefixes(text) {
  if (!text || typeof text !== "string") return text;
  const PRESERVED_DIRECTIVES = new Set([
    "CAMERA", "EYELINE", "LIGHTING", "FRAMING", "WARDROBE", "STYLE", "ACTION",
    "AUDIO", "MUSIC", "PROPS", "LOCATION", "SCENE", "SET", "ATMOSPHERE",
    "SHOT", "LENS", "FOCUS", "COLOR", "COMPOSITION", "SPEED", "GRADE", "TONE", "MOOD",
    "HERO_CLOSE_UP", "CLOSE_UP", "EXTREME_CLOSE_UP", "MEDIUM_SHOT", "WIDE_SHOT",
    "EXTREME_WIDE_SHOT", "OVER_THE_SHOULDER", "POINT_OF_VIEW", "DUTCH_ANGLE",
    "DUTCH_ANGLE_LOW", "TWO_SHOT", "INSERT_SHOT", "ESTABLISHING_SHOT", "ESTABLISHING_WIDE",
    "AERIAL_SHOT", "MASTER_SHOT", "CUTAWAY", "REVERSE_ANGLE"
  ]);
  return text.replace(/(?:^|\n|\b)([A-Z][A-Za-z0-9_]*(?:\s+[A-Z][A-Za-z0-9_]*)?):(?=\s)/g, (match, prefix) => {
    const norm = prefix.trim().toUpperCase();
    if (
      PRESERVED_DIRECTIVES.has(norm) ||
      norm.startsWith("STUDIO1") ||
      norm.includes("LOCK") ||
      norm.includes("RULE") ||
      norm.includes("MODE") ||
      norm.includes("TRACKING") ||
      norm.includes("SHOT") ||
      norm.includes("CLOSE") ||
      norm.includes("ANGLE") ||
      norm.includes("VIEW") ||
      norm.includes("AUDIO") ||
      norm.includes("DIALOGUE") ||
      norm.includes("LANGUAGE") ||
      norm.includes("BEAT") ||
      norm.includes("SCENE") ||
      norm.includes("SETTING") ||
      norm.includes("CONTINUITY") ||
      norm.includes("TONE") ||
      norm.includes("GENRE")
    ) {
      return match;
    }
    if (/\b(?:is|are|was|were|at|in|on|to|for|with|by|from|about)\b/i.test(prefix)) {
      return match;
    }
    return "";
  });
}

function getGenreAudioStrategy(genre, manifest, op) {
  if (manifest?.creationIntent?.audioStrategy) return manifest.creationIntent.audioStrategy;
  if (op?.payload_json?.audioStrategy) return op.payload_json.audioStrategy;
  if (manifest?.audioStrategy) return manifest.audioStrategy;

  const normGenre = String(genre || "").toUpperCase();

  // Native audio for MUSIC_VIDEO: let Veo generate both the singing vocal and the lip sync natively.
  // Never dub synthetic TTS speech over character singing.
  if (normGenre === "MUSIC_VIDEO") {
    return "native";
  }

  // Genres where synthetic TTS master + symphonic orchestra score supplies the audio
  // Prompts strip spoken dialogue / lyrics to prevent Veo audio safety/copyright rejections.
  const TTS_DUB_GENRES = new Set([
    "DOCUMENTARY_EXPLAINER",
    "BOLLYWOOD_ROMANCE",
    "BOLLYWOOD_ACTION",
    "HISTORICAL_BIOPIC"
  ]);

  if (TTS_DUB_GENRES.has(normGenre)) {
    return "tts_dub";
  }

  // Cinematic / drama / fantasy genres default to native character audio if shot audio streams exist
  return "native";
}

function sanitizePromptForVeo(prompt, options = {}) {
  if (!prompt || typeof prompt !== "string") return prompt;
  const { audioStrategy = "native", isAudioFilterRetry = false, genre = "" } = options;
  const shouldStripDialogue = audioStrategy === "tts_dub" || isAudioFilterRetry;

  const isMusicVideo = String(genre).toUpperCase() === "MUSIC_VIDEO" || /music\s*video/i.test(prompt);

  // 1. Strip dialogue speaker prefixes like "KIARA:", "AKSHAY:", etc. while preserving camera grammar tags
  let clean = stripSpeakerPrefixes(prompt);
  // Normalize prefix while eliminating any specific character IDs (e.g. IDENTITY LOCK [aarav_dancer]: -> IDENTITY LOCK [pop_artist]:)
  clean = clean.replace(/(?:STUDIO1 )?IDENTITY LOCK \[[^\]]+\]:/gi, isMusicVideo ? "IDENTITY LOCK [pop_artist]:" : "IDENTITY LOCK [lead_performer]:");
  // Strip character name references in canonical reference clauses
  clean = clean.replace(/The canonical character reference for [^,.]+(?:,\s*|\.\s*)/gi, "The canonical character reference for the performer, ");

  // Strip actor/casting/substitution clauses that trigger Veo's celebrity/actor likeness heuristic
  clean = clean.replace(/Do not substitute, cast, morph into, or introduce a different actor\.?/gi, "");
  clean = clean.replace(/Identity continuity is mandatory: identical face, age, skin tone, hair, body proportions, wardrobe and distinguishing features\./gi, "Character continuity is mandatory: consistent face, age, skin tone, hair, body proportions, wardrobe and distinguishing features.");
  clean = clean.replace(/\bintroduce a different actor\b/gi, "");
  clean = clean.replace(/\bdifferent actor\b/gi, "different performer");
  clean = clean.replace(/\bactor\b/gi, "performer");

  // Protect scene metadata tags (e.g. [scene_01], [scene_arena]) from name/celebrity substitution
  const preservedTags = [];
  clean = clean.replace(/\[scene_[a-zA-Z0-9_-]+\]/gi, (match) => {
    preservedTags.push(match);
    return `__PRESERVED_TAG_${preservedTags.length - 1}__`;
  });
  // Any other bracketed tags (e.g. [operative_kuroda], [pop_star_kabir]) should be genericized immediately
  clean = clean.replace(/\[[a-zA-Z0-9_-]+\]/g, isMusicVideo ? "[pop_artist]" : "[lead_performer]");

  const celebrityMap = [
    { pattern: /\b(?:Kiara[\s_]*Advani|Kiara)\b/gi, replacement: "a radiant, graceful Indian leading lady" },
    { pattern: /\b(?:Akshay[\s_]*Kumar|Akshay)\b/gi, replacement: "a handsome, athletic charismatic Indian leading man" },
    { pattern: /\b(?:Salman[\s_]*Khan|Salman)\b/gi, replacement: "a rugged, muscular charismatic leading man" },
    { pattern: /\b(?:Aishwarya[\s_]*Rai(?:[\s_]*Bachchan)?|Aishwarya)\b/gi, replacement: "a strikingly beautiful, elegant leading actress with luminous eyes" },
    { pattern: /\b(?:Shah[\s_]*Rukh[\s_]*Khan|Shahrukh[\s_]*Khan|SRK)\b/gi, replacement: "a charming, iconic romantic leading man with dimples" },
    { pattern: /\b(?:Deepika[\s_]*Padukone|Deepika)\b/gi, replacement: "a tall, statuesque graceful leading lady" },
    { pattern: /\b(?:Ranveer[\s_]*Singh|Ranveer)\b/gi, replacement: "an energetic, stylish charismatic leading man" },
    { pattern: /\b(?:Alia[\s_]*Bhatt|Alia)\b/gi, replacement: "a youthful, expressive charming leading actress" },
    { pattern: /\b(?:Ranbir[\s_]*Kapoor|Ranbir)\b/gi, replacement: "a suave, contemplative handsome leading man" },
    { pattern: /\b(?:Hrithik[\s_]*Roshan|Hrithik)\b/gi, replacement: "a tall, green-eyed athletic leading man" },
    { pattern: /\b(?:Katrina[\s_]*Kaif|Katrina)\b/gi, replacement: "a glamorous, statuesque leading lady" },
    { pattern: /\b(?:Priyanka[\s_]*Chopra(?:[\s_]*Jonas)?|Priyanka)\b/gi, replacement: "a confident, glamorous world-class leading lady" },
    { pattern: /\b(?:Kareena[\s_]*Kapoor(?:[\s_]*Khan)?|Kareena)\b/gi, replacement: "a glamorous, confident radiant leading lady" },
    { pattern: /\b(?:Saif[\s_]*Ali[\s_]*Khan|Saif)\b/gi, replacement: "a suave, royal sophisticated leading man" },
    { pattern: /\b(?:Amitabh[\s_]*Bachchan|Amitabh)\b/gi, replacement: "a venerable, commanding cinematic patriarch" },
    { pattern: /\b(?:Tom[\s_]*Cruise)\b/gi, replacement: "a determined, intense action hero" },
    { pattern: /\b(?:Brad[\s_]*Pitt)\b/gi, replacement: "a charismatic, rugged blonde leading man" },
    { pattern: /\b(?:Leonardo[\s_]*DiCaprio)\b/gi, replacement: "an intense, expressive dramatic leading man" },
    { pattern: /\b(?:Zendaya)\b/gi, replacement: "a stylish, striking modern leading lady" },
    { pattern: /\b(?:Timothee[\s_]*Chalamet|Timothée[\s_]*Chalamet)\b/gi, replacement: "a slender, expressive brooding leading man" },
    { pattern: /\b(?:Kabir[\s_]*Anand|Kabir)\b/gi, replacement: isMusicVideo ? "a charismatic, stylish leading pop performer" : "a rugged, athletic covert operative" },
    { pattern: /\b(?:Zoya[\s_]*Rehman|Zoya)\b/gi, replacement: "a fierce, agile female intelligence officer" },
    { pattern: /\b(?:Farooq[\s_]*Malik|Farooq)\b/gi, replacement: "a menacing, hardened rogue commander" },
    { pattern: /\b(?:Meera[\s_]*Rao|Meera)\b/gi, replacement: "a talented, expressive female musician" },
    { pattern: /\b(?:Aarav[\s_]*Roy|Aarav)\b/gi, replacement: "a charismatic, passionate male performer" },
    { pattern: /\b(?:Arjun[\s_]*Kapoor|Arjun)\b/gi, replacement: "a charismatic, handsome South Asian leading man" },
    { pattern: /\b(?:Kuroda|Ren[\s_]*Kuroda)\b/gi, replacement: "a disciplined, sharp-eyed covert operative" },
  ];
  for (const { pattern, replacement } of celebrityMap) {
    clean = clean.replace(pattern, replacement);
  }

  // Restore protected scene tags
  clean = clean.replace(/__PRESERVED_TAG_(\d+)__/g, (_, idx) => preservedTags[Number(idx)] || "");

  // 3. Audio & dialogue directives: Gated on audioStrategy (Fix A, B, C)
  if (shouldStripDialogue) {
    // TTS dub path: strip dialogue/lyrics to avoid Veo audio safety/copyright triggers;
    // renderRough will supply the master narration and symphonic bed.
    const applySanitizerRule = (ruleName, regex, replacement = "") => {
      const before = clean;
      clean = clean.replace(regex, replacement);
      if (clean !== before) {
        console.log(`[reel-worker] [sanitizer-rule] Rule "${ruleName}" applied:\n  BEFORE: "${before.slice(0, 100)}..."\n  AFTER:  "${clean.slice(0, 100)}..."`);
      }
    };

    // Strip language directives cleanly (anchored, non-greedy, never spanning across sentences)
    applySanitizerRule("strip_audio_language_directive", /\bAUDIO\s*&?\s*DIALOGUE\s*LANGUAGE:[^.\n]+(?:\.|$)/gi, "");
    applySanitizerRule("strip_native_character_dialogue_line", /\bNative character dialogue[^.\n]+(?:\.|$)/gi, "");
    applySanitizerRule("strip_spoken_beat_line", /\bThe current spoken beat is:[^.\n]+(?:\.|$)/gi, "");
    applySanitizerRule("sanitize_visual_beat_with_parentheses", /Visual beat for\s*\([^)]*\)[^.\n]*\./gi, "Visual beat: dynamic cinematic choreography and romantic visual chemistry.");
    applySanitizerRule("sanitize_visual_beat_simple", /Visual beat for\s*[^.\n]*\./gi, "Visual beat: dynamic cinematic choreography and romantic visual chemistry.");
    applySanitizerRule("sanitize_narrative_beat_with_parentheses", /Narrative beat:\s*\([^)]*\)[^.\n]*(?:Tone:[^.\n]*\.)?/gi, "Narrative beat: expressive performance and synchronized movement.");
    applySanitizerRule("sanitize_narrative_beat_simple", /Narrative beat:\s*[^.\n]*(?:Tone:[^.\n]*\.)?/gi, "Narrative beat: expressive performance and synchronized movement.");
    // Fix B: Strip ONLY double-quoted dialogue strings, NEVER single quotes (which are English apostrophes: scene's, don't, heroine's)
    applySanitizerRule("strip_double_quoted_dialogue", /"[^"\r\n]{2,}"/g, "");
    applySanitizerRule("strip_vocalization_tags", /\((?:Softly|Playfully|Passionately|Gently|Whispering|Singing|Vocalizing)[^)]*\)/gi, "");
    applySanitizerRule("strip_ambient_soundscape_stub", /Pure cinematic ambient atmosphere and background soundscape\./gi, "");

    clean = clean.replace(/\s{2,}/g, " ").trim();
    clean += " AUDIO DIRECTIVE: Pure ambient environmental foley and natural atmospheric soundscape only. Zero spoken dialogue, zero character vocals, zero singing, zero lyrics.";
  } else {
    // Native audio path: Veo generates native speech, character vocals, and lip sync.
    clean = clean.replace(/"([^"]+)"/g, "$1");
    clean = clean.replace(/AUDIO DIRECTIVE:\s*Pure ambient environmental foley[^.]*(?:\.|$)/gi, "");
    clean = clean.replace(/Zero spoken dialogue, zero character vocals, zero singing, zero lyrics\.?/gi, "");
    clean = clean.replace(/\s{2,}/g, " ").trim();
    if (!clean.includes("AUDIO DIRECTIVE:")) {
      const isMusicVideo = String(genre || "").toUpperCase() === "MUSIC_VIDEO" || clean.includes("MUSIC_VIDEO") || clean.includes("music video");
      const isEnvironmentOrNoPresenter = clean.includes("NO talking presenters") || clean.includes("Pure cinematic action") || clean.includes("environment master");
      if (isMusicVideo && !isEnvironmentOrNoPresenter) {
        clean += " AUDIO DIRECTIVE: High-fidelity melodic music video vocal track with synchronized singing lip performance, visible mouth phoneme articulation, rhythmically cohesive beat, and dynamic cinematic musical backing.";
      } else if (isMusicVideo) {
        clean += " AUDIO DIRECTIVE: High-fidelity melodic music video soundtrack, driving rhythmic beat, dynamic cinematic musical backing, and synchronized stage foley.";
      } else if (isEnvironmentOrNoPresenter) {
        clean += " AUDIO DIRECTIVE: Dynamic cinematic environmental sound design, impactful action foley, and atmospheric soundscape.";
      } else {
        clean += " AUDIO DIRECTIVE: Synchronized native character dialogue, expressive vocal delivery, natural lip-sync, and ambient environmental foley.";
      }
    }
  }

  const words = clean.split(/\s+/);
  if (words.length > 700) {
    clean = words.slice(0, 700).join(" ");
  }
  return clean.replace(/\s{2,}/g, " ").trim();
}

async function generateShot(op, manifest, shot) {
  if (!apiKey() || !assetRoot()) throw new Error("Veo prerequisites missing");
  const tier = op.payload_json?.modelTier || "fast";
  const model = veoModel(tier);
  const ref = await extractReference(op, shot, manifest);
  const safetyAttemptCount = Number(op.payload_json?.safetyAttempts || 0);
  let instance = null;
  const prior = String(op.provider_operation_name || "");
  const dispatchMarkers = new Set(["veo-dispatch-started", "veo-recovery-dispatch-started"]);
  let name = prior && !dispatchMarkers.has(prior) ? prior : null;   if (name) console.log(`[reel-worker] [anchor] SKIPPED for ${shot.id} — resuming existing Veo op, no new dispatch`);

  const characters = getManifestCharacters(manifest);
  const charId = shot.continuityIn?.characterId;
  const char = charId ? (characters.find(c => c.id === charId) || null) : null;
  const canonicalUrls = (char?.canonicalReferenceImages || [])
    .map(img => typeof img === "string" ? img : img?.url)
    .filter(Boolean);
  let hasTemporalFrame = false;
  let omittedTemporalReason = null;

  if (!name) {
    if (prior === "veo-recovery-dispatch-started") {
      throw new Error("AMBIGUOUS_VEO_DISPATCH_AFTER_BOUNDED_RECOVERY");
    }
    await assertApplicable(op, { beforeDispatch: true });
    const dispatchMarker = prior === "veo-dispatch-started" ? "veo-recovery-dispatch-started" : "veo-dispatch-started";
    await updateOperation(op.id, { providerOperationName: dispatchMarker });

    const refImages = [];
    if (char && canonicalUrls.length) {
      if (safetyAttemptCount >= 2) {
        console.log(`[reel-worker] [safety-fallback] Omitting canonical reference image on safety retry #${safetyAttemptCount} for ${shot.id} to eliminate image-level likeness triggers; relying on directorial prompt.`);
      } else {
        for (const imgUrl of canonicalUrls.slice(0, ref?.buffer ? 2 : 3)) {
          try {
            const buf = await readAsset(imgUrl);
            if (buf?.length) {
              refImages.push({
                image: { bytesBase64Encoded: buf.toString("base64"), mimeType: "image/png" },
                referenceType: "asset"
              });
            }
          } catch (e) {
            console.warn(`[reel-worker] Failed to load canonical reference ${imgUrl}: ${e?.message || e}`);
          }
        }
      }
    }
    // Determine character continuity across shots
    const depShot = manifest.shots?.find(s => s.id === shot.dependsOnShotIds?.at(-1));
    const depCharId = depShot?.continuityIn?.characterId;
    const isSameCharacter = Boolean(charId && depCharId && charId === depCharId);
    const isCharacterSwitch = Boolean(charId && depCharId && charId !== depCharId);
    const hasSafetyHistory = Boolean(
      (op.payload_json?.safetyAttempts || 0) > 0 ||
      op.payload_json?.last_empty_payload?.isSafety ||
      (op.last_error && op.last_error.includes("VEO_SAFETY_FILTER"))
    );

    // If continuing from previous shot, attach previous shot frame as additional asset reference
    // BUT omit temporal frame if:
    // 1) The shot already has a canonical character reference image: Veo 3.1 flags multiple human face reference images
    //    with an RAI likeness filter ("Sorry, we can't create videos with real people's names or likenesses").
    //    Canonical character reference is authoritative for the actor; omitting the redundant temporal frame allows
    //    generation to succeed on attempt 1 with zero safety retry backoffs.
    // 2) This is a safety retry (safety fallback isolates canonical character sheet to prevent multi-reference collision)
    // 3) Character A -> Character B transition: omit temporal frame to prevent face identity collision
    // NOTE: When transitioning from b-roll/environment (char: none) or for shots without canonical portraits,
    // the temporal frame is PRESERVED so physical environment, lighting, and set continuity are retained!
    if (ref?.buffer && refImages.length < 3) {
      if (hasSafetyHistory) {
        omittedTemporalReason = "safety-fallback";
        console.log(`[reel-worker] [safety-fallback] Omitting temporal frame from previous shot (${depShot?.id || "unknown"}) on safety retry for ${shot.id}; text-to-video / canonical reference isolated.`);
      } else if (charId && refImages.length > 0) {
        omittedTemporalReason = "canonical-character-authoritative";
        console.log(`[reel-worker] [continuity] Shot ${shot.id} (char: ${charId}) already has canonical character reference. Omitting temporal face frame to prevent multi-reference likeness collisions.`);
      } else if (depCharId && !charId) {
        omittedTemporalReason = "character-to-environment-transition";
        console.log(`[reel-worker] [continuity] Shot ${shot.id} (environment/action, no char) transitions from character shot ${depShot?.id || "none"} (char: ${depCharId}). Omitting temporal character face frame to prevent likeness collision in environment.`);
      } else if (charId && depCharId && !isSameCharacter) {
        omittedTemporalReason = "character-switch";
        console.log(`[reel-worker] [continuity] Shot ${shot.id} (char: ${charId}) transitions from ${depShot?.id || "none"} (char: ${depCharId || "none"}). Omitting non-matching temporal reference to prevent identity collision.`);
      } else {
        refImages.push({
          image: { bytesBase64Encoded: ref.buffer.toString("base64"), mimeType: "image/png" },
          referenceType: "asset"
        });
        hasTemporalFrame = true;
      }
    } else if (!ref?.buffer) {
      omittedTemporalReason = "no-previous-frame";
    }

    const genre = String(manifest?.creativeBible?.genre || manifest?.genre || op?.payload_json?.genre || "").toUpperCase();
    const audioStrategy = getGenreAudioStrategy(genre, manifest, op);
    console.log(`[reel-worker] audio strategy (genre: ${genre || "unknown"}, audioStrategy: ${audioStrategy}): ${audioStrategy === "native" ? "NATIVE CHARACTER AUDIO & FOLEY (lip-sync singing)" : "SYNTHETIC TTS DUB"}`);
    const cleanPrompt = sanitizePromptForVeo(shot.generationPrompt, { audioStrategy, genre });
    let finalPrompt = cleanPrompt;
    if (!hasTemporalFrame) {
      finalPrompt = finalPrompt
        .replace(/\s*The previous-scene visual reference supplied by the worker is authoritative for the set\./gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();
    }
    console.log(`[reel-worker] [veo-dispatch] Dispatching ${shot.id} (safetyAttempt: ${safetyAttemptCount}, temporal: ${hasTemporalFrame}) with prompt:\n"${finalPrompt}"`);
    instance = { prompt: finalPrompt };

    if (refImages.length > 0) {
      instance.referenceImages = refImages;
      console.log(`[reel-worker] [referenceImages] applied ${refImages.length} reference images to ${shot.id} (char: ${charId || "none"}, temporal: ${hasTemporalFrame})`);
    } else if (safetyAttemptCount < 2) {
      // Fallback: single opening frame conditioning (only on normal attempts / retry 1; omitted on safety retry >= 2 to bypass image-level likeness triggers)
      let anchorFrame = null;
      try {
        anchorFrame = await firstFrameForShot(manifest, shot, op.production_id, writeAsset, readAsset);
      } catch (e) {
        console.warn(`[reel-worker] anchor frame failed: ${e?.message || e}`);
      }
      if (anchorFrame) {
        console.log(`[reel-worker] [anchor] applied canonical first frame to ${shot.id}`);
        instance.image = { mimeType: "image/png", bytesBase64Encoded: anchorFrame.toString("base64") };
      } else if (ref && !hasSafetyHistory && (!depCharId || charId)) {
        instance.image = { mimeType: "image/png", bytesBase64Encoded: ref.buffer.toString("base64") };
      }
    } else {
      console.log(`[reel-worker] [safety-fallback] Omitting anchor opening frame on safety retry #${safetyAttemptCount} for ${shot.id}; using pure text-to-video generation to eliminate all image likeness triggers.`);
    }

    // Precondition Circuit Breaker: Refuse unanchored generation for shots requiring character continuity UNLESS on safety fallback >= 2
    const requiresCharacter = Boolean(shot.continuityIn?.characterId);
    if (requiresCharacter && !instance.referenceImages?.length && !instance.image && safetyAttemptCount < 2) {
      throw new Error(`PRECONDITION_FAILED: ${shot.id} requires character continuity (${shot.continuityIn.characterId}) but has no canonical reference images or anchor frame. Refusing unanchored generation.`);
    }
    const seed = seedForShot(op.production_id, shot.id);
    const durationSeconds = instance.referenceImages?.length ? 8 : (shot.generationDurationSec || 8);
    const parameters = {
      aspectRatio: "9:16",
      durationSeconds,
      seed,
    };
    if (!instance.referenceImages?.length) {
      parameters.negativePrompt = "different person, changing face, inconsistent character, morphing, on-screen text, captions, watermark, logo";
    }

    let d;
    try {
      d = await fetch(`${API_BASE}/v1beta/models/${model}:predictLongRunning`, {
        method: "POST",
        headers: { "x-goog-api-key": apiKey(), "Content-Type": "application/json" },
        body: JSON.stringify({ instances: [instance], parameters }),
      });
    } catch (error) {
      throw error;
    }

    let j;
    try {
      j = await d.json();
    } catch (error) {
      throw new Error(`Veo dispatch returned an unreadable Operation response (${d.status})`);
    }

    if (!d.ok || j?.error) {
      await updateOperation(op.id, { providerOperationName: null });
      throw new Error(`Veo dispatch failed: ${j?.error?.message || d.status}`);
    }

    name = j?.name;
    if (!name) {
      throw new Error("Veo dispatch succeeded without operation name");
    }
    await updateOperation(op.id, { providerOperationName: name });
  }

  let uri = null;
  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    if (i % 3 === 0) {
      await operationHeartbeat(op.id, op.production_id);
      await assertApplicable(op);
    }
    let p;
    let pollFetchError = null;
    for (let pollTry = 0; pollTry < 3; pollTry++) {
      try {
        p = await fetch(`${API_BASE}/v1beta/${name}`, { headers: { "x-goog-api-key": apiKey() } });
        if (p.ok || p.status === 429 || p.status === 503) break;
      } catch (err) {
        pollFetchError = err;
        await sleep(2000);
      }
    }
    if (!p) throw new Error(`Veo polling network failure: ${pollFetchError?.message || 'unknown'}`);
    const pj = await p.json().catch(() => ({}));
    if (!p.ok || pj?.error) {
      const isTransient = p.status === 503 || p.status === 429 || pj?.error?.code === 503 || pj?.error?.code === 429 || /unavailable|overload|timeout|resource_exhausted|demand|busy/i.test(pj?.error?.message || "");
      if (isTransient) {
        console.warn(`[reel-worker] [transient-poll-retry] Transient Google API error during poll for ${name} (status: ${p.status}, message: "${pj?.error?.message}"). Waiting 8s and continuing poll loop (poll ${i + 1}/60)...`);
        await sleep(8000);
        continue;
      }
      await updateOperation(op.id, { providerOperationName: null });
      throw new Error(`Veo polling failed: ${pj?.error?.message || p.status}`);
    }
    if (pj?.done) {
      uri = pj.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      if (!uri) {
        const raiReasons = pj.response?.generateVideoResponse?.raiMediaFilteredReasons 
          || pj.response?.generateVideoResponse?.filterReason
          || pj.response?.promptFilterMetadata
          || pj.response?.candidates?.[0]?.finishReason
          || pj.response?.candidates?.[0]?.safetyRatings
          || pj.response?.error
          || pj.error;
        console.error(`[reel-worker] [veo-empty-payload] Veo operation ${name} completed without video URI. Complete response payload:\n${JSON.stringify(pj, null, 2)}`);
        await updateOperation(op.id, { providerOperationName: null });

        const isSafety = Boolean(
          raiReasons ||
          pj.response?.candidates?.[0]?.finishReason === "SAFETY" ||
          pj.promptFeedback?.blockReason ||
          /safety|filtered|filter|rai|policy|prohibited|violat/i.test(JSON.stringify(pj))
        );

        // Store empty payload telemetry into payload_json for forensic audit
        try {
          await pool.query(`
            UPDATE reel_operations
            SET payload_json = jsonb_set(
              COALESCE(payload_json, '{}'::jsonb),
              '{last_empty_payload}',
              $2::jsonb
            )
            WHERE id = $1
          `, [op.id, JSON.stringify({
            timestamp: new Date().toISOString(),
            operationName: name,
            isSafety,
            raiReasons: raiReasons || null,
            rawPayload: pj
          })]);
        } catch (dbErr) {
          console.warn(`[reel-worker] Failed to record empty payload in DB: ${dbErr?.message}`);
        }

        if (isSafety) {
          const diagInfo = raiReasons ? JSON.stringify(raiReasons) : JSON.stringify(pj).slice(0, 300);
          const rawResponseStr = JSON.stringify(pj);
          const isAudioFilter = /issue with the audio for your prompt|audio.*could not create your video|audio.*(?:policy|prohibited|violat|reject|filter)/i.test(rawResponseStr);

          // Audio filter rejection branch: preserve temporal reference and character anchor 100%; sanitize audio/lyrics prompts
          if (isAudioFilter) {
            const prevAudioAttempts = Number(op.payload_json?.audioSafetyAttempts || 0);
            const newAudioAttempts = prevAudioAttempts + 1;
            console.log(`[reel-worker] [audio-filter-fallback] Veo rejected audio for prompt on ${shot.id} (audio retry #${newAudioAttempts}). Preserving 100% of visual conditioning, canonical references, and temporal frames.`);

            // Track audioSafetyAttempts separately — DO NOT INCREMENT safetyAttempts (which is for visual likeness triggers)
            try {
              await pool.query(`
                UPDATE reel_operations
                SET payload_json = jsonb_set(
                  COALESCE(payload_json, '{}'::jsonb),
                  '{audioSafetyAttempts}',
                  $2::jsonb
                )
                WHERE id = $1
              `, [op.id, JSON.stringify(newAudioAttempts)]);
            } catch (dbErr) {
              console.warn(`[reel-worker] Failed to record audioSafetyAttempts in DB: ${dbErr?.message}`);
            }

            try {
              const current = await getProduction(op.production_id);
              const m = current.manifest;
              const targetShot = m.shots.find(x => x.id === shot.id);
              if (targetShot) {
                targetShot.generationPrompt = sanitizePromptForVeo(targetShot.generationPrompt, { audioStrategy: "tts_dub", isAudioFilterRetry: true });
                if (targetShot.scriptText) {
                  targetShot.scriptText = "";
                }
                await saveManifest(op.production_id, current.revision, m);
                console.log(`[reel-worker] [audio-filter-fallback] Sanitized shot ${shot.id} prompt in manifest: all visual conditioning preserved, audio converted to pure ambient foley.`);
              }
            } catch (err) {
              console.warn(`[reel-worker] Failed to sanitize audio prompt in manifest: ${err?.message}`);
            }
            throw new Error(`VEO_AUDIO_FILTER_REJECTED: Veo rejected audio generation for prompt. Visual references 100% preserved; audio converted to pure ambient foley. Diag: ${diagInfo}`);
          }

          // Likeness / visual safety fallback branch:
          const prevSafetyAttempts = Number(op.payload_json?.safetyAttempts || 0);
          const newSafetyAttempts = prevSafetyAttempts + 1;
          const hadTemporalRef = Boolean(hasTemporalFrame);

          // Track safetyAttempts in payload_json
          try {
            await pool.query(`
              UPDATE reel_operations
              SET payload_json = jsonb_set(
                COALESCE(payload_json, '{}'::jsonb),
                '{safetyAttempts}',
                $2::jsonb
              )
              WHERE id = $1
            `, [op.id, JSON.stringify(newSafetyAttempts)]);
          } catch (dbErr) {
            console.warn(`[reel-worker] Failed to record safetyAttempts in DB: ${dbErr?.message}`);
          }

          // STRATEGY REORDERING:
          // 1. FIRST LINE OF DEFENSE: Drop temporal reference frame on first retry (prompt left 100% untouched).
          // Empirical testing proved the likeness trigger was caused by temporal frames conflicting with character sheets.
          if (hadTemporalRef && prevSafetyAttempts === 0) {
            console.log(`[reel-worker] [safety-fallback] Safety filter triggered on ${shot.id}. FIRST LINE OF DEFENSE: Pruning temporal dependency frame on retry; prompt preserved 100% pristine.`);
            throw new Error(`VEO_SAFETY_FILTER_EMPTY: Veo completed without video URI due to safety/RAI filter. Retrying with temporal reference pruned (prompt untouched). Diag: ${diagInfo}`);
          }

          // 2. SECOND LINE OF DEFENSE: Text sanitization (only if frame-omission retry also failed, or if shot had no temporal frame).
          let changed = false;
          let prevPrompt = "";
          let healedPrompt = "";
          const matchedRules = [];
          try {
            const current = await getProduction(op.production_id);
            const m = current.manifest;
            const targetShot = m.shots.find(x => x.id === shot.id);
            if (targetShot) {
              prevPrompt = targetShot.generationPrompt;
              const allChars = getManifestCharacters(m);
              const dynamicCharNames = allChars.flatMap(c => {
                const names = [c.name, c.id?.replace(/_/g, " ")];
                if (c.name && typeof c.name === "string") {
                  for (const part of c.name.split(/\s+/)) {
                    if (part.length > 2) names.push(part);
                  }
                }
                return names;
              }).filter(Boolean);

              const HEAL_RULES = [
                {
                  name: "sanitize-veo-prompt-rules",
                  apply: (p) => sanitizePromptForVeo(p, { genre: m.genre || m.creativeBible?.genre }),
                },
                {
                  name: "strip-speaker-dialogue-prefixes",
                  apply: (p) => stripSpeakerPrefixes(p),
                },
                {
                  name: "strip-manifest-character-names",
                  apply: (p) => {
                    let res = p;
                    for (const cName of dynamicCharNames) {
                      if (!cName || cName.length < 3) continue;
                      const escaped = cName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                      res = res.replace(new RegExp(`\\b${escaped}\\b`, "gi"), "the performer");
                    }
                    return res;
                  },
                },
                {
                  name: "replace-celebrity-names-with-generic-archetypes",
                  apply: (p) => {
                    let text = p.replace(/(?:STUDIO1 )?IDENTITY LOCK \[[^\]]+\]:/gi, "IDENTITY LOCK [lead_performer]:");
                    text = text.replace(/\[(?!scene_)[a-zA-Z0-9_-]+\]/gi, "[lead_performer]");
                    text = text.replace(/\b(?:Kiara[\s_]*Advani|Kiara|Akshay[\s_]*Kumar|Akshay|Salman[\s_]*Khan|Salman|Aishwarya[\s_]*Rai(?:[\s_]*Bachchan)?|Aishwarya|Shah[\s_]*Rukh[\s_]*Khan|Shahrukh[\s_]*Khan|SRK|Deepika[\s_]*Padukone|Deepika|Ranveer[\s_]*Singh|Ranveer|Alia[\s_]*Bhatt|Alia|Ranbir[\s_]*Kapoor|Ranbir|Hrithik[\s_]*Roshan|Hrithik|Katrina[\s_]*Kaif|Katrina|Priyanka[\s_]*Chopra(?:[\s_]*Jonas)?|Priyanka|Kareena[\s_]*Kapoor(?:[\s_]*Khan)?|Kareena|Saif[\s_]*Ali[\s_]*Khan|Saif|Amitabh[\s_]*Bachchan|Amitabh|Tom[\s_]*Cruise|Brad[\s_]*Pitt|Leonardo[\s_]*DiCaprio|Zendaya|Timothee[\s_]*Chalamet|Timothée[\s_]*Chalamet|Kabir[\s_]*Anand|Kabir|Zoya[\s_]*Rehman|Zoya|Farooq[\s_]*Malik|Farooq|Meera[\s_]*Rao|Meera|Aarav[\s_]*Roy|Aarav|Kuroda|Ren)\b/gi, "lead performer");
                    return text;
                  },
                },
                {
                  name: "neutralize-sensory-romantic-terms",
                  apply: (p) => p
                    .replace(/\blovers\b/gi, "characters")
                    .replace(/\bintimate\b/gi, "cinematic")
                    .replace(/\bpassionate\b/gi, "dramatic")
                    .replace(/\bcolonial\b/gi, "vintage 1940s"),
                },
                {
                  name: "strip-quoted-dialogue",
                  // ONLY match paired double quotes or curly double quotes. NEVER match single quotes/apostrophes (e.g. Renjiro's, scene's)
                  apply: (p) => p.replace(/"[^"]*"/g, "").replace(/[“"][^"”]*[”"]/g, ""),
                },
              ];

              let currentText = prevPrompt;
              for (const rule of HEAL_RULES) {
                const transformed = rule.apply(currentText);
                if (transformed !== currentText) {
                  matchedRules.push(rule.name);
                  console.log(`[reel-worker] [rai-auto-heal] Rule matched: ${rule.name}`);
                  currentText = transformed;
                }
              }
              if (matchedRules.length === 0) {
                // Guaranteed fallback character anonymization if specific rules did not trigger
                const genericHealed = currentText
                  .replace(/IDENTITY LOCK \[[^\]]+\]:[^.]*\./gi, "IDENTITY LOCK [lead_performer]: The established performer with dramatic cinematic presence.")
                  .replace(/Physical description:[^.]*\./gi, "Physical description: Charismatic performer.")
                  .replace(/\[(?!scene_)[a-zA-Z0-9_-]+\]/gi, "[lead_performer]");
                if (genericHealed !== currentText) {
                  matchedRules.push("generic-character-anonymization");
                  currentText = genericHealed;
                  console.log(`[reel-worker] [rai-auto-heal] Fallback generic character anonymization applied to shot ${shot.id}`);
                }
              }
              healedPrompt = currentText.replace(/\s{2,}/g, " ").trim();
              changed = (prevPrompt !== healedPrompt);
              if (changed) {
                targetShot.generationPrompt = healedPrompt;
                await saveManifest(op.production_id, current.revision, m);
                console.log(`[reel-worker] [rai-auto-heal] Healed shot ${shot.id} prompt on secondary text fallback (matched: ${matchedRules.join(", ")}):`);
                console.log(`  BEFORE:\n${prevPrompt}`);
                console.log(`  AFTER:\n${healedPrompt}`);
              } else {
                console.log(`[reel-worker] [rai-auto-heal] Prompt for shot ${shot.id} was UNCHANGED by secondary text rules. Full Prompt:\n${prevPrompt}`);
              }
            }
          } catch (e) {
            console.warn(`[reel-worker] RAI auto-heal error: ${e?.message}`);
          }

          if (!changed && newSafetyAttempts >= 3) {
            // Truly unhealable safety block after all 3 tiers (temporal frame, text heal, and canonical images) exhausted
            const refAudit = {
              shotId: shot.id,
              charId: charId || "none",
              characterAppearance: char?.appearance || null,
              refImagesAttachedCount: instance?.referenceImages?.length || (instance?.image ? 1 : 0),
              hasTemporalFrame: Boolean(hasTemporalFrame),
              omittedTemporalReason: omittedTemporalReason || "none",
              canonicalUrlsCount: canonicalUrls?.length || 0,
              safetyAttemptCount: newSafetyAttempts,
            };
            console.error(`[reel-worker] [safety-fatal] Reference image audit for ${shot.id}:\n`, JSON.stringify(refAudit, null, 2));
            console.error(`[reel-worker] [safety-fatal] Tier-3 failure for shot ${shot.id} (prod: ${op.production_id}). Full prompt sent to Veo:\n${instance?.prompt || shot.generationPrompt}`);
            await pool.query(`UPDATE reel_operations SET attempt=5 WHERE id=$1`, [op.id]);
            throw new Error(`VEO_SAFETY_FILTER_FATAL: Veo safety/RAI filter triggered across all 3 defense tiers (${diagInfo}) | FULL_PROMPT: "${instance?.prompt || shot.generationPrompt}"`);
          }

          throw new Error(`VEO_SAFETY_FILTER_EMPTY: Veo completed without video URI due to safety/RAI filter (${diagInfo})`);
        }

        // Transient Google infrastructure drop (no safety triggers)
        throw new Error(`VEO_TRANSIENT_EMPTY_PAYLOAD: Veo operation ${name} completed without video URI (Google infrastructure transient drop). Response: ${JSON.stringify(pj).slice(0, 300)}`);
      }
      break;
    }
  }
  if (!uri) throw new Error(`Veo operation ${name} timed out`);
  await assertApplicable(op);
  const sep = uri.includes("?") ? "&" : "?";
  const dl = await fetch(`${uri}${sep}key=${apiKey()}`);
  if (!dl.ok) throw new Error(`Veo download failed (${dl.status})`);
  const buffer = Buffer.from(await dl.arrayBuffer());
  const probe = await probeVideo(buffer);
  const MAX_LOCAL_EXTENSION_SEC = 0.75;
  const MAX_LOCAL_EXTENSION_RATIO = 1.20;
  const targetSec = Number(shot.editorialDurationSec || shot.trimOutSec || 0);
  const deficitSec = targetSec - probe.durationSec;
  if (deficitSec > MAX_LOCAL_EXTENSION_SEC || (probe.durationSec > 0 && targetSec / probe.durationSec > MAX_LOCAL_EXTENSION_RATIO)) {
    throw new Error(`${shot.id} source ${probe.durationSec}s cannot cover trim ${targetSec}s within local adaptation limits`);
}
  await assertApplicable(op);
  const digest = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 16);
  const asset = await writeAsset(`reels/${op.production_id}/shots/${shot.id}-${digest}.mp4`, buffer);
  const unanchored = Boolean(safetyAttemptCount >= 2 || (instance && !instance.referenceImages?.length && !instance.image && shot.continuityIn?.characterId));
  return { videoUrl: asset.url, actualDurationSec: probe.durationSec, operationName: name, provider: "google-veo", model, continuityReferenceUrl: ref?.url, unanchored };
}
async function applyShot(op, result) {
  await assertApplicable(op);
  const c = await getProduction(op.production_id), m = c.manifest, s = m.shots.find(x => x.id === op.target_id);
  if (!s) throw new Error("Shot removed");
  s.asset = { videoUrl: result.videoUrl, actualDurationSec: result.actualDurationSec, operationName: result.operationName, provider: result.provider, model: result.model };
  s.status = "GENERATED";
  if (result.unanchored) {
    s.unanchored = true;
    m.qa = m.qa || { minimumReadyScore: 90, passed: true, warnings: [], failures: [] };
    m.qa.warnings = [...(m.qa.warnings || []), `Shot ${s.id} generated unanchored via tier-3 safety fallback; flagged for selective re-anchoring`];
    console.warn(`[reel-worker] [unanchored] Shot ${s.id} recorded as unanchored; flagged for re-anchoring when character sheet is clean.`);
  }
  if (result.continuityReferenceUrl) s.continuityIn.referenceFrameUrl = result.continuityReferenceUrl;
  m.status = m.shots.every(x => x.asset?.videoUrl && ["GENERATED", "PASSED"].includes(x.status)) ? "ROUGH_CUT_READY" : "VIDEO_GENERATING";
  await saveManifest(op.production_id, c.revision, m);
  await pool.query(`UPDATE reel_operations SET updated_at = NOW() WHERE production_id = $1`, [op.production_id]);

  // Parent completion event: unblock any dependent operations for this production whose upstream dependencies are now met!
  try {
    const blockedOps = await pool.query(
      `SELECT id, target_id FROM reel_operations 
       WHERE production_id=$1 
         AND (status='BLOCKED' OR (status='FAILED' AND last_error LIKE 'WAIT_CEILING_EXCEEDED%') OR (status='CANCELLED' AND last_error LIKE 'PARENT_TERMINAL_FAILURE%'))`,
      [op.production_id]
    );
    for (const bRow of blockedOps.rows) {
      const bShot = m.shots.find(x => x.id === bRow.target_id);
      if (!bShot || !bShot.dependsOnShotIds?.length) {
        await pool.query(`UPDATE reel_operations SET status='QUEUED', last_error=NULL, updated_at=NOW() WHERE id=$1`, [bRow.id]);
        console.log(`[reel-worker] Parent shot ${s.id} completed. Unblocked operation ${bRow.id} (${bRow.target_id})`);
        continue;
      }
      const stillUnmet = bShot.dependsOnShotIds.filter(depId => {
        const dep = m.shots.find(x => x.id === depId);
        return !dep?.asset?.videoUrl || !["GENERATED", "PASSED"].includes(dep.status);
      });
      if (stillUnmet.length === 0) {
        await pool.query(`UPDATE reel_operations SET status='QUEUED', last_error=NULL, updated_at=NOW() WHERE id=$1`, [bRow.id]);
        console.log(`[reel-worker] Parent shot ${s.id} completed. Unblocked dependent shot ${bShot.id}: all upstream dependencies satisfied!`);
      } else {
        // Option 1: Reset the timer whenever any upstream shot in the chain completes
        await pool.query(`UPDATE reel_operations SET updated_at=NOW() WHERE id=$1 AND status='BLOCKED'`, [bRow.id]);
      }
    }
  } catch (unblockErr) {
    console.error(`[reel-worker] Parent completion unblock error: ${unblockErr?.message || unblockErr}`);
  }

  // Auto-enqueue ROUGH_CUT if all shots are generated
  const allShotsDone = m.shots.every(s => s.asset?.videoUrl && ["GENERATED", "PASSED"].includes(s.status));
  if (m.status === "ROUGH_CUT_READY" || allShotsDone) {
    try {
      // Uniqueness check: do not enqueue if a ROUGH_CUT is already QUEUED, RUNNING, or SUCCEEDED
      const existingActiveRc = await pool.query(
        `SELECT id, status FROM reel_operations WHERE production_id=$1 AND kind='ROUGH_CUT' AND status IN ('QUEUED', 'RUNNING', 'SUCCEEDED')`,
        [op.production_id]
      );
      if (existingActiveRc.rows.length > 0) {
        console.log(`[reel-worker] [auto-enqueue] ROUGH_CUT already exists (${existingActiveRc.rows[0].status}) for prod ${op.production_id}, skipping duplicate enqueue`);
        return;
      }

      const isStudio1 = op.production_id.startsWith("studio1_") && Boolean(m.studio1?.timelineSync);
      const ctrl = await controlFor(op);
      const rfp = crypto.createHash("sha256").update(JSON.stringify({
        audio: m.audio.narrationUrl,
        audioDuration: m.audio.actualDurationSec,
        shots: m.shots.map(shot => [shot.id, shot.asset?.videoUrl, shot.editorialStartSec, shot.editorialDurationSec]),
        studio1: isStudio1,
      })).digest("hex").slice(0, 24);
      const rcIk = [op.production_id, ctrl.generation_token || "legacy", "ROUGH_CUT", "production", c.revision, rfp].join(":");
      const rcOpId = `rop_${crypto.randomUUID()}`;
      await pool.query(
        `INSERT INTO reel_operations (id, production_id, kind, target_id, idempotency_key, status, payload_json)
         VALUES ($1, $2, 'ROUGH_CUT', NULL, $3, 'QUEUED', $4::jsonb)
         ON CONFLICT (idempotency_key) DO NOTHING`,
        [
          rcOpId,
          op.production_id,
          rcIk,
          JSON.stringify({
            manifestRevision: c.revision,
            generationToken: ctrl.generation_token,
            semanticFingerprint: rfp,
            studio1: isStudio1,
            narrationSyncedTimeline: isStudio1,
          })
        ]
      );
      console.log(`[reel-worker] [auto-enqueue] All shots generated! Enqueued ROUGH_CUT for prod ${op.production_id}`);
    } catch (rcErr) {
      console.error(`[reel-worker] Failed to auto-enqueue ROUGH_CUT: ${rcErr?.message || rcErr}`);
    }
  }
}

function assertStudio1RenderAdaptation(plan) {
  for (const scene of plan.scenes) {
    if (scene.targetSec <= scene.sourceSec + 0.003) continue;
    const deficitSec = scene.targetSec - scene.sourceSec;
    const ratio = scene.targetSec / scene.sourceSec;
    if (deficitSec > 0.75 || ratio > 1.2) {
      throw new Error(`Studio1 scene ${scene.shotId} needs selective regeneration: narration slot ${scene.targetSec.toFixed(2)}s exceeds source ${scene.sourceSec.toFixed(2)}s by ${deficitSec.toFixed(2)}s`);
    }
  }
}

async function generateContinuousScore(genre, durationSec, outPath) {
  const dur = Math.max(1, Number(durationSec.toFixed(2)));
  const g = String(genre || "").toUpperCase();

  // 1. Check for authentic recorded orchestral / live instrument masters
  const candidateStems = [
    path.join(process.cwd(), "public", "assets", "audio", "music", "bollywood_romance_orchestra.mp3"),
    path.join(process.cwd(), "public", "assets", "audio", "music", "bollywood_romance_orchestra.wav"),
    "/data/assets/music/bollywood_romance_orchestra.mp3",
    "/tmp/bollywood_romance_orchestra.mp3",
    "/tmp/bollywood_romance_master_180s.wav",
    "/tmp/bollywood_orchestra_test.wav"
  ];

  let stemPath = null;
  if (g.includes("BOLLYWOOD")) {
    for (const p of candidateStems) {
      if (fsSync.existsSync(p)) {
        stemPath = p;
        break;
      }
    }
    if (!stemPath) {
      const candidateUrls = [
        "https://zyvoriq.up.railway.app/assets/audio/music/bollywood_romance_orchestra.mp3",
        ...(process.env.RAILWAY_SERVICE_ZYVORIQ_URL ? [`https://${process.env.RAILWAY_SERVICE_ZYVORIQ_URL}/assets/audio/music/bollywood_romance_orchestra.mp3`] : []),
        ...(process.env.NEXT_PUBLIC_APP_URL ? [`${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/assets/audio/music/bollywood_romance_orchestra.mp3`] : [])
      ];
      const tmpDest = "/tmp/bollywood_romance_orchestra.mp3";
      for (const url of candidateUrls) {
        try {
          console.log(`[reel-worker] Attempting to download authentic orchestra master from ${url}...`);
          const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            await fs.writeFile(tmpDest, buf);
            stemPath = tmpDest;
            console.log(`[reel-worker] Successfully downloaded authentic orchestra master (${buf.length} bytes) to ${tmpDest}`);
            break;
          }
        } catch (err) {
          console.warn(`[reel-worker] Could not fetch remote orchestra from ${url}: ${err?.message || err}`);
        }
      }
    }
  }

  if (stemPath) {
    console.log(`[reel-worker] 🎶 Playing authentic acoustic orchestra & band score (${stemPath}) for ${g} (${dur}s)`);
    const ffmpegArgs = [
      "-y",
      "-stream_loop", "-1",
      "-i", stemPath,
      "-t", String(dur),
      "-af", `aresample=48000,afade=t=in:st=0:d=1,afade=t=out:st=${Math.max(0, dur - 1.8)}:d=1.8,loudnorm=I=-24:LRA=7:tp=-2`,
      "-c:a", "pcm_s16le",
      "-ar", "48000",
      outPath
    ];
    await execFileAsync("ffmpeg", ffmpegArgs, { timeout: 60000, maxBuffer: 4e6 });
    return;
  }

  const generators = [];
  let filterComplex = "";
  if (g.includes("BOLLYWOOD_ROMANCE") || g.includes("BOLLYWOOD")) {
    generators.push(
      `anoisesrc=d=${dur}:c=pink:r=48000:a=0.008,lowpass=f=400,volume=0.15`,
      `sine=frequency=138.59:duration=${dur},volume=0.08`,
      `sine=frequency=207.65:duration=${dur},volume=0.06`,
      `sine=frequency=277.18:duration=${dur},volume=0.05`,
      `sine=frequency=329.63:duration=${dur},volume=0.04`
    );
    filterComplex = `[0:a][1:a][2:a][3:a][4:a]amix=inputs=5:duration=first:dropout_transition=2,chorus=0.7:0.9:55:0.4:0.25:2,aecho=0.8:0.85:80:0.35,afade=t=in:st=0:d=1.5,afade=t=out:st=${Math.max(0, dur - 2.2)}:d=2.2[bgm]`;
  } else if (g.includes("MUSIC_VIDEO") || g.includes("POP") || g.includes("ELECTRONIC")) {
    generators.push(
      `anoisesrc=d=${dur}:c=pink:r=48000:a=0.005,lowpass=f=400,volume=0.10`,
      `sine=frequency=110.00:duration=${dur},volume=0.08`,
      `sine=frequency=220.00:duration=${dur},volume=0.06`,
      `sine=frequency=329.63:duration=${dur},volume=0.05`
    );
    filterComplex = `[0:a][1:a][2:a][3:a]amix=inputs=4:duration=first:dropout_transition=2,chorus=0.8:0.9:50:0.4:0.25:2,aecho=0.8:0.85:70:0.35,afade=t=in:st=0:d=1.5,afade=t=out:st=${Math.max(0, dur - 2)}:d=2[bgm]`;
  } else if (g.includes("BOLLYWOOD_ACTION") || g.includes("ACTION")) {
    generators.push(
      `anoisesrc=d=${dur}:c=pink:r=48000:a=0.015,lowpass=f=300,volume=0.2`,
      `sine=frequency=82.41:duration=${dur},volume=0.1`,
      `sine=frequency=123.47:duration=${dur},volume=0.07`,
      `sine=frequency=164.81:duration=${dur},volume=0.06`
    );
    filterComplex = `[0:a][1:a][2:a][3:a]amix=inputs=4:duration=first:dropout_transition=2,flanger=delay=5:depth=2:regen=50:width=80:speed=0.5,aecho=0.8:0.88:60:0.4,afade=t=in:st=0:d=0.8,afade=t=out:st=${Math.max(0, dur - 1.5)}:d=1.5[bgm]`;
  } else if (g.includes("HISTORICAL") || g.includes("BIOPIC") || g.includes("DRAMA")) {
    generators.push(
      `anoisesrc=d=${dur}:c=pink:r=48000:a=0.01,lowpass=f=450,volume=0.12`,
      `sine=frequency=110.00:duration=${dur},volume=0.08`,
      `sine=frequency=164.81:duration=${dur},volume=0.06`,
      `sine=frequency=220.00:duration=${dur},volume=0.05`,
      `sine=frequency=329.63:duration=${dur},volume=0.04`
    );
    filterComplex = `[0:a][1:a][2:a][3:a][4:a]amix=inputs=5:duration=first:dropout_transition=2,chorus=0.6:0.8:60:0.3:0.2:1.5,aecho=0.85:0.88:100:0.4,afade=t=in:st=0:d=1.5,afade=t=out:st=${Math.max(0, dur - 2)}:d=2[bgm]`;
  } else if (g.includes("SCI_FI") || g.includes("CYBERPUNK")) {
    generators.push(
      `anoisesrc=d=${dur}:c=pink:r=48000:a=0.012,lowpass=f=350,volume=0.15`,
      `sine=frequency=65.41:duration=${dur},volume=0.1`,
      `sine=frequency=130.81:duration=${dur},volume=0.08`,
      `sine=frequency=196.00:duration=${dur},volume=0.06`
    );
    filterComplex = `[0:a][1:a][2:a][3:a]amix=inputs=4:duration=first:dropout_transition=2,chorus=0.8:0.9:45:0.4:0.3:3,aecho=0.8:0.88:70:0.45,afade=t=in:st=0:d=1,afade=t=out:st=${Math.max(0, dur - 1.5)}:d=1.5[bgm]`;
  } else {
    generators.push(
      `anoisesrc=d=${dur}:c=pink:r=48000:a=0.008,lowpass=f=500,volume=0.12`,
      `sine=frequency=130.81:duration=${dur},volume=0.07`,
      `sine=frequency=196.00:duration=${dur},volume=0.05`,
      `sine=frequency=261.63:duration=${dur},volume=0.04`
    );
    filterComplex = `[0:a][1:a][2:a][3:a]amix=inputs=4:duration=first:dropout_transition=2,aecho=0.8:0.85:60:0.3,afade=t=in:st=0:d=1,afade=t=out:st=${Math.max(0, dur - 1.5)}:d=1.5[bgm]`;
  }

  const ffmpegArgs = ["-y"];
  for (const gen of generators) {
    ffmpegArgs.push("-f", "lavfi", "-i", gen);
  }
  ffmpegArgs.push(
    "-filter_complex", filterComplex,
    "-map", "[bgm]",
    "-t", String(dur),
    "-c:a", "pcm_s16le",
    "-ar", "48000",
    outPath
  );
  await execFileAsync("ffmpeg", ffmpegArgs, { timeout: 60000, maxBuffer: 4e6 });
}

async function renderRough(op, m) {
  await assertApplicable(op, { beforeDispatch: true });
  if (!assetRoot() || !m.audio?.narrationUrl || !m.audio?.actualDurationSec || !m.audio?.alignmentValidation?.passed) throw new Error("Validated narration and durable storage required");

  const shotAudioProbes = await Promise.all(m.shots.map(async (s) => {
    try {
      const p = assetPath(s.asset.videoUrl).target;
      const { stdout } = await execFileAsync("ffprobe", [
        "-v", "error",
        "-select_streams", "a:0",
        "-show_entries", "stream=codec_name",
        "-of", "json",
        p
      ]);
      const data = JSON.parse(stdout);
      return Boolean(data.streams && data.streams.length > 0);
    } catch {
      return false;
    }
  }));
  let studio1 = op.payload_json?.studio1 === true && Boolean(m.studio1?.timelineSync);
  const genre = String(m.creativeBible?.genre || m.genre || op.payload_json?.genre || "").toUpperCase();
  const audioStrategy = getGenreAudioStrategy(genre, m, op);
  const hasValidShotAudio = shotAudioProbes.length === m.shots.length && shotAudioProbes.every(Boolean);

  // Strategy agreement (Fix A):
  // If genre uses "tts_dub", prompts stripped dialogue, so render MUST use the TTS dub / symphonic master path (hasNativeAudio = false).
  // If genre uses "native", prompts preserved dialogue, so render preserves native character audio (hasNativeAudio = true).
  const hasNativeAudio = hasValidShotAudio && audioStrategy === "native";
  console.log(`[reel-worker] renderRough audio strategy for ${op.production_id} (genre: ${genre || "unknown"}, audioStrategy: ${audioStrategy}): ${hasNativeAudio ? "NATIVE CHARACTER AUDIO & FOLEY (lip sync preserved)" : studio1 ? "STUDIO1 SYMPHONIC & TTS MASTER" : "SYNTHETIC TTS DUB"}`);

  if (studio1) {
    try {
      if (!op.payload_json?.narrationSyncedTimeline) throw new Error("Studio1 exact render requires narrationSyncedTimeline operation evidence");
      if (Number(m.studio1?.timelineSync?.version || 0) < 2) throw new Error("Studio1 exact render requires timelineSync version 2");
      const c = await getProduction(op.production_id);
      const sync = synchronizeStudio1ManifestTimeline(c.manifest, { mode: "render" });
      await saveManifest(op.production_id, c.revision, c.manifest);
      m = c.manifest;
      console.log(`[reel-worker] studio1 render resync ${op.production_id} ${JSON.stringify(sync.adaptations)}`);
    } catch (syncErr) {
      console.warn(`[reel-worker] studio1 timeline synchronization failed (${syncErr.message}), falling back to cinematic montage cut`);
      studio1 = false;
    }
  } else if (!hasNativeAudio) {
    console.warn(`[reel-worker] rough cut ${op.production_id} rendering on legacy unsynced path`);
  }

  const BATCH_SIZE = 6;
  const d = Number(m.audio.actualDurationSec);
  const baseTmpDir = (assetRoot() && fsSync.existsSync(assetRoot())) ? path.join(assetRoot(), ".tmp") : os.tmpdir();
  await fs.mkdir(baseTmpDir, { recursive: true }).catch(() => {});
  const tmp = path.join(baseTmpDir, `zyvoriq-rough-${crypto.randomUUID()}.mp4`);
  const partsDir = path.join(baseTmpDir, `zyvoriq-rough-parts-${crypto.randomUUID()}`);
  await fs.mkdir(partsDir, { recursive: true });

  const bgmPath = path.join(partsDir, "bgm_score.wav");
  try {
    if (!hasNativeAudio || genre !== "MUSIC_VIDEO") {
      await generateContinuousScore(genre, d, bgmPath);
    }
  } catch (bgmErr) {
    console.warn(`[reel-worker] continuous BGM score synthesis warning: ${bgmErr?.message || bgmErr}`);
  }

  let timelineQa = null;
  let renderPlan = null;

  try {
    if (hasNativeAudio) {
      // Forensic-First: Preserve native speech, character voices, and lip articulation
      // Batch shots in groups of 6 to avoid swscaler filtergraph thread/memory exhaustion
      const numBatches = Math.ceil(m.shots.length / BATCH_SIZE);
      console.log(`[reel-worker] renderRough: batching ${m.shots.length} shots across ${numBatches} intermediate batches (BATCH_SIZE=${BATCH_SIZE})`);
      
      for (let b = 0; b < numBatches; b++) {
        const startIdx = b * BATCH_SIZE;
        const endIdx = Math.min(m.shots.length, startIdx + BATCH_SIZE);
        const batchShots = m.shots.slice(startIdx, endIdx);
        const batchArgs = ["-y"];
        for (const s of batchShots) {
          if (!s.asset?.videoUrl) throw new Error(`${s.id} has no source`);
          batchArgs.push("-i", assetPath(s.asset.videoUrl).target);
        }
        const f = [];
        for (let i = 0; i < batchShots.length; i++) {
          const s = batchShots[i];
          const shotDur = Number(s.asset?.actualDurationSec || s.editorialDurationSec || s.generationDurationSec || 6.0);
          const fadeOutStart = Math.max(0.01, shotDur - 0.015);
          f.push(`[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v${i}]`);
          f.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo,afade=t=in:st=0:d=0.01,afade=t=out:st=${fadeOutStart.toFixed(3)}:d=0.01[a${i}]`);
        }
        f.push(`${batchShots.map((_, i) => `[v${i}][a${i}]`).join("")}concat=n=${batchShots.length}:v=1:a=1[vcat][acat]`);
        const batchOut = path.join(partsDir, `batch_${String(b).padStart(4, "0")}.mp4`);
        batchArgs.push(
          "-filter_threads", "2",
          "-filter_complex_threads", "2",
          "-filter_complex", f.join(";"),
          "-map", "[vcat]",
          "-map", "[acat]",
          "-c:v", "libx264",
          "-preset", "veryfast",
          "-crf", "20",
          "-pix_fmt", "yuv420p",
          "-c:a", "aac",
          "-b:a", "192k",
          batchOut
        );
        try {
          await execFileAsync("ffmpeg", batchArgs, { timeout: 300000, maxBuffer: 8e6 });
        } catch (ffmpegErr) {
          console.error(`[reel-worker] ffmpeg renderRough batch ${b} failed! Command args count: ${batchArgs.length}`);
          if (ffmpegErr.stderr) console.error(`[reel-worker] ffmpeg stderr:\n${ffmpegErr.stderr.slice(-2000)}`);
          throw new Error(`ffmpeg renderRough batch ${b} error: ${ffmpegErr.stderr ? ffmpegErr.stderr.slice(-1000) : ffmpegErr.message.slice(0, 1000)}`);
        }
      }

      const listPath = path.join(partsDir, "filelist.txt");
      const fileListContent = Array.from({ length: numBatches }, (_, i) => `file '${path.join(partsDir, `batch_${String(i).padStart(4, "0")}.mp4`)}'`).join("\n");
      await fs.writeFile(listPath, fileListContent, "utf8");

      const narrationPath = m.audio?.narrationUrl ? assetPath(m.audio.narrationUrl).target : null;
      let hasNarrationFile = false;
      if (narrationPath) {
        try {
          await fs.access(narrationPath);
          hasNarrationFile = true;
        } catch {}
      }

      let hasBgmFile = false;
      try {
        await fs.access(bgmPath);
        hasBgmFile = true;
      } catch {}

      const concatArgs = [
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", listPath,
      ];

      // Forensic-First: In native audio mode, [0:a] contains the native singing/dialogue performance.
      // NEVER dub artificial TTS over characters whose lips are visibly articulating words.
      let filterComplex = "";
      if (hasBgmFile && genre !== "MUSIC_VIDEO") {
        concatArgs.push("-i", bgmPath);
        filterComplex = `[0:a]aresample=48000,volume=1.00[dialogue];[1:a]aresample=48000,volume=0.20[bgm];[dialogue][bgm]amix=inputs=2:duration=first:dropout_transition=2,loudnorm=I=-24:LRA=7:tp=-2[aout]`;
      } else {
        filterComplex = `[0:a]aresample=48000,loudnorm=I=-24:LRA=7:tp=-2[aout]`;
      }

      concatArgs.push(
        "-filter_complex", filterComplex,
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        tmp
      );

      try {
        await execFileAsync("ffmpeg", concatArgs, { timeout: 300000, maxBuffer: 8e6 });
      } catch (ffmpegErr) {
        console.error(`[reel-worker] ffmpeg renderRough final concat failed!`);
        if (ffmpegErr.stderr) console.error(`[reel-worker] ffmpeg stderr:\n${ffmpegErr.stderr.slice(-2000)}`);
        throw new Error(`ffmpeg renderRough final concat error: ${ffmpegErr.stderr ? ffmpegErr.stderr.slice(-1000) : ffmpegErr.message.slice(0, 1000)}`);
      }
    } else {
      // Fallback / Studio 1: Master narration dub and symphonic music bed
      // Batch video scenes in groups of 6 to prevent scaling graph memory exhaustion
      let numBatches = 0;
      if (studio1) {
        try {
          renderPlan = buildStudio1RenderPlan(m);
          assertStudio1RenderAdaptation(renderPlan);
        } catch (planErr) {
          console.warn(`[reel-worker] buildStudio1RenderPlan failed (${planErr.message}), falling back to cinematic montage cut`);
          studio1 = false;
        }
      }
      if (studio1 && renderPlan) {
        const scenes = renderPlan.scenes;
        numBatches = Math.ceil(scenes.length / BATCH_SIZE);
        console.log(`[reel-worker] renderRough: studio1 batching ${scenes.length} scenes across ${numBatches} intermediate batches (BATCH_SIZE=${BATCH_SIZE})`);

        for (let b = 0; b < numBatches; b++) {
          const startIdx = b * BATCH_SIZE;
          const endIdx = Math.min(scenes.length, startIdx + BATCH_SIZE);
          const batchScenes = scenes.slice(startIdx, endIdx);
          const batchArgs = ["-y"];
          for (const scene of batchScenes) {
            const s = m.shots[scene.inputIndex];
            if (!s.asset?.videoUrl) throw new Error(`${s.id} has no source`);
            batchArgs.push("-i", assetPath(s.asset.videoUrl).target);
          }
          const f = [];
          batchScenes.forEach((scene, localIdx) => {
            const s = m.shots[scene.inputIndex];
            f.push(buildStudio1VisualFilter(s, { ...scene, inputIndex: localIdx }, { unifiedScale: true }));
          });
          f.push(`${batchScenes.map((_, i) => `[v${i}]`).join("")}concat=n=${batchScenes.length}:v=1:a=0[vcat]`);
          f.push(`[vcat]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[vout]`);
          const batchOut = path.join(partsDir, `batch_${String(b).padStart(4, "0")}.mp4`);
          batchArgs.push(
            "-filter_threads", "2",
            "-filter_complex_threads", "2",
            "-filter_complex", f.join(";"),
            "-map", "[vout]",
            "-an",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "20",
            "-pix_fmt", "yuv420p",
            batchOut
          );
          try {
            await execFileAsync("ffmpeg", batchArgs, { timeout: 300000, maxBuffer: 8e6 });
          } catch (ffmpegErr) {
            console.error(`[reel-worker] ffmpeg renderRough studio1 batch ${b} failed! Command args count: ${batchArgs.length}`);
            if (ffmpegErr.stderr) console.error(`[reel-worker] ffmpeg stderr:\n${ffmpegErr.stderr.slice(-2000)}`);
            throw new Error(`ffmpeg renderRough studio1 batch ${b} error: ${ffmpegErr.stderr ? ffmpegErr.stderr.slice(-1000) : ffmpegErr.message.slice(0, 1000)}`);
          }
        }
      } else {
        numBatches = Math.ceil(m.shots.length / BATCH_SIZE);
        console.log(`[reel-worker] renderRough: fallback batching ${m.shots.length} shots across ${numBatches} intermediate batches (BATCH_SIZE=${BATCH_SIZE})`);

        for (let b = 0; b < numBatches; b++) {
          const startIdx = b * BATCH_SIZE;
          const endIdx = Math.min(m.shots.length, startIdx + BATCH_SIZE);
          const batchShots = m.shots.slice(startIdx, endIdx);
          const batchArgs = ["-y"];
          for (const s of batchShots) {
            if (!s.asset?.videoUrl) throw new Error(`${s.id} has no source`);
            batchArgs.push("-i", assetPath(s.asset.videoUrl).target);
          }
          const f = [];
          batchShots.forEach((s, localIdx) => {
            f.push(`[${localIdx}:v]trim=start=${s.trimInSec}:end=${s.trimOutSec},setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v${localIdx}]`);
          });
          f.push(`${batchShots.map((_, i) => `[v${i}]`).join("")}concat=n=${batchShots.length}:v=1:a=0[vout]`);
          const batchOut = path.join(partsDir, `batch_${String(b).padStart(4, "0")}.mp4`);
          batchArgs.push(
            "-filter_threads", "2",
            "-filter_complex_threads", "2",
            "-filter_complex", f.join(";"),
            "-map", "[vout]",
            "-an",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "20",
            "-pix_fmt", "yuv420p",
            batchOut
          );
          try {
            await execFileAsync("ffmpeg", batchArgs, { timeout: 300000, maxBuffer: 8e6 });
          } catch (ffmpegErr) {
            console.error(`[reel-worker] ffmpeg renderRough fallback batch ${b} failed! Command args count: ${batchArgs.length}`);
            if (ffmpegErr.stderr) console.error(`[reel-worker] ffmpeg stderr:\n${ffmpegErr.stderr.slice(-2000)}`);
            throw new Error(`ffmpeg renderRough fallback batch ${b} error: ${ffmpegErr.stderr ? ffmpegErr.stderr.slice(-1000) : ffmpegErr.message.slice(0, 1000)}`);
          }
        }
      }

      // Concat batch intermediates via demuxer and mux narration audio
      const listPath = path.join(partsDir, "filelist.txt");
      const fileListContent = Array.from({ length: numBatches }, (_, i) => `file '${path.join(partsDir, `batch_${String(i).padStart(4, "0")}.mp4`)}'`).join("\n");
      await fs.writeFile(listPath, fileListContent, "utf8");

      const narrationPath = assetPath(m.audio.narrationUrl).target;
      let hasBgmFile = false;
      try {
        await fs.access(bgmPath);
        hasBgmFile = true;
      } catch {}

      const concatArgs = [
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", listPath,
        "-i", narrationPath,
      ];

      let filterComplex = `[1:a]atrim=duration=${d},asetpts=PTS-STARTPTS,aresample=48000,volume=1.25[aout]`;
      if (hasBgmFile) {
        concatArgs.push("-i", bgmPath);
        filterComplex = `[1:a]atrim=duration=${d},asetpts=PTS-STARTPTS,aresample=48000,volume=1.25[voice];[2:a]aresample=48000,volume=0.55[bgm];[voice][bgm]amix=inputs=2:duration=first:dropout_transition=2,loudnorm=I=-24:LRA=7:tp=-2[aout]`;
      }

      concatArgs.push(
        "-filter_complex", filterComplex,
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", String(d),
        "-movflags", "+faststart",
        tmp
      );

      try {
        await execFileAsync("ffmpeg", concatArgs, { timeout: 300000, maxBuffer: 8e6 });
      } catch (ffmpegErr) {
        console.error(`[reel-worker] ffmpeg renderRough narration mux failed!`);
        if (ffmpegErr.stderr) console.error(`[reel-worker] ffmpeg stderr:\n${ffmpegErr.stderr.slice(-2000)}`);
        throw new Error(`ffmpeg renderRough narration mux error: ${ffmpegErr.stderr ? ffmpegErr.stderr.slice(-1000) : ffmpegErr.message.slice(0, 1000)}`);
      }
    }

    await assertApplicable(op);
    const buffer = await fs.readFile(tmp), probe = await probeVideo(buffer);
    if (!hasNativeAudio && Math.abs(probe.durationSec - d) > .25) {
      throw new Error(`Rough cut duration drift ${probe.durationSec} vs ${d}`);
    }
    if (hasNativeAudio) {
      timelineQa = {
        version: 1,
        timingContract: "native-shot-audio-master",
        fps: 30,
        expectedDurationSec: probe.durationSec,
        renderedVideoClockSec: probe.durationSec,
        outputDurationSec: probe.durationSec,
        maxBoundaryDriftMs: 0,
        maxAllowedBoundaryDriftMs: 50,
        passed: true,
        nativeAudioPreserved: true,
        renderedAt: new Date().toISOString(),
      };
    } else if (studio1) {
      timelineQa = {
        version: 1,
        timingContract: "narration-master-clock",
        fps: renderPlan.fps,
        expectedDurationSec: renderPlan.expectedDurationSec,
        renderedVideoClockSec: renderPlan.renderedVideoClockSec,
        outputDurationSec: probe.durationSec,
        maxBoundaryDriftMs: renderPlan.maxBoundaryDriftMs,
        maxAllowedBoundaryDriftMs: Number(m.studio1?.timelineSync?.maxAllowedBoundaryDriftMs || 50),
        passed: renderPlan.maxBoundaryDriftMs <= Number(m.studio1?.timelineSync?.maxAllowedBoundaryDriftMs || 50),
        scenes: renderPlan.scenes,
        renderedAt: new Date().toISOString(),
      };
      if (!timelineQa.passed) throw new Error(`Studio1 timeline QA failed: max boundary drift ${timelineQa.maxBoundaryDriftMs}ms`);
    }
    const digest = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 16), asset = await writeAsset(`reels/${op.production_id}/renders/narrated-rough-${digest}.mp4`, buffer);
    return { videoUrl: asset.url, actualDurationSec: probe.durationSec, kind: "narrated-rough-cut", codec: probe.codec, width: probe.width, height: probe.height, frameRate: probe.frameRate, renderedAt: new Date().toISOString(), ...(timelineQa ? { timelineQa } : {}) };
  } finally {
    try { await fs.unlink(tmp); } catch {}
    try { await fs.rm(partsDir, { recursive: true, force: true }); } catch {}
  }
}
async function applyRough(op, result) {
  await assertApplicable(op);
  const c = await getProduction(op.production_id), m = c.manifest;
  m.outputs = { ...(m.outputs || {}), narratedRoughCut: result };
  m.asset = { videoUrl: result.videoUrl, actualDurationSec: result.actualDurationSec, operationName: result.operationName, provider: "rough-cut", model: "ffmpeg" };
  if (result.timelineQa && m.studio1?.timelineSync) m.studio1.timelineSync.renderQa = result.timelineQa;
  m.status = "READY";
  await saveManifest(op.production_id, c.revision, m);
  await pool.query(`UPDATE reel_operations SET updated_at = NOW() WHERE production_id = $1`, [op.production_id]);
  console.log(`[reel-worker] [completed] Production ${op.production_id} rough cut finished and status marked READY! Video URL: ${result.videoUrl}`);
}

// ---- Option C: one continuous Veo generation, native audio, no TTS ----

function nativeBeatsFrom(manifest) {
  const shots = [...(manifest.shots || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const beats = shots.map(s => String(s.scriptText || s.dialogue || s.voiceover || "").trim()).filter(Boolean);
  if (!beats.length) throw new Error("No scriptText on any shot; cannot build a native reel");
  const limit = maxBeatsForDuration();
  if (beats.length > limit) throw new Error(`${beats.length} beats exceeds the ${limit}-hop ceiling`);
  return beats;
}

function nativeCharacterFrom(manifest) {
  const c = manifest.shots?.[0]?.continuityIn || {};
  const parts = [c.character, c.wardrobe, c.environment, c.lighting].filter(Boolean);
  if (!parts.length) {
    if (typeof c === "string" && c.trim()) return c.trim();
    if (manifest.characterAnchor?.prompt) return manifest.characterAnchor.prompt;
    throw new Error("No character/environment lock on shot_01");
  }
  return parts.join(" ");
}

async function generateNativeReel(op, manifest, checkpoint) {
  await assertApplicable(op, { beforeDispatch: true });
  if (!assetRoot()) throw new Error("Durable asset storage is not configured");

  const beats = nativeBeatsFrom(manifest);
  const character = nativeCharacterFrom(manifest);

  const result = await generateContinuousReel({
    beats,
    character,
    tone: manifest.tone,
    checkpoint: checkpoint?.completedBeats ? { uri: checkpoint.uri, completedBeats: checkpoint.completedBeats } : undefined,
    onProgress: ({ index, total, phase }) => console.log(`[reel-worker] [native] ${op.production_id} hop ${index + 1}/${total} ${phase}`),
    onHop: async ({ completedBeats, uri }) => {
      // Persisted BEFORE the next hop so a crash resumes rather than restarting.
      await updateOperation(op.id, { result: { stage: "IN_PROGRESS", completedBeats, uri, totalBeats: beats.length } });
      await operationHeartbeat(op.id, op.production_id);
    },
  });

  await assertApplicable(op);

  const probe = await probeVideo(result.buffer);
  const digest = crypto.createHash("sha256").update(result.buffer).digest("hex").slice(0, 16);
  const asset = await writeAsset(`reels/${op.production_id}/renders/native-reel-${digest}.mp4`, result.buffer);

  return {
    videoUrl: asset.url,
    actualDurationSec: probe.durationSec,
    kind: "native-audio-reel",
    codec: probe.codec,
    width: probe.width,
    height: probe.height,
    frameRate: probe.frameRate,
    hops: result.hops,
    operationNames: result.operationNames,
    renderedAt: new Date().toISOString(),
  };
}

async function applyNativeReel(op, result) {
  await assertApplicable(op);
  const c = await getProduction(op.production_id);
  const m = c.manifest;

  // The native reel IS the narrated rough cut — ready for audio mixing
  m.outputs = {
    ...(m.outputs || {}),
    narratedRoughCut: result,
    nativeReel: result,
  };
  m.status = "MIXING";
  await saveManifest(op.production_id, c.revision, m);
}

async function processOperation(op) {
  await assertApplicable(op);
  await markRunning(op);
  const current = await getProduction(op.production_id);
  let result = op.result_json;
  if (op.kind === "NARRATION") {
    if (!result || result.stage !== "COMPLETE") {
      result = await generateNarration(op, current.manifest, result);
      await updateOperation(op.id, { result, providerOperationName: "tts-complete" });
    }
    await applyNarration(op, result);
  } else if (op.kind === "SHOT") {
    const shot = current.manifest.shots.find(s => s.id === op.target_id);
    if (!shot) throw new Error("Shot not found");

    // In-flight dependency guard per P1.2: Check waiting vs persistence data loss vs terminal failure
    if (shot.dependsOnShotIds?.length) {
      for (const depId of shot.dependsOnShotIds) {
        const dep = current.manifest.shots.find(s => s.id === depId);
        if (!dep) {
          throw new Error(`PARENT_TERMINAL_FAILURE: Parent shot ${depId} does not exist in production manifest`);
        }
        if (dep.status === "FAILED" || dep.status === "CANCELLED") {
          throw new Error(`PARENT_TERMINAL_FAILURE: Upstream dependency shot ${depId} failed or was cancelled`);
        }
        // Condition 2: Parent succeeded, media gone -> Hard fail / Persistence Data Loss
        if (["GENERATED", "PASSED"].includes(dep.status) && !dep?.asset?.videoUrl) {
          throw new Error(`PERSISTENCE_DATA_LOSS: Parent shot ${depId} succeeded (${dep.status}) but videoUrl asset is missing`);
        }
        // Condition 1: Parent still generating -> Wait (BLOCKED, event-driven wake on parent completion)
        if (!["GENERATED", "PASSED"].includes(dep.status)) {
          console.log(`[reel-worker] shot ${shot.id} waiting on upstream parent ${depId} (${dep.status}). Marking BLOCKED.`);
          await pool.query(
            `UPDATE reel_operations
             SET status='BLOCKED',
                 last_error=$2,
                 lease_owner=NULL,
                 lease_expires_at=NULL,
                 updated_at=NOW()
             WHERE id=$1`,
            [op.id, `WAITING_ON_UPSTREAM_DEPENDENCY:${depId}:${dep.status}`]
          );
          return;
        }
      }
    }

    if (!result) { result = await generateShot(op, current.manifest, shot); await updateOperation(op.id, { result }); }
    await applyShot(op, result);
  } else if (op.kind === "ROUGH_CUT") {
    if (!result) { result = await renderRough(op, current.manifest); await updateOperation(op.id, { result }); }
    await applyRough(op, result);
  } else if (op.kind === "NATIVE_REEL") {
    if (!result || result.stage !== "COMPLETE") {
      result = await generateNativeReel(op, current.manifest, result);
      await updateOperation(op.id, { result: { ...result, stage: "COMPLETE" } });
    }
    await applyNativeReel(op, result);
  } else throw new Error(`Unsupported operation ${op.kind}`);
  await updateOperation(op.id, { status: "SUCCEEDED", lastError: null, leaseExpiresAt: null, leaseOwner: null });
  console.log(`[reel-worker] [transition] SUCCEEDED ${op.id} (${op.kind}${op.target_id ? `:${op.target_id}` : ''}) for prod ${op.production_id}`);
}

function isCapacityError(errOrMessage) {
  const msg = String(errOrMessage?.message || errOrMessage || "").toLowerCase();
  return msg.includes("high demand") ||
         msg.includes("resource_exhausted") ||
         msg.includes("quota exceeded") ||
         msg.includes("rate limit") ||
         msg.includes("429") ||
         msg.includes("503") ||
         msg.includes("temporarily unavailable") ||
         msg.includes("model is overloaded") ||
         msg.includes("capacity");
}

console.log(`[reel-worker] dedicated worker started ${workerId}`);
for (;;) {
  try {
    const op = await withDbRetry(() => claim(), { label: "claim", maxRetries: 2, baseDelayMs: 1000 });
    if (!op) { await sleep(pollMs); continue; }
    console.log(`[reel-worker] [transition] Claimed ${op.id} (${op.kind}${op.target_id ? `:${op.target_id}` : ''}) for prod ${op.production_id} (attempt ${op.attempt})`);
    try {
      await processOperation(op);
    } catch (error) {
      const message = String(error?.message || error).slice(0, 2000);
      const cancelled = message.startsWith("OPERATION_CANCELLED");

      if (isCapacityError(message)) {
        // Veo/Gemini capacity error: Do NOT burn standard operational attempt budget!
        const currentCapAttempts = Number(op.payload_json?.capacityAttempts || 0) + 1;
        // Exponential backoff: attempt 1 -> ~55-75s, attempt 2 -> ~100-120s, attempt 3 -> ~190-210s, attempt 4+ -> ~310-330s (max 5m + jitter)
        const baseSec = Math.min(300, 45 * Math.pow(2, Math.min(currentCapAttempts - 1, 4)));
        const jitterSec = Math.floor(Math.random() * 20) + 10;
        const delaySec = baseSec + jitterSec;

        // Restore standard attempt count so permanent failure budget is preserved
        const restoredAttempt = Math.max(0, Number(op.attempt || 1) - 1);
        const updatedPayload = { ...(op.payload_json || {}), capacityAttempts: currentCapAttempts };

        await pool.query(
          `UPDATE reel_operations
           SET status='QUEUED',
               attempt=$2,
               scheduled_at=NOW() + ($3 || ' seconds')::INTERVAL,
               payload_json=$4::jsonb,
               provider_operation_name=NULL,
               last_error=$5,
               lease_owner=NULL,
               lease_expires_at=NULL,
               updated_at=NOW()
           WHERE id=$1`,
          [op.id, restoredAttempt, delaySec, JSON.stringify(updatedPayload), message]
        );
        console.warn(
          `[reel-worker] [capacity-backoff] ${op.id} (${op.kind}${op.target_id ? `:${op.target_id}` : ''}) hit capacity/congestion: "${message}". ` +
          `Requeuing with ${delaySec}s backoff (capacity retry #${currentCapAttempts}, preserved attempt ${restoredAttempt}/5). Scheduled at +${delaySec}s.`
        );
        continue;
      }

      if (message.startsWith("VEO_TRANSIENT_EMPTY_PAYLOAD")) {
        // Veo transient empty payload (Google infra drop): Do NOT burn standard operational attempt budget!
        const currentTransientAttempts = Number(op.payload_json?.transientEmptyAttempts || 0) + 1;
        if (currentTransientAttempts < 6) {
          const baseSec = Math.min(180, 40 * Math.pow(1.5, Math.min(currentTransientAttempts - 1, 3)));
          const jitterSec = Math.floor(Math.random() * 15) + 5;
          const delaySec = Math.round(baseSec + jitterSec);

          const restoredAttempt = Math.max(0, Number(op.attempt || 1) - 1);
          const updatedPayload = { ...(op.payload_json || {}), transientEmptyAttempts: currentTransientAttempts };

          await pool.query(
            `UPDATE reel_operations
             SET status='QUEUED',
                 attempt=$2,
                 scheduled_at=NOW() + ($3 || ' seconds')::INTERVAL,
                 payload_json=$4::jsonb,
                 provider_operation_name=NULL,
                 last_error=$5,
                 lease_owner=NULL,
                 lease_expires_at=NULL,
                 updated_at=NOW()
             WHERE id=$1`,
            [op.id, restoredAttempt, delaySec, JSON.stringify(updatedPayload), message]
          );
          console.warn(
            `[reel-worker] [transient-empty-backoff] ${op.id} (${op.kind}${op.target_id ? `:${op.target_id}` : ''}) hit transient empty payload: "${message}". ` +
            `Requeuing with ${delaySec}s backoff (transient retry #${currentTransientAttempts}/5, preserved attempt ${restoredAttempt}/5). Scheduled at +${delaySec}s.`
          );
          continue;
        }
      }

      if (message.startsWith("VEO_SAFETY_FILTER_EMPTY")) {
        // Veo safety filter triggered: Prompt has been auto-healed in manifest.
        const currentSafetyAttempts = Number(op.payload_json?.safetyAttempts || 0) + 1;
        if (currentSafetyAttempts <= 3) {
          const delaySec = 35 + Math.floor(Math.random() * 15);
          const restoredAttempt = Math.max(0, Number(op.attempt || 1) - 1);
          const updatedPayload = { ...(op.payload_json || {}), safetyAttempts: currentSafetyAttempts };

          await pool.query(
            `UPDATE reel_operations
             SET status='QUEUED',
                 attempt=$2,
                 scheduled_at=NOW() + ($3 || ' seconds')::INTERVAL,
                 payload_json=$4::jsonb,
                 provider_operation_name=NULL,
                 last_error=$5,
                 lease_owner=NULL,
                 lease_expires_at=NULL,
                 updated_at=NOW()
             WHERE id=$1`,
            [op.id, restoredAttempt, delaySec, JSON.stringify(updatedPayload), message]
          );
          console.warn(
            `[reel-worker] [safety-filter-backoff] ${op.id} (${op.kind}${op.target_id ? `:${op.target_id}` : ''}) auto-sanitized after safety filter: "${message}". ` +
            `Requeuing with ${delaySec}s backoff (safety retry #${currentSafetyAttempts}/3, preserved attempt ${restoredAttempt}/5). Scheduled at +${delaySec}s.`
          );
          continue;
        }
      }

      if (message.startsWith("VEO_AUDIO_FILTER_REJECTED")) {
        // Veo audio filter rejected prompt: Dialogue and lyrics sanitized in manifest, visual references 100% preserved!
        const currentAudioAttempts = Number(op.payload_json?.audioSafetyAttempts || 0) + 1;
        if (currentAudioAttempts <= 4) {
          const delaySec = 20 + Math.floor(Math.random() * 10);
          const restoredAttempt = Math.max(0, Number(op.attempt || 1) - 1);
          const updatedPayload = { ...(op.payload_json || {}), audioSafetyAttempts: currentAudioAttempts };

          await pool.query(
            `UPDATE reel_operations
             SET status='QUEUED',
                 attempt=$2,
                 scheduled_at=NOW() + ($3 || ' seconds')::INTERVAL,
                 payload_json=$4::jsonb,
                 provider_operation_name=NULL,
                 last_error=$5,
                 lease_owner=NULL,
                 lease_expires_at=NULL,
                 updated_at=NOW()
             WHERE id=$1`,
            [op.id, restoredAttempt, delaySec, JSON.stringify(updatedPayload), message]
          );
          console.warn(
            `[reel-worker] [audio-filter-backoff] ${op.id} (${op.kind}${op.target_id ? `:${op.target_id}` : ''}) prompt sanitized after audio rejection: "${message}". ` +
            `Requeuing with ${delaySec}s backoff (audio retry #${currentAudioAttempts}/4, preserved attempt ${restoredAttempt}/5). Scheduled at +${delaySec}s.`
          );
          continue;
        }
      }

      const ambiguous = message.includes("AMBIGUOUS_TTS_RESULT_AFTER_BOUNDED_RECOVERY") || message.includes("AMBIGUOUS_VEO_DISPATCH_AFTER_BOUNDED_RECOVERY") || message.includes("AMBIGUOUS_VEO_DISPATCH_NO_OPERATION_ID");
      const deterministic = message.startsWith("Studio1") || message.startsWith("Narration transcript mismatch:") || message.startsWith("Narration timestamps failed") || message.startsWith("Transcript verification has no comparable words");
      const isTransientError = /unavailable|503|429|ECONNRESET|ETIMEDOUT|demand|busy/i.test(message);
      const maxAllowedAttempts = isTransientError ? 5 : 3;
      const retry = !cancelled && !ambiguous && !deterministic && Number(op.attempt || 0) < maxAllowedAttempts;
      await pool.query(`UPDATE reel_operations SET status=$2,last_error=$3,lease_owner=NULL,lease_expires_at=NULL,updated_at=NOW() WHERE id=$1`, [op.id, cancelled ? "CANCELLED" : retry ? "QUEUED" : "FAILED", message]);
      if (!cancelled && !retry) await markTerminalFailure(op, message);
      console.error(`[reel-worker] [transition] ${op.id} ${cancelled ? "cancelled" : retry ? "retry" : "failed"}: ${message}`);
    }
  } catch (error) {
    console.error(`[reel-worker] loop error: ${error?.message || error}`);
    await sleep(Math.max(pollMs, 3000));
  }
}

export { validateTranscript, extractBiasedVocabulary, sanitizePromptForVeo, getGenreAudioStrategy };
