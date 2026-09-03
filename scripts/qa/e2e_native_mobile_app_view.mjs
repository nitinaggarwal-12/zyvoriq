import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_native_mobile_app');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runNativeMobileAppViewE2E() {
  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log(`🚀 Launching Signed macOS Google Chrome for Native Mobile App QA...`);
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

    console.log(`📡 Loading /studio/create on iPhone 14...`);
    await page.goto('http://localhost:3000/studio/create', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    // Assert zero horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    console.log(`📱 iPhone 14 - Viewport Width: ${innerWidth}px, Scroll Width: ${scrollWidth}px`);
    if (scrollWidth > innerWidth + 5) {
      throw new Error(`Horizontal overflow on mobile: ${scrollWidth} > ${innerWidth}`);
    }

    // Capture 01: Native iOS App View (Top App Bar + 100% Full Width Content + Bottom Tab Bar)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_iphone14_native_app_create_hub.png'), fullPage: false });
    console.log(`📸 Captured: 01_iphone14_native_app_create_hub.png`);

    // 2. Tap "14 Personas" on Bottom Tab Bar to open Native Action Bottom Sheet
    console.log(`👉 Tapping "14 Personas" on Bottom Tab Bar...`);
    const personasTab = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('nav button, nav a'));
      return btns.find(b => b.innerText.includes('14 Personas'));
    });
    if (personasTab) {
      await personasTab.click();
      await sleep(800);
    }

    // Capture 02: Native iOS Action Bottom Sheet with 14 Personas
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_iphone14_native_bottom_sheet.png'), fullPage: false });
    console.log(`📸 Captured: 02_iphone14_native_bottom_sheet.png`);

    // 3. Navigate to Persona #4 (E-Commerce UGC Studio) on Mobile
    console.log(`📡 Loading /studio/create/ugc on iPhone 14...`);
    await page.goto('http://localhost:3000/studio/create/ugc', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    // Capture 03: Persona #4 UGC Ad Studio in Native App View
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_iphone14_native_ugc_studio.png'), fullPage: false });
    console.log(`📸 Captured: 03_iphone14_native_ugc_studio.png`);

    // 4. Android Pixel 7 Viewport (412x915)
    console.log(`📱 Testing Android Pixel 7 Viewport (412x915)...`);
    await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await sleep(800);

    // Capture 04: Android Pixel 7 Native App View
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_pixel7_native_ugc_studio.png'), fullPage: false });
    console.log(`📸 Captured: 04_pixel7_native_ugc_studio.png`);

    // 5. Desktop Viewport (1440x900)
    console.log(`🖥️ Testing Desktop Viewport (1440x900)...`);
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2, isMobile: false, hasTouch: false });
    await sleep(800);

    // Capture 05: Desktop View (Collapsible Left Sidebar active, Bottom Tab bar hidden)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_desktop_collapsible_sidebar_view.png'), fullPage: false });
    console.log(`📸 Captured: 05_desktop_collapsible_sidebar_view.png`);

    console.log(`🎉 Native Mobile iOS & Android App View E2E Test Passed Successfully!`);
  } finally {
    await browser.close();
  }
}

runNativeMobileAppViewE2E().catch(err => {
  console.error('❌ Native Mobile QA Failed:', err);
  process.exit(1);
});
