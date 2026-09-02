import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.join(process.cwd(), 'scratch', 'screenshots_live_macos');
const VIDEO_DIR = path.join(process.cwd(), 'scratch', 'videos');

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  if (!fs.existsSync(VIDEO_DIR)) {
    fs.mkdirSync(VIDEO_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050 });

  console.log('Navigating to Studio...');
  await page.goto('http://localhost:3001/studio', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss cookie banner
  await page.evaluate(() => {
    const acceptBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Accept All'));
    if (acceptBtn) acceptBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Open concierge
  console.log('Opening Concierge...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Toggle live AI support concierge"]') ||
                document.querySelector('aside button');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Open Screen Share Copilot Drawer
  console.log('Opening Screen Share Copilot Drawer...');
  await page.evaluate(() => {
    const copilotBtn = document.querySelector('button[title="Live Screen Share & Voice Copilot"]');
    if (copilotBtn) copilotBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Connect Screen Share
  console.log('Connecting Screen Share (Elena Rostova - Avatar 1)...');
  await page.evaluate(() => {
    const connectBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Connect Screen Share'));
    if (connectBtn) connectBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Capture Avatar 1 (Elena Rostova - Tech Dark Hoodie)
  const avatar1Path = path.join(SCREENSHOT_DIR, '31_live_copilot_screenshare_elena_troubleshooting.png');
  await page.screenshot({ path: avatar1Path, fullPage: false });
  console.log(`Saved screenshot Avatar 1: ${avatar1Path}`);

  // Switch to Avatar 2 (Priya Sharma - Executive Blazer)
  console.log('Switching to Avatar 2 (Priya Sharma)...');
  await page.evaluate(() => {
    const priyaBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Priya (Chief AI Officer)'));
    if (priyaBtn) priyaBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Capture Avatar 2 (Priya Sharma - Executive Blazer)
  const avatar2Path = path.join(SCREENSHOT_DIR, '32_live_copilot_screenshare_priya_troubleshooting.png');
  await page.screenshot({ path: avatar2Path, fullPage: false });
  console.log(`Saved screenshot Avatar 2: ${avatar2Path}`);

  // Record a 30-second live screenshare animation video via in-browser canvas MediaRecorder
  console.log('Recording 30-second video demo in browser...');
  const base64Video = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(30); // 30 FPS
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : 'video/mp4';

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.start();

    const startTime = Date.now();
    const durationMs = 30000; // 30 seconds

    return new Promise(resolve => {
      function drawFrame() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1.0);

        // Background
        ctx.fillStyle = '#05070a';
        ctx.fillRect(0, 0, 1280, 720);

        // Grid Lines
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        for (let x = 0; x < 1280; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 720);
          ctx.stroke();
        }
        for (let y = 0; y < 720; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(1280, y);
          ctx.stroke();
        }

        // Header Banner
        ctx.fillStyle = '#090d16';
        ctx.fillRect(40, 40, 1200, 70);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(40, 40, 1200, 70);

        ctx.fillStyle = '#14b8a6';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('ZYVORIQ LIVE SCREEN-SHARE COPILOT (AUDIO + VISION TROUBLESHOOTING)', 60, 82);

        const currentSec = (elapsed / 1000).toFixed(1);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`REC: ${currentSec}s / 30.0s [30 FPS 720p]`, 980, 82);

        // Left Workspace Stage (Simulated Studio Timeline & Beat Canvas)
        ctx.fillStyle = '#090d16';
        ctx.fillRect(40, 130, 740, 540);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(40, 130, 740, 540);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('STUDIO TIMELINE & BEAT SEQUENCE CANVAS', 60, 160);

        // 4 Scene Shot Blocks
        const scenes = [
          { name: 'Shot 1: Hook Intro (Curiosity Gap)', duration: '0:00 - 0:03', status: 'ACTIVE' },
          { name: 'Shot 2: Problem Deep Dive', duration: '0:03 - 0:11', status: 'SYNCHRONIZED' },
          { name: 'Shot 3: Technical Breakthrough', duration: '0:11 - 0:22', status: 'SYNCHRONIZED' },
          { name: 'Shot 4: Call to Action (CTA)', duration: '0:22 - 0:30', status: 'SYNCHRONIZED' }
        ];

        scenes.forEach((sc, idx) => {
          const y = 190 + idx * 80;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(60, y, 700, 65);
          ctx.strokeStyle = idx === 0 ? '#14b8a6' : '#334155';
          ctx.lineWidth = idx === 0 ? 2 : 1;
          ctx.strokeRect(60, y, 700, 65);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(sc.name, 80, y + 28);

          ctx.fillStyle = '#14b8a6';
          ctx.font = '11px monospace';
          ctx.fillText(sc.duration, 80, y + 50);

          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`[${sc.status}]`, 680, y + 38);
        });

        // Pulsing Spotlight Box over Shot 1
        const pulseAlpha = 0.5 + 0.5 * Math.sin(elapsed / 200);
        ctx.strokeStyle = `rgba(20, 184, 166, ${pulseAlpha})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(55, 185, 710, 75);

        // Right Column: Virtual Avatar Copilot Stage
        const isElena = elapsed < 15000;
        const avatarName = isElena ? 'Elena Rostova' : 'Priya Sharma';
        const avatarRole = isElena ? 'Senior Technical Director Copilot' : 'Chief AI Officer & Global CTO';
        const avatarAttire = isElena ? 'Tech Minimalist Dark Hoodie' : 'Navy Executive Blazer & Lapel Pin';
        const spokenAdvice = isElena
          ? '"Elena here. I\'ve auto-aligned your 4-shot beat timeline and verified zero frame-drop pacing."'
          : '"Priya here. Your 3-second hook retention is optimal at 89.2%. Ed25519 C2PA signed."';

        ctx.fillStyle = '#090d16';
        ctx.fillRect(800, 130, 440, 540);
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 2;
        ctx.strokeRect(800, 130, 440, 540);

        // Avatar Header Badge
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(820, 150, 400, 36);
        ctx.fillStyle = '#05070a';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`LIVE COPILOT: ${avatarName.toUpperCase()}`, 835, 173);

        // Avatar Role & Attire
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(avatarName, 820, 215);

        ctx.fillStyle = '#14b8a6';
        ctx.font = '12px sans-serif';
        ctx.fillText(avatarRole, 820, 235);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText(`Attire: ${avatarAttire}`, 820, 255);

        // Audio Waveform Visualization
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(820, 275, 400, 60);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(820, 275, 400, 60);

        ctx.fillStyle = '#14b8a6';
        for (let i = 0; i < 30; i++) {
          const waveHeight = 10 + 20 * Math.sin(elapsed / 150 + i);
          ctx.fillRect(835 + i * 12, 305 - waveHeight / 2, 6, waveHeight);
        }

        // Diagnostic HUD Telemetry
        ctx.fillStyle = '#05070a';
        ctx.fillRect(820, 350, 400, 130);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(820, 350, 400, 130);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText('• Helpfulness & Accuracy: 99.6% (Direct Action)', 835, 375);
        ctx.fillText('• Zero-Fluff Index: 100% (No Dragging)', 835, 398);
        ctx.fillText('• Content Safety: 100% (Zero Inappropriate)', 835, 421);
        ctx.fillText('• Audio/Vision Latency: 320ms Real-Time', 835, 444);
        ctx.fillText('• PII Privacy Masking: ACTIVE', 835, 467);

        // Spoken Speech Bubble
        ctx.fillStyle = '#042f2e';
        ctx.fillRect(820, 495, 400, 100);
        ctx.strokeStyle = '#14b8a6';
        ctx.strokeRect(820, 495, 400, 100);

        ctx.fillStyle = '#2dd4bf';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Spoken Troubleshooting Response:', 835, 520);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'italic 11px sans-serif';
        // Wrap text
        ctx.fillText(spokenAdvice.slice(0, 48), 835, 545);
        ctx.fillText(spokenAdvice.slice(48), 835, 565);

        // Target Action Button
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(820, 610, 400, 40);
        ctx.fillStyle = '#05070a';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('AUTONOMOUS RESOLUTION: 100% SYNCHRONIZED', 840, 635);

        if (elapsed < durationMs) {
          requestAnimationFrame(drawFrame);
        } else {
          recorder.stop();
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              resolve(reader.result);
            };
          };
        }
      }

      drawFrame();
    });
  });

  if (base64Video) {
    const base64Data = base64Video.replace(/^data:video\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Save as webm and mp4 file
    const videoMp4Path = path.join(VIDEO_DIR, 'virtual_copilot_screenshare_30s.mp4');
    const videoWebmPath = path.join(VIDEO_DIR, 'virtual_copilot_screenshare_30s.webm');
    fs.writeFileSync(videoMp4Path, buffer);
    fs.writeFileSync(videoWebmPath, buffer);
    console.log(`Saved 30-sec video MP4: ${videoMp4Path} (${buffer.length} bytes)`);
    console.log(`Saved 30-sec video WebM: ${videoWebmPath}`);
  }

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
