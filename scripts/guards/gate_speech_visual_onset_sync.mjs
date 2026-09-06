#!/usr/bin/env node
/**
 * Guard 9: Visual-Auditory Speech Onset Alignment & Phoneme Lock Gate
 * Deterministic quality gate: Fails with exit code 1 if:
 * 1. Audio dialogue begins before the on-camera speaker's mouth physically opens (|T_audio - T_mouth| > 0.15s).
 * 2. Dialogue is played while the character's mouth is occluded (e.g. napkin over face, hand over mouth).
 * 3. Dialogue is played while the character is performing an incompatible physical action (looking down at glass, swallowing, closed-mouth laughter).
 * 4. Ambient soundscape contains undulating siren-like whistling harmonics in period historical settings.
 */

import fs from "fs";
import path from "path";

/**
 * Audits exact frame-accurate temporal alignment between speech audio onset and visual mouth opening.
 *
 * @param {Array} dialogueSyncEvents - Array of dialogue audit events:
 *   [{
 *      sceneId: string,
 *      character: string,
 *      shotInPointSec: number,
 *      visualMouthOpenSec: number,
 *      audioOnsetSec: number,
 *      audioDurationSec: number,
 *      visualFaceOccluded: "none" | "napkin" | "glass" | "hand" | "mask",
 *      visualActionAtAudioStart: "speaking_articulating" | "looking_down" | "dabbing_napkin" | "drinking" | "laughing",
 *      soundscapeArtifactCheck: {
 *        hasSirenResonance: boolean,
 *        dominantFreqHz?: number
 *      }
 *   }]
 * @param {Object} options - Configuration options
 */
export function verifySpeechVisualOnsetSync(dialogueSyncEvents, options = {}) {
  const { isSelfTest = false, sceneName = "production_reel", maxAllowedDeltaSec = 0.15 } = options;

  console.log(`🎯 [Guard 9: Speech-Visual Onset & Phoneme Lock] Auditing temporal mouth-sync for "${sceneName}"...`);

  if (!dialogueSyncEvents || dialogueSyncEvents.length === 0) {
    console.error("❌ Dialogue sync audit list is empty or missing.");
    if (!isSelfTest) process.exit(1);
    return { passed: false, reason: "EMPTY_SYNC_EVENTS" };
  }

  const violations = [];

  for (const evt of dialogueSyncEvents) {
    const {
      sceneId,
      character,
      visualMouthOpenSec,
      audioOnsetSec,
      audioDurationSec,
      visualFaceOccluded,
      visualActionAtAudioStart,
      soundscapeArtifactCheck
    } = evt;

    const deltaSec = audioOnsetSec - visualMouthOpenSec;
    const absDelta = Math.abs(deltaSec);

    // Rule 1: Temporal sync delta (|T_audio - T_mouth| <= maxAllowedDeltaSec)
    if (absDelta > maxAllowedDeltaSec) {
      const direction = deltaSec < 0 ? "AUDIO_LEADS_VISUAL_LAG" : "VISUAL_LEADS_AUDIO_LAG";
      violations.push({
        sceneId,
        type: `TEMPORAL_ONSET_DESYNC_${direction}`,
        character,
        deltaSec: parseFloat(deltaSec.toFixed(3)),
        message: `Scene "${sceneId}" (${character}): Audio speech starts at ${audioOnsetSec.toFixed(3)}s, but visual mouth does not open until ${visualMouthOpenSec.toFixed(3)}s (delta = ${deltaSec.toFixed(3)}s, exceeds threshold ${maxAllowedDeltaSec}s). The audience perceives visual mouth movement lagging behind audio!`
      });
    }

    // Rule 2: Face / mouth occlusion during speech
    if (visualFaceOccluded && visualFaceOccluded !== "none") {
      violations.push({
        sceneId,
        type: "MOUTH_OCCLUDED_DURING_SPEECH",
        character,
        occlusion: visualFaceOccluded,
        message: `Scene "${sceneId}" (${character}): Audio speech plays while character's mouth is occluded by "${visualFaceOccluded}"! Characters cannot speak audibly with napkins or objects covering their mouths.`
      });
    }

    // Rule 3: Incompatible physical action at speech onset
    if (visualActionAtAudioStart && visualActionAtAudioStart !== "speaking_articulating") {
      violations.push({
        sceneId,
        type: "INCOMPATIBLE_ACTION_AT_SPEECH_ONSET",
        character,
        action: visualActionAtAudioStart,
        message: `Scene "${sceneId}" (${character}): Character is performing "${visualActionAtAudioStart}" at audio onset rather than articulating phonemes.`
      });
    }

    // Rule 4: Siren-like soundscape resonance artifact
    if (soundscapeArtifactCheck && soundscapeArtifactCheck.hasSirenResonance) {
      violations.push({
        sceneId,
        type: "SIREN_SOUNDSCAPE_ARTIFACT",
        character: "Environment",
        freq: soundscapeArtifactCheck.dominantFreqHz,
        message: `Scene "${sceneId}": Ambient soundscape contains undulating siren-like whistling resonance (${soundscapeArtifactCheck.dominantFreqHz}Hz). Inappropriate for period historical drama.`
      });
    }
  }

  if (violations.length > 0) {
    console.error(`\n❌ CRITICAL SPEECH-VISUAL ONSET & SOUNDSCAPE VIOLATIONS DETECTED (${violations.length} violations):`);
    for (const v of violations) {
      console.error(`   [${v.type}] Scene: "${v.sceneId}": ${v.message}`);
    }
    console.error(`\n   DIAGNOSIS: Dialogue audio was triggered before physical mouth opening, over occluded faces, or with siren-whistle ambience.`);
    console.error(`   SOLUTION:`);
    console.error(`     1. Trim clip heads so speech start matches mouth opening (|T_audio - T_mouth| <= 0.15s).`);
    console.error(`     2. Never cut to speaking characters while napkins or hands cover their mouths.`);
    console.error(`     3. Replace whistling alien salt wind with authentic low-frequency steam locomotive foley (< 300Hz).\n`);
    console.error(`💥 Deterministic Workflow Failure Gate Triggered. Exiting with code 1.\n`);

    if (!isSelfTest) process.exit(1);
    return { passed: false, violations };
  }

  console.log(`✅ [Guard 9: Speech-Visual Onset & Phoneme Lock] PASSED: Frame-locked lip sync (|delta| <= 0.15s) and pristine soundscape certified.\n`);
  return { passed: true };
}

// Self-test execution for falsification testing
if (process.argv.includes("--self-test")) {
  console.log("🧪 Running Guard 9 Self-Test (Falsification Probes)...");

  // Probe 1: The user's exact reported bug 1 (Alexander audio 2.15s ahead of mouth opening)
  const probeAudioLead = [
    {
      sceneId: "shot_03_flawed_alexander",
      character: "Count Alexander",
      shotInPointSec: 10.65,
      visualMouthOpenSec: 13.15,
      audioOnsetSec: 11.00,
      audioDurationSec: 4.30,
      visualFaceOccluded: "none",
      visualActionAtAudioStart: "looking_down"
    }
  ];
  const res1 = verifySpeechVisualOnsetSync(probeAudioLead, { isSelfTest: true, sceneName: "probe_audio_lead" });
  if (res1.passed) {
    console.error("❌ FAILED TO CATCH: Audio 2.15s ahead of mouth opening slipped past Guard 9!");
    process.exit(1);
  }
  console.log("   ✓ Audio leading visual mouth movement (2.15s lag) correctly rejected.");

  // Probe 2: The user's exact reported bug with Vivienne (talking while wiping mouth with napkin)
  const probeNapkinOcclusion = [
    {
      sceneId: "shot_04_flawed_vivienne",
      character: "Baroness Vivienne",
      shotInPointSec: 15.98,
      visualMouthOpenSec: 19.60,
      audioOnsetSec: 16.35,
      audioDurationSec: 4.00,
      visualFaceOccluded: "napkin",
      visualActionAtAudioStart: "dabbing_napkin"
    }
  ];
  const res2 = verifySpeechVisualOnsetSync(probeNapkinOcclusion, { isSelfTest: true, sceneName: "probe_napkin" });
  if (res2.passed) {
    console.error("❌ FAILED TO CATCH: Speaking through napkin slipped past Guard 9!");
    process.exit(1);
  }
  console.log("   ✓ Dialogue over napkin-occluded face correctly rejected.");

  // Probe 3: The user's exact reported bug 2 (Siren-like whistling in Clip 1)
  const probeSirenSound = [
    {
      sceneId: "shot_01_flawed_train",
      character: "Atmospheric",
      shotInPointSec: 0.0,
      visualMouthOpenSec: 0.0,
      audioOnsetSec: 0.0,
      audioDurationSec: 5.0,
      visualFaceOccluded: "none",
      visualActionAtAudioStart: "speaking_articulating",
      soundscapeArtifactCheck: {
        hasSirenResonance: true,
        dominantFreqHz: 2200
      }
    }
  ];
  const res3 = verifySpeechVisualOnsetSync(probeSirenSound, { isSelfTest: true, sceneName: "probe_siren" });
  if (res3.passed) {
    console.error("❌ FAILED TO CATCH: Siren-like soundscape slipped past Guard 9!");
    process.exit(1);
  }
  console.log("   ✓ Siren-like high-frequency whistling correctly rejected.");

  // Probe 4: Valid frame-locked conformed master
  const probeValidMaster = [
    {
      sceneId: "shot_03_conformed_alexander",
      character: "Count Alexander",
      shotInPointSec: 9.370,
      visualMouthOpenSec: 10.120,
      audioOnsetSec: 10.120,
      audioDurationSec: 4.30,
      visualFaceOccluded: "none",
      visualActionAtAudioStart: "speaking_articulating",
      soundscapeArtifactCheck: { hasSirenResonance: false }
    },
    {
      sceneId: "shot_04_conformed_vivienne",
      character: "Baroness Vivienne",
      shotInPointSec: 14.370,
      visualMouthOpenSec: 15.070,
      audioOnsetSec: 15.070,
      audioDurationSec: 4.00,
      visualFaceOccluded: "none",
      visualActionAtAudioStart: "speaking_articulating",
      soundscapeArtifactCheck: { hasSirenResonance: false }
    },
    {
      sceneId: "shot_05_conformed_julian",
      character: "Captain Julian",
      shotInPointSec: 19.470,
      visualMouthOpenSec: 20.120,
      audioOnsetSec: 20.120,
      audioDurationSec: 5.37,
      visualFaceOccluded: "none",
      visualActionAtAudioStart: "speaking_articulating",
      soundscapeArtifactCheck: { hasSirenResonance: false }
    }
  ];
  const res4 = verifySpeechVisualOnsetSync(probeValidMaster, { isSelfTest: true, sceneName: "probe_valid_master" });
  if (!res4.passed) {
    console.error("❌ Valid frame-locked master failed Guard 9!");
    process.exit(1);
  }
  console.log("   ✓ Valid frame-locked master reel successfully certified.");
  console.log("\n🎉 Guard 9 Self-Test Suite Passed: 4/4 Falsification Probes Certified!\n");
}
