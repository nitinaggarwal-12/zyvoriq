import crypto from "node:crypto";
import { getPostgresPool } from "@/lib/db/client";

export type ReelOperationKind = "NARRATION" | "SHOT" | "ROUGH_CUT" | "NATIVE_REEL";
export type ReelOperationStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "BLOCKED";

export interface ReelOperation {
  id: string;
  productionId: string;
  kind: ReelOperationKind;
  targetId?: string;
  idempotencyKey: string;
  status: ReelOperationStatus;
  attempt: number;
  providerOperationName?: string;
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  lastError?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

const TABLE = `
CREATE TABLE IF NOT EXISTS reel_operations (
  id TEXT PRIMARY KEY,
  production_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  target_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  attempt INTEGER NOT NULL DEFAULT 0,
  provider_operation_name TEXT,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_json JSONB,
  last_error TEXT,
  lease_owner TEXT,
  lease_expires_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE reel_operations ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_reel_operations_status_created ON reel_operations(status, created_at);
CREATE INDEX IF NOT EXISTS idx_reel_operations_production ON reel_operations(production_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reel_operations_scheduled ON reel_operations(status, scheduled_at);
`;

function poolOrThrow() {
  const pool = getPostgresPool();
  if (!pool) throw new Error("Durable production operations require Postgres; SQLite/in-memory queues are not accepted for paid generation");
  return pool;
}

async function ensureTable() {
  const pool = poolOrThrow();
  await pool.query(TABLE);
  return pool;
}

function fromRow(row: any): ReelOperation {
  return {
    id: String(row.id),
    productionId: String(row.production_id),
    kind: row.kind as ReelOperationKind,
    targetId: row.target_id ? String(row.target_id) : undefined,
    idempotencyKey: String(row.idempotency_key),
    status: row.status as ReelOperationStatus,
    attempt: Number(row.attempt || 0),
    providerOperationName: row.provider_operation_name ? String(row.provider_operation_name) : undefined,
    payload: row.payload_json || {},
    result: row.result_json || undefined,
    lastError: row.last_error || undefined,
    scheduledAt: row.scheduled_at ? new Date(row.scheduled_at).toISOString() : undefined,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export function operationKey(input: {
  productionId: string;
  kind: ReelOperationKind;
  targetId?: string;
  manifestRevision: number;
  fingerprint: string;
  generationToken?: string;
}) {
  return [input.productionId, input.generationToken || "legacy", input.kind, input.targetId || "production", input.manifestRevision, input.fingerprint].join(":");
}

export const reelOperationQueue = {
  async enqueue(input: {
    productionId: string;
    kind: ReelOperationKind;
    targetId?: string;
    idempotencyKey: string;
    payload?: Record<string, unknown>;
  }): Promise<ReelOperation> {
    // Option A (Lean Omni-First + Veo Safety-Net): The legacy Studio1 Postgres
    // queue worker (reel_worker_v2.mjs) is retired. All live generation executes
    // through POST /api/swarm/jobs (Gemini Omni 1.1 Flash primary + Veo 3.1 safety-net).
    throw new Error(
      `STUDIO1_WORKER_PRUNED_OPTION_A: Queue enqueue rejected for ${input.productionId} (${input.kind}). Dispatch live synthesis via POST /api/swarm/jobs.`
    );
  },

  async get(id: string): Promise<ReelOperation | null> {
    const pool = getPostgresPool();
    if (!pool) return null;
    await pool.query(TABLE);
    const result = await pool.query(`SELECT * FROM reel_operations WHERE id=$1`, [id]);
    return result.rows[0] ? fromRow(result.rows[0]) : null;
  },

  async latestForProduction(productionId: string, limit = 25): Promise<ReelOperation[]> {
    const pool = getPostgresPool();
    if (!pool) return [];
    await pool.query(TABLE);
    const result = await pool.query(
      `SELECT * FROM reel_operations WHERE production_id=$1 ORDER BY created_at DESC LIMIT $2`,
      [productionId, Math.max(1, Math.min(100, Math.floor(limit)))]
    );
    return result.rows.map(fromRow);
  },

  async retry(id: string): Promise<ReelOperation | null> {
    throw new Error(
      `STUDIO1_WORKER_PRUNED_OPTION_A: Queue retry rejected for operation ${id}. Legacy Studio1 background worker is retired; dispatch live synthesis via POST /api/swarm/jobs.`
    );
  },
};
