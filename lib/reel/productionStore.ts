import { getPostgresPool } from "@/lib/db/client";
import { attachReelArtifactIndex } from "../artifact/identity";
import { deleteProductionAssets } from "./assetStore";
import { enrichManifestV2 } from "./manifestV2";
import type { ReelProductionManifest } from "./types";

export interface StoredReelProduction {
  id: string;
  revision: number;
  manifest: ReelProductionManifest;
  starred?: boolean;
  createdAt: string;
  updatedAt: string;
}

const POSTGRES_TABLE = `
CREATE TABLE IF NOT EXISTS reel_productions (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  manifest_json JSONB NOT NULL,
  starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE reel_productions ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_reel_productions_updated ON reel_productions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reel_productions_starred ON reel_productions(starred);
`;

function normalizeManifest(manifest: ReelProductionManifest) {
  return attachReelArtifactIndex(enrichManifestV2(manifest));
}

function fromPostgres(row: any): StoredReelProduction {
  const isStarred = Boolean(row.starred === true || row.manifest_json?.starred === true);
  const manifest = normalizeManifest(row.manifest_json as ReelProductionManifest);
  manifest.starred = isStarred;
  return {
    id: String(row.id),
    revision: Number(row.revision),
    manifest,
    starred: isStarred,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

// Postgres is the single source of truth. There is deliberately no local
// fallback: the web service and the reel worker run in separate containers on
// separate volumes, so a container-local store silently diverges instead of
// failing. Reels deleted from the UI reappearing was caused by exactly that.
// If Postgres is unreachable, fail loudly.
async function ensurePostgresTable() {
  const pool = getPostgresPool();
  if (!pool) {
    throw new Error(
      "Postgres is unavailable (DATABASE_URL missing or unreachable). " +
      "reel_productions has no local fallback by design."
    );
  }
  await pool.query(POSTGRES_TABLE);
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

  async setStarred(id: string, starred: boolean): Promise<StoredReelProduction> {
    const current = await this.get(id);
    if (!current) throw new Error(`Production ${id} not found`);
    const nextRevision = current.revision + 1;
    const now = new Date().toISOString();
    const manifest: ReelProductionManifest = {
      ...current.manifest,
      starred,
    };
    const pool = await ensurePostgresTable();
    const result = await pool.query(
      `UPDATE reel_productions
       SET revision = $2, starred = $3, manifest_json = $4::jsonb, updated_at = $5
       WHERE id = $1
       RETURNING *`,
      [id, nextRevision, starred, JSON.stringify(manifest), now]
    );
    if (!result.rows[0]) throw new Error(`Production ${id} not found`);
    return fromPostgres(result.rows[0]);
  },

  async delete(id: string, expectedRevision?: number): Promise<void> {
    const current = await this.get(id);
    if (!current) return; // Idempotent: already deleted
    if (expectedRevision !== undefined && current.revision !== expectedRevision) {
      throw new Error(`Production ${id} changed concurrently (expected revision ${expectedRevision}, found ${current.revision})`);
    }

    const pool = await ensurePostgresTable();
    await pool.query(`DELETE FROM reel_operations WHERE production_id = $1`, [id]);
    await pool.query(`DELETE FROM reel_production_controls WHERE production_id = $1`, [id]);
    if (expectedRevision !== undefined) {
      const result = await pool.query(`DELETE FROM reel_productions WHERE id = $1 AND revision = $2`, [id, expectedRevision]);
      if (Number(result.rowCount) !== 1) throw new Error(`Production ${id} changed concurrently`);
    } else {
      await pool.query(`DELETE FROM reel_productions WHERE id = $1`, [id]);
    }
    try { await deleteProductionAssets(id); } catch {}
  },
};