import { getDatabase, getPostgresPool } from "@/lib/db/client";
import type { Pool } from "pg";
import { attachReelArtifactIndex } from "../artifact/identity";
import { deleteProductionAssets } from "./assetStore";
import { enrichManifestV2 } from "./manifestV2";
import type { ReelProductionManifest } from "./types";

export interface StoredReelProduction {
  id: string;
  revision: number;
  manifest: ReelProductionManifest;
  createdAt: string;
  updatedAt: string;
}

const POSTGRES_TABLE = `
CREATE TABLE IF NOT EXISTS reel_productions (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  manifest_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reel_productions_updated ON reel_productions(updated_at DESC);
`;

function normalizeManifest(manifest: ReelProductionManifest) {
  return attachReelArtifactIndex(enrichManifestV2(manifest));
}

function fromPostgres(row: any): StoredReelProduction {
  return {
    id: String(row.id),
    revision: Number(row.revision),
    manifest: normalizeManifest(row.manifest_json as ReelProductionManifest),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function poolOrThrow(): Pool {
  const pool = getPostgresPool();
  if (!pool) {
    console.error("[production-store] FATAL: Postgres pool unavailable; refusing silent SQLite split-brain fallback");
    throw new Error("Durable production store requires Postgres; SQLite fallback is disabled to prevent multi-container split-brain");
  }
  return pool;
}

let pgTableEnsured = false;
async function ensurePostgresTable(): Promise<Pool> {
  const pool = poolOrThrow();
  if (!pgTableEnsured) {
    await pool.query(POSTGRES_TABLE);
    pgTableEnsured = true;
  }
  return pool;
}

export const reelProductionStore = {
  async create(manifest: ReelProductionManifest): Promise<StoredReelProduction> {
    const now = new Date().toISOString();
    const normalized = normalizeManifest(manifest);
    const pool = await ensurePostgresTable();
    const result = await pool.query(
      `INSERT INTO reel_productions (id, revision, manifest_json, created_at, updated_at)
       VALUES ($1, 1, $2::jsonb, $3, $3)
       ON CONFLICT (id) DO NOTHING
       RETURNING *`,
      [normalized.id, JSON.stringify(normalized), now]
    );
    if (!result.rows[0]) throw new Error(`Production ${normalized.id} already exists`);
    return fromPostgres(result.rows[0]);
  },

  async get(id: string): Promise<StoredReelProduction | null> {
    const pool = await ensurePostgresTable();
    const result = await pool.query(`SELECT * FROM reel_productions WHERE id = $1`, [id]);
    return result.rows[0] ? fromPostgres(result.rows[0]) : null;
  },

  async list(limit = 25): Promise<StoredReelProduction[]> {
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const pool = await ensurePostgresTable();
    const result = await pool.query(`SELECT * FROM reel_productions ORDER BY updated_at DESC LIMIT $1`, [safeLimit]);
    return result.rows.map(fromPostgres);
  },

  async replace(id: string, manifest: ReelProductionManifest, expectedRevision?: number): Promise<StoredReelProduction> {
    const current = await this.get(id);
    if (!current) throw new Error(`Production ${id} not found`);
    if (expectedRevision !== undefined && current.revision !== expectedRevision) {
      throw new Error(`Production ${id} changed concurrently (expected revision ${expectedRevision}, found ${current.revision})`);
    }

    const normalized = normalizeManifest(manifest);
    const nextRevision = current.revision + 1;
    const now = new Date().toISOString();
    const pool = await ensurePostgresTable();
    const result = await pool.query(
      `UPDATE reel_productions
       SET revision = $2, manifest_json = $3::jsonb, updated_at = $4
       WHERE id = $1 AND revision = $5
       RETURNING *`,
      [id, nextRevision, JSON.stringify(normalized), now, current.revision]
    );
    if (!result.rows[0]) throw new Error(`Production ${id} changed concurrently`);
    return fromPostgres(result.rows[0]);
  },

  async delete(id: string, expectedRevision?: number): Promise<void> {
    const pool = await ensurePostgresTable();
    const current = await this.get(id);
    if (!current) {
      // Idempotent: already deleted from Postgres.
      // Clean up any lingering SQLite ghost copies and disk assets
      try {
        const db = getDatabase();
        db.prepare(`DELETE FROM reel_operations WHERE production_id = ?`).run(id);
        db.prepare(`DELETE FROM reel_production_controls WHERE production_id = ?`).run(id);
        db.prepare(`DELETE FROM reel_productions WHERE id = ?`).run(id);
      } catch {}
      try { await deleteProductionAssets(id); } catch {}
      return;
    }
    if (expectedRevision !== undefined && current.revision !== expectedRevision) {
      throw new Error(`Production ${id} changed concurrently (expected revision ${expectedRevision}, found ${current.revision})`);
    }

    try { await pool.query(`DELETE FROM reel_operations WHERE production_id = $1`, [id]); } catch {}
    try { await pool.query(`DELETE FROM reel_production_controls WHERE production_id = $1`, [id]); } catch {}
    if (expectedRevision !== undefined) {
      const result = await pool.query(`DELETE FROM reel_productions WHERE id = $1 AND revision = $2`, [id, expectedRevision]);
      if (Number(result.rowCount) !== 1) throw new Error(`Production ${id} changed concurrently`);
    } else {
      await pool.query(`DELETE FROM reel_productions WHERE id = $1`, [id]);
    }

    // Clean up local SQLite ghost copies if present
    try {
      const db = getDatabase();
      db.prepare(`DELETE FROM reel_operations WHERE production_id = ?`).run(id);
      db.prepare(`DELETE FROM reel_production_controls WHERE production_id = ?`).run(id);
      db.prepare(`DELETE FROM reel_productions WHERE id = ?`).run(id);
    } catch {}

    // Clean up physical disk assets
    try {
      await deleteProductionAssets(id);
    } catch (err) {
      console.warn(`[production-store] Warning: failed to purge disk assets for ${id}:`, err);
    }
  },
};