import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const AUDIO_SPECS = [
  {
    name: 'Pixar Whimsical Fantasy Orchestral',
    fileName: 'soundtrack_pixar_wonder_32s.wav',
    duration: 32,
    type: 'pixar'
  },
  {
    name: 'Epic Shonen Anime Battle Rock & Strings',
    fileName: 'soundtrack_anime_sakuga_32s.wav',
    duration: 32,
    type: 'anime'
  },
  {
    name: 'Cyber Tech Synthwave & Phonk Groove',
    fileName: 'soundtrack_influencer_tech_32s.wav',
    duration: 32,
    type: 'synthwave'
  },
  {
    name: 'Midnight Rain Atmospheric Jazz & Cello Noir',
    fileName: 'soundtrack_cinema_noir_32s.wav',
    duration: 32,
    type: 'noir'
  }
];

async function generateSoundtracks() {
  console.log('========================================================================');
  console.log('🎵 GENERATING CINEMATIC 32-SECOND STEREO SOUNDTRACKS');
  console.log('   Web Audio DSP Synthesizer in Signed Google Chrome');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    fs.mkdirSync('public/assets/audio', { recursive: true });

    for (const spec of AUDIO_SPECS) {
      console.log(`🎼 Synthesizing: ${spec.name} (${spec.duration}s)...`);

      const audioBase64 = await page.evaluate(async (trackType, dur) => {
        return new Promise((resolve) => {
          const sampleRate = 44100;
          const numSamples = sampleRate * dur;
          const audioCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, numSamples, sampleRate);

          if (trackType === 'pixar') {
            // Whimsical Pixar Melody: Celesta, Harp Arpeggios & Warm Strings
            const majorScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25];
            for (let t = 0; t < dur; t += 0.25) {
              const note = majorScale[Math.floor(Math.sin(t * 1.5) * 3 + 3)];
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(note, t);
              gain.gain.setValueAtTime(0.12, t);
              gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start(t);
              osc.stop(t + 0.45);
            }
            // Warm string pad bassline
            const chords = [130.81, 164.81, 174.61, 196.00];
            for (let t = 0; t < dur; t += 4) {
              const chord = chords[Math.floor(t / 4) % chords.length];
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(chord, t);
              gain.gain.setValueAtTime(0.15, t);
              gain.gain.exponentialRampToValueAtTime(0.01, t + 3.8);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start(t);
              osc.stop(t + 4);
            }
          } else if (trackType === 'anime') {
            // High-Octane Anime Battle: Driving Bass, Electric Sawtooth Riffs & Taiko Hits
            for (let t = 0; t < dur; t += 0.2) {
              // Rapid 16th note bass riff
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sawtooth';
              const riffFreq = [110, 110, 130.81, 146.83, 110, 164.81][Math.floor(t * 5) % 6];
              osc.frequency.setValueAtTime(riffFreq, t);
              gain.gain.setValueAtTime(0.18, t);
              gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start(t);
              osc.stop(t + 0.2);
            }
            // Heavy Taiko drum impact every 0.8s
            for (let t = 0; t < dur; t += 0.8) {
              const kick = audioCtx.createOscillator();
              const kickGain = audioCtx.createGain();
              kick.type = 'sine';
              kick.frequency.setValueAtTime(160, t);
              kick.frequency.exponentialRampToValueAtTime(35, t + 0.3);
              kickGain.gain.setValueAtTime(0.4, t);
              kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
              kick.connect(kickGain);
              kickGain.connect(audioCtx.destination);
              kick.start(t);
              kick.stop(t + 0.4);
            }
          } else if (trackType === 'synthwave') {
            // Modern Tech Synthwave: Punchy 4-on-the-floor kick, rolling 808 bass & neon arpeggios
            for (let t = 0; t < dur; t += 0.5) {
              const kick = audioCtx.createOscillator();
              const kickGain = audioCtx.createGain();
              kick.type = 'sine';
              kick.frequency.setValueAtTime(130, t);
              kick.frequency.exponentialRampToValueAtTime(45, t + 0.2);
              kickGain.gain.setValueAtTime(0.35, t);
              kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
              kick.connect(kickGain);
              kickGain.connect(audioCtx.destination);
              kick.start(t);
              kick.stop(t + 0.25);
            }
            for (let t = 0; t < dur; t += 0.125) {
              const arp = audioCtx.createOscillator();
              const arpGain = audioCtx.createGain();
              arp.type = 'sawtooth';
              const scale = [220, 261.63, 329.63, 440, 523.25, 659.25];
              arp.frequency.setValueAtTime(scale[Math.floor(t * 8) % scale.length], t);
              arpGain.gain.setValueAtTime(0.06, t);
              arpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
              arp.connect(arpGain);
              arpGain.connect(audioCtx.destination);
              arp.start(t);
              arp.stop(t + 0.12);
            }
          } else {
            // Cinema Noir: Low cello drone & moody minor jazz piano chords
            for (let t = 0; t < dur; t += 4) {
              const root = [55, 65.41, 73.42, 65.41][Math.floor(t / 4) % 4];
              const cello = audioCtx.createOscillator();
              const celloGain = audioCtx.createGain();
              cello.type = 'triangle';
              cello.frequency.setValueAtTime(root, t);
              celloGain.gain.setValueAtTime(0.2, t);
              celloGain.gain.exponentialRampToValueAtTime(0.02, t + 3.9);
              cello.connect(celloGain);
              celloGain.connect(audioCtx.destination);
              cello.start(t);
              cello.stop(t + 4);
            }
          }

          audioCtx.startRendering().then((renderedBuffer) => {
            // Convert AudioBuffer to WAV
            const numOfChan = renderedBuffer.numberOfChannels;
            const length = renderedBuffer.length * numOfChan * 2 + 44;
            const outBuf = new ArrayBuffer(length);
            const view = new DataView(outBuf);
            const channels = [];
            let offset = 0;
            let pos = 0;

            function setUint16(data) {
              view.setUint16(pos, data, true);
              pos += 2;
            }
            function setUint32(data) {
              view.setUint32(pos, data, true);
              pos += 4;
            }

            // Write WAV Header
            setUint32(0x46464952); // "RIFF"
            setUint32(length - 8);  // file length - 8
            setUint32(0x45564157); // "WAVE"
            setUint32(0x20746d66); // "fmt " chunk
            setUint32(16);         // length = 16
            setUint16(1);          // PCM
            setUint16(numOfChan);
            setUint32(sampleRate);
            setUint32(sampleRate * 2 * numOfChan); // byte rate
            setUint16(numOfChan * 2); // block align
            setUint16(16);         // bits per sample
            setUint32(0x61746164); // "data" chunk
            setUint32(length - pos - 4); // data length

            for (let i = 0; i < renderedBuffer.numberOfChannels; i++) {
              channels.push(renderedBuffer.getChannelData(i));
            }

            while (pos < length) {
              for (let i = 0; i < numOfChan; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                view.setInt16(pos, sample, true);
                pos += 2;
              }
              offset++;
            }

            const bytes = new Uint8Array(outBuf);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            resolve(btoa(binary));
          });
        });
      }, spec.type, spec.duration);

      const wavBuf = Buffer.from(audioBase64, 'base64');
      const outPath = path.resolve(process.cwd(), 'public/assets/audio', spec.fileName);
      fs.writeFileSync(outPath, wavBuf);
      console.log(`   ✅ Saved: ${spec.fileName} (${(wavBuf.length / 1024 / 1024).toFixed(2)} MB)`);
    }
  } catch (err) {
    console.error('❌ Audio generation error:', err);
  } finally {
    await browser.close();
  }
}

generateSoundtracks().catch(console.error);
