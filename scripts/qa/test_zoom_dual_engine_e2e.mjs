import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.join(process.cwd(), 'scratch', 'screenshots_live_macos');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('🚀 Starting Physical E2E Verification for Zoom Screen Share Dual-Engine (Option A & Option B)...');

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

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  // 1. Navigate to Zoom Screenshare page
  console.log('Navigating to http://localhost:3001/studio/zoom-screenshare...');
  await page.goto('http://localhost:3001/studio/zoom-screenshare', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);

  // Dismiss cookie banner if present
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const acceptBtn = buttons.find(b => b.textContent?.includes('Accept All'));
    if (acceptBtn) acceptBtn.click();
  });
  await sleep(800);

  // 2. Assert Option A is active by default
  const isVideoPresent = await page.evaluate(() => {
    const video = document.querySelector('video[src*="veo_priya"]');
    return !!video;
  });
  console.log(`[Option A Verification] Presenter Video Active in DOM: ${isVideoPresent ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing Option A (Photorealistic Desk Video) screenshot...');
  const optionAPath = path.join(SCREENSHOT_DIR, '42_live_zoom_screenshare_option_a_video.png');
  await page.screenshot({ path: optionAPath, fullPage: false });

  // 3. Switch to Option B (3D VRM Mesh / WebGL Avatar)
  console.log('Switching to Option B: Real-Time 3D VRM Mesh Avatar...');
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const optionBBtn = buttons.find(b => b.textContent?.includes('Option B: 3D VRM Mesh'));
    if (optionBBtn) {
      optionBBtn.click();
      return true;
    }
    return false;
  });
  console.log(`Clicked Option B button: ${clicked}`);

  // Wait 1500ms for Three.js WebGL canvas initialization
  await sleep(1500);

  // 4. Assert Option B (Three.js WebGL Canvas) is mounted and rendering
  const is3DCanvasPresent = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const has3DText = document.body.innerText.includes('Option B: 3D Mesh') || document.body.innerText.includes('3D VRM MESH');
    return !!canvas && has3DText;
  });
  console.log(`[Option B Verification] 3D VRM WebGL Canvas Active in DOM: ${is3DCanvasPresent ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing Option B (Real-Time 3D VRM Avatar) screenshot...');
  const optionBPath = path.join(SCREENSHOT_DIR, '43_live_zoom_screenshare_option_b_3d_vrm.png');
  await page.screenshot({ path: optionBPath, fullPage: false });

  // 5. Test 1-Click Autonomous Fix Interaction in Option B mode
  console.log('Testing 1-Click Autonomous Fix interaction in Option B mode...');
  const fixClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const fixBtn = buttons.find(b => b.textContent?.includes('APPLY 1-CLICK FIX') || b.textContent?.includes('AUTONOMOUS FIX'));
    if (fixBtn) {
      fixBtn.click();
      return true;
    }
    return false;
  });
  console.log(`Clicked Autonomous Fix button: ${fixClicked}`);
  await sleep(1000);

  const isFixApplied = await page.evaluate(() => {
    return document.body.innerText.includes('AUTONOMOUS FIX APPLIED') && document.body.innerText.includes('94.8% RETENTION');
  });
  console.log(`[Autonomous Fix Verification] Timeline Synchronized & Retention Locked: ${isFixApplied ? 'PASSED ✅' : 'FAILED ❌'}`);

  console.log('📸 Capturing Option B with Autonomous Fix Applied screenshot...');
  const optionBFixPath = path.join(SCREENSHOT_DIR, '44_live_zoom_screenshare_option_b_fixed.png');
  await page.screenshot({ path: optionBFixPath, fullPage: false });

  await browser.close();

  if (!isVideoPresent || !is3DCanvasPresent || !isFixApplied) {
    console.error('❌ E2E Verification failed on some assertions.');
    process.exit(1);
  }

  console.log('🎉 Dual-Engine Zoom Screen Share E2E Verification completely PASSED with 0 errors!');
}

run().catch(err => {
  console.error('Verification Error:', err);
  process.exit(1);
});
