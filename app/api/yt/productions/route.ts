import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { NextRequest, NextResponse } from "next/server";
import { getDatabase, getPostgresPool } from "@/lib/db/client";
import { YT_STAGES, YT_STAGE_EXECUTOR, type YtStage } from "@/lib/yt/contract";
import { VALID_OMNI_GENRES, type OmniGenre } from "@/lib/reel/omniDirector";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const NO_STORE = { "Cache-Control": "no-store" } as const;

/* ------------------------------------------------------------------ *
 * Input validation
 *
 * The studio1 route this is modelled on validates exactly one field
 * (topic) and forwards everything else straight into the planner, so a
 * duration of "banana" or a genre of "" only fails deep inside a paid
 * code path. Everything the UI can send is validated or clamped here,
 * before a row - let alone a provider call - exists.
 * ------------------------------------------------------------------ */

const TOPIC_MIN_CHARS = 3;
const TOPIC_MAX_CHARS = 600;
const DURATION_MIN_SEC = 8;
const DURATION_MAX_SEC = 180;
const DURATION_DEFAULT_SEC = 24;

const PLATFORMS = ["YouTube Shorts", "Instagram Reels", "TikTok"] as const;
type YtPlatform = (typeof PLATFORMS)[number];

const PLATFORM_ALIASES: Record<string, YtPlatform> = {
  "youtube shorts": "YouTube Shorts",
  youtube_shorts: "YouTube Shorts",
  "youtube-shorts": "YouTube Shorts",
  youtube: "YouTube Shorts",
  shorts: "YouTube Shorts",
  yt: "YouTube Shorts",
  "instagram reels": "Instagram Reels",
  instagram_reels: "Instagram Reels",
  "instagram-reels": "Instagram Reels",
  instagram: "Instagram Reels",
  reels: "Instagram Reels",
  ig: "Instagram Reels",
  tiktok: "TikTok",
  tik_tok: "TikTok",
  "tik tok": "TikTok",
};

interface ValidInput {
  topic: string;
  genre: OmniGenre;
  durationSec: number;
  platform: YtPlatform;
  warnings: string[];
}

type Validation =
  | { ok: true; value: ValidInput }
  | { ok: false; field: string; error: string };

function validate(body: Record<string, unknown>): Validation {
  const warnings: string[] = [];

  // --- topic -------------------------------------------------------
  const rawTopic = body.topic ?? body.prompt;
  if (typeof rawTopic !== "string" || !rawTopic.trim()) {
    return { ok: false, field: "topic", error: "topic is required and must be a non-empty string" };
  }
  const topic = rawTopic.trim().replace(/\s+/g, " ");
  if (topic.length < TOPIC_MIN_CHARS) {
    return { ok: false, field: "topic", error: `topic must be at least ${TOPIC_MIN_CHARS} characters` };
  }
  if (topic.length > TOPIC_MAX_CHARS) {
    return { ok: false, field: "topic", error: `topic must be at most ${TOPIC_MAX_CHARS} characters (received ${topic.length})` };
  }

  // --- genre -------------------------------------------------------
  const rawGenre = body.genre;
  let genre: OmniGenre = "MUSIC_VIDEO";
  let finalTopic = topic;
  if (rawGenre !== undefined && rawGenre !== null && String(rawGenre).trim() !== "") {
    if (typeof rawGenre !== "string") {
      return { ok: false, field: "genre", error: "genre must be a string" };
    }
    const normalized = rawGenre.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_") as OmniGenre;
    if (VALID_OMNI_GENRES.has(normalized)) {
      genre = normalized;
    } else {
      // User typed a custom style/genre description (e.g. "Modern pop music video singing dancing 3 models")
      // Fold it into the topic prompt and default canonical genre to MUSIC_VIDEO
      finalTopic = `${topic} (${rawGenre.trim()})`;
      genre = "MUSIC_VIDEO";
    }
  }

  // --- duration ----------------------------------------------------
  const rawDuration = body.duration ?? body.requestedDurationSec;
  let durationSec = DURATION_DEFAULT_SEC;
  if (rawDuration !== undefined && rawDuration !== null && String(rawDuration).trim() !== "") {
    const parsed = Number(rawDuration);
    if (!Number.isFinite(parsed)) {
      return { ok: false, field: "duration", error: "duration must be a finite number of seconds" };
    }
    durationSec = Math.round(parsed * 100) / 100;
    if (durationSec < DURATION_MIN_SEC) {
      warnings.push(`duration ${durationSec}s clamped up to the ${DURATION_MIN_SEC}s minimum`);
      durationSec = DURATION_MIN_SEC;
    } else if (durationSec > DURATION_MAX_SEC) {
      warnings.push(`duration ${durationSec}s clamped down to the ${DURATION_MAX_SEC}s maximum`);
      durationSec = DURATION_MAX_SEC;
    }
  }

  // --- platform ----------------------------------------------------
  const rawPlatform = body.platform;
  let platform: YtPlatform = "YouTube Shorts";
  if (rawPlatform !== undefined && rawPlatform !== null && String(rawPlatform).trim() !== "") {
    if (typeof rawPlatform !== "string") {
      return { ok: false, field: "platform", error: "platform must be a string" };
    }
    const hit = PLATFORM_ALIASES[rawPlatform.trim().toLowerCase()];
    if (!hit) {
      return {
        ok: false,
        field: "platform",
        error: `platform "${rawPlatform}" is not supported. Allowed: ${PLATFORMS.join(", ")}`,
      };
    }
    platform = hit;
  }

  return { ok: true, value: { topic: finalTopic, genre, durationSec, platform, warnings } };
}

/* ------------------------------------------------------------------ *
 * Safe error reporting
 *
 * studio1 returns `error?.message` straight to the browser, which leaks
 * connection strings, file paths and provider payloads. Here the full
 * exception is logged server-side against a short reference and the
 * client only ever sees the reference plus a fixed, non-internal
 * sentence.
 * ------------------------------------------------------------------ */

function logAndSummarize(scope: string, err: unknown, clientMessage: string) {
  const ref = crypto.randomUUID().slice(0, 8);
  console.error(`[api/yt/productions] ${scope} failed (ref=${ref}):`, err);
  return { ref, message: clientMessage, summary: `${clientMessage} (ref ${ref})` };
}

/* ------------------------------------------------------------------ *
 * Dual-engine persistence (Postgres when configured, SQLite otherwise)
 *
 * Kept local to the route on purpose: this agent owns only the two YT
 * route files, so no shared lib module is introduced.
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
CREATE TABLE IF NOT EXISTS yt_operations (
  id TEXT PRIMARY KEY,
  production_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'YT_PIPELINE',
  status TEXT NOT NULL DEFAULT 'QUEUED',
  idempotency_key TEXT NOT NULL UNIQUE,
  attempt INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL DEFAULT '{}',
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE yt_productions ADD COLUMN IF NOT EXISTS auto_start_error TEXT;
ALTER TABLE yt_productions ADD COLUMN IF NOT EXISTS auto_started BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_yt_productions_created ON yt_productions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_yt_stages_production ON yt_production_stages(production_id, seq);
CREATE INDEX IF NOT EXISTS idx_yt_operations_status ON yt_operations(status, created_at);
`;

// SQLite has no ALTER TABLE ... ADD COLUMN IF NOT EXISTS - it is a hard
// syntax error - so additive columns go through sqliteEnsureColumn().
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
CREATE TABLE IF NOT EXISTS yt_operations (
  id TEXT PRIMARY KEY,
  production_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'YT_PIPELINE',
  status TEXT NOT NULL DEFAULT 'QUEUED',
  idempotency_key TEXT NOT NULL UNIQUE,
  attempt INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL DEFAULT '{}',
  last_error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_yt_productions_created ON yt_productions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_yt_stages_production ON yt_production_stages(production_id, seq);
CREATE INDEX IF NOT EXISTS idx_yt_operations_status ON yt_operations(status, created_at);
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
      return "sqlite" as const;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

interface ProductionRow {
  id: string;
  topic: string;
  genre: OmniGenre;
  durationSec: number;
  platform: YtPlatform;
  status: string;
  createdAt: string;
}

async function createProduction(input: ValidInput): Promise<ProductionRow> {
  const engine = await ensureSchema();
  const id = `yt_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  if (engine === "postgres") {
    const pool = getPostgresPool()!;
    await pool.query(
      `INSERT INTO yt_productions (id, topic, genre, duration_sec, platform, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,'PENDING',$6,$6)`,
      [id, input.topic, input.genre, input.durationSec, input.platform, now]
    );
  } else {
    getDatabase()
      .prepare(
        `INSERT INTO yt_productions (id, topic, genre, duration_sec, platform, status, created_at, updated_at)
         VALUES (?,?,?,?,?,'PENDING',?,?)`
      )
      .run(id, input.topic, input.genre, input.durationSec, input.platform, now, now);
  }

  return {
    id,
    topic: input.topic,
    genre: input.genre,
    durationSec: input.durationSec,
    platform: input.platform,
    status: "PENDING",
    createdAt: now,
  };
}

/**
 * Register all 7 canonical stages up front at PENDING. Registering the
 * whole grid at creation time (rather than as each stage begins) is what
 * lets the GET route show honest, restart-surviving progress: a stage
 * missing from the table would otherwise be indistinguishable from a
 * stage that never got scheduled.
 */
async function registerStages(productionId: string): Promise<void> {
  const engine = await ensureSchema();
  if (engine === "postgres") {
    const pool = getPostgresPool()!;
    for (let i = 0; i < YT_STAGES.length; i++) {
      const stage: YtStage = YT_STAGES[i];
      await pool.query(
        `INSERT INTO yt_production_stages (production_id, stage, seq, status, model)
         VALUES ($1,$2,$3,'PENDING',$4)
         ON CONFLICT (production_id, stage) DO NOTHING`,
        [productionId, stage, i, YT_STAGE_EXECUTOR[stage]]
      );
    }
    return;
  }
  const stmt = getDatabase().prepare(
    `INSERT INTO yt_production_stages (production_id, stage, seq, status, model)
     VALUES (?,?,?,'PENDING',?)
     ON CONFLICT (production_id, stage) DO NOTHING`
  );
  for (let i = 0; i < YT_STAGES.length; i++) {
    const stage: YtStage = YT_STAGES[i];
    stmt.run(productionId, stage, i, YT_STAGE_EXECUTOR[stage]);
  }
}

interface YtOperation {
  id: string;
  productionId: string;
  kind: string;
  status: string;
  idempotencyKey: string;
  createdAt: string;
}

async function enqueueOperation(production: ProductionRow): Promise<YtOperation> {
  const engine = await ensureSchema();
  const id = `ytop_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const idempotencyKey = [
    production.id,
    "YT_PIPELINE",
    crypto
      .createHash("sha256")
      .update(JSON.stringify({ t: production.topic, g: production.genre, d: production.durationSec, p: production.platform }))
      .digest("hex")
      .slice(0, 24),
  ].join(":");
  const payload = JSON.stringify({
    topic: production.topic,
    genre: production.genre,
    durationSec: production.durationSec,
    platform: production.platform,
    stages: YT_STAGES,
  });

  if (engine === "postgres") {
    const pool = getPostgresPool()!;
    await pool.query(
      `INSERT INTO yt_operations (id, production_id, kind, status, idempotency_key, payload_json, created_at, updated_at)
       VALUES ($1,$2,'YT_PIPELINE','QUEUED',$3,$4,$5,$5)
       ON CONFLICT (idempotency_key) DO NOTHING`,
      [id, production.id, idempotencyKey, payload, now]
    );
  } else {
    getDatabase()
      .prepare(
        `INSERT INTO yt_operations (id, production_id, kind, status, idempotency_key, payload_json, created_at, updated_at)
         VALUES (?,?,'YT_PIPELINE','QUEUED',?,?,?,?)
         ON CONFLICT (idempotency_key) DO NOTHING`
      )
      .run(id, production.id, idempotencyKey, payload, now, now);
  }

  return { id, productionId: production.id, kind: "YT_PIPELINE", status: "QUEUED", idempotencyKey, createdAt: now };
}

async function setProductionState(
  productionId: string,
  status: string,
  opts: { autoStarted: boolean; autoStartError: string | null }
): Promise<void> {
  const engine = await ensureSchema();
  const now = new Date().toISOString();
  if (engine === "postgres") {
    const pool = getPostgresPool()!;
    await pool.query(
      `UPDATE yt_productions SET status=$2, auto_started=$3, auto_start_error=$4, updated_at=$5 WHERE id=$1`,
      [productionId, status, opts.autoStarted, opts.autoStartError, now]
    );
    return;
  }
  // SQLite has no boolean type: integer 0/1 maps onto the Postgres boolean.
  getDatabase()
    .prepare(`UPDATE yt_productions SET status=?, auto_started=?, auto_start_error=?, updated_at=? WHERE id=?`)
    .run(status, opts.autoStarted ? 1 : 0, opts.autoStartError, now, productionId);
}

/**
 * Persist an auto-start failure onto the first stage as well as the
 * production, so the failure is visible on the progress grid the UI
 * already polls - not only in the POST response the UI may have
 * discarded.
 */
async function markFirstStageFailed(productionId: string, safeMessage: string): Promise<void> {
  const engine = await ensureSchema();
  const stage: YtStage = YT_STAGES[0];
  if (engine === "postgres") {
    const pool = getPostgresPool()!;
    await pool.query(`UPDATE yt_production_stages SET status='FAILED', error=$3 WHERE production_id=$1 AND stage=$2`, [
      productionId,
      stage,
      safeMessage,
    ]);
    return;
  }
  getDatabase()
    .prepare(`UPDATE yt_production_stages SET status='FAILED', error=? WHERE production_id=? AND stage=?`)
    .run(safeMessage, productionId, stage);
}

/* ------------------------------------------------------------------ *
 * Pipeline dispatch
 * ------------------------------------------------------------------ */

function pipelineScriptPath(): string {
  return path.resolve(process.cwd(), "scripts", "yt_pipeline.mjs");
}

/**
 * Resolves only once the child has spawned AND survived a short settle window.
 *
 * Resolving on the "spawn" event alone was a real defect: the child was being
 * launched with a bare positional id, died instantly with
 * ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL, and this function still reported
 * success, so the API returned 201 autoStarted:true for a pipeline that had
 * already crashed. The arg shape is now explicit and early death is fatal.
 */
function dispatchPipeline(productionId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = pipelineScriptPath();
    if (!fs.existsSync(script)) {
      reject(new Error(`Pipeline runner missing at ${script}`));
      return;
    }

    // Keep the child's output; a crashed pipeline with no log is undebuggable.
    let stdio: "ignore" | ["ignore", number, number] = "ignore";
    let logPath: string | null = null;
    try {
      const logDir = path.resolve(process.cwd(), "scratch", "yt_logs");
      fs.mkdirSync(logDir, { recursive: true });
      logPath = path.join(logDir, `${productionId}.log`);
      const fd = fs.openSync(logPath, "a");
      stdio = ["ignore", fd, fd];
    } catch {
      stdio = "ignore";
    }

    const SETTLE_MS = 4000;
    let settled = false;
    const done = (err?: Error) => {
      if (settled) return;
      settled = true;
      err ? reject(err) : resolve();
    };

    try {
      const child = spawn(process.execPath, [script, "--production", productionId], {
        detached: true,
        stdio,
        env: { ...process.env, YT_PRODUCTION_ID: productionId },
      });

      child.once("error", (err) => done(err));

      // A pipeline that exits during the settle window did not start; it failed.
      child.once("exit", (code, signal) => {
        if (settled) return;
        const where = logPath ? ` See ${logPath}` : "";
        done(new Error(`Pipeline runner exited immediately (code=${code}, signal=${signal ?? "none"}).${where}`));
      });

      child.once("spawn", () => {
        setTimeout(() => {
          if (settled) return;
          child.removeAllListeners("exit");
          child.unref();
          done();
        }, SETTLE_MS).unref?.();
      });
    } catch (err) {
      done(err as Error);
    }
  });
}

/* ------------------------------------------------------------------ *
 * Handlers
 * ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  // --- 1. parse + validate (nothing is persisted before this passes)
  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ success: false, error: "Request body must be a JSON object" }, { status: 400, headers: NO_STORE });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, error: "Request body must be valid JSON" }, { status: 400, headers: NO_STORE });
  }

  const validation = validate(body);
  if (!validation.ok) {
    return NextResponse.json(
      { success: false, error: validation.error, field: validation.field },
      { status: 400, headers: NO_STORE }
    );
  }
  const input = validation.value;

  // --- 2. create the production + register the 7-stage grid
  let production: ProductionRow;
  try {
    production = await createProduction(input);
    await registerStages(production.id);
  } catch (err) {
    const safe = logAndSummarize("create", err, "Could not create the YT production. Please retry.");
    return NextResponse.json({ success: false, error: safe.summary, errorRef: safe.ref }, { status: 500, headers: NO_STORE });
  }

  console.log(
    `[api/yt/productions] created ${production.id} topic="${input.topic.slice(0, 60)}" genre=${input.genre} duration=${input.durationSec}s platform="${input.platform}"`
  );

  // --- 3. enqueue, then dispatch. A failure in either step is reported
  // honestly and persisted; it is never downgraded to a console.warn
  // behind a 201/success:true like the studio1 route does.
  let operation: YtOperation | null = null;
  try {
    operation = await enqueueOperation(production);
  } catch (err) {
    const safe = logAndSummarize("enqueue", err, "Production saved but the pipeline could not be queued.");
    await setProductionState(production.id, "QUEUE_FAILED", { autoStarted: false, autoStartError: safe.summary }).catch((e) =>
      console.error(`[api/yt/productions] could not persist queue failure for ${production.id}:`, e)
    );
    await markFirstStageFailed(production.id, safe.summary).catch(() => {});
    return NextResponse.json(
      {
        success: false,
        productionId: production.id,
        operation: null,
        autoStarted: false,
        autoStartError: safe.summary,
        errorRef: safe.ref,
        warnings: input.warnings,
      },
      { status: 503, headers: NO_STORE }
    );
  }

  try {
    await dispatchPipeline(production.id);
  } catch (err) {
    const safe = logAndSummarize(
      "dispatch",
      err,
      "Production queued but the pipeline runner could not be started; it will not progress until a worker picks it up."
    );
    await setProductionState(production.id, "QUEUED_NOT_STARTED", { autoStarted: false, autoStartError: safe.summary }).catch((e) =>
      console.error(`[api/yt/productions] could not persist dispatch failure for ${production.id}:`, e)
    );
    return NextResponse.json(
      {
        success: false,
        productionId: production.id,
        operation,
        autoStarted: false,
        autoStartError: safe.summary,
        errorRef: safe.ref,
        warnings: input.warnings,
      },
      { status: 202, headers: NO_STORE }
    );
  }

  await setProductionState(production.id, "RUNNING", { autoStarted: true, autoStartError: null }).catch((e) =>
    console.error(`[api/yt/productions] could not persist RUNNING state for ${production.id}:`, e)
  );

  return NextResponse.json(
    {
      success: true,
      productionId: production.id,
      operation,
      autoStarted: true,
      autoStartError: null,
      production: {
        id: production.id,
        topic: production.topic,
        genre: production.genre,
        durationSec: production.durationSec,
        platform: production.platform,
        status: "RUNNING",
        createdAt: production.createdAt,
      },
      warnings: input.warnings,
    },
    { status: 201, headers: NO_STORE }
  );
}

export async function GET(req: NextRequest) {
  try {
    const engine = await ensureSchema();
    const limitRaw = Number(req.nextUrl.searchParams.get("limit") || 25);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(100, Math.floor(limitRaw))) : 25;

    let rows: any[];
    if (engine === "postgres") {
      const pool = getPostgresPool()!;
      const result = await pool.query(
        `SELECT id, topic, genre, duration_sec, platform, status, auto_started, auto_start_error, manifest_json, renders_json, created_at, updated_at
         FROM yt_productions ORDER BY created_at DESC LIMIT $1`,
        [limit]
      );
      rows = result.rows;
    } else {
      rows = getDatabase()
        .prepare(
          `SELECT id, topic, genre, duration_sec, platform, status, auto_started, auto_start_error, manifest_json, renders_json, created_at, updated_at
           FROM yt_productions ORDER BY created_at DESC LIMIT ?`
        )
        .all(limit) as any[];
    }

    const parseJsonSafe = <T,>(v: unknown, fallback: T): T => {
      if (!v) return fallback;
      if (typeof v === "object") return v as T;
      try {
        return JSON.parse(String(v)) as T;
      } catch {
        return fallback;
      }
    };

    return NextResponse.json(
      {
        success: true,
        productions: rows.map((r) => ({
          id: String(r.id),
          topic: String(r.topic),
          genre: String(r.genre),
          durationSec: Number(r.duration_sec),
          platform: String(r.platform),
          status: String(r.status),
          autoStarted: Boolean(r.auto_started),
          autoStartError: r.auto_start_error ? String(r.auto_start_error) : null,
          manifest: parseJsonSafe<Record<string, unknown>>(r.manifest_json, {}),
          renders: parseJsonSafe<unknown[]>(r.renders_json, []),
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString(),
        })),
      },
      { headers: NO_STORE }
    );
  } catch (err) {
    const safe = logAndSummarize("list", err, "Could not list YT productions.");
    return NextResponse.json({ success: false, error: safe.summary, errorRef: safe.ref }, { status: 500, headers: NO_STORE });
  }
}
