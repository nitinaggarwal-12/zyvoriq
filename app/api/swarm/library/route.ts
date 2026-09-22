import { NextRequest, NextResponse } from "next/server";
import { appendLibraryAssets, loadLibraryAssets, type LibraryAssetItem } from "@/lib/swarm-library";

export const runtime = "nodejs";

export async function GET() {
  const items = loadLibraryAssets();
  return NextResponse.json({ ok: true, count: items.length, items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const itemsToAdd: LibraryAssetItem[] = Array.isArray(body.items)
      ? body.items
      : body.item
      ? [body.item]
      : [];
    const merged = appendLibraryAssets(itemsToAdd);
    return NextResponse.json({ ok: true, count: merged.length, items: merged });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
