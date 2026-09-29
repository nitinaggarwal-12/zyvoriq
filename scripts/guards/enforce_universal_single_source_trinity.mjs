#!/usr/bin/env node
/**
 * UNIVERSAL SINGLE-SOURCE TRINITY ENFORCER & AUTO-HEALER (v6.2.0)
 * ===============================================================
 * Enforces 100% single-inode symlink identity across all universal governance pillars:
 *   1. ~/.gemini/config/hooks.json                             (all project/plugin hooks.json -> symlink, including root hooks.json)
 *   2. ~/.gemini/config/skills.md                              (all project skills.md -> symlink)
 *   3. ~/.gemini/config/skills.json                            (all project skills.json + .datacloud_skills_manifest -> symlink, with live 52-skill SHA-256 sync)
 *   4. ~/.gemini/config/AGENTS.md                              (all project AGENTS.md / GEMINI.md / CLAUDE.md -> symlink)
 *   5. ~/.gemini/config/plugins/zyvoriq_guard/plugin.json      (workspace plugins/zyvoriq_guard/plugin.json -> symlink)
 *   6. /Users/nitinagga/Documents/zyvoriq/lib/rules_engine.mjs (plugin lib/rules_engine.mjs copies -> symlink)
 *   7. ~/.gemini/config/skills                                 (workspace skills/ & .agents/skills -> directory symlink, safely merging local skills first)
 *
 * Also automatically purges any stale shadow backup or static garbage files
 * (*.shadow_backup, *~origin_main, *.bak*, ZYVORIQ_COMPLETE_CONSOLIDATED_CONFIG.md, ZYVORIQ_MD_AND_HOOKS_FORENSIC_AUDIT.md).
 *
 * USAGE:
 *   node scripts/guards/enforce_universal_single_source_trinity.mjs --auto-heal
 *   node scripts/guards/enforce_universal_single_source_trinity.mjs --verify-only
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";

const HOME = os.homedir();
const ZYVORIQ_ROOT = path.join(HOME, "Documents", "zyvoriq");
const CUSTOMER_TRACKER_ROOT = path.join(HOME, "Documents", "customer-tracker");
const AUTO_HEAL = process.argv.includes("--auto-heal") || !process.argv.includes("--verify-only");
const SYNC_CLOUDTOP = process.argv.includes("--sync-cloudtop");

const CANONICAL_HOOKS = path.join(HOME, ".gemini", "config", "hooks.json");
const CANONICAL_SKILLS = path.join(HOME, ".gemini", "config", "skills.md");
const CANONICAL_SKILLS_JSON = path.join(HOME, ".gemini", "config", "skills.json");
const CANONICAL_AGENTS = path.join(HOME, ".gemini", "config", "AGENTS.md");
const CANONICAL_PLUGIN = path.join(HOME, ".gemini", "config", "plugins", "zyvoriq_guard", "plugin.json");
const CANONICAL_RULES_ENGINE = path.join(ZYVORIQ_ROOT, "lib", "rules_engine.mjs");
const CANONICAL_SKILLS_DIR = path.join(HOME, ".gemini", "config", "skills");

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", ".venv", "__pycache__", "scratch", "BMAD-METHOD-main"]);
const EXEMPT_HOOKS = [/googlecloudtools\.datacloud_telemetry/];
const EXEMPT_SKILLS = [/\.gemini\/(antigravity|antigravity-ide|jetski)\/builtin\/skills\//];
const GOV_NAMES = new Set(["agents.md", "gemini.md", "claude.md"]);

function sha256Full(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function sha16(filePath) {
  return sha256Full(filePath).slice(0, 16);
}

function walk(dir, predicate, out = [], depth = 0) {
  if (depth > 5) return out;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(full, predicate, out, depth + 1);
    } else if (predicate(e.name, full)) {
      out.push(full);
    }
  }
  return out;
}

function syncSkillsJsonManifest() {
  if (!fs.existsSync(CANONICAL_SKILLS_DIR) || !fs.existsSync(CANONICAL_SKILLS_JSON)) return;
  try {
    const parsed = JSON.parse(fs.readFileSync(CANONICAL_SKILLS_JSON, "utf-8"));
    let mutated = false;
    if (parsed.version !== "3.5.0") {
      parsed.version = "3.5.0";
      mutated = true;
    }
    const entries = fs.readdirSync(CANONICAL_SKILLS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name));

    const concatChecksums = [];
    for (const dir of entries) {
      const skillFile = path.join(CANONICAL_SKILLS_DIR, dir.name, "SKILL.md");
      if (!fs.existsSync(skillFile)) continue;
      const sum = sha256Full(skillFile);
      concatChecksums.push(`${dir.name}:${sum}`);
      if (!parsed.skills[dir.name] || parsed.skills[dir.name].checksum !== sum) {
        parsed.skills[dir.name] = {
          status: "installed",
          disabled: false,
          error: null,
          checksum: sum,
          canonicalPath: `skills/${dir.name}/SKILL.md`
        };
        mutated = true;
      }
    }
    const newBundleSum = crypto.createHash("sha256").update(concatChecksums.join("\n")).digest("hex");
    if (parsed.bundleChecksum !== newBundleSum) {
      parsed.bundleChecksum = newBundleSum;
      mutated = true;
    }
    if (mutated && AUTO_HEAL) {
      parsed.updatedAt = new Date().toISOString();
      fs.writeFileSync(CANONICAL_SKILLS_JSON, JSON.stringify(parsed, null, 2) + "\n", "utf-8");
    }
  } catch {}
}

function purgeShadowGarbage() {
  const purged = [];
  const candidateFiles = [
    ...walk(ZYVORIQ_ROOT, (n) => /\.shadow_backup$|~origin_main$|\.bak(\.v\d+)?$/i.test(n)),
    ...walk(path.join(HOME, ".gemini", "config"), (n) => /\.shadow_backup$|~origin_main$|^hooks\.json\.bak/i.test(n)),
    path.join(ZYVORIQ_ROOT, "ZYVORIQ_COMPLETE_CONSOLIDATED_CONFIG.md"),
    path.join(ZYVORIQ_ROOT, "ZYVORIQ_MD_AND_HOOKS_FORENSIC_AUDIT.md")
  ];
  for (const f of candidateFiles) {
    if (fs.existsSync(f)) {
      if (AUTO_HEAL) {
        try {
          fs.rmSync(f, { force: true });
          purged.push(f);
        } catch {}
      } else {
        purged.push(f);
      }
    }
  }
  const staleDirs = [
    path.join(HOME, ".gemini", "config", "hooks_backups_20260912_034509"),
    path.join(ZYVORIQ_ROOT, "scratch", "zyvoriq_config_bundle_staging")
  ];
  for (const d of staleDirs) {
    if (fs.existsSync(d)) {
      if (AUTO_HEAL) {
        try {
          fs.rmSync(d, { recursive: true, force: true });
          purged.push(d);
        } catch {}
      } else {
        purged.push(d);
      }
    }
  }
  return purged;
}

function enforcePillar(name, canonicalPath, foundPaths) {
  let linked = 0;
  let healed = 0;
  const offenders = [];

  const canonicalMtime = fs.existsSync(canonicalPath) ? fs.statSync(canonicalPath).mtimeMs : 0;
  const uniquePaths = [...new Set(foundPaths)];

  for (const p of uniquePaths) {
    if (path.resolve(p) === path.resolve(canonicalPath)) continue;
    let st = null;
    try { st = fs.lstatSync(p); } catch {}

    const isLink = st ? st.isSymbolicLink() : false;
    const target = isLink ? path.resolve(path.dirname(p), fs.readlinkSync(p)) : null;

    if (isLink && target === path.resolve(canonicalPath)) {
      linked++;
      continue;
    }

    if (!AUTO_HEAL) {
      offenders.push(p);
      continue;
    }

    if (st && !isLink && st.isFile() && st.size > 0) {
      const localSha = sha16(p);
      const canonSha = fs.existsSync(canonicalPath) ? sha16(canonicalPath) : "";
      if (localSha !== canonSha) {
        const backupDir = "/tmp/trinity_backups";
        fs.mkdirSync(backupDir, { recursive: true });
        const backupFile = path.join(backupDir, path.basename(p) + "." + Date.now() + ".bak");
        fs.copyFileSync(p, backupFile);
        if (st.mtimeMs >= canonicalMtime) {
          fs.copyFileSync(p, canonicalPath);
        }
      }
    }
    if (st) fs.rmSync(p, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.symlinkSync(canonicalPath, p);
    healed++;
    linked++;
  }

  return {
    pillar: name,
    canonical: canonicalPath,
    sha256: fs.existsSync(canonicalPath) && fs.statSync(canonicalPath).isFile() ? sha16(canonicalPath) : "dir",
    linked,
    healed,
    offenders
  };
}

function enforceDirSymlinks(name, canonicalDir, targetDirs) {
  let linked = 0;
  let healed = 0;
  const offenders = [];

  for (const p of targetDirs) {
    let st = null;
    try { st = fs.lstatSync(p); } catch {}
    const isLink = st ? st.isSymbolicLink() : false;
    const target = isLink ? path.resolve(path.dirname(p), fs.readlinkSync(p)) : null;

    if (isLink && target === path.resolve(canonicalDir)) {
      linked++;
      continue;
    }
    if (!AUTO_HEAL) {
      offenders.push(p);
      continue;
    }
    // Safely preserve any local skill folders into canonicalDir before replacing directory with symlink
    if (st && !isLink && st.isDirectory()) {
      try {
        for (const sub of fs.readdirSync(p, { withFileTypes: true })) {
          const subPath = path.join(p, sub.name);
          const destPath = path.join(canonicalDir, sub.name);
          if (sub.isDirectory() && !fs.existsSync(destPath)) {
            fs.cpSync(subPath, destPath, { recursive: true });
          }
        }
      } catch {}
    }
    if (st) fs.rmSync(p, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.symlinkSync(canonicalDir, p);
    healed++;
    linked++;
  }

  return {
    pillar: name,
    canonical: canonicalDir,
    sha256: "directory-symlink",
    linked,
    healed,
    offenders
  };
}

function main() {
  const purgedGarbage = purgeShadowGarbage();
  syncSkillsJsonManifest();

  const hooksPaths = [
    path.join(ZYVORIQ_ROOT, "hooks.json"),
    path.join(ZYVORIQ_ROOT, ".agents", "hooks.json"),
    path.join(ZYVORIQ_ROOT, "plugins", "zyvoriq_guard", "hooks.json"),
    path.join(CUSTOMER_TRACKER_ROOT, "hooks.json"),
    path.join(CUSTOMER_TRACKER_ROOT, ".agents", "hooks.json"),
    path.join(CUSTOMER_TRACKER_ROOT, ".gemini", "hooks.json"),
    ...walk(path.join(HOME, "Documents"), (n, full) => n === "hooks.json" && !EXEMPT_HOOKS.some(rx => rx.test(full))),
    ...walk(path.join(HOME, ".gemini", "config", "plugins"), (n, full) => n === "hooks.json" && !EXEMPT_HOOKS.some(rx => rx.test(full)))
  ];

  const skillsPaths = [
    path.join(ZYVORIQ_ROOT, "skills.md"),
    path.join(CUSTOMER_TRACKER_ROOT, "skills.md"),
    path.join(CUSTOMER_TRACKER_ROOT, ".agents", "skills.md"),
    ...walk(path.join(HOME, "Documents"), (n, full) => n.toLowerCase() === "skills.md" && !EXEMPT_SKILLS.some(rx => rx.test(full)))
  ];

  const skillsJsonPaths = [
    path.join(ZYVORIQ_ROOT, "skills.json"),
    path.join(CUSTOMER_TRACKER_ROOT, "skills.json"),
    path.join(CUSTOMER_TRACKER_ROOT, ".agents", "skills.json"),
    path.join(CANONICAL_SKILLS_DIR, ".datacloud_skills_manifest"),
    ...walk(path.join(HOME, "Documents"), (n) => n.toLowerCase() === "skills.json")
  ];

  const agentsPaths = [
    path.join(ZYVORIQ_ROOT, "AGENTS.md"),
    path.join(ZYVORIQ_ROOT, "GEMINI.md"),
    path.join(ZYVORIQ_ROOT, "CLAUDE.md"),
    path.join(ZYVORIQ_ROOT, ".agents", "AGENTS.md"),
    path.join(CUSTOMER_TRACKER_ROOT, "AGENTS.md"),
    path.join(CUSTOMER_TRACKER_ROOT, "GEMINI.md"),
    path.join(CUSTOMER_TRACKER_ROOT, "CLAUDE.md"),
    path.join(CUSTOMER_TRACKER_ROOT, ".agents", "AGENTS.md"),
    ...walk(path.join(HOME, "Documents"), (n) => GOV_NAMES.has(n.toLowerCase()))
  ];

  const pluginPaths = [
    path.join(ZYVORIQ_ROOT, "plugins", "zyvoriq_guard", "plugin.json")
  ];

  const rulesEnginePaths = [
    path.join(ZYVORIQ_ROOT, "plugins", "zyvoriq_guard", "lib", "rules_engine.mjs"),
    path.join(HOME, ".gemini", "config", "plugins", "zyvoriq_guard", "lib", "rules_engine.mjs")
  ];

  const skillsDirTargets = [
    path.join(ZYVORIQ_ROOT, "skills"),
    path.join(ZYVORIQ_ROOT, ".agents", "skills")
  ];

  const rHooks = enforcePillar("hooks.json", CANONICAL_HOOKS, hooksPaths);
  const rSkills = enforcePillar("skills.md", CANONICAL_SKILLS, skillsPaths);
  const rSkillsJson = enforcePillar("skills.json", CANONICAL_SKILLS_JSON, skillsJsonPaths);
  const rAgents = enforcePillar("AGENTS.md", CANONICAL_AGENTS, agentsPaths);
  const rPlugin = enforcePillar("plugin.json", CANONICAL_PLUGIN, pluginPaths);
  const rRulesEngine = enforcePillar("rules_engine.mjs", CANONICAL_RULES_ENGINE, rulesEnginePaths);
  const rSkillsDir = enforceDirSymlinks("skills_dir", CANONICAL_SKILLS_DIR, skillsDirTargets);

  const results = [rHooks, rSkills, rSkillsJson, rAgents, rPlugin, rRulesEngine, rSkillsDir];
  const totalOffenders = results.reduce((acc, r) => acc + r.offenders.length, 0) + (!AUTO_HEAL ? purgedGarbage.length : 0);

  if (SYNC_CLOUDTOP) {
    try {
      execSync(
        `scp -q -o ConnectTimeout=2 "${CANONICAL_HOOKS}" "${CANONICAL_SKILLS}" "${CANONICAL_SKILLS_JSON}" "${CANONICAL_AGENTS}" nitinagga.c.googlers.com:~/.gemini/config/`,
        { stdio: "ignore", timeout: 8000 }
      );
    } catch {}
  }

  console.log(JSON.stringify({ status: totalOffenders === 0 ? "PASS" : "FAIL", purgedGarbage, results }, null, 2));
  process.exit(totalOffenders === 0 ? 0 : 1);
}

main();
