import crypto from "node:crypto";
import { getPostgresPool } from "@/lib/db/client";

const CONTROL_TABLE = `
CREATE TABLE IF NOT EXISTS reel_production_controls (
  production_id TEXT PRIMARY KEY,
  generation_token TEXT NOT NULL,
  cancelled_at TIMESTAMPTZ,
  superseded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
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

export interface ProductionControl {
  productionId: string;
  generationToken: string;
  cancelledAt?: string;
  supersededBy?: string;
}

export const reelProductionControl = {
  async register(productionId: string): Promise<ProductionControl> {
    const pool = await ensureTables();
    const generationToken = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO reel_production_controls (production_id, generation_token)
       VALUES ($1,$2)
       ON CONFLICT (production_id) DO UPDATE SET updated_at=NOW()
       RETURNING *`,
      [productionId, generationToken]
    );
    const row = result.rows[0];
    return { productionId: row.production_id, generationToken: row.generation_token, cancelledAt: row.cancelled_at?.toISOString?.(), supersededBy: row.superseded_by || undefined };
  },

  async get(productionId: string): Promise<ProductionControl | null> {
    const pool = await ensureTables();
    const result = await pool.query(`SELECT * FROM reel_production_controls WHERE production_id=$1`, [productionId]);
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return { productionId: row.production_id, generationToken: row.generation_token, cancelledAt: row.cancelled_at ? new Date(row.cancelled_at).toISOString() : undefined, supersededBy: row.superseded_by || undefined };
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
    const control = await this.get(productionId);
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
    return {
      healthy: ageSec <= maxAgeSec,
      workerId: String(row.worker_id),
      heartbeatAt: new Date(row.heartbeat_at).toISOString(),
      ageSec: Number(ageSec.toFixed(1)),
      metadata: row.metadata_json || {},
      reason: ageSec <= maxAgeSec ? undefined : "stale_worker_heartbeat",
    };
  },
};
