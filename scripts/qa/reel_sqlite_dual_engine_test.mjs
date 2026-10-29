import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { POSTGRES_SCHEMA, SQLITE_SCHEMA } from "../../lib/db/schema.ts";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "zyvoriq-dual-db-qa-"));
const dbPath = path.join(tmpDir, "dual_engine_qa.db");

try {
  const db = new DatabaseSync(dbPath);
  db.exec(SQLITE_SCHEMA);

  const journalRow = db.prepare("PRAGMA journal_mode;").get();
  assert.equal(String(journalRow.journal_mode).toLowerCase(), "wal", "SQLite must run in WAL journal mode");

  const fkRow = db.prepare("PRAGMA foreign_keys;").get();
  assert.equal(Number(fkRow.foreign_keys), 1, "SQLite must enforce PRAGMA foreign_keys = ON");

  const sqliteTables = new Set(
    db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all()
      .map((r) => String(r.name))
  );

  const requiredDualTables = [
    "organizations",
    "workspaces",
    "users_rbac",
    "persona_memories",
    "swarm_runs",
    "swarm_tasks",
    "grounding_claims",
    "modality_artifacts",
    "veritas_evaluations",
    "defect_diff_reports",
    "veritas_certificates",
    "publish_dispatches",
    "studio_series_tracks",
    "studio_production_jobs",
    "character_library",
    "character_wardrobe",
    "location_library",
    "episode_productions",
    "reel_productions",
    "reel_production_controls",
    "reel_feedback",
  ];
  assert.equal(requiredDualTables.length, 21, "Must verify all 21 canonical tables");

  for (const tbl of requiredDualTables) {
    assert.ok(sqliteTables.has(tbl), `SQLITE_SCHEMA missing table: ${tbl}`);
    assert.ok(
      new RegExp(`CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+${tbl}\\b`, "i").test(POSTGRES_SCHEMA),
      `POSTGRES_SCHEMA missing table: ${tbl}`
    );
  }

  // Verify studio_production_jobs includes acts_json in both SQLite and PostgreSQL schemas
  const jobCols = new Set(
    db
      .prepare("PRAGMA table_info(studio_production_jobs);")
      .all()
      .map((c) => String(c.name))
  );
  assert.ok(jobCols.has("acts_json"), "SQLITE_SCHEMA studio_production_jobs must include acts_json");
  assert.ok(
    /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+studio_production_jobs[\s\S]*?\bacts_json\b/i.test(POSTGRES_SCHEMA),
    "POSTGRES_SCHEMA studio_production_jobs must include acts_json"
  );

  // Verify optimistic revision CAS semantics + non-sticky starred clearing on reel_productions
  const now = new Date().toISOString();
  const prodId = "reel_qa_cas_001";
  db.prepare(
    `INSERT INTO reel_productions (id, revision, manifest_json, starred, created_at, updated_at)
     VALUES (?, 1, ?, 0, ?, ?)`
  ).run(prodId, JSON.stringify({ id: prodId, version: 2, topic: "Dual-Engine CAS Probe", starred: false }), now, now);

  const casOk = db
    .prepare(
      `UPDATE reel_productions SET revision = 2, starred = 1, manifest_json = ?, updated_at = ? WHERE id = ? AND revision = 1`
    )
    .run(JSON.stringify({ id: prodId, version: 2, topic: "Dual-Engine CAS Probe", starred: true }), now, prodId);
  assert.equal(Number(casOk.changes), 1, "Valid expectedRevision=1 CAS update must affect 1 row");

  const casConflict = db
    .prepare(
      `UPDATE reel_productions SET revision = 3, updated_at = ? WHERE id = ? AND revision = 1`
    )
    .run(now, prodId);
  assert.equal(Number(casConflict.changes), 0, "Stale expectedRevision=1 CAS update must affect 0 rows");

  const casClearStar = db
    .prepare(
      `UPDATE reel_productions SET revision = 3, starred = 0, manifest_json = ?, updated_at = ? WHERE id = ? AND revision = 2`
    )
    .run(JSON.stringify({ id: prodId, version: 2, topic: "Dual-Engine CAS Probe", starred: false }), now, prodId);
  assert.equal(Number(casClearStar.changes), 1, "Valid expectedRevision=2 CAS unstar must affect 1 row");
  const clearedRow = db.prepare(`SELECT revision, starred FROM reel_productions WHERE id = ?`).get(prodId);
  assert.equal(Number(clearedRow.revision), 3);
  assert.equal(Number(clearedRow.starred), 0, "Cleared starred flag must persist as 0");

  // Verify reel_production_controls priority + cancellation upsert
  db.prepare(
    `INSERT INTO reel_production_controls (production_id, generation_token, priority, created_at, updated_at)
     VALUES (?, 'tok_qa_1', 35, ?, ?)
     ON CONFLICT(production_id) DO UPDATE SET priority = excluded.priority, updated_at = excluded.updated_at`
  ).run(prodId, now, now);

  const ctrlRow = db
    .prepare(`SELECT priority, generation_token FROM reel_production_controls WHERE production_id = ?`)
    .get(prodId);
  assert.equal(Number(ctrlRow.priority), 35);

  // Verify reel_feedback persistence
  db.prepare(
    `INSERT INTO reel_feedback (id, production_id, reel_title, rating, is_good, reasons, notes, metadata, created_at, updated_at)
     VALUES ('fb_qa_1', ?, 'Dual-Engine CAS Probe', 'GOOD', 1, '["lip-sync"]', 'Clean WAL commit', '{}', ?, ?)`
  ).run(prodId, now, now);

  const fbRow = db.prepare(`SELECT rating, is_good FROM reel_feedback WHERE id = 'fb_qa_1'`).get();
  assert.equal(fbRow.rating, "GOOD");
  assert.equal(Number(fbRow.is_good), 1);

  // Verify episode_productions persistence
  db.prepare(
    `INSERT INTO episode_productions (
      id, series_title, episode_title, season_num, episode_num,
      topic, genre, target_duration_sec, actual_duration_sec,
      blueprint_json, status, progress, created_at, updated_at
    ) VALUES ('ep_qa_1', 'Multiverse Ops', 'Pilot', 1, 1, 'BeyondCorp', 'sci-fi', 600, 0, '{"id":"ep_qa_1"}', 'PLANNED', 0, ?, ?)`
  ).run(now, now);

  const epRow = db.prepare(`SELECT episode_title, status FROM episode_productions WHERE id = 'ep_qa_1'`).get();
  assert.equal(epRow.episode_title, "Pilot");
  assert.equal(epRow.status, "PLANNED");

  db.close();
  console.log("✅ Dual-Engine SQLite WAL + PostgreSQL 21-table schema & optimistic CAS QA passed");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
