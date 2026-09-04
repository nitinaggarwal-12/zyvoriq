import fs from "fs";
import path from "path";

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

export async function synthesizeVoiceSpeech(
  text: string,
  options: {
    characterLock?: string;
    language?: string;
    jobId?: string;
  } = {}
): Promise<{ audioUrl: string; duration: number } | null> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    "";

  if (!apiKey || !text || text.trim().length === 0) return null;

  try {
    const cleanText = text.replace(/[*#_~`]/g, " ").replace(/\s+/g, " ").trim();
    const char = (options.characterLock || "").toLowerCase();
    const voiceName =
      char === "david" || char.includes("david") || char === "puck"
        ? "Puck"
        : char.includes("ren") || char === "charon"
        ? "Charon"
        : char === "elena" || char.includes("elena") || char === "aoede"
        ? "Aoede"
        : char === "priya" || char.includes("priya")
        ? "Aoede"
        : char === "aoi" || char.includes("aoi")
        ? "Aoede"
        : char.includes("fenrir") || char.includes("deep") || char.includes("baritone")
        ? "Fenrir"
        : char.includes("kore") || char.includes("calm") || char.includes("clarity")
        ? "Kore"
        : char.includes("woman") || char.includes("female") || char.includes("lady")
        ? "Aoede"
        : char.includes("man") || char.includes("male")
        ? "Puck"
        : "Aoede";

    const primaryModel = process.env.ZYVORIQ_TTS_MODEL || "gemini-3.1-flash-tts-preview";
    const payload = {
      contents: [{ parts: [{ text: cleanText }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName
            }
          }
        }
      }
    };

    let res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    // Resilient fallback to gemini-2.5-flash-preview-tts if 3.1 is not enabled on specific key
    if (!res.ok && primaryModel !== "gemini-2.5-flash-preview-tts") {
      console.warn(`Primary TTS ${primaryModel} failed (${res.status}), attempting fallback to gemini-2.5-flash-preview-tts...`);
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
    }

    if (!res.ok) {
      console.warn("TTS generation warning:", await res.text());
      return null;
    }

    const data = await res.json();
    const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const pcmBuf = Buffer.from(base64Audio, "base64");
    const wavBuf = pcmToWav(pcmBuf, 24000, 1);

    const outDir = path.resolve(process.cwd(), "public/assets/audio/generated");
    fs.mkdirSync(outDir, { recursive: true });

    const fileName = `audio_${options.jobId || Date.now()}_${Math.random().toString(36).slice(2, 6)}.wav`;
    const filePath = path.join(outDir, fileName);
    fs.writeFileSync(filePath, wavBuf);

    return {
      audioUrl: `/api/media/audio/generated/${fileName}`,
      duration: pcmBuf.length / (24000 * 2)
    };
  } catch (err: any) {
    console.warn("TTS synthesis error:", err.message);
    return null;
  }
}
