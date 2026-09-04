import { NextRequest, NextResponse } from "next/server";
import { getDatabase, getPostgresPool } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const pool = getPostgresPool();
    if (pool) {
      try { await pool.query("DELETE FROM reel_productions;"); } catch {}
      try { await pool.query("DELETE FROM studio_production_jobs;"); } catch {}
      try { await pool.query("DELETE FROM modality_artifacts;"); } catch {}
      try { await pool.query("DELETE FROM swarm_runs;"); } catch {}
    }

    try {
      const database = getDatabase();
      try { database.exec("DELETE FROM reel_productions;"); } catch {}
      try { database.exec("DELETE FROM studio_production_jobs;"); } catch {}
      try { database.exec("DELETE FROM modality_artifacts;"); } catch {}
      try { database.exec("DELETE FROM swarm_runs;"); } catch {}
    } catch {}

    return NextResponse.json({ success: true, message: "Library successfully cleared" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to clear library" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  return POST(req);
}
