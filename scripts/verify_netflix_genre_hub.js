const puppeteer = require('puppeteer');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const screenshotDir = '/tmp/screenshots_genre_hub';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1100']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1100 });

  console.log("Navigating to http://localhost:3005/studio...");
  await page.goto('http://localhost:3005/studio', { waitUntil: 'networkidle0' });
  await sleep(1500);

  // 1. Open Create Act Modal
  console.log("Opening Create Act Modal...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && (btn.textContent.includes('CREATE NEW ACT') || btn.textContent.includes('Create New Act')));
    if (b) b.click();
  });
  await sleep(1000);

  // Screenshot 1: Genre Discovery Hub Default View
  await page.screenshot({ path: `${screenshotDir}/01_netflix_genre_discovery_hub.png` });
  console.log("📸 Captured 01_netflix_genre_discovery_hub.png");

  // 2. Filter by Executive Genre
  console.log("Filtering by Silicon Valley Keynotes genre...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Silicon Valley Keynotes'));
    if (b) b.click();
  });
  await sleep(600);
  await page.screenshot({ path: `${screenshotDir}/02_executive_genre_filtered.png` });
  console.log("📸 Captured 02_executive_genre_filtered.png");

  // 3. Click Use Concept on Sovereign AI Enterprise Keynote
  console.log("Selecting Sovereign AI Enterprise Keynote concept...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && (btn.textContent.includes('Use Concept') || btn.textContent.includes('Active Concept')));
    if (b) b.click();
  });
  await sleep(600);
  await page.screenshot({ path: `${screenshotDir}/03_concept_loaded_and_pitched.png` });
  console.log("📸 Captured 03_concept_loaded_and_pitched.png");

  await browser.close();
  console.log("Netflix Genre Hub verification completed successfully!");
})();
