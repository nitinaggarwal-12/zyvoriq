-- 0001_omni_plan_columns.sql
-- Adds the Omni plan spine to reel_production_controls. Idempotent (safe to
-- re-run). Apply on BOTH Postgres and SQLite paths.
--
-- Postgres already supports ADD COLUMN IF NOT EXISTS; SQLite (>=3.35) does too,
-- but if your build is older, guard with a pragma check in db/client.ts.

ALTER TABLE reel_production_controls ADD COLUMN IF NOT EXISTS omni_plan_token TEXT;
ALTER TABLE reel_production_controls ADD COLUMN IF NOT EXISTS omni_plan_json  TEXT;

-- Every operation must be able to declare which plan + node authorized it.
-- (payload_json already exists on reel_operations; these are convenience columns
--  for fast filtering / integrity checks.)
ALTER TABLE reel_operations ADD COLUMN IF NOT EXISTS omni_plan_token TEXT;
ALTER TABLE reel_operations ADD COLUMN IF NOT EXISTS omni_node_id    TEXT;

CREATE INDEX IF NOT EXISTS idx_ops_omni_plan ON reel_operations (production_id, omni_plan_token);
