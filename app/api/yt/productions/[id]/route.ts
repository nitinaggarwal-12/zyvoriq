import crypto from "node:crypto";
import path from "node:path";
import { spawn } from "node:child_process";
import { NextRequest, NextResponse } from "next/server";
import { getDatabase, getPostgresPool } from "@/lib/db/client";
import { YT_STAGES, YT_STAGE_EXECUTOR, type YtStage } from "@/lib/yt/contract";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = { "Cache-Control": "no-store" } as const;

/** Full detail server-side, short reference to the client. Never the raw message. */
function logAndSummarize(scope: string, err: unknown, clientMessage: string) {
  const ref = crypto.randomUUID().slice(0, 8);
  console.error(`[api/yt/productions/[id]] ${scope} failed (ref=${ref}):`, err);
  return { ref, message: clientMessage, summary: `${clientMessage} (ref ${ref})` };
}

/* ------------------------------------------------------------------ *
 * Dual-engine read path. Tables are created defensively here too, so a
 * GET issued before any POST returns 404 instead of "no such table".
 * SQLite rejects ALTER TABLE ... ADD COLUMN IF NOT EXISTS outright, so
 * additive columns go through a PRAGMA table_info probe; Postgres uses
 * its native IF NOT EXISTS.
 * ------------------------------------------------------------------ */

const PG_SCHEMA = `
CREATE TABLE IF NOT EXISTS yt_productions (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  genre TEXT NOT NULL,
  duration_sec DOUBLE PRECISION NOT NULL,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  auto_started BOOLEAN NOT NULL DEFAULT FALSE,
  auto_start_error TEXT,
  manifest_json TEXT NOT NULL DEFAULT '{}',
  renders_json TEXT NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS yt_production_stages (
  production_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  seq INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  model TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT,
  duration_ms INTEGER,
  error TEXT,
  PRIMARY KEY (production_id, stage)
);
ALTER TABLE yt_productions ADD COLUMN IF NOT EXISTS auto_start_error TEXT;
ALTER TABLE yt_productions ADD COLUMN IF NOT EXISTS auto_started BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE yt_productions ADD COLUMN IF NOT EXISTS manifest_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE yt_productions ADD COLUMN IF NOT EXISTS renders_json TEXT NOT NULL DEFAULT '[]';
`;

const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS yt_productions (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  genre TEXT NOT NULL,
  duration_sec REAL NOT NULL,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  auto_started INTEGER NOT NULL DEFAULT 0,
  auto_start_error TEXT,
  manifest_json TEXT NOT NULL DEFAULT '{}',
  renders_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS yt_production_stages (
  production_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  seq INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  model TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT,
  duration_ms INTEGER,
  error TEXT,
  PRIMARY KEY (production_id, stage)
);
`;

function sqliteEnsureColumn(table: string, column: string, ddl: string) {
  const database = getDatabase();
  const cols = database.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name?: unknown }>;
  if (!cols.some((c) => String(c.name) === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl};`);
  }
}

let schemaReady: Promise<"postgres" | "sqlite"> | null = null;

async function ensureSchema(): Promise<"postgres" | "sqlite"> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const pool = getPostgresPool();
      if (pool) {
        await pool.query(PG_SCHEMA);
        return "postgres" as const;
      }
      const database = getDatabase();
      database.exec(SQLITE_SCHEMA);
      sqliteEnsureColumn("yt_productions", "auto_start_error", "TEXT");
      sqliteEnsureColumn("yt_productions", "auto_started", "INTEGER NOT NULL DEFAULT 0");
      sqliteEnsureColumn("yt_productions", "manifest_json", "TEXT NOT NULL DEFAULT '{}'");
      sqliteEnsureColumn("yt_productions", "renders_json", "TEXT NOT NULL DEFAULT '[]'");
      return "sqlite" as const;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return value as T;
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toIso(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

interface StageView {
  stage: YtStage;
  seq: number;
  status: string;
  /** Honest attribution: ffmpeg stages say "no model" - see YT_STAGE_EXECUTOR. */
  model: string;
  startedAt: string | null;
  durationMs: number | null;
  error: string | null;
}

/**
 * Merge persisted rows onto the canonical 7-stage grid. Stages the
 * worker has not touched yet are reported PENDING rather than omitted,
 * and the executor table is the fallback for `model` so the UI can never
 * render a blank or invented attribution.
 */
function buildStages(rows: any[]): StageView[] {
  const byStage = new Map<string, any>();
  for (const row of rows) byStage.set(String(row.stage), row);

  return YT_STAGES.map((stage, index) => {
    const row = byStage.get(stage);
    const rawDuration = row?.duration_ms;
    const durationMs =
      rawDuration === null || rawDuration === undefined || rawDuration === "" ? null : Number(rawDuration);
    return {
      stage,
      seq: index,
      status: row?.status ? String(row.status) : "PENDING",
      model: row?.model ? String(row.model) : YT_STAGE_EXECUTOR[stage],
      startedAt: toIso(row?.started_at),
      durationMs: durationMs === null || Number.isNaN(durationMs) ? null : durationMs,
      error: row?.error ? String(row.error) : null,
    };
  });
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params;
    const id = String(rawId || "").trim();
    if (!id || id.length > 128) {
      return NextResponse.json({ success: false, error: "A valid production id is required" }, { status: 400, headers: NO_STORE });
    }

    const engine = await ensureSchema();

    let productionRow: any;
    let stageRows: any[];

    if (engine === "postgres") {
      const pool = getPostgresPool()!;
      const found = await pool.query(`SELECT * FROM yt_productions WHERE id = $1`, [id]);
      productionRow = found.rows[0];
      if (!productionRow) {
        return NextResponse.json({ success: false, error: "YT production not found" }, { status: 404, headers: NO_STORE });
      }
      const stages = await pool.query(`SELECT * FROM yt_production_stages WHERE production_id = $1 ORDER BY seq ASC`, [id]);
      stageRows = stages.rows;
    } else {
      const database = getDatabase();
      productionRow = database.prepare(`SELECT * FROM yt_productions WHERE id = ?`).get(id) as any;
      if (!productionRow) {
        return NextResponse.json({ success: false, error: "YT production not found" }, { status: 404, headers: NO_STORE });
      }
      stageRows = database
        .prepare(`SELECT * FROM yt_production_stages WHERE production_id = ? ORDER BY seq ASC`)
        .all(id) as any[];
    }

    const stages = buildStages(stageRows);
    const manifest = parseJson<Record<string, unknown>>(productionRow.manifest_json, {});
    const renders = parseJson<unknown[]>(productionRow.renders_json, []);

    return NextResponse.json(
      {
        success: true,
        production: {
          id: String(productionRow.id),
          topic: String(productionRow.topic),
          genre: String(productionRow.genre),
          durationSec: Number(productionRow.duration_sec),
          platform: String(productionRow.platform),
          status: String(productionRow.status),
          // Surfaced on every poll: an auto-start failure recorded by POST
          // stays visible even if the client dropped the POST response.
          autoStarted: Boolean(productionRow.auto_started),
          autoStartError: productionRow.auto_start_error ? String(productionRow.auto_start_error) : null,
          createdAt: toIso(productionRow.created_at),
          updatedAt: toIso(productionRow.updated_at),
          stages,
          renders: Array.isArray(renders) ? renders : [],
          manifest,
        },
      },
      { headers: NO_STORE }
    );
  } catch (err) {
    const safe = logAndSummarize("get", err, "Could not load the YT production.");
    return NextResponse.json({ success: false, error: safe.summary, errorRef: safe.ref }, { status: 500, headers: NO_STORE });
  }
}

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params;
    const id = String(rawId || "").trim();
    if (!id || id.length > 128) {
      return NextResponse.json({ success: false, error: "A valid production id is required" }, { status: 400, headers: NO_STORE });
    }

    const engine = await ensureSchema();
    if (engine === "postgres") {
      const pool = getPostgresPool()!;
      await pool.query(
        `UPDATE yt_productions SET status = 'RUNNING', auto_start_error = NULL, updated_at = NOW() WHERE id = $1`,
        [id]
      );
      await pool.query(
        `UPDATE yt_production_stages SET status = 'PENDING', error = NULL WHERE production_id = $1 AND status = 'FAILED'`,
        [id]
      );
    } else {
      const database = getDatabase();
      database
        .prepare(`UPDATE yt_productions SET status = 'RUNNING', auto_start_error = NULL, updated_at = datetime('now') WHERE id = ?`)
        .run(id);
      database
        .prepare(`UPDATE yt_production_stages SET status = 'PENDING', error = NULL WHERE production_id = ? AND status = 'FAILED'`)
        .run(id);
    }

    const script = path.join(process.cwd(), "scripts", "yt_pipeline.mjs");
    const child = spawn(process.execPath, [script, "--production", id, "--resume"], {
      detached: true,
      stdio: "ignore",
      env: { ...process.env, YT_PRODUCTION_ID: id },
    });
    child.unref();

    return NextResponse.json({ success: true, id, status: "RUNNING", resumed: true }, { headers: NO_STORE });
  } catch (err) {
    const safe = logAndSummarize("post-resume", err, "Could not resume the YT production.");
    return NextResponse.json({ success: false, error: safe.summary, errorRef: safe.ref }, { status: 500, headers: NO_STORE });
  }
}

