// scripts/migrations/one_off_purge_mumbai.mjs
// Standalone one-off migration script to purge orphaned Mumbai jobs and dead dependencies.
// EXCISED FROM WORKER BOOT SEQUENCE per Remediation Plan P0.3.

import pg from "pg";
const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required to run this migration.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: false },
});

async function main() {
  try {
    console.log("[migration] Running one-off purge of orphaned Mumbai jobs...");

    // 1. Cancel operations associated strictly with legacy Mumbai productions
    const resOps = await pool.query(`
      UPDATE reel_operations
      SET status='CANCELLED',
          last_error='CLEANUP_ORPHANED_MUMBAI_JOB: Terminal state manually purged per directorial directive',
          lease_owner=NULL,
          lease_expires_at=NULL,
          updated_at=NOW()
      WHERE status IN ('QUEUED', 'RUNNING', 'BLOCKED')
        AND (
          production_id ILIKE '%mumbai%'
          OR payload_json::text ILIKE '%mumbai%'
          OR payload_json::text ILIKE '%dinner%'
          OR payload_json::text ILIKE '%bandra%'
          OR payload_json::text ILIKE '%paneer%'
        )
      RETURNING id, production_id, target_id, kind
    `);
    console.log(`[migration] Cancelled ${resOps.rowCount} legacy Mumbai operations.`);

    // 2. Cancel legacy Mumbai productions
    const resProds = await pool.query(`
      SELECT id FROM reel_productions
      WHERE id ILIKE '%mumbai%'
         OR manifest_json::text ILIKE '%mumbai%'
         OR manifest_json::text ILIKE '%dinner%'
         OR manifest_json::text ILIKE '%bandra%'
         OR manifest_json::text ILIKE '%paneer%'
    `);
    for (const pRow of resProds.rows) {
      await pool.query(`
        UPDATE reel_productions
        SET manifest_json = jsonb_set(COALESCE(manifest_json::jsonb, '{}'::jsonb), '{status}', '"CANCELLED"')::text,
            updated_at = NOW()
        WHERE id = $1
      `, [pRow.id]);
      await pool.query(`
        INSERT INTO reel_production_controls (production_id, generation_token, cancelled_at, updated_at)
        VALUES ($1, 'cancelled', NOW(), NOW())
        ON CONFLICT (production_id) DO UPDATE SET cancelled_at = NOW(), updated_at = NOW()
      `, [pRow.id]);
      console.log(`[migration] Cancelled production: ${pRow.id}`);
    }

    console.log("[migration] One-off purge completed successfully.");
  } catch (err) {
    console.error("[migration] Error during migration:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
