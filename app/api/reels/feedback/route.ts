import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPostgresPool } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const pool = getPostgresPool();
    if (!pool) {
      return NextResponse.json({ success: true, feedback: [] });
    }

    const { searchParams } = new URL(req.url);
    const productionId = searchParams.get("productionId");

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
    return NextResponse.json({ success: true, feedback: res.rows });
  } catch (error: any) {
    console.error("[api/reels/feedback] GET error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to fetch feedback" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const pool = getPostgresPool();
    if (!pool) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 503 });
    }

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
      JSON.stringify(metadata)
    ]);

    const feedbackRecord = insertRes.rows[0];

    // Dual-store: also attach feedback to reel_productions manifest for direct audit trail
    try {
      await pool.query(`
        UPDATE reel_productions
        SET manifest_json = jsonb_set(
          COALESCE(manifest_json, '{}'::jsonb),
          '{feedback}',
          jsonb_build_object(
            'id', $2::text,
            'rating', $3::text,
            'isGood', $4::boolean,
            'reasons', $5::jsonb,
            'notes', $6::text,
            'updatedAt', NOW()
          ),
          true
        ),
        updated_at = NOW()
        WHERE id = $1;
      `, [productionId, id, rating, isGood, JSON.stringify(reasons), notes]);
    } catch (attachErr: any) {
      console.warn("[api/reels/feedback] Could not attach to production manifest:", attachErr.message);
    }

    return NextResponse.json({
      success: true,
      feedback: feedbackRecord
    }, { status: 201 });
  } catch (error: any) {
    console.error("[api/reels/feedback] POST error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to record feedback" }, { status: 500 });
  }
}
