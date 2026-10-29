import { ensurePostgresSchema, getDatabase, getPostgresPool, safeJsonParse, withRetry } from "@/lib/db/client";
import type { EpisodeBlueprint, EpisodeProductionRecord } from "./types";

const EPISODES_TABLE = `
CREATE TABLE IF NOT EXISTS episode_productions (
  id TEXT PRIMARY KEY,
  series_title TEXT NOT NULL,
  episode_title TEXT NOT NULL,
  season_num INT DEFAULT 1,
  episode_num INT DEFAULT 1,
  topic TEXT NOT NULL,
  genre TEXT NOT NULL,
  target_duration_sec INT NOT NULL,
  actual_duration_sec NUMERIC(8,2) DEFAULT 0,
  blueprint_json JSONB NOT NULL,
  status VARCHAR(32) DEFAULT 'PLANNED',
  progress INT DEFAULT 0,
  master_video_url TEXT,
  master_poster_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pg_episodes_created ON episode_productions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pg_episodes_status ON episode_productions (status);
`;

const SQLITE_EPISODES_TABLE = `
CREATE TABLE IF NOT EXISTS episode_productions (
  id TEXT PRIMARY KEY,
  series_title TEXT NOT NULL,
  episode_title TEXT NOT NULL,
  season_num INTEGER DEFAULT 1,
  episode_num INTEGER DEFAULT 1,
  topic TEXT NOT NULL,
  genre TEXT NOT NULL,
  target_duration_sec INTEGER NOT NULL,
  actual_duration_sec REAL DEFAULT 0,
  blueprint_json TEXT NOT NULL,
  status TEXT DEFAULT 'PLANNED',
  progress INTEGER DEFAULT 0,
  master_video_url TEXT,
  master_poster_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sqlite_episodes_created ON episode_productions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sqlite_episodes_status ON episode_productions (status);
`;

let pgTableReady = false;
let sqliteTableReady = false;

async function ensurePgTable() {
  await ensurePostgresSchema();
  const pool = getPostgresPool();
  if (!pool) return null;
  if (!pgTableReady) {
    try {
      await pool.query(EPISODES_TABLE);
      pgTableReady = true;
    } catch (err) {
      console.warn("[episodeStore] Error ensuring Postgres episode_productions table:", err);
      return null;
    }
  }
  return pool;
}

function ensureSqliteEpisodesDb() {
  const database = getDatabase();
  if (!sqliteTableReady) {
    withRetry(() => {
      database.exec(SQLITE_EPISODES_TABLE);
    });
    sqliteTableReady = true;
  }
  return database;
}

function normalizeEpisodeRow(row: any): EpisodeProductionRecord {
  if (!row) return row;
  return {
    ...row,
    season_num: row.season_num !== undefined && row.season_num !== null ? Number(row.season_num) : 1,
    episode_num: row.episode_num !== undefined && row.episode_num !== null ? Number(row.episode_num) : 1,
    target_duration_sec: row.target_duration_sec !== undefined && row.target_duration_sec !== null ? Number(row.target_duration_sec) : 0,
    actual_duration_sec: row.actual_duration_sec !== undefined && row.actual_duration_sec !== null ? Number(row.actual_duration_sec) : 0,
    progress: row.progress !== undefined && row.progress !== null ? Number(row.progress) : 0,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
    blueprint_json:
      typeof row.blueprint_json === "string"
        ? safeJsonParse<EpisodeBlueprint>(row.blueprint_json, {} as EpisodeBlueprint)
        : row.blueprint_json,
  };
}

export async function saveEpisodeBlueprint(blueprint: EpisodeBlueprint): Promise<EpisodeProductionRecord> {
  const pool = await ensurePgTable();
  if (pool) {
    const query = `
      INSERT INTO episode_productions (
        id, series_title, episode_title, season_num, episode_num,
        topic, genre, target_duration_sec, actual_duration_sec,
        blueprint_json, status, progress, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        series_title = EXCLUDED.series_title,
        episode_title = EXCLUDED.episode_title,
        blueprint_json = EXCLUDED.blueprint_json,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING *;
    `;
    const values = [
      blueprint.id,
      blueprint.seriesTitle,
      blueprint.episodeTitle,
      blueprint.seasonNumber,
      blueprint.episodeNumber,
      blueprint.topic,
      blueprint.genre,
      blueprint.targetDurationSec,
      0,
      JSON.stringify(blueprint),
      blueprint.status,
      0,
    ];
    const res = await pool.query(query, values);
    return normalizeEpisodeRow(res.rows[0]);
  }

  const now = new Date().toISOString();
  const database = ensureSqliteEpisodesDb();
  return withRetry(() => {
    database
      .prepare(
        `INSERT INTO episode_productions (
          id, series_title, episode_title, season_num, episode_num,
          topic, genre, target_duration_sec, actual_duration_sec,
          blueprint_json, status, progress, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 0, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          series_title = excluded.series_title,
          episode_title = excluded.episode_title,
          blueprint_json = excluded.blueprint_json,
          status = excluded.status,
          updated_at = excluded.updated_at`
      )
      .run(
        blueprint.id,
        blueprint.seriesTitle,
        blueprint.episodeTitle,
        blueprint.seasonNumber,
        blueprint.episodeNumber,
        blueprint.topic,
        blueprint.genre,
        blueprint.targetDurationSec,
        JSON.stringify(blueprint),
        blueprint.status,
        now,
        now
      );
    const row = database
      .prepare(`SELECT * FROM episode_productions WHERE id = ?`)
      .get(blueprint.id);
    return normalizeEpisodeRow(row);
  });
}

export async function listEpisodes(limit = 20): Promise<EpisodeProductionRecord[]> {
  const pool = await ensurePgTable();
  if (pool) {
    try {
      const res = await pool.query(
        `SELECT * FROM episode_productions ORDER BY created_at DESC LIMIT $1`,
        [limit]
      );
      return res.rows.map(normalizeEpisodeRow);
    } catch (err) {
      console.warn("[episodeStore] Failed to list Postgres episodes:", err);
    }
  }

  const database = ensureSqliteEpisodesDb();
  return withRetry(() => {
    const rows = database
      .prepare(`SELECT * FROM episode_productions ORDER BY created_at DESC LIMIT ?`)
      .all(limit) as any[];
    return rows.map(normalizeEpisodeRow);
  });
}

export async function getEpisodeById(id: string): Promise<EpisodeProductionRecord | null> {
  const pool = await ensurePgTable();
  if (pool) {
    try {
      const res = await pool.query(
        `SELECT * FROM episode_productions WHERE id = $1`,
        [id]
      );
      return res.rows[0] ? normalizeEpisodeRow(res.rows[0]) : null;
    } catch (err) {
      console.warn(`[episodeStore] Failed to get Postgres episode ${id}:`, err);
    }
  }

  const database = ensureSqliteEpisodesDb();
  return withRetry(() => {
    const row = database
      .prepare(`SELECT * FROM episode_productions WHERE id = ?`)
      .get(id);
    return row ? normalizeEpisodeRow(row) : null;
  });
}
