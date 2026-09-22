import { Pool } from "pg";

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

function getPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return pool;
}

async function ensureTables() {
  const p = getPool();
  if (!p) return;
  if (!ready) {
    ready = p.query(`
      CREATE TABLE IF NOT EXISTS zyvoriq_projects (
        id TEXT PRIMARY KEY,
        state JSONB NOT NULL,
        status TEXT,
        title TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS zyvoriq_project_versions (
        project_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        state JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (project_id, version)
      );

      CREATE INDEX IF NOT EXISTS idx_zyvoriq_projects_updated_at
        ON zyvoriq_projects(updated_at DESC);

      CREATE INDEX IF NOT EXISTS idx_zyvoriq_project_versions_project
        ON zyvoriq_project_versions(project_id, version DESC);
    `).then(() => undefined);
  }
  await ready;
}

export async function persistProjectState(
  id: string,
  state: unknown,
  meta?: { status?: string; title?: string }
) {
  const p = getPool();
  if (!p) return false;
  await ensureTables();
  await p.query(
    `INSERT INTO zyvoriq_projects (id, state, status, title, created_at, updated_at)
     VALUES ($1, $2::jsonb, $3, $4, NOW(), NOW())
     ON CONFLICT (id) DO UPDATE SET
       state = EXCLUDED.state,
       status = EXCLUDED.status,
       title = EXCLUDED.title,
       updated_at = NOW()`,
    [id, JSON.stringify(state), meta?.status || null, meta?.title || null]
  );
  return true;
}

export async function createProjectVersion(id: string, state: unknown) {
  const p = getPool();
  if (!p) return null;
  await ensureTables();
  const result = await p.query(
    `WITH next_version AS (
       SELECT COALESCE(MAX(version), 0) + 1 AS version
       FROM zyvoriq_project_versions
       WHERE project_id = $1
     )
     INSERT INTO zyvoriq_project_versions (project_id, version, state)
     SELECT $1, version, $2::jsonb FROM next_version
     RETURNING version`,
    [id, JSON.stringify(state)]
  );
  return Number(result.rows[0]?.version || 0);
}

export async function loadProjectState<T = unknown>(id: string): Promise<T | null> {
  const p = getPool();
  if (!p) return null;
  await ensureTables();
  const result = await p.query(
    "SELECT state FROM zyvoriq_projects WHERE id = $1 LIMIT 1",
    [id]
  );
  return result.rows[0]?.state ? (result.rows[0].state as T) : null;
}

export async function listProjectStates<T = unknown>(limit = 100): Promise<T[]> {
  const p = getPool();
  if (!p) return [];
  await ensureTables();
  const result = await p.query(
    "SELECT state FROM zyvoriq_projects ORDER BY updated_at DESC LIMIT $1",
    [Math.max(1, Math.min(limit, 500))]
  );
  return result.rows.map((row) => row.state as T);
}

export async function listProjectVersions<T = unknown>(id: string): Promise<Array<{ version: number; state: T; createdAt: string }>> {
  const p = getPool();
  if (!p) return [];
  await ensureTables();
  const result = await p.query(
    `SELECT version, state, created_at
     FROM zyvoriq_project_versions
     WHERE project_id = $1
     ORDER BY version DESC`,
    [id]
  );
  return result.rows.map((row) => ({
    version: Number(row.version),
    state: row.state as T,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function deleteProjectState(id: string) {
  const p = getPool();
  if (!p) return false;
  await ensureTables();
  await p.query("DELETE FROM zyvoriq_project_versions WHERE project_id = $1", [id]);
  await p.query("DELETE FROM zyvoriq_projects WHERE id = $1", [id]);
  return true;
}
