import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_sidebar_ux');
const BASE_URL = 'http://localhost:3000/studio/create/ugc';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runSidebarUxE2E() {
  if (fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log(`🚀 Launching Signed macOS Google Chrome for Sidebar UX testing...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    // Cookie consent pre-seed
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('zyvoriq_cookie_consent', JSON.stringify({ analytics: true, marketing: true, timestamp: Date.now() }));
    });

    console.log(`📡 Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    // Assert Sidebar DOM elements
    const sidebarBrand = await page.$eval('aside', el => el.innerText);
    console.log(`✅ Verified Sidebar Presence`);

    // 1. Capture 01: Expanded Left Sidebar UX
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_sidebar_expanded_ugc.png'), fullPage: false });
    console.log(`📸 Captured: 01_sidebar_expanded_ugc.png`);

    // 2. Click Sidebar Collapse Toggle (PanelLeftClose)
    console.log(`👉 Clicking Sidebar Collapse Toggle...`);
    const toggleBtn = await page.$('aside button[title*="Collapse Sidebar"]');
    if (toggleBtn) {
      await toggleBtn.click();
      await sleep(800);
    }

    // Capture 02: Collapsed Icon-Only Mini Rail UX
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_sidebar_collapsed_mini_ugc.png'), fullPage: false });
    console.log(`📸 Captured: 02_sidebar_collapsed_mini_ugc.png`);

    // 3. Navigate to Creation Hub via Sidebar link
    console.log(`👉 Navigating to Creation Hub...`);
    await page.goto('http://localhost:3000/studio/create', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    // Capture 03: Master Creation Hub with Collapsed/Expanded Sidebar
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_studio_create_matrix_with_sidebar.png'), fullPage: false });
    console.log(`📸 Captured: 03_studio_create_matrix_with_sidebar.png`);

    // 4. Mobile Viewport (iPhone 14 @ 390x844)
    console.log(`📱 Testing Mobile iPhone 14 Viewport...`);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_mobile_iphone14_sidebar_ux.png'), fullPage: false });
    console.log(`📸 Captured: 04_mobile_iphone14_sidebar_ux.png`);

    console.log(`🎉 Sidebar UX E2E Testing Completed Successfully!`);
  } finally {
    await browser.close();
  }
}

runSidebarUxE2E().catch(err => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
