import { ensurePostgresSchema, getDatabase, getPostgresPool, safeJsonParse, withRetry } from "@/lib/db/client";
import { deleteProductionAssets } from "./assetStore";
import { collectValidStoredProductions, normalizePersistedReelManifest } from "./manifestCompatibility";
import type { ReelProductionManifest } from "./types";

export class RevisionConflictError extends Error {
  readonly code = "REVISION_CONFLICT" as const;
  readonly status = 409 as const;
  readonly productionId: string;
  readonly expectedRevision?: number;
  readonly actualRevision?: number;

  constructor(productionId: string, expectedRevision?: number, actualRevision?: number) {
    super(
      expectedRevision !== undefined && actualRevision !== undefined
        ? `Production ${productionId} changed concurrently (expected revision ${expectedRevision}, found ${actualRevision})`
        : `Production ${productionId} changed concurrently`
    );
    this.name = "RevisionConflictError";
    this.productionId = productionId;
    this.expectedRevision = expectedRevision;
    this.actualRevision = actualRevision;
  }
}

export interface StoredReelProduction {
  id: string;
  revision: number;
  manifest: ReelProductionManifest;
  starred?: boolean;
  createdAt: string;
  updatedAt: string;
}

const POSTGRES_TABLE_INIT = `
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

const SQLITE_TABLE = `
CREATE TABLE IF NOT EXISTS reel_productions (
  id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  manifest_json TEXT NOT NULL,
  starred INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reel_productions_updated ON reel_productions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reel_productions_starred ON reel_productions(starred);
`;

let sqliteTableInitialized = false;
let pgTableInitPromise: Promise<void> | null = null;

function ensureSqliteDb() {
  const database = getDatabase();
  if (!sqliteTableInitialized) {
    withRetry(() => {
      database.exec(SQLITE_TABLE);
    });
    sqliteTableInitialized = true;
  }
  return database;
}

function normalizeManifest(manifest: unknown, fallbackId?: string) {
  return normalizePersistedReelManifest(manifest, fallbackId);
}

function fromRow(row: any): StoredReelProduction {
  const parsedJson =
    typeof row.manifest_json === "string"
      ? safeJsonParse<Record<string, unknown>>(row.manifest_json, {})
      : row.manifest_json;
  const hasExplicitColumn = row.starred !== undefined && row.starred !== null;
  const isStarred = hasExplicitColumn
    ? Boolean(row.starred === true || row.starred === 1)
    : Boolean(parsedJson?.starred === true);
  const manifest = normalizeManifest(parsedJson, String(row.id || ""));
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

// Under Option A (Lean Omni-First + Veo 3.1 Safety-Net), the separate Studio1
// reel_worker container is retired and all runtime operations execute inside the
// unified Next.js service. When DATABASE_URL is configured, PostgreSQL serves as
// the primary store; otherwise SQLite WAL (getDatabase() + withRetry()) provides
// zero-config durable persistence with identical optimistic revision CAS semantics.
async function getOptionalPostgresTable() {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  if (!pool) return null;
  if (!pgTableInitPromise) {
    pgTableInitPromise = pool.query(POSTGRES_TABLE_INIT).then(() => undefined).catch((err) => {
      pgTableInitPromise = null;
      throw err;
    });
  }
  await pgTableInitPromise;
  return pool;
}

export const reelProductionStore = {
  async create(manifest: ReelProductionManifest): Promise<StoredReelProduction> {
    const now = new Date().toISOString();
    const normalized = normalizeManifest(manifest);
    const isStarred = Boolean(normalized.starred);
    const pool = await getOptionalPostgresTable();
    if (pool) {
      const result = await pool.query(
        `INSERT INTO reel_productions (id, revision, manifest_json, starred, created_at, updated_at)
         VALUES ($1, 1, $2::jsonb, $3, $4, $4)
         ON CONFLICT (id) DO NOTHING
         RETURNING *`,
        [normalized.id, JSON.stringify(normalized), isStarred, now]
      );
      if (!result.rows[0]) throw new Error(`Production ${normalized.id} already exists`);
      return fromRow(result.rows[0]);
    }

    const database = ensureSqliteDb();
    return withRetry(() => {
      const existing = database
        .prepare(`SELECT id FROM reel_productions WHERE id = ?`)
        .get(normalized.id);
      if (existing) throw new Error(`Production ${normalized.id} already exists`);
      database
        .prepare(
          `INSERT INTO reel_productions (id, revision, manifest_json, starred, created_at, updated_at)
           VALUES (?, 1, ?, ?, ?, ?)`
        )
        .run(normalized.id, JSON.stringify(normalized), isStarred ? 1 : 0, now, now);
      const row = database
        .prepare(`SELECT * FROM reel_productions WHERE id = ?`)
        .get(normalized.id);
      return fromRow(row);
    });
  },

  async get(id: string): Promise<StoredReelProduction | null> {
    const pool = await getOptionalPostgresTable();
    if (pool) {
      let result = await pool.query(`SELECT * FROM reel_productions WHERE id = $1`, [id]);
      if (!result.rows[0]) {
        result = await pool.query(
          `SELECT * FROM reel_productions WHERE id LIKE $1 || '%' OR id LIKE '%' || $1 || '%' ORDER BY created_at DESC LIMIT 1`,
          [id]
        );
      }
      return result.rows[0] ? fromRow(result.rows[0]) : null;
    }

    const database = ensureSqliteDb();
    return withRetry(() => {
      let row = database.prepare(`SELECT * FROM reel_productions WHERE id = ?`).get(id);
      if (!row) {
        row = database
          .prepare(
            `SELECT * FROM reel_productions WHERE id LIKE ? OR id LIKE ? ORDER BY created_at DESC LIMIT 1`
          )
          .get(`${id}%`, `%${id}%`);
      }
      return row ? fromRow(row) : null;
    });
  },

  async list(limit = 25): Promise<StoredReelProduction[]> {
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const pool = await getOptionalPostgresTable();
    const rows = pool
      ? (await pool.query(`SELECT * FROM reel_productions ORDER BY updated_at DESC LIMIT $1`, [safeLimit])).rows
      : withRetry(() => {
          const database = ensureSqliteDb();
          return database
            .prepare(`SELECT * FROM reel_productions ORDER BY updated_at DESC LIMIT ?`)
            .all(safeLimit) as any[];
        });

    return collectValidStoredProductions(
      rows,
      fromRow,
      (row, error) =>
        console.error("[reel-production-store] Skipping invalid persisted production", {
          productionId: String(row?.id || "unknown"),
          error: error instanceof Error ? error.message : String(error),
        })
    );
  },

  async replace(id: string, manifest: ReelProductionManifest, expectedRevision?: number): Promise<StoredReelProduction> {
    const current = await this.get(id);
    if (!current) throw new Error(`Production ${id} not found`);
    if (expectedRevision !== undefined && current.revision !== expectedRevision) {
      throw new RevisionConflictError(current.id, expectedRevision, current.revision);
    }

    const normalized = normalizeManifest(manifest, current.id);
    const nextStarred = normalized.starred !== undefined ? Boolean(normalized.starred) : Boolean(current.starred);
    normalized.starred = nextStarred;
    const casRevision = expectedRevision ?? current.revision;
    const nextRevision = casRevision + 1;
    const now = new Date().toISOString();
    const pool = await getOptionalPostgresTable();
    if (pool) {
      const result = await pool.query(
        `UPDATE reel_productions
         SET revision = $2, starred = $3, manifest_json = $4::jsonb, updated_at = $5
         WHERE id = $1 AND revision = $6
         RETURNING *`,
        [current.id, nextRevision, nextStarred, JSON.stringify(normalized), now, casRevision]
      );
      if (!result.rows[0]) throw new RevisionConflictError(current.id, casRevision);
      return fromRow(result.rows[0]);
    }

    const database = ensureSqliteDb();
    return withRetry(() => {
      const res = database
        .prepare(
          `UPDATE reel_productions
           SET revision = ?, starred = ?, manifest_json = ?, updated_at = ?
           WHERE id = ? AND revision = ?`
        )
        .run(nextRevision, nextStarred ? 1 : 0, JSON.stringify(normalized), now, current.id, casRevision);
      if (!res || Number(res.changes) !== 1) {
        throw new RevisionConflictError(current.id, casRevision);
      }
      const row = database.prepare(`SELECT * FROM reel_productions WHERE id = ?`).get(current.id);
      return fromRow(row);
    });
  },

  async setStarred(id: string, starred: boolean, expectedRevision?: number): Promise<StoredReelProduction> {
    const current = await this.get(id);
    if (!current) throw new Error(`Production ${id} not found`);
    if (expectedRevision !== undefined && current.revision !== expectedRevision) {
      throw new RevisionConflictError(current.id, expectedRevision, current.revision);
    }
    const casRevision = expectedRevision ?? current.revision;
    const nextRevision = casRevision + 1;
    const now = new Date().toISOString();
    const manifest: ReelProductionManifest = {
      ...current.manifest,
      starred,
    };
    const pool = await getOptionalPostgresTable();
    if (pool) {
      const result = await pool.query(
        `UPDATE reel_productions
         SET revision = $2, starred = $3, manifest_json = $4::jsonb, updated_at = $5
         WHERE id = $1 AND revision = $6
         RETURNING *`,
        [current.id, nextRevision, starred, JSON.stringify(manifest), now, casRevision]
      );
      if (!result.rows[0]) throw new RevisionConflictError(current.id, casRevision);
      return fromRow(result.rows[0]);
    }

    const database = ensureSqliteDb();
    return withRetry(() => {
      const res = database
        .prepare(
          `UPDATE reel_productions
           SET revision = ?, starred = ?, manifest_json = ?, updated_at = ?
           WHERE id = ? AND revision = ?`
        )
        .run(nextRevision, starred ? 1 : 0, JSON.stringify(manifest), now, current.id, casRevision);
      if (!res || Number(res.changes) !== 1) {
        throw new RevisionConflictError(current.id, casRevision);
      }
      const row = database.prepare(`SELECT * FROM reel_productions WHERE id = ?`).get(current.id);
      return fromRow(row);
    });
  },

  async delete(id: string, expectedRevision?: number): Promise<void> {
    const current = await this.get(id);
    if (!current) return; // Idempotent: already deleted
    if (expectedRevision !== undefined && current.revision !== expectedRevision) {
      throw new RevisionConflictError(current.id, expectedRevision, current.revision);
    }

    const pool = await getOptionalPostgresTable();
    if (pool) {
      if (expectedRevision !== undefined) {
        const result = await pool.query(`DELETE FROM reel_productions WHERE id = $1 AND revision = $2`, [current.id, expectedRevision]);
        if (Number(result.rowCount) !== 1) throw new RevisionConflictError(current.id, expectedRevision);
      } else {
        await pool.query(`DELETE FROM reel_productions WHERE id = $1`, [current.id]);
      }
      try { await pool.query(`DELETE FROM reel_operations WHERE production_id = $1`, [current.id]); } catch {}
      try { await pool.query(`DELETE FROM reel_production_controls WHERE production_id = $1`, [current.id]); } catch {}
    } else {
      const database = ensureSqliteDb();
      withRetry(() => {
        if (expectedRevision !== undefined) {
          const res = database
            .prepare(`DELETE FROM reel_productions WHERE id = ? AND revision = ?`)
            .run(current.id, expectedRevision);
          if (!res || Number(res.changes) !== 1) {
            throw new RevisionConflictError(current.id, expectedRevision);
          }
        } else {
          database.prepare(`DELETE FROM reel_productions WHERE id = ?`).run(current.id);
        }
        try {
          database.prepare(`DELETE FROM reel_production_controls WHERE production_id = ?`).run(current.id);
        } catch {}
      });
    }
    try { await deleteProductionAssets(current.id); } catch {}
  },
};
