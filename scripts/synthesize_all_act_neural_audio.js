const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/) || envContent.match(/GOOGLE_API_KEY=([^\r\n]+)/);
if (!match) {
  console.error("❌ No GEMINI_API_KEY found");
  process.exit(1);
}
const apiKey = match[1].trim();

function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitDepth = 16) {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * numChannels * (bitDepth / 8);
  const blockAlign = numChannels * (bitDepth / 8);
  const dataLength = pcmBuffer.length;
  const riffLength = dataLength + 36;

  header.write("RIFF", 0);
  header.writeUInt32LE(riffLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmBuffer]);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function synthesizeActAudio(text, voiceName, outputPath, personaPrompt) {
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 10000) {
    console.log(`⏩ Already exists: ${path.basename(outputPath)}`);
    return true;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
  const prompt = personaPrompt
    ? `Emote as ${personaPrompt}. Sing or recite with authentic human emotion, breath, and musical cadence:\n\n${text}`
    : text;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      })
    });

    const data = await res.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      const rawPcm = Buffer.from(data.candidates[0].content.parts[0].inlineData.data, "base64");
      const wav = pcmToWav(rawPcm, 24000, 1, 16);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, wav);
      console.log(`✅ Synthesized Audio: ${path.basename(outputPath)} (${(wav.length / 1024).toFixed(1)} KB)`);
      return true;
    } else {
      console.warn(`❌ TTS failed for: ${path.basename(outputPath)}`, data.error || data);
    }
  } catch (err) {
    console.error(`❌ Exception:`, err.message);
  }
  return false;
}

async function main() {
  console.log("================================================================================");
  console.log("🎙️ SYNTHESIZING ALL ACT NEURAL AUDIO VIA GEMINI TTS ENGINE");
  console.log("================================================================================\n");

  const AUDIO_TASKS = [
    // 1. Kesariya Raaste (Hindi Sufi Romantic)
    {
      file: "audio_hindi_sufi_act1.wav",
      voice: "Charon",
      persona: "a soulful Indian male playback singer singing a romantic Sufi ghazal",
      text: "केसरिया रास्तों पर जब शाम ढले, तेरी यादों की महक हवा में घुले... दिल की हर धड़कन बस तेरा नाम ले।"
    },
    {
      file: "audio_hindi_sufi_act2.wav",
      voice: "Aoede",
      persona: "a classical Indian female playback singer singing melodious romantic lines",
      text: "गेंदे के फूलों सी महके यह जहां, तेरे संग बीते यह खुशियों का समां... तू है मेरा आसमां, तू ही मेरा कारवां।"
    },
    {
      file: "audio_hindi_sufi_act3.wav",
      voice: "Charon",
      persona: "an impassioned Sufi qawwali playback singer at the emotional peak of the song",
      text: "मौला मेरे मौला, यह कैसा असर है... तेरे बिना अब तो सूना यह सफर है! इश्क़ का यह रंग कभी ना छूटेगा।"
    },
    {
      file: "audio_hindi_sufi_act4.wav",
      voice: "Aoede",
      persona: "a gentle Indian female playback singer singing the romantic twilight outro",
      text: "रूह से रूह का यह बंधन कभी ना टूटेगा... ओ सनम, तेरा साथ ही मेरी इबादत है।"
    },

    // 2. Gully Raftaar (Hindi Desi Hip-Hop)
    {
      file: "audio_hindi_hiphop_act1.wav",
      voice: "Fenrir",
      persona: "an energetic Mumbai street rapper rapping with fast flow and street cadence",
      text: "मुंबई की बारिश में भीगा यह शहर, मेरे शब्दों का देखो यह कैसा कहर! गली से निकले हैं, दुनिया हिलाएंगे!"
    },
    {
      file: "audio_hindi_hiphop_act2.wav",
      voice: "Fenrir",
      persona: "a rapid-fire Indian hip-hop MC delivering fast rhythmic rhymes",
      text: "काली-पीली टैक्सी, नियॉन की बत्ती, मेहनत की कमाई से पाई यह गद्दी! रुकना नहीं आता, रफ्तार हमारी है!"
    },
    {
      file: "audio_hindi_hiphop_act3.wav",
      voice: "Puck",
      persona: "a hype street MC hyping up a Mumbai B-boy dance crew in the rain",
      text: "बी-बॉयज का डांस और बीट्स का यह संगम, जो भी सुनेगा वो झूम उठेगा हरदम! असली हिप-हॉप का यह नया दौर है!"
    },
    {
      file: "audio_hindi_hiphop_act4.wav",
      voice: "Fenrir",
      persona: "a triumphant Mumbai rapper executing a mic drop on Marine Drive",
      text: "सी-लिंक के सामने गिराया यह माइक, असली मेहनत से पाया सबका यह लाइक! जय हिंद, जय मुंबई!"
    },

    // 3. Neon Horizons (Human Live Rooftop Concert)
    {
      file: "audio_human_music_act1.wav",
      voice: "Aoede",
      persona: "a charismatic female rock vocalist singing the opening song melody",
      text: "Through the rain above Shibuya's neon glow, the opening guitar chord rings out — wake up your heartbeat."
    },
    {
      file: "audio_human_music_act2.wav",
      voice: "Aoede",
      persona: "an energetic female rock lead singer screaming to the crowd at the bass drop",
      text: "Feel the bassline shake the midnight sky! Every hand is in the air as the city sings along!"
    },
    {
      file: "audio_human_music_act3.wav",
      voice: "Aoede",
      persona: "a powerful live concert rock vocalist during a high voltage guitar solo",
      text: "Purple spotlight catches the blazing guitar solo! We're breaking every boundary tonight!"
    },
    {
      file: "audio_human_music_act4.wav",
      voice: "Aoede",
      persona: "a live concert female singer hitting an emotional sustained high note",
      text: "Holding the final high note over the dawn horizon. Thank you Tokyo, we will never fade!"
    },

    // 4. Starlight Symphony (Anime Cyber Idol)
    {
      file: "audio_anime_music_act1.wav",
      voice: "Kore",
      persona: "an enthusiastic high-pitched Japanese anime cyber pop idol introducing the concert",
      text: "Welcome to the starlight cosmic stage! Dual energy microphones online, let's shine!"
    },
    {
      file: "audio_anime_music_act2.wav",
      voice: "Kore",
      persona: "a cheerful Japanese anime idol singing an upbeat J-pop melody",
      text: "Dancing across seven prismatic starlight crystals, sending pure smiles across the entire galaxy!"
    },
    {
      file: "audio_anime_music_act3.wav",
      voice: "Kore",
      persona: "an excited Japanese anime pop idol celebrating a supernova starlight explosion",
      text: "Supernova burst! Under the shower of starlight confetti, our bond becomes truly infinite!"
    },
    {
      file: "audio_anime_music_act4.wav",
      voice: "Kore",
      persona: "a cute anime pop idol saying goodbye with a wink",
      text: "I love you all! Aria's starlight song will echo in your hearts forever! Bye bye!"
    },

    // 5. Fantasy Wyrm (4 Acts)
    {
      file: "audio_fantasy_act1.wav",
      voice: "Aoede",
      persona: "a wise fantasy lore chronicler describing ancient floating ruins",
      text: "Above the clouds of the elder realm, the floating spires of Aethelgard awaken as the celestial runes glow with astral fire."
    },
    {
      file: "audio_fantasy_act2.wav",
      voice: "Aoede",
      persona: "a fantasy lore chronicler narrating the flight of a dragon",
      text: "Behold the Starlight Wyrm, wings of crystalline glass slicing through the golden sunset mist."
    },
    {
      file: "audio_fantasy_act3.wav",
      voice: "Aoede",
      persona: "a dramatic fantasy chronicler describing a thunderstorm on high peaks",
      text: "Violet lightning cleaves the obsidian peaks as ancient warding spells test the courage of the guardians."
    },
    {
      file: "audio_fantasy_act4.wav",
      voice: "Aoede",
      persona: "a solemn fantasy chronicler concluding the grand epic",
      text: "From the cathedral balcony, the wardens raise their glowing staves, forever sworn to protect the starlight kingdom."
    },

    // 6. Gaming Esports Finals (4 Acts)
    {
      file: "audio_gaming_act1.wav",
      voice: "Kore",
      persona: "an electric esports play-by-play caster hyping up a championship walkout",
      text: "Fifty thousand fans roar as the world champions take the stage under the neon laser lights of the Nexus Arena!"
    },
    {
      file: "audio_gaming_act2.wav",
      voice: "Kore",
      persona: "an analytical esports commentator breaking down a holographic champion draft",
      text: "The holographic draft is locked in. Both teams have deployed their signature hyper-carry compositions!"
    },
    {
      file: "audio_gaming_act3.wav",
      voice: "Kore",
      persona: "an intensely hyped esports caster shouting during a chaotic 5v5 team fight",
      text: "Spells collide in mid-lane! Flank from the shadows, triple kill on the backline! It's a clean team wipe!"
    },
    {
      file: "audio_gaming_act4.wav",
      voice: "Kore",
      persona: "an ecstatic esports caster announcing the world champions trophy lift",
      text: "They lift the golden Aegis trophy! Gold confetti rains down on the greatest champions in history!"
    }
  ];

  for (const task of AUDIO_TASKS) {
    const outPath = path.resolve(process.cwd(), "public/assets/audio", task.file);
    await synthesizeActAudio(task.text, task.voice, outPath, task.persona);
    await sleep(800);
  }

  console.log("\n🎉 All Act Neural Audio Synthesized Successfully!");
}

main().catch(console.error);
