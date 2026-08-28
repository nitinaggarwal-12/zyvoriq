import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const jobs = await db.getAllProductionJobsAsync();
    return NextResponse.json(
      { success: true, jobs },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (err: any) {
    console.error("Failed to get production jobs:", err);
    return NextResponse.json({ success: false, error: err.message, jobs: [] }, { status: 500 });
  }
}
