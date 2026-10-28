import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("app/library/page.tsx", "utf8");

assert.ok(source.includes('data-testid="canonical-library-vault-page"'), "Canonical Library Vault must expose canonical-library-vault-page testid");
assert.ok(source.includes('fetch("/api/library")'), "Canonical Library Vault must hydrate from /api/library");
assert.ok(source.includes("w-full max-w-none"), "Canonical Library Vault must enforce 100% fluid layout (Rule 25G)");
assert.ok(source.includes("/swarm-MUI?reel="), "Canonical Library Vault cards must link directly to Google Stitch Studio (/swarm-MUI?reel=)");
assert.ok(source.includes("/entity/"), "Canonical Library Vault cards must link directly to Canonical Entity Provenance (/entity/)");
assert.ok(source.includes("FeedbackHeaderEmailButton"), "Canonical Library Vault header must include FeedbackHeaderEmailButton (Rule 58)");

console.log("Library direct media actions QA passed");
