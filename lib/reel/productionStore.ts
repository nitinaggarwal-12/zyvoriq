import { getDatabase, getPostgresPool } from "@/lib/db/client";
import { attachReelArtifactIndex } from "../artifact/identity";
import { enrichManifestV2 } from "./manifestV2";
import type { ReelProductionManifest } from "./types";

export interface StoredReelProduction {
  id: string;
  revision: number;
  manifest: ReelProductionManifest;
  createdAt: string;
  updatedAt: string;
}

const SQLITE_TABLE = `
CREATE TABLE IF NOT EXISTS reel_productions (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  manifest_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reel_productions_updated ON reel_productions(updated_at DESC);
`;

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

function fromSqlite(row: any): StoredReelProduction {
  return {
    id: String(row.id),
    revision: Number(row.revision),
    manifest: normalizeManifest(JSON.parse(String(row.manifest_json)) as ReelProductionManifest),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
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

async function ensurePostgresTable() {
  const pool = getPostgresPool();
  if (!pool) return null;
  await pool.query(POSTGRES_TABLE);
  return pool;
}

function ensureSqliteTable() {
  const database = getDatabase();
  database.exec(SQLITE_TABLE);
  return database;
}

export const reelProductionStore = {
  async create(manifest: ReelProductionManifest): Promise<StoredReelProduction> {
    const now = new Date().toISOString();
    const normalized = normalizeManifest(manifest);
    const pool = await ensurePostgresTable();
    if (pool) {
      const result = await pool.query(
        `INSERT INTO reel_productions (id, revision, manifest_json, created_at, updated_at)
         VALUES ($1, 1, $2::jsonb, $3, $3)
         ON CONFLICT (id) DO NOTHING
         RETURNING *`,
        [normalized.id, JSON.stringify(normalized), now]
      );
      if (!result.rows[0]) throw new Error(`Production ${normalized.id} already exists`);
      return fromPostgres(result.rows[0]);
    }

    const database = ensureSqliteTable();
    database.prepare(
      `INSERT INTO reel_productions (id, revision, manifest_json, created_at, updated_at)
       VALUES (?, 1, ?, ?, ?)`
    ).run(normalized.id, JSON.stringify(normalized), now, now);
    return { id: normalized.id, revision: 1, manifest: normalized, createdAt: now, updatedAt: now };
  },

  async get(id: string): Promise<StoredReelProduction | null> {
    const pool = await ensurePostgresTable();
    if (pool) {
      const result = await pool.query(`SELECT * FROM reel_productions WHERE id = $1`, [id]);
      return result.rows[0] ? fromPostgres(result.rows[0]) : null;
    }

    const database = ensureSqliteTable();
    const row = database.prepare(`SELECT * FROM reel_productions WHERE id = ?`).get(id) as any;
    return row ? fromSqlite(row) : null;
  },

  async list(limit = 25): Promise<StoredReelProduction[]> {
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const pool = await ensurePostgresTable();
    if (pool) {
      const result = await pool.query(`SELECT * FROM reel_productions ORDER BY updated_at DESC LIMIT $1`, [safeLimit]);
      return result.rows.map(fromPostgres);
    }

    const database = ensureSqliteTable();
    const rows = database.prepare(`SELECT * FROM reel_productions ORDER BY updated_at DESC LIMIT ?`).all(safeLimit) as any[];
    return rows.map(fromSqlite);
  },

  async replace(id: string, manifest: ReelProductionManifest, expectedRevision?: number): Promise<StoredReelProduction> {
    const current = await this.get(id);
    if (!current) throw new Error(`Production ${id} not found`);
    if (expectedRevision !== undefined && current.revision !== expectedRevision) throw new Error(`Production ${id} changed concurrently (expected revision ${expectedRevision}, found ${current.revision})`);

    const normalized = normalizeManifest(manifest);
    const nextRevision = current.revision + 1;
    const now = new Date().toISOString();
    const pool = await ensurePostgresTable();
    if (pool) {
      const result = await pool.query(
        `UPDATE reel_productions
         SET revision = $2, manifest_json = $3::jsonb, updated_at = $4
         WHERE id = $1 AND revision = $5
         RETURNING *`,
        [id, nextRevision, JSON.stringify(normalized), now, current.revision]
      );
      if (!result.rows[0]) throw new Error(`Production ${id} changed concurrently`);
      return fromPostgres(result.rows[0]);
    }

    const database = ensureSqliteTable();
    const result = database.prepare(`UPDATE reel_productions SET revision = ?, manifest_json = ?, updated_at = ? WHERE id = ? AND revision = ?`).run(nextRevision, JSON.stringify(normalized), now, id, current.revision);
    if (Number(result.changes) !== 1) throw new Error(`Production ${id} changed concurrently`);
    return { id, revision: nextRevision, manifest: normalized, createdAt: current.createdAt, updatedAt: now };
  },

  async delete(id: string, expectedRevision?: number): Promise<void> {
    const current = await this.get(id);
    if (!current) return; // Idempotent: already deleted
    if (expectedRevision !== undefined && current.revision !== expectedRevision) {
      throw new Error(`Production ${id} changed concurrently (expected revision ${expectedRevision}, found ${current.revision})`);
    }

    const pool = await ensurePostgresTable();
    if (pool) {
      try { await pool.query(`DELETE FROM reel_operations WHERE production_id = $1`, [id]); } catch {}
      try { await pool.query(`DELETE FROM reel_production_controls WHERE production_id = $1`, [id]); } catch {}
      if (expectedRevision !== undefined) {
        const result = await pool.query(`DELETE FROM reel_productions WHERE id = $1 AND revision = $2`, [id, expectedRevision]);
        if (Number(result.rowCount) !== 1) throw new Error(`Production ${id} changed concurrently`);
      } else {
        await pool.query(`DELETE FROM reel_productions WHERE id = $1`, [id]);
      }
      return;
    }

    const database = ensureSqliteTable();
    try { database.prepare(`DELETE FROM reel_operations WHERE production_id = ?`).run(id); } catch {}
    try { database.prepare(`DELETE FROM reel_production_controls WHERE production_id = ?`).run(id); } catch {}
    if (expectedRevision !== undefined) {
      const result = database.prepare(`DELETE FROM reel_productions WHERE id = ? AND revision = ?`).run(id, expectedRevision);
      if (Number(result.changes) !== 1) throw new Error(`Production ${id} changed concurrently`);
    } else {
      database.prepare(`DELETE FROM reel_productions WHERE id = ?`).run(id);
    }
  },
};