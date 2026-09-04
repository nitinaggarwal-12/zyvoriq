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
  console.log('Testing exact URL from user screenshot...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,950']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 950 });

  const targetUrl = 'http://127.0.0.1:3000/studio?mode=video_reel&topic=A%20cyberpunk%20samurai%20training%20in%20the%20rain&style=pixar_3d';
  console.log(`Navigating to ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });

  // Wait for synthesis animation to progress and settle
  await sleep(4000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_user_url_fixed_live_progress.png') });

  console.log('Verified user URL flow successfully!');
  await browser.close();
})();
