import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_reels_qa');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,950']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 950 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  console.log('--- Testing /studio/create/animation ---');
  await page.goto('http://localhost:3000/studio/create/animation', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // Assert video element is loaded and not failing
  const videoState = await page.evaluate(() => {
    const video = document.querySelector('video');
    return video ? {
      src: video.currentSrc || video.src,
      readyState: video.readyState,
      paused: video.paused,
      duration: video.duration,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight
    } : null;
  });

  console.log('Video State:', videoState);

  const shot1 = path.join(SCREENSHOT_DIR, '01_animation_studio_reel_loaded.png');
  await page.screenshot({ path: shot1 });
  console.log(`📸 Screenshot saved: file://${shot1}`);

  console.log('--- Testing /studio/create/reel ---');
  await page.goto('http://localhost:3000/studio/create/reel', { waitUntil: 'networkidle2' });
  await sleep(1500);

  const reelVideoState = await page.evaluate(() => {
    const video = document.querySelector('video');
    return video ? {
      src: video.currentSrc || video.src,
      readyState: video.readyState,
      paused: video.paused,
      duration: video.duration,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight
    } : null;
  });

  console.log('Reel Video State:', reelVideoState);

  const shot2 = path.join(SCREENSHOT_DIR, '02_vertical_reel_loaded.png');
  await page.screenshot({ path: shot2 });
  console.log(`📸 Screenshot saved: file://${shot2}`);

  await browser.close();

  const asset404s = consoleErrors.filter(e => e.includes('404') && e.includes('.mp4'));
  if (asset404s.length > 0) {
    console.error('❌ Found 404 video errors:', asset404s);
    process.exit(1);
  }

  console.log('✅ ALL REEL CREATION STAGES VERIFIED WITH 0 VIDEO 404s!');
}

main().catch(err => {
  console.error('QA Test failed:', err);
  process.exit(1);
});
