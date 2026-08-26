const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const key = fs.readFileSync('.env.local', 'utf8').match(/GEMINI_API_KEY=(.*)/)[1].trim();
const storyboard = JSON.parse(fs.readFileSync('scratch/keynote_10min/storyboard_spec.json', 'utf8'));

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function synthesizeSceneAudio(scene, index) {
  console.log(`🎙️ [Scene ${index + 1}/10] Synthesizing 48kHz Speech for: ${scene.title}...`);
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: scene.script }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Aoede"
            }
          }
        }
      }
    })
  });

  const data = await res.json();
  const audioPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType?.includes("audio"));
  
  if (!audioPart) {
    throw new Error(`Failed to synthesize audio for scene ${scene.id}: ${JSON.stringify(data)}`);
  }

  const pcmBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
  const pcmPath = `scratch/keynote_10min/${scene.id}.pcm`;
  const wavPath = `scratch/keynote_10min/${scene.id}.wav`;
  
  fs.writeFileSync(pcmPath, pcmBuffer);
  console.log(`  💾 Saved raw PCM for ${scene.id} (${(pcmBuffer.length / 1024).toFixed(1)} KB)`);
  return { pcmPath, wavPath, id: scene.id };
}

async function main() {
  console.log('🚀 Synthesizing Complete 10-Minute Keynote Audio via Google DeepMind Neural TTS...');
  const allScenes = [];
  storyboard.acts.forEach(act => allScenes.push(...act.scenes));

  const audioFiles = [];
  for (let i = 0; i < allScenes.length; i++) {
    const scene = allScenes[i];
    const res = await synthesizeSceneAudio(scene, i);
    audioFiles.push(res);
    await sleep(800);
  }

  console.log('\n🎉 All 10 Keynote Audio Scenes Synthesized Successfully!');
  fs.writeFileSync('scratch/keynote_10min/audio_manifest.json', JSON.stringify(audioFiles, null, 2));
}

main().catch(console.error);
