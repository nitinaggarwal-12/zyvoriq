// lib/reel/preconditions.ts
// P1.2 Precondition gate to validate shot eligibility before enqueue, in UI, and in worker execution.

import type { ReelOperation } from "./operationQueue";
import type { ReelProductionManifest } from "./types";

export type PreconditionGate =
  | { ok: true }
  | { ok: false; kind: "blocked" | "waiting" | "persistence_data_loss"; reason: string };

/**
 * Checks whether a shot operation can proceed based on manifest dependency status and asset existence.
 */
export function canExtend(
  shotId: string,
  manifest: ReelProductionManifest
): PreconditionGate {
  const shot = manifest.shots?.find(s => s.id === shotId);
  if (!shot) {
    return {
      ok: false,
      kind: "blocked",
      reason: `Shot ${shotId} does not exist in production manifest.`,
    };
  }

  // If no dependencies, shot is immediately eligible
  if (!shot.dependsOnShotIds || shot.dependsOnShotIds.length === 0) {
    return { ok: true };
  }

  for (const depId of shot.dependsOnShotIds) {
    const parentShot = manifest.shots?.find(s => s.id === depId);
    if (!parentShot) {
      return {
        ok: false,
        kind: "blocked",
        reason: `Parent shot ${depId} does not exist in production manifest.`,
      };
    }

    if (parentShot.status === "FAILED" || (parentShot.status as string) === "CANCELLED") {
      return {
        ok: false,
        kind: "blocked",
        reason: `Parent dependency ${depId} is in terminal failed state (${parentShot.status}).`,
      };
    }

    // Condition 1: Parent still generating -> Wait
    if (!["GENERATED", "PASSED"].includes(parentShot.status)) {
      return {
        ok: false,
        kind: "waiting",
        reason: `Parent shot ${depId} is still in progress (${parentShot.status}).`,
      };
    }

    // Condition 2: Parent succeeded, media gone -> Hard fail / Persistence Data Loss
    if (!parentShot.asset?.videoUrl) {
      return {
        ok: false,
        kind: "persistence_data_loss",
        reason: `Parent shot ${depId} is marked ${parentShot.status} but its asset videoUrl is missing. Persistence failure.`,
      };
    }
  }

  return { ok: true };
}
