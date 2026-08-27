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
    fs.mkdirSync('scratch/cadence_dubs', { recursive: true });
    const outPath = `scratch/cadence_dubs/${filename}`;
    fs.writeFileSync(outPath, wav);
    return outPath;
  }
  throw new Error(`TTS Error: ${JSON.stringify(data)}`);
}

const SCRIPTS = {
  ja: [
    { text: "蓮先生…毎朝手のひらが擦り切れるまで鍛錬していますが、なぜ私は未だに弱く、迷いばかりなのでしょうか？", voice: "Aoede", file: "ja_1.wav" },
    { text: "庭を見るのだ、葵。桜梅桃李—桜も梅も桃も李も、己の季節に咲き誇る。焦るでない、お前の春も必ず訪れる。", voice: "Charon", file: "ja_2.wav" },
    { text: "己の季節…ならば今日のこの一振りの太刀筋も、僅か一歩の前進だとしても、確かな意味があるのですね？", voice: "Aoede", file: "ja_3.wav" },
    { text: "そうだ、それこそが改善だ。そして金継ぎを見よ。傷を漆と金で繕うように、過ちこそがお前を強く美しくする。", voice: "Charon", file: "ja_4.wav" },
    { text: "我慢！嵐に撓みながらも折れぬ竹のように、どんな逆境であっても私の魂と決意は決して折れません！", voice: "Aoede", file: "ja_5.wav" },
    { text: "見事だ、葵。己の鍛錬と他者への慈悲が一つになる時、人は真の生き甲斐と天命を見出すのだ。", voice: "Charon", file: "ja_6.wav" },
    { text: "ありがとうございます、蓮先生。この道を共に歩みます。", voice: "Aoede", file: "ja_7a.wav" },
    { text: "礼を尽くし、心清らかに、新たな夜明けへと進もう。", voice: "Charon", file: "ja_7b.wav" }
  ],
  en: [
    { text: "Sensei Ren... I train every single sunrise until my hands bleed. But why do I still feel so weak and uncertain of my strength?", voice: "Aoede", file: "en_1.wav" },
    { text: "Look at the garden, Aoi. Oubaitori teaches us that the cherry and the plum bloom in their own sacred time. Never measure your spring against another's summer.", voice: "Charon", file: "en_2.wav" },
    { text: "My own sacred time... then my practice today, even if it only improves by a single fraction, truly builds my mastery?", voice: "Aoede", file: "en_3.wav" },
    { text: "That is Kaizen. And remember Kintsugi: the clay mended with gold becomes more precious than before. Your struggles are your golden seams.", voice: "Charon", file: "en_4.wav" },
    { text: "Gaman! Like the resilient bamboo bending in the fiercest storm, no obstacle will ever shatter my spirit or my resolve!", voice: "Aoede", file: "en_5.wav" },
    { text: "Well spoken, Aoi. When unwavering discipline unites with deep compassion, you awaken your true Ikigai and life's sacred purpose.", voice: "Charon", file: "en_6.wav" },
    { text: "Arigatou gozaimasu, Sensei. Together we honor this path.", voice: "Aoede", file: "en_7a.wav" },
    { text: "Bow with honor, Aoi. Our greatest journey begins at dawn.", voice: "Charon", file: "en_7b.wav" }
  ],
  es: [
    { text: "Sensei Ren... entreno cada amanecer hasta que sangran mis manos. Pero ¿por qué sigo sintiéndome tan débil e insegura de mi fuerza?", voice: "Aoede", file: "es_1.wav" },
    { text: "Mira el jardín, Aoi. Oubaitori nos enseña que el cerezo y el ciruelo florecen en su tiempo sagrado. Nunca compares tu primavera con el verano ajeno.", voice: "Charon", file: "es_2.wav" },
    { text: "Mi tiempo sagrado... entonces mi práctica hoy, ¿aunque solo mejore una pequeña fracción, de verdad forja mi maestría?", voice: "Aoede", file: "es_3.wav" },
    { text: "Eso es Kaizen. Y recuerda Kintsugi: la cerámica unida con oro se vuelve más valiosa que antes. Tus cicatrices son tus vetas doradas.", voice: "Charon", file: "es_4.wav" },
    { text: "¡Gaman! Como el bambú flexible ante la tempestad más feroz, ¡ningún obstáculo quebrará jamás mi espíritu ni mi resolución!", voice: "Aoede", file: "es_5.wav" },
    { text: "Bien dicho, Aoi. Cuando la disciplina se une a la compasión sincera, despiertas tu verdadero Ikigai y tu propósito sagrado.", voice: "Charon", file: "es_6.wav" },
    { text: "Muchas gracias, Sensei. Juntos honramos este camino.", voice: "Aoede", file: "es_7a.wav" },
    { text: "Inclínate con honor, Aoi. Nuestro gran viaje comienza con el alba.", voice: "Charon", file: "es_7b.wav" }
  ],
  fr: [
    { text: "Sensei Ren... je m'entraîne à chaque aube jusqu'à l'épuisement. Mais pourquoi ai-je encore le sentiment d'être si faible et incertaine ?", voice: "Aoede", file: "fr_1.wav" },
    { text: "Regarde le jardin, Aoi. Oubaitori nous enseigne que le cerisier et le prunier s'épanouissent en leur temps sacré. Ne compare jamais ton printemps à l'été d'autrui.", voice: "Charon", file: "fr_2.wav" },
    { text: "Mon temps sacré... alors ma pratique aujourd'hui, même améliorée d'une infime fraction, forge-t-elle réellement ma maîtrise ?", voice: "Aoede", file: "fr_3.wav" },
    { text: "C'est cela, le Kaizen. Et souviens-toi du Kintsugi : l'argile réparée d'or devient plus précieuse qu'autrefois. Tes épreuves sont tes veines d'or.", voice: "Charon", file: "fr_4.wav" },
    { text: "Gaman ! Comme le bambou qui plie sous la plus violente tempête, aucun obstacle ne brisera jamais mon esprit ni ma détermination !", voice: "Aoede", file: "fr_5.wav" },
    { text: "Bien parlé, Aoi. Quand la discipline s'unit à la compassion profonde, tu révèles ton véritable Ikigai et ta noble raison d'être.", voice: "Charon", file: "fr_6.wav" },
    { text: "Merci infiniment, Sensei. Ensemble, nous honorons cette voie.", voice: "Aoede", file: "fr_7a.wav" },
    { text: "Incline-toi avec honneur, Aoi. Notre plus grand voyage commence à l'aube.", voice: "Charon", file: "fr_7b.wav" }
  ],
  de: [
    { text: "Sensei Ren... ich trainiere bei jedem Sonnenaufgang unermüdlich. Aber warum fühle ich mich noch immer so schwach und unsicher?", voice: "Aoede", file: "de_1.wav" },
    { text: "Schau in den Garten, Aoi. Oubaitori lehrt uns: Kirsche und Pflaume blühen zu ihrer eigenen heiligen Zeit. Vergleiche deinen Frühling nie mit dem Sommer eines anderen.", voice: "Charon", file: "de_2.wav" },
    { text: "Meine eigene Zeit... bedeutet das, mein Training heute, selbst wenn es sich nur um einen Bruchteil verbessert, formt meine Meisterschaft?", voice: "Aoede", file: "de_3.wav" },
    { text: "Das ist Kaizen. Und denk an Kintsugi: Mit Gold reparierter Ton wird kostbarer als je zuvor. Deine Prüfungen sind deine goldenen Linien.", voice: "Charon", file: "de_4.wav" },
    { text: "Gaman! Wie der biegsame Bambus im wildesten Sturm wird kein Hindernis jemals meinen Geist oder meine Entschlossenheit brechen!", voice: "Aoede", file: "de_5.wav" },
    { text: "Treffend gesprochen, Aoi. Wenn Disziplin und Mitgefühl verschmelzen, erwacht dein wahres Ikigai und deine Bestimmung.", voice: "Charon", file: "de_6.wav" },
    { text: "Arigatou gozaimasu, Sensei. Gemeinsam ehren wir diesen Pfad.", voice: "Aoede", file: "de_7a.wav" },
    { text: "Verneige dich mit Ehre, Aoi. Unsere größte Reise beginnt im Morgengrauen.", voice: "Charon", file: "de_7b.wav" }
  ],
  hi: [
    { text: "गुरुजी रेन... मैं हर भोर कठोर तप करती हूँ। फिर भी मैं स्वयं को इतना निर्बल और अपने सामर्थ्य के प्रति संशय में क्यों पाती हूँ?", voice: "Aoede", file: "hi_1.wav" },
    { text: "इस उपवन को देखो, आओई। उबैतोरी सिखाता है कि हर पुष्प अपनी पावन ऋतु में ही खिलता है। कभी अपनी वसंत की तुलना किसी और के ग्रीष्म से मत करो।", voice: "Charon", file: "hi_2.wav" },
    { text: "मेरी अपनी ऋतु... तो आज का मेरा यह अभ्यास, यदि यह एक सूक्ष्म अंश भी सुधरे, तो क्या यह सचमुच मेरी कुशलता को गढ़ता है?", voice: "Aoede", file: "hi_3.wav" },
    { text: "यही काइज़ेन है। और किंतसुगी को स्मरण रखो: स्वर्ण से संवारा गया पात्र पहले से भी अधिक मूल्यवान होता है। तुम्हारे संघर्ष ही तुम्हारी स्वर्णिम रेखाएं हैं।", voice: "Charon", file: "hi_4.wav" },
    { text: "गामन! तीव्र आंधी में झुकने वाले बांस की भांति, कोई भी विपदा मेरे संकल्प और मेरी आत्मा को कभी तोड़ नहीं सकती!", voice: "Aoede", file: "hi_5.wav" },
    { text: "उत्कृष्ट विचार, आओई। जब अटूट अनुशासन करुणा से जुड़ता है, तब तुम अपने सच्चे इकिगाई और जीवन के पावन उद्देश्य को जागृत करती हो।", voice: "Charon", file: "hi_6.wav" },
    { text: "कोटि-कोटि धन्यवाद गुरुजी। हम साथ मिलकर इस पवित्र मार्ग का मान रखेंगे।", voice: "Aoede", file: "hi_7a.wav" },
    { text: "ससम्मान नमन करो, आओई। हमारी सबसे महान यात्रा इस उषाकाल से आरंभ होती है।", voice: "Charon", file: "hi_7b.wav" }
  ]
};

async function main() {
  console.log("=============================================================================");
  console.log("🌸 SYNTHESIZING PERFECT-CADENCE DIALOGUE LINES (FILLS 0.6s to 7.4s PER ACT)");
  console.log("=============================================================================");

  for (const [lang, lines] of Object.entries(SCRIPTS)) {
    console.log(`\n🎌 [${lang.toUpperCase()}] Synthesizing 8 Dialogue Lines...`);
    for (const item of lines) {
      await synthVoice(item.text, item.voice, item.file);
    }
  }

  console.log("\n🎬 Uploading to Cloudtop for Precision Audio Mastering...");
  execSync(`scp scratch/cadence_dubs/*.wav nitinagga.c.googlers.com:~/zyvoriq/scratch/cadence_dubs/`);

  execSync(`ssh nitinagga.c.googlers.com "
    cd ~/zyvoriq
    mkdir -p public/assets/audio/anime_dubs

    LANGS=('ja' 'en' 'es' 'fr' 'de' 'hi')
    for L in \"\${LANGS[@]}\"; do
      echo \"🎬 Mastering \$L Audio Dub to exact 0.6s-7.4s cadence...\"

      # Acts 1 to 6: Normalize to 6.8s spoken duration, start at 0.60s (adelay=600), end at 7.40s
      for i in 1 2 3 4 5 6; do
        # Calculate raw duration
        rawDur=\$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 scratch/cadence_dubs/\${L}_\${i}.wav)
        # Compute exact tempo so speech takes exactly 6.80 seconds
        # target_duration = 6.80s => tempo = rawDur / 6.80
        tempo=\$(awk -v r=\"\$rawDur\" 'BEGIN { t = r / 6.80; if (t < 0.85) t = 0.85; if (t > 1.4) t = 1.4; printf \"%.3f\", t }')
        
        # Pan: Aoi (c0=0.25, c1=0.95), Ren (c0=0.95, c1=0.25)
        if [ \$i -eq 1 ] || [ \$i -eq 3 ] || [ \$i -eq 5 ]; then
          pan=\"pan=stereo|c0=0.25*c0|c1=0.95*c0\"
        else
          pan=\"pan=stereo|c0=0.95*c0|c1=0.25*c0\"
        fi

        ffmpeg -y -i scratch/cadence_dubs/\${L}_\${i}.wav -af \"silenceremove=start_periods=1:start_threshold=-45dB,atempo=\$tempo,\$pan,adelay=600|600,apad=pad_dur=8,atrim=0:8.00\" -ar 48000 scratch/cadence_dubs/\${L}_act\${i}_cadence.wav
      done

      # Act 7: Line 7a (Aoi: 0.60s to 3.80s), Line 7b (Ren: 4.00s to 7.40s)
      ffmpeg -y \
        -i scratch/cadence_dubs/\${L}_7a.wav \
        -i scratch/cadence_dubs/\${L}_7b.wav \
        -filter_complex '
          [0:a]silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.02,pan=stereo|c0=0.25*c0|c1=0.95*c0,adelay=600|600,atrim=0:3.80[a7a];
          [1:a]silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.05,pan=stereo|c0=0.95*c0|c1=0.25*c0,adelay=4000|4000,atrim=0:7.50[a7b];
          [a7a][a7b]amix=inputs=2:duration=longest[a7mix];
          [a7mix]apad=pad_dur=8,atrim=0:8.00[a7out]
        ' -map '[a7out]' -ar 48000 scratch/cadence_dubs/\${L}_act7_cadence.wav

      # Concat all 7 acts into 56.000s master speech track
      ffmpeg -y \
        -i scratch/cadence_dubs/\${L}_act1_cadence.wav \
        -i scratch/cadence_dubs/\${L}_act2_cadence.wav \
        -i scratch/cadence_dubs/\${L}_act3_cadence.wav \
        -i scratch/cadence_dubs/\${L}_act4_cadence.wav \
        -i scratch/cadence_dubs/\${L}_act5_cadence.wav \
        -i scratch/cadence_dubs/\${L}_act6_cadence.wav \
        -i scratch/cadence_dubs/\${L}_act7_cadence.wav \
        -filter_complex \"[0:a][1:a][2:a][3:a][4:a][5:a][6:a]concat=n=7:v=0:a=1[vconcat];[vconcat]aecho=0.8:0.85:25:0.18[clean_dialogue]\" \
        -map '[clean_dialogue]' -ar 48000 -t 56.00 scratch/cadence_dubs/\${L}_dialogue_cadence_master.wav

      # Master Dialogue + Ambient Zen Score
      ffmpeg -y \
        -i scratch/cadence_dubs/\${L}_dialogue_cadence_master.wav \
        -i scratch/cinematic_anime_score.wav \
        -filter_complex '[0:a]volume=1.5[v];[1:a]volume=0.28[m];[v][m]amix=inputs=2:duration=first[aout];[aout]alimiter=limit=0.95:attack=5:release=50[limited]' \
        -map '[limited]' -t 56.00 -ar 48000 public/assets/audio/anime_dubs/dub_\${L}.mp3

      ls -lh public/assets/audio/anime_dubs/dub_\${L}.mp3
    done

    # Re-mux default video with Japanese master
    ffmpeg -y \
      -i scratch/consistent_anime/visual_56s_master.mp4 \
      -i public/assets/audio/anime_dubs/dub_ja.mp3 \
      -map 0:v:0 -map 1:a:0 \
      -c:v copy -c:a aac -b:a 320k \
      -t 56.00 -movflags +faststart \
      public/assets/video/ren_and_aoi_conversation_synced.mp4
  "`);

  execSync(`scp -r nitinagga.c.googlers.com:~/zyvoriq/public/assets/audio/anime_dubs/* public/assets/audio/anime_dubs/`);
  execSync(`scp nitinagga.c.googlers.com:~/zyvoriq/public/assets/video/ren_and_aoi_conversation_synced.mp4 public/assets/video/`);
  console.log("🎉 ALL 6 DUBS AND MASTER VIDEO REMASTERED WITH ACCURATE CADENCE (0.6s to 7.4s)!");
}

main().catch(console.error);
