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
import { ensureCharacterSheet, firstFrameForShot, seedForShot } from "./characterAnchor.mjs";
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
});
const sleep = ms => new Promise(r => setTimeout(r, ms));

await pool.query(`
CREATE TABLE IF NOT EXISTS reel_operations (
 id TEXT PRIMARY KEY, production_id TEXT NOT NULL, kind TEXT NOT NULL, target_id TEXT,
 idempotency_key TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'QUEUED', attempt INTEGER NOT NULL DEFAULT 0,
 provider_operation_name TEXT, payload_json JSONB NOT NULL DEFAULT '{}'::jsonb, result_json JSONB, last_error TEXT,
 lease_owner TEXT, lease_expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS reel_production_controls (
 production_id TEXT PRIMARY KEY, generation_token TEXT NOT NULL, cancelled_at TIMESTAMPTZ, superseded_by TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS reel_worker_heartbeats (
 worker_id TEXT PRIMARY KEY, worker_role TEXT NOT NULL, started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb);
CREATE INDEX IF NOT EXISTS idx_reel_operations_status_created ON reel_operations(status,created_at);
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


// P0.3: Legacy Mumbai purge excised from worker boot sequence.
// One-off migration has been moved to scripts/migrations/one_off_purge_mumbai.mjs


async function runDeadlockAndStarvationWatchdog() {
  try {
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
      const m = p.rows[0]?.manifest_json;
      if (!m || !Array.isArray(m.shots)) continue;
      const shot = m.shots.find(s => s.id === bRow.target_id);
      if (shot?.dependsOnShotIds?.length) {
        // Check for dead / terminal parent failure
        const deadDep = shot.dependsOnShotIds.find(depId => {
          const dep = m.shots.find(s => s.id === depId);
          return dep?.status === "FAILED" || dep?.status === "CANCELLED";
        });
        if (deadDep) {
          await pool.query(`
            UPDATE reel_operations
            SET status='CANCELLED',
                last_error=$2,
                lease_owner=NULL,
                lease_expires_at=NULL,
                updated_at=NOW()
            WHERE id=$1
          `, [bRow.id, `PARENT_TERMINAL_FAILURE: Upstream dependency ${deadDep} failed or was cancelled`]);
          console.log(`[reel-worker] [watchdog] Terminal cascading: cancelled BLOCKED shot ${shot.id} (dep ${deadDep} dead)`);
          continue;
        }

        // Check for 15-minute wait ceiling per P1.1
        const blockedAgeMs = Date.now() - new Date(bRow.updated_at || bRow.created_at).getTime();
        const WAIT_CEILING_MS = 15 * 60 * 1000;
        if (blockedAgeMs > WAIT_CEILING_MS) {
          await pool.query(`
            UPDATE reel_operations
            SET status='FAILED',
                last_error=$2,
                lease_owner=NULL,
                lease_expires_at=NULL,
                updated_at=NOW()
            WHERE id=$1
          `, [bRow.id, `WAIT_CEILING_EXCEEDED: shot ${shot.id} exceeded 15 minute wait ceiling waiting on upstream dependencies`]);
          console.error(`[reel-worker] [watchdog] Wait ceiling exceeded (15m): marked shot ${shot.id} FAILED`);
          continue;
        }

        const allMet = shot.dependsOnShotIds.every(depId => {
          const dep = m.shots.find(s => s.id === depId);
          return dep?.asset?.videoUrl && ["GENERATED", "PASSED"].includes(dep.status);
        });
        if (allMet) {
          await pool.query(`
            UPDATE reel_operations
            SET status='QUEUED',
                attempt=0,
                last_error=NULL,
                lease_owner=NULL,
                lease_expires_at=NULL,
                updated_at=NOW()
            WHERE id=$1
          `, [bRow.id]);
          console.log(`[reel-worker] [watchdog] Unblocked BLOCKED shot ${shot.id}: all upstream dependencies satisfied`);
        }
      }
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
  let queueStats = { queued: 0, running: 0, blocked: 0, lastCompletedAgeSec: null };
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
    const lastDone = await pool.query(`
      SELECT MAX(updated_at) as last_completed_at
      FROM reel_operations
      WHERE status = 'SUCCEEDED'
    `);
    if (lastDone.rows[0]?.last_completed_at) {
      queueStats.lastCompletedAgeSec = Math.round((Date.now() - new Date(lastDone.rows[0].last_completed_at).getTime()) / 1000);
    }
  } catch (e) {
    // Non-fatal query error during shutdown or brief reconnect
  }

  await pool.query(`INSERT INTO reel_worker_heartbeats(worker_id,worker_role,metadata_json) VALUES($1,'reel-production',$2::jsonb)
    ON CONFLICT(worker_id) DO UPDATE SET heartbeat_at=NOW(),metadata_json=EXCLUDED.metadata_json`,
    [workerId, JSON.stringify({
      pid: process.pid,
      version: "v2.5",
      assetRootConfigured: Boolean(assetRoot()),
      geminiConfigured: Boolean(apiKey()),
      queueStats
    })]);

  const now = Date.now();
  if (now - lastHeartbeatLogMs >= 60000) {
    lastHeartbeatLogMs = now;
    if (queueStats.queued > 0 || queueStats.running > 0 || queueStats.blocked > 0) {
      console.log(`[reel-worker] [heartbeat] Active: ${queueStats.running} running, ${queueStats.queued} queued, ${queueStats.blocked} blocked (last completed: ${queueStats.lastCompletedAgeSec !== null ? `${queueStats.lastCompletedAgeSec}s ago` : 'none'})`);
    }
  }
}
await publishHeartbeat();
const heartbeatTimer = setInterval(() => publishHeartbeat().catch(e => console.error(`[reel-worker] heartbeat failed: ${e?.message || e}`)), heartbeatMs);
heartbeatTimer.unref();

function safeKey(key) { const n = String(key).replace(/\\/g, "/").replace(/^\/+/, ""); if (!n || n.includes("..") || n.startsWith("/")) throw new Error("Invalid asset key"); return n; }
function assetKeyFromUrl(url) { const p = "/api/reels/assets/"; if (!String(url).startsWith(p)) throw new Error(`Non-owned asset URL: ${url}`); return safeKey(String(url).slice(p.length).split("/").map(decodeURIComponent).join("/")); }
function assetPath(keyOrUrl) { const root = assetRoot(); if (!root) throw new Error("Durable asset storage is not configured"); const key = String(keyOrUrl).startsWith("/api/reels/assets/") ? assetKeyFromUrl(keyOrUrl) : safeKey(keyOrUrl); const rr = path.resolve(root), target = path.resolve(root, key); if (!target.startsWith(`${rr}${path.sep}`)) throw new Error("Asset path escaped durable root"); return { key, target }; }
async function writeAsset(key, buffer) { const r = assetPath(key); await fs.mkdir(path.dirname(r.target), { recursive: true }); await fs.writeFile(r.target, buffer); return { key: r.key, url: `/api/reels/assets/${r.key.split("/").map(encodeURIComponent).join("/")}` }; }
async function readAsset(keyOrUrl) { return fs.readFile(assetPath(keyOrUrl).target); }


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
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
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
function extractWordTimings(v) { const out = []; const visit = n => { if (!n || typeof n !== "object") return; const s = offsetToSec(n.start_offset ?? n.startOffset), e = offsetToSec(n.end_offset ?? n.endOffset), w = n.word ?? n.text; if (typeof w === "string" && s !== null && e !== null) out.push({ word: w.trim(), startSec: Number(s.toFixed(6)), endSec: Number(e.toFixed(6)) }); for (const c of Object.values(n)) Array.isArray(c) ? c.forEach(visit) : (c && typeof c === "object" && visit(c)); }; visit(v); return out.filter(t => t.word && t.endSec >= t.startSec).sort((a, b) => a.startSec - b.startSec || a.endSec - b.endSec); }
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
function validateTranscript(expectedText, timings, durationSec) { let ps = -1, pe = -1; for (const t of timings) { if (!t.word || t.startSec < 0 || t.endSec < t.startSec || t.startSec + .001 < ps || t.endSec + .001 < pe || t.endSec > durationSec + .25) throw new Error("Narration timestamps failed structural validation"); ps = t.startSec; pe = t.endSec; } const expected = normalizeWords(expectedText), actual = normalizeWords(timings.map(t => t.word).join(" ")); if (!expected.length || !actual.length) throw new Error("Transcript verification has no comparable words"); const wer = editDistance(expected, actual) / expected.length, coverage = lcsLength(expected, actual) / expected.length; const critical = new Set(["no", "not", "never", "without", "cannot", "can't", "wont", "won't", "must", "mustn't"]); const counts = new Map(); for (const w of actual) counts.set(w, (counts.get(w) || 0) + 1); const missing = []; for (const w of expected.filter(w => critical.has(w) || /^\d+(?:[.,]\d+)?%?$/.test(w))) { const c = counts.get(w) || 0; if (c <= 0) missing.push(w); else counts.set(w, c - 1); } const v = { expectedWords: expected.length, actualWords: actual.length, wer: Number(wer.toFixed(4)), coverage: Number(coverage.toFixed(4)), passed: wer <= MAX_WER && coverage >= MIN_COVERAGE && missing.length === 0, missingCritical: missing }; if (!v.passed) throw new Error(`Narration transcript mismatch: WER ${v.wer}, coverage ${v.coverage}${missing.length ? `, missing critical tokens: ${missing.join(", ")}` : ""}`); return v; }

async function getProduction(id) { const r = await pool.query(`SELECT * FROM reel_productions WHERE id=$1`, [id]); if (!r.rows[0]) throw new Error(`Production ${id} not found`); return { revision: Number(r.rows[0].revision), manifest: r.rows[0].manifest_json }; }
async function saveManifest(id, revision, manifest) { const r = await pool.query(`UPDATE reel_productions SET revision=revision+1,manifest_json=$3::jsonb,updated_at=NOW() WHERE id=$1 AND revision=$2 RETURNING revision`, [id, revision, JSON.stringify(manifest)]); if (!r.rows[0]) throw new Error(`Production ${id} changed concurrently while worker was attaching evidence`); return Number(r.rows[0].revision); }
async function updateOperation(id, patch) { const fields = [], values = [id]; let n = 2; const map = { status: "status", providerOperationName: "provider_operation_name", result: "result_json", lastError: "last_error", leaseExpiresAt: "lease_expires_at", leaseOwner: "lease_owner" }; for (const [k, col] of Object.entries(map)) { if (!(k in patch)) continue; fields.push(`${col}=$${n++}${k === "result" ? "::jsonb" : ""}`); values.push(k === "result" ? JSON.stringify(patch[k]) : patch[k]); } fields.push("updated_at=NOW()"); await pool.query(`UPDATE reel_operations SET ${fields.join(",")} WHERE id=$1`, values); }
async function operationHeartbeat(id) { await pool.query(`UPDATE reel_operations SET lease_expires_at=NOW()+INTERVAL '10 minutes',updated_at=NOW() WHERE id=$1 AND lease_owner=$2`, [id, workerId]); }
async function claim() {
  const r = await pool.query(`
    WITH c AS (
      SELECT id FROM reel_operations
      WHERE (status='QUEUED' AND COALESCE(attempt, 0) < 5)
         OR (status='RUNNING' AND lease_expires_at < NOW() AND COALESCE(attempt, 0) < 5)
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE reel_operations o
    SET status='RUNNING',
        attempt=COALESCE(o.attempt, 0) + 1,
        lease_owner=$1,
        lease_expires_at=NOW() + INTERVAL '10 minutes',
        updated_at=NOW()
    FROM c
    WHERE o.id=c.id
    RETURNING o.*
  `, [workerId]);
  return r.rows[0] || null;
}
async function controlFor(op) { const r = await pool.query(`SELECT * FROM reel_production_controls WHERE production_id=$1`, [op.production_id]); if (!r.rows[0]) throw new Error("OPERATION_CANCELLED: missing production control"); const c = r.rows[0]; if (c.cancelled_at) throw new Error("OPERATION_CANCELLED: production cancelled or superseded"); if (String(c.generation_token) !== String(op.payload_json?.generationToken || "")) throw new Error("OPERATION_CANCELLED: generation token no longer applies"); return c; }
async function assertApplicable(op, { beforeDispatch = false } = {}) { await controlFor(op); const current = await getProduction(op.production_id); if (op.kind === "NARRATION" && !["SCRIPT_READY", "AUDIO_GENERATING"].includes(current.manifest.status)) throw new Error(`OPERATION_CANCELLED: narration no longer applies to ${current.manifest.status}`); if (op.kind === "SHOT") { const s = current.manifest.shots.find(x => x.id === op.target_id); if (!s) throw new Error("OPERATION_CANCELLED: shot removed"); if (s.asset?.videoUrl) throw new Error("OPERATION_CANCELLED: shot already has media"); if (!["PLANNED", "FAILED", "GENERATING"].includes(s.status)) throw new Error(`OPERATION_CANCELLED: shot no longer applies to ${s.status}`); } if (op.kind === "ROUGH_CUT" && current.manifest.status !== "ROUGH_CUT_READY") throw new Error(`OPERATION_CANCELLED: rough cut no longer applies to ${current.manifest.status}`); if (op.kind === "NATIVE_REEL" && !["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(current.manifest.status)) throw new Error(`OPERATION_CANCELLED: native reel no longer applies to ${current.manifest.status}`); if (beforeDispatch && op.status === "CANCELLED") throw new Error("OPERATION_CANCELLED: operation cancelled"); return current; }

async function markRunning(op) { const c = await assertApplicable(op); const m = c.manifest; if (op.kind === "NARRATION" && m.status === "SCRIPT_READY") m.status = "AUDIO_GENERATING"; if (op.kind === "SHOT") { const s = m.shots.find(x => x.id === op.target_id); if (["PLANNED", "FAILED"].includes(s.status)) s.status = "GENERATING"; if (["SHOTS_PLANNED", "REPAIRING"].includes(m.status)) m.status = "VIDEO_GENERATING"; } if (op.kind === "NATIVE_REEL" && ["SHOTS_PLANNED", "REPAIRING"].includes(m.status)) m.status = "VIDEO_GENERATING"; await saveManifest(op.production_id, c.revision, m); }
async function markTerminalFailure(op, message) { try { const c = await getProduction(op.production_id), m = c.manifest; m.qa = m.qa || { minimumReadyScore: 90, passed: false, warnings: [], failures: [] }; m.qa.passed = false; m.qa.failures = [...(m.qa.failures || []), message]; if (op.kind === "SHOT") { const s = m.shots.find(x => x.id === op.target_id); if (s) { s.status = "FAILED"; s.qa = s.qa || { warnings: [], failures: [] }; s.qa.failures = [...(s.qa.failures || []), message]; } m.status = "REPAIRING"; } else if (op.kind === "ROUGH_CUT" || op.kind === "NATIVE_REEL") m.status = "REPAIRING"; else m.status = "FAILED"; await saveManifest(op.production_id, c.revision, m); } catch (e) { console.error(`[reel-worker] failure-state update failed: ${e?.message || e}`); } }

async function transcribeAndValidateNarration(op, manifest, checkpoint, wav) {
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
  const tr = await fetch(`${API_BASE}/v1beta/interactions`, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey(), "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gemini-3.5-transcribe", input: [{ type: "audio", uri, mime_type: "audio/wav" }], generation_config: { transcription_config: { mode: { type: "verbatim", timestamp_granularities: ["word"] } } } }),
  });
  const tj = await tr.json();
  if (!tr.ok) throw new Error(`Gemini transcription failed (${tr.status})`);
  const timings = extractWordTimings(tj);
  if (!timings.length) throw new Error("No word-level timestamps returned");
  const validation = validateTranscript(manifest.masterScript, timings, checkpoint.actualDurationSec);
  await assertApplicable(op);
  return { ...checkpoint, stage: "COMPLETE", wordTimings: timings, alignmentValidation: validation };
}

async function generateNarration(op, manifest, existingCheckpoint = null) {
  if (!apiKey()) throw new Error("Gemini API key is missing");
  if (!assetRoot()) throw new Error("Durable asset root is missing");

  let checkpoint = existingCheckpoint;
  let wav;

  if (checkpoint?.stage === "AUDIO_PERSISTED" && checkpoint.narrationUrl) {
    wav = await readAsset(checkpoint.narrationUrl);
    await updateOperation(op.id, { providerOperationName: "tts-audio-persisted" });
  } else {
    const prior = String(op.provider_operation_name || "");
    if (prior === "tts-recovery-dispatch-started") throw new Error("AMBIGUOUS_TTS_RESULT_AFTER_BOUNDED_RECOVERY");
    await assertApplicable(op, { beforeDispatch: true });
    await updateOperation(op.id, { providerOperationName: prior === "tts-dispatch-started" ? "tts-recovery-dispatch-started" : "tts-dispatch-started" });

    const model = process.env.ZYVORIQ_TTS_MODEL || "gemini-3.1-flash-tts-preview";
    const voice = process.env.ZYVORIQ_TTS_VOICE || "Kore";
    const prompt = [
      "Synthesize speech for the transcript below. Do not speak these instructions.",
      `Performance direction: ${manifest.tone}. Natural social-video delivery, clear articulation, no added words.`,
      "TRANSCRIPT START",
      manifest.masterScript,
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
      throw new Error(`Gemini TTS failed (${r.status})`);
    }
    const b64 = findAudioData(j);
    if (!b64) {
      await updateOperation(op.id, { providerOperationName: null });
      throw new Error("Gemini TTS returned no audio payload");
    }

    const pcm = Buffer.from(b64, "base64");
    const durationSec = pcm.length / (SAMPLE_RATE * CHANNELS * SAMPLE_WIDTH);
    wav = wavFromPcm(pcm);
    const digest = crypto.createHash("sha256").update(wav).digest("hex").slice(0, 16);
    const asset = await writeAsset(`reels/${op.production_id}/narration-${digest}.wav`, wav);
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
  try { await ensureCharacterSheet(m, op.production_id, writeAsset); } catch (e) { console.warn(`[reel-worker] character sheet skipped: ${e?.message || e}`); }
  m.status = "SHOTS_PLANNED";
  await saveManifest(op.production_id, c.revision, m);
}
async function extractReference(op, shot, manifest) { if (!shot.dependsOnShotIds?.length) return null; const dep = manifest.shots.find(s => s.id === shot.dependsOnShotIds.at(-1)); if (!dep?.asset?.videoUrl) throw new Error("Continuity dependency has no media"); const tmp = path.join(os.tmpdir(), `zyvoriq-ref-${crypto.randomUUID()}.png`), depSec = Number(dep.asset?.actualDurationSec || 0), lastSec = depSec > 0 ? Math.min(Number(dep.trimOutSec || 0), depSec) : Number(dep.trimOutSec || 0), t = Math.max(0, Math.max(Number(dep.trimInSec || 0), lastSec - (depSec > 0 && lastSec < depSec - 0.05 ? 1 / 30 : 0.15))); try { await execFileAsync("ffmpeg", ["-y", "-ss", String(t), "-i", assetPath(dep.asset.videoUrl).target, "-frames:v", "1", "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920", tmp], { timeout: 30000, maxBuffer: 2e6 }); const st = await fs.stat(tmp).catch(() => null); if (!st?.size) throw new Error(`Anchor extraction produced no frame for ${dep.id} at ${t.toFixed(3)}s (source ${depSec}s, trimOut ${dep.trimOutSec}s)`); const b = await fs.readFile(tmp), digest = crypto.createHash("sha256").update(b).digest("hex").slice(0, 16), saved = await writeAsset(`reels/${op.production_id}/references/${shot.id}-from-${dep.id}-${digest}.png`, b); return { buffer: b, url: saved.url, dependencyId: dep.id }; } finally { try { await fs.unlink(tmp); } catch {} } }
async function probeVideo(buffer) { const tmp = path.join(os.tmpdir(), `zyvoriq-probe-${crypto.randomUUID()}.mp4`); try { await fs.writeFile(tmp, buffer); const { stdout } = await execFileAsync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_name,width,height,r_frame_rate", "-of", "json", tmp], { timeout: 30000, maxBuffer: 2e6 }); const p = JSON.parse(stdout), s = p.streams?.find(x => x.width && x.height) || p.streams?.[0] || {}; return { durationSec: Number(Number(p.format?.duration || 0).toFixed(6)), codec: s.codec_name, width: Number(s.width || 0), height: Number(s.height || 0), frameRate: s.r_frame_rate }; } finally { try { await fs.unlink(tmp); } catch {} } }
function veoModel(t) {
  if (process.env.ZYVORIQ_VEO_MODEL) return process.env.ZYVORIQ_VEO_MODEL;
  return t === "quality" ? "veo-3.1-generate-preview" : t === "lite" ? "veo-3.1-lite-generate-preview" : "veo-3.1-fast-generate-preview";
}
async function generateShot(op, manifest, shot) {
  if (!apiKey() || !assetRoot()) throw new Error("Veo prerequisites missing");
  const tier = op.payload_json?.modelTier || "fast";
  const model = veoModel(tier);
  const ref = await extractReference(op, shot, manifest);
  const prior = String(op.provider_operation_name || "");
  const dispatchMarkers = new Set(["veo-dispatch-started", "veo-recovery-dispatch-started"]);
  let name = prior && !dispatchMarkers.has(prior) ? prior : null;   if (name) console.log(`[reel-worker] [anchor] SKIPPED for ${shot.id} — resuming existing Veo op, no new dispatch`);

  if (!name) {
    if (prior === "veo-recovery-dispatch-started") {
      throw new Error("AMBIGUOUS_VEO_DISPATCH_AFTER_BOUNDED_RECOVERY");
    }
    await assertApplicable(op, { beforeDispatch: true });
    const dispatchMarker = prior === "veo-dispatch-started" ? "veo-recovery-dispatch-started" : "veo-dispatch-started";
    await updateOperation(op.id, { providerOperationName: dispatchMarker });


    const instance = { prompt: shot.generationPrompt };

    let anchorFrame = null;
    try {
      anchorFrame = await firstFrameForShot(manifest, shot, op.production_id, writeAsset, readAsset);
    } catch (e) {
      console.warn(`[reel-worker] anchor frame failed: ${e?.message || e}`);
    }
      if (anchorFrame) {
      console.log(`[reel-worker] [anchor] applied canonical first frame to ${shot.id}`);
      instance.image = { mimeType: "image/png", bytesBase64Encoded: anchorFrame.toString("base64") };
    } else if (ref) {
      instance.image = { mimeType: "image/png", bytesBase64Encoded: ref.buffer.toString("base64") };
    }
    const seed = seedForShot(op.production_id, shot.id);



    

    let d;
    try {
      d = await fetch(`${API_BASE}/v1beta/models/${model}:predictLongRunning`, {
        method: "POST",
        headers: { "x-goog-api-key": apiKey(), "Content-Type": "application/json" },
        body: JSON.stringify({ instances: [instance], parameters: { aspectRatio: "9:16", durationSeconds: shot.generationDurationSec, seed, negativePrompt: "different person, changing face, inconsistent character, morphing, on-screen text, captions, watermark, logo" } }),
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
      await operationHeartbeat(op.id);
      await assertApplicable(op);
    }
    const p = await fetch(`${API_BASE}/v1beta/${name}`, { headers: { "x-goog-api-key": apiKey() } });
    const j = await p.json();
    if (!p.ok || j.error) throw new Error(`Veo polling failed: ${j.error?.message || p.status}`);
    if (j.done) {
      uri = j.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      if (!uri) throw new Error("Veo completed without video URI");
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
  return { videoUrl: asset.url, actualDurationSec: probe.durationSec, operationName: name, provider: "google-veo", model, continuityReferenceUrl: ref?.url };
}
async function applyShot(op, result) {
  await assertApplicable(op);
  const c = await getProduction(op.production_id), m = c.manifest, s = m.shots.find(x => x.id === op.target_id);
  if (!s) throw new Error("Shot removed");
  s.asset = { videoUrl: result.videoUrl, actualDurationSec: result.actualDurationSec, operationName: result.operationName, provider: result.provider, model: result.model };
  s.status = "GENERATED";
  if (result.continuityReferenceUrl) s.continuityIn.referenceFrameUrl = result.continuityReferenceUrl;
  m.status = m.shots.every(x => x.asset?.videoUrl && ["GENERATED", "PASSED"].includes(x.status)) ? "ROUGH_CUT_READY" : "VIDEO_GENERATING";
  await saveManifest(op.production_id, c.revision, m);

  // Parent completion event: unblock any dependent operations for this production whose upstream dependencies are now met!
  try {
    const blockedOps = await pool.query(
      `SELECT id, target_id FROM reel_operations WHERE production_id=$1 AND status='BLOCKED'`,
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
      }
    }
  } catch (unblockErr) {
    console.error(`[reel-worker] Parent completion unblock error: ${unblockErr?.message || unblockErr}`);
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

async function renderRough(op, m) {
  await assertApplicable(op, { beforeDispatch: true });
  if (!assetRoot() || !m.audio?.narrationUrl || !m.audio?.actualDurationSec || !m.audio?.alignmentValidation?.passed) throw new Error("Validated narration and durable storage required");

  const studio1 = op.payload_json?.studio1 === true;
  if (studio1) {
    if (!op.payload_json?.narrationSyncedTimeline) throw new Error("Studio1 exact render requires narrationSyncedTimeline operation evidence");
    if (Number(m.studio1?.timelineSync?.version || 0) < 2) throw new Error("Studio1 exact render requires timelineSync version 2");
    const c = await getProduction(op.production_id);
    const sync = synchronizeStudio1ManifestTimeline(c.manifest, { mode: "render" });
    await saveManifest(op.production_id, c.revision, c.manifest);
    m = c.manifest;
    console.log(`[reel-worker] studio1 render resync ${op.production_id} ${JSON.stringify(sync.adaptations)}`);
  } else {
    console.warn(`[reel-worker] rough cut ${op.production_id} rendering on legacy unsynced path`);
  }

  const d = Number(m.audio.actualDurationSec), tmp = path.join(os.tmpdir(), `zyvoriq-rough-${crypto.randomUUID()}.mp4`), args = ["-y"];
  for (const s of m.shots) { if (!s.asset?.videoUrl) throw new Error(`${s.id} has no source`); args.push("-i", assetPath(s.asset.videoUrl).target); }
  args.push("-i", assetPath(m.audio.narrationUrl).target);
  let timelineQa = null;
  let renderPlan = null;
  if (studio1) {
    renderPlan = buildStudio1RenderPlan(m);
    assertStudio1RenderAdaptation(renderPlan);
  }

  const f = [];
  if (studio1) {
    renderPlan.scenes.forEach(scene => f.push(buildStudio1VisualFilter(m.shots[scene.inputIndex], scene)));
  } else {
    m.shots.forEach((s, i) => f.push(`[${i}:v]trim=start=${s.trimInSec}:end=${s.trimOutSec},setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v${i}]`));
  }
  f.push(`${m.shots.map((_, i) => `[v${i}]`).join("")}concat=n=${m.shots.length}:v=1:a=0[vout]`);
  f.push(`[${m.shots.length}:a]atrim=duration=${d},asetpts=PTS-STARTPTS,aresample=48000[aout]`);
  args.push("-filter_complex", f.join(";"), "-map", "[vout]", "-map", "[aout]", "-t", String(d), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", tmp);
  try {
    await execFileAsync("ffmpeg", args, { timeout: 300000, maxBuffer: 4e6 });
    await assertApplicable(op);
    const buffer = await fs.readFile(tmp), probe = await probeVideo(buffer);
    if (Math.abs(probe.durationSec - d) > .08) throw new Error(`Rough cut duration drift ${probe.durationSec} vs ${d}`);
    if (studio1) {
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
  } finally { try { await fs.unlink(tmp); } catch {} }
}
async function applyRough(op, result) {
  await assertApplicable(op);
  const c = await getProduction(op.production_id), m = c.manifest;
  m.outputs = { ...(m.outputs || {}), narratedRoughCut: result };
  if (result.timelineQa && m.studio1?.timelineSync) m.studio1.timelineSync.renderQa = result.timelineQa;
  m.status = "MIXING";
  await saveManifest(op.production_id, c.revision, m);
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
      await operationHeartbeat(op.id);
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

console.log(`[reel-worker] dedicated worker started ${workerId}`);
for (;;) {
  try {
    const op = await claim();
    if (!op) { await sleep(pollMs); continue; }
    console.log(`[reel-worker] [transition] Claimed ${op.id} (${op.kind}${op.target_id ? `:${op.target_id}` : ''}) for prod ${op.production_id} (attempt ${op.attempt})`);
    try {
      await processOperation(op);
    } catch (error) {
      const message = String(error?.message || error).slice(0, 2000);
      const cancelled = message.startsWith("OPERATION_CANCELLED");
      const ambiguous = message.includes("AMBIGUOUS_TTS_RESULT_AFTER_BOUNDED_RECOVERY") || message.includes("AMBIGUOUS_VEO_DISPATCH_AFTER_BOUNDED_RECOVERY") || message.includes("AMBIGUOUS_VEO_DISPATCH_NO_OPERATION_ID");
      const deterministic = message.startsWith("Studio1");
      const retry = !cancelled && !ambiguous && !deterministic && Number(op.attempt || 0) < 3;
      await pool.query(`UPDATE reel_operations SET status=$2,last_error=$3,lease_owner=NULL,lease_expires_at=NULL,updated_at=NOW() WHERE id=$1`, [op.id, cancelled ? "CANCELLED" : retry ? "QUEUED" : "FAILED", message]);
      if (!cancelled && !retry) await markTerminalFailure(op, message);
      console.error(`[reel-worker] [transition] ${op.id} ${cancelled ? "cancelled" : retry ? "retry" : "failed"}: ${message}`);
    }
  } catch (error) {
    console.error(`[reel-worker] loop error: ${error?.message || error}`);
    await sleep(Math.max(pollMs, 3000));
  }
}
