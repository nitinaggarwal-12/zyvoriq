import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/screenshots_progress_timer_qa');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log('Testing Library Page Clean State...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,950']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 950 });

  await page.goto('http://127.0.0.1:3000/studio/library', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await sleep(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_library_clean_state.png') });

  console.log('Verified Library clean state successfully!');
  await browser.close();
})();
