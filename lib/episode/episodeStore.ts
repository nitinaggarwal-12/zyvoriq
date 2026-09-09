import { getPostgresPool } from "@/lib/db/client";
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

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  const pool = getPostgresPool();
  if (pool) {
    try {
      await pool.query(EPISODES_TABLE);
      tableReady = true;
    } catch (err) {
      console.warn("[episodeStore] Error ensuring episode_productions table:", err);
    }
  }
}

export async function saveEpisodeBlueprint(blueprint: EpisodeBlueprint): Promise<EpisodeProductionRecord> {
  await ensureTable();
  const pool = getPostgresPool();
  if (!pool) {
    throw new Error("POSTGRES_REQUIRED: Episode persistence requires PostgreSQL connection.");
  }

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
    0
  ];

  const res = await pool.query(query, values);
  return res.rows[0];
}

export async function listEpisodes(limit = 20): Promise<EpisodeProductionRecord[]> {
  await ensureTable();
  const pool = getPostgresPool();
  if (!pool) return [];

  try {
    const res = await pool.query(
      `SELECT * FROM episode_productions ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return res.rows;
  } catch (err) {
    console.warn("[episodeStore] Failed to list episodes:", err);
    return [];
  }
}

export async function getEpisodeById(id: string): Promise<EpisodeProductionRecord | null> {
  await ensureTable();
  const pool = getPostgresPool();
  if (!pool) return null;

  try {
    const res = await pool.query(
      `SELECT * FROM episode_productions WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  } catch (err) {
    console.warn(`[episodeStore] Failed to get episode ${id}:`, err);
    return null;
  }
}
