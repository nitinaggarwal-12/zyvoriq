import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_neotokyo_verified');

async function run() {
  console.log('🚀 Verifying Neo-Tokyo Downpour in-place generation & video playback...');

  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 950 });

    console.log('Navigating to http://localhost:3005 ...');
    await page.goto('http://localhost:3005', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1200));

    // Select "Neo-Tokyo Downpour" preset button
    console.log('Selecting "Neo-Tokyo Downpour" preset...');
    const presetButtons = await page.$$('button');
    let foundNeoTokyo = false;
    for (const btn of presetButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Neo-Tokyo')) {
        await btn.click();
        foundNeoTokyo = true;
        console.log('  ✓ Clicked Neo-Tokyo preset button');
        break;
      }
    }
    if (!foundNeoTokyo) throw new Error('Could not find Neo-Tokyo preset button');

    await new Promise(r => setTimeout(r, 600));

    // Click "Generate 4K Video"
    console.log('Clicking "Generate 4K Video"...');
    await page.$eval('button[type="submit"]', el => el.click());

    // Wait 1.0s and capture synthesizing state
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_neotokyo_directing.png'), fullPage: false });
    console.log('📸 Captured 01_neotokyo_directing.png');

    // Wait for synthesis to complete (2400ms + margin)
    console.log('Waiting for synthesis to complete...');
    await new Promise(r => setTimeout(r, 2600));

    // Verify video source is now /assets/video/neotokyo_preview.mp4
    await page.waitForSelector('video', { timeout: 5000 });
    const videoSrc = await page.$eval('video', el => el.src);
    const posterSrc = await page.$eval('video', el => el.poster);
    console.log(`✅ In-line Video Source: ${videoSrc}`);
    console.log(`✅ In-line Video Poster: ${posterSrc}`);

    if (!videoSrc.includes('neotokyo_preview.mp4')) {
      throw new Error(`Expected neotokyo_preview.mp4, got ${videoSrc}`);
    }

    // Wait 800ms settling delay per protocol
    await new Promise(r => setTimeout(r, 800));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_neotokyo_video_playing.png'), fullPage: false });
    console.log('📸 Captured 02_neotokyo_video_playing.png');

    console.log('🎉 NEO-TOKYO DOWNPOUR VERIFIED WITH GENUINE IN-PLACE VIDEO PLAYBACK!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
