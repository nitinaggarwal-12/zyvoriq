import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY");
  process.exit(1);
}

const USER_PROMPT = "5 min Aishwarya Rai romantic dancing and singing music video with lavish locations";

const systemInstruction = `You are Google Omni, the Master Directorial AI and Executive Music Video Producer for Zyvoriq.
You are processing an executive creator prompt for a 5-minute broadcast-grade romantic Indian cinema music video.

The user prompted: "${USER_PROMPT}"

Your job is to generate 3 DISTINCT, HIGH-CRAFT, CINEMATIC CONCEPT PACKAGES.
Each concept must feel like a multi-million-dollar cinema production with deep cultural, acoustic, and visual grounding.
IMPORTANT POLICY DIRECTIVE: Rather than using a protected living celebrity likeness directly, create a "Classical 90s/2000s Bollywood Cinema Tribute Archetype" (inspired by Devdas/Hum Dil De Chuke Sanam era elegance, hazel-green almond eyes, porcelain radiance, aristocratic poise).

For each concept, provide:
1. conceptId: "concept_1", "concept_2", "concept_3"
2. title: Beautiful poetic title in Hindi/Urdu + English translation
3. logline: 1-sentence evocative cinematic logline
4. location: City / Region (e.g. Udaipur, Dubai, Kashmir, French Riviera)
5. place: The 3 lavish architectural set environments
6. occasionAndMotive: The dramatic reason why she is singing and dancing (e.g. Royal longing, ecstatic declaration of secret love, bittersweet farewell, celebration)
7. musicalDna:
   - genre (e.g. Classical Thumri / Semi-Classical Ghazal / Sufi Electro-Ballad)
   - bpm (e.g. 84, 88, 92)
   - keyAndRaag (e.g. Raag Darbari in D minor, Raag Yaman in G major)
   - instrumentation (e.g. Bansuri, Santoor, Tabla, Sarangi, 40-piece strings)
   - vocalStyle (vocal delivery nuance, breathiness, octave)
   - openingLyrics: 2 poetic lines of Urdu/Hindi lyrics with English meaning
8. performerPersona:
   - tributeArchetype (biometric facial & physical description)
   - danceStyle (e.g. Classical Kathak with chakkars, slow emotive mudras, lyrical contemporary)
9. threeActWardrobeAndSetArc:
   - act1 (0:00 - 1:15): Outfit + Set + Lighting
   - act2 (1:15 - 3:00): Outfit + Set + Lighting
   - act3 (3:00 - 5:00): Outfit + Set + Lighting
10. calculatedAnchorBreakdown: Exact count breakdown (12 character + 8 environment + 4 action = 24)

Return an array of 3 objects in JSON conforming to the schema. Return valid JSON only.`;

async function main() {
  console.log("🎬 [Omni Director] Compiling 3 Cinematic Concept Packages for prompt:", USER_PROMPT);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: "Generate the 3 distinct 5-minute romantic music video production concepts as specified in your instructions. Return valid JSON array only." }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json"
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("API error:", res.status, errText);
    process.exit(1);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  const parsed = JSON.parse(rawText);
  const outPath = path.resolve(process.cwd(), "scratch/aishwarya_romantic_epic_5m/concept_packages.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2));

  console.log(`✅ [Omni Director] 3 Concepts successfully generated and saved to ${outPath}`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
