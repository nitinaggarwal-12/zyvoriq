import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_persona4_ugc');
const BASE_URL = 'http://localhost:3000/studio/create/ugc';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runPersona4UgcE2E() {
  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log(`🚀 Launching Signed macOS Google Chrome...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    
    // 1. Desktop Viewport (1440x900)
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    
    // Cookie consent pre-seed
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('zyvoriq_cookie_consent', JSON.stringify({ analytics: true, marketing: true, timestamp: Date.now() }));
    });

    console.log(`📡 Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    // Assert DOM elements
    const pageTitle = await page.$eval('h1', el => el.innerText);
    console.log(`✅ Verified Title: "${pageTitle}"`);
    if (!pageTitle.includes('AI UGC Video Ad Studio')) {
      throw new Error(`Unexpected page title: ${pageTitle}`);
    }

    // Capture 01: Initial Desktop View
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_desktop_ugc_default.png'), fullPage: false });
    console.log(`📸 Captured: 01_desktop_ugc_default.png`);

    // 2. Click "Before vs After" Framework Preset
    console.log(`👉 Clicking 'Before vs After' framework preset...`);
    const beforeAfterBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Before vs After'));
    });
    if (beforeAfterBtn) {
      await beforeAfterBtn.click();
      await sleep(800);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_desktop_ugc_before_after_mode.png'), fullPage: false });
    console.log(`📸 Captured: 02_desktop_ugc_before_after_mode.png`);

    // 3. Click "Tactile Unboxing" Preset
    console.log(`👉 Clicking 'Tactile Unboxing' preset...`);
    const unboxingBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Tactile Unboxing'));
    });
    if (unboxingBtn) {
      await unboxingBtn.click();
      await sleep(800);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_desktop_ugc_unboxing_mode.png'), fullPage: false });
    console.log(`📸 Captured: 03_desktop_ugc_unboxing_mode.png`);

    // 4. Click "TikTok Shop Review" Preset
    console.log(`👉 Clicking 'TikTok Shop Review' preset...`);
    const tiktokBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('TikTok Shop Review'));
    });
    if (tiktokBtn) {
      await tiktokBtn.click();
      await sleep(800);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_desktop_ugc_tiktok_shop_mode.png'), fullPage: false });
    console.log(`📸 Captured: 04_desktop_ugc_tiktok_shop_mode.png`);

    // 5. Mobile iPhone 14 Viewport (390x844)
    console.log(`📱 Testing Mobile iPhone 14 Viewport (390x844)...`);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_mobile_iphone14_ugc.png'), fullPage: true });
    console.log(`📸 Captured: 05_mobile_iphone14_ugc.png`);

    // 6. Mobile Android Pixel 7 Viewport (412x915)
    console.log(`📱 Testing Mobile Pixel 7 Viewport (412x915)...`);
    await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_mobile_pixel7_ugc.png'), fullPage: true });
    console.log(`📸 Captured: 06_mobile_pixel7_ugc.png`);

    console.log(`🎉 Persona #4 UGC Ad Studio E2E Testing Completed Successfully!`);
  } finally {
    await browser.close();
  }
}

runPersona4UgcE2E().catch(err => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
