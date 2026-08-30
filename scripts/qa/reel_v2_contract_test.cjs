const assert = require('node:assert/strict');
const { planReel } = require('../../.tmp-reel-v2/planner.js');
const { auditReelManifest, REEL_QA_GATES_ENABLED } = require('../../.tmp-reel-v2/audit.js');
const { enrichManifestV2 } = require('../../.tmp-reel-v2/manifestV2.js');
const { chooseBoundaryOperation, selectProvider } = require('../../.tmp-reel-v2/providerContracts.js');

function clone(value) { return JSON.parse(JSON.stringify(value)); }

assert.equal(REEL_QA_GATES_ENABLED, false, 'temporary Reel QA bypass must remain explicitly enabled for test mode');

const planned = planReel({ topic: 'continuous human performance', requestedDurationSec: 30, scriptText: 'One clear idea should feel like one continuous performance from the first word through the final call to action without visual or audio drift.' });
assert.equal(planned.version, 2, 'planner must emit Manifest V2');
assert.equal(planned.continuity.boundaries.length, planned.shots.length - 1, 'every adjacent shot boundary must be represented');
assert.ok(planned.continuity.characters.length >= 1, 'Character Bible required');
assert.ok(planned.continuity.performanceTracks.length >= 1, 'Performance Track required');
assert.ok(planned.captions.cues.length >= 1, 'draft Caption Track required');
assert.equal(planned.musicPlan.continuousAcrossVisualCuts, true, 'music plan must remain continuous over visual cuts');
for (const id of ['QG-TRANSCRIPT-01','QG-CAP-01','QG-PERF-01','QG-LIP-01','QG-EMO-01','QG-BND-01','QG-OBJ-01','QG-VIS-01','QG-AUD-01','QG-SEM-01','QG-WHOLE-01']) {
  assert.equal(planned.qa.gates[id].status, 'PENDING', `${id} registry state must remain intact while enforcement is bypassed`);
}

const boundary = planned.continuity.boundaries[0];
assert.ok(['EDIT_VIDEO','GENERATE_VIDEO','EXTEND_VIDEO','INTERPOLATE_BOUNDARY','REPAIR'].includes(chooseBoundaryOperation(boundary).operation));
assert.throws(() => selectProvider({ capabilities: [] }, 'LIP_SYNC'), /No enabled provider satisfies LIP_SYNC/, 'provider routing must fail closed without a compatible provider');
const selected = selectProvider({ capabilities: [{ providerId:'verified-test-provider', operation:'PERFORMANCE_RENDER', enabled:true, supportsContinuousIdentity:true, supportsAudioDrivenPerformance:true, priority:10 }] }, 'PERFORMANCE_RENDER', { supportsContinuousIdentity:true, supportsAudioDrivenPerformance:true });
assert.equal(selected.providerId, 'verified-test-provider');

const aligned = clone(planned);
aligned.status = 'SHOTS_PLANNED';
aligned.audio.narrationUrl = '/api/reels/assets/reels/test/narration.wav';
aligned.audio.actualDurationSec = 4.4;
aligned.audio.timingSource = 'actual-alignment';
aligned.audio.alignmentValidation = { expectedWords: 8, actualWords: 8, wer: 0, coverage: 1, passed: true, missingCritical: [] };
aligned.audio.wordTimings = [
  ['One',0,0.3],['clear',0.32,0.7],['idea',0.72,1.05],['should',1.08,1.4],['feel',1.42,1.75],['continuous',1.78,2.35],['and',2.38,2.55],['coherent.',2.58,3.2]
].map(([word,startSec,endSec], index) => ({ id:`w${index+1}`, word, startSec, endSec }));
aligned.plannedDurationSec = 4.4;
const per = 4.4 / aligned.shots.length;
let cursor = 0;
for (let i=0;i<aligned.shots.length;i++) {
  const shot = aligned.shots[i];
  const duration = i === aligned.shots.length - 1 ? 4.4 - cursor : per;
  shot.editorialStartSec = Number(cursor.toFixed(6));
  shot.editorialDurationSec = Number(duration.toFixed(6));
  shot.trimInSec = 0;
  shot.trimOutSec = Number(duration.toFixed(6));
  cursor += duration;
}
const enriched = enrichManifestV2(aligned);
assert.equal(enriched.audio.speechMap.source, 'actual-audio');
assert.equal(enriched.audio.speechMap.words.length, 8);
assert.equal(enriched.captions.timingSource, 'actual-alignment');
assert.ok(enriched.captions.cues.every(cue => cue.startSec >= 0 && cue.endSec >= cue.startSec));
assert.equal(enriched.qa.gates['QG-TRANSCRIPT-01'].status, 'PASSED');
assert.equal(enriched.qa.gates['QG-CAP-01'].status, 'PASSED');
assert.equal(enriched.continuity.boundaries.length, enriched.shots.length - 1);

const finalAttempt = clone(enriched);
finalAttempt.status = 'AUDITING';
finalAttempt.outputs = { master: { videoUrl:'/api/reels/assets/reels/test/master.mp4', actualDurationSec:4.4, kind:'master', renderedAt:new Date().toISOString() } };
for (const shot of finalAttempt.shots) {
  shot.asset = { videoUrl:`/api/reels/assets/reels/test/${shot.id}.mp4`, actualDurationSec:8 };
  shot.status = 'PASSED';
  shot.qa = { score: 100, warnings: [], failures: [] };
  if (shot.dependsOnShotIds.length) shot.continuityIn.referenceFrameUrl = `/api/reels/assets/reels/test/${shot.id}-ref.png`;
}
const bypassed = auditReelManifest(finalAttempt);
assert.equal(bypassed.passed, true, 'temporary test mode must not block final QA on pending perceptual gates');
assert.equal(bypassed.failures.length, 0, 'bypassed gate failures must not remain blocking failures');
for (const gate of ['QG-PERF-01','QG-LIP-01','QG-EMO-01','QG-BND-01','QG-SEM-01','QG-WHOLE-01']) {
  assert.ok(bypassed.warnings.some(warning => warning.includes('[QA BYPASS]') && warning.includes(gate)), `${gate} must remain observable as bypassed evidence debt`);
}

const brokenBoundary = clone(enriched);
brokenBoundary.continuity.boundaries.pop();
const structuralAudit = auditReelManifest(brokenBoundary);
assert.equal(structuralAudit.passed, true, 'temporary test mode must bypass structural audit blocking');
assert.ok(structuralAudit.warnings.some(warning => warning.includes('[QA BYPASS]') && warning.includes('boundary graph')), 'missing boundary must still be detected and surfaced as bypassed debt');

console.log('Reel Manifest V2 contract tests passed');
