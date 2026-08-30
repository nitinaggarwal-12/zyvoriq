import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "docs/governance/traceability.json");
const fail = [];

function error(message) {
  fail.push(message);
}

if (!fs.existsSync(registryPath)) {
  console.error("[docs:validate] missing docs/governance/traceability.json");
  process.exit(1);
}

let registry;
try {
  registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
} catch (err) {
  console.error(`[docs:validate] invalid JSON: ${err.message}`);
  process.exit(1);
}

const sections = ["documents", "objectives", "requirements", "components", "releases", "epics", "stories", "qualityGates"];
for (const section of sections) {
  if (!Array.isArray(registry[section])) error(`registry.${section} must be an array`);
}

const allObjects = sections.flatMap(section => (registry[section] || []).map(item => ({ ...item, __section: section })));
const byId = new Map();
for (const obj of allObjects) {
  if (!obj.id || typeof obj.id !== "string") {
    error(`${obj.__section} contains an object without a string id`);
    continue;
  }
  if (byId.has(obj.id)) error(`duplicate id: ${obj.id}`);
  byId.set(obj.id, obj);
}

function requireRefs(ownerId, field, refs) {
  for (const ref of refs || []) {
    if (!byId.has(ref)) error(`${ownerId}.${field} references missing id ${ref}`);
  }
}

for (const doc of registry.documents || []) {
  if (!doc.file) {
    error(`${doc.id} has no file`);
    continue;
  }
  const abs = path.join(root, doc.file);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) error(`${doc.id} references missing document ${doc.file}`);
}

for (const objective of registry.objectives || []) {
  requireRefs(objective.id, "documentId", [objective.documentId]);
}

for (const req of registry.requirements || []) {
  requireRefs(req.id, "documentId", [req.documentId]);
  if (!Array.isArray(req.parentIds) || req.parentIds.length === 0) error(`${req.id} is an orphan requirement (no parentIds)`);
  requireRefs(req.id, "parentIds", req.parentIds);
}

for (const component of registry.components || []) {
  requireRefs(component.id, "documentId", [component.documentId]);
  if (!Array.isArray(component.requirementIds) || component.requirementIds.length === 0) error(`${component.id} is an orphan component (no requirementIds)`);
  requireRefs(component.id, "requirementIds", component.requirementIds);
}

const releaseById = new Map((registry.releases || []).map(r => [r.id, r]));
for (const release of registry.releases || []) {
  requireRefs(release.id, "documentId", [release.documentId]);
  if (!Array.isArray(release.epicIds) || release.epicIds.length === 0) error(`${release.id} has no epics`);
  requireRefs(release.id, "epicIds", release.epicIds);
}

for (const epic of registry.epics || []) {
  requireRefs(epic.id, "documentId", [epic.documentId]);
  requireRefs(epic.id, "releaseId", [epic.releaseId]);
  if (!Array.isArray(epic.requirementIds) || epic.requirementIds.length === 0) error(`${epic.id} is an orphan epic (no requirementIds)`);
  requireRefs(epic.id, "requirementIds", epic.requirementIds);
  requireRefs(epic.id, "dependsOn", epic.dependsOn);
  const release = releaseById.get(epic.releaseId);
  if (release && !release.epicIds.includes(epic.id)) error(`${epic.id} points to ${epic.releaseId}, but release does not include the epic`);
}

for (const story of registry.stories || []) {
  requireRefs(story.id, "epicId", [story.epicId]);
  if (!Array.isArray(story.requirementIds) || story.requirementIds.length === 0) error(`${story.id} is an orphan story (no requirementIds)`);
  requireRefs(story.id, "requirementIds", story.requirementIds);
  requireRefs(story.id, "dependsOn", story.dependsOn);
}

for (const gate of registry.qualityGates || []) {
  const reqs = gate.requirementIds || [];
  const stories = gate.storyIds || [];
  if (reqs.length === 0 && stories.length === 0) error(`${gate.id} is an orphan quality gate`);
  requireRefs(gate.id, "requirementIds", reqs);
  requireRefs(gate.id, "storyIds", stories);
}

// A requirement is traceable when it is refined by a child requirement or mapped to a
// component/epic/story/gate. This lets business requirements sit above functional/NFR work
// without forcing every engineering epic to repeat the business requirement ID.
const mappedRequirements = new Set();
for (const req of registry.requirements || []) for (const id of req.parentIds || []) mappedRequirements.add(id);
for (const component of registry.components || []) for (const id of component.requirementIds || []) mappedRequirements.add(id);
for (const epic of registry.epics || []) for (const id of epic.requirementIds || []) mappedRequirements.add(id);
for (const story of registry.stories || []) for (const id of story.requirementIds || []) mappedRequirements.add(id);
for (const gate of registry.qualityGates || []) for (const id of gate.requirementIds || []) mappedRequirements.add(id);
for (const req of registry.requirements || []) {
  if (!mappedRequirements.has(req.id)) error(`${req.id} has no child requirement or implementation/quality mapping`);
}

const epicStoryCount = new Map((registry.epics || []).map(e => [e.id, 0]));
for (const story of registry.stories || []) {
  if (epicStoryCount.has(story.epicId)) epicStoryCount.set(story.epicId, epicStoryCount.get(story.epicId) + 1);
}
for (const [epicId, count] of epicStoryCount) {
  if (count === 0) error(`${epicId} has no stories`);
}

function validateRelativeMarkdownLinks(file) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) return;
  const text = fs.readFileSync(abs, "utf8");
  const re = /\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = re.exec(text))) {
    let target = match[1].trim();
    if (!target || target.startsWith("#") || /^[a-z]+:\/\//i.test(target) || target.startsWith("mailto:")) continue;
    target = target.split("#")[0].split("?")[0];
    if (!target) continue;
    let decoded = target;
    try { decoded = decodeURIComponent(target); } catch {}
    const resolved = path.resolve(path.dirname(abs), decoded);
    if (!fs.existsSync(resolved)) error(`${file} has broken relative link: ${target}`);
  }
}

validateRelativeMarkdownLinks("docs/INDEX.md");
for (const doc of registry.documents || []) validateRelativeMarkdownLinks(doc.file);

function detectCycles(items, dependencyField) {
  const ids = new Set(items.map(x => x.id));
  const visiting = new Set();
  const visited = new Set();
  function visit(id, stack) {
    if (visiting.has(id)) {
      error(`dependency cycle: ${[...stack, id].join(" -> ")}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    const item = items.find(x => x.id === id);
    for (const dep of item?.[dependencyField] || []) if (ids.has(dep)) visit(dep, [...stack, id]);
    visiting.delete(id);
    visited.add(id);
  }
  for (const item of items) visit(item.id, []);
}

detectCycles(registry.epics || [], "dependsOn");
detectCycles(registry.stories || [], "dependsOn");

if (fail.length) {
  console.error(`\n[docs:validate] FAILED with ${fail.length} issue(s):`);
  for (const issue of fail) console.error(` - ${issue}`);
  process.exit(1);
}

console.log(`[docs:validate] PASS — ${allObjects.length} governed objects; no duplicate IDs, orphan objects, missing dependencies, missing canonical documents, dependency cycles, or broken canonical relative links.`);
