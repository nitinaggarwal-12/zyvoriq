import assert from "node:assert/strict";
import { sanitizeTranscriptionPayload } from "../transcription_word_timing_guard.mjs";

const mixed = {
  segments: [{
    text: "One clear idea should stay intact",
    start_offset: "0s",
    end_offset: "2s",
    words: [
      { word: "One", start_offset: "0s", end_offset: "0.3s" },
      { word: "clear", start_offset: "0.3s", end_offset: "0.6s" },
      { word: "idea", start_offset: "0.6s", end_offset: "0.9s" },
    ],
  }],
};
const cleanedMixed = sanitizeTranscriptionPayload(mixed);
assert.equal(cleanedMixed.segments[0].text, undefined, "timed segment text must not be mixed into explicit word timings");
assert.deepEqual(cleanedMixed.segments[0].words.map(item => item.word), ["One", "clear", "idea"], "explicit word timings must be preserved");

const textWordFallback = { items: [
  { text: "One", startOffset: 0, endOffset: 0.2 },
  { text: "idea", startOffset: 0.2, endOffset: 0.5 },
] };
const cleanedFallback = sanitizeTranscriptionPayload(textWordFallback);
assert.deepEqual(cleanedFallback.items.map(item => item.text), ["One", "idea"], "single-token timed text must remain available when provider uses text for word granularity");

const phraseOnly = { segment: { text: "This is a timed segment", startOffset: 0, endOffset: 1.2 } };
assert.equal(sanitizeTranscriptionPayload(phraseOnly).segment.text, undefined, "multi-word timed text is not word-level evidence and must be removed");

const untimed = { summary: { text: "Untimed provider metadata stays intact" } };
assert.equal(sanitizeTranscriptionPayload(untimed).summary.text, untimed.summary.text, "untimed provider metadata must not be modified");

console.log("Transcription word-timing sanitation QA passed");
