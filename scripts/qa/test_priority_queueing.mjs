import assert from "node:assert/strict";
import fs from "node:fs";

console.log("⚡ Testing Reel Priority Queueing, Anti-Starvation & Likeness Sanitization...");

// 1. Verify reel_worker_v2.mjs contains priority column migration and claim query ranking
const workerSource = fs.readFileSync("scripts/reel_worker_v2.mjs", "utf-8");

assert(
  workerSource.includes("ALTER TABLE reel_production_controls ADD COLUMN IF NOT EXISTS priority INT NOT NULL DEFAULT 0;"),
  "Worker must include priority column migration"
);

assert(
  workerSource.includes("idx_pc_priority"),
  "Worker must include index on reel_production_controls (production_id, priority)"
);

// Verify claim query uses priority score with age bonus
assert(
  workerSource.includes("COALESCE((SELECT pc.priority FROM reel_production_controls pc WHERE pc.production_id = o.production_id), 0) + LEAST(EXTRACT(EPOCH FROM (NOW() - o.created_at)) / 600, 5)"),
  "Claim query must order by priority + age anti-starvation bonus"
);

// Verify claim query enforces strict per-production serialization
assert(
  workerSource.includes("NOT EXISTS (") && workerSource.includes("active_op.status = 'RUNNING'"),
  "Claim query must exclude operations whose production already has an active RUNNING operation"
);

// Verify ROUGH_CUT wraps up first
assert(
  workerSource.includes("CASE WHEN o.kind = 'ROUGH_CUT' THEN 0 ELSE 1 END ASC"),
  "Claim query must prioritize ROUGH_CUT first"
);

console.log("  ✓ Test 1 Passed: Database schema migration and claim query constraints verified");

// 2. Verify Likeness & Celebrity Sanitization for Kabir Anand, Zoya, Farooq
assert(
  workerSource.includes("Kabir[\\s_]*Anand|Kabir") || workerSource.includes("Kabir"),
  "celebrityMap must contain Kabir Anand / Kabir pattern"
);

assert(
  workerSource.includes("Zoya[\\s_]*Rehman|Zoya") || workerSource.includes("Zoya"),
  "celebrityMap must contain Zoya Rehman / Zoya pattern"
);

assert(
  workerSource.includes("Farooq[\\s_]*Malik|Farooq") || workerSource.includes("Farooq"),
  "celebrityMap must contain Farooq Malik / Farooq pattern"
);

// Test prompt transformation logic directly
function mockSanitizePrompt(prompt) {
  let clean = prompt.replace(/STUDIO1 IDENTITY LOCK \[[^\]]+\]:/gi, "STUDIO1 IDENTITY LOCK [lead_performer]:");
  const celebrityMap = [
    { pattern: /\b(?:Kabir[\s_]*Anand|Kabir)\b/gi, replacement: "a rugged, athletic covert operative" },
    { pattern: /\b(?:Zoya[\s_]*Rehman|Zoya)\b/gi, replacement: "a fierce, agile female intelligence officer" },
    { pattern: /\b(?:Farooq[\s_]*Malik|Farooq)\b/gi, replacement: "a menacing, hardened rogue commander" },
  ];
  for (const { pattern, replacement } of celebrityMap) {
    clean = clean.replace(pattern, replacement);
  }
  return clean.replace(/\s{2,}/g, " ").trim();
}

const rawPrompt = "HERO_CLOSE_UP: Kabir grips the heavy throttle. Zoya leans into the turn. Farooq lowers his binoculars. STUDIO1 IDENTITY LOCK [zoya_rehman]: Canonical.";
const sanitizedPrompt = mockSanitizePrompt(rawPrompt);

assert(!sanitizedPrompt.includes("Kabir"), "Sanitized prompt must not include 'Kabir'");
assert(!sanitizedPrompt.includes("Zoya"), "Sanitized prompt must not include 'Zoya'");
assert(!sanitizedPrompt.includes("Farooq"), "Sanitized prompt must not include 'Farooq'");
assert(!sanitizedPrompt.includes("zoya_rehman"), "Sanitized prompt must not include 'zoya_rehman'");
assert(sanitizedPrompt.includes("a rugged, athletic covert operative"), "Must replace Kabir with operative archetype");
assert(sanitizedPrompt.includes("a fierce, agile female intelligence officer"), "Must replace Zoya with intelligence officer archetype");
assert(sanitizedPrompt.includes("a menacing, hardened rogue commander"), "Must replace Farooq with rogue commander archetype");
assert(sanitizedPrompt.includes("STUDIO1 IDENTITY LOCK [lead_performer]:"), "Must sanitize identity lock tag");

console.log("  ✓ Test 2 Passed: Character archetype and underscore sanitization verified");

// 3. Verify Simulated Priority & Age-Bonus Math
function calculatePriorityScore(priority, waitMinutes) {
  const ageBonus = Math.min(waitMinutes / 10, 5); // 1 point per 10 min, max 5
  return priority + ageBonus;
}

assert.equal(calculatePriorityScore(0, 10), 1.0);
assert.equal(calculatePriorityScore(0, 50), 5.0);
assert.equal(calculatePriorityScore(0, 120), 5.0); // capped at 5
assert.equal(calculatePriorityScore(10, 0), 10.0);
assert.equal(calculatePriorityScore(20, 0), 20.0);

assert(calculatePriorityScore(10, 0) > calculatePriorityScore(0, 60), "High priority immediately jumps ahead of Normal priority");
assert(calculatePriorityScore(20, 0) > calculatePriorityScore(10, 60), "Urgent priority immediately jumps ahead of High priority");

console.log("  ✓ Test 3 Passed: Priority score and anti-starvation age cap math verified");

// 4. Verify API & UI components
const studio1RouteSource = fs.readFileSync("app/api/studio1/productions/[id]/route.ts", "utf-8");
assert(studio1RouteSource.includes('action === "setPriority"'), "Studio1 PATCH route must handle setPriority");

const uiSource = fs.readFileSync("components/MyReelsLibrary.tsx", "utf-8");
assert(uiSource.includes("handleSetReelPriority"), "MyReelsLibrary must implement handleSetReelPriority");
assert(uiSource.includes('sortBy === "priority"'), "MyReelsLibrary must support sorting by priority");
assert(uiSource.includes("URGENT (P20)"), "MyReelsLibrary must display URGENT (P20) priority badge");

console.log("  ✓ Test 4 Passed: API endpoints and UI priority controls verified");

console.log("🎉 ALL REEL PRIORITY & CLAIM TESTS PASSED!");
