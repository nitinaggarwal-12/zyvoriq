import fs from "node:fs";
import path from "node:path";
import { generateVeoVideoBytes } from "../lib/ai/veoService.ts";

// Load .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const ON_CAMERA_TALKING_ACTS = [
  {
    act: 1,
    file: "public/assets/swarm/veo_talking_act1.mp4",
    spokenLine: "Look at this flour. Before the fire, before the stone, everything begins right here in Naples.",
    prompt:
      'Cinematic 16:9 medium close-up in a warm Neapolitan brick bakery, charismatic Italian Master Pizzaiolo with a silver-streaked beard wearing a flour-dusted linen apron, looking directly into the camera lens while tossing fine white flour onto a marble table, speaking passionately aloud to the camera with clear lip movement and expressive Italian hand gestures, saying: "Look at this flour. Before the fire, before the stone, everything begins right here in Naples." Warm 2200K wood-fired oven glow in background, 35mm film.',
  },
  {
    act: 2,
    file: "public/assets/swarm/veo_talking_act2.mp4",
    spokenLine: "We let this dough rest for seventy-two hours. Patience is the only secret ingredient I trust.",
    prompt:
      'Cinematic 16:9 medium shot in a warm Neapolitan bakery, charismatic Italian Master Pizzaiolo with a silver-streaked beard pressing and stretching 72-hour fermented blistered sourdough on a flour-dusted marble counter, looking up directly at the camera and speaking aloud with clear lip movement and warm expression, saying: "We let this dough rest for seventy-two hours. Patience is the only secret ingredient I trust." Warm wood-fire lighting, 35mm film.',
  },
  {
    act: 3,
    file: "public/assets/swarm/veo_talking_act3.mp4",
    spokenLine: "I crush these volcanic San Marzano tomatoes by hand so a metal blade never touches the sweetness.",
    prompt:
      'Cinematic 16:9 medium close-up in a Neapolitan kitchen, charismatic Italian Master Pizzaiolo with a silver-streaked beard crushing ruby-red San Marzano tomatoes by hand into a copper bowl, looking directly at the camera and speaking aloud with clear lip movement and a proud smile, saying: "I crush these volcanic San Marzano tomatoes by hand so a metal blade never touches the sweetness." Rich red tomato juice splashing, fresh basil leaves, warm lighting, 35mm film.',
  },
  {
    act: 4,
    file: "public/assets/swarm/veo_talking_act4.mp4",
    spokenLine: "Now into nine hundred degrees of Vesuvian oak fire. Sixty seconds is all it takes.",
    prompt:
      'Cinematic 16:9 medium shot in front of a roaring Neapolitan brick wood-fired pizza oven, charismatic Italian Master Pizzaiolo with a silver-streaked beard holding a hammered copper peel with a Neapolitan pizza, turning his head to look directly at the camera and speaking aloud with clear lip movement over the glowing flames, saying: "Now into nine hundred degrees of Vesuvian oak fire. Sixty seconds is all it takes." Golden flames curling inside oven, 35mm film.',
  },
  {
    act: 5,
    file: "public/assets/swarm/veo_talking_act5.mp4",
    spokenLine: "Listen to that crust crackle. Look how the cornicione blisters like a leopard in the flame.",
    prompt:
      'Cinematic 16:9 close-up shot beside the glowing brick pizza oven opening, warm orange firelight illuminating the face of the charismatic Italian Master Pizzaiolo with a silver-streaked beard as he gestures toward the blistering pizza inside the flames, looking directly into the camera lens and speaking aloud with clear lip movement, saying: "Listen to that crust crackle. Look how the cornicione blisters like a leopard in the flame." Warm firelight, 35mm film.',
  },
  {
    act: 6,
    file: "public/assets/swarm/veo_talking_act6.mp4",
    spokenLine: "No shortcuts, no compromises. This is The Cathedral of Crust. Buon appetito!",
    prompt:
      'Cinematic 16:9 medium hero shot in a warm Neapolitan brick bakery, charismatic Italian Master Pizzaiolo with a silver-streaked beard holding a steaming, crispy leopard-spotted Margherita pizza on a wooden board, drizzling golden extra virgin olive oil over fresh basil while looking directly into the camera lens and speaking aloud with clear lip movement and warm pride, saying: "No shortcuts, no compromises. This is The Cathedral of Crust. Buon appetito!" Warm 2200K lighting, 35mm film.',
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateTalkingActWithRetry(item, maxRetries = 4) {
  const outPath = path.join(process.cwd(), item.file);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 500_000) {
    console.log(`[Act ${item.act}] Already exists (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB), skipping.`);
    return outPath;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Act ${item.act}] (Attempt ${attempt}/${maxRetries}) Generating On-Camera Speaking & Lip-Sync Veo 3.1 clip...`);
      const res = await generateVeoVideoBytes(item.prompt, {
        aspectRatio: "16:9",
        durationSeconds: 6,
        modelTier: "fast",
      });
      fs.writeFileSync(outPath, res.buffer);
      console.log(`✅ [Act ${item.act}] COMPLETED! Saved ${outPath} (${(res.buffer.length / 1024 / 1024).toFixed(2)} MB)`);
      await sleep(2000);
      return outPath;
    } catch (err) {
      console.warn(`⚠️ [Act ${item.act}] Attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxRetries) {
        await sleep(4000 * attempt);
      } else {
        throw err;
      }
    }
  }
}

async function main() {
  console.log("=== Generating All 6 On-Camera Speaking & Lip-Sync Acts via Google Veo 3.1 ===");
  for (const item of ON_CAMERA_TALKING_ACTS) {
    await generateTalkingActWithRetry(item);
  }
  console.log("=== ALL 6 ON-CAMERA SPEAKING ACTS GENERATED SUCCESSFULLY! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
