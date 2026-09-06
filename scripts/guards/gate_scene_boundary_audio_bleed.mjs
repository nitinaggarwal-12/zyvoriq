#!/usr/bin/env node
/**
 * Guard 5: Scene Boundary Audio Bleed & AV-Sync Gate
 * Deterministic quality gate: Fails with exit code 1 if:
 * 1. Audio dialogue or sound effects from Scene K spill over into Scene K+1.
 * 2. Dialogue is triggered outside its designated visual scene in-point.
 * 3. Video moves faster than audio due to accumulative delay drift.
 */

import fs from "fs";
import path from "path";

/**
 * Verifies that all audio tracks in an Edit Decision List (EDL) strictly
 * reside within their respective visual scene boundaries with zero spillover.
 *
 * @param {Array} edl - Array of scene objects:
 *   [{ sceneId: string, startSec: number, endSec: number, title?: string }]
 * @param {Array} audioEvents - Array of audio event objects:
 *   [{ eventId: string, sceneId: string, startSec: number, durationSec: number, pcmSamples?: Float32Array, sampleRate?: number }]
 * @param {Object} options - Configuration options
 */
export function verifySceneBoundaryAudioBleed(edl, audioEvents, options = {}) {
  const {
    isSelfTest = false,
    maxCrossfadeAllowanceSec = 0.40, // Max audio tail allowed into crossfade
    silenceThresholdDb = -45.0,      // Max allowed residual audio energy in subsequent scene
    reelName = "cinema_reel"
  } = options;

  console.log(`🎬 [Guard 5: Scene Boundary Bleed Gate] Auditing AV-sync for "${reelName}"...`);

  if (!edl || edl.length === 0) {
    console.error("❌ EDL is empty or missing.");
    if (!isSelfTest) process.exit(1);
    return { passed: false, reason: "EMPTY_EDL" };
  }

  if (!audioEvents || audioEvents.length === 0) {
    console.error("❌ Audio events list is empty or missing.");
    if (!isSelfTest) process.exit(1);
    return { passed: false, reason: "EMPTY_AUDIO_EVENTS" };
  }

  // Create scene lookup
  const sceneMap = new Map();
  for (let i = 0; i < edl.length; i++) {
    const s = edl[i];
    const nextScene = edl[i + 1] || null;
    sceneMap.set(s.sceneId, {
      ...s,
      index: i,
      nextScene
    });
  }

  const violations = [];

  for (const event of audioEvents) {
    const scene = sceneMap.get(event.sceneId);
    if (!scene) {
      violations.push({
        eventId: event.eventId,
        type: "ORPHANED_AUDIO_EVENT",
        message: `Audio event "${event.eventId}" references unknown sceneId "${event.sceneId}".`
      });
      continue;
    }

    const eventEndSec = event.startSec + event.durationSec;
    const allowedEndSec = scene.endSec + maxCrossfadeAllowanceSec;

    // 1. Check early trigger (audio starts before visual scene begins)
    if (event.startSec < scene.startSec - 0.05) {
      violations.push({
        eventId: event.eventId,
        sceneId: scene.sceneId,
        type: "PREMATURE_AUDIO_TRIGGER",
        eventStart: event.startSec,
        sceneStart: scene.startSec,
        driftSec: scene.startSec - event.startSec,
        message: `Audio event "${event.eventId}" starts at ${event.startSec.toFixed(2)}s, BEFORE scene "${scene.sceneId}" visual in-point (${scene.startSec.toFixed(2)}s).`
      });
    }

    // 2. Check scene boundary spillover (audio extends into next visual scene)
    if (eventEndSec > allowedEndSec) {
      const spilloverSec = eventEndSec - scene.endSec;
      const nextSceneTitle = scene.nextScene ? scene.nextScene.title || scene.nextScene.sceneId : "End of Reel";

      violations.push({
        eventId: event.eventId,
        sceneId: scene.sceneId,
        nextSceneId: scene.nextScene ? scene.nextScene.sceneId : null,
        type: "SCENE_BOUNDARY_BLEED_DETECTED",
        eventStart: event.startSec,
        eventEnd: eventEndSec,
        sceneEnd: scene.endSec,
        spilloverSec: spilloverSec,
        message: `Audio event "${event.eventId}" (duration: ${event.durationSec.toFixed(2)}s) runs until ${eventEndSec.toFixed(2)}s, spilling +${spilloverSec.toFixed(2)}s past scene "${scene.sceneId}" cut point (${scene.endSec.toFixed(2)}s) into "${nextSceneTitle}".`
      });
    }

    // 3. If PCM samples provided, verify RMS energy in the spillover zone
    if (event.pcmSamples && event.sampleRate && scene.nextScene) {
      const sampleRate = event.sampleRate;
      const spilloverStartSample = Math.floor(scene.endSec * sampleRate);
      const spilloverEndSample = Math.min(event.pcmSamples.length, Math.floor(eventEndSec * sampleRate));

      if (spilloverEndSample > spilloverStartSample) {
        let sumSq = 0;
        let count = 0;
        for (let s = spilloverStartSample; s < spilloverEndSample; s++) {
          sumSq += event.pcmSamples[s] * event.pcmSamples[s];
          count++;
        }
        const rms = count > 0 ? Math.sqrt(sumSq / count) : 0;
        const rmsDb = 20 * Math.log10(Math.max(rms, 0.00001));

        if (rmsDb > silenceThresholdDb) {
          violations.push({
            eventId: event.eventId,
            sceneId: scene.sceneId,
            type: "ACTIVE_AUDIO_ENERGY_IN_NEXT_SCENE",
            rmsDb: rmsDb,
            thresholdDb: silenceThresholdDb,
            message: `Acoustic energy of "${event.eventId}" during subsequent scene "${scene.nextScene.sceneId}" is ${rmsDb.toFixed(1)} dBFS (Threshold: < ${silenceThresholdDb.toFixed(1)} dBFS). Dialogue is clearly audible over the next scene's visuals!`
          });
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error(`\n❌ CRITICAL AUDIO-VISUAL TEMPORAL BLEED DETECTED (${violations.length} violations):`);
    for (const v of violations) {
      console.error(`   [${v.type}] ${v.message}`);
    }
    console.error(`\n   DIAGNOSIS: Video moves faster than audio. Dialogue or sound effects are persisting across scene cuts.`);
    console.error(`   SOLUTION: Lock audio events to scene visual in-points and enforce: audio.duration <= (scene.end - audio.start - crossfade).`);
    console.error(`\n💥 Deterministic Workflow Failure Gate Triggered. Exiting with code 1.\n`);
    if (!isSelfTest) process.exit(1);
    return { passed: false, reason: "SCENE_BOUNDARY_BLEED_DETECTED", violations };
  }

  console.log(`✅ [Guard 5: Scene Boundary Bleed Gate] PASSED: All audio events 100% confined within visual scene windows.\n`);
  return { passed: true, violations: [] };
}

// Self-Test Falsification Probes
if (process.argv.includes("--self-test")) {
  console.log("🧪 Running Guard 5 Self-Test (Falsification Probes)...");

  const testEdl = [
    { sceneId: "scene_01", startSec: 0.0, endSec: 7.2, title: "Southampton Departure" },
    { sceneId: "scene_02", startSec: 7.2, endSec: 14.4, title: "Grand Ballroom" },
    { sceneId: "scene_03", startSec: 14.4, endSec: 21.6, title: "Sunset Prow" }
  ];

  // Probe 1: Negative Control (The actual bug that occurred in titanic_cinema_master_reel)
  // Clara line starts at 6.0s and runs for 4.53s (until 10.53s) -> spills +3.33s into scene_02
  const badEvents = [
    { eventId: "line_01_clara", sceneId: "scene_01", startSec: 6.0, durationSec: 4.53 }
  ];

  const badResult = verifySceneBoundaryAudioBleed(testEdl, badEvents, { isSelfTest: true, reelName: "probe_leaking_reel" });
  if (badResult.passed || badResult.reason !== "SCENE_BOUNDARY_BLEED_DETECTED") {
    console.error("❌ Self-Test FAILED: Guard 5 failed to catch scene boundary audio bleed!");
    process.exit(1);
  }
  console.log("   ✓ Scene boundary audio bleed correctly rejected with failure status.");

  // Probe 2: Positive Control (Frame-locked clean audio)
  // Line 1 starts at 0.5s and finishes at 6.5s (before 7.2s cut)
  // Line 2 starts at 7.6s and finishes at 13.5s (before 14.4s cut)
  const goodEvents = [
    { eventId: "line_01_clean", sceneId: "scene_01", startSec: 0.5, durationSec: 6.0 },
    { eventId: "line_02_clean", sceneId: "scene_02", startSec: 7.6, durationSec: 5.9 }
  ];

  const goodResult = verifySceneBoundaryAudioBleed(testEdl, goodEvents, { isSelfTest: true, reelName: "probe_clean_reel" });
  if (!goodResult.passed) {
    console.error("❌ Self-Test FAILED: Guard 5 rejected clean synchronized audio!");
    process.exit(1);
  }
  console.log("   ✓ Frame-locked synchronized audio correctly accepted.");

  console.log("🎉 Guard 5 Self-Test Completed Successfully!\n");
  process.exit(0);
}
