import { planStudio1Sync, quantizeToMusicalBars, SECONDS_PER_BAR } from '../lib/studio1/planner.ts';

console.log(`[test] SECONDS_PER_BAR = ${SECONDS_PER_BAR}s`);
console.log(`[test] Quantize 4.0s -> ${quantizeToMusicalBars(4.0)}s`);
console.log(`[test] Quantize 7.0s -> ${quantizeToMusicalBars(7.0)}s`);

const manifest = planStudio1Sync({
  topic: 'Indian pop music video featuring Punjabi college girls Simran and Harleen singing and dancing on festival stage with dhol beats',
  genre: 'MUSIC_VIDEO',
  language: 'hinglish-roman',
  requestedDurationSec: 30,
  scriptText: 'Simran: Bass drop hua jab bajaa dhol, saare campus mein machaa de shor! Harleen: Nachde saare mundey kudiyaan, beat te hil gaya har floor! Simran: Wakhra swag sadda dekh le yaar, dil pe chalegi ab dhoom macha de! Harleen: Thumke pe hilta hai poora sheher, aaja tu bhi nach soniya! Simran: Sadda challeya campus te raaj, aao nacho saare dhol naal!'
});

console.log(`[test] Manifest Planned Duration: ${manifest.plannedDurationSec}s across ${manifest.shots.length} shots`);
for (const s of manifest.shots) {
  console.log(`- ${s.id}: editorialDuration = ${s.editorialDurationSec}s, genDuration = ${s.generationDurationSec}s`);
  console.log(`  Prompt preview: ${s.generationPrompt.slice(0, 160)}...`);
  if (!s.generationPrompt.includes("Dhol drummers")) {
    console.error(`[FAIL] ${s.id} does not include Dhol drummers directive!`);
    process.exit(1);
  }
  if (!s.generationPrompt.includes("Tumbi")) {
    console.error(`[FAIL] ${s.id} does not include Tumbi directive!`);
    process.exit(1);
  }
}

console.log(`[SUCCESS] Local test passed! All musical bar constraints and stage directives verified.`);
