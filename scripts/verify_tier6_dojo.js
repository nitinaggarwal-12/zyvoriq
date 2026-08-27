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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  console.log('🌐 Navigating to /studio...');
  await page.goto('http://127.0.0.1:3000/studio', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);

  // 1. Anime Cinema Default View (Mode 1)
  console.log('📸 01: Mode 1 - 7-Act Cinema Broadcast Stage...');
  await page.screenshot({ path: path.join(screenshotsDir, '01_cinema_mode.png'), fullPage: false });

  // 2. Switch to Mode 2: Tier 6 Living Dojo
  console.log('🖱️ Switching to Tier 6 Living Dojo mode...');
  await page.waitForSelector('[data-testid="tier6-living-dojo-tab"]', { timeout: 10000 });
  await page.click('[data-testid="tier6-living-dojo-tab"]');
  await sleep(1500);
  console.log('📸 02: Mode 2 - Tier 6 Living Dojo Initial Stage...');
  await page.screenshot({ path: path.join(screenshotsDir, '02_tier6_living_dojo_initial.png'), fullPage: false });

  // 3. Click Preset Dilemma: "Comparing to Others (Oubaitori)"
  console.log('🖱️ Selecting Philosophical Dilemma: Comparing to Others...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const dilemmaBtn = btns.find(b => b.innerText.includes('Comparing to Others') || b.innerText.includes('Oubaitori'));
    if (dilemmaBtn) dilemmaBtn.click();
  });

  // Wait for Gemini reasoning + DeepMind TTS synthesis
  console.log('⏳ Waiting for Gemini reasoning + DeepMind neural speech synthesis...');
  await sleep(4000);

  console.log('📸 03: Tier 6 Living Dojo AI Sensei Ren Response & Wisdom Log...');
  await page.screenshot({ path: path.join(screenshotsDir, '03_tier6_sensei_ren_response.png'), fullPage: false });

  await browser.close();
  console.log('🎉 Tier-6 Living Dojo Verification complete! All screenshots saved in scratch/screenshots_tier6_dojo/');
}

run().catch(err => {
  console.error('❌ E2E Failed:', err);
  process.exit(1);
});
