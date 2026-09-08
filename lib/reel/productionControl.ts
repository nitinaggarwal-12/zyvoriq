import crypto from "node:crypto";
import { getPostgresPool } from "@/lib/db/client";

const CONTROL_TABLE = `
CREATE TABLE IF NOT EXISTS reel_production_controls (
  production_id TEXT PRIMARY KEY,
  generation_token TEXT NOT NULL,
  cancelled_at TIMESTAMPTZ,
  superseded_by TEXT,
  priority INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE reel_production_controls ADD COLUMN IF NOT EXISTS priority INT NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_pc_priority ON reel_production_controls (production_id, priority);
CREATE TABLE IF NOT EXISTS reel_worker_heartbeats (
  worker_id TEXT PRIMARY KEY,
  worker_role TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_reel_worker_heartbeats_role ON reel_worker_heartbeats(worker_role, heartbeat_at DESC);
`;

function poolOrThrow() {
  const pool = getPostgresPool();
  if (!pool) throw new Error("Production control requires Postgres");
  return pool;
}

async function ensureTables() {
  const pool = poolOrThrow();
  await pool.query(CONTROL_TABLE);
  return pool;
}

async function getControl(productionId: string): Promise<ProductionControl | null> {
  const pool = await ensureTables();
  const result = await pool.query(`SELECT * FROM reel_production_controls WHERE production_id=$1`, [productionId]);
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    productionId: row.production_id,
    generationToken: row.generation_token,
    cancelledAt: row.cancelled_at ? new Date(row.cancelled_at).toISOString() : undefined,
    supersededBy: row.superseded_by || undefined,
    priority: Number(row.priority || 0),
  };
}

export interface ProductionControl {
  productionId: string;
  generationToken: string;
  cancelledAt?: string;
  supersededBy?: string;
  priority: number;
}

export const reelProductionControl = {
  async register(productionId: string, priority = 0): Promise<ProductionControl> {
    const pool = await ensureTables();
    const generationToken = crypto.randomUUID();
    const clampedPriority = Math.max(0, Math.min(100, Math.floor(priority)));
    const result = await pool.query(
      `INSERT INTO reel_production_controls (production_id, generation_token, priority)
       VALUES ($1,$2,$3)
       ON CONFLICT (production_id) DO UPDATE SET updated_at=NOW()
       RETURNING *`,
      [productionId, generationToken, clampedPriority]
    );
    const row = result.rows[0];
    return {
      productionId: row.production_id,
      generationToken: row.generation_token,
      cancelledAt: row.cancelled_at ? new Date(row.cancelled_at).toISOString() : undefined,
      supersededBy: row.superseded_by || undefined,
      priority: Number(row.priority || 0),
    };
  },

  get: getControl,

  async setPriority(productionId: string, priority: number): Promise<ProductionControl> {
    const pool = await ensureTables();
    const clampedPriority = Math.max(0, Math.min(100, Math.floor(priority)));
    const result = await pool.query(
      `UPDATE reel_production_controls
       SET priority=$2, updated_at=NOW()
       WHERE production_id=$1 RETURNING *`,
      [productionId, clampedPriority]
    );
    if (!result.rows[0]) {
      const generationToken = crypto.randomUUID();
      const insertResult = await pool.query(
        `INSERT INTO reel_production_controls (production_id, generation_token, priority)
         VALUES ($1,$2,$3)
         ON CONFLICT (production_id) DO UPDATE SET priority=$3, updated_at=NOW()
         RETURNING *`,
        [productionId, generationToken, clampedPriority]
      );
      const row = insertResult.rows[0];
      return {
        productionId: row.production_id,
        generationToken: row.generation_token,
        cancelledAt: row.cancelled_at ? new Date(row.cancelled_at).toISOString() : undefined,
        supersededBy: row.superseded_by || undefined,
        priority: Number(row.priority || 0),
      };
    }
    const row = result.rows[0];
    return {
      productionId: row.production_id,
      generationToken: row.generation_token,
      cancelledAt: row.cancelled_at ? new Date(row.cancelled_at).toISOString() : undefined,
      supersededBy: row.superseded_by || undefined,
      priority: Number(row.priority || 0),
    };
  },

  async getPriorities(productionIds: string[]): Promise<Record<string, number>> {
    if (!productionIds.length) return {};
    const pool = await ensureTables();
    const result = await pool.query(
      `SELECT production_id, priority FROM reel_production_controls WHERE production_id = ANY($1)`,
      [productionIds]
    );
    const map: Record<string, number> = {};
    for (const row of result.rows) {
      map[row.production_id] = Number(row.priority || 0);
    }
    return map;
  },

  async cancel(productionId: string, supersededBy?: string) {
    const pool = await ensureTables();
    const result = await pool.query(
      `UPDATE reel_production_controls
       SET cancelled_at=COALESCE(cancelled_at,NOW()), superseded_by=COALESCE($2,superseded_by), updated_at=NOW()
       WHERE production_id=$1 RETURNING *`,
      [productionId, supersededBy || null]
    );
    if (!result.rows[0]) throw new Error(`Production control ${productionId} not found`);
    await pool.query(
      `UPDATE reel_operations SET status='CANCELLED', last_error='Production cancelled or superseded', lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
       WHERE production_id=$1 AND status='QUEUED'`,
      [productionId]
    );
    return result.rows[0];
  },

  async requireActive(productionId: string) {
    const control = await getControl(productionId);
    if (!control) throw new Error(`Production ${productionId} has no durable control record`);
    if (control.cancelledAt) throw new Error(`Production ${productionId} is cancelled${control.supersededBy ? ` and superseded by ${control.supersededBy}` : ""}`);
    return control;
  },

  async workerHealth(maxAgeSec = 45) {
    const pool = await ensureTables();
    const result = await pool.query(
      `SELECT worker_id, worker_role, started_at, heartbeat_at, metadata_json,
              EXTRACT(EPOCH FROM (NOW()-heartbeat_at)) AS age_sec
       FROM reel_worker_heartbeats
       WHERE worker_role='reel-production'
       ORDER BY heartbeat_at DESC LIMIT 1`
    );
    if (!result.rows[0]) return { healthy: false, reason: "no_worker_heartbeat" as const };
    const row = result.rows[0];
    const ageSec = Number(row.age_sec || 0);
    const metadata = row.metadata_json || {};
    const fresh = ageSec <= maxAgeSec;
    const ready = metadata.ready !== false && Boolean(metadata.assetRootConfigured) && Boolean(metadata.geminiConfigured);
    return {
      healthy: fresh && ready,
      workerId: String(row.worker_id),
      heartbeatAt: new Date(row.heartbeat_at).toISOString(),
      ageSec: Number(ageSec.toFixed(1)),
      metadata,
      reason: !fresh ? "stale_worker_heartbeat" : !ready ? "worker_prerequisites_unavailable" : undefined,
    };
  },
};
