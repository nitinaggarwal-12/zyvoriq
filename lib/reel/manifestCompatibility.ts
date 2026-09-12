import { attachReelArtifactIndex } from "../artifact/identity.ts";
import { enrichManifestV2 } from "./manifestV2.ts";
import type { ReelProductionManifest } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Validate the minimum identity required to hydrate a persisted manifest.
 * Optional legacy fields remain optional and are handled by version-aware
 * enrichers/indexers; inventing media or QA evidence here would hide corruption.
 */
export function normalizePersistedReelManifest(input: unknown, fallbackId?: string): ReelProductionManifest {
  if (!isRecord(input)) throw new Error("Stored Reel manifest must be a JSON object");

  const manifest = structuredClone(input) as unknown as ReelProductionManifest;
  const storedId = typeof manifest.id === "string" ? manifest.id.trim() : "";
  const resolvedId = storedId || fallbackId?.trim() || "";
  if (!resolvedId) throw new Error("Stored Reel manifest is missing its production ID");
  manifest.id = resolvedId;

  return attachReelArtifactIndex(enrichManifestV2(manifest));
}

/** Keep a single malformed historical row from poisoning the complete archive. */
export function collectValidStoredProductions<Row, Production>(
  rows: readonly Row[],
  hydrate: (row: Row) => Production,
  onInvalid: (row: Row, error: unknown) => void,
): Production[] {
  const productions: Production[] = [];
  for (const row of rows) {
    try {
      productions.push(hydrate(row));
    } catch (error) {
      onInvalid(row, error);
    }
  }
  return productions;
}
