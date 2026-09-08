import fs from "fs";

let key = process.env.GEMINI_API_KEY;
for (const envFile of [".env.local", ".env", ".env.production"]) {
  if (!key && fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf8");
    const match = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (match) key = match[1].trim().replace(/^["']|["']$/g, "");
  }
}

if (!key) {
  console.error("No GEMINI_API_KEY found");
  process.exit(1);
}

const promptWithMeera = "ESTABLISHING_WIDE: Meera raises her carved drumsticks overhead, striking the decorated dholak with explosive power as brass horn players assemble behind her.";
const promptWithDrummer = "ESTABLISHING_WIDE: The drummer raises her carved drumsticks overhead, striking the decorated dholak with explosive power as brass horn players assemble behind her.";

async function testPrompt(p, label) {
  const model = "veo-3.1-generate-preview";
  console.log(`\nDispatching ${label}...`);
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      instances: [{ prompt: p }],
      parameters: { aspectRatio: "9:16", durationSeconds: 4, sampleCount: 1 }
    })
  });
  const json = await res.json();
  console.log(`=== ${label} ===`);
  console.log("HTTP status:", res.status);
  console.log("Response:", JSON.stringify(json, null, 2));
  return json;
}

const op1 = await testPrompt(promptWithMeera, "WITH MEERA");
const op2 = await testPrompt(promptWithDrummer, "WITH THE DRUMMER");

async function pollOp(name, label) {
  if (!name) return;
  console.log(`Polling ${label} (${name})...`);
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 6000));
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${name}?key=${key}`);
    const json = await res.json();
    if (json.done) {
      console.log(`\n=== RESULT FOR ${label} ===`);
      console.log(JSON.stringify(json, null, 2));
      return;
    }
    process.stdout.write(".");
  }
}

if (op1.name) await pollOp(op1.name, "WITH MEERA");
if (op2.name) await pollOp(op2.name, "WITH THE DRUMMER");
