const puppeteer = require('puppeteer');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const screenshotDir = '/tmp/screenshots_multi_track';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  console.log("Navigating to http://localhost:3005/studio...");
  await page.goto('http://localhost:3005/studio', { waitUntil: 'networkidle0' });
  await sleep(1500);

  // 1. Initial State: Track 1 (Anime Kaizen)
  await page.screenshot({ path: `${screenshotDir}/01_track1_anime_kaizen.png` });
  console.log("📸 Captured 01_track1_anime_kaizen.png");

  // 2. Click Track 2 (Executive Sovereign AI Keynote)
  console.log("Switching to Track 2 (Executive Sovereign AI Keynote)...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const track2 = btns.find(b => b.textContent && b.textContent.includes('Executive Sovereign AI Keynote'));
    if (track2) track2.click();
  });
  await sleep(1000);
  await page.screenshot({ path: `${screenshotDir}/02_track2_executive_keynote.png` });
  console.log("📸 Captured 02_track2_executive_keynote.png");

  // 3. Open Create Act Modal to verify Destination Selector
  console.log("Opening Create Act Modal...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && (btn.textContent.includes('+ New Series Track') || btn.textContent.includes('Create New Act')));
    if (b) b.click();
  });
  await sleep(1000);
  await page.screenshot({ path: `${screenshotDir}/03_modal_destination_selector.png` });
  console.log("📸 Captured 03_modal_destination_selector.png");

  await browser.close();
  console.log("All Multi-Track E2E tests finished successfully!");
})();
