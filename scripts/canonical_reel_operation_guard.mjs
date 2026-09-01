import pg from "pg";

const { Pool } = pg;

function databaseUrl() {
  const direct = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_PRIVATE_URL;
  if (direct) return direct;
  if (process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE) {
    const pass = process.env.PGPASSWORD ? `:${encodeURIComponent(process.env.PGPASSWORD)}` : "";
    return `postgresql://${encodeURIComponent(process.env.PGUSER)}${pass}@${process.env.PGHOST}:${process.env.PGPORT || "5432"}/${process.env.PGDATABASE}`;
  }
  return "";
}

const url = databaseUrl();
if (url) {
  const pool = new Pool({
    connectionString: url,
    ssl: url.includes("localhost") || url.includes("127.0.0.1") ? false : { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 5000,
  });

  try {
    // On a brand-new deployment the worker creates this table itself. Do not
    // make the preload guard responsible for schema ownership.
    const table = await pool.query("SELECT to_regclass('public.reel_operations') AS name");
    if (table.rows[0]?.name) {
      // Defense in depth: the API no longer queues legacy paid operations, but a
      // worker restart may discover jobs queued before the routing fix. Fail
      // those jobs before reel_worker_v2 can dispatch provider calls.
      const result = await pool.query(`
        UPDATE reel_operations
        SET status='FAILED',
            last_error='LEGACY_REEL_PIPELINE_DISABLED: canonical Studio1 operation evidence is required',
            lease_owner=NULL,
            lease_expires_at=NULL,
            updated_at=NOW()
        WHERE status IN ('QUEUED','RUNNING')
          AND kind IN ('NARRATION','SHOT','ROUGH_CUT')
          AND COALESCE(payload_json->>'studio1', 'false') <> 'true'
      `);
      if (Number(result.rowCount || 0) > 0) {
        console.warn(`[reel-worker] blocked ${result.rowCount} legacy paid operation(s); canonical Studio1 pipeline is required`);
      }
    }
  } finally {
    await pool.end();
  }
}
