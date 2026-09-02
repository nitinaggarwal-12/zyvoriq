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

  // Dismiss cookie banner first
  await page.evaluate(() => {
    const acceptBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Accept All'));
    if (acceptBtn) acceptBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Open concierge
  console.log('Opening Concierge...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Toggle live AI support concierge"]') ||
                document.querySelector('aside button');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Click on the Rate Support button in the header
  console.log('Opening 1-5 Star Rating Drawer...');
  await page.evaluate(() => {
    const rateBtn = document.querySelector('button[aria-label="Rate chat support"]');
    if (rateBtn) rateBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Set 5 stars and add feedback text
  console.log('Selecting 5 stars...');
  await page.evaluate(() => {
    const stars = document.querySelectorAll('button[type="button"]');
    // find the 5th star button inside the feedback modal
    const starBtns = Array.from(document.querySelectorAll('div.flex.items-center.justify-center.gap-2 button'));
    if (starBtns.length >= 5) {
      starBtns[4].click();
    }
    const noteArea = document.querySelector('textarea[placeholder*="Optional feedback"]');
    if (noteArea) {
      noteArea.value = 'Incredible 24/7 AI concierge! Guided me through EPUB 3 export, Trend Radar predictions, and viral hooks instantly.';
      noteArea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const screenshotPath = path.join(SCREENSHOT_DIR, '18_live_concierge_csat_rating.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Saved screenshot: ${screenshotPath}`);

  // Submit feedback
  console.log('Submitting rating...');
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Submit 5/5 Rating') || b.textContent?.includes('Submit'));
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
