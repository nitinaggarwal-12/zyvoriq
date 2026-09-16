#!/usr/bin/env node
/**
 * Gate: Mandatory Post-Fix Governance Document Synchronization (v5.1.7)
 * Asserts that whenever a root-cause fix or governance rule is codified,
 * all 6 canonical governance/skill files share the exact same version string
 * and stay 100% synchronized.
 */
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();
const HOME_DIR = process.env.HOME || "/Users/nitinagga";

const CANONICAL_FILES = [
  {
    name: "hooks.json (plugin)",
    path: path.join(REPO_ROOT, "plugins/zyvoriq_guard/hooks.json"),
    extractVersion: (text) => {
      const m = text.match(/"version":\s*"([0-9.]+)"/);
      return m ? m[1] : null;
    },
  },
  {
    name: "hooks.json (global config)",
    path: path.join(HOME_DIR, ".gemini/config/hooks.json"),
    extractVersion: (text) => {
      const m = text.match(/"version":\s*"([0-9.]+)"/);
      return m ? m[1] : null;
    },
  },
  {
    name: "GEMINI.md",
    path: path.join(REPO_ROOT, "GEMINI.md"),
    extractVersion: (text) => {
      const m = text.match(/v([0-9]+\.[0-9]+\.[0-9]+)\)/g);
      if (!m || m.length === 0) return null;
      return m[m.length - 1].replace(/[)v]/g, "");
    },
  },
  {
    name: "skills.md (root)",
    path: path.join(REPO_ROOT, "skills.md"),
    extractVersion: (text) => {
      const m = text.match(/v([0-9]+\.[0-9]+\.[0-9]+)\)/g);
      if (!m || m.length === 0) return null;
      return m[m.length - 1].replace(/[)v]/g, "");
    },
  },
  {
    name: "deepmind-video-generation/SKILL.md",
    path: path.join(HOME_DIR, ".gemini/config/skills/deepmind-video-generation/SKILL.md"),
    extractVersion: (text) => {
      const m = text.match(/v([0-9]+\.[0-9]+\.[0-9]+)\)/g);
      if (!m || m.length === 0) return null;
      return m[m.length - 1].replace(/[)v]/g, "");
    },
  },
  {
    name: "deepmind-emotional-audio-engine/SKILL.md",
    path: path.join(HOME_DIR, ".gemini/config/skills/deepmind-emotional-audio-engine/SKILL.md"),
    extractVersion: (text) => {
      const m = text.match(/v([0-9]+\.[0-9]+\.[0-9]+)\)/g);
      if (!m || m.length === 0) return null;
      return m[m.length - 1].replace(/[)v]/g, "");
    },
  },
];

export function auditGovernanceDocSync() {
  const results = [];
  let masterVersion = null;
  const mismatches = [];

  for (const item of CANONICAL_FILES) {
    if (!fs.existsSync(item.path)) {
      mismatches.push(`MISSING: ${item.name} (${item.path})`);
      continue;
    }
    const content = fs.readFileSync(item.path, "utf8");
    const ver = item.extractVersion(content);
    results.push({ name: item.name, version: ver });
    if (!masterVersion && ver) {
      masterVersion = ver;
    } else if (ver !== masterVersion) {
      mismatches.push(`${item.name} is at v${ver || "UNKNOWN"} (expected v${masterVersion})`);
    }
  }

  return {
    passed: mismatches.length === 0,
    masterVersion,
    results,
    mismatches,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = auditGovernanceDocSync();
  if (!report.passed) {
    console.error(`❌ [FAIL: GOVERNANCE_DOC_OUT_OF_SYNC] Master version v${report.masterVersion}`);
    for (const m of report.mismatches) {
      console.error(`   - ${m}`);
    }
    process.exit(1);
  } else {
    console.log(`✅ [PASS: GOVERNANCE_DOC_SYNC] All ${report.results.length} canonical files synchronized at v${report.masterVersion}`);
  }
}
