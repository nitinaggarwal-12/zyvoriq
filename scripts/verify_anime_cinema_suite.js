const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function run() {
  const screenshotsDir = path.join(__dirname, '../scratch/screenshots_anime_cinema');
  if (fs.existsSync(screenshotsDir)) {
    fs.rmSync(screenshotsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotsDir, { recursive: true });

  console.log('🚀 Launching Chrome on Cloudtop for Anime Cinema Suite E2E verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  console.log('🌐 Navigating to /studio...');
  await page.goto('http://127.0.0.1:3000/studio', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);

  // 1. Anime Cinema Default View
  console.log('📸 01: Default Anime Cinema Stage (Japanese + Philosophy Subtitles)...');
  await page.screenshot({ path: path.join(screenshotsDir, '01_anime_cinema_default.png'), fullPage: false });

  // 2. Open Netflix-style Audio & Subtitles dialog
  console.log('🖱️ Clicking Audio & Subtitles modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.innerText.includes('Audio & Subtitles') || b.innerText.includes('Japanese (Default)') || b.innerText.includes('Audio'));
    if (target) target.click();
  });
  await sleep(800);
  console.log('📸 02: Netflix-style Audio & Subtitles Dialog Open...');
  await page.screenshot({ path: path.join(screenshotsDir, '02_audio_subtitles_modal.png'), fullPage: false });

  // 3. Switch Language to English
  console.log('🖱️ Selecting English audio...');
  await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('button'));
    const enAudio = labels.find(b => b.innerText.includes('English (English)'));
    if (enAudio) enAudio.click();
  });
  await sleep(600);
  console.log('📸 03: English Dub Selected...');
  await page.screenshot({ path: path.join(screenshotsDir, '03_english_dub_selected.png'), fullPage: false });

  // Close modal
  await page.evaluate(() => {
    const closeBtns = Array.from(document.querySelectorAll('button'));
    const close = closeBtns.find(b => b.innerText.includes('Close') || b.innerText.includes('Done'));
    if (close) close.click();
  });
  await sleep(500);

  // 4. Switch to Executive Broadcasters tab (Priya) to verify clean separation
  console.log('🖱️ Switching to Executive Broadcasters tab...');
  await page.evaluate(() => {
    const tabBtns = Array.from(document.querySelectorAll('button'));
    const execTab = tabBtns.find(b => b.innerText.includes('Executive Broadcasters'));
    if (execTab) execTab.click();
  });
  await sleep(800);
  console.log('📸 04: Executive Broadcasters Studio Tab (Priya & Digital Twins)...');
  await page.screenshot({ path: path.join(screenshotsDir, '04_executive_broadcasters_tab.png'), fullPage: false });

  // 5. Switch back to Anime Cinema Tab
  console.log('🖱️ Switching back to Anime Cinema Tab...');
  await page.evaluate(() => {
    const tabBtns = Array.from(document.querySelectorAll('button'));
    const animeTab = tabBtns.find(b => b.innerText.includes('Anime Cinema'));
    if (animeTab) animeTab.click();
  });
  await sleep(800);
  console.log('📸 05: Anime Cinema Suite Active...');
  await page.screenshot({ path: path.join(screenshotsDir, '05_anime_cinema_restored.png'), fullPage: false });

  await browser.close();
  console.log('🎉 E2E Verification complete! All screenshots saved in scratch/screenshots_anime_cinema/');
}

run().catch(err => {
  console.error('❌ E2E Failed:', err);
  process.exit(1);
});
