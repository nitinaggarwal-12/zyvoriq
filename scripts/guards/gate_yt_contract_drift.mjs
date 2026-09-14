#!/usr/bin/env node
/**
 * lib/yt/contract.ts is the single source of truth for the YT stage contract,
 * but scripts/*.mjs cannot import a .ts module, so they mirror the constants.
 * Mirrored constants drift. This guard makes drift a build failure instead of
 * a silent contradiction between what the UI claims and what the pipeline does.
 */
import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf-8");

/** Pull a balanced [] or {} literal that follows `name =` and eval it as data. */
function literal(src, name, file) {
  const at = src.search(new RegExp(`(?:export\\s+)?const\\s+${name}\\b`));
  if (at === -1) throw new Error(`${file}: could not find "${name}"`);
  const eq = src.indexOf("=", at);
  let i = eq + 1;
  while (i < src.length && !"[{".includes(src[i])) i++;
  const open = src[i];
  const close = open === "[" ? "]" : "}";
  let depth = 0, end = -1, inStr = null, inLine = false, inBlock = false;
  for (let j = i; j < src.length; j++) {
    const ch = src[j], nx = src[j + 1];
    // Comments first: an apostrophe inside a comment ("Omni's lyrics") must not
    // be mistaken for the start of a string literal.
    if (inLine) { if (ch === "\n") inLine = false; continue; }
    if (inBlock) { if (ch === "*" && nx === "/") { inBlock = false; j++; } continue; }
    if (inStr) { if (ch === inStr && src[j - 1] !== "\\") inStr = null; continue; }
    if (ch === "/" && nx === "/") { inLine = true; j++; continue; }
    if (ch === "/" && nx === "*") { inBlock = true; j++; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close) { depth--; if (depth === 0) { end = j; break; } }
  }
  if (end === -1) throw new Error(`${file}: unbalanced literal for "${name}"`);
  const body = src.slice(i, end + 1)
    .replace(/\/\/[^\n]*/g, "")        // line comments
    .replace(/\/\*[\s\S]*?\*\//g, "")  // block comments
    .replace(/,(\s*[\]}])/g, "$1");    // trailing commas
  return eval(`(${body})`);
}

const CONTRACT = "lib/yt/contract.ts";
const PIPELINE = "scripts/yt_pipeline.mjs";
const AUDIT = "scripts/yt_audit.mjs";
const cSrc = read(CONTRACT), pSrc = read(PIPELINE), aSrc = read(AUDIT);

const problems = [];
const eq = (label, a, b, aFile, bFile) => {
  const sa = JSON.stringify(a), sb = JSON.stringify(b);
  if (sa !== sb) problems.push(`${label} DRIFT\n    ${aFile}: ${sa}\n    ${bFile}: ${sb}`);
  else console.log(`  [pass] ${label} identical in ${aFile} and ${bFile}`);
};

eq("YT_STAGES", literal(cSrc, "YT_STAGES", CONTRACT), literal(pSrc, "YT_STAGES", PIPELINE), CONTRACT, PIPELINE);
eq("YT_STAGE_EXECUTOR", literal(cSrc, "YT_STAGE_EXECUTOR", CONTRACT), literal(pSrc, "YT_STAGE_EXECUTOR", PIPELINE), CONTRACT, PIPELINE);
eq("VEO_DURATION_BUCKETS", literal(cSrc, "VEO_DURATION_BUCKETS", CONTRACT), literal(pSrc, "VEO_DURATION_BUCKETS", PIPELINE), CONTRACT, PIPELINE);
eq("YT_MASTER_SPEC", literal(cSrc, "YT_MASTER_SPEC", CONTRACT), literal(pSrc, "YT_MASTER_SPEC", PIPELINE), CONTRACT, PIPELINE);
eq("YT_MASTER_SPEC", literal(cSrc, "YT_MASTER_SPEC", CONTRACT), literal(aSrc, "YT_MASTER_SPEC", AUDIT), CONTRACT, AUDIT);

// The executor table must never silently invent a model for a deterministic stage.
const exec = literal(cSrc, "YT_STAGE_EXECUTOR", CONTRACT);
const stages = literal(cSrc, "YT_STAGES", CONTRACT);
for (const s of stages) {
  if (!(s in exec)) problems.push(`YT_STAGE_EXECUTOR is missing an entry for stage "${s}"`);
  else if (!String(exec[s]).trim()) problems.push(`YT_STAGE_EXECUTOR["${s}"] is blank`);
}
for (const k of Object.keys(exec)) {
  if (!stages.includes(k)) problems.push(`YT_STAGE_EXECUTOR has orphan stage "${k}" not in YT_STAGES`);
}
if (!problems.length) console.log(`  [pass] executor table covers exactly the ${stages.length} declared stages`);

// Model ids must be consistently fully qualified. A bare id ("gemini-2.5-flash-image")
// next to a qualified one ("models/lyria-3.5") produced a live HTTP 404 at
// ANCHOR_PLATE, because one URL template interpolated the value as-is and
// another prepended "models/". Consistency is now enforced, not remembered.
for (const [stage, model] of Object.entries(exec)) {
  const deterministic = /^deterministic:/.test(model);
  if (deterministic) {
    if (!/\(no model\)/.test(model))
      problems.push(`YT_STAGE_EXECUTOR["${stage}"] is deterministic but does not say "(no model)": ${model}`);
    continue;
  }
  if (!model.startsWith("models/"))
    problems.push(`YT_STAGE_EXECUTOR["${stage}"] must be a fully-qualified id ("models/${model}"), got "${model}"`);
}
if (!problems.length) console.log("  [pass] every executor id is fully qualified or explicitly marked deterministic");

// Hand-built model URLs bypass the normalizer and reintroduce the same bug.
const handBuilt = [...pSrc.matchAll(/generativelanguage\.googleapis\.com\/v1beta\/([^\n`]*)/g)]
  .map((m) => m[1])
  .filter((u) => !u.startsWith("interactions?") && !u.startsWith("${modelPath(") && !u.startsWith("${opName}"));
if (handBuilt.length)
  problems.push(`${PIPELINE} hand-builds ${handBuilt.length} model URL(s) instead of using genUrl(): ${handBuilt.join(" | ")}`);
else console.log("  [pass] all model URLs are built through the genUrl()/modelPath() normalizer");

// pickVeoDuration must agree across both copies.
const pickTs = literal(cSrc, "VEO_DURATION_BUCKETS", CONTRACT);
const pickJs = literal(pSrc, "VEO_DURATION_BUCKETS", PIPELINE);
const pick = (buckets, t) => buckets.find((d) => d >= t - 0.001) ?? buckets[buckets.length - 1];
let bucketMismatch = 0;
for (let t = 0.5; t <= 9; t += 0.1) if (pick(pickTs, t) !== pick(pickJs, t)) bucketMismatch++;
if (bucketMismatch) problems.push(`pickVeoDuration disagrees on ${bucketMismatch} sampled targets`);
else console.log("  [pass] pickVeoDuration agrees across both copies for targets 0.5s..9.0s");

// The audit stage must be genuinely blocking: no hardcoded pass.
const auditFake = /fake the audit|Omni Audit pass|verdict\s*=\s*["']PASS["']\s*;/i.test(aSrc);
if (auditFake) problems.push(`${AUDIT} contains a hardcoded audit verdict`);
else console.log("  [pass] audit module contains no hardcoded verdict");
if (!/process\.exit\(1\)/.test(pSrc)) problems.push(`${PIPELINE} never exits non-zero on audit failure`);
else console.log("  [pass] pipeline exits non-zero when the audit fails");

// The tier map is part of the contract. An arm that silently ran a cheaper Veo
// than it reported would invalidate every comparison in the matrix, and would
// also be a phantom-model attribution in the provenance ledger.
const tierTs = literal(cSrc, "VEO_TIER_MODEL", CONTRACT);
const tierJs = literal(pSrc, "VEO_TIER_MODEL", PIPELINE);
if (JSON.stringify(tierTs) !== JSON.stringify(tierJs)) {
  problems.push(`VEO_TIER_MODEL differs: contract=${JSON.stringify(tierTs)} pipeline=${JSON.stringify(tierJs)}`);
} else {
  console.log(`  [pass] VEO_TIER_MODEL identical in both copies (${Object.keys(tierTs).join(", ")})`);
}
// The default tier must remain the canonical VEO_SHOTS executor.
if (tierTs.full !== literal(cSrc, "YT_STAGE_EXECUTOR", CONTRACT).VEO_SHOTS) {
  problems.push(`VEO_TIER_MODEL.full (${tierTs.full}) does not match YT_STAGE_EXECUTOR.VEO_SHOTS`);
} else {
  console.log("  [pass] VEO_TIER_MODEL.full matches the canonical VEO_SHOTS executor");
}

console.log("");
if (problems.length) {
  console.error(`YT_CONTRACT_DRIFT: FAIL (${problems.length})`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("YT_CONTRACT_DRIFT: PASS");
