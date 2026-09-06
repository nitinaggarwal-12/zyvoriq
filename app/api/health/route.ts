import { NextResponse } from "next/server";
import { getPostgresPool } from "@/lib/db/client";

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
    } catch (e: any) {
      dbType = "postgres_error: " + e.message;
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
    version: "0.1.1-test-deploy",
    buildId: "test-deploy-build-20260906-1840",
    timestamp: new Date().toISOString()
  });
}
