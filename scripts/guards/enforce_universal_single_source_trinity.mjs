#!/usr/bin/env node
/**
 * UNIVERSAL SINGLE-SOURCE TRINITY ENFORCER & AUTO-HEALER (v6.3.0)
 * ===============================================================
 * Enforces 100% single-inode symlink & SHA-256 identity across all universal governance pillars:
 *   1. ~/.gemini/config/hooks.json                             (all project/plugin hooks.json -> symlink, including root hooks.json)
 *   2. ~/.gemini/config/hooks.md                               (all project hooks.md -> symlink)
 *   3. ~/.gemini/config/skills.md                              (all project skills.md -> symlink)
 *   4. ~/.gemini/config/skills.json                            (all project skills.json + .datacloud_skills_manifest -> symlink, with live 53-skill SHA-256 sync)
 *   5. ~/.gemini/config/AGENTS.md                              (all project AGENTS.md / GEMINI.md / CLAUDE.md -> symlink; 0 duplicate global GEMINI.md/CLAUDE.md)
 *   6. ~/.gemini/config/rules/*.md                             (all workspace .agents/rules/*.md -> 100% SHA-256 byte-for-byte sync + YAML frontmatter)
 *   7. ~/.gemini/config/skills/<dir>/SKILL.md                  (all workspace .agents/skills/<dir>/SKILL.md -> 100% SHA-256 byte-for-byte sync)
 *   8. ~/.gemini/config/plugins/zyvoriq_guard/plugin.json      (workspace plugins/zyvoriq_guard/plugin.json -> symlink)
 *   9. /Users/nitinagga/Documents/zyvoriq/lib/rules_engine.mjs (plugin lib/rules_engine.mjs copies -> symlink)
 *
 * Also automatically purges any stale shadow backup or static garbage files
 * (*.shadow_backup, *~origin_main, *.bak, ZYVORIQ_COMPLETE_CONSOLIDATED_CONFIG.md, ZYVORIQ_MD_AND_HOOKS_FORENSIC_AUDIT.md).
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
const CUSTOMER_TRACKER_ROOT = fs.existsSync(path.join(HOME, "Documents", "gantry-pulse"))
  ? path.join(HOME, "Documents", "gantry-pulse")
  : path.join(HOME, "Documents", "customer-tracker");
const AUTO_HEAL = process.argv.includes("--auto-heal") || !process.argv.includes("--verify-only");
const SYNC_CLOUDTOP = process.argv.includes("--sync-cloudtop");

const CANONICAL_HOOKS = path.join(HOME, ".gemini", "config", "hooks.json");
const CANONICAL_HOOKS_MD = path.join(HOME, ".gemini", "config", "hooks.md");
const CANONICAL_SKILLS = path.join(HOME, ".gemini", "config", "skills.md");
const CANONICAL_SKILLS_JSON = path.join(HOME, ".gemini", "config", "skills.json");
const CANONICAL_AGENTS = path.join(HOME, ".gemini", "config", "AGENTS.md");
const CANONICAL_PLUGIN = path.join(HOME, ".gemini", "config", "plugins", "zyvoriq_guard", "plugin.json");
const CANONICAL_RULES_ENGINE = path.join(ZYVORIQ_ROOT, "lib", "rules_engine.mjs");
const CANONICAL_SKILLS_DIR = path.join(HOME, ".gemini", "config", "skills");
const CANONICAL_RULES_DIR = path.join(HOME, ".gemini", "config", "rules");

const WORKSPACE_ROOTS = [
  CUSTOMER_TRACKER_ROOT,
  path.join(HOME, "Documents", "PromptCanvas"),
  path.join(HOME, "Documents", "AskAIOCE"),
  path.join(HOME, "Documents", "scorex"),
  path.join(HOME, "Documents", "Demoes-GE"),
  path.join(HOME, "Documents", "blogs"),
  path.join(HOME, "Documents", "skills"),
  path.join(HOME, "Documents", "ideas-mining"),
  ZYVORIQ_ROOT,
].filter((p) => fs.existsSync(p));

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", ".venv", "__pycache__", "scratch", "BMAD-METHOD-main", "generated-repos"]);
const EXEMPT_HOOKS = [/googlecloudtools\.datacloud_telemetry/, /google-slides-design/];
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

function syncRulesAndSkillsAcrossWorkspaces() {
  // 1. Sync all 15 canonical rule files across ~/.gemini/config/rules/*.md and all workspace .agents/rules/*.md
  if (fs.existsSync(CANONICAL_RULES_DIR)) {
    const ruleFiles = fs.readdirSync(CANONICAL_RULES_DIR).filter((f) => f.endsWith(".md"));
    for (const rf of ruleFiles) {
      const canonRule = path.join(CANONICAL_RULES_DIR, rf);
      const targets = [canonRule];
      for (const ws of WORKSPACE_ROOTS) {
        const wsRulesDir = path.join(ws, ".agents", "rules");
        try {
          if (fs.existsSync(wsRulesDir) && !fs.lstatSync(wsRulesDir).isSymbolicLink()) {
            if (fs.realpathSync(wsRulesDir) === fs.realpathSync(CANONICAL_RULES_DIR)) continue;
            targets.push(path.join(wsRulesDir, rf));
          }
        } catch {}
      }
      const existingCandidates = targets.filter((p) => {
        try { return fs.existsSync(p) && !fs.lstatSync(p).isSymbolicLink() && fs.statSync(p).isFile() && fs.statSync(p).size > 0; } catch { return false; }
      });
      if (AUTO_HEAL && existingCandidates.length > 0) {
        existingCandidates.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
        const sourceRule = existingCandidates[0];
        const sourceSha = sha256Full(sourceRule);
        // Ensure canonical ~/.gemini/config/rules/<rf> is ALWAYS a real file (never a symlink) with the latest content
        if (path.resolve(sourceRule) !== path.resolve(canonRule)) {
          let canonIsLink = false;
          try { canonIsLink = fs.lstatSync(canonRule).isSymbolicLink(); } catch {}
          const canonSha = !canonIsLink && fs.existsSync(canonRule) ? sha256Full(canonRule) : "";
          if (canonSha !== sourceSha || canonIsLink) {
            const buf = fs.readFileSync(sourceRule);
            try { fs.rmSync(canonRule, { force: true }); } catch {}
            fs.writeFileSync(canonRule, buf);
          }
        }
        // Symlink all workspace .agents/rules/<rf> (inside non-symlinked .agents/rules dirs) to canonRule so Jetski realpath deduplication prevents 2x rule injection
        for (const targetRule of targets) {
          if (path.resolve(targetRule) === path.resolve(canonRule)) continue;
          try {
            if (fs.lstatSync(path.dirname(targetRule)).isSymbolicLink()) continue;
            if (fs.realpathSync(path.dirname(targetRule)) === fs.realpathSync(CANONICAL_RULES_DIR)) continue;
          } catch {}
          let isAlreadyLinked = false;
          try {
            const st = fs.lstatSync(targetRule);
            if (st.isSymbolicLink() && path.resolve(path.dirname(targetRule), fs.readlinkSync(targetRule)) === path.resolve(canonRule)) {
              isAlreadyLinked = true;
            }
          } catch {}
          if (!isAlreadyLinked) {
            try { fs.rmSync(targetRule, { force: true }); } catch {}
            fs.mkdirSync(path.dirname(targetRule), { recursive: true });
            fs.symlinkSync(canonRule, targetRule);
          }
        }
      }
    }
  }

  // 2. Sync all canonical skills/*/SKILL.md across ~/.gemini/config/skills and workspace .agents/skills/*/SKILL.md
  if (!fs.existsSync(CANONICAL_SKILLS_DIR) || !fs.existsSync(CANONICAL_SKILLS_JSON)) return;
  try {
    const skillEntries = fs.readdirSync(CANONICAL_SKILLS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const dir of skillEntries) {
      const canonSkill = path.join(CANONICAL_SKILLS_DIR, dir.name, "SKILL.md");
      const targets = [canonSkill];
      if (dir.name === "customer-lineage-forensic-guard") {
        targets.push(path.join(CUSTOMER_TRACKER_ROOT, ".local_backup", "SKILL.md"));
      }
      for (const ws of WORKSPACE_ROOTS) {
        const wsSkillsRoot = path.join(ws, ".agents", "skills");
        try {
          if (fs.existsSync(wsSkillsRoot) && !fs.lstatSync(wsSkillsRoot).isSymbolicLink()) {
            const wsSkillFile = path.join(wsSkillsRoot, dir.name, "SKILL.md");
            if (fs.existsSync(wsSkillFile) && fs.realpathSync(wsSkillFile) !== fs.realpathSync(canonSkill)) {
              targets.push(wsSkillFile);
            }
          }
        } catch {}
      }
      const existingCandidates = targets.filter((p) => {
        try { return fs.existsSync(p) && fs.statSync(p).isFile() && fs.statSync(p).size > 0; } catch { return false; }
      });
      if (AUTO_HEAL && existingCandidates.length > 0) {
        existingCandidates.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
        const sourceSkill = existingCandidates[0];
        const sourceSha = sha256Full(sourceSkill);
        for (const targetSkill of targets) {
          if (path.resolve(targetSkill) === path.resolve(sourceSkill)) continue;
          let targetSha = "";
          try { if (fs.existsSync(targetSkill)) targetSha = sha256Full(targetSkill); } catch {}
          if (targetSha !== sourceSha) {
            try { if (fs.lstatSync(targetSkill).isSymbolicLink()) fs.unlinkSync(targetSkill); } catch {}
            fs.mkdirSync(path.dirname(targetSkill), { recursive: true });
            fs.copyFileSync(sourceSkill, targetSkill);
          }
        }
      }
    }

    const parsed = JSON.parse(fs.readFileSync(CANONICAL_SKILLS_JSON, "utf-8"));
    let mutated = false;
    if (parsed.version !== "3.7.0") {
      parsed.version = "3.7.0";
      mutated = true;
    }
    const requiredEntries = [
      { path: "~/.gemini/config/skills" },
      { path: "/Users/nitinagga/Documents/Demoes-GE/enterprise-skills" }
    ];
    if (JSON.stringify(parsed.entries) !== JSON.stringify(requiredEntries)) {
      parsed.entries = requiredEntries;
      mutated = true;
    }
    if (!parsed.skills || typeof parsed.skills !== "object") {
      parsed.skills = {};
      mutated = true;
    }

    const concatChecksums = [];
    for (const dir of skillEntries) {
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

    // Critical Guard: .datacloud_skills_manifest in ~/.gemini/config/skills/ must NEVER be symlinked to skills.json,
    // otherwise googlecloudtools.datacloud's uninstaller.prune() deletes all non-datacloud custom skills on IDE startup!
    const dcManifestPath = path.join(CANONICAL_SKILLS_DIR, ".datacloud_skills_manifest");
    try {
      if (fs.existsSync(dcManifestPath) && fs.lstatSync(dcManifestPath).isSymbolicLink()) {
        fs.unlinkSync(dcManifestPath);
      }
    } catch {}

    // 3. Sync global Jetski workflows (~/.gemini/jetski/global_workflows/*.md) into workspace .agents/workflows/*.md
    const globalWorkflowsDir = path.join(HOME, ".gemini", "jetski", "global_workflows");
    if (AUTO_HEAL && fs.existsSync(globalWorkflowsDir)) {
      const wfFiles = fs.readdirSync(globalWorkflowsDir).filter((f) => f.endsWith(".md")).sort();
      for (const ws of WORKSPACE_ROOTS) {
        if (!fs.existsSync(ws)) continue;
        const wsWfDir = path.join(ws, ".agents", "workflows");
        fs.mkdirSync(wsWfDir, { recursive: true });
        for (const wf of wfFiles) {
          const canonWf = path.join(globalWorkflowsDir, wf);
          const targetWf = path.join(wsWfDir, wf);
          let isLinked = false;
          try {
            const st = fs.lstatSync(targetWf);
            if (st.isSymbolicLink() && path.resolve(path.dirname(targetWf), fs.readlinkSync(targetWf)) === path.resolve(canonWf)) {
              isLinked = true;
            }
          } catch {}
          if (!isLinked) {
            try { fs.rmSync(targetWf, { force: true }); } catch {}
            fs.symlinkSync(canonWf, targetWf);
          }
        }
      }
    }
  } catch {}
}

function purgeShadowGarbage() {
  const purged = [];
  const candidateFiles = [
    ...walk(ZYVORIQ_ROOT, (n) => /\.shadow_backup$|~origin_main$|\.bak(\.v\d+)?$/i.test(n)),
    ...walk(path.join(HOME, ".gemini", "config"), (n) => /\.shadow_backup$|~origin_main$|^hooks\.json\.bak/i.test(n)),
    path.join(ZYVORIQ_ROOT, "ZYVORIQ_COMPLETE_CONSOLIDATED_CONFIG.md"),
    path.join(ZYVORIQ_ROOT, "ZYVORIQ_MD_AND_HOOKS_FORENSIC_AUDIT.md"),
    path.join(ZYVORIQ_ROOT, "public", "assets", "ZYVORIQ_COMPLETE_CONSOLIDATED_CONFIG.md"),
    path.join(ZYVORIQ_ROOT, "public", "assets", "ZYVORIQ_MD_AND_HOOKS_FORENSIC_AUDIT.md"),
    // Enforce zero duplicate global AGENTS.md symlinks in ~/.gemini/config and ~/.gemini (Section 20 of skills.md)
    path.join(HOME, ".gemini", "config", "GEMINI.md"),
    path.join(HOME, ".gemini", "config", "CLAUDE.md"),
    path.join(HOME, ".gemini", "AGENTS.md"),
    path.join(HOME, ".gemini", "GEMINI.md"),
    path.join(HOME, ".gemini", "CLAUDE.md"),
  ];
  for (const f of candidateFiles) {
    let existsOrLink = false;
    try { existsOrLink = Boolean(fs.lstatSync(f)); } catch {}
    if (existsOrLink) {
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
        if (!fs.existsSync(canonicalPath) || fs.statSync(canonicalPath).size === 0) {
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
  syncRulesAndSkillsAcrossWorkspaces();

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

  const hooksMdPaths = [
    path.join(CUSTOMER_TRACKER_ROOT, "hooks.md"),
    path.join(CUSTOMER_TRACKER_ROOT, ".agents", "hooks.md"),
    ...walk(path.join(HOME, "Documents"), (n) => n.toLowerCase() === "hooks.md")
  ];

  const rHooks = enforcePillar("hooks.json", CANONICAL_HOOKS, hooksPaths);
  const rHooksMd = enforcePillar("hooks.md", CANONICAL_HOOKS_MD, hooksMdPaths);
  const rSkills = enforcePillar("skills.md", CANONICAL_SKILLS, skillsPaths);
  const rSkillsJson = enforcePillar("skills.json", CANONICAL_SKILLS_JSON, skillsJsonPaths);
  const rAgents = enforcePillar("AGENTS.md", CANONICAL_AGENTS, agentsPaths);
  const rPlugin = enforcePillar("plugin.json", CANONICAL_PLUGIN, pluginPaths);
  const rRulesEngine = enforcePillar("rules_engine.mjs", CANONICAL_RULES_ENGINE, rulesEnginePaths);
  const rSkillsDir = enforceDirSymlinks("skills_dir", CANONICAL_SKILLS_DIR, skillsDirTargets);

  const results = [rHooks, rHooksMd, rSkills, rSkillsJson, rAgents, rPlugin, rRulesEngine, rSkillsDir];
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
