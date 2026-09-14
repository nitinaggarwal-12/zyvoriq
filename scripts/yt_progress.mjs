#!/usr/bin/env node
/**
 * Stage-progress reporter for scripts/yt_pipeline.mjs.
 *
 * Without this, app/api/yt/productions registers 7 PENDING stages that nothing
 * ever advances, so the UI's progress grid would display PENDING forever while
 * the pipeline was actually running, failing, or finished. A progress grid that
 * cannot show failure is the same class of defect as an audit that cannot fail.
 *
 * Dual-engine on purpose: Postgres when DATABASE_URL is set (Railway), otherwise
 * the same dev.db SQLite file lib/db/client.ts opens, so local runs are visible too.
 */
import path from "node:path";

const NOOP = {
  engine: "none",
  enabled: false,
  async loadSpec() { return null; },
  async start() {},
  async finish() {},
  async failCurrent() {},
  async setProduction() {},
  async close() {},
};

export async function createProgress(productionId, { log = () => {} } = {}) {
  if (!productionId) return NOOP;

  const dsn = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_PRIVATE_URL;

  if (dsn) {
    const { default: pg } = await import("pg");
    const pool = new pg.Pool({
      connectionString: dsn,
      ssl: /\brailway\b|proxy\.rlwy\.net/.test(dsn) ? { rejectUnauthorized: false } : undefined,
      max: 2,
    });
    const q = (text, params) => pool.query(text, params);
    log(`  [progress] postgres reporting for ${productionId}`);
    return {
      engine: "postgres",
      enabled: true,
      async loadSpec() {
        const r = await q(`SELECT topic, genre, duration_sec FROM yt_productions WHERE id=$1`, [productionId]);
        if (!r.rows.length) return null;
        const row = r.rows[0];
        return { topic: row.topic, genre: row.genre, durationSec: Number(row.duration_sec) };
      },
      async start(stage) {
        await q(`UPDATE yt_production_stages SET status='RUNNING', started_at=$3, finished_at=NULL, error=NULL
                 WHERE production_id=$1 AND stage=$2`, [productionId, stage, new Date().toISOString()]);
      },
      async finish(stage, status = "SUCCEEDED", durationMs = null, error = null) {
        await q(`UPDATE yt_production_stages SET status=$3, finished_at=$4, duration_ms=$5, error=$6
                 WHERE production_id=$1 AND stage=$2`,
          [productionId, stage, status, new Date().toISOString(), durationMs, error]);
      },
      async failCurrent(stage, message) {
        await q(`UPDATE yt_production_stages SET status='FAILED', finished_at=$3, error=$4
                 WHERE production_id=$1 AND stage=$2`, [productionId, stage, new Date().toISOString(), message]);
      },
      async setProduction(status, error = null, { manifest = null, renders = null } = {}) {
        if (manifest !== null || renders !== null) {
          await q(
            `UPDATE yt_productions SET status=$2, auto_start_error=COALESCE($3, auto_start_error), manifest_json=COALESCE($4, manifest_json), renders_json=COALESCE($5, renders_json), updated_at=NOW() WHERE id=$1`,
            [productionId, status, error, manifest ? JSON.stringify(manifest) : null, renders ? JSON.stringify(renders) : null]
          );
        } else {
          await q(`UPDATE yt_productions SET status=$2, auto_start_error=COALESCE($3, auto_start_error), updated_at=NOW() WHERE id=$1`,
            [productionId, status, error]);
        }
      },
      async close() { await pool.end().catch(() => {}); },
    };
  }

  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync(path.resolve(process.cwd(), "dev.db"));
  db.exec("PRAGMA foreign_keys = ON;");
  log(`  [progress] sqlite reporting for ${productionId}`);
  const run = (sql, ...args) => db.prepare(sql).run(...args);
  return {
    engine: "sqlite",
    enabled: true,
    async loadSpec() {
      const row = db.prepare(`SELECT topic, genre, duration_sec FROM yt_productions WHERE id=?`).get(productionId);
      if (!row) return null;
      return { topic: row.topic, genre: row.genre, durationSec: Number(row.duration_sec) };
    },
    async start(stage) {
      run(`UPDATE yt_production_stages SET status='RUNNING', started_at=?, finished_at=NULL, error=NULL
           WHERE production_id=? AND stage=?`, new Date().toISOString(), productionId, stage);
    },
    async finish(stage, status = "SUCCEEDED", durationMs = null, error = null) {
      run(`UPDATE yt_production_stages SET status=?, finished_at=?, duration_ms=?, error=?
           WHERE production_id=? AND stage=?`,
        status, new Date().toISOString(), durationMs, error, productionId, stage);
    },
    async failCurrent(stage, message) {
      run(`UPDATE yt_production_stages SET status='FAILED', finished_at=?, error=?
           WHERE production_id=? AND stage=?`, new Date().toISOString(), message, productionId, stage);
    },
    async setProduction(status, error = null, { manifest = null, renders = null } = {}) {
      if (manifest !== null || renders !== null) {
        run(`UPDATE yt_productions SET status=?, auto_start_error=COALESCE(?, auto_start_error), manifest_json=COALESCE(?, manifest_json), renders_json=COALESCE(?, renders_json), updated_at=datetime('now') WHERE id=?`,
          status, error, manifest ? JSON.stringify(manifest) : null, renders ? JSON.stringify(renders) : null, productionId);
      } else {
        run(`UPDATE yt_productions SET status=?, auto_start_error=COALESCE(?, auto_start_error), updated_at=datetime('now') WHERE id=?`,
          status, error, productionId);
      }
    },
    async close() { try { db.close(); } catch {} },
  };
}
