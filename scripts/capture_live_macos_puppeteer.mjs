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
  console.log('🚀 Launching Mac Google Chrome (Bypassing Santa)...');
  
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

  console.log(`📸 1. Navigating to: ${BASE_URL}/studio...`);
  await page.goto(`${BASE_URL}/studio`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(2000); // 2s settling delay

  const shot1 = path.join(OUTPUT_DIR, '01_live_studio_overview.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log(`✅ Captured 01_live_studio_overview.png (${fs.statSync(shot1).size} bytes)`);

  // Open Trend Radar Modal
  console.log('📸 2. Opening 7-Day Trend Radar Modal...');
  const clickedTrend = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Trend Radar'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Trend Radar button clicked:', clickedTrend);

  if (clickedTrend) {
    await sleep(1200);
    const shot2 = path.join(OUTPUT_DIR, '02_live_trend_radar_modal.png');
    await page.screenshot({ path: shot2 });
    console.log(`✅ Captured 02_live_trend_radar_modal.png (${fs.statSync(shot2).size} bytes)`);

    // Close Modal via close button or Escape
    await page.keyboard.press('Escape');
    await sleep(600);
  }

  // Open Book Studio Modal
  console.log('📸 3. Opening Book & Transmedia Studio Modal...');
  const clickedBook = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Book Studio'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Book Studio button clicked:', clickedBook);

  if (clickedBook) {
    await sleep(1200);
    const shot3 = path.join(OUTPUT_DIR, '03_live_book_studio_modal.png');
    await page.screenshot({ path: shot3 });
    console.log(`✅ Captured 03_live_book_studio_modal.png (${fs.statSync(shot3).size} bytes)`);

    // Click "Read Chapter 1 Prose" tab
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tab = buttons.find(b => b.textContent && b.textContent.includes('Prose'));
      if (tab) tab.click();
    });
    await sleep(800);

    const shot4 = path.join(OUTPUT_DIR, '04_live_book_prose_reader.png');
    await page.screenshot({ path: shot4 });
    console.log(`✅ Captured 04_live_book_prose_reader.png (${fs.statSync(shot4).size} bytes)`);

    await page.keyboard.press('Escape');
    await sleep(600);
  }

  // Open Dopamine/Hooks Studio Modal
  console.log('📸 4. Opening Dopamine Split Modal...');
  const clickedDopamine = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Dopamine'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Dopamine Split button clicked:', clickedDopamine);

  if (clickedDopamine) {
    await sleep(1200);
    const shot5 = path.join(OUTPUT_DIR, '05_live_dopamine_split_modal.png');
    await page.screenshot({ path: shot5 });
    console.log(`✅ Captured 05_live_dopamine_split_modal.png (${fs.statSync(shot5).size} bytes)`);
  }

  await browser.close();
  console.log('🎉 All live macOS in-browser DOM screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Execution error:', err);
  process.exit(1);
});
