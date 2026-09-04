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
  console.log('Launching browser to verify Progress Bar & Timer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('1. Checking Animation Studio Progress Bar...');
  await page.goto('http://127.0.0.1:3000/studio/create/animation?q=A%20cyberpunk%20samurai%20training%20in%20the%20rain', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await sleep(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_animation_studio_progress_bar.png') });

  console.log('2. Checking Reel Studio Progress Bar & Timer...');
  await page.goto('http://127.0.0.1:3000/studio/create/reel?q=3%20psychological%20tricks%20that%20secretly%20influence%20decisions', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await sleep(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_reel_studio_progress_and_timer.png') });

  console.log('3. Checking Onboarding Hero 30s Reel Player...');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await sleep(2500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_onboarding_hero_reel_timer.png') });

  console.log('Verification completed successfully!');
  await browser.close();
})();
