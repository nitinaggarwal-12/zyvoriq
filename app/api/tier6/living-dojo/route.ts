import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";

function pcmToWav(pcmData: Buffer, sampleRate = 24000, channels = 1): Buffer {
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const buffer = Buffer.alloc(44 + pcmData.length);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + pcmData.length, 4);
  buffer.write("WAVE", 8);

  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);

  buffer.write("data", 36);
  buffer.writeUInt32LE(pcmData.length, 40);

  pcmData.copy(buffer, 44);
  return buffer;
}

async function synthesizeNeuralVoice(text: string, voiceName: "Charon" | "Aoede"): Promise<Buffer | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName === "Charon" ? "Charon" : "Aoede"
                }
              }
            }
          }
        })
      }
    );

    if (!res.ok) {
      console.error(`TTS API error (${voiceName}):`, await res.text());
      return null;
    }

    const data = await res.json();
    const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const pcmBuf = Buffer.from(base64Audio, "base64");
    return pcmToWav(pcmBuf, 24000, 1);
  } catch (err) {
    console.error(`TTS Error (${voiceName}):`, err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      userQuery = "Sensei, I feel overwhelmed by self-doubt and fear of failure.",
      language = "en",
      speakerTarget = "ren",
      conversationHistory = []
    } = await req.json();

    const langNameMap: Record<string, string> = {
      ja: "Japanese (日本語)",
      en: "English",
      es: "Spanish (Español)",
      fr: "French (Français)",
      de: "German (Deutsch)",
      hi: "Hindi (हिन्दी)"
    };

    const targetLangName = langNameMap[language] || "English";

    // Step 1: Prompt Gemini 2.5 Flash for deep philosophical persona dialogue
    const systemPrompt = `You are the master narrative AI for "The Master & The Apprentice: Path to Kaizen", a Tier-6 Autonomous Living Anime World Model.
Characters:
1. Sensei Ren (蓮先生): Wise, serene, deeply compassionate elder Zen swordmaster. Speaks with profound grounding in Japanese philosophies (Kaizen, Oubaitori, Kintsugi, Gaman, Ikigai, Shoshin, Wabi-Sabi).
2. Apprentice Aoi (葵): Passionate, earnest, vulnerable young samurai apprentice who reflects on human struggle and strives for growth.

User has asked/shared: "${userQuery}".
Language requested for dialogue: ${targetLangName}.

Respond with a strictly formatted JSON object:
{
  "philosophy": "Primary Philosophy Name (Kanji) — English Meaning",
  "visualMood": "dojo_dawn" | "garden_spring" | "bamboo_gale" | "kintsugi_altar" | "mountain_sunset",
  "actionDirection": "Cinematic visual description of Sensei Ren and Aoi's physical gestures and environment",
  "renDialogue": "Sensei Ren's wise, compassionate response directly addressing the user (in ${targetLangName})",
  "aoiDialogue": "Apprentice Aoi's supportive reflection or realization (in ${targetLangName})",
  "subtitles": {
    "en": "English translation of Ren's core wisdom",
    "ja": "Japanese translation of Ren's core wisdom"
  },
  "wisdomKey": "One powerful 1-sentence proverb or takeaway for the user"
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json({ error: `Gemini Reasoning Error: ${errText}` }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const rawJson = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const dialogueResult = JSON.parse(rawJson);

    // Step 2: Synthesize Neural Voice in real-time
    const renTextToSpeak = dialogueResult.renDialogue || "Look at the garden, student. In your own time, your spring shall arrive.";
    const renWav = await synthesizeNeuralVoice(renTextToSpeak, "Charon");

    let audioUrl = "";
    if (renWav) {
      const publicDir = path.join(process.cwd(), "public", "assets", "audio", "living_dojo");
      fs.mkdirSync(publicDir, { recursive: true });
      const filename = `dojo_${Date.now()}_${language}.wav`;
      fs.writeFileSync(path.join(publicDir, filename), renWav);
      audioUrl = `/assets/audio/living_dojo/${filename}`;
    }

    return NextResponse.json({
      success: true,
      userQuery,
      language,
      philosophy: dialogueResult.philosophy || "Kaizen (改善) — 1% Daily Growth",
      visualMood: dialogueResult.visualMood || "garden_spring",
      actionDirection: dialogueResult.actionDirection || "Sensei Ren gently gestures toward the blooming cherry tree as Aoi lowers her sword in peace.",
      renDialogue: dialogueResult.renDialogue,
      aoiDialogue: dialogueResult.aoiDialogue,
      subtitles: dialogueResult.subtitles || {
        en: dialogueResult.renDialogue,
        ja: dialogueResult.renDialogue
      },
      wisdomKey: dialogueResult.wisdomKey || "Your flaws and scars are the golden seams of your character.",
      audioUrl,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Living Dojo Error:", err);
    return NextResponse.json({ error: err.message || "Failed to simulate living dojo response" }, { status: 500 });
  }
}
