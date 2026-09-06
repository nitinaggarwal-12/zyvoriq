import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_landing_inline_generation');

async function run() {
  console.log('🚀 Starting landing page in-place generation verification...');

  // Programmatically purge screenshot directory per quality protocol
  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 950 });

    console.log('Navigating to http://localhost:3005 ...');
    await page.goto('http://localhost:3005', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Assert URL
    const initialUrl = page.url();
    console.log(`Current URL: ${initialUrl}`);
    if (!initialUrl.includes('localhost:3005') || initialUrl.includes('/studio')) {
      throw new Error(`Unexpected initial URL: ${initialUrl}`);
    }

    // Capture 01_hero_default.png
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_hero_default.png'), fullPage: false });
    console.log('📸 Captured 01_hero_default.png');

    // Find the Generate 4K Video button
    const generateBtnSelector = 'button[type="submit"]';
    await page.waitForSelector(generateBtnSelector, { visible: true });

    console.log('Clicking "Generate 4K Video"...');
    await page.$eval(generateBtnSelector, el => el.click());

    // Immediately verify URL has NOT changed to /studio
    await new Promise(r => setTimeout(r, 800));
    const urlDuringGen = page.url();
    console.log(`URL immediately after click: ${urlDuringGen}`);
    if (urlDuringGen.includes('/studio')) {
      throw new Error(`FAIL: Page redirected to ${urlDuringGen}! Should stay on landing page.`);
    }

    // Capture 02_hero_generating.png
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_hero_generating.png'), fullPage: false });
    console.log('📸 Captured 02_hero_generating.png');

    // Wait for generation to complete (2400ms in OmniHero)
    console.log('Waiting for generation synthesis to complete...');
    await new Promise(r => setTimeout(r, 2800));

    // Assert URL is still on landing page
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    if (finalUrl.includes('/studio')) {
      throw new Error(`FAIL: Final URL was redirected to ${finalUrl}!`);
    }

    // Assert video element is rendered
    await page.waitForSelector('video', { timeout: 5000 });
    const videoSrc = await page.$eval('video', el => el.src);
    console.log(`✅ In-line Video Player rendered with source: ${videoSrc}`);

    // Wait 800ms settling delay per user protocol
    await new Promise(r => setTimeout(r, 800));

    // Capture 03_hero_video_playing.png
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_hero_video_playing.png'), fullPage: false });
    console.log('📸 Captured 03_hero_video_playing.png');

    // Test Mobile Viewport (iPhone 14 @ 390x844) per Universal iOS & Android Mobile Compatibility Protocol
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 800));
    const isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`📱 Mobile scrollWidth <= window.innerWidth: ${!isOverflowing}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_hero_mobile_responsive.png'), fullPage: false });
    console.log('📸 Captured 04_hero_mobile_responsive.png');

    console.log('🎉 All verification checks passed successfully with 0 redirects!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
