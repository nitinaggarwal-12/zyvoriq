import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const VIDEO_DIR = path.join(process.cwd(), 'scratch', 'videos');
const SCREENSHOT_DIR = path.join(process.cwd(), 'scratch', 'screenshots_live_macos');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log('🚀 Launching Google Chrome to record Authentic 2-Way Zoom Screen Sharing Video with Real Speech Dialogue...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--window-size=1440,900',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Navigate to Zoom Screen Share Page
  console.log('Navigating to http://localhost:3001/studio/zoom-screenshare...');
  await page.goto('http://localhost:3001/studio/zoom-screenshare', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1000);

  // Dismiss Cookie Banner if present
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const acceptBtn = buttons.find(b => b.textContent?.includes('Accept All'));
    if (acceptBtn) acceptBtn.click();
  });
  await sleep(1000);

  // 2. Capture Step 1: User asks question on Shot 1 audio
  console.log('📸 Capturing Step 1: User asks question with live webcam & shared screen...');
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '39_live_zoom_screenshare_step1_user_question.png'),
    fullPage: false
  });

  // 3. Wait for Elena's turn (Step 2: Elena explains with laser pointer)
  await sleep(7000);
  console.log('📸 Capturing Step 2: Elena responds on camera and spotlights Shot 1...');
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '40_live_zoom_screenshare_step2_elena_spotlight.png'),
    fullPage: false
  });

  // 4. Wait for Step 3: 1-Click Autonomous Fix
  await sleep(10000);
  console.log('📸 Capturing Step 3: Elena applies 1-Click Autonomous Sync, waveform locks...');
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '41_live_zoom_screenshare_step3_autonomous_fix.png'),
    fullPage: false
  });

  // 5. Record Master 30s Video with 2-Way Audio Stems directly
  console.log('🎥 Recording 30s Master Video with synchronized 2-way dialogue audio...');

  const videoBase64 = await page.evaluate(async () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const dest = audioCtx.createMediaStreamDestination();

    // Fetch and schedule all 6 audio dialogue clips
    const audioClips = [
      { url: '/assets/audio/user_1.wav', time: 0.2 },
      { url: '/assets/audio/elena_1.wav', time: 6.0 },
      { url: '/assets/audio/user_2.wav', time: 15.0 },
      { url: '/assets/audio/elena_2.wav', time: 18.0 },
      { url: '/assets/audio/user_3.wav', time: 26.0 },
      { url: '/assets/audio/elena_3.wav', time: 28.0 }
    ];

    for (const clip of audioClips) {
      try {
        const resp = await fetch(clip.url);
        const arrayBuf = await resp.arrayBuffer();
        const buf = await audioCtx.decodeAudioData(arrayBuf);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        src.connect(dest);
        src.connect(audioCtx.destination);
        src.start(audioCtx.currentTime + clip.time);
      } catch (e) {
        console.warn('Audio clip loading issue:', e);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1440;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');

    // Load Elena's video
    const elenaVid = document.createElement('video');
    elenaVid.src = '/assets/video/veo_aria_master.mp4';
    elenaVid.crossOrigin = 'anonymous';
    elenaVid.loop = true;
    elenaVid.muted = true;
    await elenaVid.play().catch(() => {});

    const canvasStream = canvas.captureStream(30);
    const combined = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks()
    ]);

    const recorder = new MediaRecorder(combined, {
      mimeType: 'video/mp4;codecs=avc1,mp4a.40.2',
      audioBitsPerSecond: 192000,
      videoBitsPerSecond: 6000000
    });

    const chunks = [];
    recorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.start(500);

    const startTime = Date.now();
    const duration = 30000;

    return new Promise(resolve => {
      function draw() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1.0);

        // 1. Zoom Meeting Background
        ctx.fillStyle = '#07090e';
        ctx.fillRect(0, 0, 1440, 900);

        // Header
        ctx.fillStyle = '#0b0f17';
        ctx.fillRect(0, 0, 1440, 56);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(0, 0, 1440, 56);

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('🔴 LIVE | ZOOM COPILOT ROOM #4829-9182', 30, 34);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.fillText(`SESSION TIME: [${(elapsed / 1000).toFixed(1)}s / 30.0s] • 2 PARTICIPANTS (NITIN + ELENA)`, 500, 34);

        ctx.fillStyle = '#38bdf8';
        ctx.fillText('1080p 60fps HD • 48kHz AEC Active', 1140, 34);

        // 2. Left Shared Screen (Nitin's Studio Workspace)
        ctx.fillStyle = '#0d121d';
        ctx.fillRect(24, 76, 1000, 680);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(24, 76, 1000, 680);

        // Screen share banner
        ctx.fillStyle = '#14b8a6';
        ctx.font = 'bold 14px -apple-system, sans-serif';
        ctx.fillText("🖥️ Nitin Aggarwal's Shared Screen — Zyvoriq Studio Timeline", 44, 106);

        // Beats Timeline
        const beats = [
          { name: 'Shot 1: 3-Second Curiosity Hook', range: '0:00 - 0:03', status: elapsed > 18000 ? '✅ 94.8% RETENTION (SYNCHRONIZED)' : '⚠️ UNLINKED STEM (-14% DROP)', color: elapsed > 18000 ? '#10b981' : '#f59e0b' },
          { name: 'Shot 2: Problem & Tension Escalation', range: '0:03 - 0:11', status: '✅ SYNCHRONIZED', color: '#10b981' },
          { name: 'Shot 3: Technical Breakthrough Showcase', range: '0:11 - 0:22', status: '✅ SYNCHRONIZED', color: '#10b981' },
          { name: 'Shot 4: High-Converting CTA & Outro', range: '0:22 - 0:30', status: '✅ READY FOR 4K EXPORT', color: '#14b8a6' }
        ];

        beats.forEach((b, i) => {
          const y = 135 + i * 95;
          const isTarget = i === 0 && elapsed < 18000;
          ctx.fillStyle = isTarget ? '#1e1b4b' : '#111827';
          ctx.fillRect(44, y, 960, 80);
          ctx.strokeStyle = isTarget ? '#818cf8' : (i === 0 && elapsed >= 18000 ? '#10b981' : '#374151');
          ctx.lineWidth = isTarget ? 2 : 1;
          ctx.strokeRect(44, y, 960, 80);

          ctx.fillStyle = '#f9fafb';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText(b.name, 64, y + 32);

          ctx.fillStyle = '#9ca3af';
          ctx.font = '12px monospace';
          ctx.fillText(`Duration: ${b.range}`, 64, y + 56);

          ctx.fillStyle = b.color;
          ctx.font = 'bold 13px monospace';
          ctx.fillText(b.status, 600, y + 44);
        });

        // Waveform Deck
        ctx.fillStyle = '#030712';
        ctx.fillRect(44, 530, 960, 200);
        ctx.strokeStyle = '#1f2937';
        ctx.strokeRect(44, 530, 960, 200);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('AUDIO STEM WAVEFORM & PREDICTED VIEWER RETENTION CURVE', 64, 560);

        // Draw animated waveform
        for (let k = 0; k < 40; k++) {
          const h = elapsed > 18000 ? (15 + 25 * Math.sin(k * 0.4)) : (k < 10 ? 8 : 20 + 10 * Math.sin(k * 0.5));
          ctx.fillStyle = elapsed > 18000 ? '#14b8a6' : (k < 10 ? '#f59e0b' : '#475569');
          ctx.fillRect(64 + k * 23, 640 - h / 2, 12, h);
        }

        // Draw retention curve
        ctx.strokeStyle = elapsed > 18000 ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(64, 700);
        if (elapsed > 18000) {
          ctx.bezierCurveTo(250, 610, 500, 620, 980, 630);
        } else {
          ctx.bezierCurveTo(250, 680, 500, 710, 980, 715);
        }
        ctx.stroke();

        // 3. Right Column: 2-Way Video Tiles (Elena + Nitin)
        // Tile 1: Elena Rostova (Support Agent)
        const isElenaSpeaking = (elapsed >= 6000 && elapsed < 15000) || (elapsed >= 18000 && elapsed < 26000) || (elapsed >= 28000);
        ctx.fillStyle = isElenaSpeaking ? '#042f2e' : '#0b0f17';
        ctx.fillRect(1044, 76, 372, 290);
        ctx.strokeStyle = isElenaSpeaking ? '#14b8a6' : '#1e293b';
        ctx.lineWidth = isElenaSpeaking ? 2 : 1;
        ctx.strokeRect(1044, 76, 372, 290);

        ctx.fillStyle = '#14b8a6';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(isElenaSpeaking ? '● ELENA ROSTOVA (SPEAKING)' : 'ELENA ROSTOVA (AI SUPPORT)', 1060, 100);

        ctx.drawImage(elenaVid, 1060, 112, 340, 200);

        ctx.fillStyle = '#020617';
        ctx.fillRect(1060, 320, 340, 36);
        ctx.fillStyle = '#2dd4bf';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(isElenaSpeaking ? '🎙️ Spoken Audio: 144 WPM (Active)' : '🎙️ Microphone: Standby', 1075, 342);

        // Tile 2: Nitin Aggarwal (User Webcam)
        const isUserSpeaking = (elapsed < 6000) || (elapsed >= 15000 && elapsed < 18000) || (elapsed >= 26000 && elapsed < 28000);
        ctx.fillStyle = isUserSpeaking ? '#082f49' : '#0b0f17';
        ctx.fillRect(1044, 380, 372, 270);
        ctx.strokeStyle = isUserSpeaking ? '#38bdf8' : '#1e293b';
        ctx.lineWidth = isUserSpeaking ? 2 : 1;
        ctx.strokeRect(1044, 380, 372, 270);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(isUserSpeaking ? '● NITIN AGGARWAL (SPEAKING)' : 'NITIN AGGARWAL (CREATOR)', 1060, 404);

        // User Webcam Avatar Frame
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(1060, 416, 340, 180);
        ctx.beginPath();
        ctx.arc(1230, 485, 36, 0, Math.PI * 2);
        ctx.fillStyle = '#64748b';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(1230, 580, 60, Math.PI, 0);
        ctx.fillStyle = '#475569';
        ctx.fill();

        ctx.fillStyle = '#020617';
        ctx.fillRect(1060, 604, 340, 36);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(isUserSpeaking ? '🎙️ Nitin Speaking (48kHz AEC)' : '🎙️ Nitin Listening', 1075, 626);

        // Diagnostic action badge
        ctx.fillStyle = elapsed > 18000 ? '#064e3b' : '#78350f';
        ctx.fillRect(1044, 665, 372, 90);
        ctx.strokeStyle = elapsed > 18000 ? '#10b981' : '#f59e0b';
        ctx.strokeRect(1044, 665, 372, 90);

        ctx.fillStyle = '#f9fafb';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(elapsed > 18000 ? '✅ 1-Click Autonomous Fix Applied' : '⚠️ Action: Unlinked Hook Audio', 1064, 695);
        ctx.fillStyle = elapsed > 18000 ? '#a7f3d0' : '#fde68a';
        ctx.font = '11px monospace';
        ctx.fillText(elapsed > 18000 ? 'Timeline Locked • Ready for 4K Export' : 'Elena spotlighting Shot 1 inspector', 1064, 725);

        // 4. Laser Pointer from Elena Over Nitin's Screen
        let lx = 350;
        let ly = 180;
        if (elapsed < 6000) {
          lx = 350 + Math.sin(elapsed / 500) * 40;
          ly = 180 + Math.cos(elapsed / 500) * 20;
        } else if (elapsed <= 15000) {
          lx = 600 + Math.sin(elapsed / 300) * 30;
          ly = 180 + Math.cos(elapsed / 300) * 15;
        } else if (elapsed <= 26000) {
          lx = 750 + Math.sin(elapsed / 400) * 20;
          ly = 180;
        } else {
          lx = 850;
          ly = 420;
        }

        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(lx, ly, 18 + 4 * Math.sin(elapsed / 150), 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(45, 212, 191, 0.25)';
        ctx.fill();

        ctx.fillStyle = '#0f766e';
        ctx.fillRect(lx + 15, ly - 15, 150, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText("Elena's Laser Spotlight", lx + 22, ly + 1);

        // 5. Bottom Captions (Live Synchronized Dialogue)
        ctx.fillStyle = '#0b0f17';
        ctx.fillRect(0, 770, 1440, 130);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(0, 770, 1440, 130);

        let speaker = 'Nitin Aggarwal (Creator)';
        let line = '“Hey Elena, my 4-shot reel in Studio Cinema won\'t sync audio on Shot 1, and my predicted retention is stuck at 42%. Can you look at my screen and help me fix this?”';
        let speakerColor = '#38bdf8';

        if (elapsed >= 6000 && elapsed < 15000) {
          speaker = 'Elena Rostova (AI Support Engineer)';
          line = '“Hi Nitin! I am connected to your screen right now. I see the issue immediately—your Shot 1 audio stem is unlinked from the 3-second curiosity hook. See my laser spotlight on your timeline right here.”';
          speakerColor = '#14b8a6';
        } else if (elapsed >= 15000 && elapsed < 18000) {
          speaker = 'Nitin Aggarwal (Creator)';
          line = '“Got it! Should I rebuild the beat plan or can you auto-sync it for me?”';
          speakerColor = '#38bdf8';
        } else if (elapsed >= 18000 && elapsed < 26000) {
          speaker = 'Elena Rostova (AI Support Engineer)';
          line = '“I will trigger the 1-Click Autonomous Sync directly on your canvas. Watch your waveform auto-align... There, your retention score just jumped to 94.8% and your 4-shot sequence is ready for 4K export!”';
          speakerColor = '#14b8a6';
        } else if (elapsed >= 26000 && elapsed < 28000) {
          speaker = 'Nitin Aggarwal (Creator)';
          line = '“Awesome, that completely fixed it. Thanks Elena!”';
          speakerColor = '#38bdf8';
        } else if (elapsed >= 28000) {
          speaker = 'Elena Rostova (AI Support Engineer)';
          line = '“You\'re very welcome Nitin! Reach out anytime if you need another review.”';
          speakerColor = '#14b8a6';
        }

        ctx.fillStyle = speakerColor;
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`● ${speaker}:`, 30, 805);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'italic 14px -apple-system, sans-serif';
        ctx.fillText(line, 30, 840);

        if (elapsed < duration) {
          requestAnimationFrame(draw);
        } else {
          recorder.stop();
        }
      }

      draw();

      recorder.onstop = () => {
        const fullBlob = new Blob(chunks, { type: 'video/mp4' });
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(fullBlob);
      };
    });
  });

  const base64Data = videoBase64.replace(/^data:video\/\w+;base64,/, '');
  const webmPath = path.join(VIDEO_DIR, 'virtual_copilot_screenshare_30s.webm');
  const mp4Path = path.join(VIDEO_DIR, 'virtual_copilot_screenshare_30s.mp4');

  fs.writeFileSync(webmPath, Buffer.from(base64Data, 'base64'));
  fs.copyFileSync(webmPath, mp4Path);

  const stats = fs.statSync(mp4Path);
  console.log(`🎉 Master Video Generated Successfully! Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Video Location: ${mp4Path}`);

  await browser.close();
}

run().catch(err => {
  console.error('Recording Error:', err);
  process.exit(1);
});
