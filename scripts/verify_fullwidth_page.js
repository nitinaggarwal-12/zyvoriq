const puppeteer = require('puppeteer');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const screenshotDir = '/tmp/screenshots_fullwidth_page';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050 });

  // 1. Visit the dedicated /studio/create full-width page
  console.log("Navigating to http://localhost:3005/studio/create...");
  await page.goto('http://localhost:3005/studio/create', { waitUntil: 'networkidle0' });
  await sleep(1500);

  await page.screenshot({ path: `${screenshotDir}/01_fullwidth_creator_page.png` });
  console.log("📸 Captured 01_fullwidth_creator_page.png");

  // 2. Filter by Universe & Space
  console.log("Filtering by Universe, Cosmos & Space...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Universe, Cosmos & Space'));
    if (b) b.click();
  });
  await sleep(800);
  await page.screenshot({ path: `${screenshotDir}/02_space_category_selected.png` });
  console.log("📸 Captured 02_space_category_selected.png");

  // 3. Click Use Concept on Black Hole
  console.log("Selecting Event Horizon concept...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && (btn.textContent.includes('Use Concept') || btn.textContent.includes('Active Concept')));
    if (b) b.click();
  });
  await sleep(800);
  await page.screenshot({ path: `${screenshotDir}/03_concept_loaded_into_pipeline.png` });
  console.log("📸 Captured 03_concept_loaded_into_pipeline.png");

  await browser.close();
  console.log("Full-width creator page E2E verification complete!");
})();
