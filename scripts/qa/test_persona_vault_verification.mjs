import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { PRESET_PERSONAS } from "../../lib/reel/personas.ts";
import { buildPrompt } from "../studio1_native.mjs";

console.log("==========================================================");
console.log("🧬 PHASE 1 VERIFICATION: PERSONA & AVATAR VAULT TEST SUITE");
console.log("==========================================================");

// [Test 1] Preset Personas Schema & Integrity
console.log("\n[Test 1] Testing Preset Personas Integrity:");
assert.ok(PRESET_PERSONAS.length >= 4, "Must provide at least 4 flagship personas");
for (const p of PRESET_PERSONAS) {
  assert.ok(p.id, "Persona must have an ID");
  assert.ok(p.name, "Persona must have a name");
  assert.ok(p.role, "Persona must have a role");
  assert.ok(p.promptDescription.length > 20, `Prompt description for ${p.name} must be descriptive`);
  assert.ok(p.voiceTimbre?.pitch, `Voice timbre must define pitch for ${p.name}`);
  console.log(`  ✓ Persona Verified: ${p.name} (${p.role})`);
}

// [Test 2] Prompt Directives Integration with Veo Engine
console.log("\n[Test 2] Testing Persona Prompt Injection with Veo Continuous Engine:");
const customPersona = {
  id: "custom_founder_1",
  name: "Nitin (Executive Studio)",
  role: "AI Architect",
  promptDescription: "A focused technology executive in a dark tailored blazer, warm studio rim lighting, modern glass office background, looking directly into camera."
};

const basePrompt = buildPrompt({
  character: customPersona.promptDescription,
  tone: "Authoritative & visionary",
  line: "Autonomous AI orchestration is transforming software delivery.",
  isExtension: false
});

assert.ok(basePrompt.includes(customPersona.promptDescription), "Base prompt must include exact persona prompt directive");
assert.ok(basePrompt.includes('"Autonomous AI orchestration is transforming software delivery."'), "Spoken line must be wrapped in dialogue quotation");
console.log("  ✓ Base prompt injection verified with custom persona anchor.");

const extPrompt = buildPrompt({
  character: customPersona.promptDescription,
  tone: "Authoritative & visionary",
  line: "Here is the architectural pattern that makes it mathematically guaranteed.",
  isExtension: true
});

assert.ok(extPrompt.includes("The same person continues speaking in the same voice"), "Extension prompt must enforce continuity wording");
assert.ok(extPrompt.includes(customPersona.promptDescription), "Extension prompt must retain full persona anchor");
console.log("  ✓ Extension seam continuity verified with custom persona anchor.");

console.log("\n==========================================================");
console.log("🌟 PHASE 1: PERSONA & AVATAR VAULT VALIDATION PASSED 100%");
console.log("==========================================================");
