import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// Load .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY;

function pcmToWav(pcmData, sampleRate = 24000, channels = 1) {
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

const DIALOGUES = [
  {
    act: 1,
    startSec: 0.3,
    text: "Before the fire, before the stone... there is only the breath of Naples and Tipo Zero-Zero.",
  },
  {
    act: 2,
    startSec: 5.3,
    text: "Seventy-two hours of silent patience. Time is the only leavening we trust.",
  },
  {
    act: 3,
    startSec: 10.3,
    text: "Grown in volcanic ash. Crushed by hand so the sweetness never meets a blade.",
  },
  {
    act: 4,
    startSec: 15.3,
    text: "Nine hundred degrees of Vesuvian oak. Sixty seconds where dough becomes architecture.",
  },
  {
    act: 5,
    startSec: 20.3,
    text: "Listen closely. That crackle is the sound of a century-old blistered cornicione.",
  },
  {
    act: 6,
    startSec: 25.3,
    text: "No shortcuts. No compromises. Welcome to The Cathedral of Crust.",
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateGeminiTtsWav(text, outWavPath) {
  if (fs.existsSync(outWavPath) && fs.statSync(outWavPath).size > 50_000) {
    console.log(`✅ Cached spoken dialogue: ${outWavPath} (${(fs.statSync(outWavPath).size / 1024).toFixed(1)} KB)`);
    return;
  }

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `Please read this script aloud in a deep, gravelly, dramatic movie trailer voiceover narration style: "${text}"`,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Charon",
              },
            },
          },
        },
      };

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!inlineData?.data) {
        throw new Error("No inlineData audio returned from Gemini TTS");
      }

      const pcmBuffer = Buffer.from(inlineData.data, "base64");
      const wavBuffer = pcmToWav(pcmBuffer, 24000, 1);
      fs.writeFileSync(outWavPath, wavBuffer);
      console.log(`✅ Synthesized spoken dialogue via Gemini TTS (Charon): ${outWavPath} (${(wavBuffer.length / 1024).toFixed(1)} KB)`);
      await sleep(2000);
      return;
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt} failed for "${text.slice(0, 30)}...": ${err.message}`);
      await sleep(3000 * attempt);
    }
  }
  throw new Error(`Failed after 4 attempts to synthesize TTS for: ${text}`);
}

async function main() {
  const outDir = path.join(process.cwd(), "public", "assets", "swarm", "vo");
  fs.mkdirSync(outDir, { recursive: true });

  console.log("=== Synthesizing 6 Spoken Voiceover Dialogue Stems via Google Gemini TTS (Charon) ===");
  for (const item of DIALOGUES) {
    const rawWav = path.join(outDir, `vo_act${item.act}_raw.wav`);
    const cleanWav = path.join(outDir, `vo_act${item.act}_48k.wav`);
    await generateGeminiTtsWav(item.text, rawWav);
    // Normalize & fit each voiceover stem comfortably within 4.5s window at 48kHz stereo
    execSync(
      `ffmpeg -y -i "${rawWav}" -af "aresample=48000,pan=stereo|c0=c0|c1=c0,loudnorm=I=-14:TP=-1.0:LRA=7,atrim=0:4.600" -ar 48000 -ac 2 "${cleanWav}"`,
      { stdio: "ignore" }
    );
  }

  // Build the complete 30.000s Spoken Voiceover Master Stem (delayed to exact act timestamps: 0.3s, 5.3s, 10.3s, 15.3s, 20.3s, 25.3s)
  const masterVoPath = path.join(process.cwd(), "public", "assets", "swarm", "swarm_voiceover_dialogue_master.wav");
  const inputs = DIALOGUES.map((d) => `-i "${path.join(outDir, `vo_act${d.act}_48k.wav`)}"`).join(" ");
  const filterParts = DIALOGUES.map((d, i) => {
    const delayMs = Math.round(d.startSec * 1000);
    return `[${i}:a]adelay=${delayMs}|${delayMs},volume=1.40[a${i}]`;
  });
  const mixInputs = DIALOGUES.map((_, i) => `[a${i}]`).join("");
  const filterComplex = `${filterParts.join(";")};${mixInputs}amix=inputs=6:duration=longest:normalize=0,apad=whole_dur=30.000,atrim=0:30.000,asetpts=PTS-STARTPTS[vo]`;

  execSync(
    `ffmpeg -y ${inputs} -filter_complex "${filterComplex}" -map "[vo]" -ar 48000 -ac 2 "${masterVoPath}"`,
    { stdio: "ignore" }
  );
  console.log(`🎉 Created 30.000s Master Spoken Voiceover Dialogue Track: ${masterVoPath}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
