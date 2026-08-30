import { ReelProductionManifest } from "./types";

export interface ReelAuditResult {
  passed: boolean;
  score: number;
  warnings: string[];
  failures: string[];
}

export function auditReelManifest(manifest: ReelProductionManifest): ReelAuditResult {
  const failures: string[] = [];
  const warnings: string[] = [];

  if (!manifest.shots.length) failures.push("Production has no shots.");
  if (manifest.audio.masterClock === "narration" && manifest.audio.timingSource !== "actual-alignment") {
    failures.push("Speech-led production has no actual narration alignment; heuristic timing is not accepted as sync evidence.");
  }

  let expectedStart = 0;
  for (let i = 0; i < manifest.shots.length; i++) {
    const shot = manifest.shots[i];
    if (Math.abs(shot.editorialStartSec - expectedStart) > 0.08) {
      failures.push(`${shot.id} starts at ${shot.editorialStartSec}s but canonical timeline expects ${expectedStart.toFixed(2)}s.`);
    }
    if (shot.editorialDurationSec <= 0) failures.push(`${shot.id} has a non-positive editorial duration.`);
    if (shot.trimOutSec > shot.generationDurationSec + 0.05) failures.push(`${shot.id} editorial trim exceeds its generated source duration.`);
    if (!shot.continuityIn.camera || !shot.continuityOut.camera) warnings.push(`${shot.id} is missing camera continuity state.`);
    if (!shot.continuityIn.environment || !shot.continuityOut.environment) warnings.push(`${shot.id} is missing environment continuity state.`);

    if (shot.status === "PASSED") {
      if (!shot.asset?.videoUrl) failures.push(`${shot.id} is marked PASSED without a video artifact.`);
      if (shot.qa?.failures?.length) failures.push(`${shot.id} is marked PASSED but still contains QA failures.`);
    }

    if (i > 0 && shot.dependsOnShotIds.length) {
      for (const dep of shot.dependsOnShotIds) {
        if (!manifest.shots.some(s => s.id === dep)) failures.push(`${shot.id} depends on missing shot ${dep}.`);
      }
    }

    expectedStart += shot.editorialDurationSec;
  }

  if (Math.abs(expectedStart - manifest.plannedDurationSec) > 0.12) {
    failures.push(`Timeline duration ${expectedStart.toFixed(2)}s does not match manifest planned duration ${manifest.plannedDurationSec}s.`);
  }

  if (manifest.status === "READY") {
    if (!manifest.shots.every(s => s.status === "PASSED")) failures.push("Production is READY while one or more shots have not passed QA.");
    if (!manifest.qa.passed) failures.push("Production is READY while the master QA gate is not passed.");
    if ((manifest.qa.overallScore ?? 0) < manifest.qa.minimumReadyScore) failures.push("Production is READY below the minimum master quality score.");
  }

  const penalty = failures.length * 18 + warnings.length * 2;
  const score = Math.max(0, Math.min(100, 100 - penalty));
  return { passed: failures.length === 0, score, warnings, failures };
}
