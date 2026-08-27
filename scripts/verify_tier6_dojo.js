const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function run() {
  const screenshotsDir = path.join(__dirname, '../scratch/screenshots_tier6_dojo');
  if (fs.existsSync(screenshotsDir)) {
    fs.rmSync(screenshotsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotsDir, { recursive: true });

  console.log('🚀 Launching Chrome on Cloudtop for Tier-6 Living Dojo E2E verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-http-cache',
      '--disable-cache'
    ]
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1600, height: 1000 });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('🌐 Navigating to http://127.0.0.1:3000/studio ...');
  await page.goto('http://127.0.0.1:3000/studio', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('button', { timeout: 15000 });
  await sleep(1000);

  // 1. Anime Cinema Default View (Mode 1)
  console.log('📸 01: Mode 1 - 7-Act Cinema Broadcast Stage...');
  await page.screenshot({ path: path.join(screenshotsDir, '01_cinema_mode.png'), fullPage: false });

  // 2. Switch to Mode 2: Tier 6 Living Dojo via Direct DOM Click
  console.log('🖱️ Switching to Tier 6 Living Dojo mode...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.textContent && (b.textContent.includes('Tier 6') || b.textContent.includes('Living Dojo')));
    if (target) target.click();
  });
  await sleep(1500);

  console.log('📸 02: Mode 2 - Tier 6 Living Dojo Initial Stage...');
  await page.screenshot({ path: path.join(screenshotsDir, '02_tier6_living_dojo_initial.png'), fullPage: false });

  // 3. Click Preset Dilemma: "Comparing to Others"
  console.log('🖱️ Selecting Philosophical Dilemma: Comparing to Others...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.textContent && (b.textContent.includes('Comparing to Others') || b.textContent.includes('Oubaitori')));
    if (target) target.click();
  });

  // Wait for Gemini reasoning + DeepMind TTS synthesis
  console.log('⏳ Waiting for Gemini reasoning + DeepMind neural speech synthesis (6s)...');
  await sleep(6000);

  console.log('📸 03: Tier 6 Living Dojo AI Sensei Ren Response & Wisdom Log...');
  await page.screenshot({ path: path.join(screenshotsDir, '03_tier6_sensei_ren_response.png'), fullPage: false });

  await browser.close();
  console.log('🎉 Tier-6 Living Dojo Verification complete! All screenshots saved in scratch/screenshots_tier6_dojo/');
}

run().catch(err => {
  console.error('❌ E2E Failed:', err);
  process.exit(1);
});
