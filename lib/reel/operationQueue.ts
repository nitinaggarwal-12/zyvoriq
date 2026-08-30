import crypto from "node:crypto";
import { getPostgresPool } from "@/lib/db/client";

export type ReelOperationKind = "NARRATION" | "SHOT" | "ROUGH_CUT";
export type ReelOperationStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reel_operations_status_created ON reel_operations(status, created_at);
CREATE INDEX IF NOT EXISTS idx_reel_operations_production ON reel_operations(production_id, created_at DESC);
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
    const pool = await ensureTable();
    const id = `rop_${crypto.randomUUID()}`;
    const result = await pool.query(
      `INSERT INTO reel_operations (id, production_id, kind, target_id, idempotency_key, payload_json)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb)
       ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = reel_operations.updated_at
       RETURNING *`,
      [id, input.productionId, input.kind, input.targetId || null, input.idempotencyKey, JSON.stringify(input.payload || {})]
    );
    return fromRow(result.rows[0]);
  },

  async get(id: string): Promise<ReelOperation | null> {
    const pool = await ensureTable();
    const result = await pool.query(`SELECT * FROM reel_operations WHERE id=$1`, [id]);
    return result.rows[0] ? fromRow(result.rows[0]) : null;
  },

  async latestForProduction(productionId: string, limit = 25): Promise<ReelOperation[]> {
    const pool = await ensureTable();
    const result = await pool.query(
      `SELECT * FROM reel_operations WHERE production_id=$1 ORDER BY created_at DESC LIMIT $2`,
      [productionId, Math.max(1, Math.min(100, Math.floor(limit)))]
    );
    return result.rows.map(fromRow);
  },
};
