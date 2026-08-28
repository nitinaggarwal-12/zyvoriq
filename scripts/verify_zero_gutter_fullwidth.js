const puppeteer = require('puppeteer');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const screenshotDir = '/tmp/screenshots_zero_gutter';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050 });

  // 1. Visit /studio/create
  console.log("Navigating to http://localhost:3005/studio/create...");
  await page.goto('http://localhost:3005/studio/create', { waitUntil: 'networkidle0' });
  await sleep(1500);

  await page.screenshot({ path: `${screenshotDir}/01_creator_fullwidth_input.png` });
  console.log("📸 Captured 01_creator_fullwidth_input.png");

  // 2. Click Kickoff Veo 3.1 & DeepMind Dub Pipeline
  console.log("Clicking Kickoff Veo 3.1 & DeepMind Dub Pipeline...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Kickoff Veo 3.1'));
    if (b) b.click();
  });

  // Wait for 3.5s for synthesis pipeline to complete
  await sleep(3500);

  await page.screenshot({ path: `${screenshotDir}/02_creator_fullwidth_success_master.png` });
  console.log("📸 Captured 02_creator_fullwidth_success_master.png");

  await browser.close();
  console.log("Zero-gutter full-width verification complete!");
})();
