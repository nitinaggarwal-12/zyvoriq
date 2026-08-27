import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";

function pcmToWav(pcmData: Buffer, sampleRate = 24000, channels = 1): Buffer {
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const buffer = Buffer.alloc(44 + pcmData.length);

  // RIFF identifier
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + pcmData.length, 4);
  buffer.write("WAVE", 8);

  // 'fmt ' sub-chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // 'data' sub-chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(pcmData.length, 40);

  pcmData.copy(buffer, 44);
  return buffer;
}

export async function POST(req: NextRequest) {
  try {
    const { scriptText, personaName = "Priya" } = await req.json();

    if (!scriptText || typeof scriptText !== "string" || scriptText.trim().length === 0) {
      return NextResponse.json({ error: "Script text is required" }, { status: 400 });
    }

    // Clean text of markdown artifacts for natural speaking
    const cleanText = scriptText
      .replace(/[*#_~`]/g, " ")
      .replace(/---/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const prompt = `Speak the following keynote presentation text in an authoritative, visionary executive tone as ${personaName}: ${cleanText}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Puck"
              }
            }
          }
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `TTS failed: ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return NextResponse.json({ error: "No audio generated from model" }, { status: 500 });
    }

    const pcmBuf = Buffer.from(base64Audio, "base64");
    const wavBuf = pcmToWav(pcmBuf, 24000, 1);

    const publicDir = path.join(process.cwd(), "public", "assets", "audio");
    fs.mkdirSync(publicDir, { recursive: true });

    const fileName = `dynamic_speech_${Date.now()}.wav`;
    const filePath = path.join(publicDir, fileName);
    fs.writeFileSync(filePath, wavBuf);

    const durationSeconds = pcmBuf.length / (24000 * 2);

    return NextResponse.json({
      success: true,
      audioUrl: `/assets/audio/${fileName}`,
      durationSeconds: parseFloat(durationSeconds.toFixed(2)),
      sampleRate: 24000
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Synthesis failed" }, { status: 500 });
  }
}
