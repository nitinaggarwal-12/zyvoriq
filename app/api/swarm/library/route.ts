import { NextRequest, NextResponse } from "next/server";
import {
  LibraryAssetItem,
  loadLibraryAssets,
  appendLibraryAssets,
} from "@/lib/swarm/libraryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = loadLibraryAssets().sort((a, b) =>
    String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
  );
  return NextResponse.json({ ok: true, count: items.length, items, assets: items });
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
