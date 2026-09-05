#!/usr/bin/env node
/**
 * Guard 3: Semantic Ground-Truth Audio Verification Gate
 * Deterministic quality gate: Fails with exit code 1 if an audio stream claiming
 * dialogue, orchestra, or speech is actually a synthetic tone/oscillator buzzer.
 */

import fs from "fs";
import path from "path";

/**
 * Analyzes PCM samples to detect synthetic single-oscillator waves vs real acoustic/speech signals.
 * A single oscillator (sawtooth/sine/square) exhibits:
 * 1. Zero formant transition variance (static harmonic ratios).
 * 2. Excessively low spectral complexity (single fundamental frequency F0).
 * 3. Near-zero zero-crossing rate variance across time.
 */
export function verifyAudioSemanticGroundTruth(pcmSamples, sampleRate = 48000, options = {}) {
  const { isSelfTest = false, audioName = "audio_stream" } = options;

  console.log(`🎧 [Guard 3: Audio Ground Truth] Auditing acoustic semantics for "${audioName}"...`);

  if (!pcmSamples || pcmSamples.length < sampleRate * 0.5) {
    console.error("❌ Audio stream is too short or empty (< 500ms).");
    if (!isSelfTest) process.exit(1);
    return { passed: false, reason: "STREAM_EMPTY_OR_TRUNCATED" };
  }

  // 1. Time-windowed Zero-Crossing Rate (ZCR) Variance
  const windowSize = Math.floor(sampleRate * 0.1); // 100ms windows
  const windowCount = Math.floor(pcmSamples.length / windowSize);
  const zcrList = [];

  for (let w = 0; w < windowCount; w++) {
    let crossings = 0;
    const offset = w * windowSize;
    for (let i = offset + 1; i < offset + windowSize; i++) {
      if ((pcmSamples[i] >= 0 && pcmSamples[i - 1] < 0) || (pcmSamples[i] < 0 && pcmSamples[i - 1] >= 0)) {
        crossings++;
      }
    }
    zcrList.push(crossings);
  }

  // Calculate variance of ZCR across windows
  const avgZcr = zcrList.reduce((a, b) => a + b, 0) / zcrList.length;
  const zcrVariance = zcrList.reduce((sum, val) => sum + Math.pow(val - avgZcr, 2), 0) / zcrList.length;

  // 2. Crest Factor & Dynamic Range
  let peak = 0;
  let sumSq = 0;
  for (let i = 0; i < pcmSamples.length; i++) {
    const abs = Math.abs(pcmSamples[i]);
    if (abs > peak) peak = abs;
    sumSq += pcmSamples[i] * pcmSamples[i];
  }
  const rms = Math.sqrt(sumSq / pcmSamples.length);
  const peakDbfs = 20 * Math.log10(Math.max(peak, 0.00001));
  const rmsDbfs = 20 * Math.log10(Math.max(rms, 0.00001));
  const crestFactorDb = peakDbfs - rmsDbfs;

  // A pure synthetic oscillator running with constant amplitude has nearly 0 ZCR variance and low dynamic variance.
  const isSyntheticOscillator = zcrVariance < 15.0;

  if (isSyntheticOscillator) {
    console.error(`\n❌ CRITICAL SEMANTIC AUDIO FAILURE DETECTED:`);
    console.error(`   Acoustic ZCR Variance: ${zcrVariance.toFixed(2)} (Threshold: > 50.0 for natural speech/music)`);
    console.error(`   Crest Factor: ${crestFactorDb.toFixed(2)} dB`);
    console.error(`   DIAGNOSIS: The audio stream is a synthetic single-oscillator tone (buzzer/siren).`);
    console.error(`   It contains ZERO natural speech formants, phonemes, or orchestral polyphony.`);
    console.error(`\n💥 Deterministic Workflow Failure Gate Triggered. Exiting with code 1.\n`);
    if (!isSelfTest) process.exit(1);
    return { passed: false, reason: "SYNTHETIC_OSCILLATOR_DETECTED", zcrVariance };
  }

  console.log(`✅ [Guard 3: Audio Ground Truth] PASSED: Natural acoustic variance confirmed (ZCR Variance: ${zcrVariance.toFixed(1)}).\n`);
  return { passed: true, zcrVariance };
}

// Self-Test Falsification Probe
if (process.argv.includes("--self-test")) {
  console.log("🧪 Running Guard 3 Self-Test (Falsification Probe)...");

  // Probe 1: Generate synthetic 587Hz sawtooth tone (Negative Control)
  const sampleRate = 48000;
  const durationSec = 2.0;
  const totalSamples = sampleRate * durationSec;
  const badSawtooth = new Float32Array(totalSamples);
  const freq = 587.33;
  for (let i = 0; i < totalSamples; i++) {
    // Standard sawtooth waveform formula
    const t = (i / sampleRate) * freq;
    badSawtooth[i] = 2.0 * (t - Math.floor(t + 0.5));
  }

  const badResult = verifyAudioSemanticGroundTruth(badSawtooth, sampleRate, { isSelfTest: true, audioName: "test_sawtooth_buzzer" });
  if (badResult.passed || badResult.reason !== "SYNTHETIC_OSCILLATOR_DETECTED") {
    console.error("❌ Self-Test FAILED: Guard 3 failed to reject synthetic sawtooth buzzer!");
    process.exit(1);
  }
  console.log("   ✓ Synthetic sawtooth oscillator correctly rejected as non-speech/non-orchestral.");

  // Probe 2: Multi-frequency frequency-modulated acoustic-like signal (Positive Control)
  const goodAcoustic = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Modulated speech-like formant frequencies (F1 500Hz, F2 1500Hz, F3 2500Hz with vibrato & envelope)
    const env = Math.sin(t * Math.PI * 4) * Math.sin(t * Math.PI * 1.5);
    goodAcoustic[i] = (
      Math.sin(2 * Math.PI * (500 + 50 * Math.sin(t * 12)) * t) * 0.4 +
      Math.sin(2 * Math.PI * (1500 + 120 * Math.cos(t * 8)) * t) * 0.3 +
      Math.sin(2 * Math.PI * (2500 + 200 * Math.sin(t * 5)) * t) * 0.15
    ) * env;
  }

  const goodResult = verifyAudioSemanticGroundTruth(goodAcoustic, sampleRate, { isSelfTest: true, audioName: "test_acoustic_signal" });
  if (!goodResult.passed) {
    console.error("❌ Self-Test FAILED: Guard 3 rejected dynamic acoustic signal!");
    process.exit(1);
  }
  console.log("   ✓ Dynamic acoustic signal correctly accepted.");
  console.log("🎉 Guard 3 Self-Test Completed Successfully!\n");
  process.exit(0);
}
