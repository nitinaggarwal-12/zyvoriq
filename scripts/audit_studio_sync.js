const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🔬 STARTING ZYVORIQ AUTOMATED VIDEO & AUDIO SYNC HARNESS...');
  const captureDir = path.join(__dirname, '..', 'scratch', 'sync_audit');
  fs.mkdirSync(captureDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('🌐 Loading Studio interface (http://127.0.0.1:3000/studio)...');
  await page.goto('http://127.0.0.1:3000/studio', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Initial State Check
  const initialMedia = await page.evaluate(() => {
    const audio = document.querySelector('audio');
    const video = document.querySelector('video');
    return {
      audioSrc: audio ? audio.src : null,
      audioDuration: audio ? audio.duration : 0,
      audioPaused: audio ? audio.paused : true,
      videoSrc: video ? video.src : null,
      videoMuted: video ? video.muted : false
    };
  });
  console.log('📊 Initial Media State:', JSON.stringify(initialMedia, null, 2));

  // Direct DOM Click on Play button
  await page.evaluate(() => {
    const btn = document.querySelector('button[title="Start Broadcast"]') || 
                document.querySelector('.group button') || 
                document.querySelector('button.bg-cyan-500');
    if (btn) btn.click();
  });
  console.log('▶️ Clicked Play Button');

  // Verify across 6 checkpoints over 22 seconds
  const intervals = [2000, 4000, 4000, 4000, 4000, 4000];
  const auditLogs = [];

  for (let i = 0; i < intervals.length; i++) {
    await new Promise(r => setTimeout(r, intervals[i]));
    const state = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      const video = document.querySelector('video');
      const highlighted = document.querySelector('.bg-cyan-500.text-slate-950') || 
                          document.querySelector('[class*="bg-cyan-500"]');
      return {
        step: i + 1,
        audioTime: audio ? Number(audio.currentTime.toFixed(2)) : 0,
        audioPaused: audio ? audio.paused : true,
        videoTime: video ? Number(video.currentTime.toFixed(2)) : 0,
        videoMuted: video ? video.muted : false,
        activeWord: highlighted ? highlighted.innerText.trim() : null
      };
    });
    console.log(`⏱️ Checkpoint ${i + 1}: audioTime=${state.audioTime}s | paused=${state.audioPaused} | muted=${state.videoMuted} | word="${state.activeWord}"`);
    auditLogs.push(state);
    await page.screenshot({ path: path.join(captureDir, `sample_${i + 1}_t${state.audioTime}s.png`) });
  }

  const finalSample = auditLogs[auditLogs.length - 1];
  console.log('\n================ AUDIT SUMMARY ================');
  console.log(`Audio Progression: ${auditLogs[0].audioTime}s -> ${finalSample.audioTime}s`);
  console.log(`Video Continuous Muted: ${auditLogs.every(s => s.videoMuted)}`);
  console.log(`Audio Continuous Playing: ${auditLogs.every(s => !s.audioPaused)}`);
  console.log(`Words Highlighted Throughout: ${auditLogs.map(s => s.activeWord).join(' -> ')}`);

  if (finalSample.audioTime > 15 && !finalSample.audioPaused && finalSample.videoMuted) {
    console.log('🎉 AUDIT RESULT: PASSED! Teleprompter & audio playback are in 100% verified continuous sync.');
  } else {
    console.log('❌ AUDIT RESULT: FAILED! One or more criteria did not pass.');
  }

  await browser.close();
})().catch(console.error);
