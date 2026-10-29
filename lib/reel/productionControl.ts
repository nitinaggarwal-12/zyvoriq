import crypto from "node:crypto";
import { ensurePostgresSchema, getDatabase, getPostgresPool, withRetry } from "@/lib/db/client";

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

const SQLITE_CONTROL_TABLE = `
CREATE TABLE IF NOT EXISTS reel_production_controls (
  production_id TEXT PRIMARY KEY,
  generation_token TEXT NOT NULL,
  cancelled_at TEXT,
  superseded_by TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pc_priority ON reel_production_controls(production_id, priority);
`;

let sqliteControlReady = false;
let pgControlInitPromise: Promise<void> | null = null;

function ensureSqliteControlDb() {
  const database = getDatabase();
  if (!sqliteControlReady) {
    withRetry(() => {
      database.exec(SQLITE_CONTROL_TABLE);
    });
    sqliteControlReady = true;
  }
  return database;
}

async function getOptionalPostgresControl() {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  if (!pool) return null;
  if (!pgControlInitPromise) {
    pgControlInitPromise = pool.query(CONTROL_TABLE).then(() => undefined).catch((err) => {
      pgControlInitPromise = null;
      throw err;
    });
  }
  await pgControlInitPromise;
  return pool;
}

function mapControlRow(row: any): ProductionControl {
  return {
    productionId: String(row.production_id),
    generationToken: String(row.generation_token),
    cancelledAt: row.cancelled_at ? new Date(row.cancelled_at).toISOString() : undefined,
    supersededBy: row.superseded_by ? String(row.superseded_by) : undefined,
    priority: Number(row.priority || 0),
  };
}

async function getControl(productionId: string): Promise<ProductionControl | null> {
  const pool = await getOptionalPostgresControl();
  if (pool) {
    const result = await pool.query(`SELECT * FROM reel_production_controls WHERE production_id=$1`, [productionId]);
    return result.rows[0] ? mapControlRow(result.rows[0]) : null;
  }
  const database = ensureSqliteControlDb();
  return withRetry(() => {
    const row = database
      .prepare(`SELECT * FROM reel_production_controls WHERE production_id = ?`)
      .get(productionId);
    return row ? mapControlRow(row) : null;
  });
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
    const generationToken = crypto.randomUUID();
    const clampedPriority = Math.max(0, Math.min(100, Math.floor(priority)));
    const pool = await getOptionalPostgresControl();
    if (pool) {
      const result = await pool.query(
        `INSERT INTO reel_production_controls (production_id, generation_token, priority)
         VALUES ($1,$2,$3)
         ON CONFLICT (production_id) DO UPDATE SET updated_at=NOW()
         RETURNING *`,
        [productionId, generationToken, clampedPriority]
      );
      return mapControlRow(result.rows[0]);
    }

    const now = new Date().toISOString();
    const database = ensureSqliteControlDb();
    return withRetry(() => {
      database
        .prepare(
          `INSERT INTO reel_production_controls (production_id, generation_token, priority, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(production_id) DO UPDATE SET updated_at = excluded.updated_at`
        )
        .run(productionId, generationToken, clampedPriority, now, now);
      const row = database
        .prepare(`SELECT * FROM reel_production_controls WHERE production_id = ?`)
        .get(productionId);
      return mapControlRow(row);
    });
  },

  get: getControl,

  async setPriority(productionId: string, priority: number): Promise<ProductionControl> {
    const clampedPriority = Math.max(0, Math.min(100, Math.floor(priority)));
    const pool = await getOptionalPostgresControl();
    if (pool) {
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
        return mapControlRow(insertResult.rows[0]);
      }
      return mapControlRow(result.rows[0]);
    }

    const now = new Date().toISOString();
    const generationToken = crypto.randomUUID();
    const database = ensureSqliteControlDb();
    return withRetry(() => {
      database
        .prepare(
          `INSERT INTO reel_production_controls (production_id, generation_token, priority, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(production_id) DO UPDATE SET priority = excluded.priority, updated_at = excluded.updated_at`
        )
        .run(productionId, generationToken, clampedPriority, now, now);
      const row = database
        .prepare(`SELECT * FROM reel_production_controls WHERE production_id = ?`)
        .get(productionId);
      return mapControlRow(row);
    });
  },

  async getPriorities(productionIds: string[]): Promise<Record<string, number>> {
    if (!productionIds.length) return {};
    const pool = await getOptionalPostgresControl();
    if (pool) {
      const result = await pool.query(
        `SELECT production_id, priority FROM reel_production_controls WHERE production_id = ANY($1)`,
        [productionIds]
      );
      const map: Record<string, number> = {};
      for (const row of result.rows) {
        map[row.production_id] = Number(row.priority || 0);
      }
      return map;
    }

    const database = ensureSqliteControlDb();
    return withRetry(() => {
      const placeholders = productionIds.map(() => "?").join(", ");
      const rows = database
        .prepare(
          `SELECT production_id, priority FROM reel_production_controls WHERE production_id IN (${placeholders})`
        )
        .all(...productionIds) as any[];
      const map: Record<string, number> = {};
      for (const row of rows) {
        map[String(row.production_id)] = Number(row.priority || 0);
      }
      return map;
    });
  },

  async cancel(productionId: string, supersededBy?: string) {
    const pool = await getOptionalPostgresControl();
    if (pool) {
      let result = await pool.query(
        `UPDATE reel_production_controls
         SET cancelled_at=COALESCE(cancelled_at,NOW()), superseded_by=COALESCE($2,superseded_by), updated_at=NOW()
         WHERE production_id=$1 RETURNING *`,
        [productionId, supersededBy || null]
      );
      if (!result.rows[0]) {
        const generationToken = crypto.randomUUID();
        result = await pool.query(
          `INSERT INTO reel_production_controls (production_id, generation_token, cancelled_at, superseded_by)
           VALUES ($1,$2,NOW(),$3) RETURNING *`,
          [productionId, generationToken, supersededBy || null]
        );
      }
      try {
        await pool.query(
          `UPDATE reel_operations SET status='CANCELLED', last_error='Production cancelled or superseded', lease_owner=NULL, lease_expires_at=NULL, updated_at=NOW()
           WHERE production_id=$1 AND status='QUEUED'`,
          [productionId]
        );
      } catch {}
      return result.rows[0];
    }

    const now = new Date().toISOString();
    const generationToken = crypto.randomUUID();
    const database = ensureSqliteControlDb();
    return withRetry(() => {
      database
        .prepare(
          `INSERT INTO reel_production_controls (production_id, generation_token, cancelled_at, superseded_by, priority, created_at, updated_at)
           VALUES (?, ?, ?, ?, 0, ?, ?)
           ON CONFLICT(production_id) DO UPDATE SET
             cancelled_at = COALESCE(reel_production_controls.cancelled_at, excluded.cancelled_at),
             superseded_by = COALESCE(excluded.superseded_by, reel_production_controls.superseded_by),
             updated_at = excluded.updated_at`
        )
        .run(productionId, generationToken, now, supersededBy || null, now, now);
      return database
        .prepare(`SELECT * FROM reel_production_controls WHERE production_id = ?`)
        .get(productionId);
    });
  },

  async requireActive(productionId: string) {
    const control = await getControl(productionId);
    if (!control) throw new Error(`Production ${productionId} has no durable control record`);
    if (control.cancelledAt) {
      throw new Error(
        `Production ${productionId} is cancelled${control.supersededBy ? ` and superseded by ${control.supersededBy}` : ""}`
      );
    }
    return control;
  },

  async workerHealth(maxAgeSec = 45) {
    const pool = await getOptionalPostgresControl();
    if (!pool) {
      return { healthy: false, reason: "studio1_worker_pruned_option_a" as const };
    }
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
