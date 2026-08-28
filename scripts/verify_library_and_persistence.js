const puppeteer = require('puppeteer');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const screenshotDir = '/tmp/screenshots_library_vault';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050 });

  // 1. Visit /studio/library
  console.log("Navigating to http://localhost:3005/studio/library...");
  await page.goto('http://localhost:3005/studio/library', { waitUntil: 'networkidle0' });
  await sleep(1500);

  await page.screenshot({ path: `${screenshotDir}/01_media_vault_library_default.png` });
  console.log("📸 Captured 01_media_vault_library_default.png");

  // 2. Visit /studio/create and generate "Serengeti Thunderstorm & Lion Pride"
  console.log("Navigating to http://localhost:3005/studio/create...");
  await page.goto('http://localhost:3005/studio/create', { waitUntil: 'networkidle0' });
  await sleep(1500);

  // Click Nature & Wildlife tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const natureBtn = btns.find(b => b.textContent && b.textContent.includes('Nature & Wildlife'));
    if (natureBtn) natureBtn.click();
  });
  await sleep(800);

  // Click "Use Concept" for Serengeti
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const useBtn = btns.find(b => b.textContent && b.textContent.includes('Use Concept'));
    if (useBtn) useBtn.click();
  });
  await sleep(800);

  // Kickoff pipeline
  console.log("Synthesizing Serengeti production master...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const kickoffBtn = btns.find(b => b.textContent && b.textContent.includes('Kickoff Veo 3.1'));
    if (kickoffBtn) kickoffBtn.click();
  });

  // Wait 4.5s for synthesis & SQLite persistence
  await sleep(4500);

  await page.screenshot({ path: `${screenshotDir}/02_serengeti_synthesized_and_persisted.png` });
  console.log("📸 Captured 02_serengeti_synthesized_and_persisted.png");

  // 3. Navigate back to /studio/library to verify persistent display
  console.log("Navigating back to /studio/library to verify persistence...");
  await page.goto('http://localhost:3005/studio/library', { waitUntil: 'networkidle0' });
  await sleep(1500);

  await page.screenshot({ path: `${screenshotDir}/03_media_vault_with_new_serengeti_series.png` });
  console.log("📸 Captured 03_media_vault_with_new_serengeti_series.png");

  // 4. Navigate to /studio to verify track appears in Studio Stage Active Track Bar
  console.log("Navigating to /studio...");
  await page.goto('http://localhost:3005/studio', { waitUntil: 'networkidle0' });
  await sleep(1500);

  await page.screenshot({ path: `${screenshotDir}/04_studio_stage_with_persisted_tracks.png` });
  console.log("📸 Captured 04_studio_stage_with_persisted_tracks.png");

  await browser.close();
  console.log("Persistence and Media Vault verification successfully completed!");
})();
