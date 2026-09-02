import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.join(process.cwd(), 'scratch', 'screenshots_live_macos');

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  console.log('Navigating to Studio...');
  await page.goto('http://localhost:3001/studio', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));

  // Click on the Concierge trigger button to open it
  console.log('Opening Concierge...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Toggle Live AI Support Concierge"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Click on the Rate / Feedback button in the header or quick action
  console.log('Opening Feedback / Rating Modal...');
  await page.evaluate(() => {
    const rateBtn = document.querySelector('button[title="Rate Chat Support (1-5 ⭐)"]') || 
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Rate Support'));
    if (rateBtn) {
      rateBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // Hover or click 5-star rating button
  console.log('Selecting 5 stars...');
  await page.evaluate(() => {
    const star5 = document.querySelector('button[aria-label="Rate 5 stars"]');
    if (star5) star5.click();
    const noteInput = document.querySelector('input[placeholder*="What did you love or how can we improve?"]');
    if (noteInput) {
      noteInput.value = 'Exceptional support! Instantly guided me through EPUB 3 export.';
      noteInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const screenshotPath = path.join(SCREENSHOT_DIR, '18_live_concierge_csat_rating.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Saved screenshot: ${screenshotPath}`);

  // Also submit the rating
  console.log('Submitting rating...');
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Submit Feedback'));
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const screenshotSubmittedPath = path.join(SCREENSHOT_DIR, '19_live_concierge_rating_submitted.png');
  await page.screenshot({ path: screenshotSubmittedPath, fullPage: false });
  console.log(`Saved screenshot: ${screenshotSubmittedPath}`);

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
