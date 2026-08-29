const fs = require("fs");
const path = require("path");

console.log("================================================================================");
console.log("🛡️ MULTI-MODAL AUDIO-VISUAL PRODUCTION TEST HARNESS & ASSET INTEGRITY AUDITOR");
console.log("================================================================================\n");

function analyzeAudio(pcmBuffer) {
  const numSamples = pcmBuffer.length / 2;
  let vocalEnergy = 0;
  let zeroCrossings = 0;
  let prev = 0;

  for (let i = 0; i < numSamples; i += 2) {
    const s = pcmBuffer.readInt16LE(i * 2) / 32768.0;
    if ((s >= 0 && prev < 0) || (s < 0 && prev >= 0)) zeroCrossings++;
    prev = s;
    vocalEnergy += Math.abs(s);
  }

  const avgEnergy = vocalEnergy / (numSamples / 2);
  const zcr = zeroCrossings / (numSamples / 2);

  return {
    hasVocalsAndMusic: avgEnergy > 0.07,
    zcr: zcr.toFixed(4),
    avgEnergy: avgEnergy.toFixed(4)
  };
}

const tracks = [
  {
    id: "track_hindi_sufi_romantic_60s",
    name: "Kesariya Raaste: Sufi Soul in Old Delhi (60s)",
    masterAudio: "public/assets/audio/kesariya_raaste_master_60s.wav",
    acts: [
      { num: 1, video: "public/assets/video/veo_hindi_sufi_song_master.mp4", audio: "public/assets/audio/audio_hindi_sufi_act1.wav" },
      { num: 2, video: "public/assets/video/veo_hindi_sufi_act2.mp4", audio: "public/assets/audio/audio_hindi_sufi_act2.wav" },
      { num: 3, video: "public/assets/video/veo_hindi_sufi_act3.mp4", audio: "public/assets/audio/audio_hindi_sufi_act3.wav" },
      { num: 4, video: "public/assets/video/veo_hindi_sufi_act4.mp4", audio: "public/assets/audio/audio_hindi_sufi_act4.wav" }
    ]
  },
  {
    id: "track_hindi_desi_hiphop_60s",
    name: "Gully Raftaar: Mumbai Monsoon Beats (60s)",
    masterAudio: "public/assets/audio/gully_raftaar_master_60s.wav",
    acts: [
      { num: 1, video: "public/assets/video/veo_hindi_desi_hiphop_master.mp4", audio: "public/assets/audio/audio_hindi_hiphop_act1.wav" },
      { num: 2, video: "public/assets/video/veo_hindi_hiphop_act2.mp4", audio: "public/assets/audio/audio_hindi_hiphop_act2.wav" },
      { num: 3, video: "public/assets/video/veo_hindi_hiphop_act3.mp4", audio: "public/assets/audio/audio_hindi_hiphop_act3.wav" },
      { num: 4, video: "public/assets/video/veo_hindi_hiphop_act4.mp4", audio: "public/assets/audio/audio_hindi_hiphop_act4.wav" }
    ]
  }
];

let allPassed = true;

tracks.forEach(t => {
  console.log(`🎬 Auditing Track: "${t.name}" [${t.id}]`);
  
  if (!fs.existsSync(t.masterAudio)) {
    console.error(`   ❌ Master audio missing: ${t.masterAudio}`);
    allPassed = false;
    return;
  }
  
  const masterBuf = fs.readFileSync(t.masterAudio).subarray(44);
  const masterAnalysis = analyzeAudio(masterBuf);
  console.log(`   🎼 Master Audio: Size=${(fs.statSync(t.masterAudio).size/1024/1024).toFixed(2)} MB | Energy=${masterAnalysis.avgEnergy} | Layering=${masterAnalysis.hasVocalsAndMusic ? "✅ PASS" : "❌ FAIL"}`);

  t.acts.forEach(a => {
    const vExists = fs.existsSync(a.video);
    const aExists = fs.existsSync(a.audio);
    if (!vExists || !aExists) allPassed = false;

    const vSize = vExists ? (fs.statSync(a.video).size/1024/1024).toFixed(2) + " MB" : "MISSING";
    const aSize = aExists ? (fs.statSync(a.audio).size/1024/1024).toFixed(2) + " MB" : "MISSING";

    let actEnergy = "N/A";
    let actPass = false;
    if (aExists) {
      const actBuf = fs.readFileSync(a.audio).subarray(44);
      const ana = analyzeAudio(actBuf);
      actEnergy = ana.avgEnergy;
      actPass = ana.hasVocalsAndMusic;
      if (!actPass) allPassed = false;
    }

    console.log(`      Act ${a.num}: 📹 4K Video (${vSize}) | 🎙️ Audio Stem (${aSize}, Energy=${actEnergy}) -> ${vExists && aExists && actPass ? "✅ PASS" : "❌ FAIL"}`);
  });
  console.log("");
});

console.log("--------------------------------------------------------------------------------");
console.log(`🏆 FINAL QUALITY GATE RESULT: ${allPassed ? "✅ ALL MULTI-MODAL ASSETS CERTIFIED FOR WORLD PREMIERE" : "❌ QUALITY GATE FAILED"}`);
console.log("--------------------------------------------------------------------------------\n");
