import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getDatabase, getPostgresPool, safeJsonParse, withRetry } from "@/lib/db/client";
import { reelProductionStore } from "@/lib/reel/productionStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PG_FEEDBACK_TABLE = `
CREATE TABLE IF NOT EXISTS reel_feedback (
  id TEXT PRIMARY KEY,
  production_id TEXT NOT NULL,
  reel_title TEXT NOT NULL DEFAULT '',
  rating VARCHAR(32) NOT NULL,
  is_good BOOLEAN NOT NULL DEFAULT TRUE,
  reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  notes TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pg_reel_feedback_prod ON reel_feedback (production_id, created_at DESC);
`;

const SQLITE_FEEDBACK_TABLE = `
CREATE TABLE IF NOT EXISTS reel_feedback (
  id TEXT PRIMARY KEY,
  production_id TEXT NOT NULL,
  reel_title TEXT NOT NULL DEFAULT '',
  rating TEXT NOT NULL,
  is_good INTEGER NOT NULL DEFAULT 1,
  reasons TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reel_feedback_prod ON reel_feedback (production_id, created_at DESC);
`;

let sqliteFeedbackReady = false;
let pgFeedbackInitPromise: Promise<void> | null = null;

async function ensurePgFeedbackPool() {
  const pool = getPostgresPool();
  if (!pool) return null;
  if (!pgFeedbackInitPromise) {
    pgFeedbackInitPromise = pool.query(PG_FEEDBACK_TABLE).then(() => undefined).catch((err) => {
      pgFeedbackInitPromise = null;
      throw err;
    });
  }
  await pgFeedbackInitPromise;
  return pool;
}

function ensureSqliteFeedbackDb() {
  const database = getDatabase();
  if (!sqliteFeedbackReady) {
    withRetry(() => {
      database.exec(SQLITE_FEEDBACK_TABLE);
    });
    sqliteFeedbackReady = true;
  }
  return database;
}

function normalizePgFeedbackRow(row: any) {
  return {
    id: String(row.id),
    production_id: String(row.production_id),
    reel_title: String(row.reel_title || ""),
    rating: String(row.rating),
    is_good: Boolean(row.is_good),
    reasons: Array.isArray(row.reasons) ? row.reasons.map(String) : safeJsonParse<string[]>(row.reasons, []),
    notes: String(row.notes || ""),
    metadata: typeof row.metadata === "string" ? safeJsonParse<Record<string, unknown>>(row.metadata, {}) : (row.metadata || {}),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

function normalizeSqliteFeedbackRow(row: any) {
  return {
    id: String(row.id),
    production_id: String(row.production_id),
    reel_title: String(row.reel_title || ""),
    rating: String(row.rating),
    is_good: Boolean(row.is_good === 1 || row.is_good === true),
    reasons: safeJsonParse<string[]>(row.reasons, []),
    notes: String(row.notes || ""),
    metadata: safeJsonParse<Record<string, unknown>>(row.metadata, {}),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productionId = searchParams.get("productionId");
    const pool = await ensurePgFeedbackPool().catch(() => null);
    if (pool) {
      let query = `
        SELECT id, production_id, reel_title, rating, is_good, reasons, notes, metadata, created_at, updated_at
        FROM reel_feedback
      `;
      const params: any[] = [];
      if (productionId) {
        query += ` WHERE production_id = $1 ORDER BY created_at DESC`;
        params.push(productionId);
      } else {
        query += ` ORDER BY created_at DESC LIMIT 200`;
      }
      const res = await pool.query(query, params).catch(() => ({ rows: [] }));
      return NextResponse.json({ success: true, feedback: res.rows.map(normalizePgFeedbackRow) });
    }

    const database = ensureSqliteFeedbackDb();
    const rows = withRetry(() => {
      if (productionId) {
        return database
          .prepare(
            `SELECT id, production_id, reel_title, rating, is_good, reasons, notes, metadata, created_at, updated_at
             FROM reel_feedback WHERE production_id = ? ORDER BY created_at DESC`
          )
          .all(productionId) as any[];
      }
      return database
        .prepare(
          `SELECT id, production_id, reel_title, rating, is_good, reasons, notes, metadata, created_at, updated_at
           FROM reel_feedback ORDER BY created_at DESC LIMIT 200`
        )
        .all() as any[];
    });
    return NextResponse.json({ success: true, feedback: rows.map(normalizeSqliteFeedbackRow) });
  } catch (error: any) {
    console.error("[api/reels/feedback] GET error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to fetch feedback" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productionId = String(body.productionId || body.reelId || "").trim();
    if (!productionId) {
      return NextResponse.json({ success: false, error: "productionId is required" }, { status: 400 });
    }

    const id = `fb_${crypto.randomUUID()}`;
    const reelTitle = String(body.reelTitle || body.title || "").slice(0, 200);
    const isGood = Boolean(body.isGood ?? (body.rating === "GOOD"));
    const rating = isGood ? "GOOD" : "NEEDS_IMPROVEMENT";
    const reasons = Array.isArray(body.reasons) ? body.reasons.map((r: any) => String(r).slice(0, 100)) : [];
    const notes = String(body.notes || body.reason || "").slice(0, 2000);
    const metadata = typeof body.metadata === "object" && body.metadata !== null ? body.metadata : {};
    const now = new Date().toISOString();

    const pool = await ensurePgFeedbackPool().catch(() => null);
    let feedbackRecord: any;

    if (pool) {
      const insertSql = `
        INSERT INTO reel_feedback (id, production_id, reel_title, rating, is_good, reasons, notes, metadata, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *;
      `;
      const insertRes = await pool.query(insertSql, [
        id,
        productionId,
        reelTitle,
        rating,
        isGood,
        reasons,
        notes,
        JSON.stringify(metadata),
      ]);
      feedbackRecord = normalizePgFeedbackRow(insertRes.rows[0]);
    } else {
      const database = ensureSqliteFeedbackDb();
      feedbackRecord = withRetry(() => {
        database
          .prepare(
            `INSERT INTO reel_feedback (id, production_id, reel_title, rating, is_good, reasons, notes, metadata, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            id,
            productionId,
            reelTitle,
            rating,
            isGood ? 1 : 0,
            JSON.stringify(reasons),
            notes,
            JSON.stringify(metadata),
            now,
            now
          );
        const row = database.prepare(`SELECT * FROM reel_feedback WHERE id = ?`).get(id);
        return normalizeSqliteFeedbackRow(row);
      });
    }

    // Dual-store: also attach feedback to reel_productions manifest for direct audit trail
    try {
      const existing = await reelProductionStore.get(productionId);
      if (existing) {
        const nextManifest: any = {
          ...existing.manifest,
          feedback: {
            id,
            rating,
            isGood,
            reasons,
            notes,
            updatedAt: now,
          },
        };
        await reelProductionStore.replace(existing.id, nextManifest, existing.revision);
      }
    } catch (attachErr: any) {
      console.warn("[api/reels/feedback] Could not attach to production manifest:", attachErr.message);
    }

    return NextResponse.json({
      success: true,
      feedback: feedbackRecord,
    }, { status: 201 });
  } catch (error: any) {
    console.error("[api/reels/feedback] POST error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to record feedback" }, { status: 500 });
  }
}
