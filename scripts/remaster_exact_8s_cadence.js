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
  console.log(`🎙️ [${voiceName}] Synthesizing: "${text}"`);
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
    fs.mkdirSync('scratch/cadence_dubs_v2', { recursive: true });
    const outPath = `scratch/cadence_dubs_v2/${filename}`;
    fs.writeFileSync(outPath, wav);
    const dur = rawPcm.length / (24000 * 2);
    console.log(`   ⏱️ Raw Duration: ${dur.toFixed(2)}s -> ${filename}`);
    return { outPath, dur };
  }
  throw new Error(`TTS Error: ${JSON.stringify(data)}`);
}

const SCRIPTS = {
  ja: [
    { text: "蓮先生…毎朝鍛錬していますが、なぜ私は未だに弱く、迷うのでしょうか？", voice: "Aoede", file: "ja_1.wav" },
    { text: "庭を見よ、葵。桜梅桃李。焦るでない、お前の花も必ず咲く。", voice: "Charon", file: "ja_2.wav" },
    { text: "己の季節…ならば今日の一振りも、確かな一歩の前進ですね？", voice: "Aoede", file: "ja_3.wav" },
    { text: "そうだ、それが改善だ。そして金継ぎを見よ。傷こそがお前を美しくする。", voice: "Charon", file: "ja_4.wav" },
    { text: "我慢！嵐に撓む竹のように、どんな困難にも私の心は折れません！", voice: "Aoede", file: "ja_5.wav" },
    { text: "見事だ、葵。己の鍛錬と慈悲が一つになる時、人は真の生き甲斐を見出す。", voice: "Charon", file: "ja_6.wav" },
    { text: "ありがとうございます、蓮先生。", voice: "Aoede", file: "ja_7a.wav" },
    { text: "共に歩もう、葵。夜明けは近い。", voice: "Charon", file: "ja_7b.wav" }
  ],
  en: [
    { text: "Sensei Ren... I train every sunrise, yet why do I still feel so uncertain?", voice: "Aoede", file: "en_1.wav" },
    { text: "Look at the garden, Aoi. Oubaitori teaches: never compare your spring to another's summer.", voice: "Charon", file: "en_2.wav" },
    { text: "My own season... then today's single practice stroke truly builds my mastery?", voice: "Aoede", file: "en_3.wav" },
    { text: "That is Kaizen. And remember Kintsugi: mended scars become your greatest strength.", voice: "Charon", file: "en_4.wav" },
    { text: "Gaman! Like bamboo bending in the storm, no hardship will ever break my resolve!", voice: "Aoede", file: "en_5.wav" },
    { text: "Well spoken, Aoi. When discipline unites with compassion, you awaken your true Ikigai.", voice: "Charon", file: "en_6.wav" },
    { text: "Thank you deeply, Sensei Ren.", voice: "Aoede", file: "en_7a.wav" },
    { text: "Walk with honor, Aoi. A new dawn begins.", voice: "Charon", file: "en_7b.wav" }
  ],
  es: [
    { text: "Sensei Ren... entreno cada amanecer, pero ¿por qué sigo sintiendo tanta duda?", voice: "Aoede", file: "es_1.wav" },
    { text: "Mira el jardín, Aoi. Oubaitori nos enseña: nunca compares tu primavera con el verano ajeno.", voice: "Charon", file: "es_2.wav" },
    { text: "Mi propia estación... ¿entonces cada golpe de hoy forja mi verdadera maestría?", voice: "Aoede", file: "es_3.wav" },
    { text: "Eso es Kaizen. Y recuerda Kintsugi: las cicatrices unidas con oro son tu mayor fuerza.", voice: "Charon", file: "es_4.wav" },
    { text: "¡Gaman! Como el bambú en la tormenta, ¡ninguna dificultad quebrará mi resolución!", voice: "Aoede", file: "es_5.wav" },
    { text: "Bien dicho, Aoi. Cuando la disciplina se une a la compasión, despiertas tu verdadero Ikigai.", voice: "Charon", file: "es_6.wav" },
    { text: "Muchas gracias, Sensei Ren.", voice: "Aoede", file: "es_7a.wav" },
    { text: "Caminemos con honor, Aoi. Comienza un nuevo amanecer.", voice: "Charon", file: "es_7b.wav" }
  ],
  fr: [
    { text: "Sensei Ren... je m'entraîne à chaque aube, mais pourquoi ai-je encore tant de doutes ?", voice: "Aoede", file: "fr_1.wav" },
    { text: "Regarde le jardin, Aoi. L'Oubaitori enseigne : ne compare jamais ton printemps à l'été d'autrui.", voice: "Charon", file: "fr_2.wav" },
    { text: "Ma propre saison... alors chaque geste aujourd'hui forge ma véritable maîtrise ?", voice: "Aoede", file: "fr_3.wav" },
    { text: "C'est cela, le Kaizen. Et souviens-toi du Kintsugi : tes fêlures d'or sont ta plus grande force.", voice: "Charon", file: "fr_4.wav" },
    { text: "Gaman ! Comme le bambou dans la tempête, aucune épreuve ne brisera ma résolution !", voice: "Aoede", file: "fr_5.wav" },
    { text: "Bien parlé, Aoi. Quand la discipline s'unit à la compassion, tu éveilles ton véritable Ikigai.", voice: "Charon", file: "fr_6.wav" },
    { text: "Merci de tout cœur, Sensei Ren.", voice: "Aoede", file: "fr_7a.wav" },
    { text: "Marchons avec honneur, Aoi. Une nouvelle aube commence.", voice: "Charon", file: "fr_7b.wav" }
  ],
  de: [
    { text: "Sensei Ren... ich trainiere jeden Morgen, doch warum spüre ich noch so viel Zweifel?", voice: "Aoede", file: "de_1.wav" },
    { text: "Schau den Garten an, Aoi. Oubaitori lehrt: Vergleiche deinen Frühling nie mit dem Sommer anderer.", voice: "Charon", file: "de_2.wav" },
    { text: "Meine eigene Zeit... formt also jeder heutige Schritt meine wahre Meisterschaft?", voice: "Aoede", file: "de_3.wav" },
    { text: "Das ist Kaizen. Und denk an Kintsugi: Mit Gold geheilte Narben sind deine größte Stärke.", voice: "Charon", file: "de_4.wav" },
    { text: "Gaman! Wie Bambus im Sturm wird keine Prüfung meine Entschlossenheit brechen!", voice: "Aoede", file: "de_5.wav" },
    { text: "Wohlgesprochen, Aoi. Wenn Disziplin und Mitgefühl sich einen, erwacht dein wahres Ikigai.", voice: "Charon", file: "de_6.wav" },
    { text: "Habt vielen Dank, Sensei Ren.", voice: "Aoede", file: "de_7a.wav" },
    { text: "Gehen wir in Ehren, Aoi. Ein neuer Tag beginnt.", voice: "Charon", file: "de_7b.wav" }
  ],
  hi: [
    { text: "गुरुजी रेन... मैं हर भोर अभ्यास करती हूँ, फिर भी मैं इतनी संशय में क्यों हूँ?", voice: "Aoede", file: "hi_1.wav" },
    { text: "उपवन को देखो, आओई। उबैतोरी सिखाता है: कभी अपनी वसंत की तुलना किसी और के ग्रीष्म से मत करो।", voice: "Charon", file: "hi_2.wav" },
    { text: "मेरी अपनी ऋतु... तो आज का मेरा यह एक अभ्यास भी मेरी कुशलता को गढ़ता है?", voice: "Aoede", file: "hi_3.wav" },
    { text: "यही काइज़ेन है। और किंतसुगी को याद रखो: स्वर्ण से जुड़ी दरारें ही तुम्हारी सबसे बड़ी शक्ति हैं।", voice: "Charon", file: "hi_4.wav" },
    { text: "गामन! आंधी में झुकने वाले बांस की भांति, कोई भी विपदा मेरे संकल्प को तोड़ नहीं सकती!", voice: "Aoede", file: "hi_5.wav" },
    { text: "उत्कृष्ट, आओई। जब अनुशासन करुणा से जुड़ता है, तब तुम अपने सच्चे इकिगाई को जागृत करती हो।", voice: "Charon", file: "hi_6.wav" },
    { text: "कोटि-कोटि धन्यवाद, गुरुजी रेन।", voice: "Aoede", file: "hi_7a.wav" },
    { text: "ससम्मान आगे बढ़ो, आओई। एक नया प्रभात आरंभ होता है।", voice: "Charon", file: "hi_7b.wav" }
  ]
};

async function main() {
  console.log("=============================================================================");
  console.log("🌸 SYNTHESIZING NATURAL 1.0X UNRUSHED DIALOGUE LINES ACROSS ALL 6 LANGUAGES");
  console.log("=============================================================================");

  for (const [lang, lines] of Object.entries(SCRIPTS)) {
    console.log(`\n🎌 [${lang.toUpperCase()}] Synthesizing...`);
    for (const item of lines) {
      await synthVoice(item.text, item.voice, item.file);
    }
  }

  console.log("\n🎬 Uploading to Cloudtop for Exact 8.000000s Audio Block Mastering...");
  execSync(`scp -r scratch/cadence_dubs_v2 nitinagga.c.googlers.com:~/zyvoriq/scratch/`);

  execSync(`ssh nitinagga.c.googlers.com "
    cd ~/zyvoriq
    mkdir -p public/assets/audio/anime_dubs

    LANGS=('ja' 'en' 'es' 'fr' 'de' 'hi')
    for L in \"\${LANGS[@]}\"; do
      echo \"🎬 Mastering \$L Audio to exact 8.000000s blocks...\"

      # Acts 1 to 6: 
      # 1. Clean silence at edges
      # 2. Add 800ms lead-in (adelay=800|800)
      # 3. Mix into exactly 8.000000s silence container (duration=first)
      for i in 1 2 3 4 5 6; do
        if [ \$i -eq 1 ] || [ \$i -eq 3 ] || [ \$i -eq 5 ]; then
          pan=\"pan=stereo|c0=0.25*c0|c1=0.95*c0\"
        else
          pan=\"pan=stereo|c0=0.95*c0|c1=0.25*c0\"
        fi

        ffmpeg -y -i scratch/cadence_dubs_v2/\${L}_\${i}.wav -filter_complex \"
          [0:a]silenceremove=start_periods=1:start_threshold=-45dB,\$pan,adelay=800|800[speech];
          aevalsrc=0:d=8.0:s=48000[silence];
          [silence][speech]amix=inputs=2:duration=first:dropout_transition=0[act_out]
        \" -map '[act_out]' -ar 48000 scratch/cadence_dubs_v2/\${L}_act\${i}_8s.wav
      done

      # Act 7 (Bow Scene):
      # Line 7a (Aoi): Starts at 1.0s (adelay=1000|1000)
      # Line 7b (Ren): Starts at 4.2s (adelay=4200|4200)
      # Container: Exactly 8.000000s
      ffmpeg -y \
        -i scratch/cadence_dubs_v2/\${L}_7a.wav \
        -i scratch/cadence_dubs_v2/\${L}_7b.wav \
        -filter_complex \"
          [0:a]silenceremove=start_periods=1:start_threshold=-45dB,pan=stereo|c0=0.25*c0|c1=0.95*c0,adelay=1000|1000[a7a];
          [1:a]silenceremove=start_periods=1:start_threshold=-45dB,pan=stereo|c0=0.95*c0|c1=0.25*c0,adelay=4200|4200[a7b];
          [a7a][a7b]amix=inputs=2:dropout_transition=0[a7speech];
          aevalsrc=0:d=8.0:s=48000[silence];
          [silence][a7speech]amix=inputs=2:duration=first:dropout_transition=0[act7_out]
        \" -map '[act7_out]' -ar 48000 scratch/cadence_dubs_v2/\${L}_act7_8s.wav

      # Concat all 7 acts into exactly 56.000000s dialogue master
      ffmpeg -y \
        -i scratch/cadence_dubs_v2/\${L}_act1_8s.wav \
        -i scratch/cadence_dubs_v2/\${L}_act2_8s.wav \
        -i scratch/cadence_dubs_v2/\${L}_act3_8s.wav \
        -i scratch/cadence_dubs_v2/\${L}_act4_8s.wav \
        -i scratch/cadence_dubs_v2/\${L}_act5_8s.wav \
        -i scratch/cadence_dubs_v2/\${L}_act6_8s.wav \
        -i scratch/cadence_dubs_v2/\${L}_act7_8s.wav \
        -filter_complex \"[0:a][1:a][2:a][3:a][4:a][5:a][6:a]concat=n=7:v=0:a=1[clean_dialogue]\" \
        -map '[clean_dialogue]' -ar 48000 -t 56.00 scratch/cadence_dubs_v2/\${L}_dialogue_master.wav

      # Mix with Ambient Zen Koto Score
      ffmpeg -y \
        -i scratch/cadence_dubs_v2/\${L}_dialogue_master.wav \
        -i scratch/cinematic_anime_score.wav \
        -filter_complex '[0:a]volume=1.5[v];[1:a]volume=0.28[m];[v][m]amix=inputs=2:duration=first[aout];[aout]alimiter=limit=0.95:attack=5:release=50[limited]' \
        -map '[limited]' -t 56.00 -ar 48000 public/assets/audio/anime_dubs/dub_\${L}.mp3

      echo \"Duration of dub_\${L}.mp3:\"
      ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 public/assets/audio/anime_dubs/dub_\${L}.mp3
    done

    # Re-mux master video with perfectly synced Japanese dub
    ffmpeg -y \
      -i scratch/consistent_anime/visual_56s_master.mp4 \
      -i public/assets/audio/anime_dubs/dub_ja.mp3 \
      -map 0:v:0 -map 1:a:0 \
      -c:v copy -c:a aac -b:a 320k \
      -t 56.00 -movflags +faststart \
      public/assets/video/ren_and_aoi_conversation_synced.mp4

    echo \"Duration of remuxed MP4:\"
    ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 public/assets/video/ren_and_aoi_conversation_synced.mp4
  "`);

  execSync(`scp -r nitinagga.c.googlers.com:~/zyvoriq/public/assets/audio/anime_dubs/* public/assets/audio/anime_dubs/`);
  execSync(`scp nitinagga.c.googlers.com:~/zyvoriq/public/assets/video/ren_and_aoi_conversation_synced.mp4 public/assets/video/`);
  execSync(`cp public/assets/video/ren_and_aoi_conversation_synced.mp4 /Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/`);
  console.log("\n🎉 ALL 6 DUBS AND MASTER VIDEO REMASTERED WITH PERFECT NATURAL CADENCE!");
}

main().catch(console.error);
