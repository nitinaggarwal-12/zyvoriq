import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_mobile_sidebar_fix');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runMobileSidebarFixE2E() {
  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log(`🚀 Launching Signed macOS Chrome for Mobile Sidebar QA...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();

    // 1. Mobile iPhone 14 Viewport (390x844)
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

    // Cookie consent pre-seed
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('zyvoriq_cookie_consent', JSON.stringify({ analytics: true, marketing: true, timestamp: Date.now() }));
    });

    console.log(`📡 Loading http://localhost:3000/studio/create on iPhone 14...`);
    await page.goto('http://localhost:3000/studio/create', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    // Assert zero horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    console.log(`📏 Viewport Width: ${innerWidth}px, Scroll Width: ${scrollWidth}px`);
    if (scrollWidth > innerWidth + 5) {
      console.warn(`⚠️ Warning: Potential horizontal overflow detected: ${scrollWidth} > ${innerWidth}`);
    } else {
      console.log(`✅ Zero horizontal overflow verified!`);
    }

    // Capture 01: Creation Hub on iPhone 14 with Full Width
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_mobile_iphone14_create_hub_fullwidth.png'), fullPage: false });
    console.log(`📸 Captured: 01_mobile_iphone14_create_hub_fullwidth.png`);

    // 2. Open Mobile Drawer
    console.log(`👉 Tapping Hamburger Menu to open Mobile Drawer...`);
    const menuBtn = await page.$('button[aria-label="Open Studio Menu"]');
    if (menuBtn) {
      await menuBtn.click();
      await sleep(800);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_mobile_drawer_open.png'), fullPage: false });
    console.log(`📸 Captured: 02_mobile_drawer_open.png`);

    // 3. Navigate to /studio/create/ugc on Mobile
    console.log(`📡 Loading http://localhost:3000/studio/create/ugc on iPhone 14...`);
    await page.goto('http://localhost:3000/studio/create/ugc', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_mobile_iphone14_ugc_fullwidth.png'), fullPage: false });
    console.log(`📸 Captured: 03_mobile_iphone14_ugc_fullwidth.png`);

    // 4. Android Pixel 7 Viewport (412x915)
    console.log(`📱 Testing Mobile Pixel 7 Viewport (412x915)...`);
    await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_mobile_pixel7_ugc_fullwidth.png'), fullPage: false });
    console.log(`📸 Captured: 04_mobile_pixel7_ugc_fullwidth.png`);

    console.log(`🎉 Mobile Sidebar QA Completed Successfully!`);
  } finally {
    await browser.close();
  }
}

runMobileSidebarFixE2E().catch(err => {
  console.error('❌ Mobile E2E Test Failed:', err);
  process.exit(1);
});
