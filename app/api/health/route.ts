import { NextResponse } from "next/server";
import { getPostgresPool, db } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const pg = getPostgresPool();
  let dbType = "sqlite";
  let pgConnected = false;
  let tracksCount = 0;

  if (pg) {
    try {
      const res = await pg.query("SELECT COUNT(*) FROM studio_series_tracks;");
      dbType = "postgres";
      pgConnected = true;
      tracksCount = parseInt(res.rows[0]?.count || "0", 10);
    } catch {
      dbType = "sqlite";
    }
  }

  if (dbType === "sqlite") {
    try {
      tracksCount = db.getStudioTracks().length;
    } catch {
      tracksCount = 0;
    }
  }

  return NextResponse.json({
    status: "ok",
    service: "zyvoriq",
    database: {
      engine: dbType,
      connected: pgConnected || dbType === "sqlite",
      tracksCount
    },
    version: "3.5.0-omni-swarm",
    buildId: "zyvoriq-v3.5.0-rule58",
    timestamp: new Date().toISOString()
  });
}
