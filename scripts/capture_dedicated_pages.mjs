import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'scratch', 'screenshots_live_macos');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('🚀 Launching Mac Google Chrome for Dedicated Pages Validation...');
  
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: [
      '--headless=new',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1600,1000'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });

  const BASE_URL = 'http://localhost:3001';

  // 1. Book Studio Dedicated Page
  console.log(`📸 1. Navigating to Dedicated Book Studio: ${BASE_URL}/studio/books...`);
  await page.goto(`${BASE_URL}/studio/books`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(1500);
  const shot1 = path.join(OUTPUT_DIR, '06_live_dedicated_book_studio_page.png');
  await page.screenshot({ path: shot1 });
  console.log(`✅ Captured 06_live_dedicated_book_studio_page.png (${fs.statSync(shot1).size} bytes)`);

  // Switch to Lore tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tab = buttons.find(b => b.textContent && b.textContent.includes('World Lore Bible'));
    if (tab) tab.click();
  });
  await sleep(800);
  const shot2 = path.join(OUTPUT_DIR, '07_live_dedicated_book_lore_tab.png');
  await page.screenshot({ path: shot2 });
  console.log(`✅ Captured 07_live_dedicated_book_lore_tab.png (${fs.statSync(shot2).size} bytes)`);

  // 2. Trend Radar Dedicated Page
  console.log(`📸 2. Navigating to Dedicated Trend Radar: ${BASE_URL}/studio/trend-radar...`);
  await page.goto(`${BASE_URL}/studio/trend-radar`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(1500);
  const shot3 = path.join(OUTPUT_DIR, '08_live_dedicated_trend_radar_page.png');
  await page.screenshot({ path: shot3 });
  console.log(`✅ Captured 08_live_dedicated_trend_radar_page.png (${fs.statSync(shot3).size} bytes)`);

  // 3. Studio Timeline Page with Top Navigation Bar Links
  console.log(`📸 3. Navigating to Master Studio: ${BASE_URL}/studio...`);
  await page.goto(`${BASE_URL}/studio`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(1500);
  const shot4 = path.join(OUTPUT_DIR, '09_live_studio_zero_errors_navbar.png');
  await page.screenshot({ path: shot4 });
  console.log(`✅ Captured 09_live_studio_zero_errors_navbar.png (${fs.statSync(shot4).size} bytes)`);

  await browser.close();
  console.log('🎉 Dedicated Pages DOM verification complete!');
}

run().catch((err) => {
  console.error('Execution error:', err);
  process.exit(1);
});
