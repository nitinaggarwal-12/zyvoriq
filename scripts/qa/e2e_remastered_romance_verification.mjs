import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'https://zyvoriq.up.railway.app';
const PROD_ID = 'studio1_417f1625-665e-4097-97e7-28439b31105e';
const OUT_DIR = process.env.OUT_DIR || path.join(process.cwd(), 'scratch', 'cloudtop_e2e_screenshots', 'remastered_romance');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log(`[E2E] Starting Remastered Romance E2E Verification against ${BASE_URL}...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required']
  });

  try {
    // 1. Desktop Viewport (1440x900) - Studio Page with Target Production
    console.log(`[E2E] 1. Desktop Viewport (1440x900) - Loading Studio Page for ${PROD_ID}...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    const studioUrl = `${BASE_URL}/studio?id=${PROD_ID}`;
    console.log(`[E2E] Navigating to: ${studioUrl}`);
    await page.goto(studioUrl, { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(2500);

    // Assert page loaded without error
    const pageText = await page.evaluate(() => document.body.innerText);
    if (pageText.includes('Production not found') || pageText.includes('Failed to load')) {
      throw new Error(`Production failed to load on Studio page: ${pageText.slice(0, 300)}`);
    }

    // Inspect video element
    const videoDetails = await page.evaluate(() => {
      const videoEl = document.querySelector('video');
      if (!videoEl) return { found: false };
      return {
        found: true,
        src: videoEl.currentSrc || videoEl.src,
        duration: videoEl.duration,
        paused: videoEl.paused,
        muted: videoEl.muted
      };
    });
    console.log(`[E2E] Video element details:`, videoDetails);

    // Capture initial studio screenshot
    const shot1Path = path.join(OUT_DIR, '01_studio_remastered_ready.png');
    await page.screenshot({ path: shot1Path, fullPage: false });
    console.log(`[E2E] Screenshot 1 saved: ${shot1Path}`);

    // Click play button if video exists
    await page.evaluate(() => {
      const playBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.innerText.includes('Play') || b.querySelector('svg')
      );
      const video = document.querySelector('video');
      if (video) {
        video.muted = true;
        video.play().catch(() => {});
      } else if (playBtn) {
        playBtn.click();
      }
    });
    await sleep(1500);

    // Capture playing state screenshot
    const shot2Path = path.join(OUT_DIR, '02_studio_remastered_playing.png');
    await page.screenshot({ path: shot2Path, fullPage: false });
    console.log(`[E2E] Screenshot 2 saved: ${shot2Path}`);

    // 2. Mobile Viewport (iPhone 14 @ 390x844)
    console.log(`[E2E] 2. Mobile Viewport (iPhone 14 @ 390x844)...`);
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    await mobilePage.goto(studioUrl, { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(2500);

    // Assert zero horizontal overflow
    const hasHorizontalOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (hasHorizontalOverflow) {
      throw new Error('Mobile viewport failed zero horizontal overflow protocol!');
    }
    console.log('PASS: Mobile viewport satisfies zero horizontal overflow');

    const shot3Path = path.join(OUT_DIR, '03_mobile_studio_remastered.png');
    await mobilePage.screenshot({ path: shot3Path, fullPage: false });
    console.log(`[E2E] Screenshot 3 saved: ${shot3Path}`);

    // 3. My Reels Library Viewport
    console.log(`[E2E] 3. My Reels Library Viewport...`);
    const libraryPage = await browser.newPage();
    await libraryPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await libraryPage.goto(`${BASE_URL}/my-reels`, { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(2500);

    const shot4Path = path.join(OUT_DIR, '04_my_reels_library.png');
    await libraryPage.screenshot({ path: shot4Path, fullPage: false });
    console.log(`[E2E] Screenshot 4 saved: ${shot4Path}`);

    console.log('🎉 ALL REMASTERED ROMANCE E2E VERIFICATIONS PASSED!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('[E2E ERROR]', err);
  process.exit(1);
});
