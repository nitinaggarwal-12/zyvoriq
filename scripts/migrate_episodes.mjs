import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  console.log("Migrating episode_productions table...");
  await pool.query(`
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
  `);
  console.log("✅ episode_productions table created successfully!");
  await pool.end();
}

run().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
