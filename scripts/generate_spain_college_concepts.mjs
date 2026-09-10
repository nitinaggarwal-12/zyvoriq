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

const USER_PROMPT = "modern college girls swimming and singing in Spain";

const systemInstruction = `You are Google Omni, the Master Directorial AI and Executive Music Video Producer for Zyvoriq.
You are processing an executive creator prompt for a high-energy, sun-soaked modern music video featuring college girls swimming and singing in Spain.

The user prompted: "${USER_PROMPT}"

Your job is to generate 3 DISTINCT, HIGH-CRAFT, CINEMATIC CONCEPT PACKAGES.
Each concept must address the unique physical and aesthetic challenges of this genre:
- Water, caustics, and wet-hair diffusion continuity.
- Group ensemble dynamics (lead singer + friends/trio).
- Sun-drenched Mediterranean European aesthetics (Ibiza, Mallorca, Costa Brava, Barcelona).
- Upbeat summer pop / dance / Latin-pop musical DNA.

For each concept, provide:
1. conceptId: "concept_1", "concept_2", "concept_3"
2. title: Catchy, sun-soaked bilingual/summer title + English translation
3. logline: 1-sentence vibrant cinematic logline
4. location: City / Region in Spain (e.g. Ibiza, Mallorca / Costa Brava, Barcelona Rooftops)
5. place: The 3 lavish water and architectural set environments (e.g. Cliffside infinity pool, secluded turquoise Mediterranean cala/cove, luxury catamaran yacht)
6. occasionAndMotive: The dramatic occasion (e.g. Post-graduation road trip celebration, summer romance freedom, spontaneous weekend getaway)
7. musicalDna:
   - genre (e.g. Tropical House / Latin Dance Pop / Indie Sun-Pop)
   - bpm (e.g. 120, 124, 126)
   - keyAndScale (e.g. A minor, E major)
   - instrumentation (e.g. Spanish acoustic guitar arpeggios, sub-bass 808, steel drums, tropical synth plucks, vocal chops)
   - vocalStyle (e.g. Playful, airy, sun-kissed, group chorus harmonies, Dua Lipa / Rosalía / Zara Larsson vibe)
   - openingLyrics: 2 catchy bilingual (English + Spanish) lines
8. performerGroupDna:
   - trioDynamics: Lead vocalist persona + 2 best friends (distinct styling, swimsuits, hair colors to prevent diffusion face-merging)
   - swimAndSingingAction: How the singing and swimming choreography is framed to avoid awkward water glitches
9. threeActWardrobeAndSetArc:
   - act1 (Day 1 - Arrival & Cliffside Pool): Swimwear + Set + Golden sunlight
   - act2 (Day 2 - Yacht / Hidden Cove): Contrast swimwear/cover-ups + Turquoise water + Underwater caustics
   - act3 (Sunset into Twilight Beach Club): Chic evening resort-wear/bikini tops + Sunset glow + Fairy lights / Pool reflections
10. calculatedAnchorBreakdown: Exact count breakdown for a multi-character group production

Return an array of 3 objects in JSON conforming to the schema. Return valid JSON only.`;

async function main() {
  console.log("🎬 [Omni Director] Compiling 3 Spain College Swim & Sing Concepts for prompt:", USER_PROMPT);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: "Generate the 3 distinct modern college girls swimming and singing in Spain music video production concepts as specified. Return valid JSON array only." }]
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
  const outPath = path.resolve(process.cwd(), "scratch/spain_college_swim_5m/concept_packages.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2));

  console.log(`✅ [Omni Director] 3 Spain Concepts successfully generated and saved to ${outPath}`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
