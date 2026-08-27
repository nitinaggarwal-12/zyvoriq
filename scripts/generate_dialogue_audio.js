const fs = require('fs');
const key = fs.readFileSync('.env.local', 'utf8').match(/GEMINI_API_KEY=(.*)/)[1].trim();

function pcmToWav(pcmData, sampleRate = 24000, channels = 1) {
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const buffer = Buffer.alloc(44 + pcmData.length);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + pcmData.length, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(pcmData.length, 40);
  pcmData.copy(buffer, 44);
  return buffer;
}

async function synthVoice(text, voiceName, filename) {
  console.log(`🎙️ Synthesizing [${voiceName}]: "${text.substring(0, 40)}..."`);
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } }
        }
      }
    })
  });
  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.[0];
  if (part && part.inlineData) {
    const rawPcm = Buffer.from(part.inlineData.data, 'base64');
    const wav = pcmToWav(rawPcm, 24000, 1);
    fs.mkdirSync('scratch/dialogue', { recursive: true });
    const outPath = `scratch/dialogue/${filename}`;
    fs.writeFileSync(outPath, wav);
    console.log(`  ✅ Saved ${outPath} (${wav.length} bytes)`);
    return outPath;
  }
  throw new Error(`TTS Error for ${voiceName}: ${JSON.stringify(data)}`);
}

async function main() {
  console.log("=================================================================");
  console.log("🎭 GENERATING DUAL-ACTOR CONVERSATIONAL ANIME DIALOGUE");
  console.log("=================================================================");

  // Line 1: Aoi (Young, vulnerable, emotional apprentice)
  await synthVoice(
    "Sensei... I train every single sunrise until my hands bleed. But I still feel so weak. When will I ever become strong like you?",
    "Aoede",
    "line_1_aoi.wav"
  );

  // Line 2: Ren (Wise, warm, soothing master)
  await synthVoice(
    "Look at the garden, Aoi. The cherry, the plum, the peach—each blooms in its own sacred season. Oubaitori teaches us: never measure your spring against another's summer.",
    "Charon",
    "line_2_ren.wav"
  );

  // Line 3: Aoi (Curious, awakening realization)
  await synthVoice(
    "So my sword strike today... even if it only improves by a tiny fraction... it truly matters?",
    "Aoede",
    "line_3_aoi.wav"
  );

  // Line 4: Ren (Inspiring, profound teacher)
  await synthVoice(
    "That is Kaizen—one percent every day. And look at this tea bowl mended with gold: Kintsugi. Your past scars are not flaws, Aoi. They are the golden seams of your character.",
    "Charon",
    "line_4_ren.wav"
  );

  // Line 5: Aoi (Fierce determination, passionate breakthrough)
  await synthVoice(
    "Gaman... I understand now! Even when the storm rages, I will bend like the bamboo, but my spirit will never break!",
    "Aoede",
    "line_5_aoi.wav"
  );

  // Line 6: Ren (Proud, visionary mentor)
  await synthVoice(
    "Well spoken. When your fierce discipline unites with purpose, you discover your true Ikigai—the reason your soul leaps into the light.",
    "Charon",
    "line_6_ren.wav"
  );

  // Line 7a: Aoi (Deep gratitude and humility)
  await synthVoice(
    "Arigatou gozaimasu, Sensei. Together, we walk the path.",
    "Aoede",
    "line_7a_aoi.wav"
  );

  // Line 7b: Ren (Warm parting blessing)
  await synthVoice(
    "Bow with honor, Aoi. Our journey has only just begun.",
    "Charon",
    "line_7b_ren.wav"
  );

  console.log("🎉 ALL 8 DIALOGUE LINES SYNTHESIZED SUCCESSFULLY!");
}

main().catch(console.error);
