const fs = require('fs');
const { execSync } = require('child_process');

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
  console.log(`🎙️ [${voiceName}] Synthesizing: "${text.substring(0, 50)}..."`);
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
    fs.mkdirSync('scratch/multilingual', { recursive: true });
    const outPath = `scratch/multilingual/${filename}`;
    fs.writeFileSync(outPath, wav);
    console.log(`  ✅ Saved ${outPath} (${wav.length} bytes)`);
    return outPath;
  }
  throw new Error(`TTS Error: ${JSON.stringify(data)}`);
}

const SCRIPTS = {
  ja: [
    { text: "先生…毎朝手のひらが血で滲むまで鍛錬していますが、なぜ私はまだこんなに弱いのでしょう？", voice: "Aoede", file: "ja_1.wav" },
    { text: "庭を見るのだ、葵。「桜梅桃李」—桜も梅も桃も李も、己の季節に咲き誇る。他人の夏とお前の春を比べてはならぬ。", voice: "Charon", file: "ja_2.wav" },
    { text: "ならば今日の太刀筋も…僅か一歩の成長でも、本当に意味があるのですね？", voice: "Aoede", file: "ja_3.wav" },
    { text: "それこそが「改善」だ。そして「金継ぎ」を思い出せ。傷を誇れ、それこそがお前の黄金の輝きだ。", voice: "Charon", file: "ja_4.wav" },
    { text: "「我慢」！嵐に撓む竹のように、私の心は決して折れません！", voice: "Aoede", file: "ja_5.wav" },
    { text: "見事だ。志と慈悲が重なる時、己の「生き甲斐」が見出されよう。", voice: "Charon", file: "ja_6.wav" },
    { text: "ありがとうございます、先生。共に道を歩みましょう。", voice: "Aoede", file: "ja_7a.wav" },
    { text: "礼を尽くし、歩みを進めよう。", voice: "Charon", file: "ja_7b.wav" }
  ],
  en: [
    { text: "Sensei... I train every single sunrise until my hands bleed. But why do I still feel so weak?", voice: "Aoede", file: "en_1.wav" },
    { text: "Look at the garden, Aoi. Oubaitori teaches us that the cherry and the plum bloom in their own sacred season. Never measure your spring against another's summer.", voice: "Charon", file: "en_2.wav" },
    { text: "So my sword strike today... even if it only improves by one percent... it truly matters?", voice: "Aoede", file: "en_3.wav" },
    { text: "That is Kaizen. And remember Kintsugi: the clay mended with gold is stronger than unbroken porcelain. Your struggles are your golden seams.", voice: "Charon", file: "en_4.wav" },
    { text: "Gaman! Like the bamboo bending in fierce wind, my spirit will never break!", voice: "Aoede", file: "en_5.wav" },
    { text: "When your discipline unites with compassion, you find your true Ikigai—your sacred purpose under the sun.", voice: "Charon", file: "en_6.wav" },
    { text: "Arigatou gozaimasu, Sensei. Together we walk the path.", voice: "Aoede", file: "en_7a.wav" },
    { text: "Bow with honor, Aoi. Our journey has only just begun.", voice: "Charon", file: "en_7b.wav" }
  ],
  es: [
    { text: "Sensei... entreno cada amanecer con toda mi fuerza. Pero ¿por qué sigo sintiéndome tan débil?", voice: "Aoede", file: "es_1.wav" },
    { text: "Mira el jardín, Aoi. Oubaitori nos enseña que cada flor florece en su propia estación. Nunca compares tu primavera con el verano de otro.", voice: "Charon", file: "es_2.wav" },
    { text: "Entonces, mi práctica de espada hoy... ¿aunque solo mejore un uno por ciento, de verdad importa?", voice: "Aoede", file: "es_3.wav" },
    { text: "Eso es Kaizen. Y recuerda Kintsugi: la cerámica unida con oro es más fuerte. Tus cicatrices son tus vetas doradas.", voice: "Charon", file: "es_4.wav" },
    { text: "¡Gaman! Como el bambú ante la tormenta, ¡mi espíritu jamás se quebrará!", voice: "Aoede", file: "es_5.wav" },
    { text: "Cuando tu disciplina se une con propósito, descubres tu verdadero Ikigai.", voice: "Charon", file: "es_6.wav" },
    { text: "Muchas gracias, Sensei. Juntos caminamos este sendero.", voice: "Aoede", file: "es_7a.wav" },
    { text: "Inclínate con honor, Aoi. Nuestro viaje apenas comienza.", voice: "Charon", file: "es_7b.wav" }
  ],
  fr: [
    { text: "Sensei... je m'entraîne à chaque aube sans relâche. Mais pourquoi ai-je encore l'impression d'être si faible ?", voice: "Aoede", file: "fr_1.wav" },
    { text: "Regarde le jardin, Aoi. Oubaitori nous enseigne que chaque fleur s'épanouit en sa propre saison. Ne mesure jamais ton printemps à l'été d'autrui.", voice: "Charon", file: "fr_2.wav" },
    { text: "Ainsi, mon coup d'épée aujourd'hui... même amélioré d'un pourcent, a-t-il vraiment de la valeur ?", voice: "Aoede", file: "fr_3.wav" },
    { text: "C'est cela, le Kaizen. Et rappelle-toi le Kintsugi : la céramique réparée d'or est plus résistante. Tes cicatrices sont tes veines d'or.", voice: "Charon", file: "fr_4.wav" },
    { text: "Gaman ! Comme le bambou sous la tempête, mon esprit ne brisera jamais !", voice: "Aoede", file: "fr_5.wav" },
    { text: "Lorsque ta discipline s'unit à la sagesse, tu découvres ton véritable Ikigai.", voice: "Charon", file: "fr_6.wav" },
    { text: "Merci infiniment, Sensei. Ensemble, nous avançons sur la voie.", voice: "Aoede", file: "fr_7a.wav" },
    { text: "Salue avec honneur, Aoi. Notre voyage ne fait que commencer.", voice: "Charon", file: "fr_7b.wav" }
  ],
  de: [
    { text: "Sensei... ich trainiere bei jedem Sonnenaufgang unermüdlich. Aber warum fühle ich mich noch immer so schwach?", voice: "Aoede", file: "de_1.wav" },
    { text: "Schau in den Garten, Aoi. Oubaitori lehrt uns: Jede Blüte öffnet sich in ihrer eigenen Zeit. Vergleiche deinen Frühling nie mit dem Sommer eines anderen.", voice: "Charon", file: "de_2.wav" },
    { text: "Bedeutet das, mein Schwertstreich heute... selbst wenn er sich nur um ein Prozent verbessert... zählt wirklich?", voice: "Aoede", file: "de_3.wav" },
    { text: "Das ist Kaizen. Und denk an Kintsugi: Mit Gold repariertes Porzellan ist stärker. Deine Narben sind deine goldenen Linien.", voice: "Charon", file: "de_4.wav" },
    { text: "Gaman! Wie der Bambus im Sturm wird mein Geist niemals brechen!", voice: "Aoede", file: "de_5.wav" },
    { text: "Wenn Disziplin und Mitgefühl verschmelzen, findest du dein wahres Ikigai.", voice: "Charon", file: "de_6.wav" },
    { text: "Arigatou gozaimasu, Sensei. Gemeinsam gehen wir diesen Pfad.", voice: "Aoede", file: "de_7a.wav" },
    { text: "Verneige dich mit Ehre, Aoi. Unsere Reise hat gerade erst begonnen.", voice: "Charon", file: "de_7b.wav" }
  ],
  hi: [
    { text: "गुरुजी... मैं हर भोर कठोर अभ्यास करती हूँ। फिर भी मैं स्वयं को इतना निर्बल क्यों पाती हूँ?", voice: "Aoede", file: "hi_1.wav" },
    { text: "इस उपवन को देखो, आओई। उबैतोरी हमें सिखाता है कि हर पुष्प अपने ही समय पर खिलता है। कभी अपनी वसंत की तुलना किसी और के ग्रीष्म से मत करो।", voice: "Charon", file: "hi_2.wav" },
    { text: "तो आज का मेरा यह तलवार का प्रहार... यदि यह केवल एक प्रतिशत भी सुधरे, तो क्या इसका सचमुच कोई मोल है?", voice: "Aoede", file: "hi_3.wav" },
    { text: "यही काइज़ेन है। और किंतसुगी को स्मरण रखो: स्वर्ण से जुड़ा पात्र अखंड मिट्टी से भी अधिक दृढ़ होता है। तुम्हारे संघर्ष ही तुम्हारी स्वर्णिम आभा हैं।", voice: "Charon", file: "hi_4.wav" },
    { text: "गामन! तीव्र आंधी में झुकने वाले बांस की भांति, मेरा संकल्प कभी नहीं टूटेगा!", voice: "Aoede", file: "hi_5.wav" },
    { text: "जब तुम्हारा अनुशासन उद्देश्य से मिलता है, तब तुम अपने वास्तविक इकिगाई को प्राप्त करती हो।", voice: "Charon", file: "hi_6.wav" },
    { text: "धन्यवाद गुरुजी। हम साथ मिलकर इस मार्ग पर चलेंगे।", voice: "Aoede", file: "hi_7a.wav" },
    { text: "ससम्मान नमन करो, आओई। हमारी यात्रा तो बस अभी आरंभ हुई है।", voice: "Charon", file: "hi_7b.wav" }
  ]
};

async function main() {
  console.log("=============================================================================");
  console.log("🌍 SYNTHESIZING 6 MULTILINGUAL DUB TRACKS (JA, EN, ES, FR, DE, HI)");
  console.log("=============================================================================");

  for (const [lang, lines] of Object.entries(SCRIPTS)) {
    console.log(`\n🎌 [${lang.toUpperCase()}] Synthesizing 8 Dialogue Lines...`);
    for (const item of lines) {
      await synthVoice(item.text, item.voice, item.file);
    }
  }

  console.log("\n🎬 Mastering 6 Multi-Language Audio Tracks on Cloudtop...");
  execSync(`scp scratch/multilingual/*.wav nitinagga.c.googlers.com:~/zyvoriq/scratch/multilingual/`);

  execSync(`ssh nitinagga.c.googlers.com "
    cd ~/zyvoriq
    mkdir -p public/assets/audio/anime_dubs

    LANGS=('ja' 'en' 'es' 'fr' 'de' 'hi')
    for L in \"\\\${LANGS[@]}\"; do
      echo \"Mastering \$L Audio Track...\"
      
      # Act 1 to 7 Sequential Concat
      ffmpeg -y -i scratch/multilingual/\\\${L}_1.wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.2,pan=stereo|c0=0.2*c0|c1=0.95*c0,adelay=500|500,apad=pad_dur=8,atrim=0:8.0' -ar 48000 scratch/multilingual/\\\${L}_act1.wav
      ffmpeg -y -i scratch/multilingual/\\\${L}_2.wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.35,pan=stereo|c0=0.95*c0|c1=0.2*c0,adelay=500|500,apad=pad_dur=8,atrim=0:8.0' -ar 48000 scratch/multilingual/\\\${L}_act2.wav
      ffmpeg -y -i scratch/multilingual/\\\${L}_3.wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.15,pan=stereo|c0=0.2*c0|c1=0.95*c0,adelay=500|500,apad=pad_dur=8,atrim=0:8.0' -ar 48000 scratch/multilingual/\\\${L}_act3.wav
      ffmpeg -y -i scratch/multilingual/\\\${L}_4.wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.35,pan=stereo|c0=0.95*c0|c1=0.2*c0,adelay=500|500,apad=pad_dur=8,atrim=0:8.0' -ar 48000 scratch/multilingual/\\\${L}_act4.wav
      ffmpeg -y -i scratch/multilingual/\\\${L}_5.wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.15,pan=stereo|c0=0.2*c0|c1=0.95*c0,adelay=500|500,apad=pad_dur=8,atrim=0:8.0' -ar 48000 scratch/multilingual/\\\${L}_act5.wav
      ffmpeg -y -i scratch/multilingual/\\\${L}_6.wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.2,pan=stereo|c0=0.95*c0|c1=0.2*c0,adelay=500|500,apad=pad_dur=8,atrim=0:8.0' -ar 48000 scratch/multilingual/\\\${L}_act6.wav
      ffmpeg -y -i scratch/multilingual/\\\${L}_7a.wav -i scratch/multilingual/\\\${L}_7b.wav -filter_complex '[0:a]silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.1,pan=stereo|c0=0.2*c0|c1=0.95*c0,adelay=400|400,atrim=0:3.2[a7a];[1:a]silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.15,pan=stereo|c0=0.95*c0|c1=0.2*c0,adelay=3600|3600,atrim=0:7.5[a7b];[a7a][a7b]amix=inputs=2:duration=longest[a7mix];[a7mix]apad=pad_dur=8,atrim=0:8.0[a7out]' -map '[a7out]' -ar 48000 scratch/multilingual/\\\${L}_act7.wav

      # Concat 7 acts
      ffmpeg -y \
        -i scratch/multilingual/\\\${L}_act1.wav \
        -i scratch/multilingual/\\\${L}_act2.wav \
        -i scratch/multilingual/\\\${L}_act3.wav \
        -i scratch/multilingual/\\\${L}_act4.wav \
        -i scratch/multilingual/\\\${L}_act5.wav \
        -i scratch/multilingual/\\\${L}_act6.wav \
        -i scratch/multilingual/\\\${L}_act7.wav \
        -filter_complex '[0:a][1:a][2:a][3:a][4:a][5:a][6:a]concat=n=7:v=0:a=1[vconcat];[vconcat]aecho=0.8:0.85:25:0.18[clean_dialogue]' \
        -map '[clean_dialogue]' -ar 48000 -t 56.00 scratch/multilingual/\\\${L}_dialogue_seq.wav

      # Mix with Zen orchestral score
      ffmpeg -y \
        -i scratch/multilingual/\\\${L}_dialogue_seq.wav \
        -i scratch/cinematic_anime_score.wav \
        -filter_complex '[0:a]volume=1.5[v];[1:a]volume=0.28[m];[v][m]amix=inputs=2:duration=first[aout];[aout]alimiter=limit=0.95:attack=5:release=50[limited]' \
        -map '[limited]' -t 56.00 -ar 48000 public/assets/audio/anime_dubs/dub_\\\${L}.mp3

      ls -lh public/assets/audio/anime_dubs/dub_\\\${L}.mp3
    done
  "`);

  fs.mkdirSync('public/assets/audio/anime_dubs', { recursive: true });
  execSync(`scp nitinagga.c.googlers.com:~/zyvoriq/public/assets/audio/anime_dubs/* public/assets/audio/anime_dubs/`);
  console.log("🎉 ALL 6 MULTILINGUAL DUB TRACKS ARE MASTERED & READY!");
}

main().catch(console.error);
