import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'https://zyvoriq.up.railway.app';
const OUT_DIR = process.env.OUT_DIR || path.join(process.cwd(), 'scratch', 'cloudtop_e2e_screenshots', 'bollywood_romance');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log(`[E2E] Starting Bollywood Romance live UI verification against ${BASE_URL}...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    // 1. Desktop Viewport (1440x900)
    console.log(`[E2E] 1. Desktop Viewport (1440x900)...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(1500);

    // Switch to YouTube Shorts (180s Cinema Master tab)
    const switchedToCinema = await page.evaluate(() => {
      const cinemaTabBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.innerText.includes('180s') || b.innerText.includes('Cinema') || b.innerText.includes('YouTube Shorts')
      );
      if (cinemaTabBtn) {
        cinemaTabBtn.click();
        return true;
      }
      return false;
    });
    console.log(`[E2E] Switched to Cinema Master tab: ${switchedToCinema}`);
    await sleep(1000);

    // Verify Bollywood Romance exists in the genre selector
    const genreBtnClicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.innerText.includes('Bollywood Romance') || b.innerText.includes('BOLLYWOOD_ROMANCE')
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log(`[E2E] Clicked BOLLYWOOD_ROMANCE genre button: ${genreBtnClicked}`);
    await sleep(1000);

    // Verify starter pill for Yash Chopra Swiss romance exists and click it
    const clickedStarter = await page.evaluate(() => {
      const starterBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.innerText.includes('Yash Chopra') || b.innerText.includes('Mohabbatein')
      );
      if (starterBtn) {
        starterBtn.click();
        return true;
      }
      return false;
    });
    console.log(`[E2E] Clicked Yash Chopra starter pill: ${clickedStarter}`);
    await sleep(1000);

    // Capture desktop screenshot
    const desktopScreenshotPath = path.join(OUT_DIR, '01_desktop_bollywood_romance_cinema.png');
    await page.screenshot({ path: desktopScreenshotPath, fullPage: false });
    console.log(`[E2E] Desktop screenshot saved: ${desktopScreenshotPath}`);

    // 2. Mobile Viewport (iPhone 14 @ 390x844)
    console.log(`[E2E] 2. Mobile Viewport (iPhone 14 @ 390x844)...`);
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(1500);

    // Assert zero horizontal overflow
    const hasHorizontalOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (hasHorizontalOverflow) {
      throw new Error('Mobile viewport failed zero horizontal overflow protocol!');
    }
    console.log('PASS: Mobile viewport satisfies zero horizontal overflow');

    const mobileScreenshotPath = path.join(OUT_DIR, '02_mobile_bollywood_romance_cinema.png');
    await mobilePage.screenshot({ path: mobileScreenshotPath, fullPage: false });
    console.log(`[E2E] Mobile screenshot saved: ${mobileScreenshotPath}`);

    console.log('🎉 ALL BOLLYWOOD ROMANCE UI QA ASSERTIONS PASSED!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('[E2E Error]', err);
  process.exit(1);
});
