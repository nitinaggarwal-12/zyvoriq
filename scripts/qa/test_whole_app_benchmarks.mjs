import { runWholeAppEvaluation } from '../../lib/evals/comprehensiveAppEvalEngine.ts';

console.log('🧪 Starting 40-Point Whole-App Continuous Evaluation & Benchmarking Suite...\n');

const report = runWholeAppEvaluation();

console.log(`====================================================================`);
console.log(`📊 WHOLE-APP EVALUATION REPORT [Run ID: ${report.evalRunId}]`);
console.log(`====================================================================`);
console.log(`⭐ Overall App Quality Score:   ${report.overallAppQualityScore} / 100`);
console.log(`📈 Improvement vs Baseline v1:  +${report.totalGainedScorePct}%`);
console.log(`🛡️ Zero-Tolerance Invariants:    ${report.zeroToleranceInvariantsPassed ? 'PASSED (0 Regressions)' : 'FAILED'}`);
console.log(`⚡ Average Pipeline Latency:    ${report.averageLatencyMs} ms`);
console.log(`💰 Estimated Cost Per Output:   $${report.totalCostEstimateUsd}`);
console.log(`🎯 Total Tests Run / Passed:    ${report.totalTestsPassed} / ${report.totalTestsRun}\n`);

let failed = false;

for (const pillar of report.pillarReports) {
  console.log(`👉 [${pillar.status}] ${pillar.pillarName}: ${pillar.overallScore}/100 (+${pillar.scoreDeltaPercent}%)`);
  for (const m of pillar.metrics) {
    console.log(`   - ${m.name}: ${m.score}/100 [${m.status}] (${m.details})`);
    if (m.status === 'FAIL') failed = true;
  }
}

console.log('\n====================================================================');
if (failed || !report.zeroToleranceInvariantsPassed) {
  console.error('❌ EVALUATION FAILED: Regressions or invariant violations detected.');
  process.exit(1);
} else {
  console.log('🎉 ALL 40 WHOLE-APP BENCHMARK TESTS PASSED WITH 0 REGRESSIONS!');
  process.exit(0);
}
